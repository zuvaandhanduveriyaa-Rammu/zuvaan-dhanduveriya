import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { HeaderCart } from "@/components/cart-drawer";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { nav } from "@/data/site";
import { cn } from "@/lib/utils";

function NavItem({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  if (href.includes("#") || href.startsWith("http")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 px-4 transition-[padding,background-color] duration-300 sm:px-6",
        scrolled ? "bg-bg/70 py-3 backdrop-blur-xl" : "bg-transparent pt-4 sm:pt-5",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Logo />

        <nav
          className="hidden items-center rounded-full bg-bg/55 px-1.5 py-1 shadow-[var(--shadow-border)] backdrop-blur-xl md:flex"
          aria-label="Primary"
        >
          {nav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-[0.8rem] text-fg/80 transition-colors hover:bg-fg/8 hover:text-fg"
            >
              {item.label}
            </NavItem>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <HeaderCart />
          <Link
            to="/story"
            className="rounded-full px-3.5 py-2 text-[0.8rem] text-fg/80 transition-colors hover:text-fg"
          >
            Story
          </Link>
          <Link to="/visit" className="inline-flex">
            <Button size="sm" className="pl-4 pr-3">
              Book a visit
              <span className="grid size-5 place-items-center rounded-full bg-primary-fg/10">
                <ArrowUpRight className="size-3" />
              </span>
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full bg-bg/55 text-fg shadow-[var(--shadow-border)] backdrop-blur-xl md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="mx-auto mt-3 max-w-6xl rounded-3xl bg-surface p-4 shadow-[var(--shadow-border)] md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {nav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm text-fg hover:bg-fg/6"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavItem>
            ))}
            <Link
              to="/story"
              className="rounded-2xl px-4 py-3 text-sm text-fg hover:bg-fg/6"
              onClick={() => setOpen(false)}
            >
              Story
            </Link>
            <Link
              to="/order"
              className="rounded-2xl px-4 py-3 text-sm text-fg hover:bg-fg/6"
              onClick={() => setOpen(false)}
            >
              Crate
            </Link>
            <Link to="/visit" className="mt-2" onClick={() => setOpen(false)}>
              <Button className="w-full">Book a visit</Button>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
