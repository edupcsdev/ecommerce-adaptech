import { Request, Response, NextFunction } from 'express';
import { listarCategorias, criarCategoria, removerCategoria } from '../services/categoriaService';

export async function getCategorias(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listarCategorias());
  } catch (erro) {
    next(erro);
  }
}

export async function postCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await criarCategoria(req.body ?? {}));
  } catch (erro) {
    next(erro);
  }
}

export async function deleteCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    await removerCategoria(String(req.params.id));
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}