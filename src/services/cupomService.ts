import { AppError } from '../errors/AppError';
import { Cupom } from '../models/cupom';
import { cupomRepository } from '../repositories/cupomRepositoryMemoria';
import { pedidoRepository } from '../repositories/pedidoRepositoryMemoria';
import { arredondar } from '../utils/dinheiro';

export function lerCodigoCupom(valor: unknown): string {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new AppError('codigo do cupom é obrigatório');
  }
  return valor.trim().toUpperCase();
}

// Desconto do cupom sobre o subtotal (nunca maior que o próprio subtotal)
export function calcularDescontoCupom(cupom: Cupom, subtotal: number): number {
  const bruto = cupom.tipo === 'percentual' ? subtotal * (cupom.valor / 100) : cupom.valor;
  return arredondar(Math.min(bruto, subtotal));
}

// Cupom precisa existir (404), estar ativo, dentro da validade e com usos disponíveis (409)
export async function buscarCupomValido(codigo: string): Promise<Cupom> {
  const cupom = await cupomRepository.buscarPorCodigo(codigo);
  if (!cupom) {
    throw new AppError('Cupom não encontrado', 404);
  }

  const agora = Date.now();
  if (!cupom.ativo) {
    throw new AppError('Cupom inativo', 409);
  }
  if (cupom.validoDe && cupom.validoDe.getTime() > agora) {
    throw new AppError('Cupom ainda não está válido', 409);
  }
  if (cupom.validoAte && cupom.validoAte.getTime() < agora) {
    throw new AppError('Cupom expirado', 409);
  }

  // Usos = pedidos pendentes ou pagos com este cupom (expirados e cancelados liberam o uso)
  const usos = await pedidoRepository.contarUsosCupom(cupom.codigo);
  if (usos >= cupom.limiteUsos) {
    throw new AppError('Cupom esgotado', 409);
  }

  return cupom;
}