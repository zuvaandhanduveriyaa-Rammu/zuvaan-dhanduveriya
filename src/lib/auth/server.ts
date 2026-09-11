/**
 * Self-hosted Better Auth for THIS app (server-only).
 *
 * The app runs its own Better Auth at `/api/auth/*`, so the session cookie stays
 * on this app's own origin. Sign-in federates to the shared **Grok auth broker**
 * (`GROK_AUTH_ISSUER`) via the `genericOAuth` plugin.
 *
 * Database:
 *   - Cloudflare Worker: D1 binding `DB` (SQLite).
 *   - Local `npm run dev`: the same schema on `.data/zuvaan.sqlite` (node:sqlite).
 *
 * NEVER import this from client code. The client uses `@/lib/auth/client`.
 */
import { betterAuth, APIError } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { bearer, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { ensureDbReady, getAuthDatabase } from "../db";
import { env, isCloudflareWorker } from "../env.server.ts";
import { emailAndPasswordEnabled } from "./email-password";
import { GATE_PROVIDER_ID, gateIdentitySessions } from "./gate-session.server";
import { GROK_PROVIDERS } from "./providers";
import {
  resetEmailConfigured,
  sendPasswordResetEmail,
} from "../mail/send-reset";
import {
  GROK_ISSUER_DEFAULT,
  PREVIEW_ALLOWED_HOSTS,
  PREVIEW_CLIENT_ID,
  PREVIEW_CLIENT_SECRET,
} from "./preview";

if (!isCloudflareWorker()) void ensureDbReady();

/**
 * Preview secret must outlive module reloads: the local SQLite file (and its
 * session rows) survives HMR, so an HMR re-eval of this file must NOT mint a
 * new signing secret or every existing session becomes invalid mid-dev.
 */
const globalAuthRef = globalThis as typeof globalThis & {
  __grokAuthPreviewSecret__?: string;
};
function previewAuthSecret(): string {
  globalAuthRef.__grokAuthPreviewSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__grokAuthPreviewSecret__;
}

const authDisabled = env("VITE_AUTH_ENABLED") === "false";

const grokIssuer = env("GROK_AUTH_ISSUER") ?? GROK_ISSUER_DEFAULT;
const grokClientId = env("GROK_AUTH_CLIENT_ID") ?? PREVIEW_CLIENT_ID;
const grokClientSecret = env("GROK_AUTH_CLIENT_SECRET") ?? PREVIEW_CLIENT_SECRET;

/** True when federated sign-in is active (real auth is enforced). */
export const authConfigured =
  !authDisabled && Boolean(grokClientId && grokClientSecret);

const explicitBaseURL = env("BETTER_AUTH_URL");
const previewAllowedHosts: string[] = [...PREVIEW_ALLOWED_HOSTS];
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];
const baseURL = explicitBaseURL ?? {
  allowedHosts: [...previewAllowedHosts, "localhost", "127.0.0.1", "[::1]"],
  protocol: "auto" as const,
  fallback: "http://localhost:8080",
};

const trustedOrigins: string[] = explicitBaseURL
  ? [
      explicitBaseURL,
      explicitBaseURL.replace("://www.", "://"),
      explicitBaseURL.replace("://", "://www."),
      ...LOCAL_DEV_ORIGINS,
    ].filter((origin, i, all) => all.indexOf(origin) === i)
  : [
      ...previewAllowedHosts,
      ...previewAllowedHosts.flatMap((host) => [`https://${host}`, `http://${host}`]),
      ...LOCAL_DEV_ORIGINS,
    ];

const issuerBase = grokIssuer.replace(/\/+$/, "");
const grokAuthorizationUrl = `${issuerBase}/api/auth/oauth2/authorize`;
const grokTokenUrl = `${issuerBase}/api/auth/oauth2/token`;
const grokUserInfoUrl = `${issuerBase}/api/auth/oauth2/userinfo`;

// `grok_preview` only allows redirect URIs on `*.grok-sandbox.com`. Using it
// against zuvaandhanduveriya.com returns "Invalid redirect URI". Keep Google/X
// off on the live farm unless a real GROK_AUTH_CLIENT_ID is set.
const previewClientOnProduction =
  grokClientId === PREVIEW_CLIENT_ID &&
  Boolean(explicitBaseURL) &&
  !/grok-sandbox\.com/i.test(explicitBaseURL ?? "");

const grokOAuthPlugin =
  authConfigured && !previewClientOnProduction
    ? genericOAuth({
        config: GROK_PROVIDERS.map(({ providerId, idp }) => ({
          providerId,
          clientId: grokClientId as string,
          clientSecret: grokClientSecret as string,
          authorizationUrl: grokAuthorizationUrl,
          tokenUrl: grokTokenUrl,
          userInfoUrl: grokUserInfoUrl,
          scopes: ["openid", "profile", "email"],
          authorizationUrlParams: { idp, prompt: "login" },
        })),
      })
    : null;

/** Session token cookie name — also read by the live-preview popup completion page. */
export const SESSION_TOKEN_COOKIE = "__Host-grok-auth.session_token";

function resolveAuthSecret(): string {
  const configured = env("BETTER_AUTH_SECRET");
  if (configured) return configured;
  // Workers forbid crypto.randomBytes at module scope. A missing secret must
  // not 500 the public farm. Set BETTER_AUTH_SECRET in production.
  if (isCloudflareWorker()) {
    return "set-BETTER_AUTH_SECRET-in-worker-secrets";
  }
  return previewAuthSecret();
}

export const auth = betterAuth({
  baseURL,
  secret: resolveAuthSecret(),
  database: getAuthDatabase(),

  trustedOrigins,

  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: [
        ...GROK_PROVIDERS.map((p) => p.providerId),
        GATE_PROVIDER_ID,
      ],
      requireLocalEmailVerified: false,
    },
  },

  session: { cookieCache: { enabled: true, maxAge: 300 } },

  ...(emailAndPasswordEnabled
    ? {
        emailAndPassword: {
          enabled: true,
          minPasswordLength: 8,
          sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
            await sendPasswordResetEmail({
              to: user.email,
              name: user.name,
              url,
            });
          },
        },
      }
    : {}),

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/request-password-reset") return;
      if (!resetEmailConfigured()) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Reset email is not connected yet. If this is your first visit, create a staff login instead.",
        });
      }
    }),
  },

  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-grok-auth.session_data" },
      account_data: { name: "__Host-grok-auth.account_data" },
      dont_remember: { name: "__Host-grok-auth.dont_remember" },
    },
  },

  plugins: [
    gateIdentitySessions(),
    ...(grokOAuthPlugin ? [grokOAuthPlugin] : []),
    bearer(),
    tanstackStartCookies(),
  ],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

export { GROK_PROVIDERS } from "./providers";
