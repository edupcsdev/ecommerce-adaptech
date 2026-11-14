export type Especificacoes = string | Record<string, unknown>;

export type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoriaId: number;
  especificacoes: Especificacoes | null;
  altaDemanda: boolean;
};

export type NovoProduto = Omit<Produto, 'id'>;