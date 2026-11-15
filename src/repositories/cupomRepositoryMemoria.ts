import { Cupom } from '../models/cupom';
import { CupomRepository } from './cupomRepository';

// Cupons de exemplo (o seed do banco deve ter os mesmos códigos)
const cupons: Cupom[] = [
  { id: '1', codigo: 'BEMVINDO10', tipo: 'percentual', valor: 10, ativo: true, validoDe: null, validoAte: new Date('2030-12-31T23:59:59.000Z'), limiteUsos: 1000 },
  { id: '2', codigo: 'DESCONTO50', tipo: 'fixo', valor: 50, ativo: true, validoDe: null, validoAte: new Date('2030-12-31T23:59:59.000Z'), limiteUsos: 1000 },
  { id: '3', codigo: 'EXPIRADO', tipo: 'percentual', valor: 10, ativo: true, validoDe: null, validoAte: new Date('2024-01-01T00:00:00.000Z'), limiteUsos: 100 },
  { id: '4', codigo: 'ESGOTADO', tipo: 'percentual', valor: 10, ativo: true, validoDe: null, validoAte: new Date('2030-12-31T23:59:59.000Z'), limiteUsos: 0 },
  { id: '5', codigo: 'INATIVO', tipo: 'percentual', valor: 10, ativo: false, validoDe: null, validoAte: new Date('2030-12-31T23:59:59.000Z'), limiteUsos: 100 },
];

export const cupomRepository: CupomRepository = {
  async buscarPorCodigo(codigo) {
    const cupom = cupons.find((c) => c.codigo === codigo);
    return cupom ? { ...cupom } : undefined;
  },
};