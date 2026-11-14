export type Categoria = {
  id: number;
  nome: string;
};

export type NovaCategoria = Omit<Categoria, 'id'>;