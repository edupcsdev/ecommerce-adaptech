import { randomUUID } from 'crypto';
import { Categoria } from '../models/categoria';
import { CategoriaRepository } from './categoriaRepository';


const categorias: Categoria[] = [
  { id: 'placas-de-video', nome: 'Placas de Vídeo' },
  { id: 'processadores', nome: 'Processadores' },
  { id: 'monitores', nome: 'Monitores' },
  { id: 'teclados', nome: 'Teclados' },
  { id: 'mouses', nome: 'Mouses' },
  { id: 'headsets', nome: 'Headsets' },
  { id: 'memorias', nome: 'Memórias RAM' },
  { id: 'armazenamento', nome: 'Armazenamento' },
  { id: 'placas-mae', nome: 'Placas-mãe' },
  { id: 'fontes', nome: 'Fontes' },
  { id: 'gabinetes', nome: 'Gabinetes' },
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