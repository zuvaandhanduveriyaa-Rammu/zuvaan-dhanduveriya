export const site = {
  name: "Zuvaan Dhanduveriya",
  short: "Zuvaan",
  dhivehi: "ޒުވާން ދަނޑުވެރިޔާ",
  farmer: "Ramsey Hussain",
  company: "Fresh Yield Pvt. Ltd.",
  tagline: "Island-grown, from Addu Meedhoo soil.",
  location: "Dhandamathi, Meedhoo, Addu City, 19010, Maldives",
  island: "Meedhoo, Addu",
  hours: "Open daily, 8:00 – 18:00",
  phone: "+960 000 0000",
  email: "hello@zuvaandhanduveriya.mv",
  socials: {
    x: "https://x.com/ZuvanDhaduveria",
    youtube: "https://www.youtube.com/@zuvaandhanduveriya",
    tiktok: "https://www.tiktok.com/@zuvaandhanduveriyaa",
  },
};

export const nav = [
  { label: "Farm", href: "/farm" },
  { label: "What we grow", href: "/produce" },
  { label: "Order", href: "/order" },
  { label: "Visit", href: "/visit" },
];

export const produce = [
  {
    id: "dragon",
    name: "Dragon fruit",
    kind: "Fruit",
    season: "Peak Nov–Apr",
    note: "Organic pitaya from concrete pillars. A pillar can yield ~20 kg in season.",
    image: "/images/dragon.jpg",
    unit: "kg",
  },
  {
    id: "cucumber",
    name: "Greenhouse cucumber",
    kind: "Greenhouse",
    season: "Year-round",
    note: "Long English cucumbers, harvested daily from hanging vines.",
    image: "/images/produce-cucumber.jpg",
    unit: "kg",
  },
  {
    id: "tomato",
    name: "Vine tomato",
    kind: "Greenhouse",
    season: "Year-round",
    note: "Cluster tomatoes grown in autopot lines under island light.",
    image: "/images/produce-tomato.jpg",
    unit: "kg",
  },
  {
    id: "greens",
    name: "Leaf & salad mix",
    kind: "Greenhouse",
    season: "Weekly",
    note: "Fast-turn greens for kitchens in Addu and Fuvahmulah.",
    image: "/images/greenhouse.jpg",
    unit: "bunch",
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    kind: "Field",
    season: "Visit days",
    note: "Chewed fresh with visitors on the walk between rows.",
    image: "/images/farm-landscape.jpg",
    unit: "stick",
  },
  {
    id: "nursery",
    name: "Nursery plants",
    kind: "Nursery",
    season: "Always",
    note: "Trays and bagged starts for island farmers, shared from the Meedhoo nursery.",
    image: "/images/nursery.jpg",
    unit: "tray",
  },
] as const;

export const methods = [
  {
    title: "Farm walks & tasting",
    kicker: "Natural questions",
    body: "Ask about the soil in plain language. Walk the rows, taste what is ripe, and leave with a crate if you want one.",
    image: "/images/hero.jpg",
  },
  {
    title: "Season forecast",
    kicker: "Predictive growing",
    body: "Autopot lines and greenhouse rhythm let us plan harvests weeks ahead, for kitchens that cannot miss a delivery.",
    image: "/images/greenhouse.jpg",
  },
  {
    title: "Smart crop mix",
    kicker: "Island categorisation",
    body: "Dragon fruit on pillars, vegetables under cover, a nursery for neighbours. Each crop earns its square of Meedhoo land.",
    image: "/images/dragon.jpg",
  },
] as const;

export const voices = [
  {
    quote:
      "Switching to island produce for our kitchen has made my week simpler. I cannot imagine going back to waiting on the boat.",
    name: "Mariyam A.",
    role: "Chef, Addu",
    tone: "sand",
    image: null,
  },
  {
    quote:
      "Zuvaan Dhanduveriya has completely changed how we think about growing food on a small island. The greenhouse is quiet, exact, and generous.",
    name: "Ibrahim R.",
    role: "Meedhoo neighbour",
    tone: "photo",
    image: "/images/voice-ibrahim.jpg",
  },
  {
    quote:
      "Thanks to this farm I feel in control of what we serve. Highly recommended for anyone serious about island food.",
    name: "Samantha K.",
    role: "Guest, Hulhumeedhoo",
    tone: "photo",
    image: "/images/voice-samantha.jpg",
  },
  {
    quote:
      "I never thought this simple a farm visit could restore my confidence in local growing.",
    name: "Hassan D.",
    role: "Buyer, Fuvahmulah",
    tone: "photo",
    image: "/images/voice-hassan.jpg",
  },
  {
    quote:
      "We tasted sugarcane between the rows. I left with a crate and a plan for next week’s kitchen.",
    name: "Aisha F.",
    role: "Cook, Gan",
    tone: "photo",
    image: "/images/voice-aisha.jpg",
  },
  {
    quote:
      "The cucumber from the greenhouse lasts days longer than anything that came off the ferry.",
    name: "Fathimath N.",
    role: "Home cook, Hithadhoo",
    tone: "dusk",
    image: null,
  },
  {
    quote:
      "I walk the nursery whenever I am on Meedhoo. Plants leave with people who will actually grow them.",
    name: "Yoosuf M.",
    role: "Farmer, Hulhudhoo",
    tone: "lagoon",
    image: null,
  },
  {
    quote:
      "Dragon fruit off the pillar, still warm from the morning. That is the whole argument for this farm.",
    name: "Hawwa S.",
    role: "Host, Addu",
    tone: "sage",
    image: null,
  },
] as const;

export const faqs = [
  {
    q: "What does a farm visit actually include?",
    a: "A walk of the greenhouse, dragon-fruit pillars and nursery, a tasting of whatever is ripe that morning, and time with Ramsey to talk soil, seasons and orders. Visits run 8:00–18:00. Come early or late for kinder light.",
  },
  {
    q: "Is the produce organic and grown on Meedhoo?",
    a: "Dragon fruit is grown organically on-island. Greenhouse lines use autopot irrigation. Everything we sell as Fresh Yield is harvested here in Addu Meedhoo. We do not relabel imports.",
  },
  {
    q: "Do you supply kitchens in Addu and Fuvahmulah?",
    a: "Yes. Fresh Yield delivers greenhouse produce and dragon fruit across Addu and Fuvahmulah. Message us with a weekly list and we will confirm what the house can pick.",
  },
  {
    q: "How do I get to the farm from the jetty?",
    a: "From Meedhoo Ferry Terminal it is a 15–20 minute walk east along Meedhoo Main Road to Dhandamathi. The farm sits on the right with signage. A taxi is 5–10 minutes, typically MVR 50–75.",
  },
  {
    q: "Can other farmers take nursery plants?",
    a: "The nursery is kept for island farmers and the wider environment. Come and see the trays. We would rather plants leave with someone who will grow them than sit unused.",
  },
];

export const harvest = {
  monthLabel: "This moon",
  totalKg: 1240,
  bars: [
    { label: "Dragon fruit", value: 320, max: 420, tone: "sage" },
    { label: "Greenhouse", value: 610, max: 700, tone: "mist" },
    { label: "Nursery out", value: 310, max: 500, tone: "muted" },
  ],
  todayKg: 42,
  todayNote: "Picked before noon",
};
