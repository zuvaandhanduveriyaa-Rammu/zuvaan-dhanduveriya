-- Superadmin is only these two Gmail addresses. Owner can revoke the deputy.

create table if not exists staff (
  email      text primary key,
  role       text not null default 'admin',
  active     integer not null default 1,
  created_at text not null default (datetime('now'))
);

insert into staff (email, role, active)
select 'zuvaan.dhanduveriyaa@gmail.com', 'owner', 1
where not exists (select 1 from staff where email = 'zuvaan.dhanduveriyaa@gmail.com');

insert into staff (email, role, active)
select 'mmxinthi@gmail.com', 'admin', 1
where not exists (select 1 from staff where email = 'mmxinthi@gmail.com');
