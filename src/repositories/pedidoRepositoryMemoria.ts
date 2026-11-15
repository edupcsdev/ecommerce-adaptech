import { randomUUID } from 'crypto';
import { Pedido } from '../models/pedido';
import { PedidoRepository } from './pedidoRepository';

const pedidos: Pedido[] = [];

function copia(pedido: Pedido): Pedido {
  return { ...pedido, itens: pedido.itens.map((i) => ({ ...i })) };
}

export const pedidoRepository: PedidoRepository = {
  async criar(dados) {
    const pedido: Pedido = {
      id: randomUUID(),
      criadoEm: new Date(),
      expiraEm: null,
      confirmadoEm: null,
      ...dados,
      itens: dados.itens.map((i) => ({ ...i })),
    };
    pedidos.push(pedido);
    return copia(pedido);
  },

  async buscarPorId(id) {
    const pedido = pedidos.find((p) => p.id === id);
    return pedido ? copia(pedido) : undefined;
  },

  async listarPorUsuario(usuarioId) {
    return pedidos.filter((p) => p.usuarioId === usuarioId).map(copia);
  },

  async listarPorStatus(status) {
    return pedidos.filter((p) => p.status === status).map(copia);
  },

  async atualizar(id, dados) {
    const pedido = pedidos.find((p) => p.id === id);
    if (!pedido) return undefined;
    Object.assign(pedido, dados);
    return copia(pedido);
  },
};