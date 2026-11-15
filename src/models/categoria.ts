export type Categoria = {
  id: string;
  nome: string;
};

export type NovaCategoria = Omit<Categoria, 'id'>;