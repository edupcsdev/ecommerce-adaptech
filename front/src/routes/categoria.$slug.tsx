import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCategory } from "@/data/products";
import { ProductBrowser } from "@/components/store/ProductBrowser";
import { PageHeader } from "@/components/store/PageHeader";

export const Route = createFileRoute("/categoria/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { name: category.name, description: category.description, slug: category.slug };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — AdapTech` : "Categoria — AdapTech" },
      { name: "description", content: loaderData?.description ?? "Categoria de produtos AdapTech" },
      { property: "og:title", content: loaderData ? `${loaderData.name} na AdapTech` : "AdapTech" },
      { property: "og:description", content: loaderData?.description ?? "Produtos de informática" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Categoria,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Categoria não encontrada</h1>
      <Link to="/produtos" className="mt-4 inline-block text-primary">Ver todos os produtos</Link>
    </div>
  ),
  errorComponent: () => <div className="p-20 text-center">Erro ao carregar a categoria.</div>,
});

function Categoria() {
  const c = Route.useLoaderData();
  return (
    <>
      <PageHeader title={c.name} subtitle={c.description} />
      <ProductBrowser key={c.slug} fixedCategory={c.slug} />
    </>
  );
}
