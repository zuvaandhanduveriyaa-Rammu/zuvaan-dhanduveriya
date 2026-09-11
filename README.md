# Zuvaan Dhanduveriya

Island-grown farm site for **Ramsey Hussain** and Fresh Yield Pvt. Ltd. on Meedhoo, Addu City, Maldives.

Public pages for the farm, produce, visits, and crate orders. A Superadmin desk to change photographs, prices, socials, partner logos, and voices.

## Stack

- TanStack Start + React
- Tailwind CSS
- Cloudflare Workers in production
- Postgres: Neon (HTTP serverless driver) in production, PGLite in local preview
- Better Auth (Google, X, email)

## Run locally

```bash
npm install
npm run dev
```

The app listens on port 8080 with an in-memory PGLite database. Superadmin is only `zuvaan.dhanduveriyaa@gmail.com` (owner) and `mmxinthi@gmail.com`.

## Cloudflare (production)

Dashboard **Create application** (Git integration):

| Field | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Or from a machine with Wrangler logged in:

```bash
npm run deploy
```

### Secrets (Workers Settings → Variables and Secrets)

Paste these as **secrets**. Do not commit them.

| Name | What to paste |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string (`postgres://...` or `postgresql://...`) |
| `BETTER_AUTH_SECRET` | A long random string (e.g. `openssl rand -hex 32`) |
| `GROK_AUTH_CLIENT_ID` | Grok auth broker client id (Google/X federation). Optional if you only use email login. |
| `GROK_AUTH_CLIENT_SECRET` | Grok auth broker client secret. Optional if you only use email login. |

`BETTER_AUTH_URL` is already set in `wrangler.jsonc` to `https://zuvaandhanduveriya.com`. Change it there if the live host is different (for example the first `*.workers.dev` URL).

Google and X in this app go through the Grok auth broker (`GROK_AUTH_*`), not native Google/X client ids. Email/password Superadmin works with only `DATABASE_URL` + `BETTER_AUTH_SECRET`.

### One-time Neon migrations

Cloudflare builds do **not** migrate. From your laptop, once, against Neon:

```bash
DATABASE_URL='postgres://...' npm run db:migrate
```

Safe to re-run. Uses Node `pg` (TCP), which is why it cannot run inside the Worker.

### DNS for zuvaandhanduveriya.com

After the Worker is live, in Cloudflare **Workers & Pages → zuvaan-dhanduveriya → Settings → Domains**, add:

- `zuvaandhanduveriya.com`
- `www.zuvaandhanduveriya.com`

If the domain is already on this Cloudflare account, the dashboard writes the records. If DNS is elsewhere:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `www` | `zuvaan-dhanduveriya.<your-account>.workers.dev` | yes, if on Cloudflare |
| CNAME / ALIAS | `@` | `zuvaan-dhanduveriya.<your-account>.workers.dev` | yes, if on Cloudflare |

Point `www` at the apex (or the other way around) so sessions stay on one host. `__Host-` cookies do not work across `www` and the bare domain.

## Farm

Dhandamathi, Meedhoo, Addu City, 19010, Maldives.

Open daily, 8:00 to 18:00.
