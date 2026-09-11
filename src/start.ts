import { createStart, createMiddleware } from "@tanstack/react-start";
import grokPwaMiddleware from "../server/middleware/grok-pwa";

const grokPwa = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url);
  const result = await grokPwaMiddleware(
    {
      url,
      req: { method: request.method, headers: request.headers },
    },
    async () => {
      const inner = await next();
      return inner.response;
    },
  );
  if (result instanceof Response) return result;
  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [grokPwa],
}));
