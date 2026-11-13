import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function tratarErros(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ mensagem: err.message });
  }
  console.error(err);
  return res.status(500).json({ mensagem: 'Erro interno do servidor' });
}