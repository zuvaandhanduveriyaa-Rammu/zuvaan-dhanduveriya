import { PartnerMarks } from "@/components/partner-marks";

export function Trusted() {
  return (
    <section className="bg-bg px-4 py-24 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="kicker">Partners</p>
        <h2 className="mt-5 font-sans text-4xl font-medium tracking-[-0.04em] text-fg sm:text-5xl">
          Trusted by{" "}
          <em className="font-serif font-normal italic">kitchens</em>
          <br />
          around the atolls
        </h2>
      </div>
      <div className="mx-auto mt-12 max-w-4xl">
        <PartnerMarks size="home" />
      </div>
    </section>
  );
}
