import { AppError } from '../errors/AppError';
import { FormaPagamento, ItemPedido, Pedido } from '../models/pedido';
import { carrinhoRepository, pedidoRepository, produtoRepository, usuarioRepository } from '../repositories';
import { calcularIdade } from '../utils/data';
import { arredondar, calcularTotais } from '../utils/dinheiro';
import { buscarCupomValido, calcularDescontoCupom, lerCodigoCupom } from './cupomService';
import { calcularExpiracao, estoqueDisponivel, expirarPedidosVencidos } from './reservaService';

const IDADE_MINIMA = 18;
const LIMITE_ALTA_DEMANDA = 2;
const JANELA_DIAS = 30;
const DESCONTO_PIX = 0.15;

type Corpo = Record<string, unknown>;

export type ItemPedidoResposta = {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

export type PedidoResposta = {
  id: string;
  status: string;
  formaPagamento: FormaPagamento | null;
  cupom: string | null;
  itens: ItemPedidoResposta[];
  subtotal: number;
  descontoCupom: number;
  desconto: number;
  total: number;
  criadoEm: Date;
  expiraEm: Date | null;
  confirmadoEm: Date | null;
};

function somar(itens: ItemPedido[]): number {
  return arredondar(itens.reduce((soma, i) => soma + i.precoUnitario * i.quantidade, 0));
}

// Unidades do produto em pedidos pendentes ou pagos criados na janela de 30 dias
function unidadesRecentes(pedidos: Pedido[], produtoId: string, desde: number): number {
  let total = 0;
  for (const pedido of pedidos) {
    const conta =
      (pedido.status === 'pendente' || pedido.status === 'pago') && pedido.criadoEm.getTime() >= desde;
    if (!conta) continue;
    for (const item of pedido.itens) {
      if (item.produtoId === produtoId) total += item.quantidade;
    }
  }
  return total;
}

async function montarResposta(pedido: Pedido): Promise<PedidoResposta> {
  const itens: ItemPedidoResposta[] = [];
  for (const item of pedido.itens) {
    const produto = await produtoRepository.buscarPorId(item.produtoId);
    itens.push({
      produtoId: item.produtoId,
      nome: produto ? produto.nome : 'Produto removido',
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      subtotal: arredondar(item.precoUnitario * item.quantidade),
    });
  }
  return {
    id: pedido.id,
    status: pedido.status,
    formaPagamento: pedido.formaPagamento,
    cupom: pedido.cupomCodigo,
    itens,
    subtotal: somar(pedido.itens),
    descontoCupom: pedido.descontoCupom,
    desconto: pedido.desconto,
    total: pedido.total,
    criadoEm: pedido.criadoEm,
    expiraEm: pedido.expiraEm,
    confirmadoEm: pedido.confirmadoEm,
  };
}

async function carregarPedido(usuarioId: string, id: string): Promise<Pedido> {
  await expirarPedidosVencidos();
  const pedido = await pedidoRepository.buscarPorId(id.trim());
  if (!pedido || pedido.usuarioId !== usuarioId) {
    throw new AppError('Pedido não encontrado', 404);
  }
  return pedido;
}

// ---------- RF06: criação de pedido ----------

export async function criarPedido(usuarioId: string): Promise<PedidoResposta> {
  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario) {
    throw new AppError('Usuário não encontrado. Faça login novamente.', 401);
  }
  if (calcularIdade(usuario.dataNascimento) < IDADE_MINIMA) {
    throw new AppError('É necessário ter 18 anos ou mais para finalizar a compra', 403);
  }

  const carrinho = await carrinhoRepository.obter(usuarioId);
  if (carrinho.itens.length === 0) {
    throw new AppError('O carrinho está vazio');
  }

  await expirarPedidosVencidos();
  const anteriores = await pedidoRepository.listarPorUsuario(usuarioId);
  const desde = Date.now() - JANELA_DIAS * 24 * 60 * 60 * 1000;

  const itens: ItemPedido[] = [];
  for (const itemCarrinho of carrinho.itens) {
    const produto = await produtoRepository.buscarPorId(itemCarrinho.produtoId);
    if (!produto) {
      throw new AppError('Um dos produtos do carrinho não está mais disponível', 409);
    }

    // estoque validado de novo, considerando reservas de outros pedidos
    const disponivel = await estoqueDisponivel(produto);
    if (itemCarrinho.quantidade > disponivel) {
      throw new AppError(`Estoque insuficiente para "${produto.nome}": disponível ${disponivel}`, 409);
    }

    if (produto.altaDemanda) {
      const jaComprado = unidadesRecentes(anteriores, produto.id, desde);
      if (jaComprado + itemCarrinho.quantidade > LIMITE_ALTA_DEMANDA) {
        throw new AppError(
          `Limite de ${LIMITE_ALTA_DEMANDA} unidades de "${produto.nome}" a cada ${JANELA_DIAS} dias (você já tem ${jaComprado})`,
          409,
        );
      }
    }

    itens.push({
      produtoId: produto.id,
      quantidade: itemCarrinho.quantidade,
      precoUnitario: produto.preco,
    });
  }

  const pedido = await pedidoRepository.criar({
    usuarioId,
    status: 'pendente',
    formaPagamento: null,
    cupomCodigo: null,
    descontoCupom: 0,
    total: somar(itens),
    desconto: 0,
    itens,
  });
  await carrinhoRepository.esvaziar(usuarioId);

  return montarResposta(pedido);
}

export async function listarPedidos(usuarioId: string): Promise<PedidoResposta[]> {
  await expirarPedidosVencidos();
  const pedidos = await pedidoRepository.listarPorUsuario(usuarioId);
  pedidos.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());

  const respostas: PedidoResposta[] = [];
  for (const pedido of pedidos) {
    respostas.push(await montarResposta(pedido));
  }
  return respostas;
}

export async function buscarPedido(usuarioId: string, id: string): Promise<PedidoResposta> {
  return montarResposta(await carregarPedido(usuarioId, id));
}

// ---------- RF07: pagamento (simulado) ----------

export async function registrarPagamento(
  usuarioId: string,
  id: string,
  corpo: Corpo,
): Promise<PedidoResposta> {
  const pedido = await carregarPedido(usuarioId, id);

  const formaTexto = typeof corpo.forma === 'string' ? corpo.forma.trim().toLowerCase() : '';
  const forma: FormaPagamento | null =
    formaTexto === 'pix' || formaTexto === 'boleto' ? formaTexto : null;
  if (!forma) {
    throw new AppError('forma deve ser "pix" ou "boleto"');
  }

  if (pedido.status !== 'pendente') {
    throw new AppError(`Pedido ${pedido.status} não aceita novo pagamento`, 409);
  }

  // Confere o estoque de novo (ignorando a reserva deste próprio pedido)
  for (const item of pedido.itens) {
    const produto = await produtoRepository.buscarPorId(item.produtoId);
    if (!produto) {
      throw new AppError('Um dos produtos do pedido não está mais disponível', 409);
    }
    const disponivel = await estoqueDisponivel(produto, pedido.id);
    if (item.quantidade > disponivel) {
      throw new AppError(`Estoque insuficiente para "${produto.nome}": disponível ${disponivel}`, 409);
    }
  }

  const subtotal = somar(pedido.itens);
  const descontoPix = forma === 'pix' ? arredondar(subtotal * DESCONTO_PIX) : 0;
  const { desconto, total } = calcularTotais(subtotal, descontoPix, pedido.descontoCupom);

  const atualizado = await pedidoRepository.atualizar(pedido.id, {
    formaPagamento: forma,
    desconto,
    total,
    // a reserva começa no primeiro pagamento; trocar a forma não renova o prazo
    expiraEm: pedido.expiraEm ?? calcularExpiracao(),
  });
  if (!atualizado) {
    throw new AppError('Pedido não encontrado', 404);
  }
  return montarResposta(atualizado);
}

export async function confirmarPagamento(usuarioId: string, id: string): Promise<PedidoResposta> {
  const pedido = await carregarPedido(usuarioId, id);

  if (pedido.status === 'expirado') {
    throw new AppError('Pedido expirado: o prazo para pagamento acabou', 409);
  }
  if (pedido.status !== 'pendente') {
    throw new AppError(`Pedido já está ${pedido.status}`, 409);
  }
  if (!pedido.formaPagamento) {
    throw new AppError('Escolha a forma de pagamento antes de confirmar', 409);
  }

  // Baixa definitiva do estoque (a reserva deixa de contar quando o status vira "pago")
  for (const item of pedido.itens) {
    await produtoRepository.ajustarEstoque(item.produtoId, -item.quantidade);
  }

  const atualizado = await pedidoRepository.atualizar(pedido.id, {
    status: 'pago',
    confirmadoEm: new Date(),
  });
  if (!atualizado) {
    throw new AppError('Pedido não encontrado', 404);
  }
  return montarResposta(atualizado);
}

// ---------- RF08: cupom promocional ----------

export async function aplicarCupom(usuarioId: string, id: string, corpo: Corpo): Promise<PedidoResposta> {
  const codigo = lerCodigoCupom(corpo.codigo);
  const pedido = await carregarPedido(usuarioId, id);

  if (pedido.status !== 'pendente') {
    throw new AppError(`Pedido ${pedido.status} não aceita cupom`, 409);
  }
  if (pedido.cupomCodigo) {
    throw new AppError('O pedido já tem um cupom aplicado', 409);
  }

  const cupom = await buscarCupomValido(codigo);

  // Cupom e PIX acumulam: os dois incidem sobre o subtotal e a soma não passa do subtotal
  const subtotal = somar(pedido.itens);
  const descontoCupom = calcularDescontoCupom(cupom, subtotal);
  const descontoPix = pedido.formaPagamento === 'pix' ? arredondar(subtotal * DESCONTO_PIX) : 0;
  const { desconto, total } = calcularTotais(subtotal, descontoPix, descontoCupom);

  const atualizado = await pedidoRepository.atualizar(pedido.id, {
    cupomCodigo: cupom.codigo,
    descontoCupom,
    desconto,
    total,
  });
  if (!atualizado) {
    throw new AppError('Pedido não encontrado', 404);
  }
  return montarResposta(atualizado);
}