import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCatalog, useSlot } from "@/components/catalog";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { roundQty, stepFor } from "@/components/cart-drawer";
import { PRODUCT_KINDS, type Product } from "@/lib/catalog/types";
import { useCart } from "@/lib/cart";
import { formatMvr } from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produce")({ component: ProducePage });

const kinds = ["All", ...PRODUCT_KINDS] as const;

function ProducePage() {
  const hero = useSlot("produceHero", "/images/dragon.jpg");
  const { products } = useCatalog();
  const [kind, setKind] = useState<(typeof kinds)[number]>("All");
  const items = useMemo(
    () => (kind === "All" ? products : products.filter((p) => p.kind === kind)),
    [kind, products],
  );

  return (
    <main className="bg-bg text-fg">
      <PageHero
        kicker="What we grow"
        title="A crate from"
        italic="this week’s rows"
        lede="Dragon fruit, greenhouse cucumber, vine tomato, leaf mix, sugarcane and nursery starts, priced from Meedhoo, for Addu and Fuvahmulah kitchens."
        image={hero}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "h-10 rounded-full px-4 text-sm transition-colors",
                kind === k
                  ? "bg-primary text-primary-fg"
                  : "bg-elevated text-muted hover:text-fg",
              )}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ProduceCard key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-14 rounded-[1.75rem] bg-surface p-8 text-center shadow-[var(--shadow-border)]">
          <h2 className="font-sans text-2xl font-medium tracking-tight">
            Need a weekly list filled?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Add to the crate, send the order. Fresh Yield confirms against what
            the house can pick.
          </p>
          <Link to="/order" className="mt-6 inline-flex">
            <Button size="lg">Review crate</Button>
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function ProduceCard({ item }: { item: Product }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(item.unit === "kg" ? 1 : 1);

  return (
    <article className="overflow-hidden rounded-[1.75rem] bg-elevated shadow-[var(--shadow-border)]">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-sage-dim" />
      )}
      <div className="p-5">
        <p className="text-[0.7rem] tracking-wider text-subtle uppercase">
          {item.kind} · {item.season}
        </p>
        <h2 className="mt-2 font-medium tracking-tight">{item.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{item.note}</p>
        <p className="mt-4 text-sm tabular-nums">
          {formatMvr(item.priceMvr)}
          <span className="ml-1 text-xs text-muted">/ {item.unit}</span>
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="inline-flex items-center rounded-full bg-bg p-0.5">
            <button
              type="button"
              className="grid size-9 place-items-center"
              aria-label="Less"
              onClick={() =>
                setQty((n) => Math.max(stepFor(item.unit), roundQty(n - stepFor(item.unit))))
              }
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-8 text-center text-xs tabular-nums">{qty}</span>
            <button
              type="button"
              className="grid size-9 place-items-center"
              aria-label="More"
              onClick={() => setQty((n) => roundQty(n + stepFor(item.unit)))}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <Button
            size="sm"
            className="flex-1"
            disabled={!item.inStock}
            onClick={() => {
              add(item, qty);
              toast.success(`${item.name} in the crate`);
            }}
          >
            {item.inStock ? "Add to crate" : "Out this week"}
          </Button>
        </div>
      </div>
    </article>
  );
}
