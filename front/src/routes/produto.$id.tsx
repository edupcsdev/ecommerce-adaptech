import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getCategory, getProduct, products, type Product } from "@/data/products";
import { apiEnabled } from "@/services/api";
import { buscarProduto, listarCategorias } from "@/services/adaptech";
import { fromApiProduto } from "@/services/mappers";
import { brl, installments, pixPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/store/ProductCard";

export const Route = createFileRoute("/produto/$id")({
  loader: async ({ params }): Promise<{ id: string; name: string; description: string; apiProduct?: Product }> => {
    const p = getProduct(params.id);
    if (p) return { id: p.id, name: p.name, description: p.description };
    if (apiEnabled()) {
      // Produto vindo do backend: GET /api/produtos/:id
      const [prod, cats] = await Promise.all([buscarProduto(params.id).catch(() => null), listarCategorias().catch(() => [])]);
      if (prod) { const mapped = fromApiProduto(prod, cats); return { id: mapped.id, name: mapped.name, description: mapped.description, apiProduct: mapped }; }
    }
    throw notFound();
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — AdapTech` : "Produto — AdapTech" },
      { name: "description", content: loaderData?.description ?? "Produto AdapTech" },
      { property: "og:title", content: loaderData?.name ?? "AdapTech" },
      { property: "og:description", content: loaderData?.description ?? "Produto AdapTech" },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProdutoPage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Produto não encontrado</h1>
      <Link to="/produtos" className="mt-4 inline-block text-primary">Voltar ao catálogo</Link>
    </div>
  ),
  errorComponent: () => <div className="p-20 text-center">Erro ao carregar o produto.</div>,
});

const sampleReviews = [
  { name: "Lucas M.", stars: 5, text: "Chegou rápido e bem embalado. Desempenho excelente!" },
  { name: "Mariana S.", stars: 5, text: "Melhor preço que encontrei, recomendo a AdapTech." },
  { name: "Pedro H.", stars: 4, text: "Produto ótimo, só achei a caixa um pouco amassada." },
];

function ProdutoPage() {
  const { id, apiProduct } = Route.useLoaderData();
  const product = getProduct(id) ?? apiProduct;
  const { add } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  if (!product) throw notFound();
  const category = getCategory(product.category);
  const images = product.images?.length ? product.images : [product.image];
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const off = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Início</Link> /{" "}
        {category && <><Link to="/categoria/$slug" params={{ slug: category.slug }} className="hover:text-primary">{category.name}</Link> / </>}
        <span className="text-foreground">{product.name}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-product-photo">
            <img src={images[selectedImage] ?? product.image} alt={product.name} width={1000} height={1000} className="aspect-square w-full object-contain" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.map((image, i) => (
              <Button key={image} variant="outline" aria-label={`Ver foto ${i + 1}`} aria-pressed={selectedImage === i} onClick={() => setSelectedImage(i)} className={`aspect-square h-auto overflow-hidden bg-product-photo p-0 ${i === selectedImage ? "border-primary" : "border-border"}`}>
                <img src={image} alt={`${product.name} — foto ${i + 1}`} loading="lazy" width={1000} height={1000} className="h-full w-full object-contain" />
              </Button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm uppercase tracking-wider text-muted-foreground">{product.brand}</span>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-accent text-accent" /> {product.rating} • {product.reviews} avaliações • Cód. {product.id}
          </div>
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            {product.oldPrice && <div className="text-sm text-muted-foreground"><span className="line-through">{brl(product.oldPrice)}</span> <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground">-{off}%</span></div>}
            <div className="mt-1 font-display text-4xl font-bold text-primary">{brl(pixPrice(product.price))}</div>
            <div className="text-sm text-muted-foreground">à vista no Pix (10% OFF)</div>
            <div className="mt-2 text-sm">ou <strong>{brl(product.price)}</strong> em {installments(product.price)}</div>
            <div className={`mt-4 text-sm font-semibold ${product.stock > 10 ? "text-success" : "text-accent"}`}>
              {product.stock > 10 ? "Em estoque" : `Últimas ${product.stock} unidades!`}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-md border border-border">
                <Button variant="ghost" size="icon" aria-label="Diminuir" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus /></Button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <Button variant="ghost" size="icon" aria-label="Aumentar" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}><Plus /></Button>
              </div>
              <Button variant="hero" size="lg" className="flex-1" onClick={() => { add(product.id, qty, product); toast.success("Adicionado ao carrinho"); }}><ShoppingCart /> Adicionar ao carrinho</Button>
            </div>
            <Button variant="accent" size="lg" className="mt-3 w-full" onClick={() => { add(product.id, qty, product); navigate({ to: "/carrinho" }); }}>Comprar agora</Button>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground"><Truck className="h-5 w-5 text-primary" /> Frete grátis acima de R$ 299</div>
            <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-5 w-5 text-primary" /> Garantia de 12 meses</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="descricao" className="mt-12">
        <TabsList>
          <TabsTrigger value="descricao">Descrição</TabsTrigger>
          <TabsTrigger value="specs">Especificações</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
        </TabsList>
        <TabsContent value="descricao" className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
          <p>{product.description}</p>
          {product.sourceUrl && <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-primary hover:underline">Ver produto no fabricante ↗</a>}
        </TabsContent>
        <TabsContent value="specs" className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(product.specs).map(([k, v]) => (
                <tr key={k} className="border-b border-border last:border-0"><td className="w-1/3 bg-muted p-3 font-semibold">{k}</td><td className="p-3">{v}</td></tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="avaliacoes" className="space-y-3">
          {sampleReviews.map((r) => (
            <div key={r.name} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2"><strong>{r.name}</strong><span className="text-accent">{"★".repeat(r.stars)}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Produtos relacionados</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
