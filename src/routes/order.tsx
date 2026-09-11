import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useSlot } from "@/components/catalog";
import { cartTotal, useCart, useCartHydrated } from "@/lib/cart";
import { placeOrder } from "@/lib/catalog/public";
import { formatMvr } from "@/lib/money";

export const Route = createFileRoute("/order")({ component: OrderPage });

function OrderPage() {
  const hero = useSlot("produceHero", "/images/dragon.jpg");
  const hydrated = useCartHydrated();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const total = cartTotal(lines);
  const [done, setDone] = useState<{ name: string; total: number } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return;
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const result = await placeOrder({
        data: {
          customerName: String(data.get("name") ?? "").trim(),
          phone: String(data.get("phone") ?? "").trim(),
          island: String(data.get("island") ?? "").trim(),
          notes: String(data.get("notes") ?? "").trim(),
          items: lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            unit: l.unit,
            qty: l.qty,
            unitPriceMvr: l.priceMvr,
          })),
        },
      });
      setDone({ name: String(data.get("name") ?? "").trim(), total: result.total });
      clear();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place this order.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-bg text-fg">
      <PageHero
        kicker="The crate"
        title="Order from"
        italic="this week’s house"
        lede="Name the kitchen, the island, and what you need. Ramsey confirms by phone against what the rows can spare."
        image={hero}
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="kicker">In the crate</p>
          {!hydrated ? (
            <div className="mt-6 h-32 animate-pulse rounded-[1.75rem] bg-elevated" />
          ) : lines.length === 0 && !done ? (
            <div className="mt-6 rounded-[1.75rem] bg-elevated p-8 shadow-[var(--shadow-border)]">
              <h2 className="font-sans text-2xl font-medium tracking-tight">
                The crate is empty
              </h2>
              <p className="mt-3 text-sm text-muted">
                Add produce from the list, then come back to send the order.
              </p>
              <Link to="/produce" className="mt-6 inline-flex">
                <Button>What we grow</Button>
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-elevated px-4 py-3 shadow-[var(--shadow-border)]"
                >
                  <div>
                    <p className="text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-muted">
                      {line.qty} {line.unit} · {formatMvr(line.priceMvr)}
                    </p>
                  </div>
                  <p className="tabular-nums text-sm">
                    {formatMvr(line.qty * line.priceMvr)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {lines.length > 0 ? (
            <p className="mt-4 text-right text-sm font-medium tabular-nums">
              {formatMvr(total)}
            </p>
          ) : null}
        </div>

        {done ? (
          <div className="rounded-[1.75rem] bg-elevated p-8 shadow-[var(--shadow-border)]">
            <p className="kicker">Held for the house</p>
            <h2 className="mt-3 font-sans text-3xl font-medium tracking-tight">
              Order in,
              <br />
              <em className="font-serif font-normal italic">{done.name}</em>
            </h2>
            <p className="mt-4 text-sm text-muted">
              {formatMvr(done.total)}. Ramsey will confirm by phone against
              what can be picked. The Superadmin desk sees this crate at once.
            </p>
            <Link to="/produce" className="mt-8 inline-flex">
              <Button>Add another crate</Button>
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-[1.75rem] bg-elevated p-6 shadow-[var(--shadow-border)] sm:p-8"
          >
            <p className="kicker">Send the list</p>
            <h2 className="mt-3 font-sans text-2xl font-medium tracking-tight">
              Where should it go?
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs text-muted">
                Name
                <Input name="name" required placeholder="Kitchen or name" autoComplete="name" />
              </label>
              <label className="grid gap-2 text-xs text-muted">
                Island
                <Input name="island" placeholder="Hithadhoo, Fuvahmulah…" />
              </label>
              <label className="grid gap-2 text-xs text-muted sm:col-span-2">
                Phone
                <Input name="phone" required placeholder="+960" autoComplete="tel" />
              </label>
              <label className="grid gap-2 text-xs text-muted sm:col-span-2">
                Notes
                <Textarea name="notes" placeholder="Delivery day, substitutions, a crate to leave at the jetty…" />
              </label>
            </div>
            <Button
              type="submit"
              size="lg"
              className="mt-6"
              disabled={busy || !hydrated || lines.length === 0}
            >
              {busy ? "Sending…" : "Place this order"}
            </Button>
          </form>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
