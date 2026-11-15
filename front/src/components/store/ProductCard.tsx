import { Link } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { brl, installments, pixPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const off = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow">
      <Link to="/produto/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden bg-product-photo">
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" width={1000} height={1000} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" />
        {off > 0 && <span className="absolute left-3 top-3 rounded-md bg-gradient-accent px-2 py-1 text-xs font-bold text-accent-foreground">-{off}%</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</span>
        <Link to="/produto/$id" params={{ id: product.id }} className="line-clamp-2 min-h-10 text-sm font-medium hover:text-primary">{product.name}</Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {product.rating} ({product.reviews})
        </div>
        <div className="mt-auto">
          {product.oldPrice && <div className="text-xs text-muted-foreground line-through">{brl(product.oldPrice)}</div>}
          <div className="font-display text-xl font-bold text-primary">{brl(pixPrice(product.price))}</div>
          <div className="text-xs text-muted-foreground">no Pix ou {installments(product.price)}</div>
        </div>
        <Button variant="hero" className="mt-2" onClick={() => { add(product.id, 1, product); toast.success("Adicionado ao carrinho", { description: product.name }); }}>
          <ShoppingCart /> Comprar
        </Button>
      </div>
    </div>
  );
}
