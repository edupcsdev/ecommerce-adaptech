import { Request, Response } from 'express';
import { listarProdutos, buscarProdutoPorId } from '../services/produtoService';

export function getProdutos(req: Request, res: Response) {
  const produtos = listarProdutos();
  res.json(produtos);
}

export function getProdutoPorId(req: Request, res: Response) {
  const id = Number(req.params.id);
  const produto = buscarProdutoPorId(id);

  if (!produto) {
    return res.status(404).json({ mensagem: "Produto não encontrado" });
  }

  res.json(produto);
}