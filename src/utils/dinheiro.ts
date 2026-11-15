export function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

// Desconto do PIX e do cupom acumulam (ambos sobre o subtotal); o total nunca fica negativo
export function calcularTotais(
  subtotal: number,
  descontoPix: number,
  descontoCupom: number,
): { desconto: number; total: number } {
  const desconto = arredondar(Math.min(subtotal, descontoPix + descontoCupom));
  return { desconto, total: arredondar(subtotal - desconto) };
}