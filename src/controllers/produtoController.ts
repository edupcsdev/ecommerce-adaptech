import { Request, Response, NextFunction } from 'express';
import {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  removerProduto,
} from '../services/produtoService';

export async function getProdutos(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listarProdutos(req.query));
  } catch (erro) {
    next(erro);
  }
}

export async function getProdutoPorId(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await buscarProdutoPorId(String(req.params.id)));
  } catch (erro) {
    next(erro);
  }
}

export async function postProduto(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await criarProduto(req.body ?? {}));
  } catch (erro) {
    next(erro);
  }
}

export async function putProduto(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await atualizarProduto(String(req.params.id), req.body ?? {}));
  } catch (erro) {
    next(erro);
  }
}

export async function deleteProduto(req: Request, res: Response, next: NextFunction) {
  try {
    await removerProduto(String(req.params.id));
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}