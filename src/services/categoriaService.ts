import { AppError } from '../errors/AppError';
import { Categoria } from '../models/categoria';
import { categoriaRepository } from '../repositories/categoriaRepositoryMemoria';
import { produtoRepository } from '../repositories/produtoRepositoryMemoria';

type Corpo = Record<string, unknown>;

export async function listarCategorias(): Promise<Categoria[]> {
  return categoriaRepository.listar();
}

export async function criarCategoria(corpo: Corpo): Promise<Categoria> {
  const { nome } = corpo;

  if (typeof nome !== 'string' || nome.trim().length < 2) {
    throw new AppError('Nome é obrigatório (mínimo 2 caracteres)');
  }
  if (await categoriaRepository.buscarPorNome(nome.trim())) {
    throw new AppError('Categoria já cadastrada', 409);
  }

  return categoriaRepository.criar({ nome: nome.trim() });
}

export async function removerCategoria(id: string): Promise<void> {
  if (!(await categoriaRepository.buscarPorId(id))) {
    throw new AppError('Categoria não encontrada', 404);
  }
  if ((await produtoRepository.contarPorCategoria(id)) > 0) {
    throw new AppError('Não é possível remover uma categoria que ainda tem produtos', 409);
  }
  await categoriaRepository.remover(id);
}