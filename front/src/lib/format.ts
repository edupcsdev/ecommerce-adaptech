export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Parcelamento em até 10x sem juros. */
export const installments = (v: number, n = 10) => `${n}x de ${brl(v / n)} sem juros`;

/** Desconto de 10% no Pix. */
export const pixPrice = (v: number) => v * 0.9;

/** Frete grátis acima de R$ 299. */
export const FREE_SHIPPING_MIN = 299;
export const shippingFor = (subtotal: number) => (subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : 29.9);

export const COUPONS: Record<string, number> = { ADAPTECH10: 0.1, BEMVINDO5: 0.05 };
