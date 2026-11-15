import { randomUUID } from 'crypto';
import { ItemCarrinho } from '../models/carrinho';
import { CarrinhoRepository } from './carrinhoRepository';

const carrinhos = new Map<string, ItemCarrinho[]>();

function itensDe(usuarioId: string): ItemCarrinho[] {
  let itens = carrinhos.get(usuarioId);
  if (!itens) {
    itens = [];
    carrinhos.set(usuarioId, itens);
  }
  return itens;
}

export const carrinhoRepository: CarrinhoRepository = {
  async obter(usuarioId) {
    return { usuarioId, itens: itensDe(usuarioId).map((i) => ({ ...i })) };
  },

  async salvarItem(usuarioId, produtoId, quantidade) {
    const itens = itensDe(usuarioId);
    const existente = itens.find((i) => i.produtoId === produtoId);
    if (existente) {
      existente.quantidade = quantidade;
    } else {
      itens.push({ id: randomUUID(), produtoId, quantidade });
    }
  },

  async atualizarQuantidade(usuarioId, itemId, quantidade) {
    const item = itensDe(usuarioId).find((i) => i.id === itemId);
    if (!item) return false;
    item.quantidade = quantidade;
    return true;
  },

  async removerItem(usuarioId, itemId) {
    const itens = itensDe(usuarioId);
    const indice = itens.findIndex((i) => i.id === itemId);
    if (indice === -1) return false;
    itens.splice(indice, 1);
    return true;
  },

  async esvaziar(usuarioId) {
    carrinhos.set(usuarioId, []);
  },
};