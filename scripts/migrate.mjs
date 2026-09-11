#!/usr/bin/env node
/**
 * Apply pending files in ../migrations to the local SQLite file used by
 * `npm run dev` (`.data/zuvaan.sqlite`). Production D1 is migrated with Wrangler:
 *
 *   npx wrangler d1 migrations apply zuvaan --remote
 *
 * or, file by file:
 *
 *   npx wrangler d1 execute zuvaan --remote --file=migrations/0001_auth.sql
 *   npx wrangler d1 execute zuvaan --remote --file=migrations/0002_farm_cms.sql
 *   npx wrangler d1 execute zuvaan --remote --file=migrations/0003_socials_partners.sql
 *   npx wrangler d1 execute zuvaan --remote --file=migrations/0004_plain_dashes.sql
 *   npx wrangler d1 execute zuvaan --remote --file=migrations/0005_staff_emails.sql
 *
 * Cloudflare builds do not run this script.
 */
import { readdir, readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { pendingMigrations } from "./migration-plan.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "migrations");
const dbPath = join(root, ".data", "zuvaan.sqlite");

async function main() {
  let entries;
  try {
    entries = await readdir(migrationsDir);
  } catch {
    console.log("[migrate] no migrations/ directory — nothing to do.");
    return;
  }
  if (pendingMigrations(entries, []).length === 0) {
    console.log("[migrate] no migrations — nothing to do.");
    return;
  }

  await mkdir(join(root, ".data"), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(
    "create table if not exists _migrations (name text primary key, applied_at text not null default (datetime('now')))",
  );
  const applied = db
    .prepare("select name from _migrations")
    .all()
    .map((r) => r.name);

  let count = 0;
  for (const { name } of pendingMigrations(entries, applied)) {
    const text = await readFile(join(migrationsDir, name), "utf8");
    try {
      db.exec("BEGIN");
      db.exec(text);
      db.prepare("insert into _migrations (name) values (?)").run(name);
      db.exec("COMMIT");
    } catch (err) {
      console.error(`[migrate] error applying ${name}`);
      try {
        db.exec("ROLLBACK");
      } catch {
        // keep the original error
      }
      throw err;
    }
    console.log(`[migrate] applied ${name}`);
    count += 1;
  }
  db.close();
  console.log(
    count
      ? `[migrate] done — ${count} migration(s) applied to ${dbPath}`
      : `[migrate] up to date (${dbPath}).`,
  );
  console.log(
    "[migrate] production D1: npx wrangler d1 migrations apply zuvaan --remote",
  );
}

main().catch((err) => {
  console.error("[migrate] failed:", err?.message || err);
  process.exit(1);
});
