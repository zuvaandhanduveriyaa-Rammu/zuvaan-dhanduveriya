import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <span
      className={cn("grid size-6 grid-cols-2 gap-0.5", className)}
      aria-hidden
    >
      <span className="rounded-[5px] bg-current" />
      <span className="rounded-[5px] bg-current opacity-80" />
      <span className="rounded-[5px] bg-current opacity-80" />
      <span className="rounded-[5px] bg-current" />
    </span>
  );
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-2.5 text-fg no-underline",
        className,
      )}
    >
      <Mark className="size-5 text-fg" />
      <span
        className={cn(
          "font-medium tracking-tight",
          compact ? "text-sm" : "text-[0.95rem]",
        )}
      >
        Zuvaan<span className="text-muted">Dhanduveriya</span>
      </span>
    </Link>
  );
}
