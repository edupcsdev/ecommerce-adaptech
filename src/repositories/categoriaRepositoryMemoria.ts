import { randomUUID } from 'crypto';
import { Categoria } from '../models/categoria';
import { CategoriaRepository } from './categoriaRepository';

// Os 3 primeiros são dados de exemplo; os novos recebem UUID
const categorias: Categoria[] = [
  { id: '1', nome: 'Periféricos' },
  { id: '2', nome: 'Monitores' },
  { id: '3', nome: 'Componentes' },
];

export const categoriaRepository: CategoriaRepository = {
  async listar() {
    return [...categorias];
  },

  async buscarPorId(id) {
    return categorias.find((c) => c.id === id);
  },

  async buscarPorNome(nome) {
    return categorias.find((c) => c.nome.toLowerCase() === nome.toLowerCase());
  },

  async criar(dados) {
    const categoria: Categoria = { id: randomUUID(), ...dados };
    categorias.push(categoria);
    return categoria;
  },

  async remover(id) {
    const indice = categorias.findIndex((c) => c.id === id);
    if (indice === -1) return false;
    categorias.splice(indice, 1);
    return true;
  },
};