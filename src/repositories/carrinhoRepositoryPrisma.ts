import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CarrinhoRepository } from './carrinhoRepository';

const incluir = { items: { orderBy: { createdAt: 'asc' as const } } };

// Cria o carrinho do usuário se não existir. Se duas requisições chegarem juntas
// (o front costuma pedir o carrinho duas vezes ao abrir), a segunda só relê.
async function garantirCarrinho(usuarioId: string) {
  try {
    return await prisma.cart.upsert({
      where: { userId: usuarioId },
      update: {},
      create: { userId: usuarioId },
      include: incluir,
    });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
      return prisma.cart.findUniqueOrThrow({ where: { userId: usuarioId }, include: incluir });
    }
    throw erro;
  }
}

export const carrinhoRepository: CarrinhoRepository = {
  async obter(usuarioId) {
    const carrinho = await garantirCarrinho(usuarioId);
    return {
      usuarioId,
      itens: carrinho.items.map((i) => ({ id: i.id, produtoId: i.productId, quantidade: i.quantity })),
    };
  },

  async salvarItem(usuarioId, produtoId, quantidade) {
    const carrinho = await garantirCarrinho(usuarioId);
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: carrinho.id, productId: produtoId } },
      update: { quantity: quantidade },
      create: { cartId: carrinho.id, productId: produtoId, quantity: quantidade },
    });
  },

  async atualizarQuantidade(usuarioId, itemId, quantidade) {
    // o filtro por userId garante que o item é do próprio usuário
    const resultado = await prisma.cartItem.updateMany({
      where: { id: itemId, cart: { userId: usuarioId } },
      data: { quantity: quantidade },
    });
    return resultado.count > 0;
  },

  async removerItem(usuarioId, itemId) {
    const resultado = await prisma.cartItem.deleteMany({
      where: { id: itemId, cart: { userId: usuarioId } },
    });
    return resultado.count > 0;
  },

  async esvaziar(usuarioId) {
    await prisma.cartItem.deleteMany({ where: { cart: { userId: usuarioId } } });
  },
};