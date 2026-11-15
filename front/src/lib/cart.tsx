import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "@/data/products";

type Item = { id: string; qty: number; snap?: Product | undefined };
type CartCtx = {
  items: (Item & { product: Product })[];
  count: number;
  subtotal: number;
  add: (id: string, qty?: number, product?: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

// Mantém o mesmo contexto entre recarregamentos automáticos do editor (evita tela em branco).
const g = globalThis as unknown as Record<string, React.Context<CartCtx | null> | undefined>;
const Ctx = (g["__adaptechCartCtx"] ??= createContext<CartCtx | null>(null));
const KEY = "adaptech-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { setRaw(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(raw)); }, [raw, loaded]);

  const value = useMemo<CartCtx>(() => {
    const items = raw.flatMap((i) => { const product = getProduct(i.id) ?? i.snap; return product ? [{ id: i.id, qty: i.qty, product }] : []; });
    return {
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.product.price, 0),
      add: (id, qty = 1, product) => setRaw((r) => r.some((i) => i.id === id) ? r.map((i) => i.id === id ? { ...i, qty: i.qty + qty } : i) : [...r, getProduct(id) ? { id, qty } : { id, qty, snap: product }]),
      setQty: (id, qty) => setRaw((r) => qty <= 0 ? r.filter((i) => i.id !== id) : r.map((i) => i.id === id ? { ...i, qty } : i)),
      remove: (id) => setRaw((r) => r.filter((i) => i.id !== id)),
      clear: () => setRaw([]),
    };
  }, [raw]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart deve ser usado dentro de CartProvider");
  return c;
}
