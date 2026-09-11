import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Product } from "@/lib/catalog/types";

type CartState = {
  lines: CartLine[];
  add: (product: Product, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (product, qty = 1) => {
        const existing = get().lines.find((l) => l.productId === product.id);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.productId === product.id
                ? { ...l, qty: Math.round((l.qty + qty) * 100) / 100 }
                : l,
            ),
          });
          return;
        }
        set({
          lines: [
            ...get().lines,
            {
              productId: product.id,
              name: product.name,
              unit: product.unit,
              priceMvr: product.priceMvr,
              image: product.image,
              qty,
            },
          ],
        });
      },
      setQty: (productId, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((l) => l.productId !== productId) });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.productId === productId
              ? { ...l, qty: Math.round(qty * 100) / 100 }
              : l,
          ),
        });
      },
      remove: (productId) =>
        set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      clear: () => set({ lines: [] }),
    }),
    { name: "zuvaan-crate" },
  ),
);

export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const done = () => setHydrated(true);
    if (useCart.persist.hasHydrated()) done();
    return useCart.persist.onFinishHydration(done);
  }, []);
  return hydrated;
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.qty * l.priceMvr, 0);
}
