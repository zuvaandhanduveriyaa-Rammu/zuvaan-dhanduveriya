# Zuvaan Dhanduveriya

Island-grown farm site for **Ramsey Hussain** and Fresh Yield Pvt. Ltd. on Meedhoo, Addu City, Maldives.

Public pages for the farm, produce, visits, and crate orders. A Superadmin desk to change photographs, prices, socials, partner logos, and voices.

## Stack

- TanStack Start + React
- Tailwind CSS
- Cloudflare Workers in production
- Cloudflare D1 (SQLite) in production, local SQLite file for `npm run dev`
- Better Auth (Google, X, email)

## Run locally

```bash
npm install
npm run dev
```

The app listens on port 8080 with a local SQLite file at `.data/zuvaan.sqlite`. Superadmin is only `zuvaan.dhanduveriyaa@gmail.com` (owner) and `mmxinthi@gmail.com`.

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

### 1. Create the D1 database

From a machine logged into Wrangler (`npx wrangler login`):

```bash
npx wrangler d1 create zuvaan
```

Copy the `database_id` from the output.

**Dashboard instead:** Cloudflare dashboard → **Storage & databases** → **D1 SQL database** → **Create** → name `zuvaan`. Open the database → copy **Database ID**.

### 2. Bind it in wrangler.jsonc

In `wrangler.jsonc`, under `d1_databases`, set:

```jsonc
"binding": "DB",
"database_name": "zuvaan",
"database_id": "<paste the id from step 1>"
```

Commit and push that change so Git deploys pick up the binding.

**Dashboard instead:** Workers & Pages → **zuvaan-dhanduveriya** → **Settings** → **Bindings** → **Add** → **D1 database**. Variable name `DB`, database `zuvaan`. You still need the same `database_id` in `wrangler.jsonc` for `npx wrangler deploy` / Git deploys.

### 3. Apply migrations

Do this once after the database exists. Cloudflare builds do **not** migrate.

```bash
npx wrangler d1 migrations apply zuvaan --remote
```

Or file by file:

```bash
npx wrangler d1 execute zuvaan --remote --file=migrations/0001_auth.sql
npx wrangler d1 execute zuvaan --remote --file=migrations/0002_farm_cms.sql
npx wrangler d1 execute zuvaan --remote --file=migrations/0003_socials_partners.sql
npx wrangler d1 execute zuvaan --remote --file=migrations/0004_plain_dashes.sql
npx wrangler d1 execute zuvaan --remote --file=migrations/0005_staff_emails.sql
```

**Dashboard instead:** D1 → **zuvaan** → **Console**, paste and run each file in `migrations/` in order (0001 then 0002 … 0005). Skip `migrations/auth/` (duplicate of 0001).

Local preview applies the same files automatically to `.data/zuvaan.sqlite`. You can also run:

```bash
npm run db:migrate
```

### Secrets (Workers Settings → Variables and Secrets)

Paste these as **secrets**. Do not commit them. There is no `DATABASE_URL`.

| Name | What to paste |
|---|---|
| `BETTER_AUTH_SECRET` | A long random string (e.g. `openssl rand -hex 32`) |
| `GROK_AUTH_CLIENT_ID` | Grok auth broker client id (Google/X federation). Optional if you only use email login. |
| `GROK_AUTH_CLIENT_SECRET` | Grok auth broker client secret. Optional if you only use email login. |

`BETTER_AUTH_URL` is already set in `wrangler.jsonc` to `https://zuvaandhanduveriya.com`. Change it there if the live host is different (for example the first `*.workers.dev` URL).

Google and X in this app go through the Grok auth broker (`GROK_AUTH_*`), not native Google/X client ids. Email/password Superadmin works with D1 + `BETTER_AUTH_SECRET`.

You can delete any leftover `DATABASE_URL` Worker secret. It is unused.

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
