import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { SiteImage } from "@/components/site-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import {
  authClient,
  authEnabled,
  grokOAuthAvailable,
  GROK_PROVIDERS,
  requestPasswordReset,
  signIn,
} from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg text-fg">
        <div className="h-10 w-40 animate-pulse rounded-full bg-fg/10" />
      </main>
    );
  }
  if (user) return <Navigate to="/admin" />;
  return <LoginForm />;
}

function LoginForm() {
  const [mode, setMode] = useState<"in" | "up" | "forgot" | "sent">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showOAuth, setShowOAuth] = useState(false);

  useEffect(() => {
    setShowOAuth(grokOAuthAvailable());
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "").trim() || "Staff";
    try {
      if (mode === "forgot") {
        const { error: err } = await requestPasswordReset(email);
        if (err) {
          throw new Error(
            err.message ??
              "Could not start a password reset. First visit: create a staff login.",
          );
        }
        setMode("sent");
        setBusy(false);
        return;
      }
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/admin",
        });
        if (err) throw new Error(err.message ?? "Could not create this desk.");
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/admin",
        });
        if (err) {
          const raw = err.message ?? "Could not sign in.";
          if (/invalid email or password/i.test(raw)) {
            throw new Error(
              "Invalid email or password. First visit: create a staff login. Or reset the password.",
            );
          }
          throw new Error(raw);
        }
      }
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
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
            Superadmin
            <br />
            <em className="font-serif font-normal italic">for the farm</em>
          </h1>
          <p className="mt-3 text-sm text-muted">
            {mode === "forgot" || mode === "sent"
              ? "We will email a reset link to the farm Gmail if that desk exists."
              : "Use a farm Gmail and a password. First visit, create the staff login. Any other email sees no access."}
          </p>

          {authEnabled && showOAuth && mode !== "forgot" && mode !== "sent" ? (
            <div className="mt-6 grid gap-2">
              {GROK_PROVIDERS.map((p) => (
                <button
                  key={p.providerId}
                  type="button"
                  onClick={() => signIn(p.providerId, { callbackURL: "/admin" })}
                  className="h-11 w-full rounded-full bg-elevated text-sm text-fg shadow-[var(--shadow-border)] hover:bg-fg/8"
                >
                  Continue with {p.label}
                </button>
              ))}
            </div>
          ) : null}

          {authEnabled && showOAuth && mode !== "forgot" && mode !== "sent" ? (
            <div className="mt-6 flex items-center gap-3 text-[0.7rem] tracking-wider text-subtle uppercase">
              <span className="h-px flex-1 bg-border" />
              or email
              <span className="h-px flex-1 bg-border" />
            </div>
          ) : null}

          {!authEnabled ? (
            <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
          ) : null}

          {mode === "sent" ? (
            <div className="mt-6 grid gap-4">
              <p className="text-sm text-muted">
                If that Gmail has a desk, check the inbox and spam for the reset
                link. It expires in one hour.
              </p>
              <Button type="button" size="lg" onClick={() => setMode("in")}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className={showOAuth ? "mt-5 grid gap-3" : "mt-6 grid gap-3"}
            >
              {mode === "up" ? (
                <label className="grid gap-2 text-xs text-muted">
                  Name
                  <Input name="name" placeholder="Name" autoComplete="name" />
                </label>
              ) : null}
              <label className="grid gap-2 text-xs text-muted">
                Email
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="farm Gmail"
                  autoComplete="email"
                />
              </label>
              {mode !== "forgot" ? (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-xs text-muted">
                    <label htmlFor="staff-password">Password</label>
                    {mode === "in" ? (
                      <button
                        type="button"
                        className="text-xs text-muted hover:text-fg"
                        onClick={() => {
                          setError(null);
                          setMode("forgot");
                        }}
                      >
                        Forgot password?
                      </button>
                    ) : null}
                  </div>
                  <Input
                    id="staff-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    autoComplete={mode === "up" ? "new-password" : "current-password"}
                  />
                </div>
              ) : null}
              {error ? <p className="text-sm text-sand">{error}</p> : null}
              <Button type="submit" size="lg" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "up"
                    ? "Create staff login"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Open the desk"}
              </Button>
            </form>
          )}

          {mode !== "sent" ? (
            <button
              type="button"
              className="mt-4 text-xs text-muted hover:text-fg"
              onClick={() => {
                setError(null);
                setMode((m) => (m === "in" ? "up" : "in"));
              }}
            >
            {mode === "forgot"
              ? "Back to sign in"
              : mode === "up"
                ? "Already have a desk?"
                : "Need a staff login?"}
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
