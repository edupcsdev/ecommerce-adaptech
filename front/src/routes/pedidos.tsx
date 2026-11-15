import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { brl } from "@/lib/format";
import { apiEnabled } from "@/services/api";
import { listarPedidos, type Pedido } from "@/services/adaptech";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/store/PageHeader";

export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Meus pedidos — AdapTech" },
      { name: "description", content: "Acompanhe o status dos seus pedidos na AdapTech." },
      { property: "og:title", content: "Meus pedidos AdapTech" },
      { property: "og:description", content: "Histórico e status dos pedidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pedidos,
});

const statusLabel: Record<Pedido["status"], string> = { pendente: "Pendente", pago: "Pago", expirado: "Expirado", cancelado: "Cancelado" };

function Pedidos() {
  const { user, logout } = useAuth();
  const [list, setList] = useState<Pedido[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (user) listarPedidos().then(setList).catch((e: Error) => setError(e.message)); }, [user]);

  if (!apiEnabled() || !user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Meus pedidos</h1>
        <p className="mt-2 text-muted-foreground">{apiEnabled() ? "Entre na sua conta para ver seus pedidos." : "Disponível quando a loja estiver conectada ao servidor."}</p>
        <Button asChild variant="hero" className="mt-6"><Link to="/login">Entrar</Link></Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Meus pedidos" subtitle={`Olá, ${user.nome}`} />
      <div className="container mx-auto space-y-3 px-4 py-8">
        {error && <p role="alert" className="text-destructive">{error}</p>}
        {list === null && !error && <p className="text-muted-foreground">Carregando...</p>}
        {list?.length === 0 && <p className="text-muted-foreground">Você ainda não fez pedidos.</p>}
        {list?.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-mono text-sm">#{p.id.slice(0, 8)}</span>
              <span className="text-sm text-muted-foreground">{new Date(p.criadoEm).toLocaleString("pt-BR")}</span>
              <span className="font-semibold text-primary">{statusLabel[p.status]}</span>
            </div>
            <ul className="mt-2 text-sm text-muted-foreground">
              {p.itens.map((i) => <li key={i.produtoId}>{i.quantidade}x {i.nome}</li>)}
            </ul>
            <div className="mt-2 text-right font-display font-bold">{brl(p.total)}{p.formaPagamento ? ` • ${p.formaPagamento}` : ""}</div>
          </div>
        ))}
        <Button variant="outline" onClick={logout}>Sair da conta</Button>
      </div>
    </>
  );
}
