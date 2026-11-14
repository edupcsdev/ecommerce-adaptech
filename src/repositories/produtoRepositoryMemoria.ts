import { Produto } from '../models/produto';
import { ProdutoRepository } from './produtoRepository';

// Dados de exemplo (o seed do banco, BD03, vai substituir isso)
const produtos: Produto[] = [
  {
    id: 1, nome: 'Mouse Gamer', descricao: 'Mouse óptico com 6 botões', preco: 150, estoque: 20,
    categoriaId: 1, especificacoes: { dpi: 16000, conexao: 'USB' }, altaDemanda: false,
  },
  {
    id: 2, nome: 'Teclado Mecânico', descricao: 'Teclado mecânico ABNT2', preco: 300, estoque: 10,
    categoriaId: 1, especificacoes: 'Switch azul, layout ABNT2, retroiluminado', altaDemanda: false,
  },
  {
    id: 3, nome: 'Monitor', descricao: 'Monitor 24 polegadas Full HD', preco: 1200, estoque: 5,
    categoriaId: 2, especificacoes: { tela: '24"', resolucao: '1920x1080', taxa: '144Hz' }, altaDemanda: false,
  },
  {
    id: 4, nome: 'Placa de Vídeo', descricao: 'Placa de vídeo 8GB GDDR6', preco: 2300, estoque: 4,
    categoriaId: 3, especificacoes: { memoria: '8GB GDDR6' }, altaDemanda: true,
  },
];
let proximoId = 5;

export const produtoRepository: ProdutoRepository = {
  async listar() {
    return [...produtos];
  },

  async buscarPorId(id) {
    return produtos.find((p) => p.id === id);
  },

  async criar(dados) {
    const produto: Produto = { id: proximoId++, ...dados };
    produtos.push(produto);
    return produto;
  },

  async atualizar(id, dados) {
    const indice = produtos.findIndex((p) => p.id === id);
    if (indice === -1) return undefined;
    produtos[indice] = { id, ...dados };
    return produtos[indice];
  },

  async remover(id) {
    const indice = produtos.findIndex((p) => p.id === id);
    if (indice === -1) return false;
    produtos.splice(indice, 1);
    return true;
  },

  async contarPorCategoria(categoriaId) {
    return produtos.filter((p) => p.categoriaId === categoriaId).length;
  },
};