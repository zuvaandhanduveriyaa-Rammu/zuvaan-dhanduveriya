import { Globe } from "lucide-react";
import { useSocials } from "@/components/catalog";
import { cn } from "@/lib/utils";

function Glyph({ platform }: { platform: string }) {
  const common = "size-4";
  if (platform === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="currentColor">
        <path d="M23 12.2s0-3.4-.4-5c-.3-1.1-1.1-2-2.2-2.2C18.6 4.6 12 4.6 12 4.6s-6.6 0-8.4.4C2.5 5.3 1.7 6.1 1.4 7.2.9 8.8.9 12.2.9 12.2s0 3.4.5 5c.3 1.1 1.1 2 2.2 2.2 1.8.4 8.4.4 8.4.4s6.6 0 8.4-.4c1.1-.3 1.9-1.1 2.2-2.2.4-1.6.4-5 .4-5zM9.8 15.6V8.8l6.4 3.4-6.4 3.4z" />
      </svg>
    );
  }
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="currentColor">
        <path d="M14.2 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.1H8.6v2.8h2.4V21h3.2z" />
      </svg>
    );
  }
  if (platform === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="currentColor">
        <path d="M14.2 3h2.3c.3 2.3 1.6 3.8 3.8 4.1v2.4c-1.4 0-2.6-.4-3.8-1.2v6.6c0 3.5-2.6 5.8-6.2 5.8S4 18.4 4 14.9 6.7 9 10.3 9c.3 0 .7 0 1 .1v2.5c-.3-.1-.7-.2-1-.2-1.8 0-3.1 1.3-3.1 3.4s1.3 3.4 3.1 3.4 3.1-1.3 3.1-3.4V3z" />
      </svg>
    );
  }
  if (platform === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="currentColor">
        <path d="M12 3.2A8.7 8.7 0 0 0 4.4 16.4L3 21l4.7-1.3A8.8 8.8 0 1 0 12 3.2zm4.9 12.3c-.2.6-1.2 1.1-1.9 1.2-.5.1-1.1.2-3.6-.8-3.1-1.2-5-4.2-5.2-4.4-.2-.2-1.4-1.9-1.4-3.6 0-1.7.9-2.5 1.2-2.8.3-.3.7-.4 1-.4h.8c.2 0 .5 0 .8.6l1 2.5c.1.2.1.4 0 .6l-.4.7c-.2.2-.3.4-.1.7.5.8 1.3 1.7 2.1 2.2.3.2.5.2.7 0l.7-.8c.2-.2.4-.2.6-.1l2.4 1.2c.3.1.4.3.5.5 0 .6-.3 1.6-.9 2.1z" />
      </svg>
    );
  }
  if (platform === "x") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden fill="currentColor">
        <path d="M13.6 10.5 20.4 3h-1.6l-5.9 6.5L8.1 3H3.5l7.2 10.2L3.5 21h1.6l6.3-6.9 5 6.9h4.6L13.6 10.5zm-2.2 2.4-.8-1.1L5.7 4.2h2.4l4.7 6.6.8 1.1 6.3 8.8h-2.4l-5.1-7.3z" />
      </svg>
    );
  }
  return <Globe className={common} />;
}

export function SocialLinks({ className }: { className?: string }) {
  const socials = useSocials();
  if (socials.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-1", className)}>
      {socials.map((item) => (
        <li key={item.id}>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            aria-label={item.label}
            className="grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-fg/8 hover:text-fg"
          >
            <Glyph platform={item.platform} />
          </a>
        </li>
      ))}
    </ul>
  );
}
