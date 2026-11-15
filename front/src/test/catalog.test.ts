import { describe, expect, it } from "vitest";
import { categories, getProduct, products } from "@/data/products";
import photoSources from "@/data/product-photo-sources.json";

describe("catálogo ampliado", () => {
  it("preserva os produtos antigos e acrescenta modelos únicos em todas as categorias", () => {
    expect(products).toHaveLength(64);
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(getProduct("gabinete-vidro")?.name).toContain("4000D");
    expect(getProduct("asus-ap201")?.category).toBe("gabinetes");
    for (const category of categories) {
      expect(products.filter((p) => p.category === category.slug).length).toBeGreaterThanOrEqual(4);
    }
  });

  it("mantém as imagens locais no CDN e registra a origem de cada foto", () => {
    const sources = Object.values(photoSources);
    for (const product of products) {
      expect(product.price).toBeGreaterThan(0);
      expect(product.price).toBeLessThanOrEqual(5000);
      expect(product.image).toMatch(/^\/__l5e\/assets-v1\//);
      expect(product.sourceUrl).toMatch(/^https:\/\//);
      expect(sources.some((source) => source.source === product.sourceUrl)).toBe(true);
    }
  });
});