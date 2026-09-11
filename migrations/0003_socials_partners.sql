-- Public socials and partner / licence entities, edited from Superadmin.

create table if not exists site_socials (
  id         serial primary key,
  platform   text not null,
  label      text not null,
  url        text not null default '',
  sort_order int not null default 0,
  active     boolean not null default true
);

create table if not exists partners (
  id         serial primary key,
  name       text not null,
  license    text not null default '',
  logo       text not null default '',
  href       text not null default '',
  sort_order int not null default 0,
  active     boolean not null default true
);

create index if not exists site_socials_sort_idx on site_socials (active, sort_order);
create index if not exists partners_sort_idx on partners (active, sort_order);

insert into site_socials (id, platform, label, url, sort_order, active)
select * from (values
  (1, 'x', 'X', 'https://x.com/ZuvanDhaduveria', 10, true),
  (2, 'youtube', 'YouTube', 'https://www.youtube.com/@zuvaandhanduveriya', 20, true),
  (3, 'tiktok', 'TikTok', 'https://www.tiktok.com/@zuvaandhanduveriyaa', 30, true),
  (4, 'instagram', 'Instagram', '', 40, false),
  (5, 'facebook', 'Facebook', '', 50, false)
) as v(id, platform, label, url, sort_order, active)
where not exists (select 1 from site_socials);

insert into partners (id, name, license, logo, href, sort_order, active)
select * from (values
  (1, 'Fresh Yield', 'Pvt. Ltd. · farm licence', '/images/partners/fresh-yield.svg', '', 10, true),
  (2, 'Ooredoo', 'Grow with Ooredoo', '/images/partners/ooredoo.svg', '', 20, true),
  (3, 'Addu City', 'Municipal partner', '/images/partners/addu-city.svg', '', 30, true),
  (4, 'Meedhoo', 'Host island', '/images/partners/meedhoo.svg', '', 40, true),
  (5, 'Fuvahmulah', 'Kitchen supply', '/images/partners/fuvahmulah.svg', '', 50, true),
  (6, 'Island Farmers', 'Nursery sharing', '/images/partners/island-farmers.svg', '', 60, true)
) as v(id, name, license, logo, href, sort_order, active)
where not exists (select 1 from partners);

select setval('site_socials_id_seq', (select coalesce(max(id), 1) from site_socials));
select setval('partners_id_seq', (select coalesce(max(id), 1) from partners));
