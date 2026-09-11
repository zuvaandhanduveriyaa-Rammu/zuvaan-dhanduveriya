import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteImage } from "@/components/site-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { submitNewPassword } from "@/lib/auth/client";

type ResetSearch = { token?: string; error?: string };

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token, error: searchError } = Route.useSearch();
  const [error, setError] = useState<string | null>(
    searchError ? "This reset link is invalid or expired." : null,
  );
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("This reset link is missing. Request a new one from the staff desk.");
      return;
    }
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error: err } = await submitNewPassword(password, token);
      if (err) throw new Error(err.message ?? "Could not save this password.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this password.");
      setBusy(false);
    }
  }

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-bg text-fg">
      <SiteImage
        slot="hero"
        fallback="/images/farm-landscape.jpg"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-bg/72" />
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16">
        <div className="mb-8 self-start">
          <Logo />
        </div>
        <div className="rounded-[1.75rem] bg-surface/92 p-6 shadow-[var(--shadow-glass)] backdrop-blur-xl sm:p-8">
          <p className="kicker">Staff desk</p>
          <h1 className="mt-3 font-sans text-3xl font-medium tracking-tight">
            New
            <br />
            <em className="font-serif font-normal italic">password</em>
          </h1>
          {done ? (
            <div className="mt-6 grid gap-4">
              <p className="text-sm text-muted">
                Your staff password is updated. Open the desk with the farm
                Gmail and the new password.
              </p>
              <Link
                to="/login"
                className="pressable inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-[0.95rem] font-medium text-primary-fg hover:bg-fg"
              >
                Open the desk
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted">
                Choose a new password for this farm Gmail. The link works once
                and expires in an hour.
              </p>
              <form onSubmit={onSubmit} className="mt-6 grid gap-3">
                <label className="grid gap-2 text-xs text-muted">
                  New password
                  <Input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </label>
                <label className="grid gap-2 text-xs text-muted">
                  Confirm password
                  <Input
                    name="confirm"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Type it again"
                    autoComplete="new-password"
                  />
                </label>
                {error ? <p className="text-sm text-sand">{error}</p> : null}
                <Button type="submit" size="lg" disabled={busy || !token}>
                  {busy ? "Saving…" : "Save password"}
                </Button>
              </form>
              <Link
                to="/login"
                className="mt-4 inline-block text-xs text-muted hover:text-fg"
              >
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
