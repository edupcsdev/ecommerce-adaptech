// Converte o produto da API no formato usado pelas telas (Product).
// A API não tem marca, foto nem avaliações: usamos a foto do catálogo de exemplo com o mesmo nome, quando existir.
import { categories, products, type Product } from "@/data/products";
import type { ApiProduto, Categoria } from "./adaptech";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function categoriaSlug(c: Categoria | undefined) {
  if (!c) return "";
  return categories.find((x) => norm(x.name) === norm(c.nome))?.slug ?? norm(c.nome).replace(/[^a-z0-9]+/g, "-");
}

export function fromApiProduto(p: ApiProduto, cats: Categoria[] = []): Product {
  const mock = products.find((x) => norm(x.name) === norm(p.nome));
  const slug = categoriaSlug(cats.find((c) => c.id === p.categoriaId)) || mock?.category || "";
  const specsRaw = typeof p.especificacoes === "string" ? safeJson(p.especificacoes) : p.especificacoes;
  const specs = specsRaw && typeof specsRaw === "object"
    ? Object.fromEntries(Object.entries(specsRaw).map(([k, v]) => [k, String(v)]))
    : typeof p.especificacoes === "string" && p.especificacoes ? { Detalhes: p.especificacoes } : mock?.specs ?? {};
  const fallbackImg = categories.find((c) => c.slug === slug)?.image ?? categories[0]!.image;
  return {
    id: p.id, name: p.nome, brand: mock?.brand ?? p.nome.split(" ")[0] ?? "AdapTech", category: slug,
    price: Number(p.preco), stock: p.estoque, rating: mock?.rating ?? 0, reviews: mock?.reviews ?? 0,
    image: mock?.image ?? fallbackImg, description: p.descricao ?? mock?.description ?? "", specs,
    ...(mock?.images ? { images: mock.images } : {}), ...(mock?.sourceUrl ? { sourceUrl: mock.sourceUrl } : {}),
    ...(p.altaDemanda ? { featured: true } : {}),
  };
}

function safeJson(s: string): unknown { try { return JSON.parse(s); } catch { return null; } }
