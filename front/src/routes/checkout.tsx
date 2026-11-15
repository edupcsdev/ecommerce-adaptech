import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, QrCode, Receipt } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import { checkoutSchema } from "@/lib/validation";
import { useCart } from "@/lib/cart";
import { brl, COUPONS } from "@/lib/format";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { apiEnabled } from "@/services/api";
import { finalizarCompra, type Pedido } from "@/services/adaptech";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/store/PageHeader";
import { OrderSummary } from "@/components/store/OrderSummary";

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>): { cupom?: string | undefined } => ({ cupom: typeof s["cupom"] === "string" ? s["cupom"] : undefined }),
  head: () => ({
    meta: [
      { title: "Finalizar compra — AdapTech" },
      { name: "description", content: "Informe seus dados, endereço e forma de pagamento." },
      { property: "og:title", content: "Checkout AdapTech" },
      { property: "og:description", content: "Finalize seu pedido com segurança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

type Pay = "pix" | "cartao" | "boleto";
const fields: [keyof z.infer<typeof checkoutSchema>, string, string][] = [
  ["nome", "Nome completo", "sm:col-span-2"], ["email", "E-mail", ""], ["cpf", "CPF", ""], ["telefone", "Telefone", ""],
  ["cep", "CEP", ""], ["endereco", "Endereço", "sm:col-span-2"], ["numero", "Número", ""], ["cidade", "Cidade", ""], ["uf", "UF", ""],
];

function Checkout() {
  const { cupom } = Route.useSearch();
  const { items, subtotal, clear } = useCart();
  const [pay, setPay] = useState<Pay>("pix");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<string | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const online = apiEnabled();
  const discount = cupom && COUPONS[cupom] ? subtotal * (COUPONS[cupom] ?? 0) : 0;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = checkoutSchema.safeParse(data);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    if (!online) { setOrder(`AT${Date.now().toString().slice(-8)}`); clear(); return; }
    // Backend: carrinho -> POST /api/pedidos -> cupom -> pagamento -> confirmar
    if (pay === "cartao") { toast.error("O backend aceita apenas Pix ou boleto."); return; }
    setSending(true);
    try {
      const p = await finalizarCompra(items.map((i) => ({ id: i.id, qty: i.qty })), pay, cupom);
      setPedido(p); setOrder(p.id); clear();
    } catch (err) { toast.error((err as Error).message); }
    finally { setSending(false); }
  };

  if (order) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto h-20 w-20 text-success" />
        <h1 className="mt-4 text-3xl font-bold">Pedido confirmado!</h1>
        <p className="mt-2 text-muted-foreground">Número do pedido: <strong className="text-foreground">{order}</strong></p>
        {pedido && <p className="mt-1 text-sm text-muted-foreground">Status: <strong className="text-foreground">{pedido.status}</strong> • Total pago: <strong className="text-primary">{brl(pedido.total)}</strong></p>}
        <p className="mt-1 text-sm text-muted-foreground">Você receberá a confirmação por e-mail.</p>
        {online && <Link to="/pedidos" className="mt-2 block text-sm text-primary hover:underline">Ver meus pedidos</Link>}
        <Button asChild variant="hero" className="mt-6"><Link to="/">Voltar à loja</Link></Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
        <Button asChild variant="hero" className="mt-6"><Link to="/produtos">Ver produtos</Link></Button>
      </div>
    );
  }

  if (online && !user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Entre na sua conta para finalizar</h1>
        <p className="mt-2 text-muted-foreground">O pedido é criado na sua conta.</p>
        <Button asChild variant="hero" className="mt-6"><Link to="/login">Entrar</Link></Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Finalizar compra" />
      <form onSubmit={submit} noValidate className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">1. Dados e endereço de entrega</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(([name, label, cls]) => (
                <div key={name} className={cls}>
                  <Label htmlFor={name}>{label}</Label>
                  <Input id={name} name={name} className="mt-1" aria-invalid={!!errors[name]} />
                  {errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name]}</p>}
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">2. Forma de pagamento</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {([["pix", online ? "Pix" : "Pix (-10%)", QrCode], ["cartao", "Cartão até 10x", CreditCard], ["boleto", "Boleto", Receipt]] as const).filter(([v]) => !(online && v === "cartao")).map(([v, l, I]) => (
                <button type="button" key={v} onClick={() => setPay(v)} className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition ${pay === v ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                  <I className="h-6 w-6" /> {l}
                </button>
              ))}
            </div>
            {pay === "cartao" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><Label htmlFor="cc">Número do cartão</Label><Input id="cc" placeholder="0000 0000 0000 0000" className="mt-1" /></div>
                <div><Label htmlFor="val">Validade</Label><Input id="val" placeholder="MM/AA" className="mt-1" /></div>
                <div><Label htmlFor="cvv">CVV</Label><Input id="cvv" placeholder="123" className="mt-1" /></div>
              </div>
            )}
            {pay === "pix" && <p className="mt-4 text-sm text-muted-foreground">O QR Code do Pix será exibido após a confirmação do pedido.</p>}
            {pay === "boleto" && <p className="mt-4 text-sm text-muted-foreground">O boleto vence em 3 dias úteis.</p>}
          </section>
        </div>
        <aside className="space-y-4 rounded-xl border border-border bg-card p-6 lg:sticky lg:top-36 lg:self-start">
          <h2 className="text-lg font-bold">Resumo</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => <li key={i.id} className="flex justify-between gap-2"><span className="line-clamp-1 text-muted-foreground">{i.qty}x {i.product.name}</span></li>)}
          </ul>
          <OrderSummary subtotal={subtotal} discount={discount} pix={pay === "pix"} />
          {online && <p className="text-xs text-muted-foreground">O valor final, com descontos, é calculado pelo servidor.</p>}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={sending}>{sending ? "Enviando..." : "Confirmar pedido"}</Button>
        </aside>
      </form>
    </>
  );
}
