-- Public socials and partner / licence entities, edited from Superadmin.

create table if not exists site_socials (
  id         integer primary key autoincrement,
  platform   text not null,
  label      text not null,
  url        text not null default '',
  sort_order integer not null default 0,
  active     integer not null default 1
);

create table if not exists partners (
  id         integer primary key autoincrement,
  name       text not null,
  license    text not null default '',
  logo       text not null default '',
  href       text not null default '',
  sort_order integer not null default 0,
  active     integer not null default 1
);

create index if not exists site_socials_sort_idx on site_socials (active, sort_order);
create index if not exists partners_sort_idx on partners (active, sort_order);

insert into site_socials (id, platform, label, url, sort_order, active)
select id, platform, label, url, sort_order, active from (
  select 1 as id, 'x' as platform, 'X' as label, 'https://x.com/ZuvanDhaduveria' as url, 10 as sort_order, 1 as active
  union all select 2, 'youtube', 'YouTube', 'https://www.youtube.com/@zuvaandhanduveriya', 20, 1
  union all select 3, 'tiktok', 'TikTok', 'https://www.tiktok.com/@zuvaandhanduveriyaa', 30, 1
  union all select 4, 'instagram', 'Instagram', '', 40, 0
  union all select 5, 'facebook', 'Facebook', '', 50, 0
) as seed
where not exists (select 1 from site_socials);

insert into partners (id, name, license, logo, href, sort_order, active)
select id, name, license, logo, href, sort_order, active from (
  select 1 as id, 'Fresh Yield' as name, 'Pvt. Ltd. · farm licence' as license,
    '/images/partners/fresh-yield.svg' as logo, '' as href, 10 as sort_order, 1 as active
  union all select 2, 'Ooredoo', 'Grow with Ooredoo', '/images/partners/ooredoo.svg', '', 20, 1
  union all select 3, 'Addu City', 'Municipal partner', '/images/partners/addu-city.svg', '', 30, 1
  union all select 4, 'Meedhoo', 'Host island', '/images/partners/meedhoo.svg', '', 40, 1
  union all select 5, 'Fuvahmulah', 'Kitchen supply', '/images/partners/fuvahmulah.svg', '', 50, 1
  union all select 6, 'Island Farmers', 'Nursery sharing', '/images/partners/island-farmers.svg', '', 60, 1
) as seed
where not exists (select 1 from partners);
