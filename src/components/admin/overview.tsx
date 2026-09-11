import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  ImageIcon,
  MessageSquare,
  Share2,
  ShoppingBag,
  Sprout,
  Sun,
} from "lucide-react";
import { getAdminStats } from "@/lib/catalog/admin";
import { formatMvr } from "@/lib/money";
import type { AdminTab } from "./shell";

export function AdminOverview({ onOpen }: { onOpen: (tab: AdminTab) => void }) {
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: () => getAdminStats() });
  const s = stats.data;

  const cards = [
    {
      label: "Open crates",
      value: s ? String(s.openOrders) : "…",
      hint: "New, confirmed, packed",
      icon: ShoppingBag,
      tab: "orders" as const,
    },
    {
      label: "Crate value",
      value: s ? formatMvr(s.crateValue) : "…",
      hint: "All placed orders",
      icon: Sprout,
      tab: "orders" as const,
    },
    {
      label: "On the list",
      value: s ? String(s.productCount) : "…",
      hint: "Live products",
      icon: Sun,
      tab: "products" as const,
    },
    {
      label: "Voices waiting",
      value: s ? String(s.pendingVoices) : "…",
      hint: "Need a publish",
      icon: MessageSquare,
      tab: "voices" as const,
    },
  ];

  return (
    <div>
      <p className="max-w-xl text-sm text-muted">
        A live desk for the farm: prices, photographs, socials, licence
        entities, crates, and the words people leave. What you save here is
        what Addu sees.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onOpen(card.tab)}
            className="rounded-[1.5rem] bg-elevated p-5 text-left shadow-[var(--shadow-border)] hover:bg-fg/5"
          >
            <card.icon className="size-4 text-muted" />
            <p className="mt-6 font-sans text-3xl font-medium tracking-tight tabular-nums">
              {card.value}
            </p>
            <p className="mt-1 text-sm">{card.label}</p>
            <p className="text-xs text-subtle">{card.hint}</p>
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Quick
          title="Replace a photograph"
          body="Hero, farm, story, visit. Every still on the site."
          onClick={() => onOpen("images")}
          icon={ImageIcon}
        />
        <Quick
          title="Update socials"
          body="X, YouTube, TikTok and the rest. Footer picks them up."
          onClick={() => onOpen("socials")}
          icon={Share2}
        />
        <Quick
          title="Licence entities"
          body="Partner names and small logos for home and the footer."
          onClick={() => onOpen("partners")}
          icon={BadgeCheck}
        />
        <Quick
          title="Review a voice"
          body={`${s?.pendingVoices ?? 0} waiting, ${s?.newVisits ?? 0} visit notes.`}
          onClick={() => onOpen("voices")}
          icon={MessageSquare}
        />
      </div>
    </div>
  );
}

function Quick({
  title,
  body,
  onClick,
  icon: Icon,
}: {
  title: string;
  body: string;
  onClick: () => void;
  icon: typeof ImageIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[1.5rem] bg-surface p-5 text-left shadow-[var(--shadow-border)] hover:bg-fg/5"
    >
      <Icon className="size-4 text-sage" />
      <p className="mt-4 font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </button>
  );
}
