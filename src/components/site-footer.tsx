import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/logo";
import { PartnerMarks } from "@/components/partner-marks";
import { SocialLinks } from "@/components/social-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nav, site } from "@/data/site";

export function SiteFooter() {
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!email) return;
    const prev = JSON.parse(localStorage.getItem("zuvaan-news") || "[]") as string[];
    localStorage.setItem("zuvaan-news", JSON.stringify([...prev, email]));
    setDone(true);
  }

  return (
    <footer className="bg-bg px-4 pb-10 pt-16 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Logo />
          <ul className="mt-8 space-y-2 text-sm text-muted">
            {nav.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/story" className="hover:text-fg">
                Story
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-fg">
                Staff desk
              </Link>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-fg">
                Contacts
              </a>
            </li>
          </ul>
          <SocialLinks className="mt-6" />
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col justify-between rounded-3xl bg-sage p-6 text-primary-fg sm:p-8"
        >
          <p className="font-serif text-3xl italic leading-tight sm:text-4xl">
            {done ? "You are on the list." : "Subscribe to our news later"}
          </p>
          {done ? (
            <p className="mt-8 text-sm text-primary-fg/80">
              Moon letters, harvest notes, and visit days, sent when there is
              something worth saying.
            </p>
          ) : (
            <div className="mt-10 flex gap-2">
              <Input
                name="email"
                type="email"
                required
                placeholder="Your email"
                className="bg-fg/90 text-primary-fg placeholder:text-primary-fg/50"
              />
              <Button type="submit" variant="dark" size="lg" aria-label="Subscribe">
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </form>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-border pt-6">
        <p className="kicker">Licence entities</p>
        <div className="mt-4">
          <PartnerMarks size="footer" />
        </div>
        <div className="mt-8 flex flex-col gap-2 text-xs text-subtle sm:flex-row sm:justify-between">
          <p>
            {site.name} · {site.company} · {site.island}
          </p>
          <p>{site.dhivehi}</p>
        </div>
      </div>
    </footer>
  );
}
