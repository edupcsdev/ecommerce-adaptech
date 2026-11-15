import { env } from '../config/env';
import { Produto } from '../models/produto';
import { pedidoRepository } from '../repositories/pedidoRepositoryMemoria';

export function calcularExpiracao(base: Date = new Date()): Date {
  return new Date(base.getTime() + env.RESERVA_MINUTOS * 60 * 1000);
}

// Pedido pendente vira "expirado" quando o prazo vence.
// Prazo = expiraEm (definido no pagamento) ou, se ainda não há pagamento, criadoEm + 30 min.
// A verificação acontece a cada operação (não há tarefa em segundo plano).
export async function expirarPedidosVencidos(): Promise<void> {
  const agora = Date.now();
  const pendentes = await pedidoRepository.listarPorStatus('pendente');

  for (const pedido of pendentes) {
    const limite = (pedido.expiraEm ?? calcularExpiracao(pedido.criadoEm)).getTime();
    if (limite <= agora) {
      await pedidoRepository.atualizar(pedido.id, { status: 'expirado' });
    }
  }
}

// Unidades do produto reservadas por pedidos pendentes que já têm pagamento registrado
export async function quantidadeReservada(produtoId: string, ignorarPedidoId?: string): Promise<number> {
  await expirarPedidosVencidos();
  const pendentes = await pedidoRepository.listarPorStatus('pendente');

  let total = 0;
  for (const pedido of pendentes) {
    if (pedido.expiraEm === null || pedido.id === ignorarPedidoId) continue;
    for (const item of pedido.itens) {
      if (item.produtoId === produtoId) total += item.quantidade;
    }
  }
  return total;
}

export async function estoqueDisponivel(produto: Produto, ignorarPedidoId?: string): Promise<number> {
  const reservado = await quantidadeReservada(produto.id, ignorarPedidoId);
  return Math.max(0, produto.estoque - reservado);
}