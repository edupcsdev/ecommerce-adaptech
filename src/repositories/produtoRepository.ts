import { Produto, NovoProduto } from '../models/produto';

export interface ProdutoRepository {
  listar(): Promise<Produto[]>;
  buscarPorId(id: number): Promise<Produto | undefined>;
  criar(dados: NovoProduto): Promise<Produto>;
  atualizar(id: number, dados: NovoProduto): Promise<Produto | undefined>;
  remover(id: number): Promise<boolean>;
  contarPorCategoria(categoriaId: number): Promise<number>;
}