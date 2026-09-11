import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageField } from "@/components/admin/image-field";
import { AreaField, SelectField, TextField, Toggle } from "@/components/admin/field";
import { useInvalidateCatalog } from "@/components/catalog";
import { Button } from "@/components/ui/button";
import {
  deleteProduct,
  listAdminProducts,
  saveProduct,
} from "@/lib/catalog/admin";
import { PRODUCT_KINDS, type Product } from "@/lib/catalog/types";
import { formatMvr } from "@/lib/money";

const empty: Omit<Product, "id"> & { id: number | null } = {
  id: null,
  slug: "",
  name: "",
  kind: "Greenhouse",
  season: "Year-round",
  note: "",
  image: "",
  unit: "kg",
  priceMvr: 0,
  inStock: true,
  featured: false,
  sortOrder: 100,
  active: true,
};

export function AdminProducts() {
  const client = useQueryClient();
  const invalidate = useInvalidateCatalog();
  const list = useQuery({ queryKey: ["admin-products"], queryFn: () => listAdminProducts() });
  const [draft, setDraft] = useState<(typeof empty) | null>(null);

  const save = useMutation({
    mutationFn: (data: typeof empty) => saveProduct({ data }),
    onSuccess: async () => {
      toast.success("Produce saved.");
      setDraft(null);
      await client.invalidateQueries({ queryKey: ["admin-products"] });
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteProduct({ data: id }),
    onSuccess: async () => {
      toast.success("Removed from the list.");
      setDraft(null);
      await client.invalidateQueries({ queryKey: ["admin-products"] });
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = list.data ?? [];

  if (draft) {
    return (
      <form
        className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(draft);
        }}
      >
        <ImageField
          value={draft.image}
          onChange={(image) => setDraft({ ...draft, image })}
          label="Produce photo"
        />
        <div className="grid gap-3">
          <TextField
            label="Name"
            required
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Kind"
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
            >
              {PRODUCT_KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </SelectField>
            <TextField
              label="Season"
              value={draft.season}
              onChange={(e) => setDraft({ ...draft, season: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Price (MVR)"
              type="number"
              min={0}
              step={0.5}
              value={draft.priceMvr}
              onChange={(e) =>
                setDraft({ ...draft, priceMvr: Number(e.target.value) })
              }
            />
            <TextField
              label="Unit"
              value={draft.unit}
              onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
              placeholder="kg, bunch, tray"
            />
          </div>
          <AreaField
            label="Note"
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          />
          <Toggle
            label="In stock"
            checked={draft.inStock}
            onChange={(inStock) => setDraft({ ...draft, inStock })}
          />
          <Toggle
            label="Show on the public list"
            checked={draft.active}
            onChange={(active) => setDraft({ ...draft, active })}
          />
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save produce"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
              Back
            </Button>
            {draft.id ? (
              <Button
                type="button"
                variant="ghost"
                className="ml-auto text-sand"
                onClick={() => {
                  if (confirm("Remove this crop from the list?")) {
                    remove.mutate(draft.id as number);
                  }
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Prices and photos update on the public crate as soon as you save.
        </p>
        <Button size="sm" onClick={() => setDraft({ ...empty })}>
          <Plus className="size-4" />
          New crop
        </Button>
      </div>
      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-[1.5rem] bg-elevated shadow-[var(--shadow-border)]">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setDraft(item)}
              className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-fg/5"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="size-14 rounded-xl object-cover"
                />
              ) : (
                <div className="size-14 rounded-xl bg-sage-dim" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.kind} · {item.season}
                </p>
              </div>
              <div className="text-right">
                <p className="tabular-nums text-sm">{formatMvr(item.priceMvr)}</p>
                <p className="text-[0.7rem] text-subtle">
                  / {item.unit}
                  {item.active ? "" : " · hidden"}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
