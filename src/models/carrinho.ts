export type ItemCarrinho = {
  id: string;
  produtoId: string;
  quantidade: number;
};

export type Carrinho = {
  usuarioId: string;
  itens: ItemCarrinho[];
};