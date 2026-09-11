import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl bg-elevated px-4 text-sm text-fg placeholder:text-subtle",
        "shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150",
        "focus-visible:shadow-[var(--shadow-border-hover)]",
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-xl bg-elevated px-4 py-3 text-sm text-fg placeholder:text-subtle",
        "shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150",
        "focus-visible:shadow-[var(--shadow-border-hover)]",
        className,
      )}
      {...props}
    />
  );
});
