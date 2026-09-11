type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>;
  run: () => Promise<unknown>;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
  exec: (query: string) => Promise<unknown>;
  batch: <T = unknown>(statements: D1PreparedStatement[]) => Promise<T[]>;
};

declare module "cloudflare:workers" {
  export const env: {
    DB: D1Database;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
    GROK_AUTH_CLIENT_ID?: string;
    GROK_AUTH_CLIENT_SECRET?: string;
    GROK_AUTH_ISSUER?: string;
    VITE_AUTH_ENABLED?: string;
    GROK_PROJECT_ID?: string;
    RESEND_API_KEY?: string;
    RESET_FROM_EMAIL?: string;
    [key: string]: string | D1Database | undefined;
  };
}
