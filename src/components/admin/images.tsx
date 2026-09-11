import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageField } from "@/components/admin/image-field";
import { useInvalidateCatalog } from "@/components/catalog";
import { listAdminImages, saveSiteImage } from "@/lib/catalog/admin";
import { IMAGE_SLOTS } from "@/lib/catalog/slots";

export function AdminImages() {
  const client = useQueryClient();
  const invalidate = useInvalidateCatalog();
  const list = useQuery({ queryKey: ["admin-images"], queryFn: () => listAdminImages() });
  const images = list.data ?? {};

  const save = useMutation({
    mutationFn: (data: { slot: string; url: string }) => saveSiteImage({ data }),
    onSuccess: async () => {
      toast.success("Image updated on the site.");
      await client.invalidateQueries({ queryKey: ["admin-images"] });
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = ["Home", "Pages"] as const;

  return (
    <div className="space-y-10">
      <p className="text-sm text-muted">
        Every photograph on the public site lives here. Replace one and the
        live pages pick it up.
      </p>
      {groups.map((group) => (
        <section key={group}>
          <p className="kicker">{group}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {IMAGE_SLOTS.filter((s) => s.group === group).map((slot) => (
              <div
                key={slot.key}
                className="rounded-[1.5rem] bg-elevated p-3 shadow-[var(--shadow-border)]"
              >
                <ImageField
                  label={slot.label}
                  value={images[slot.key] || slot.fallback}
                  onChange={(url) => {
                    if (!url) return;
                    save.mutate({ slot: slot.key, url });
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
