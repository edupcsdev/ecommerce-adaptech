import { createFileRoute } from "@tanstack/react-router";
import { ProductBrowser } from "@/components/store/ProductBrowser";
import { PageHeader } from "@/components/store/PageHeader";

export const Route = createFileRoute("/produtos")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({ q: typeof s["q"] === "string" ? s["q"] : undefined }),
  head: () => ({
    meta: [
      { title: "Todos os produtos — AdapTech" },
      { name: "description", content: "Catálogo completo da AdapTech com filtros por categoria, marca e preço." },
      { property: "og:title", content: "Catálogo AdapTech" },
      { property: "og:description", content: "Encontre peças e periféricos de informática." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Produtos,
});

function Produtos() {
  const { q } = Route.useSearch();
  return (
    <>
      <PageHeader title="Todos os produtos" subtitle="Filtre por categoria, marca e faixa de preço." />
      <ProductBrowser key={q ?? ""} initialQuery={q ?? ""} />
    </>
  );
}
