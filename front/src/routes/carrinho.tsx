import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { brl, COUPONS, FREE_SHIPPING_MIN } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/store/PageHeader";
import { OrderSummary } from "@/components/store/OrderSummary";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — AdapTech" },
      { name: "description", content: "Revise os itens do seu carrinho na AdapTech." },
      { property: "og:title", content: "Carrinho AdapTech" },
      { property: "og:description", content: "Seus produtos selecionados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Carrinho,
});

function Carrinho() {
  const { items, subtotal, setQty, remove } = useCart();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const discount = coupon ? subtotal * (COUPONS[coupon] ?? 0) : 0;

  const apply = () => {
    const c = code.trim().toUpperCase();
    if (COUPONS[c]) { setCoupon(c); toast.success(`Cupom ${c} aplicado!`); } else toast.error("Cupom inválido");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-muted-foreground">Que tal dar uma olhada nas nossas ofertas?</p>
        <Button asChild variant="hero" className="mt-6"><Link to="/produtos">Ver produtos</Link></Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Meu carrinho" subtitle={subtotal < FREE_SHIPPING_MIN ? `Faltam ${brl(FREE_SHIPPING_MIN - subtotal)} para frete grátis` : "Você ganhou frete grátis!"} />
      <div className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map(({ id, qty, product }) => (
            <div key={id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
              <img src={product.image} alt={product.name} width={96} height={96} className="h-24 w-24 rounded-lg object-cover" />
              <div className="flex flex-1 flex-col">
                <Link to="/produto/$id" params={{ id }} className="font-medium hover:text-primary">{product.name}</Link>
                <span className="text-xs text-muted-foreground">{product.brand}</span>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center rounded-md border border-border">
                    <Button variant="ghost" size="icon" aria-label="Diminuir" onClick={() => setQty(id, qty - 1)}><Minus /></Button>
                    <span className="w-8 text-center">{qty}</span>
                    <Button variant="ghost" size="icon" aria-label="Aumentar" onClick={() => setQty(id, Math.min(product.stock, qty + 1))}><Plus /></Button>
                  </div>
                  <span className="font-display text-lg font-bold">{brl(product.price * qty)}</span>
                  <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remove(id)}><Trash2 className="text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="space-y-4 rounded-xl border border-border bg-card p-6 lg:sticky lg:top-36 lg:self-start">
          <h2 className="text-lg font-bold">Resumo do pedido</h2>
          <div className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Cupom de desconto" />
            <Button variant="outline" onClick={apply}>Aplicar</Button>
          </div>
          <OrderSummary subtotal={subtotal} discount={discount} />
          <Button asChild variant="hero" size="lg" className="w-full"><Link to="/checkout" search={{ cupom: coupon ?? undefined }}>Finalizar compra</Link></Button>
          <Link to="/produtos" className="block text-center text-sm text-primary hover:underline">Continuar comprando</Link>
        </aside>
      </div>
    </>
  );
}
