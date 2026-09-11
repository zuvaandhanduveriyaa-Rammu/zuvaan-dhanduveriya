import { SiteHeader } from "@/components/site-header";

export function PageHero({
  kicker,
  title,
  italic,
  lede,
  image,
}: {
  kicker: string;
  title: string;
  italic?: string;
  lede: string;
  image: string;
}) {
  return (
    <section className="relative isolate min-h-[70dvh] overflow-hidden bg-bg">
      <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-b from-bg/50 via-bg/35 to-bg" />
      <SiteHeader />
      <div className="relative mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-end px-6 pb-16 pt-32 text-center">
        <p className="kicker">{kicker}</p>
        <h1 className="mt-5 font-sans text-4xl font-medium tracking-[-0.04em] text-fg sm:text-6xl">
          {title}
          {italic ? (
            <>
              <br />
              <em className="font-serif font-normal italic">{italic}</em>
            </>
          ) : null}
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-fg/80">{lede}</p>
      </div>
    </section>
  );
}
