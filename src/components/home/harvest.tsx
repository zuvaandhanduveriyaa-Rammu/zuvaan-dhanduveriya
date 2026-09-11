import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { SiteImage } from "@/components/site-image";
import { Button } from "@/components/ui/button";
import { harvest } from "@/data/site";
import { useCountUp } from "@/hooks/use-count-up";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

const moons = {
  this: harvest,
  last: {
    monthLabel: "Last moon",
    totalKg: 1084,
    bars: [
      { label: "Dragon fruit", value: 240, max: 420, tone: "sage" },
      { label: "Greenhouse", value: 560, max: 700, tone: "mist" },
      { label: "Nursery out", value: 284, max: 500, tone: "muted" },
    ],
    todayKg: 36,
    todayNote: "Picked before noon",
  },
} as const;

export function Harvest() {
  const [moon, setMoon] = useState<"this" | "last">("this");
  const data = moons[moon];
  const { ref, inView } = useInView<HTMLElement>();
  const total = useCountUp(data.totalKg, inView);
  const today = useCountUp(data.todayKg, inView, 700);

  return (
    <section ref={ref} className="bg-bg px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker">Analytics</p>
          <h2 className="mt-5 font-sans text-4xl font-medium tracking-[-0.04em] text-fg sm:text-5xl">
            Smarter harvest flow
            <br />
            <em className="font-serif font-normal italic">insights at a glance</em>
          </h2>
          <p className="mt-4 text-sm text-muted">
            Keep planting and picking in sync with the island season.
          </p>
          <div className="mt-6 inline-flex rounded-full bg-elevated p-1 shadow-[var(--shadow-border)]">
            {(["this", "last"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMoon(key)}
                className={cn(
                  "h-9 rounded-full px-4 text-sm transition-colors",
                  moon === key
                    ? "bg-primary text-primary-fg"
                    : "text-muted hover:text-fg",
                )}
              >
                {key === "this" ? "This moon" : "Last moon"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-[1.25fr_0.9fr]">
          <article className="glass-strong overflow-hidden rounded-[1.75rem] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="kicker">Monthly overview</p>
                <p className="mt-3 font-sans text-4xl font-medium tracking-tight tabular-nums sm:text-5xl">
                  {total.toLocaleString()}.00
                  <span className="ml-2 text-lg text-muted">kg</span>
                </p>
              </div>
              <span className="rounded-full bg-fg/8 px-3 py-1 text-[0.7rem] tracking-wider text-muted uppercase">
                {data.monthLabel}
              </span>
            </div>
            <ul className="mt-10 space-y-5">
              {data.bars.map((bar) => (
                <li key={bar.label}>
                  <div className="mb-2 flex items-center justify-between text-xs text-muted">
                    <span>{bar.label}</span>
                    <span className="tabular-nums text-fg">{bar.value} kg</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-fg/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        bar.tone === "sage" && "bg-sage",
                        bar.tone === "mist" && "bg-mist",
                        bar.tone === "muted" && "bg-subtle",
                      )}
                      style={{
                        width: inView ? `${(bar.value / bar.max) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-md text-sm text-muted">
              See the full picture of the farm. Soil, water and time in one
              view. A clearer read of the season.
            </p>
          </article>

          <article className="relative min-h-80 overflow-hidden rounded-[1.75rem]">
            <SiteImage
              slot="harvest"
              fallback="/images/ramsey-field.jpg"
              alt="Ramsey Hussain in the Meedhoo fields"
              className="absolute inset-0 size-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-linear-to-t from-bg/70 via-bg/10 to-transparent" />
            <div className="float-y absolute top-4 left-4 w-[min(100%-2rem,16rem)] rounded-2xl bg-elevated/90 p-4 shadow-[var(--shadow-glass)] backdrop-blur">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium tabular-nums text-fg">
                    {today.toFixed(2)}
                    <span className="ml-1 text-xs text-muted">kg</span>
                  </p>
                  <p className="text-[0.65rem] tracking-wider text-subtle uppercase">
                    Today
                  </p>
                </div>
                <span className="pulse-dot mt-1 size-1.5 rounded-full bg-sage" />
              </div>
              <p className="mt-2 text-xs text-muted">{data.todayNote}</p>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs tracking-wider text-muted uppercase">
                Today's harvest
              </p>
              <p className="mt-2 max-w-xs text-sm text-fg">
                Picked from greenhouse, packed by 10:00. Dragon fruit holds
                until Friday.
              </p>
              <Link to="/produce" className="mt-4 inline-flex">
                <Button size="sm" className="pl-4 pr-2">
                  Full report
                  <span className="grid size-5 place-items-center rounded-full bg-primary-fg/10">
                    <ArrowUpRight className="size-3" />
                  </span>
                </Button>
              </Link>
            </div>
          </article>
        </div>

        <div className="mt-6 rounded-[1.75rem] bg-surface px-6 py-10 text-center shadow-[var(--shadow-border)] sm:px-10">
          <h3 className="font-sans text-3xl font-medium tracking-tight sm:text-4xl">
            Ready when the kitchen is
          </h3>
          <p className="mt-3 text-sm text-muted">
            Start using harvest insights today
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link to="/visit" className="inline-flex">
              <Button size="lg">Book a visit</Button>
            </Link>
            <Link to="/farm" className="inline-flex">
              <Button size="lg" variant="ghost">
                Watch the walk
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
