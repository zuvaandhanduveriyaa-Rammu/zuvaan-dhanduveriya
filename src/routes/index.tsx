import { createFileRoute } from "@tanstack/react-router";
import { Faq } from "@/components/home/faq";
import { Harvest } from "@/components/home/harvest";
import { Hero } from "@/components/home/hero";
import { Methods } from "@/components/home/methods";
import { Trusted } from "@/components/home/trusted";
import { VisitCta } from "@/components/home/visit-cta";
import { Voices } from "@/components/home/voices";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="bg-bg text-fg">
      <SiteHeader />
      <Hero />
      <Voices />
      <Reveal>
        <Trusted />
      </Reveal>
      <Reveal>
        <Harvest />
      </Reveal>
      <Methods />
      <VisitCta />
      <Reveal>
        <Faq />
      </Reveal>
      <SiteFooter />
    </main>
  );
}
