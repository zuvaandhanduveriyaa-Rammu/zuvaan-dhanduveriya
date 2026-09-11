import { Link, useRouterState } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cartCount, cartTotal, useCart } from "@/lib/cart";
import { formatMvr } from "@/lib/money";
import { cn } from "@/lib/utils";

export function CartHost() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const staff =
    pathname.startsWith("/admin") || pathname.startsWith("/login");
  if (staff) return null;
  return <CartDock />;
}

function CartDock() {
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-20 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-fg shadow-[var(--shadow-glass)] sm:right-6 sm:bottom-6"
        aria-label="Open crate"
      >
        <ShoppingBag className="size-4" />
        Crate
        {count > 0 ? (
          <span className="grid min-w-6 place-items-center rounded-full bg-primary-fg px-1.5 text-[0.7rem] text-primary">
            {count % 1 === 0 ? count : count.toFixed(1)}
          </span>
        ) : null}
      </button>
      {open ? <CartPanel onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function CartPanel({ onClose }: { onClose: () => void }) {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = cartTotal(lines);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
        aria-label="Close crate"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-[var(--shadow-glass)]">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="kicker">This week</p>
            <h2 className="font-sans text-xl font-medium tracking-tight">
              Your crate
            </h2>
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full hover:bg-fg/8"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          {lines.length === 0 ? (
            <p className="mt-8 text-sm text-muted">
              Nothing in the crate yet. Walk the produce list and add what the
              kitchen needs.
            </p>
          ) : (
            <ul className="space-y-3">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex gap-3 rounded-2xl bg-elevated p-3 shadow-[var(--shadow-border)]"
                >
                  {line.image ? (
                    <img
                      src={line.image}
                      alt=""
                      className="size-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="size-16 shrink-0 rounded-xl bg-sage-dim" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium">{line.name}</p>
                      <button
                        type="button"
                        className="text-[0.7rem] text-subtle hover:text-fg"
                        onClick={() => remove(line.productId)}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-xs text-muted">
                      {formatMvr(line.priceMvr)} / {line.unit}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full bg-bg p-0.5">
                        <button
                          type="button"
                          className="grid size-8 place-items-center"
                          aria-label="Less"
                          onClick={() =>
                            setQty(line.productId, roundQty(line.qty - stepFor(line.unit)))
                          }
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-xs tabular-nums">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          className="grid size-8 place-items-center"
                          aria-label="More"
                          onClick={() =>
                            setQty(line.productId, roundQty(line.qty + stepFor(line.unit)))
                          }
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-sm tabular-nums">
                        {formatMvr(line.qty * line.priceMvr)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-border px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted">Crate total</span>
            <span className="tabular-nums font-medium">{formatMvr(total)}</span>
          </div>
          <Link to="/order" onClick={onClose} className="block">
            <Button className="w-full" size="lg" disabled={lines.length === 0}>
              Place this order
            </Button>
          </Link>
        </div>
      </aside>
    </div>
  );
}

export function stepFor(unit: string) {
  return unit === "kg" ? 0.5 : 1;
}

export function roundQty(n: number) {
  return Math.max(0, Math.round(n * 100) / 100);
}

export function HeaderCart() {
  const count = useCart((s) => cartCount(s.lines));
  return (
    <Link
      to="/order"
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full text-fg/80 hover:bg-fg/8 hover:text-fg",
      )}
      aria-label="Crate"
    >
      <ShoppingBag className="size-4" />
      {count > 0 ? (
        <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-sage px-1 text-[0.6rem] leading-4 text-primary-fg">
          {count % 1 === 0 ? count : count.toFixed(1)}
        </span>
      ) : null}
    </Link>
  );
}
