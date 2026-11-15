import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { FormaPagamento, Pedido, StatusPedido } from '../models/pedido';
import { PedidoRepository } from './pedidoRepository';

const incluir = { items: true, coupon: true } satisfies Prisma.OrderInclude;
type PedidoBanco = Prisma.OrderGetPayload<{ include: typeof incluir }>;

// Banco: enums em maiúsculo. API: minúsculo ("pendente", "pix").
function paraDominio(p: PedidoBanco): Pedido {
  return {
    id: p.id,
    usuarioId: p.userId,
    status: p.status.toLowerCase() as StatusPedido,
    formaPagamento: p.paymentMethod ? (p.paymentMethod.toLowerCase() as FormaPagamento) : null,
    cupomCodigo: p.coupon ? p.coupon.code : null,
    descontoCupom: p.couponDiscount.toNumber(),
    desconto: p.discountAmount.toNumber(),
    total: p.totalAmount.toNumber(),
    itens: p.items.map((i) => ({
      produtoId: i.productId,
      quantidade: i.quantity,
      precoUnitario: i.unitPrice.toNumber(),
    })),
    criadoEm: p.createdAt,
    expiraEm: p.expiresAt,
    confirmadoEm: p.confirmedAt,
  };
}

export const pedidoRepository: PedidoRepository = {
  async criar(dados) {
    const pedido = await prisma.order.create({
      data: {
        user: { connect: { id: dados.usuarioId } },
        status: dados.status.toUpperCase() as OrderStatus,
        paymentMethod: dados.formaPagamento ? (dados.formaPagamento.toUpperCase() as PaymentMethod) : null,
        totalAmount: dados.total,
        discountAmount: dados.desconto,
        couponDiscount: dados.descontoCupom,
        ...(dados.cupomCodigo ? { coupon: { connect: { code: dados.cupomCodigo } } } : {}),
        items: {
          create: dados.itens.map((i) => ({
            productId: i.produtoId,
            quantity: i.quantidade,
            unitPrice: i.precoUnitario,
          })),
        },
      },
      include: incluir,
    });
    return paraDominio(pedido);
  },

  async buscarPorId(id) {
    const pedido = await prisma.order.findUnique({ where: { id }, include: incluir });
    return pedido ? paraDominio(pedido) : undefined;
  },

  async listarPorUsuario(usuarioId) {
    const pedidos = await prisma.order.findMany({
      where: { userId: usuarioId },
      include: incluir,
      orderBy: { createdAt: 'desc' },
    });
    return pedidos.map(paraDominio);
  },

  async listarPorStatus(status) {
    const pedidos = await prisma.order.findMany({
      where: { status: status.toUpperCase() as OrderStatus },
      include: incluir,
    });
    return pedidos.map(paraDominio);
  },

  async atualizar(id, dados) {
    const data: Prisma.OrderUpdateInput = {};
    if (dados.status !== undefined) data.status = dados.status.toUpperCase() as OrderStatus;
    if (dados.formaPagamento !== undefined) {
      data.paymentMethod = dados.formaPagamento ? (dados.formaPagamento.toUpperCase() as PaymentMethod) : null;
    }
    if (dados.cupomCodigo !== undefined) {
      data.coupon = dados.cupomCodigo ? { connect: { code: dados.cupomCodigo } } : { disconnect: true };
    }
    if (dados.descontoCupom !== undefined) data.couponDiscount = dados.descontoCupom;
    if (dados.desconto !== undefined) data.discountAmount = dados.desconto;
    if (dados.total !== undefined) data.totalAmount = dados.total;
    if (dados.expiraEm !== undefined) data.expiresAt = dados.expiraEm;
    if (dados.confirmadoEm !== undefined) data.confirmedAt = dados.confirmadoEm;

    try {
      const pedido = await prisma.order.update({ where: { id }, data, include: incluir });
      return paraDominio(pedido);
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2025') {
        return undefined;
      }
      throw erro;
    }
  },

  async contarUsosCupom(codigo) {
    return prisma.order.count({
      where: { coupon: { code: codigo }, status: { in: ['PENDENTE', 'PAGO'] } },
    });
  },
};