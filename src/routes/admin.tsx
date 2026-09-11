import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureAdmin } from "@/lib/catalog/admin";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  const gate = useQuery({
    queryKey: ["admin-gate", user?.id],
    queryFn: () => ensureAdmin(),
    enabled: Boolean(user),
    retry: false,
  });

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg text-fg">
        <div className="h-10 w-48 animate-pulse rounded-full bg-fg/10" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;

  if (gate.isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg text-fg">
        <p className="text-sm text-muted">Opening the desk…</p>
      </main>
    );
  }

  if (gate.isError || (gate.data && !gate.data.isAdmin)) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
        <div className="max-w-md text-center">
          <p className="kicker">No access</p>
          <h1 className="mt-4 font-sans text-3xl font-medium tracking-tight">
            This desk is closed
            <br />
            <em className="font-serif font-normal italic">to this account</em>
          </h1>
          <p className="mt-4 text-sm text-muted">
            Superadmin is only for the farm owner. You are signed in, but you
            do not have access.
          </p>
          <Link
            to="/"
            className="mt-8 inline-block text-sm text-sage hover:text-fg"
          >
            Back to the farm
          </Link>
        </div>
      </main>
    );
  }

  return <AdminShell isOwner={gate.data?.isOwner === true} />;
}
