import { Categoria, NovaCategoria } from '../models/categoria';

export interface CategoriaRepository {
  listar(): Promise<Categoria[]>;
  buscarPorId(id: number): Promise<Categoria | undefined>;
  buscarPorNome(nome: string): Promise<Categoria | undefined>;
  criar(dados: NovaCategoria): Promise<Categoria>;
  remover(id: number): Promise<boolean>;
}