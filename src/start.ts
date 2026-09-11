import { createStart, createMiddleware } from "@tanstack/react-start";
import grokPwaMiddleware from "../server/middleware/grok-pwa";

/**
 * PWA chrome for the Worker. Call TanStack `next()` exactly once — a second
 * call disposes the SSR stream and h3 turns that into a 500 HTTPError.
 */
const grokPwa = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url);
  const event = {
    url,
    req: { method: request.method, headers: request.headers },
  };

  const path = url.pathname;
  const method = (request.method ?? "GET").toUpperCase();
  const shortCircuit =
    method === "GET" &&
    (path === "/__grok/manifest.webmanifest" ||
      path === "/__grok/manifest.json" ||
      url.search.includes("install=1"));

  if (shortCircuit) {
    try {
      const early = await grokPwaMiddleware(event, async () => {
        throw new Error("pwa short-circuit should not render the app");
      });
      if (early instanceof Response) return early;
    } catch (err) {
      console.error("[pwa] short-circuit failed", err);
    }
  }

  const inner = await next();
  try {
    const res = inner.response;
    if (!(res instanceof Response) || !res.body) return inner;
    const wrapped = await grokPwaMiddleware(event, async () => res);
    if (wrapped instanceof Response) return wrapped;
  } catch (err) {
    console.error("[pwa] inject skipped", err);
  }
  return inner;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [grokPwa],
}));
