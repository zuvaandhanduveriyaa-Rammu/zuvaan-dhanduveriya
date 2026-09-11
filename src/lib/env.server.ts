import { env as workerEnv } from "cloudflare:workers";

export function env(key: string): string | undefined {
  const fromWorker = workerEnv?.[key];
  if (typeof fromWorker === "string" && fromWorker.trim()) return fromWorker.trim();
  const v = typeof process !== "undefined" ? process.env[key]?.trim() : undefined;
  return v || undefined;
}

/**
 * Workspace preview vs deployed app. The deployer writes GROK_PROJECT_ID on
 * every publish; the sandbox preview never has it. Single source of truth for
 * the split — gate audience, gate endpoints and connector-token semantics all
 * key off this predicate.
 */
export function isWorkspacePreview(): boolean {
  return !env("GROK_PROJECT_ID");
}
