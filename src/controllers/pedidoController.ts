import { Request, Response, NextFunction } from 'express';
import {
  criarPedido,
  listarPedidos,
  buscarPedido,
  registrarPagamento,
  confirmarPagamento,
} from '../services/pedidoService';

export async function postPedido(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await criarPedido(res.locals.usuarioId));
  } catch (erro) {
    next(erro);
  }
}

export async function getPedidos(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listarPedidos(res.locals.usuarioId));
  } catch (erro) {
    next(erro);
  }
}

export async function getPedido(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await buscarPedido(res.locals.usuarioId, String(req.params.id)));
  } catch (erro) {
    next(erro);
  }
}

export async function postPagamento(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await registrarPagamento(res.locals.usuarioId, String(req.params.id), req.body ?? {}));
  } catch (erro) {
    next(erro);
  }
}

export async function postConfirmar(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await confirmarPagamento(res.locals.usuarioId, String(req.params.id)));
  } catch (erro) {
    next(erro);
  }
}