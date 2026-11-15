import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Twitter, Facebook } from "lucide-react";
import { Logo } from "./Logo";
import { categories } from "@/data/products";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">Peças e periféricos de informática para quem leva tecnologia a sério.</p>
          <div className="flex gap-3 text-muted-foreground">
            <Instagram className="h-5 w-5" /><Youtube className="h-5 w-5" /><Twitter className="h-5 w-5" /><Facebook className="h-5 w-5" />
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Categorias</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}><Link to="/categoria/$slug" params={{ slug: c.slug }} className="hover:text-primary">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Institucional</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/sobre" className="hover:text-primary">Sobre a AdapTech</Link></li>
            <li><Link to="/contato" className="hover:text-primary">Fale conosco</Link></li>
            <li><Link to="/login" className="hover:text-primary">Minha conta</Link></li>
            <li><Link to="/carrinho" className="hover:text-primary">Carrinho</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Pagamento</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {["Pix", "Visa", "Mastercard", "Elo", "Boleto"].map((m) => (
              <span key={m} className="rounded border border-border px-2 py-1 text-muted-foreground">{m}</span>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Atendimento: seg. a sex., 9h às 18h</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AdapTech — Projeto acadêmico. Todos os direitos reservados.
      </div>
    </footer>
  );
}
