import { type ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = useReducedMotion();
  const show = reduced || inView;

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        show
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-3 opacity-0 blur-[4px]",
        className,
      )}
      style={{ transitionDelay: reduced ? "0ms" : `${delay}ms` }}
    >
      {children}
    </div>
  );
}
