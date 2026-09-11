-- Better Auth schema (identity + sessions). SQLite / Cloudflare D1.
-- CamelCase columns stay double-quoted so Better Auth queries match.

create table if not exists "user" (
  "id" text not null primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" integer not null,
  "image" text,
  "createdAt" text not null default (datetime('now')),
  "updatedAt" text not null default (datetime('now'))
);

create table if not exists "session" (
  "id" text not null primary key,
  "expiresAt" text not null,
  "token" text not null unique,
  "createdAt" text not null default (datetime('now')),
  "updatedAt" text not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user" ("id") on delete cascade
);

create table if not exists "account" (
  "id" text not null primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" text,
  "refreshTokenExpiresAt" text,
  "scope" text,
  "password" text,
  "createdAt" text not null default (datetime('now')),
  "updatedAt" text not null
);

create table if not exists "verification" (
  "id" text not null primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" text not null,
  "createdAt" text not null default (datetime('now')),
  "updatedAt" text not null default (datetime('now'))
);

create index if not exists "session_userId_idx" on "session" ("userId");
create index if not exists "account_userId_idx" on "account" ("userId");
create index if not exists "verification_identifier_idx" on "verification" ("identifier");
