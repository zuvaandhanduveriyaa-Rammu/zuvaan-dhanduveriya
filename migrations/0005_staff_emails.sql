-- Superadmin is only these two Gmail addresses. Owner can revoke the deputy.

create table if not exists staff (
  email      text primary key,
  role       text not null default 'admin',
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

insert into staff (email, role, active)
select * from (values
  ('zuvaan.dhanduveriyaa@gmail.com', 'owner', true),
  ('mmxinthi@gmail.com', 'admin', true)
) as v(email, role, active)
where not exists (select 1 from staff where staff.email = v.email);
