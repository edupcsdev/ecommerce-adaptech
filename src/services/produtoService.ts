import { Produto } from '../models/produto';

const produtos: Produto[] = [
  { id: 1, nome: "Mouse Gamer", preco: 150, estoque: 20 },
  { id: 2, nome: "Teclado Mecânico", preco: 300, estoque: 10 },
  { id: 3, nome: "Monitor", preco: 1200, estoque: 5 }
];

export function listarProdutos(): Produto[] {
  return produtos;
}

export function buscarProdutoPorId(id: number): Produto | undefined {
  return produtos.find((produto) => produto.id === id);
}