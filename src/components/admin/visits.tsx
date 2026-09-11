import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listAdminVisits, setVisitStatus } from "@/lib/catalog/admin";

const STATUSES = ["new", "confirmed", "done", "cancelled"] as const;

export function AdminVisits() {
  const client = useQueryClient();
  const list = useQuery({ queryKey: ["admin-visits"], queryFn: () => listAdminVisits() });
  const setStatus = useMutation({
    mutationFn: (data: { id: number; status: string }) => setVisitStatus({ data }),
    onSuccess: async () => {
      toast.success("Visit updated.");
      await client.invalidateQueries({ queryKey: ["admin-visits"] });
      await client.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = list.data ?? [];
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        No visit requests yet. The public form on Visit writes here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((v) => (
        <li
          key={v.id}
          className="rounded-[1.5rem] bg-elevated p-5 shadow-[var(--shadow-border)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{v.name}</p>
              <p className="text-xs text-muted">
                {v.phone}
                {v.island ? ` · ${v.island}` : ""} · {v.party} people
                {v.visitDate ? ` · ${v.visitDate}` : ""}
              </p>
            </div>
            <select
              value={v.status}
              onChange={(e) => setStatus.mutate({ id: v.id, status: e.target.value })}
              className="h-9 rounded-full bg-bg px-3 text-xs uppercase tracking-wider text-fg shadow-[var(--shadow-border)] outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-sm text-muted">
            {v.interest}
            {v.notes ? `. ${v.notes}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
