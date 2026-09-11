export type ImageSlot = {
  key: string;
  label: string;
  group: string;
  fallback: string;
};

export const IMAGE_SLOTS: ImageSlot[] = [
  { key: "hero", label: "Home hero", group: "Home", fallback: "/images/farm-landscape.jpg" },
  { key: "harvest", label: "Harvest portrait", group: "Home", fallback: "/images/ramsey-field.jpg" },
  { key: "visitCta", label: "Visit banner", group: "Home", fallback: "/images/flowers.jpg" },
  { key: "methodsBg", label: "Methods background", group: "Home", fallback: "/images/farm-landscape.jpg" },
  { key: "farmHero", label: "Farm page hero", group: "Pages", fallback: "/images/farm-landscape.jpg" },
  { key: "farmGreenhouse", label: "Greenhouse", group: "Pages", fallback: "/images/greenhouse.jpg" },
  { key: "farmDragon", label: "Dragon fruit pillars", group: "Pages", fallback: "/images/dragon.jpg" },
  { key: "farmNursery", label: "Nursery", group: "Pages", fallback: "/images/nursery.jpg" },
  { key: "produceHero", label: "Produce hero", group: "Pages", fallback: "/images/dragon.jpg" },
  { key: "storyHero", label: "Story hero", group: "Pages", fallback: "/images/ramsey-field.jpg" },
  { key: "storyPortrait", label: "Ramsey portrait", group: "Pages", fallback: "/images/ramsey-field.jpg" },
  { key: "visitHero", label: "Visit hero", group: "Pages", fallback: "/images/flowers.jpg" },
  { key: "methodWalk", label: "Method: farm walks", group: "Home", fallback: "/images/hero.jpg" },
  { key: "methodForecast", label: "Method: season forecast", group: "Home", fallback: "/images/greenhouse.jpg" },
  { key: "methodMix", label: "Method: crop mix", group: "Home", fallback: "/images/dragon.jpg" },
];

export const SLOT_FALLBACK: Record<string, string> = Object.fromEntries(
  IMAGE_SLOTS.map((s) => [s.key, s.fallback]),
);
