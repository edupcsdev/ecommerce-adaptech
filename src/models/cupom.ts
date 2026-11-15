export type TipoCupom = 'percentual' | 'fixo';

export type Cupom = {
  id: string;
  codigo: string; // sempre em maiúsculas
  tipo: TipoCupom;
  valor: number; // percentual (ex.: 10 = 10%) ou valor fixo em reais
  ativo: boolean;
  validoDe: Date | null;
  validoAte: Date | null;
  limiteUsos: number;
};