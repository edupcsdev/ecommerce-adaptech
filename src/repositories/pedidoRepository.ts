import { AtualizacaoPedido, NovoPedido, Pedido, StatusPedido } from '../models/pedido';

export interface PedidoRepository {
  criar(dados: NovoPedido): Promise<Pedido>;
  buscarPorId(id: string): Promise<Pedido | undefined>;
  listarPorUsuario(usuarioId: string): Promise<Pedido[]>;
  listarPorStatus(status: StatusPedido): Promise<Pedido[]>;
  atualizar(id: string, dados: AtualizacaoPedido): Promise<Pedido | undefined>;
  // Quantos pedidos pendentes ou pagos já usam o cupom (para o limite de usos)
  contarUsosCupom(codigo: string): Promise<number>;
}