import { brl, shippingFor, pixPrice } from "@/lib/format";

export function OrderSummary({ subtotal, discount, pix }: { subtotal: number; discount: number; pix?: boolean }) {
  const shipping = shippingFor(subtotal);
  const afterCoupon = subtotal - discount;
  const total = (pix ? pixPrice(afterCoupon) : afterCoupon) + shipping;
  return (
    <div className="space-y-2 text-sm">
      <Row label="Subtotal" value={brl(subtotal)} />
      {discount > 0 && <Row label="Cupom" value={`- ${brl(discount)}`} accent />}
      {pix && <Row label="Desconto Pix (10%)" value={`- ${brl(afterCoupon * 0.1)}`} accent />}
      <Row label="Frete" value={shipping === 0 ? "Grátis" : brl(shipping)} />
      <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-bold"><span>Total</span><span className="text-primary">{brl(total)}</span></div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className={accent ? "text-success" : ""}>{value}</span></div>;
}
