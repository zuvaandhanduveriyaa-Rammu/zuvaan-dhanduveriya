import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageField } from "@/components/admin/image-field";
import { TextField, Toggle } from "@/components/admin/field";
import { useInvalidateCatalog } from "@/components/catalog";
import { Button } from "@/components/ui/button";
import {
  deletePartner,
  listAdminPartners,
  savePartner,
} from "@/lib/catalog/admin";
import type { Partner } from "@/lib/catalog/types";

const empty: Omit<Partner, "id"> & { id: number | null } = {
  id: null,
  name: "",
  license: "",
  logo: "",
  href: "",
  sortOrder: 100,
  active: true,
};

export function AdminPartners() {
  const client = useQueryClient();
  const invalidate = useInvalidateCatalog();
  const list = useQuery({
    queryKey: ["admin-partners"],
    queryFn: () => listAdminPartners(),
  });
  const [draft, setDraft] = useState<(typeof empty) | null>(null);

  const save = useMutation({
    mutationFn: (data: typeof empty) => savePartner({ data }),
    onSuccess: async () => {
      toast.success("Partner saved. Home and footer will show it.");
      setDraft(null);
      await client.invalidateQueries({ queryKey: ["admin-partners"] });
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deletePartner({ data: id }),
    onSuccess: async () => {
      toast.success("Partner removed.");
      setDraft(null);
      await client.invalidateQueries({ queryKey: ["admin-partners"] });
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = list.data ?? [];

  if (draft) {
    return (
      <form
        className="grid gap-4 lg:grid-cols-[14rem_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(draft);
        }}
      >
        <ImageField
          variant="logo"
          value={draft.logo}
          onChange={(logo) => setDraft({ ...draft, logo })}
          label="Logo"
        />
        <div className="grid gap-3">
          <TextField
            label="Name"
            required
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <TextField
            label="Licence / entity note"
            placeholder="Pvt. Ltd. · farm licence"
            value={draft.license}
            onChange={(e) => setDraft({ ...draft, license: e.target.value })}
          />
          <TextField
            label="Website (optional)"
            placeholder="https://"
            value={draft.href}
            onChange={(e) => setDraft({ ...draft, href: e.target.value })}
          />
          <Toggle
            label="Show on home and footer"
            checked={draft.active}
            onChange={(active) => setDraft({ ...draft, active })}
          />
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save partner"}
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
                  if (confirm("Remove this licence entity?")) {
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
        <p className="max-w-lg text-sm text-muted">
          Small licence entities. Logos stay modest on the home page and as a
          quiet row in the footer. Upload a mark and give it a name.
        </p>
        <Button size="sm" onClick={() => setDraft({ ...empty })}>
          <Plus className="size-4" />
          Add partner
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
              {item.logo ? (
                <img
                  src={item.logo}
                  alt=""
                  className="mark-quiet size-12 rounded-xl object-contain bg-bg p-1.5"
                />
              ) : (
                <div className="grid size-12 place-items-center rounded-xl bg-fg/8 text-sm text-muted">
                  {item.name.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted">
                  {item.license || "No licence note"}
                </p>
              </div>
              <p className="text-[0.7rem] text-subtle">
                {item.active ? "Live" : "Hidden"}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
