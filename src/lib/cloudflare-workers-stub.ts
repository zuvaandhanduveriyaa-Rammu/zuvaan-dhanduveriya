/**
 * Local `vite dev` stand-in for `cloudflare:workers`.
 * Production Worker builds use the real module from the Cloudflare plugin.
 */
export const env = new Proxy(Object.create(null) as Record<string, string | undefined>, {
  get(_target, prop) {
    if (typeof prop !== "string") return undefined;
    return typeof process !== "undefined" ? process.env[prop] : undefined;
  },
});
