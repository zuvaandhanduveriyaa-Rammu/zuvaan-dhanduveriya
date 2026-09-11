import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { useSlot } from "@/components/catalog";
import { methods } from "@/data/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farm")({ component: FarmPage });

function FarmPage() {
  const hero = useSlot("farmHero", "/images/farm-landscape.jpg");
  const greenhouse = useSlot("farmGreenhouse", "/images/greenhouse.jpg");
  const dragon = useSlot("farmDragon", "/images/dragon.jpg");
  const nursery = useSlot("farmNursery", "/images/nursery.jpg");
  const blocks = [
    {
      title: "Greenhouse lines",
      body: "Cucumber, tomato and leaf mix under cover: autopot irrigation, daily picks, a climate the atoll would not otherwise give. The house is quiet at noon. The vines do the talking.",
      image: greenhouse,
    },
    {
      title: "Dragon fruit pillars",
      body: "A one-foot stem becomes a fruiting plant within a year. In season a pillar can give twenty kilograms. Over nine hundred fruits have already left this plot for Addu tables.",
      image: dragon,
    },
    {
      title: "The shared nursery",
      body: "Trays and bagged starts kept for farmers of Meedhoo and beyond. Plants should leave with someone who will grow them. That is the whole idea.",
      image: nursery,
    },
  ];

  return (
    <main className="bg-bg text-fg">
      <PageHero
        kicker="The farm"
        title="Soil intelligence"
        italic="for a small island"
        lede="Greenhouse, pillars and nursery on Meedhoo, grown by Ramsey Hussain for kitchens that would rather taste the atoll than wait on a ship."
        image={hero}
      />

      <section className="mx-auto max-w-6xl space-y-16 px-4 py-20 sm:px-6">
        {blocks.map((block, i) => (
          <article
            key={block.title}
            className="grid items-center gap-8 lg:grid-cols-2"
          >
            <img
              src={block.image}
              alt={block.title}
              className={cn(
                "aspect-[4/3] w-full rounded-[1.75rem] object-cover",
                i % 2 ? "lg:order-2" : "",
              )}
            />
            <div>
              <p className="kicker">0{i + 1}</p>
              <h2 className="mt-3 font-sans text-3xl font-medium tracking-tight">
                {block.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                {block.body}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <p className="kicker">Methods</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {methods.map((m) => (
            <article
              key={m.title}
              className="rounded-[1.75rem] bg-elevated p-6 shadow-[var(--shadow-border)]"
            >
              <p className="text-xs tracking-wider text-subtle uppercase">
                {m.kicker}
              </p>
              <h3 className="mt-3 font-serif text-2xl italic">{m.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{m.body}</p>
            </article>
          ))}
        </div>
        <Link to="/visit" className="mt-10 inline-flex">
          <Button size="lg">Book a farm visit</Button>
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
