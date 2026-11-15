import { Produto, NovoProduto } from '../models/produto';

export interface ProdutoRepository {
  listar(): Promise<Produto[]>;
  buscarPorId(id: string): Promise<Produto | undefined>;
  criar(dados: NovoProduto): Promise<Produto>;
  atualizar(id: string, dados: NovoProduto): Promise<Produto | undefined>;
  remover(id: string): Promise<boolean>;
  contarPorCategoria(categoriaId: string): Promise<number>;
  ajustarEstoque(id: string, variacao: number): Promise<Produto | undefined>;
}