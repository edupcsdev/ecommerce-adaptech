import { Prisma, Product } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { prisma } from '../lib/prisma';
import { NovoProduto, Produto } from '../models/produto';
import { ProdutoRepository } from './produtoRepository';

function paraDominio(p: Product): Produto {
  return {
    id: p.id,
    nome: p.name,
    descricao: p.description ?? '',
    preco: p.price.toNumber(),
    estoque: p.stockQuantity,
    categoriaId: p.categoryId,
    especificacoes: (p.specs as Produto['especificacoes']) ?? null,
    altaDemanda: p.isHighDemand,
  };
}

function paraBanco(dados: NovoProduto) {
  return {
    name: dados.nome,
    description: dados.descricao,
    price: dados.preco,
    stockQuantity: dados.estoque,
    categoryId: dados.categoriaId,
    specs: dados.especificacoes === null ? Prisma.DbNull : (dados.especificacoes as Prisma.InputJsonValue),
    isHighDemand: dados.altaDemanda,
  };
}

function naoEncontrado(erro: unknown): boolean {
  return erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2025';
}

export const produtoRepository: ProdutoRepository = {
  async listar() {
    const produtos = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
    return produtos.map(paraDominio);
  },

  async buscarPorId(id) {
    const produto = await prisma.product.findUnique({ where: { id } });
    return produto ? paraDominio(produto) : undefined;
  },

  async criar(dados) {
    return paraDominio(await prisma.product.create({ data: paraBanco(dados) }));
  },

  async atualizar(id, dados) {
    try {
      return paraDominio(await prisma.product.update({ where: { id }, data: paraBanco(dados) }));
    } catch (erro) {
      if (naoEncontrado(erro)) return undefined;
      throw erro;
    }
  },

  async remover(id) {
    try {
      await prisma.product.delete({ where: { id } });
      return true;
    } catch (erro) {
      if (naoEncontrado(erro)) return false;
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2003') {
        throw new AppError('Produto não pode ser removido porque já aparece em pedidos', 409);
      }
      throw erro;
    }
  },

  async contarPorCategoria(categoriaId) {
    return prisma.product.count({ where: { categoryId: categoriaId } });
  },

  async ajustarEstoque(id, variacao) {
    try {
      const produto = await prisma.product.update({
        where: { id },
        data: { stockQuantity: { increment: variacao } },
      });
      return paraDominio(produto);
    } catch (erro) {
      if (naoEncontrado(erro)) return undefined;
      throw erro;
    }
  },
};