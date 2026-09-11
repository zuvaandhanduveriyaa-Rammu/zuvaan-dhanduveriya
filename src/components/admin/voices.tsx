import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageField } from "@/components/admin/image-field";
import { AreaField, SelectField, TextField } from "@/components/admin/field";
import { useInvalidateCatalog } from "@/components/catalog";
import { Button } from "@/components/ui/button";
import { deleteVoice, listAdminVoices, saveVoice } from "@/lib/catalog/admin";
import { VOICE_TONES, type Testimonial } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const empty: Omit<Testimonial, "id"> & { id: number | null } = {
  id: null,
  quote: "",
  name: "",
  role: "",
  tone: "sand",
  image: null,
  status: "published",
  sortOrder: 100,
};

export function AdminVoices() {
  const client = useQueryClient();
  const invalidate = useInvalidateCatalog();
  const list = useQuery({ queryKey: ["admin-voices"], queryFn: () => listAdminVoices() });
  const [draft, setDraft] = useState<(typeof empty) | null>(null);

  const save = useMutation({
    mutationFn: (data: typeof empty) => saveVoice({ data }),
    onSuccess: async () => {
      toast.success("Voice saved.");
      setDraft(null);
      await client.invalidateQueries({ queryKey: ["admin-voices"] });
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteVoice({ data: id }),
    onSuccess: async () => {
      toast.success("Voice removed.");
      setDraft(null);
      await client.invalidateQueries({ queryKey: ["admin-voices"] });
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
          value={draft.image ?? ""}
          onChange={(image) => setDraft({ ...draft, image: image || null, tone: image ? "photo" : draft.tone })}
          label="Portrait (optional)"
        />
        <div className="grid gap-3">
          <AreaField
            label="Quote"
            required
            value={draft.quote}
            onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Name"
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <TextField
              label="Role"
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              placeholder="Chef, Addu"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Card tone"
              value={draft.tone}
              onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
            >
              {VOICE_TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Status"
              value={draft.status}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  status: e.target.value as Testimonial["status"],
                })
              }
            >
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="hidden">Hidden</option>
            </SelectField>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save voice"}
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
                  if (confirm("Remove this voice?")) remove.mutate(draft.id as number);
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
          Pending notes wait here until you publish them onto the ring.
        </p>
        <Button size="sm" onClick={() => setDraft({ ...empty })}>
          <Plus className="size-4" />
          New voice
        </Button>
      </div>
      <ul className="mt-6 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setDraft(item)}
              className="w-full rounded-[1.25rem] bg-elevated px-4 py-4 text-left shadow-[var(--shadow-border)] hover:bg-fg/5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  {item.name}
                  <span className="ml-2 font-normal text-muted">{item.role}</span>
                </p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[0.65rem] tracking-wider uppercase",
                    item.status === "published" && "bg-sage/20 text-sage",
                    item.status === "pending" && "bg-sand/20 text-sand",
                    item.status === "hidden" && "bg-fg/10 text-subtle",
                  )}
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{item.quote}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
