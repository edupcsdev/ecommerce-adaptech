export type Especificacoes = string | Record<string, unknown>;

export type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoriaId: string;
  especificacoes: Especificacoes | null;
  altaDemanda: boolean;
};

export type NovoProduto = Omit<Produto, 'id'>;