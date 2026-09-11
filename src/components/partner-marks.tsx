import { usePartners } from "@/components/catalog";
import { cn } from "@/lib/utils";

export function PartnerMarks({
  size = "home",
}: {
  size?: "home" | "footer";
}) {
  const partners = usePartners();
  if (partners.length === 0) return null;

  const home = size === "home";

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center",
        home
          ? "justify-center gap-x-8 gap-y-6"
          : "justify-start gap-x-5 gap-y-3",
      )}
    >
      {partners.map((partner) => {
        const inner = (
          <>
            {partner.logo ? (
              <img
                src={partner.logo}
                alt=""
                className={cn(
                  "mark-quiet object-contain",
                  home ? "h-8 w-auto max-w-14" : "h-5 w-auto max-w-10",
                )}
              />
            ) : (
              <span
                className={cn(
                  "grid place-items-center rounded-md bg-fg/10 font-medium text-muted",
                  home ? "size-8 text-[0.65rem]" : "size-5 text-[0.55rem]",
                )}
              >
                {partner.name.slice(0, 1)}
              </span>
            )}
            <span className="min-w-0">
              <span
                className={cn(
                  "block tracking-[0.16em] text-muted uppercase",
                  home ? "text-[0.65rem]" : "text-[0.6rem]",
                )}
              >
                {partner.name}
              </span>
              {home && partner.license ? (
                <span className="mt-0.5 block text-[0.65rem] text-subtle">
                  {partner.license}
                </span>
              ) : null}
            </span>
          </>
        );
        return (
          <li key={partner.id}>
            {partner.href ? (
              <a
                href={partner.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 opacity-80 transition-opacity hover:opacity-100"
              >
                {inner}
              </a>
            ) : (
              <div className="flex items-center gap-2.5 opacity-80">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
