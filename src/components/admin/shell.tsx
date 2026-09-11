import {
  BadgeCheck,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Share2,
  ShoppingBag,
  Sprout,
  Sun,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { AdminImages } from "@/components/admin/images";
import { AdminOrders } from "@/components/admin/orders";
import { AdminOverview } from "@/components/admin/overview";
import { AdminPartners } from "@/components/admin/partners";
import { AdminProducts } from "@/components/admin/products";
import { AdminSocials } from "@/components/admin/socials";
import { AdminVisits } from "@/components/admin/visits";
import { AdminVoices } from "@/components/admin/voices";
import { Logo } from "@/components/logo";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";

export type AdminTab =
  | "overview"
  | "products"
  | "orders"
  | "voices"
  | "images"
  | "visits"
  | "socials"
  | "partners";

const TABS: { id: AdminTab; label: string; icon: typeof Sprout }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Produce", icon: Sprout },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "voices", label: "Voices", icon: MessageSquare },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "socials", label: "Socials", icon: Share2 },
  { id: "partners", label: "Partners", icon: BadgeCheck },
  { id: "visits", label: "Visits", icon: Sun },
];

export function AdminShell() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className="min-h-dvh bg-bg text-fg lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden flex-col border-r border-border px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <p className="mt-6 px-3 text-[0.65rem] tracking-[0.2em] text-subtle uppercase">
          Superadmin
        </p>
        <nav className="mt-3 flex flex-col gap-1">
          {TABS.map((item) => (
            <NavBtn
              key={item.id}
              active={tab === item.id}
              onClick={() => setTab(item.id)}
            >
              <item.icon className="size-4" />
              {item.label}
            </NavBtn>
          ))}
        </nav>
        <div className="mt-auto px-2 pt-8">
          <UserButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="kicker">Staff desk</p>
            <h1 className="font-sans text-2xl font-medium tracking-tight">
              {current.label}
            </h1>
          </div>
          <div className="lg:hidden">
            <UserButton />
          </div>
        </header>
        <div className="lg:hidden overflow-x-auto px-4 pb-2">
          <div className="flex w-max gap-1">
            {TABS.map((item) => (
              <NavBtn
                key={item.id}
                active={tab === item.id}
                onClick={() => setTab(item.id)}
                pill
              >
                {item.label}
              </NavBtn>
            ))}
          </div>
        </div>
        <div className="flex-1 px-4 pb-16 sm:px-6">
          {tab === "overview" ? <AdminOverview onOpen={setTab} /> : null}
          {tab === "products" ? <AdminProducts /> : null}
          {tab === "orders" ? <AdminOrders /> : null}
          {tab === "voices" ? <AdminVoices /> : null}
          {tab === "images" ? <AdminImages /> : null}
          {tab === "socials" ? <AdminSocials /> : null}
          {tab === "partners" ? <AdminPartners /> : null}
          {tab === "visits" ? <AdminVisits /> : null}
        </div>
      </div>
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  children,
  pill,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  pill?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 text-sm transition-colors",
        pill ? "h-9 rounded-full" : "h-10 rounded-xl",
        active ? "bg-fg text-primary-fg" : "text-muted hover:bg-fg/8 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
