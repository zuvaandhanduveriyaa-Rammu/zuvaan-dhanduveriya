import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { listStaff, setStaffActive } from "@/lib/catalog/admin";
import { DEPUTY_EMAIL, OWNER_EMAIL } from "@/lib/catalog/staff";

export function AdminAccess() {
  const client = useQueryClient();
  const list = useQuery({ queryKey: ["admin-staff"], queryFn: () => listStaff() });
  const save = useMutation({
    mutationFn: (data: { email: string; active: boolean }) =>
      setStaffActive({ data }),
    onSuccess: async (_, data) => {
      toast.success(data.active ? "Access restored." : "Access removed.");
      await client.invalidateQueries({ queryKey: ["admin-staff"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const people = list.data ?? [];

  return (
    <div>
      <p className="max-w-lg text-sm text-muted">
        Only these two Gmail addresses can open the desk. You are the owner.
        You can remove the second desk. Nobody else gets in.
      </p>
      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-[1.5rem] bg-elevated shadow-[var(--shadow-border)]">
        {people.map((person) => {
          const owner = person.email === OWNER_EMAIL;
          return (
            <li
              key={person.email}
              className="flex items-center gap-4 px-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{person.email}</p>
                <p className="text-xs text-muted">
                  {owner
                    ? "Owner. Cannot be removed."
                    : person.active
                      ? "Second desk. Live."
                      : "Second desk. No access."}
                </p>
              </div>
              {owner ? (
                <p className="text-[0.7rem] text-subtle">Locked</p>
              ) : (
                <Button
                  size="sm"
                  variant={person.active ? "ghost" : "primary"}
                  className={person.active ? "text-sand" : undefined}
                  disabled={save.isPending}
                  onClick={() =>
                    save.mutate({
                      email: DEPUTY_EMAIL,
                      active: !person.active,
                    })
                  }
                >
                  {person.active ? "Remove access" : "Restore access"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
