declare module "cloudflare:workers" {
  export const env: {
    DATABASE_URL?: string;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
    GROK_AUTH_CLIENT_ID?: string;
    GROK_AUTH_CLIENT_SECRET?: string;
    GROK_AUTH_ISSUER?: string;
    VITE_AUTH_ENABLED?: string;
    GROK_PROJECT_ID?: string;
    [key: string]: string | undefined;
  };
}
