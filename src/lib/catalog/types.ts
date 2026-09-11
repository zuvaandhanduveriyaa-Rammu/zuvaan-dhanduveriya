export type Product = {
  id: number;
  slug: string;
  name: string;
  kind: string;
  season: string;
  note: string;
  image: string;
  unit: string;
  priceMvr: number;
  inStock: boolean;
  featured: boolean;
  sortOrder: number;
  active: boolean;
};

export type Testimonial = {
  id: number;
  quote: string;
  name: string;
  role: string;
  tone: string;
  image: string | null;
  status: "published" | "pending" | "hidden";
  sortOrder: number;
};

export type SocialLink = {
  id: number;
  platform: string;
  label: string;
  url: string;
  sortOrder: number;
  active: boolean;
};

export type Partner = {
  id: number;
  name: string;
  license: string;
  logo: string;
  href: string;
  sortOrder: number;
  active: boolean;
};

export type Catalog = {
  products: Product[];
  testimonials: Testimonial[];
  images: Record<string, string>;
  socials: SocialLink[];
  partners: Partner[];
};

export type OrderItem = {
  id: number;
  productId: number | null;
  name: string;
  unit: string;
  qty: number;
  unitPriceMvr: number;
};

export type FarmOrder = {
  id: number;
  customerName: string;
  phone: string;
  island: string;
  notes: string;
  status: string;
  totalMvr: number;
  createdAt: string;
  items: OrderItem[];
};

export type VisitRequest = {
  id: number;
  name: string;
  island: string;
  phone: string;
  visitDate: string;
  party: number;
  interest: string;
  notes: string;
  status: string;
  createdAt: string;
};

export type CartLine = {
  productId: number;
  name: string;
  unit: string;
  priceMvr: number;
  image: string;
  qty: number;
};

export type AdminStats = {
  isAdmin: boolean;
  openOrders: number;
  crateValue: number;
  productCount: number;
  pendingVoices: number;
  newVisits: number;
};

export const PRODUCT_KINDS = [
  "Fruit",
  "Greenhouse",
  "Field",
  "Nursery",
] as const;

export const VOICE_TONES = [
  "sand",
  "dusk",
  "lagoon",
  "sage",
  "photo",
] as const;

export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "packed",
  "delivered",
  "cancelled",
] as const;

export const SOCIAL_PLATFORMS = [
  { id: "x", label: "X" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "website", label: "Website" },
] as const;
