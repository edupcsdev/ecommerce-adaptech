import { Carrinho } from '../models/carrinho';

export interface CarrinhoRepository {
  obter(usuarioId: string): Promise<Carrinho>; // cria o carrinho se não existir
  salvarItem(usuarioId: string, produtoId: string, quantidade: number): Promise<void>; // define a quantidade (cria ou substitui)
  atualizarQuantidade(usuarioId: string, itemId: string, quantidade: number): Promise<boolean>;
  removerItem(usuarioId: string, itemId: string): Promise<boolean>;
  esvaziar(usuarioId: string): Promise<void>;
}