import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { FALLBACK_CATALOG } from "./defaults";
import { mapPartner, mapProduct, mapSocial, mapTestimonial } from "./map";
import { SLOT_FALLBACK } from "./slots";
import type { Catalog } from "./types";

type ProductRow = Record<string, unknown>;
type VoiceRow = Record<string, unknown>;
type ImageRow = { slot: string; url: string };

export const getCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<Catalog> => {
    try {
      const sql = await getSql();
      const [products, testimonials, images] = await Promise.all([
        sql<ProductRow>`
          select id, slug, name, kind, season, note, image, unit, price_mvr,
                 in_stock, featured, sort_order, active
          from products
          where active = 1
          order by sort_order asc, id asc
        `,
        sql<VoiceRow>`
          select id, quote, name, role, tone, image, status, sort_order
          from testimonials
          where status = 'published'
          order by sort_order asc, id asc
        `,
        sql<ImageRow>`select slot, url from site_images`,
      ]);
      const imageMap = { ...SLOT_FALLBACK };
      for (const row of images) {
        if (row.slot && row.url) imageMap[row.slot] = row.url;
      }
      let socials = FALLBACK_CATALOG.socials;
      let partners = FALLBACK_CATALOG.partners;
      try {
        const [socialRows, partnerRows] = await Promise.all([
          sql<Record<string, unknown>>`
            select id, platform, label, url, sort_order, active
            from site_socials
            order by sort_order asc, id asc
          `,
          sql<Record<string, unknown>>`
            select id, name, license, logo, href, sort_order, active
            from partners
            order by sort_order asc, id asc
          `,
        ]);
        socials = socialRows.map(mapSocial);
        partners = partnerRows.map(mapPartner);
      } catch {
        /* tables apply on the next request */
      }
      return {
        products: products.map(mapProduct),
        testimonials: testimonials.map(mapTestimonial),
        images: imageMap,
        socials,
        partners,
      };
    } catch {
      return FALLBACK_CATALOG;
    }
  },
);

export const getStaffStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const sql = await getSql();
      const rows = await sql<{ n: number }>`select count(*) as n from admins`;
      return { hasAdmin: Number(rows[0]?.n ?? 0) > 0 };
    } catch {
      return { hasAdmin: false };
    }
  },
);

export const placeOrder = createServerFn({ method: "POST" })
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as {
      customerName?: string;
      phone?: string;
      island?: string;
      notes?: string;
      items?: {
        productId?: number;
        name?: string;
        unit?: string;
        qty?: number;
        unitPriceMvr?: number;
      }[];
    };
    const customerName = String(d.customerName ?? "").trim();
    const phone = String(d.phone ?? "").trim();
    const island = String(d.island ?? "").trim();
    const notes = String(d.notes ?? "").trim().slice(0, 800);
    const items = Array.isArray(d.items) ? d.items : [];
    if (!customerName) throw new Error("Name is required.");
    if (!phone) throw new Error("Phone is required.");
    if (items.length === 0) throw new Error("Your crate is empty.");
    const clean = items
      .map((item) => ({
        productId: Number(item.productId) || null,
        name: String(item.name ?? "").trim().slice(0, 80),
        unit: String(item.unit ?? "kg").slice(0, 24),
        qty: Math.max(0.1, Number(item.qty) || 0),
        unitPriceMvr: Math.max(0, Number(item.unitPriceMvr) || 0),
      }))
      .filter((item) => item.name && item.qty > 0);
    if (clean.length === 0) throw new Error("Your crate is empty.");
    return { customerName, phone, island, notes, items: clean };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const total = data.items.reduce(
      (sum, item) => sum + item.qty * item.unitPriceMvr,
      0,
    );
    const inserted = await sql<{ id: number }>`
      insert into orders (customer_name, phone, island, notes, status, total_mvr)
      values (
        ${data.customerName},
        ${data.phone},
        ${data.island},
        ${data.notes},
        'new',
        ${total}
      )
      returning id
    `;
    const orderId = inserted[0]?.id;
    if (!orderId) throw new Error("Could not place this order.");
    for (const item of data.items) {
      await sql`
        insert into order_items (order_id, product_id, name, unit, qty, unit_price_mvr)
        values (
          ${orderId},
          ${item.productId},
          ${item.name},
          ${item.unit},
          ${item.qty},
          ${item.unitPriceMvr}
        )
      `;
    }
    return { ok: true as const, orderId, total };
  });

export const submitVisit = createServerFn({ method: "POST" })
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as Record<string, unknown>;
    const name = String(d.name ?? "").trim();
    const phone = String(d.phone ?? "").trim();
    if (!name) throw new Error("Name is required.");
    if (!phone) throw new Error("Phone is required.");
    return {
      name,
      island: String(d.island ?? "").trim().slice(0, 80),
      phone,
      visitDate: String(d.visitDate ?? "").trim().slice(0, 40),
      party: Math.min(20, Math.max(1, Number(d.party) || 2)),
      interest: String(d.interest ?? "walk").slice(0, 40),
      notes: String(d.notes ?? "").trim().slice(0, 800),
    };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      insert into visits (name, island, phone, visit_date, party, interest, notes)
      values (
        ${data.name},
        ${data.island},
        ${data.phone},
        ${data.visitDate},
        ${data.party},
        ${data.interest},
        ${data.notes}
      )
    `;
    return { ok: true as const };
  });

export const submitVoice = createServerFn({ method: "POST" })
  .validator((raw: unknown) => {
    const d = (raw ?? {}) as Record<string, unknown>;
    const quote = String(d.quote ?? "").trim();
    const name = String(d.name ?? "").trim();
    if (!quote) throw new Error("A few words, please.");
    if (!name) throw new Error("Name is required.");
    return {
      quote: quote.slice(0, 500),
      name: name.slice(0, 80),
      role: String(d.role ?? "").trim().slice(0, 80),
    };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      insert into testimonials (quote, name, role, tone, status, sort_order)
      values (
        ${data.quote},
        ${data.name},
        ${data.role || "Visitor"},
        'sand',
        'pending',
        999
      )
    `;
    return { ok: true as const };
  });
