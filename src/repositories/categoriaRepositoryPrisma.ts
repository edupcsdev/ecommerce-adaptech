import { Category, Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { prisma } from '../lib/prisma';
import { Categoria } from '../models/categoria';
import { CategoriaRepository } from './categoriaRepository';

function paraDominio(c: Category): Categoria {
  return { id: c.id, nome: c.name };
}

function codigoDoErro(erro: unknown): string | undefined {
  return erro instanceof Prisma.PrismaClientKnownRequestError ? erro.code : undefined;
}

export const categoriaRepository: CategoriaRepository = {
  async listar() {
    const categorias = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return categorias.map(paraDominio);
  },

  async buscarPorId(id) {
    const categoria = await prisma.category.findUnique({ where: { id } });
    return categoria ? paraDominio(categoria) : undefined;
  },

  async buscarPorNome(nome) {
    const categoria = await prisma.category.findFirst({
      where: { name: { equals: nome, mode: 'insensitive' } },
    });
    return categoria ? paraDominio(categoria) : undefined;
  },

  async criar(dados) {
    try {
      return paraDominio(await prisma.category.create({ data: { name: dados.nome } }));
    } catch (erro) {
      if (codigoDoErro(erro) === 'P2002') {
        throw new AppError('Categoria já cadastrada', 409);
      }
      throw erro;
    }
  },

  async remover(id) {
    try {
      await prisma.category.delete({ where: { id } });
      return true;
    } catch (erro) {
      const codigo = codigoDoErro(erro);
      if (codigo === 'P2025') return false;
      if (codigo === 'P2003') {
        throw new AppError('Não é possível remover uma categoria que ainda tem produtos', 409);
      }
      throw erro;
    }
  },
};