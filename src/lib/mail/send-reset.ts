import { env } from "@/lib/env.server.ts";

export function resetEmailConfigured(): boolean {
  return Boolean(env("RESEND_API_KEY"));
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  url: string;
}) {
  const key = env("RESEND_API_KEY");
  if (!key) {
    throw new Error(
      "Reset email is not connected yet. If this is your first visit, create a staff login instead.",
    );
  }
  const from =
    env("RESET_FROM_EMAIL") ??
    "Zuvaan Dhanduveriya <onboarding@resend.dev>";
  const name = opts.name?.trim() || "there";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: "Reset your Zuvaan staff password",
      text: `Hello ${name},\n\nReset your staff desk password:\n${opts.url}\n\nThis link expires in one hour. If you did not ask for this, ignore the email.\n`,
      html: `<p>Hello ${escapeHtml(name)},</p><p><a href="${escapeHtml(opts.url)}">Set a new staff password</a></p><p>This link expires in one hour. If you did not ask for this, ignore the email.</p>`,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[auth] reset email failed", res.status, detail);
    throw new Error("Could not send the reset email. Try again in a moment.");
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "\u0026amp;";
      case "<":
        return "\u0026lt;";
      case ">":
        return "\u0026gt;";
      case '"':
        return "\u0026quot;";
      default:
        return "\u0026#39;";
    }
  });
}
