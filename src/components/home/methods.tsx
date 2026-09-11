import { ArrowUpRight } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { SiteImage } from "@/components/site-image";
import { Button } from "@/components/ui/button";
import { Mark } from "@/components/logo";
import { methods } from "@/data/site";
import { useInView } from "@/hooks/use-in-view";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  {
    q: "How can I take a crate this week?",
    a: "The house can spare 18 kg of cucumber and 6 kg of dragon fruit without dipping the kitchen reserve.",
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
  if (t.includes("dragon") || t.includes("fruit")) return QUESTIONS[1].a;
  if (t.includes("jetty") || t.includes("walk") || t.includes("visit"))
    return QUESTIONS[2].a;
  if (t.includes("kg") || t.includes("order") || t.includes("crate"))
    return QUESTIONS[0].a;
  return "Come in the morning. Wear shoes that can take a little soil, and we will walk whatever is ripe.";
}

function QueryCard() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(QUESTIONS[0].q);
  const [showAnswer, setShowAnswer] = useState(true);
  const [asking, setAsking] = useState(false);
  const [custom, setCustom] = useState<string | null>(null);
  const q = QUESTIONS[index] ?? QUESTIONS[0];

  useEffect(() => {
    if (asking || reduced) {
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
  }, [asking, index, q.q, reduced]);

  useEffect(() => {
    if (asking || reduced) return;
    const id = window.setInterval(() => {
      setCustom(null);
      setIndex((n) => (n + 1) % QUESTIONS.length);
    }, 7200);
    return () => window.clearInterval(id);
  }, [asking, reduced]);

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
    <div className="w-full max-w-lg rounded-[1.75rem] bg-elevated/90 p-5 shadow-[var(--shadow-glass)] backdrop-blur-xl">
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
          <p className="mt-3 text-sm font-medium text-fg">{typed}</p>
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed text-muted transition-opacity duration-500",
              showAnswer ? "opacity-100" : "opacity-0",
            )}
          >
            {custom ?? q.a}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Link to="/order" className="inline-flex">
              <Button size="sm" className="pl-4 pr-2">
                Get started
                <span className="grid size-5 place-items-center rounded-full bg-primary-fg/10">
                  <ArrowUpRight className="size-3" />
                </span>
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setAsking(true)}
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

export function Methods() {
  const { ref } = useInView<HTMLElement>();

  return (
    <section
      id="methods"
      ref={ref}
      className="relative isolate overflow-hidden bg-bg py-24 sm:py-28"
    >
      <SiteImage
        slot="methodsBg"
        fallback="/images/farm-landscape.jpg"
        alt=""
        className="absolute inset-0 size-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-bg/55" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker">Island intelligence</p>
          <h2 className="mt-5 font-sans text-4xl font-medium tracking-[-0.04em] text-fg sm:text-5xl">
            Your personal{" "}
            <em className="font-serif font-normal italic">island farmer</em>
          </h2>
          <p className="mt-4 text-sm text-muted">
            Ask in plain language. The house answers with what is actually on
            the vines, not a catalogue promise.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {methods.map((m, i) => (
            <article
              key={m.title}
              className="overflow-hidden rounded-[1.75rem] bg-elevated/85 shadow-[var(--shadow-border)] backdrop-blur"
            >
              <div className="p-5">
                <p className="text-[0.7rem] tracking-wider text-subtle uppercase">
                  0{i + 1} · {m.kicker}
                </p>
                <h3 className="mt-3 font-serif text-2xl italic">{m.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{m.body}</p>
              </div>
              <SiteImage
                slot={["methodWalk", "methodForecast", "methodMix"][i] ?? "methodWalk"}
                fallback={m.image}
                alt=""
                className="aspect-[16/10] w-full object-cover"
              />
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <QueryCard />
          <Link to="/farm" className="inline-flex">
            <Button size="lg" className="pl-5 pr-2.5">
              See the methods
              <span className="grid size-7 place-items-center rounded-full bg-primary-fg text-primary">
                <ArrowUpRight className="size-3.5" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
