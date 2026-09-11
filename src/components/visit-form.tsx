import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { submitVisit } from "@/lib/catalog/public";

const INTERESTS = [
  { id: "walk", label: "Farm walk & tasting" },
  { id: "order", label: "Kitchen order" },
  { id: "nursery", label: "Nursery plants" },
  { id: "both", label: "Visit and an order" },
] as const;

export function VisitForm() {
  const [saved, setSaved] = useState<{ name: string; date: string; party: string; island: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const visit = {
      name: String(data.get("name") ?? "").trim(),
      island: String(data.get("island") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      date: String(data.get("date") ?? "").trim(),
      party: String(data.get("party") ?? "2"),
      interest: String(data.get("interest") ?? "walk"),
      notes: String(data.get("notes") ?? "").trim(),
    };
    if (!visit.name || !visit.phone) return;
    setBusy(true);
    try {
      await submitVisit({
        data: {
          name: visit.name,
          island: visit.island,
          phone: visit.phone,
          visitDate: visit.date,
          party: Number(visit.party) || 2,
          interest: visit.interest,
          notes: visit.notes,
        },
      });
      setSaved({
        name: visit.name,
        date: visit.date,
        party: visit.party,
        island: visit.island,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not hold this morning.");
    } finally {
      setBusy(false);
    }
  }

  if (saved) {
    return (
      <div className="rounded-[1.75rem] bg-elevated p-8 shadow-[var(--shadow-border)]">
        <p className="kicker">Held for you</p>
        <h2 className="mt-3 font-sans text-3xl font-medium tracking-tight">
          See you on Meedhoo,
          <br />
          <em className="font-serif font-normal italic">{saved.name}</em>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          We have your request for {saved.date || "the next open morning"} ·{" "}
          {saved.party} people · {saved.island || "Addu"}. Ramsey will confirm
          by phone. Wear shoes that can take a little soil.
        </p>
        <Button className="mt-8" type="button" onClick={() => setSaved(null)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[1.75rem] bg-elevated p-6 shadow-[var(--shadow-border)] sm:p-8"
    >
      <p className="kicker">Request a morning</p>
      <h2 className="mt-3 font-sans text-2xl font-medium tracking-tight">
        Tell the farm you are coming
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs text-muted">
          Name
          <Input name="name" required placeholder="Your name" autoComplete="name" />
        </label>
        <label className="grid gap-2 text-xs text-muted">
          Island
          <Input name="island" placeholder="Meedhoo, Hithadhoo…" />
        </label>
        <label className="grid gap-2 text-xs text-muted">
          Phone
          <Input name="phone" required placeholder="+960" autoComplete="tel" />
        </label>
        <label className="grid gap-2 text-xs text-muted">
          Preferred date
          <Input name="date" type="date" />
        </label>
        <label className="grid gap-2 text-xs text-muted">
          Party size
          <Input name="party" type="number" min={1} max={20} defaultValue={2} />
        </label>
        <label className="grid gap-2 text-xs text-muted">
          Interest
          <select
            name="interest"
            className="h-11 w-full rounded-xl bg-elevated px-4 text-sm text-fg shadow-[var(--shadow-border)] outline-none"
            defaultValue="walk"
          >
            {INTERESTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-xs text-muted sm:col-span-2">
          Notes
          <Textarea name="notes" placeholder="Kitchens, allergies, a crate to take home…" />
        </label>
      </div>
      <Button type="submit" size="lg" className="mt-6" disabled={busy}>
        {busy ? "Holding…" : "Hold this morning"}
      </Button>
    </form>
  );
}
