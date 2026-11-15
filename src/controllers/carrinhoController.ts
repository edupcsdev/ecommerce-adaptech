import { Request, Response, NextFunction } from 'express';
import { obterCarrinho, adicionarItem, alterarQuantidade, removerItem } from '../services/carrinhoService';

export async function getCarrinho(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await obterCarrinho(res.locals.usuarioId));
  } catch (erro) {
    next(erro);
  }
}

export async function postItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await adicionarItem(res.locals.usuarioId, req.body ?? {}));
  } catch (erro) {
    next(erro);
  }
}

export async function putItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await alterarQuantidade(res.locals.usuarioId, String(req.params.id), req.body ?? {}));
  } catch (erro) {
    next(erro);
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await removerItem(res.locals.usuarioId, String(req.params.id)));
  } catch (erro) {
    next(erro);
  }
}