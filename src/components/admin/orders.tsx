import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listAdminOrders, setOrderStatus } from "@/lib/catalog/admin";
import { ORDER_STATUSES } from "@/lib/catalog/types";
import { formatMvr } from "@/lib/money";

export function AdminOrders() {
  const client = useQueryClient();
  const list = useQuery({ queryKey: ["admin-orders"], queryFn: () => listAdminOrders() });
  const setStatus = useMutation({
    mutationFn: (data: { id: number; status: string }) => setOrderStatus({ data }),
    onSuccess: async () => {
      toast.success("Order updated.");
      await client.invalidateQueries({ queryKey: ["admin-orders"] });
      await client.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = list.data ?? [];

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        No crates yet. When kitchens place an order, they land here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((order) => (
        <li
          key={order.id}
          className="rounded-[1.5rem] bg-elevated p-5 shadow-[var(--shadow-border)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{order.customerName}</p>
              <p className="text-xs text-muted">
                {order.phone}
                {order.island ? ` · ${order.island}` : ""}
              </p>
            </div>
            <select
              value={order.status}
              onChange={(e) =>
                setStatus.mutate({ id: order.id, status: e.target.value })
              }
              className="h-9 rounded-full bg-bg px-3 text-xs uppercase tracking-wider text-fg shadow-[var(--shadow-border)] outline-none"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-muted">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.qty} {item.unit} {item.name}
                </span>
                <span className="tabular-nums text-fg">
                  {formatMvr(item.qty * item.unitPriceMvr)}
                </span>
              </li>
            ))}
          </ul>
          {order.notes ? (
            <p className="mt-3 text-sm text-muted">{order.notes}</p>
          ) : null}
          <p className="mt-3 text-right text-sm font-medium tabular-nums">
            {formatMvr(order.totalMvr)}
          </p>
        </li>
      ))}
    </ul>
  );
}
