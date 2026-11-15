import { AtualizacaoPedido, NovoPedido, Pedido, StatusPedido } from '../models/pedido';

export interface PedidoRepository {
  criar(dados: NovoPedido): Promise<Pedido>;
  buscarPorId(id: string): Promise<Pedido | undefined>;
  listarPorUsuario(usuarioId: string): Promise<Pedido[]>;
  listarPorStatus(status: StatusPedido): Promise<Pedido[]>;
  atualizar(id: string, dados: AtualizacaoPedido): Promise<Pedido | undefined>;
}