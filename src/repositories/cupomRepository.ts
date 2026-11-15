import { Cupom } from '../models/cupom';

export interface CupomRepository {
  buscarPorCodigo(codigo: string): Promise<Cupom | undefined>;
}