import { describe, expect, it } from "vitest";
import { COUPONS, pixPrice, shippingFor } from "@/lib/format";

describe("regras da loja", () => {
  it("Pix dá 10% de desconto", () => expect(pixPrice(100)).toBeCloseTo(90));
  it("frete grátis a partir de R$ 299", () => { expect(shippingFor(299)).toBe(0); expect(shippingFor(298)).toBe(29.9); });
  it("cupom ADAPTECH10 vale 10%", () => expect(COUPONS["ADAPTECH10"]).toBe(0.1));
});
