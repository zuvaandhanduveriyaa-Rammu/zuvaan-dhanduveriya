import { forwardRef, type ImgHTMLAttributes } from "react";
import { useSlot } from "@/components/catalog";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  slot: string;
  fallback: string;
};

export const SiteImage = forwardRef<HTMLImageElement, Props>(function SiteImage(
  { slot, fallback, alt, ...props },
  ref,
) {
  const src = useSlot(slot, fallback);
  return <img ref={ref} src={src} alt={alt ?? ""} {...props} />;
});
