import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "pressable inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:bg-fg",
        ghost:
          "bg-transparent text-fg hover:bg-fg/8",
        outline:
          "text-fg hover:bg-fg/8",
        dark: "bg-bg text-fg hover:bg-elevated",
      },
      size: {
        sm: "h-9 px-3.5 text-sm rounded-full",
        md: "h-10 px-4 text-sm rounded-full",
        lg: "h-11 px-5 text-[0.95rem] rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

export { buttonVariants };
