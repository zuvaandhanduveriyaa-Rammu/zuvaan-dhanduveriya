import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import { FALLBACK_CATALOG } from "@/lib/catalog/defaults";
import { getCatalog } from "@/lib/catalog/public";
import { SLOT_FALLBACK } from "@/lib/catalog/slots";
import type { Catalog } from "@/lib/catalog/types";

const CatalogContext = createContext<Catalog>(FALLBACK_CATALOG);

export function CatalogSync({
  initial,
  children,
}: {
  initial: Catalog;
  children: ReactNode;
}) {
  const query = useQuery({
    queryKey: ["catalog"],
    queryFn: () => getCatalog(),
    initialData: initial,
    staleTime: 12_000,
  });
  return (
    <CatalogContext.Provider value={query.data ?? initial}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}

export function useSlot(key: string, fallback?: string) {
  const catalog = useCatalog();
  return catalog.images[key] || fallback || SLOT_FALLBACK[key] || "";
}

export function useSocials() {
  return useCatalog().socials.filter((s) => s.active && s.url);
}

export function usePartners() {
  return useCatalog().partners.filter((p) => p.active);
}

export function useInvalidateCatalog() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["catalog"] });
}
