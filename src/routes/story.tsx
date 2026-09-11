import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SocialLinks } from "@/components/social-links";
import { Button } from "@/components/ui/button";
import { useSlot } from "@/components/catalog";
import { site } from "@/data/site";

export const Route = createFileRoute("/story")({ component: StoryPage });

function StoryPage() {
  const hero = useSlot("storyHero", "/images/ramsey-field.jpg");
  const portrait = useSlot("storyPortrait", "/images/ramsey-field.jpg");

  return (
    <main className="bg-bg text-fg">
      <PageHero
        kicker="The farmer"
        title="Son of a fisherman"
        italic="keeper of soil"
        lede={`${site.farmer}, known across the islands as ${site.name}, grows food on Meedhoo so Addu tables do not have to wait on a ship.`}
        image={hero}
      />

      <section className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <img
          src={portrait}
          alt={`${site.farmer} on the farm`}
          className="aspect-[3/4] w-full rounded-[1.75rem] object-cover object-top"
        />
        <div className="max-w-xl">
          <p className="kicker">{site.dhivehi}</p>
          <h2 className="mt-4 font-sans text-3xl font-medium tracking-tight sm:text-4xl">
            A young farmer
            <br />
            <em className="font-serif font-normal italic">for the next table</em>
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
            <p>
              Ramsey Hussain is a farmer because the islands still eat from
              boats. He is the son of a fisherman, managing director of{" "}
              {site.company}, and a Grow with Ooredoo ambassador, known online
              as Zuvaan Dhanduveriya, the young farmer.
            </p>
            <p>
              On Meedhoo he keeps a greenhouse of cucumber and tomato, a field
              of dragon fruit on concrete pillars, and a nursery that other
              farmers may take from. Visitors walk the rows, taste what is ripe,
              and leave with a clearer picture of what an island can grow.
            </p>
            <p>
              The work is not a resort garden. It is a working house: autopot
              lines, daily picks, orders for Addu and Fuvahmulah kitchens, and
              the long patience of pitaya. A stem the length of a forearm
              becomes fruit within a year. A pillar, in season, can give twenty
              kilograms.
            </p>
            <p>
              If you come, come with questions. The farm is open every day from
              eight until six. Wear shoes that can take a little soil.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/visit">
              <Button size="lg">Book a visit</Button>
            </Link>
            <SocialLinks />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
