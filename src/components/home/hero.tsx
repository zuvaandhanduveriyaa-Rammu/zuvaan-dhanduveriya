import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";
import { SiteImage } from "@/components/site-image";
import { Button } from "@/components/ui/button";
import { Mark } from "@/components/logo";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const ASK = [
  {
    q: "How can I take a crate this week?",
    a: "The house can spare 18 kg of cucumber and 6 kg of dragon fruit without dipping the kitchen reserve. Come before noon.",
  },
  {
    q: "Is the dragon fruit in season?",
    a: "Peak runs November to April. Pillars are fruiting now. Come taste one off the plant.",
  },
  {
    q: "Can I walk from the jetty?",
    a: "Fifteen to twenty minutes east along Meedhoo Main Road. The farm sits on the right at Dhandamathi.",
  },
];

function replyTo(text: string) {
  const t = text.toLowerCase();
  if (t.includes("dragon") || t.includes("fruit")) return ASK[1].a;
  if (t.includes("jetty") || t.includes("walk") || t.includes("visit"))
    return ASK[2].a;
  if (t.includes("kg") || t.includes("crate") || t.includes("order"))
    return ASK[0].a;
  return "Come in the morning. Wear shoes that can take a little soil, and we will walk whatever is ripe.";
}

export function Hero() {
  const reduced = useReducedMotion();
  const imgRef = useRef<HTMLImageElement>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const start = useRef(0);
  const [live, setLive] = useState(reduced);

  const onMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (reduced) return;
      const r = e.currentTarget.getBoundingClientRect();
      tilt.current = {
        x: (e.clientX - r.left) / r.width - 0.5,
        y: (e.clientY - r.top) / r.height - 0.5,
      };
    },
    [reduced],
  );

  useEffect(() => {
    start.current = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const img = imgRef.current;
      if (img) {
        const t = Math.min(1, (now - start.current) / 18000);
        const ease = 1 - (1 - t) ** 2.4;
        const zoom = reduced ? 1.08 : 1 + ease * 0.34;
        const panX = reduced ? 0 : tilt.current.x * 28;
        const panY = reduced ? 0 : tilt.current.y * 18 - ease * 36;
        img.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  useEffect(() => {
    if (reduced) {
      setLive(true);
      return;
    }
    const id = window.setTimeout(() => setLive(true), 1400);
    return () => window.clearTimeout(id);
  }, [reduced]);

  return (
    <section
      className="relative isolate min-h-dvh overflow-hidden bg-bg"
      onPointerMove={onMove}
      onPointerLeave={() => {
        tilt.current = { x: 0, y: 0 };
      }}
    >
      <SiteImage
        ref={imgRef}
        slot="hero"
        fallback="/images/farm-landscape.jpg"
        alt="Lush rows and canopy at Zuvaan Dhanduveriya, Meedhoo"
        className="absolute inset-0 size-full origin-center object-cover will-change-transform"
        style={{ transform: "scale(1.04)" }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-bg/55 via-bg/25 to-bg/80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_35%,color-mix(in_oklab,var(--color-bg)_70%,transparent)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-start px-6 pb-60 pt-32 text-center sm:justify-center sm:pb-64 sm:pt-28">
        <h1 className="rise font-sans text-hero font-medium tracking-[-0.045em] text-fg">
          Island-grown, from
          <br />
          <em className="font-serif font-normal italic">Addu Meedhoo soil.</em>
        </h1>
        <p
          className={cn(
            "rise-2 mt-5 max-w-md text-sm leading-relaxed text-fg/80 sm:text-base",
            live && "max-sm:invisible max-sm:h-0 max-sm:mt-0 max-sm:overflow-hidden",
          )}
        >
          Dragon fruit on pillars, greenhouse harvests, and a nursery shared
          with the island, grown by Ramsey Hussain in Addu Meedhoo.
        </p>
        <div
          className={cn(
            "rise-3 flex flex-wrap items-center justify-center gap-2 overflow-hidden transition-all duration-700",
            live
              ? "pointer-events-none mt-0 h-0 opacity-0"
              : "mt-8 opacity-100",
          )}
        >
          <Link to="/visit" className="inline-flex">
            <Button size="lg" className="pl-5 pr-2.5">
              Book a visit
              <span className="grid size-7 place-items-center rounded-full bg-primary-fg text-primary">
                <ArrowUpRight className="size-3.5" />
              </span>
            </Button>
          </Link>
          <Link to="/farm" className="inline-flex">
            <Button size="lg" variant="ghost" className="text-fg">
              Watch the walk
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center px-4 sm:bottom-10">
        <HeroAsk visible={live} reduced={reduced} />
      </div>
    </section>
  );
}

function HeroAsk({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(ASK[0].q);
  const [showAnswer, setShowAnswer] = useState(true);
  const [asking, setAsking] = useState(false);
  const [custom, setCustom] = useState<string | null>(null);
  const q = ASK[index] ?? ASK[0];

  useEffect(() => {
    if (!visible || asking || reduced) {
      setTyped(q.q);
      setShowAnswer(true);
      return;
    }
    if (index === 0 && !custom) {
      setTyped(q.q);
      setShowAnswer(true);
      return;
    }
    setTyped("");
    setShowAnswer(false);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(q.q.slice(0, i));
      if (i >= q.q.length) {
        window.clearInterval(id);
        window.setTimeout(() => setShowAnswer(true), 220);
      }
    }, 26);
    return () => window.clearInterval(id);
  }, [asking, custom, index, q.q, reduced, visible]);

  useEffect(() => {
    if (!visible || asking || reduced) return;
    const id = window.setInterval(() => {
      setCustom(null);
      setIndex((n) => (n + 1) % ASK.length);
    }, 7200);
    return () => window.clearInterval(id);
  }, [asking, reduced, visible]);

  function onAsk(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = String(data.get("q") ?? "").trim();
    if (!text) return;
    setCustom(replyTo(text));
    setTyped(text);
    setShowAnswer(true);
    setAsking(false);
  }

  return (
    <div
      className={cn(
        "w-full max-w-lg rounded-[1.75rem] bg-elevated/88 p-4 shadow-[var(--shadow-glass)] backdrop-blur-xl transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-5",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
    >
      <div className="flex items-center gap-2 text-xs text-muted">
        <Mark className="size-3.5 text-fg" />
        Zuvaan
        <span className="ml-auto flex items-center gap-1.5 text-[0.65rem] tracking-wider uppercase">
          <span className="pulse-dot size-1.5 rounded-full bg-sage" />
          Live
        </span>
      </div>

      {asking ? (
        <form onSubmit={onAsk} className="mt-3 flex gap-2">
          <input
            name="q"
            autoFocus
            placeholder="Ask the farm…"
            className="h-10 min-w-0 flex-1 rounded-full bg-bg/60 px-4 text-sm text-fg outline-none placeholder:text-subtle"
          />
          <Button size="sm" type="submit">
            Ask
          </Button>
        </form>
      ) : (
        <>
          <p className="mt-3 min-h-10 text-left text-sm font-medium text-fg sm:text-[0.95rem]">
            {typed}
            {visible && !custom && typed.length < q.q.length ? (
              <span className="ml-0.5 inline-block h-3.5 w-px bg-fg align-middle" />
            ) : null}
          </p>
          <p
            className={cn(
              "mt-2 text-left text-xs leading-relaxed text-muted transition-[opacity,transform] duration-500 sm:text-sm",
              showAnswer
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0",
            )}
          >
            {custom ?? q.a}
          </p>
          <div className="mt-4 flex flex-nowrap items-center gap-3">
            <Link to="/visit" className="inline-flex">
              <Button size="sm" className="pl-4 pr-2">
                Get started
                <span className="grid size-5 place-items-center rounded-full bg-primary-fg/10">
                  <ArrowUpRight className="size-3" />
                </span>
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => {
                setAsking(true);
                setCustom(null);
              }}
              className="text-xs tracking-wider text-muted uppercase hover:text-fg"
            >
              Ask yours
            </button>
          </div>
        </>
      )}
    </div>
  );
}
