import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { readImageFile, readLogoFile } from "@/lib/image-file";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ImageField({
  value,
  onChange,
  label = "Image",
  variant = "photo",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  variant?: "photo" | "logo";
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logo = variant === "logo";

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      onChange(logo ? await readLogoFile(file) : await readImageFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-xs text-muted">{label}</span>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-elevated shadow-[var(--shadow-border)]",
          logo ? "aspect-square max-w-56 p-6" : "aspect-[4/3]",
          busy && "opacity-70",
        )}
      >
        {value ? (
          <img
            src={value}
            alt=""
            className={cn(
              "absolute inset-0 size-full",
              logo ? "object-contain p-5" : "object-cover",
            )}
          />
        ) : (
          <span className="flex flex-col items-center gap-2 text-xs text-muted">
            <ImagePlus className="size-5" />
            {logo ? "Upload a logo" : "Upload a photo"}
          </span>
        )}
        {value ? (
          <span className="absolute right-2 bottom-2 rounded-full bg-bg/80 px-2.5 py-1 text-[0.7rem] backdrop-blur">
            Replace
          </span>
        ) : null}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <Input
        defaultValue={value.startsWith("data:") ? "" : value}
        key={value.startsWith("data:") ? "data" : value.slice(0, 48)}
        placeholder="Or paste an image URL, then leave the field"
        onBlur={(e) => {
          const next = e.target.value.trim();
          if (next && next !== value) onChange(next);
        }}
      />
      {error ? <p className="text-xs text-sand">{error}</p> : null}
    </div>
  );
}
