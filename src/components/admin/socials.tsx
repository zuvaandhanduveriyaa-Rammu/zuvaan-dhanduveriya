import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SelectField, TextField, Toggle } from "@/components/admin/field";
import { useInvalidateCatalog } from "@/components/catalog";
import { Button } from "@/components/ui/button";
import { deleteSocial, listAdminSocials, saveSocial } from "@/lib/catalog/admin";
import { SOCIAL_PLATFORMS, type SocialLink } from "@/lib/catalog/types";

const empty: Omit<SocialLink, "id"> & { id: number | null } = {
  id: null,
  platform: "instagram",
  label: "Instagram",
  url: "",
  sortOrder: 100,
  active: true,
};

export function AdminSocials() {
  const client = useQueryClient();
  const invalidate = useInvalidateCatalog();
  const list = useQuery({
    queryKey: ["admin-socials"],
    queryFn: () => listAdminSocials(),
  });
  const [draft, setDraft] = useState<(typeof empty) | null>(null);

  const save = useMutation({
    mutationFn: (data: typeof empty) => saveSocial({ data }),
    onSuccess: async () => {
      toast.success("Social saved. The footer will pick it up.");
      setDraft(null);
      await client.invalidateQueries({ queryKey: ["admin-socials"] });
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteSocial({ data: id }),
    onSuccess: async () => {
      toast.success("Social removed.");
      setDraft(null);
      await client.invalidateQueries({ queryKey: ["admin-socials"] });
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = list.data ?? [];

  if (draft) {
    return (
      <form
        className="mx-auto max-w-xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(draft);
        }}
      >
        <SelectField
          label="Platform"
          value={draft.platform}
          onChange={(e) => {
            const platform = e.target.value;
            const known = SOCIAL_PLATFORMS.find((p) => p.id === platform);
            setDraft({
              ...draft,
              platform,
              label: known?.label ?? draft.label,
            });
          }}
        >
          {SOCIAL_PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Label"
          required
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
        />
        <TextField
          label="URL"
          placeholder="https://"
          value={draft.url}
          onChange={(e) => setDraft({ ...draft, url: e.target.value })}
        />
        <Toggle
          label="Show on the public site"
          checked={draft.active}
          onChange={(active) => setDraft({ ...draft, active })}
        />
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save social"}
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
                if (confirm("Remove this social from the footer?")) {
                  remove.mutate(draft.id as number);
                }
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          ) : null}
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="max-w-lg text-sm text-muted">
          These links appear in the footer and on the story page. Leave a URL
          blank and hide it until you have one.
        </p>
        <Button size="sm" onClick={() => setDraft({ ...empty })}>
          <Plus className="size-4" />
          Add social
        </Button>
      </div>
      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-[1.5rem] bg-elevated shadow-[var(--shadow-border)]">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setDraft(item)}
              className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-fg/5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.label}</p>
                <p className="truncate text-xs text-muted">
                  {item.url || "No URL yet"}
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
