export type StatusPedido = 'pendente' | 'pago' | 'expirado' | 'cancelado';
export type FormaPagamento = 'pix' | 'boleto';

export type ItemPedido = {
  produtoId: string;
  quantidade: number;
  precoUnitario: number; // preço no momento da compra
};

export type Pedido = {
  id: string;
  usuarioId: string;
  status: StatusPedido;
  formaPagamento: FormaPagamento | null;
  cupomCodigo: string | null;
  descontoCupom: number; // parte do desconto que vem do cupom
  desconto: number; // desconto total (PIX + cupom)
  total: number; // valor a pagar (já com descontos)
  itens: ItemPedido[];
  criadoEm: Date;
  expiraEm: Date | null; // preenchido quando o pagamento é registrado (reserva)
  confirmadoEm: Date | null;
};

export type NovoPedido = Omit<Pedido, 'id' | 'criadoEm' | 'expiraEm' | 'confirmadoEm'>;

export type AtualizacaoPedido = Partial<
  Pick<
    Pedido,
    'status' | 'formaPagamento' | 'cupomCodigo' | 'descontoCupom' | 'total' | 'desconto' | 'expiraEm' | 'confirmadoEm'
  >
>;