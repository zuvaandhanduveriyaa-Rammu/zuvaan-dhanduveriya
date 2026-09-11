import { num } from "@/lib/money";
import type {
  FarmOrder,
  OrderItem,
  Partner,
  Product,
  SocialLink,
  Testimonial,
  VisitRequest,
} from "./types";

function bool(value: unknown) {
  return value === true || value === "t" || value === "true";
}

export function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: num(row.id),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    kind: String(row.kind ?? ""),
    season: String(row.season ?? ""),
    note: String(row.note ?? ""),
    image: String(row.image ?? ""),
    unit: String(row.unit ?? "kg"),
    priceMvr: num(row.price_mvr),
    inStock: bool(row.in_stock),
    featured: bool(row.featured),
    sortOrder: num(row.sort_order),
    active: bool(row.active),
  };
}

export function mapTestimonial(row: Record<string, unknown>): Testimonial {
  const status = String(row.status ?? "published");
  return {
    id: num(row.id),
    quote: String(row.quote ?? ""),
    name: String(row.name ?? ""),
    role: String(row.role ?? ""),
    tone: String(row.tone ?? "sand"),
    image: row.image ? String(row.image) : null,
    status:
      status === "pending" || status === "hidden" ? status : "published",
    sortOrder: num(row.sort_order),
  };
}

export function mapSocial(row: Record<string, unknown>): SocialLink {
  return {
    id: num(row.id),
    platform: String(row.platform ?? "website"),
    label: String(row.label ?? ""),
    url: String(row.url ?? ""),
    sortOrder: num(row.sort_order),
    active: row.active === undefined ? true : bool(row.active),
  };
}

export function mapPartner(row: Record<string, unknown>): Partner {
  return {
    id: num(row.id),
    name: String(row.name ?? ""),
    license: String(row.license ?? ""),
    logo: String(row.logo ?? ""),
    href: String(row.href ?? ""),
    sortOrder: num(row.sort_order),
    active: row.active === undefined ? true : bool(row.active),
  };
}

export function mapVisit(row: Record<string, unknown>): VisitRequest {
  return {
    id: num(row.id),
    name: String(row.name ?? ""),
    island: String(row.island ?? ""),
    phone: String(row.phone ?? ""),
    visitDate: String(row.visit_date ?? ""),
    party: num(row.party) || 2,
    interest: String(row.interest ?? "walk"),
    notes: String(row.notes ?? ""),
    status: String(row.status ?? "new"),
    createdAt: String(row.created_at ?? ""),
  };
}

export function mapOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: num(row.id),
    productId: row.product_id == null ? null : num(row.product_id),
    name: String(row.name ?? ""),
    unit: String(row.unit ?? ""),
    qty: num(row.qty),
    unitPriceMvr: num(row.unit_price_mvr ?? row.unitPriceMvr),
  };
}

export function parseItems(value: unknown): OrderItem[] {
  let raw: unknown = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => mapOrderItem(item as Record<string, unknown>));
}

export function mapOrder(row: Record<string, unknown>): FarmOrder {
  return {
    id: num(row.id),
    customerName: String(row.customer_name ?? ""),
    phone: String(row.phone ?? ""),
    island: String(row.island ?? ""),
    notes: String(row.notes ?? ""),
    status: String(row.status ?? "new"),
    totalMvr: num(row.total_mvr),
    createdAt: String(row.created_at ?? ""),
    items: parseItems(row.items),
  };
}
