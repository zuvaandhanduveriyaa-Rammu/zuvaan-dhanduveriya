import { useCallback, useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { toast } from "sonner";
import { useCatalog } from "@/components/catalog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { DEFAULT_TESTIMONIALS } from "@/lib/catalog/defaults";
import { submitVoice } from "@/lib/catalog/public";
import type { Testimonial } from "@/lib/catalog/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const toneClass: Record<string, string> = {
  sand: "bg-sand text-primary-fg",
  dusk: "bg-dusk text-primary-fg",
  lagoon: "bg-lagoon text-primary-fg",
  sage: "bg-sage text-primary-fg",
  photo: "bg-mist text-primary-fg",
};

function shortest(current: number, targetMod: number) {
  const t = ((targetMod % 360) + 360) % 360;
  const c = ((current % 360) + 360) % 360;
  let delta = t - c;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return current + delta;
}

export function Voices() {
  const { testimonials } = useCatalog();
  const list = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  const n = Math.max(1, list.length);
  const step = 360 / n;
  const reduced = useReducedMotion();
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rot = useRef(0);
  const vel = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const auto = useRef(true);
  const snapAt = useRef<number | null>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [radius, setRadius] = useState(380);
  const [card, setCard] = useState({ w: 240, h: 360 });

  const measure = useCallback(() => {
    const w = window.innerWidth;
    if (w < 640) {
      setRadius(190);
      setCard({ w: 176, h: 264 });
    } else if (w < 1024) {
      setRadius(300);
      setCard({ w: 220, h: 330 });
    } else {
      setRadius(420);
      setCard({ w: 260, h: 390 });
    }
  }, []);

  const paint = useCallback(() => {
    const rad = (rot.current * Math.PI) / 180;
    let best = 0;
    let bestDepth = -Infinity;
    slotRefs.current.forEach((el, i) => {
      if (!el) return;
      const a = (i * 2 * Math.PI) / n + rad;
      const x = Math.sin(a) * radius;
      const z = Math.cos(a);
      const depth = (z + 1) / 2;
      const hidden = z < 0.04;
      const scale = 0.74 + depth * 0.26;
      const ry = (a * 180) / Math.PI;
      el.style.transform = `translate(-50%, -50%) translateX(${x}px) perspective(900px) rotateY(${ry}deg) scale(${scale})`;
      el.style.zIndex = String(Math.round(depth * 10));
      el.style.opacity = hidden ? "0" : String(0.42 + depth * 0.58);
      el.style.pointerEvents = hidden || depth < 0.22 ? "none" : "auto";
      el.style.visibility = hidden ? "hidden" : "visible";
      if (depth > bestDepth) {
        bestDepth = depth;
        best = i;
      }
    });
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
  }, [n, radius]);

  const goTo = useCallback(
    (i: number) => {
      auto.current = false;
      snapAt.current = shortest(rot.current, -i * step);
      vel.current = 0;
    },
    [step],
  );

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      if (snapAt.current !== null) {
        const target = snapAt.current;
        rot.current += (target - rot.current) * 0.14;
        if (Math.abs(target - rot.current) < 0.18) {
          rot.current = target;
          snapAt.current = null;
          window.setTimeout(() => {
            auto.current = true;
          }, 900);
        }
      } else if (!dragging.current) {
        if (Math.abs(vel.current) > 0.003) {
          rot.current += vel.current * dt;
          vel.current *= Math.pow(0.92, dt / 16);
        } else if (auto.current) {
          rot.current += 0.016 * dt;
          vel.current = 0;
        }
      }
      paint();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paint, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo((activeRef.current + 1) % n);
      if (e.key === "ArrowLeft") goTo((activeRef.current - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, n]);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    moved.current = false;
    auto.current = false;
    snapAt.current = null;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    vel.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const now = performance.now();
    const dx = e.clientX - lastX.current;
    if (Math.abs(dx) > 4) moved.current = true;
    const dt = Math.max(8, now - lastT.current);
    rot.current += dx * 0.22;
    vel.current = (dx * 0.22) / dt;
    lastX.current = e.clientX;
    lastT.current = now;
    paint();
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    const target = e.target as HTMLElement | null;
    const hit = target?.closest("[data-voice]");
    if (!moved.current && hit) {
      goTo(Number(hit.getAttribute("data-voice")));
      return;
    }
    window.setTimeout(() => {
      auto.current = true;
    }, 1400);
  }

  if (reduced) {
    return (
      <section id="voices" className="bg-bg px-4 py-24 sm:px-6 sm:py-28">
        <Header />
        <div className="mx-auto mt-14 flex max-w-6xl gap-4 overflow-x-auto pb-4">
          {list.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              className="w-[min(86vw,20rem)] shrink-0"
            />
          ))}
        </div>
        <LeaveVoice />
      </section>
    );
  }

  return (
    <section id="voices" className="relative bg-bg py-20 sm:py-24">
      <Header />
      <div
        className="relative mx-auto mt-2 h-[28rem] w-full cursor-grab overflow-hidden touch-none select-none active:cursor-grabbing sm:h-[34rem] lg:h-[40rem]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-roledescription="carousel"
        aria-label="What people say"
      >
        {list.map((voice, i) => (
          <div
            key={voice.id}
            data-voice={i}
            ref={(el) => {
              slotRefs.current[i] = el;
            }}
            className="absolute top-1/2 left-1/2 cursor-pointer will-change-transform"
            style={{
              width: card.w,
              height: card.h,
              transform: "translate(-50%, -50%)",
            }}
          >
            <VoiceCard
              voice={voice}
              featured={i === active}
              className="h-full w-full"
            />
          </div>
        ))}
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_50%_55%,transparent_22%,var(--color-bg)_84%)]" />
      </div>
      <div className="relative z-10 mt-1 flex justify-center gap-2">
        {list.map((voice, i) => (
          <button
            key={voice.id}
            type="button"
            aria-label={`Show ${voice.name}`}
            onClick={() => goTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-[width,background-color] duration-300",
              i === active ? "w-7 bg-fg" : "w-2 bg-fg/25 hover:bg-fg/50",
            )}
          />
        ))}
      </div>
      <LeaveVoice />
    </section>
  );
}

function Header() {
  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
      <p className="kicker">Hear real voice</p>
      <h2 className="mt-5 font-sans text-4xl font-medium tracking-[-0.04em] text-fg sm:text-5xl">
        What people say
        <br />
        <em className="font-serif font-normal italic">about Zuvaan</em>
      </h2>
      <p className="mt-4 text-sm text-muted">
        Drag the ring. Click a card. It keeps turning on its own.
      </p>
    </div>
  );
}

function VoiceCard({
  voice,
  className,
  featured = false,
}: {
  voice: Testimonial;
  className?: string;
  featured?: boolean;
}) {
  return (
    <article
      className={cn(
        "relative h-full overflow-hidden rounded-[1.75rem] text-left shadow-[var(--shadow-glass)]",
        !voice.image && (toneClass[voice.tone] ?? "bg-sand text-primary-fg"),
        className,
      )}
    >
      {voice.image ? (
        <>
          <img
            src={voice.image}
            alt=""
            className="absolute inset-0 size-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-linear-to-t from-bg/90 via-bg/20 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-fg">{voice.quote}</p>
            <p className="mt-4 text-xs text-fg/70">
              {voice.name}, {voice.role}
            </p>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col justify-between p-5 sm:p-6">
          <p className="text-sm leading-relaxed">{voice.quote}</p>
          <p className={cn("text-xs opacity-70", featured && "opacity-90")}>
            {voice.name}, {voice.role}
          </p>
        </div>
      )}
    </article>
  );
}

function LeaveVoice() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await submitVoice({
        data: {
          quote: String(data.get("quote") ?? ""),
          name: String(data.get("name") ?? ""),
          role: String(data.get("role") ?? ""),
        },
      });
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send this.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 mx-auto mt-16 max-w-xl px-4">
      {sent ? (
        <p className="rounded-[1.5rem] bg-elevated px-6 py-8 text-center text-sm text-muted shadow-[var(--shadow-border)]">
          Held for the house. Superadmin will read it before it joins the ring.
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="rounded-[1.75rem] bg-elevated p-6 shadow-[var(--shadow-border)]"
        >
          <p className="kicker">Leave a word</p>
          <h3 className="mt-2 font-sans text-xl font-medium tracking-tight">
            Tell the farm what changed
          </h3>
          <div className="mt-5 grid gap-3">
            <Textarea
              name="quote"
              required
              placeholder="A few honest lines…"
              className="min-h-24"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="name" required placeholder="Your name" />
              <Input name="role" placeholder="Chef, neighbour, kitchen…" />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send to the farm"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
