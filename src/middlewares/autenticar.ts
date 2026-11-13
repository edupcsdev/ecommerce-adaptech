import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

export function autenticar(req: Request, res: Response, next: NextFunction) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    return next(new AppError('Token não informado', 401));
  }

  try {
    const payload = jwt.verify(cabecalho.slice(7), env.JWT_SECRET) as jwt.JwtPayload;
    res.locals.usuarioId = Number(payload.sub);
    next();
  } catch {
    next(new AppError('Token inválido ou expirado', 401));
  }
}