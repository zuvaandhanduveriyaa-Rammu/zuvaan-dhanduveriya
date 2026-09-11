import {
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-2 text-xs text-muted", className)}>
      {label}
      {children}
    </label>
  );
}

export function TextField(
  props: InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, className, ...rest } = props;
  return (
    <Field label={label} className={className}>
      <Input {...rest} />
    </Field>
  );
}

export function AreaField(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string },
) {
  const { label, className, ...rest } = props;
  return (
    <Field label={label} className={className}>
      <Textarea {...rest} />
    </Field>
  );
}

export function SelectField(
  props: SelectHTMLAttributes<HTMLSelectElement> & { label: string },
) {
  const { label, className, children, ...rest } = props;
  return (
    <Field label={label} className={className}>
      <select
        {...rest}
        className="h-11 w-full rounded-xl bg-elevated px-4 text-sm text-fg shadow-[var(--shadow-border)] outline-none"
      >
        {children}
      </select>
    </Field>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex h-11 items-center justify-between rounded-xl bg-elevated px-4 text-sm text-fg shadow-[var(--shadow-border)]"
    >
      <span className="text-muted">{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          checked ? "bg-sage" : "bg-fg/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-primary transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
    </button>
  );
}
