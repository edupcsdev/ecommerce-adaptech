import { Categoria, NovaCategoria } from '../models/categoria';

export interface CategoriaRepository {
  listar(): Promise<Categoria[]>;
  buscarPorId(id: string): Promise<Categoria | undefined>;
  buscarPorNome(nome: string): Promise<Categoria | undefined>;
  criar(dados: NovaCategoria): Promise<Categoria>;
  remover(id: string): Promise<boolean>;
}