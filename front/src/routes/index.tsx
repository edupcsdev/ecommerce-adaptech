import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard, ShieldCheck, Truck, Zap } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { categories, products } from "@/data/products";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AdapTech — Placas de vídeo, monitores e periféricos" },
      { name: "description", content: "Monte ou faça upgrade do seu PC na AdapTech: GPUs, processadores, monitores, teclados, mouses e headsets com 10% OFF no Pix." },
      { property: "og:title", content: "AdapTech — Loja de informática" },
      { property: "og:description", content: "Peças e periféricos de informática com frete grátis acima de R$ 299." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const perks = [
  { icon: Truck, title: "Frete grátis", text: "Acima de R$ 299" },
  { icon: Zap, title: "10% OFF no Pix", text: "Desconto automático" },
  { icon: CreditCard, title: "Até 10x sem juros", text: "Em todos os cartões" },
  { icon: ShieldCheck, title: "Garantia AdapTech", text: "12 meses + suporte" },
];

const brandList = ["NVIDIA", "AMD", "Intel", "Samsung", "Logitech", "Razer", "HyperX", "Corsair", "Kingston", "ASUS"];

function Index() {
  const featured = products.filter((p) => p.featured);
  const deals = products.filter((p) => p.oldPrice).sort((a, b) => b.oldPrice! / b.price - a.oldPrice! / a.price).slice(0, 4);
  const best = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Setup gamer com PC e periféricos" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Black Week AdapTech</span>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
            Hardware de <span className="text-gradient">alto desempenho</span> para o seu setup
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">Placas de vídeo, processadores, monitores e periféricos com até 25% de desconto e entrega para todo o Brasil.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg"><Link to="/produtos">Ver produtos <ArrowRight /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/categoria/$slug" params={{ slug: "placas-de-video" }}>Placas de vídeo</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
          {perks.map(({ icon: I, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <I className="h-8 w-8 text-primary" />
              <div><div className="font-semibold">{title}</div><div className="text-xs text-muted-foreground">{text}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <SectionTitle title="Categorias" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((c) => (
            <Link key={c.slug} to="/categoria/$slug" params={{ slug: c.slug }} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
              <img src={c.image} alt={c.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <span className="absolute bottom-3 left-3 font-display font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <SectionTitle title="🔥 Ofertas do dia" link />
        <Grid items={deals} />
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid-bg relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-10 shadow-glow md:p-14">
          <h2 className="max-w-xl text-3xl font-bold">Ganhe <span className="text-gradient">10% OFF</span> na primeira compra</h2>
          <p className="mt-3 text-muted-foreground">Use o cupom <strong className="text-accent">ADAPTECH10</strong> no carrinho.</p>
          <Button asChild variant="accent" size="lg" className="mt-6"><Link to="/cadastro">Criar minha conta</Link></Button>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <SectionTitle title="Destaques" link />
        <Grid items={featured.slice(0, 8)} />
      </section>

      <section className="container mx-auto px-4 pb-16">
        <SectionTitle title="Mais vendidos" link />
        <Grid items={best} />
      </section>

      <section className="container mx-auto px-4">
        <SectionTitle title="Marcas parceiras" />
        <div className="flex flex-wrap justify-center gap-3">
          {brandList.map((b) => (
            <span key={b} className="rounded-lg border border-border bg-card px-6 py-3 font-display font-semibold text-muted-foreground">{b}</span>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionTitle({ title, link }: { title: string; link?: boolean }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
      {link && <Link to="/produtos" className="text-sm text-primary hover:underline">Ver todos →</Link>}
    </div>
  );
}

function Grid({ items }: { items: typeof products }) {
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>;
}
