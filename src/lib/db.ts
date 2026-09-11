import { pendingMigrations } from "../../scripts/migration-plan.mjs";
import { env as workerEnv } from "cloudflare:workers";
import { isCloudflareWorker } from "./env.server.ts";

/** Which database backend is active. */
export type DbSource = "d1" | "sqlite";

/** On-disk SQLite used by local `npm run dev` (same dialect as production D1). */
export const LOCAL_SQLITE_PATH = ".data/zuvaan.sqlite";

type D1Prepared = {
  bind: (...values: unknown[]) => D1Prepared;
  all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>;
};

export type D1DatabaseLike = {
  prepare: (query: string) => D1Prepared;
  exec: (query: string) => Promise<unknown> | unknown;
  batch: unknown;
};

type LocalSqlite = {
  exec: (sql: string) => unknown;
  prepare: (sql: string) => {
    all: (...params: unknown[]) => unknown;
    run: (...params: unknown[]) => unknown;
  };
};

/**
 * Minimal shared SQL surface. Both the tagged-template and `.query()` forms
 * resolve to an array of row objects:
 *
 *   const sql = await getSql();
 *   const rows = await sql`select * from products where id = ${id}`;
 *   const rows2 = await sql.query("select * from products where id = ?", [id]);
 *
 * `$1` placeholders are rewritten to `?` so existing call sites keep working.
 */
export interface Sql {
  <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]>;
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<T[]>;
}

const globalRef = globalThis as typeof globalThis & {
  __zuvaanSqlite__?: LocalSqlite;
  __zuvaanSqlPromise__?: Promise<Sql>;
};

function readWorkerDb(): D1DatabaseLike | undefined {
  const db = (workerEnv as { DB?: D1DatabaseLike } | undefined)?.DB;
  if (
    db &&
    typeof db === "object" &&
    typeof db.prepare === "function" &&
    typeof db.exec === "function" &&
    "batch" in db
  ) {
    return db;
  }
  return undefined;
}

export function getD1Binding(): D1DatabaseLike | undefined {
  return readWorkerDb();
}

export function getDbSource(): DbSource {
  return readWorkerDb() ? "d1" : "sqlite";
}

export const dbSource: DbSource = getDbSource();

function dollarToQmark(text: string): string {
  return text.replace(/\$(\d+)/g, "?");
}

function bindValues(params: unknown[]): unknown[] {
  return params.map((value) => {
    if (typeof value === "boolean") return value ? 1 : 0;
    if (value instanceof Date) return value.toISOString();
    return value;
  });
}

type Run = <T>(text: string, params: unknown[]) => Promise<T[]>;

function toSql(run: Run): Sql {
  const sql = (async <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    let text = strings[0] ?? "";
    for (let i = 0; i < values.length; i += 1) text += `?${strings[i + 1] ?? ""}`;
    return run<T>(text, values);
  }) as unknown as Sql;
  sql.query = <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
    run<T>(text, params);
  return sql;
}

function builtin<T>(name: string): T {
  const getter = (process as { getBuiltinModule?: (id: string) => unknown })
    .getBuiltinModule;
  if (typeof getter !== "function") {
    throw new Error(`${name} is not available in this runtime.`);
  }
  return getter(name) as T;
}

function openLocalSqlite(): LocalSqlite {
  if (globalRef.__zuvaanSqlite__) return globalRef.__zuvaanSqlite__;
  const sqlite = builtin<{
    DatabaseSync: new (path: string) => LocalSqlite;
  }>("node:sqlite");
  const fs = builtin<{ mkdirSync: (path: string, opts: { recursive: boolean }) => void }>(
    "node:fs",
  );
  const path = builtin<{ join: (...parts: string[]) => string; dirname: (p: string) => string }>(
    "node:path",
  );
  const file = path.join(process.cwd(), LOCAL_SQLITE_PATH);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new sqlite.DatabaseSync(file);
  db.exec("PRAGMA foreign_keys = ON;");
  applyMigrationsSync(db);
  globalRef.__zuvaanSqlite__ = db;
  return db;
}

function loadMigrationFiles(): Record<string, string> {
  return import.meta.glob("/migrations/*.sql", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;
}

function applyMigrationsSync(db: LocalSqlite): void {
  db.exec(
    "create table if not exists _migrations (name text primary key, applied_at text not null default (datetime('now')))",
  );
  const doneRows = (db.prepare("select name from _migrations").all() ?? []) as {
    name: string;
  }[];
  const done = doneRows.map((row) => row.name);
  const migrations = loadMigrationFiles();
  for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) {
    db.exec("BEGIN");
    try {
      db.exec(migrations[path] ?? "");
      db.prepare("insert into _migrations (name) values (?)").run(name);
      db.exec("COMMIT");
    } catch (err) {
      try {
        db.exec("ROLLBACK");
      } catch {
        /* keep original error */
      }
      throw err;
    }
  }
}

function createD1Sql(db: D1DatabaseLike): Sql {
  return toSql(async <T>(text: string, params: unknown[]) => {
    const sql = dollarToQmark(text);
    const values = bindValues(params);
    const prepared = db.prepare(sql);
    const stmt = values.length ? prepared.bind(...values) : prepared;
    const result = await stmt.all<T>();
    return (result.results ?? []) as T[];
  });
}

function createLocalSql(db: LocalSqlite): Sql {
  return toSql(async <T>(text: string, params: unknown[]) => {
    const sql = dollarToQmark(text);
    const values = bindValues(params);
    const stmt = db.prepare(sql);
    const rows = values.length ? stmt.all(...values) : stmt.all();
    return (Array.isArray(rows) ? rows : []) as T[];
  });
}

/**
 * Database handle for Better Auth. D1 on the Worker, node:sqlite file locally.
 * Same instance as `getSql()` so sessions and farm data share one DB.
 */
export function getAuthDatabase(): D1DatabaseLike | LocalSqlite {
  const d1 = readWorkerDb();
  if (d1) return d1;
  if (isCloudflareWorker()) {
    throw new Error(
      "D1 binding DB is missing. Add a d1_databases binding named DB for database zuvaan in wrangler.jsonc, then redeploy.",
    );
  }
  return openLocalSqlite();
}

function createSql(): Sql {
  if (typeof window !== "undefined") {
    throw new Error(
      "@/lib/db is server-only — call getSql() from a createServerFn handler " +
        "or a server route loader, never from client code.",
    );
  }
  const d1 = readWorkerDb();
  if (d1) return createD1Sql(d1);
  if (isCloudflareWorker()) {
    throw new Error(
      "D1 binding DB is missing. Add a d1_databases binding named DB for database zuvaan in wrangler.jsonc, then redeploy.",
    );
  }
  return createLocalSql(openLocalSqlite());
}

/**
 * Shared, server-only SQL client. Cloudflare D1 in production, local SQLite
 * file for `npm run dev`. Memoized. Schema comes from `migrations/*.sql`.
 */
export function getSql(): Promise<Sql> {
  globalRef.__zuvaanSqlPromise__ ??= Promise.resolve()
    .then(() => createSql())
    .catch((err) => {
      globalRef.__zuvaanSqlPromise__ = undefined;
      throw err;
    });
  return globalRef.__zuvaanSqlPromise__;
}

/**
 * Open the local SQLite file and apply pending migrations. No-op on Workers
 * (production schema is applied with `wrangler d1 execute` / migrations apply).
 */
export function ensureDbReady(): Promise<void> {
  if (readWorkerDb() || isCloudflareWorker()) return Promise.resolve();
  try {
    openLocalSqlite();
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

const globalBoot = globalThis as typeof globalThis & {
  __zuvaanDbBootstrap__?: Promise<void>;
};
if (typeof window === "undefined" && !isCloudflareWorker() && !readWorkerDb()) {
  globalBoot.__zuvaanDbBootstrap__ ??= ensureDbReady().catch((err) => {
    globalBoot.__zuvaanDbBootstrap__ = undefined;
    console.error("[db] SQLite bootstrap failed:", err);
  });
}
