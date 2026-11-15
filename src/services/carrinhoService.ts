import { AppError } from '../errors/AppError';
import { carrinhoRepository } from '../repositories/carrinhoRepositoryMemoria';
import { produtoRepository } from '../repositories/produtoRepositoryMemoria';
import { arredondar } from '../utils/dinheiro';
import { estoqueDisponivel } from './reservaService';

type Corpo = Record<string, unknown>;

export type ItemCarrinhoResposta = {
  id: string;
  produtoId: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
};

export type CarrinhoResposta = {
  itens: ItemCarrinhoResposta[];
  total: number;
};

function lerQuantidade(valor: unknown): number {
  if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
    throw new AppError('Quantidade deve ser um número inteiro maior que zero');
  }
  return valor;
}

export async function obterCarrinho(usuarioId: string): Promise<CarrinhoResposta> {
  const carrinho = await carrinhoRepository.obter(usuarioId);
  const itens: ItemCarrinhoResposta[] = [];

  for (const item of carrinho.itens) {
    const produto = await produtoRepository.buscarPorId(item.produtoId);
    if (!produto) {
      // produto removido do catálogo: sai do carrinho
      await carrinhoRepository.removerItem(usuarioId, item.id);
      continue;
    }
    itens.push({
      id: item.id,
      produtoId: produto.id,
      nome: produto.nome,
      precoUnitario: produto.preco,
      quantidade: item.quantidade,
      subtotal: arredondar(produto.preco * item.quantidade),
    });
  }

  const total = arredondar(itens.reduce((soma, i) => soma + i.subtotal, 0));
  return { itens, total };
}

export async function adicionarItem(usuarioId: string, corpo: Corpo): Promise<CarrinhoResposta> {
  const { produtoId } = corpo;
  if (typeof produtoId !== 'string' || produtoId.trim() === '') {
    throw new AppError('produtoId é obrigatório');
  }
  const quantidade = lerQuantidade(corpo.quantidade);

  const produto = await produtoRepository.buscarPorId(produtoId.trim());
  if (!produto) {
    throw new AppError('Produto não encontrado', 404);
  }

  const carrinho = await carrinhoRepository.obter(usuarioId);
  const noCarrinho = carrinho.itens.find((i) => i.produtoId === produto.id)?.quantidade ?? 0;
  const disponivel = await estoqueDisponivel(produto);

  if (noCarrinho + quantidade > disponivel) {
    throw new AppError(
      `Estoque insuficiente para "${produto.nome}": disponível ${disponivel}, já no carrinho ${noCarrinho}`,
      409,
    );
  }

  await carrinhoRepository.salvarItem(usuarioId, produto.id, noCarrinho + quantidade);
  return obterCarrinho(usuarioId);
}

export async function alterarQuantidade(
  usuarioId: string,
  itemId: string,
  corpo: Corpo,
): Promise<CarrinhoResposta> {
  const quantidade = lerQuantidade(corpo.quantidade);

  const carrinho = await carrinhoRepository.obter(usuarioId);
  const item = carrinho.itens.find((i) => i.id === itemId.trim());
  if (!item) {
    throw new AppError('Item não encontrado no carrinho', 404);
  }

  const produto = await produtoRepository.buscarPorId(item.produtoId);
  if (!produto) {
    await carrinhoRepository.removerItem(usuarioId, item.id);
    throw new AppError('Produto não encontrado', 404);
  }

  const disponivel = await estoqueDisponivel(produto);
  if (quantidade > disponivel) {
    throw new AppError(`Estoque insuficiente para "${produto.nome}": disponível ${disponivel}`, 409);
  }

  await carrinhoRepository.atualizarQuantidade(usuarioId, item.id, quantidade);
  return obterCarrinho(usuarioId);
}

export async function removerItem(usuarioId: string, itemId: string): Promise<CarrinhoResposta> {
  const removido = await carrinhoRepository.removerItem(usuarioId, itemId.trim());
  if (!removido) {
    throw new AppError('Item não encontrado no carrinho', 404);
  }
  return obterCarrinho(usuarioId);
}