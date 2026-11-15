import { useEffect, useMemo, useState } from "react";
import { brands as mockBrands, categories, products as mockProducts, type Product } from "@/data/products";
import { apiEnabled } from "@/services/api";
import { listarCategorias, listarProdutos } from "@/services/adaptech";
import { fromApiProduto } from "@/services/mappers";
import { ProductCard } from "./ProductCard";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";

type Sort = "relevancia" | "menor" | "maior" | "avaliacao";
const MAX = 5000;

export function ProductBrowser({ initialQuery = "", fixedCategory }: { initialQuery?: string; fixedCategory?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [cats, setCats] = useState<string[]>([]);
  const [brs, setBrs] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([0, MAX]);
  const [sort, setSort] = useState<Sort>("relevancia");

  // Com VITE_API_URL definido, o catálogo vem de GET /api/produtos; senão, dos dados de exemplo.
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [apiError, setApiError] = useState<string | null>(null);
  useEffect(() => {
    if (!apiEnabled()) return;
    Promise.all([listarProdutos(), listarCategorias()])
      .then(([ps, cs]) => { setProducts(ps.map((p) => fromApiProduto(p, cs))); setApiError(null); })
      .catch((e: Error) => setApiError(`${e.message} Exibindo produtos de exemplo.`));
  }, []);
  const brands = useMemo(() => apiEnabled() ? Array.from(new Set(products.map((p) => p.brand))).sort() : mockBrands, [products]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const result = useMemo(() => {
    const term = q.toLowerCase().trim();
    const r = products.filter((p) =>
      (!fixedCategory || p.category === fixedCategory) &&
      (cats.length === 0 || cats.includes(p.category)) &&
      (brs.length === 0 || brs.includes(p.brand)) &&
      p.price >= price[0] && p.price <= price[1] &&
      (!term || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term)));
    if (sort === "menor") r.sort((a, b) => a.price - b.price);
    if (sort === "maior") r.sort((a, b) => b.price - a.price);
    if (sort === "avaliacao") r.sort((a, b) => b.rating - a.rating);
    return r;
  }, [q, cats, brs, price, sort, fixedCategory, products]);

  const clear = () => { setQ(""); setCats([]); setBrs([]); setPrice([0, MAX]); };

  return (
    <div className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-36 lg:self-start">
        <div>
          <Label htmlFor="busca" className="mb-2 block font-semibold">Buscar</Label>
          <Input id="busca" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome ou marca" />
        </div>
        {!fixedCategory && (
          <div>
            <h3 className="mb-2 font-semibold">Categorias</h3>
            <div className="space-y-2">
              {categories.map((c) => (
                <label key={c.slug} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={cats.includes(c.slug)} onCheckedChange={() => toggle(cats, setCats, c.slug)} /> {c.name}
                </label>
              ))}
            </div>
          </div>
        )}
        <div>
          <h3 className="mb-2 font-semibold">Marcas</h3>
          <div className="grid grid-cols-2 gap-2">
            {brands.map((b) => (
              <label key={b} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={brs.includes(b)} onCheckedChange={() => toggle(brs, setBrs, b)} /> {b}
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Preço</h3>
          <Slider min={0} max={MAX} step={50} value={price} onValueChange={(v) => setPrice([v[0] ?? 0, v[1] ?? MAX])} />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{brl(price[0])}</span><span>{brl(price[1])}</span></div>
        </div>
        <Button variant="outline" className="w-full" onClick={clear}>Limpar filtros</Button>
      </aside>
      <section>
        {apiError && <p role="alert" className="mb-4 rounded-lg border border-destructive/50 p-3 text-sm text-destructive">{apiError}</p>}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground"><strong className="text-foreground">{result.length}</strong> produtos encontrados</p>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevancia">Mais relevantes</SelectItem>
              <SelectItem value="menor">Menor preço</SelectItem>
              <SelectItem value="maior">Maior preço</SelectItem>
              <SelectItem value="avaliacao">Melhor avaliados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {result.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">Nenhum produto encontrado com esses filtros.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {result.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
