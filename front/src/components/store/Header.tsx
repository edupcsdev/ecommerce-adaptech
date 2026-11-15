import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { categories } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/produtos", search: { q: q.trim() || undefined } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="bg-gradient-accent py-1.5 text-center text-xs font-semibold text-accent-foreground">
        Frete grátis acima de R$ 299 • 10% OFF no Pix • Cupom ADAPTECH10
      </div>
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetTitle>Categorias</SheetTitle>
            <nav className="mt-4 flex flex-col gap-1">
              {categories.map((c) => (
                <Link key={c.slug} to="/categoria/$slug" params={{ slug: c.slug }} className="rounded-md px-3 py-2 hover:bg-secondary">{c.name}</Link>
              ))}
              <Link to="/sobre" className="rounded-md px-3 py-2 hover:bg-secondary">Sobre</Link>
              <Link to="/contato" className="rounded-md px-3 py-2 hover:bg-secondary">Contato</Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Logo />
        <form onSubmit={submit} className="relative ml-auto hidden flex-1 md:block md:max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar placas de vídeo, monitores, teclados..." className="h-10 pl-9" aria-label="Buscar produtos" />
        </form>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button asChild variant="ghost" size="icon" aria-label={user ? `Meus pedidos (${user.nome})` : "Minha conta"}><Link to={user ? "/pedidos" : "/login"}><User /></Link></Button>
          <Button asChild variant="ghost" size="icon" aria-label="Carrinho" className="relative">
            <Link to="/carrinho">
              <ShoppingCart />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">{count}</span>
              )}
            </Link>
          </Button>
        </div>
      </div>
      <nav className="hidden border-t border-border lg:block">
        <div className="container mx-auto flex gap-1 overflow-x-auto px-4 py-1 text-sm">
          <Link to="/produtos" className="rounded-md px-3 py-1.5 font-semibold text-primary hover:bg-secondary">Todos</Link>
          {categories.map((c) => (
            <Link key={c.slug} to="/categoria/$slug" params={{ slug: c.slug }} className="whitespace-nowrap rounded-md px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "text-foreground bg-secondary" }}>{c.name}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
