import { Plus } from "lucide-react";
import { useState } from "react";
import { faqs } from "@/data/site";
import { cn } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState(faqs[1]?.q ?? "");

  return (
    <section className="bg-bg px-4 py-24 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="font-sans text-4xl font-medium tracking-[-0.04em] text-fg sm:text-5xl">
            Got any questions?
            <br />
            <em className="font-serif font-normal italic">We have answers</em>
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((item) => {
            const isOpen = open === item.q;
            return (
              <div
                key={item.q}
                className="rounded-2xl bg-elevated shadow-[var(--shadow-border)]"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? "" : item.q)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm text-fg"
                >
                  {item.q}
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-150",
                      isOpen
                        ? "bg-sage text-primary-fg"
                        : "bg-fg/8 text-fg",
                    )}
                  >
                    <Plus
                      className={cn(
                        "size-4 transition-transform duration-200",
                        isOpen && "rotate-45",
                      )}
                    />
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
