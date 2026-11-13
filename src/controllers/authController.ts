import { Request, Response, NextFunction } from 'express';
import { cadastrarUsuario, login, buscarUsuarioLogado } from '../services/authService';

export async function postCadastro(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = await cadastrarUsuario(req.body ?? {});
    res.status(201).json(usuario);
  } catch (erro) {
    next(erro);
  }
}

export async function postLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const resultado = await login(req.body ?? {});
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = await buscarUsuarioLogado(res.locals.usuarioId);
    res.json(usuario);
  } catch (erro) {
    next(erro);
  }
}