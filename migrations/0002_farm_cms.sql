-- Zuvaan farm CMS: products, testimonials, site images, orders, visits, admins.

create table if not exists admins (
  user_id    text primary key,
  created_at text not null default (datetime('now'))
);

create table if not exists site_images (
  slot       text primary key,
  url        text not null,
  alt        text not null default '',
  updated_at text not null default (datetime('now'))
);

create table if not exists products (
  id         integer primary key autoincrement,
  slug       text not null unique,
  name       text not null,
  kind       text not null default 'Greenhouse',
  season     text not null default '',
  note       text not null default '',
  image      text not null default '',
  unit       text not null default 'kg',
  price_mvr  real not null default 0,
  in_stock   integer not null default 1,
  featured   integer not null default 0,
  sort_order integer not null default 0,
  active     integer not null default 1,
  created_at text not null default (datetime('now'))
);

create table if not exists testimonials (
  id         integer primary key autoincrement,
  quote      text not null,
  name       text not null,
  role       text not null default '',
  tone       text not null default 'sand',
  image      text,
  status     text not null default 'published',
  sort_order integer not null default 0,
  created_at text not null default (datetime('now'))
);

create table if not exists orders (
  id            integer primary key autoincrement,
  customer_name text not null,
  phone         text not null,
  island        text not null default '',
  notes         text not null default '',
  status        text not null default 'new',
  total_mvr     real not null default 0,
  created_at    text not null default (datetime('now'))
);

create table if not exists order_items (
  id              integer primary key autoincrement,
  order_id        integer not null references orders(id) on delete cascade,
  product_id      integer references products(id) on delete set null,
  name            text not null,
  unit            text not null,
  qty             real not null,
  unit_price_mvr  real not null
);

create table if not exists visits (
  id         integer primary key autoincrement,
  name       text not null,
  island     text not null default '',
  phone      text not null,
  visit_date text not null default '',
  party      integer not null default 2,
  interest   text not null default 'walk',
  notes      text not null default '',
  status     text not null default 'new',
  created_at text not null default (datetime('now'))
);

create index if not exists products_active_idx on products (active, sort_order);
create index if not exists testimonials_status_idx on testimonials (status, sort_order);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists visits_created_idx on visits (created_at desc);

insert into site_images (slot, url, alt)
select slot, url, alt from (
  select 'hero' as slot, '/images/farm-landscape.jpg' as url, 'Lush rows and canopy at Zuvaan Dhanduveriya, Meedhoo' as alt
  union all select 'harvest', '/images/ramsey-field.jpg', 'Ramsey Hussain in the Meedhoo fields'
  union all select 'visitCta', '/images/flowers.jpg', 'Tropical blooms at golden hour on Addu'
  union all select 'methodsBg', '/images/farm-landscape.jpg', 'Farm landscape behind methods'
  union all select 'farmHero', '/images/farm-landscape.jpg', 'The farm from the road'
  union all select 'farmGreenhouse', '/images/greenhouse.jpg', 'Greenhouse lines on Meedhoo'
  union all select 'farmDragon', '/images/dragon.jpg', 'Dragon fruit on concrete pillars'
  union all select 'farmNursery', '/images/nursery.jpg', 'Shared nursery trays'
  union all select 'produceHero', '/images/dragon.jpg', 'This week''s rows'
  union all select 'storyHero', '/images/ramsey-field.jpg', 'Ramsey Hussain, Zuvaan Dhanduveriya'
  union all select 'storyPortrait', '/images/ramsey-field.jpg', 'Ramsey Hussain on the farm'
  union all select 'visitHero', '/images/flowers.jpg', 'A farm visit on Meedhoo'
  union all select 'methodWalk', '/images/hero.jpg', 'Farm walks and tasting'
  union all select 'methodForecast', '/images/greenhouse.jpg', 'Season forecast'
  union all select 'methodMix', '/images/dragon.jpg', 'Smart crop mix'
) as seed
where not exists (select 1 from site_images);

insert into products (id, slug, name, kind, season, note, image, unit, price_mvr, featured, sort_order)
select id, slug, name, kind, season, note, image, unit, price_mvr, featured, sort_order from (
  select 1 as id, 'dragon' as slug, 'Dragon fruit' as name, 'Fruit' as kind, 'Peak Nov–Apr' as season,
    'Organic pitaya from concrete pillars. A pillar can yield ~20 kg in season.' as note,
    '/images/dragon.jpg' as image, 'kg' as unit, 85.00 as price_mvr, 1 as featured, 10 as sort_order
  union all select 2, 'cucumber', 'Greenhouse cucumber', 'Greenhouse', 'Year-round',
    'Long English cucumbers, harvested daily from hanging vines.',
    '/images/produce-cucumber.jpg', 'kg', 45.00, 1, 20
  union all select 3, 'tomato', 'Vine tomato', 'Greenhouse', 'Year-round',
    'Cluster tomatoes grown in autopot lines under island light.',
    '/images/produce-tomato.jpg', 'kg', 55.00, 1, 30
  union all select 4, 'greens', 'Leaf & salad mix', 'Greenhouse', 'Weekly',
    'Fast-turn greens for kitchens in Addu and Fuvahmulah.',
    '/images/greenhouse.jpg', 'bunch', 30.00, 0, 40
  union all select 5, 'sugarcane', 'Sugarcane', 'Field', 'Visit days',
    'Chewed fresh with visitors on the walk between rows.',
    '/images/farm-landscape.jpg', 'stick', 15.00, 0, 50
  union all select 6, 'nursery', 'Nursery plants', 'Nursery', 'Always',
    'Trays and bagged starts for island farmers, shared from the Meedhoo nursery.',
    '/images/nursery.jpg', 'tray', 40.00, 0, 60
) as seed
where not exists (select 1 from products);

insert into testimonials (id, quote, name, role, tone, image, status, sort_order)
select id, quote, name, role, tone, image, status, sort_order from (
  select 1 as id,
    'Switching to island produce for our kitchen has made my week simpler. I cannot imagine going back to waiting on the boat.' as quote,
    'Mariyam A.' as name, 'Chef, Addu' as role, 'sand' as tone, null as image, 'published' as status, 10 as sort_order
  union all select 2,
    'Zuvaan Dhanduveriya has completely changed how we think about growing food on a small island. The greenhouse is quiet, exact, and generous.',
    'Ibrahim R.', 'Meedhoo neighbour', 'photo', '/images/voice-ibrahim.jpg', 'published', 20
  union all select 3,
    'Thanks to this farm I feel in control of what we serve. Highly recommended for anyone serious about island food.',
    'Samantha K.', 'Guest, Hulhumeedhoo', 'photo', '/images/voice-samantha.jpg', 'published', 30
  union all select 4,
    'I never thought this simple a farm visit could restore my confidence in local growing.',
    'Hassan D.', 'Buyer, Fuvahmulah', 'photo', '/images/voice-hassan.jpg', 'published', 40
  union all select 5,
    'We tasted sugarcane between the rows. I left with a crate and a plan for next week''s kitchen.',
    'Aisha F.', 'Cook, Gan', 'photo', '/images/voice-aisha.jpg', 'published', 50
  union all select 6,
    'The cucumber from the greenhouse lasts days longer than anything that came off the ferry.',
    'Fathimath N.', 'Home cook, Hithadhoo', 'dusk', null, 'published', 60
  union all select 7,
    'I walk the nursery whenever I am on Meedhoo. Plants leave with someone who will actually grow them.',
    'Yoosuf M.', 'Farmer, Hulhudhoo', 'lagoon', null, 'published', 70
  union all select 8,
    'Dragon fruit off the pillar, still warm from the morning. That is the whole argument for this farm.',
    'Hawwa S.', 'Host, Addu', 'sage', null, 'published', 80
) as seed
where not exists (select 1 from testimonials);
