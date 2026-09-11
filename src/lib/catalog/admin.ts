import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { num } from "@/lib/money";
import {
  mapOrder,
  mapPartner,
  mapProduct,
  mapSocial,
  mapTestimonial,
  mapVisit,
} from "./map";
import { SLOT_FALLBACK } from "./slots";
import { SOCIAL_PLATFORMS, type AdminStats, type FarmOrder, type Partner, type Product, type SocialLink, type Testimonial, type VisitRequest } from "./types";
import { DEPUTY_EMAIL, OWNER_EMAIL, type StaffMember } from "./staff";

class ForbiddenError extends Error {
  status = 403;
  constructor() {
    super("Forbidden");
  }
}

async function emailForUser(sql: Sql, userId: string) {
  const rows = await sql.query<{ email: string }>(
    `select email from "user" where id = $1`,
    [userId],
  );
  return rows[0]?.email ? rows[0].email.trim().toLowerCase() : "";
}

async function requireAdmin(sql: Sql, userId: string) {
  const email = await emailForUser(sql, userId);
  if (!email) throw new ForbiddenError();
  if (email === OWNER_EMAIL) {
    return { email, isOwner: true as const };
  }
  if (email !== DEPUTY_EMAIL) throw new ForbiddenError();
  try {
    const row = await sql<{ active: boolean | string }>`
      select active from staff where email = ${email}
    `;
    const active = row[0]?.active;
    const live = active === true || active === "t" || active === "true";
    if (!row[0] || !live) throw new ForbiddenError();
  } catch (err) {
    if (err instanceof ForbiddenError) throw err;
    throw new ForbiddenError();
  }
  return { email, isOwner: false as const };
}

function slugify(name: string, fallback = "crop") {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return slug || fallback;
}

function cleanHref(raw: string) {
  const url = raw.trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("mailto:")) return url;
  return `https://${url}`;
}

export const ensureAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    try {
      const staff = await requireAdmin(sql, context.userId);
      return {
        ok: true as const,
        isAdmin: true,
        isOwner: staff.isOwner,
        email: staff.email,
      };
    } catch (err) {
      if (err instanceof ForbiddenError) {
        return {
          ok: false as const,
          isAdmin: false,
          isOwner: false,
          email: null as string | null,
        };
      }
      throw err;
    }
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AdminStats> => {
    const sql = await getSql();
    try {
      await requireAdmin(sql, context.userId);
    } catch (err) {
      if (err instanceof ForbiddenError) {
        return {
          isAdmin: false,
          openOrders: 0,
          crateValue: 0,
          productCount: 0,
          pendingVoices: 0,
          newVisits: 0,
        };
      }
      throw err;
    }
    const [orders, value, products, voices, visits] = await Promise.all([
      sql<{ n: number }>`select count(*)::int as n from orders where status in ('new','confirmed','packed')`,
      sql<{ v: unknown }>`select coalesce(sum(total_mvr), 0) as v from orders where status <> 'cancelled'`,
      sql<{ n: number }>`select count(*)::int as n from products where active = true`,
      sql<{ n: number }>`select count(*)::int as n from testimonials where status = 'pending'`,
      sql<{ n: number }>`select count(*)::int as n from visits where status = 'new'`,
    ]);
    return {
      isAdmin: true,
      openOrders: num(orders[0]?.n),
      crateValue: num(value[0]?.v),
      productCount: num(products[0]?.n),
      pendingVoices: num(voices[0]?.n),
      newVisits: num(visits[0]?.n),
    };
  });

export const listAdminProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Product[]> => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<Record<string, unknown>>`
      select id, slug, name, kind, season, note, image, unit, price_mvr,
             in_stock, featured, sort_order, active
      from products
      order by sort_order asc, id asc
    `;
    return rows.map(mapProduct);
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as Record<string, unknown>;
    const name = String(d.name ?? "").trim();
    if (!name) throw new Error("Product name is required.");
    const id = d.id == null || d.id === "" ? null : num(d.id);
    return {
      id: id && id > 0 ? id : null,
      name: name.slice(0, 80),
      slug: String(d.slug ?? "").trim() || slugify(name),
      kind: String(d.kind ?? "Greenhouse").slice(0, 40),
      season: String(d.season ?? "").slice(0, 80),
      note: String(d.note ?? "").slice(0, 400),
      image: String(d.image ?? ""),
      unit: String(d.unit ?? "kg").slice(0, 24) || "kg",
      priceMvr: Math.max(0, num(d.priceMvr)),
      inStock: d.inStock !== false,
      featured: Boolean(d.featured),
      sortOrder: num(d.sortOrder),
      active: d.active !== false,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const slug = slugify(data.slug || data.name);
    if (data.id) {
      await sql`
        update products set
          slug = ${slug},
          name = ${data.name},
          kind = ${data.kind},
          season = ${data.season},
          note = ${data.note},
          image = ${data.image},
          unit = ${data.unit},
          price_mvr = ${data.priceMvr},
          in_stock = ${data.inStock},
          featured = ${data.featured},
          sort_order = ${data.sortOrder},
          active = ${data.active}
        where id = ${data.id}
      `;
      return { ok: true as const, id: data.id };
    }
    const unique = `${slug}-${Math.floor(Math.random() * 900 + 100)}`;
    const inserted = await sql<{ id: number }>`
      insert into products (
        slug, name, kind, season, note, image, unit, price_mvr,
        in_stock, featured, sort_order, active
      ) values (
        ${unique},
        ${data.name},
        ${data.kind},
        ${data.season},
        ${data.note},
        ${data.image},
        ${data.unit},
        ${data.priceMvr},
        ${data.inStock},
        ${data.featured},
        ${data.sortOrder || 100},
        ${data.active}
      )
      returning id
    `;
    return { ok: true as const, id: inserted[0]?.id ?? 0 };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: unknown) => num(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`delete from products where id = ${id}`;
    return { ok: true as const };
  });

export const listAdminVoices = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Testimonial[]> => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<Record<string, unknown>>`
      select id, quote, name, role, tone, image, status, sort_order
      from testimonials
      order by
        case when status = 'pending' then 0 else 1 end,
        sort_order asc, id desc
    `;
    return rows.map(mapTestimonial);
  });

export const saveVoice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as Record<string, unknown>;
    const quote = String(d.quote ?? "").trim();
    const name = String(d.name ?? "").trim();
    if (!quote) throw new Error("Quote is required.");
    if (!name) throw new Error("Name is required.");
    const id = d.id == null || d.id === "" ? null : num(d.id);
    const status = String(d.status ?? "published");
    return {
      id: id && id > 0 ? id : null,
      quote: quote.slice(0, 600),
      name: name.slice(0, 80),
      role: String(d.role ?? "").slice(0, 80),
      tone: String(d.tone ?? "sand").slice(0, 24),
      image: d.image == null || d.image === "" ? null : String(d.image),
      status:
        status === "pending" || status === "hidden" ? status : "published",
      sortOrder: num(d.sortOrder),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.id) {
      await sql`
        update testimonials set
          quote = ${data.quote},
          name = ${data.name},
          role = ${data.role},
          tone = ${data.tone},
          image = ${data.image},
          status = ${data.status},
          sort_order = ${data.sortOrder}
        where id = ${data.id}
      `;
      return { ok: true as const, id: data.id };
    }
    const inserted = await sql<{ id: number }>`
      insert into testimonials (quote, name, role, tone, image, status, sort_order)
      values (
        ${data.quote},
        ${data.name},
        ${data.role},
        ${data.tone},
        ${data.image},
        ${data.status},
        ${data.sortOrder || 100}
      )
      returning id
    `;
    return { ok: true as const, id: inserted[0]?.id ?? 0 };
  });

export const deleteVoice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: unknown) => num(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`delete from testimonials where id = ${id}`;
    return { ok: true as const };
  });

export const listAdminImages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<{ slot: string; url: string }>`
      select slot, url from site_images
    `;
    const images = { ...SLOT_FALLBACK };
    for (const row of rows) {
      if (row.slot && row.url) images[row.slot] = row.url;
    }
    return images;
  });

export const saveSiteImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as { slot?: string; url?: string };
    const slot = String(d.slot ?? "").trim();
    const url = String(d.url ?? "").trim();
    if (!slot) throw new Error("Which image?");
    if (!url) throw new Error("An image is required.");
    if (!(slot in SLOT_FALLBACK)) throw new Error("Unknown image slot.");
    return { slot, url };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`
      insert into site_images (slot, url, updated_at)
      values (${data.slot}, ${data.url}, now())
      on conflict (slot) do update set url = excluded.url, updated_at = now()
    `;
    return { ok: true as const };
  });

export const listAdminOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<FarmOrder[]> => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<Record<string, unknown>>`
      select
        o.id, o.customer_name, o.phone, o.island, o.notes, o.status,
        o.total_mvr, o.created_at,
        coalesce(
          json_agg(
            json_build_object(
              'id', i.id,
              'product_id', i.product_id,
              'name', i.name,
              'unit', i.unit,
              'qty', i.qty,
              'unit_price_mvr', i.unit_price_mvr
            ) order by i.id
          ) filter (where i.id is not null),
          '[]'::json
        ) as items
      from orders o
      left join order_items i on i.order_id = o.id
      group by o.id
      order by o.created_at desc
      limit 80
    `;
    return rows.map(mapOrder);
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as { id?: number; status?: string };
    const status = String(d.status ?? "new");
    const allowed = ["new", "confirmed", "packed", "delivered", "cancelled"];
    if (!allowed.includes(status)) throw new Error("Unknown status.");
    return { id: num(d.id), status };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`update orders set status = ${data.status} where id = ${data.id}`;
    return { ok: true as const };
  });

export const listAdminVisits = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<VisitRequest[]> => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<Record<string, unknown>>`
      select id, name, island, phone, visit_date, party, interest, notes, status, created_at
      from visits
      order by created_at desc
      limit 80
    `;
    return rows.map(mapVisit);
  });

export const setVisitStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as { id?: number; status?: string };
    return { id: num(d.id), status: String(d.status ?? "new").slice(0, 24) };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`update visits set status = ${data.status} where id = ${data.id}`;
    return { ok: true as const };
  });

export const listAdminSocials = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SocialLink[]> => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<Record<string, unknown>>`
      select id, platform, label, url, sort_order, active
      from site_socials
      order by sort_order asc, id asc
    `;
    return rows.map(mapSocial);
  });

export const saveSocial = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as Record<string, unknown>;
    const platform = String(d.platform ?? "website").trim().toLowerCase();
    const label = String(d.label ?? "").trim();
    const url = cleanHref(String(d.url ?? ""));
    const active = d.active !== false;
    if (!label) throw new Error("A label is required.");
    if (!SOCIAL_PLATFORMS.some((p) => p.id === platform)) {
      throw new Error("Unknown social.");
    }
    if (active && !url) throw new Error("A URL is required for a live social.");
    const id = d.id == null || d.id === "" ? null : num(d.id);
    return {
      id: id && id > 0 ? id : null,
      platform,
      label: label.slice(0, 40),
      url: url.slice(0, 240),
      sortOrder: num(d.sortOrder),
      active,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.id) {
      await sql`
        update site_socials set
          platform = ${data.platform},
          label = ${data.label},
          url = ${data.url},
          sort_order = ${data.sortOrder},
          active = ${data.active}
        where id = ${data.id}
      `;
      return { ok: true as const, id: data.id };
    }
    const inserted = await sql<{ id: number }>`
      insert into site_socials (platform, label, url, sort_order, active)
      values (
        ${data.platform},
        ${data.label},
        ${data.url},
        ${data.sortOrder || 100},
        ${data.active}
      )
      returning id
    `;
    return { ok: true as const, id: inserted[0]?.id ?? 0 };
  });

export const deleteSocial = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: unknown) => num(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`delete from site_socials where id = ${id}`;
    return { ok: true as const };
  });

export const listAdminPartners = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Partner[]> => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<Record<string, unknown>>`
      select id, name, license, logo, href, sort_order, active
      from partners
      order by sort_order asc, id asc
    `;
    return rows.map(mapPartner);
  });

export const savePartner = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as Record<string, unknown>;
    const name = String(d.name ?? "").trim();
    if (!name) throw new Error("Partner name is required.");
    const id = d.id == null || d.id === "" ? null : num(d.id);
    return {
      id: id && id > 0 ? id : null,
      name: name.slice(0, 80),
      license: String(d.license ?? "").trim().slice(0, 80),
      logo: String(d.logo ?? ""),
      href: cleanHref(String(d.href ?? "")).slice(0, 240),
      sortOrder: num(d.sortOrder),
      active: d.active !== false,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.id) {
      await sql`
        update partners set
          name = ${data.name},
          license = ${data.license},
          logo = ${data.logo},
          href = ${data.href},
          sort_order = ${data.sortOrder},
          active = ${data.active}
        where id = ${data.id}
      `;
      return { ok: true as const, id: data.id };
    }
    const inserted = await sql<{ id: number }>`
      insert into partners (name, license, logo, href, sort_order, active)
      values (
        ${data.name},
        ${data.license},
        ${data.logo},
        ${data.href},
        ${data.sortOrder || 100},
        ${data.active}
      )
      returning id
    `;
    return { ok: true as const, id: inserted[0]?.id ?? 0 };
  });

export const deletePartner = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: unknown) => num(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`delete from partners where id = ${id}`;
    return { ok: true as const };
  });

export const listStaff = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<StaffMember[]> => {
    const sql = await getSql();
    const me = await requireAdmin(sql, context.userId);
    if (!me.isOwner) throw new ForbiddenError();
    const rows = await sql<{ email: string; role: string; active: boolean | string }>`
      select email, role, active from staff
    `;
    const byEmail = new Map(
      rows.map((row) => [
        row.email.trim().toLowerCase(),
        {
          email: row.email.trim().toLowerCase(),
          role: row.role === "owner" ? ("owner" as const) : ("admin" as const),
          active: row.active === true || row.active === "t" || row.active === "true",
        },
      ]),
    );
    return [
      byEmail.get(OWNER_EMAIL) ?? {
        email: OWNER_EMAIL,
        role: "owner",
        active: true,
      },
      byEmail.get(DEPUTY_EMAIL) ?? {
        email: DEPUTY_EMAIL,
        role: "admin",
        active: false,
      },
    ];
  });

export const setStaffActive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as { email?: string; active?: boolean };
    const email = String(d.email ?? "").trim().toLowerCase();
    if (email !== DEPUTY_EMAIL) {
      throw new Error("Only the second desk can be removed.");
    }
    return { email, active: d.active !== false };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await requireAdmin(sql, context.userId);
    if (!me.isOwner) throw new ForbiddenError();
    await sql`
      insert into staff (email, role, active)
      values (${data.email}, 'admin', ${data.active})
      on conflict (email) do update set active = excluded.active
    `;
    return { ok: true as const };
  });

