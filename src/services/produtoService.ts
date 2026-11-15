import { AppError } from '../errors/AppError';
import { Especificacoes, NovoProduto, Produto } from '../models/produto';
import { categoriaRepository, produtoRepository } from '../repositories';

type Corpo = Record<string, unknown>;

const ORDENACOES = ['preco_asc', 'preco_desc', 'nome_asc', 'nome_desc'];

// ---------- utilitários ----------

// Ignora maiúsculas/minúsculas e acentos ("mecanico" encontra "Mecânico")
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Parâmetro de query opcional: ausente ou vazio vira undefined
function lerParametro(valor: unknown, nome: string): string | undefined {
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string') throw new AppError(`Parâmetro inválido: ${nome}`);
  const texto = valor.trim();
  return texto === '' ? undefined : texto;
}

function lerPreco(valor: unknown, nome: string): number | undefined {
  const texto = lerParametro(valor, nome);
  if (texto === undefined) return undefined;
  const numero = Number(texto);
  if (!Number.isFinite(numero) || numero < 0) {
    throw new AppError(`${nome} deve ser um número maior ou igual a zero`);
  }
  return numero;
}

function lerId(valor: string): string {
  return valor.trim();
}

function lerEspecificacoes(valor: unknown): Especificacoes | null {
  if (valor === undefined || valor === null) return null;
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'object' && !Array.isArray(valor)) return valor as Record<string, unknown>;
  throw new AppError('especificacoes deve ser um texto ou um objeto JSON');
}

async function validarProduto(corpo: Corpo): Promise<NovoProduto> {
  const { nome, descricao, preco, estoque, categoriaId, especificacoes, altaDemanda } = corpo;

  if (typeof nome !== 'string' || nome.trim().length < 2) {
    throw new AppError('Nome é obrigatório (mínimo 2 caracteres)');
  }
  if (descricao !== undefined && typeof descricao !== 'string') {
    throw new AppError('Descrição deve ser um texto');
  }
  if (typeof preco !== 'number' || !Number.isFinite(preco) || preco <= 0) {
    throw new AppError('Preço deve ser um número maior que zero');
  }
  if (typeof estoque !== 'number' || !Number.isInteger(estoque) || estoque < 0) {
    throw new AppError('Estoque deve ser um número inteiro maior ou igual a zero');
  }
  if (typeof categoriaId !== 'string' || categoriaId.trim() === '') {
    throw new AppError('categoriaId é obrigatório e deve ser um texto');
  }
  if (!(await categoriaRepository.buscarPorId(categoriaId.trim()))) {
    throw new AppError('Categoria inexistente');
  }
  if (altaDemanda !== undefined && typeof altaDemanda !== 'boolean') {
    throw new AppError('altaDemanda deve ser verdadeiro ou falso');
  }

  return {
    nome: nome.trim(),
    descricao: typeof descricao === 'string' ? descricao : '',
    preco,
    estoque,
    categoriaId: categoriaId.trim(),
    especificacoes: lerEspecificacoes(especificacoes),
    altaDemanda: altaDemanda === true,
  };
}

// ---------- RF04: listagem com filtros ----------

export async function listarProdutos(consulta: Corpo): Promise<Produto[]> {
  const busca = lerParametro(consulta.busca, 'busca');
  const categoriaId = lerParametro(consulta.categoria, 'categoria');
  const precoMin = lerPreco(consulta.precoMin, 'precoMin');
  const precoMax = lerPreco(consulta.precoMax, 'precoMax');
  const ordenar = lerParametro(consulta.ordenar, 'ordenar');

  if (ordenar !== undefined && !ORDENACOES.includes(ordenar)) {
    throw new AppError(`ordenar deve ser um destes valores: ${ORDENACOES.join(', ')}`);
  }
  if (precoMin !== undefined && precoMax !== undefined && precoMin > precoMax) {
    throw new AppError('precoMin não pode ser maior que precoMax');
  }

  // "Ativo" = com estoque maior que zero
  let lista = (await produtoRepository.listar()).filter((p) => p.estoque > 0);

  if (busca !== undefined) {
    const termo = normalizar(busca);
    lista = lista.filter((p) => normalizar(p.nome).includes(termo));
  }
  if (categoriaId !== undefined) {
    lista = lista.filter((p) => p.categoriaId === categoriaId);
  }
  if (precoMin !== undefined) {
    lista = lista.filter((p) => p.preco >= precoMin);
  }
  if (precoMax !== undefined) {
    lista = lista.filter((p) => p.preco <= precoMax);
  }

  switch (ordenar) {
    case 'preco_asc':
      lista.sort((a, b) => a.preco - b.preco);
      break;
    case 'preco_desc':
      lista.sort((a, b) => b.preco - a.preco);
      break;
    case 'nome_asc':
      lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      break;
    case 'nome_desc':
      lista.sort((a, b) => b.nome.localeCompare(a.nome, 'pt-BR'));
      break;
  }

  return lista;
}

// ---------- RF03: CRUD ----------

export async function buscarProdutoPorId(idTexto: string): Promise<Produto> {
  const produto = await produtoRepository.buscarPorId(lerId(idTexto));
  if (!produto) throw new AppError('Produto não encontrado', 404);
  return produto;
}

export async function criarProduto(corpo: Corpo): Promise<Produto> {
  return produtoRepository.criar(await validarProduto(corpo));
}

export async function atualizarProduto(idTexto: string, corpo: Corpo): Promise<Produto> {
  const id = lerId(idTexto);
  if (!(await produtoRepository.buscarPorId(id))) {
    throw new AppError('Produto não encontrado', 404);
  }
  const dados = await validarProduto(corpo);
  const atualizado = await produtoRepository.atualizar(id, dados);
  if (!atualizado) throw new AppError('Produto não encontrado', 404);
  return atualizado;
}

export async function removerProduto(idTexto: string): Promise<void> {
  const removido = await produtoRepository.remover(lerId(idTexto));
  if (!removido) throw new AppError('Produto não encontrado', 404);
}