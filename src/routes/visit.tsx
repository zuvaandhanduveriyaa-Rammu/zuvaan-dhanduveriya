import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { VisitForm } from "@/components/visit-form";
import { useSlot } from "@/components/catalog";
import { site } from "@/data/site";

export const Route = createFileRoute("/visit")({ component: VisitPage });

function VisitPage() {
  const hero = useSlot("visitHero", "/images/flowers.jpg");

  return (
    <main className="bg-bg text-fg">
      <PageHero
        kicker="Visit"
        title="Come walk the rows"
        italic="of Meedhoo"
        lede="Open daily from eight until six. Wear comfortable shoes. Bring a bottle. Ask every question the soil invites."
        image={hero}
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="kicker">How to arrive</p>
          <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight">
            From the jetty
            <br />
            <em className="font-serif font-normal italic">to the greenhouse</em>
          </h2>
          <ul className="mt-8 space-y-5 text-sm leading-relaxed text-muted">
            <li>
              <strong className="text-fg">Walk</strong>: 15–20 minutes east
              along Meedhoo Main Road to Dhandamathi. The farm is on the right.
            </li>
            <li>
              <strong className="text-fg">Taxi</strong>: 5–10 minutes from the
              ferry terminal, typically MVR 50–75.
            </li>
            <li>
              <strong className="text-fg">Hours</strong>: {site.hours}. Early
              morning and late afternoon are cooler, and the light is kinder.
            </li>
            <li>
              <strong className="text-fg">Find us</strong>: {site.location}
            </li>
          </ul>
        </div>
        <VisitForm />
      </section>
      <SiteFooter />
    </main>
  );
}
