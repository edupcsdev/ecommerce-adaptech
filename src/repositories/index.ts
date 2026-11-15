import { env } from '../config/env';
import { CarrinhoRepository } from './carrinhoRepository';
import { CategoriaRepository } from './categoriaRepository';
import { CupomRepository } from './cupomRepository';
import { PedidoRepository } from './pedidoRepository';
import { ProdutoRepository } from './produtoRepository';
import { UsuarioRepository } from './usuarioRepository';

// USAR_BANCO=true usa as implementações Prisma; senão, as em memória.
// O require é preguiçoso de propósito: no modo memória o Prisma nem é carregado.
const banco = env.USAR_BANCO;

export const usuarioRepository: UsuarioRepository = banco
  ? require('./usuarioRepositoryPrisma').usuarioRepository
  : require('./usuarioRepositoryMemoria').usuarioRepository;

export const categoriaRepository: CategoriaRepository = banco
  ? require('./categoriaRepositoryPrisma').categoriaRepository
  : require('./categoriaRepositoryMemoria').categoriaRepository;

export const produtoRepository: ProdutoRepository = banco
  ? require('./produtoRepositoryPrisma').produtoRepository
  : require('./produtoRepositoryMemoria').produtoRepository;

export const carrinhoRepository: CarrinhoRepository = banco
  ? require('./carrinhoRepositoryPrisma').carrinhoRepository
  : require('./carrinhoRepositoryMemoria').carrinhoRepository;

export const pedidoRepository: PedidoRepository = banco
  ? require('./pedidoRepositoryPrisma').pedidoRepository
  : require('./pedidoRepositoryMemoria').pedidoRepository;

export const cupomRepository: CupomRepository = banco
  ? require('./cupomRepositoryPrisma').cupomRepository
  : require('./cupomRepositoryMemoria').cupomRepository;