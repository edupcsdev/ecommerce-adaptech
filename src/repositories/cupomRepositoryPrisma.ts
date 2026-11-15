import { Coupon } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { Cupom } from '../models/cupom';
import { CupomRepository } from './cupomRepository';

function paraDominio(c: Coupon): Cupom {
  return {
    id: c.id,
    codigo: c.code,
    tipo: c.discountType === 'PERCENTUAL' ? 'percentual' : 'fixo',
    valor: c.discountValue.toNumber(),
    ativo: c.isActive,
    validoDe: c.validFrom,
    validoAte: c.validUntil,
    limiteUsos: c.maxUses ?? Number.MAX_SAFE_INTEGER, // nulo = ilimitado
  };
}

export const cupomRepository: CupomRepository = {
  async buscarPorCodigo(codigo) {
    const cupom = await prisma.coupon.findUnique({ where: { code: codigo } });
    return cupom ? paraDominio(cupom) : undefined;
  },
};