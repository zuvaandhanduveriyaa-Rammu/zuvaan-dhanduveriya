import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SiteImage } from "@/components/site-image";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function VisitCta() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const view = window.innerHeight;
      const p = (view - r.top) / (view + r.height);
      setShift((p - 0.5) * 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  return (
    <section
      ref={ref}
      className="relative isolate mx-4 overflow-hidden rounded-[2rem] sm:mx-6"
    >
      <SiteImage
        slot="visitCta"
        fallback="/images/flowers.jpg"
        alt="Tropical blooms at golden hour on Addu"
        className="absolute inset-0 size-full object-cover will-change-transform"
        style={{
          transform: `translate3d(0, ${shift}px, 0) scale(1.12)`,
        }}
      />
      <div className="absolute inset-0 bg-bg/45" />
      <div className="relative mx-auto flex min-h-[28rem] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="kicker">The walk</p>
        <h2 className="mt-5 font-sans text-4xl font-medium tracking-[-0.04em] text-fg sm:text-6xl">
          A farm visit
          <br />
          <em className="font-serif font-normal italic">made very easy</em>
        </h2>
        <p className="mt-5 max-w-md text-sm text-fg/80">
          From the Meedhoo jetty to the greenhouse. Walk the rows, taste dragon
          fruit, and talk soil with the farmer who grew it.
        </p>
        <Link to="/visit" className="mt-8">
          <Button size="lg" className="pl-5 pr-2.5">
            Get this with us
            <span className="grid size-7 place-items-center rounded-full bg-primary-fg text-primary">
              <ArrowUpRight className="size-3.5" />
            </span>
          </Button>
        </Link>
      </div>
    </section>
  );
}
