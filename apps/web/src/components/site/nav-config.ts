export type NavLink = {
  label: string;
  href: string;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Découvrir", href: "#top" },
  { label: "Mes entreprises", href: "#businesses" },
];

export type Vertical = {
  slug: string;
  name: string;
  french: string;
  emoji: string;
  tagline: string;
  description: string;
  modules: string[];
  status: "soon" | "early";
  accent: "teal" | "cyan" | "deep";
};

export const VERTICALS: Vertical[] = [
  {
    slug: "cafe",
    name: "Café",
    french: "Café",
    emoji: "☕",
    tagline: "Fast counter service",
    description:
      "Take orders at the counter, fire them to the bar, manage tabs and run loyalty — all in one tap.",
    modules: ["Orders / POS", "Inventory", "Staff scheduling"],
    status: "early",
    accent: "cyan",
  },
  {
    slug: "restaurant",
    name: "Restaurant",
    french: "Restaurant",
    emoji: "🍽️",
    tagline: "Tables, tickets, kitchen",
    description:
      "Table management, course pacing, kitchen display and a floor that never gets double-seated.",
    modules: ["Orders / POS", "Table management", "Inventory"],
    status: "soon",
    accent: "teal",
  },
  {
    slug: "boutique",
    name: "Boutique",
    french: "Boutique",
    emoji: "🛍️",
    tagline: "Retail that moves",
    description:
      "Barcode checkout, stock-on-hand, variants and supplier orders — the first vertical on Organa.",
    modules: ["Orders / POS", "Inventory", "Loyalty"],
    status: "early",
    accent: "deep",
  },
  {
    slug: "gym",
    name: "Gym",
    french: "Salle de sport",
    emoji: "🏋️",
    tagline: "Members & classes",
    description:
      "Memberships, class scheduling, check-ins and renewals — keep the room full and the books clean.",
    modules: ["Appointments", "Memberships", "Staff scheduling"],
    status: "soon",
    accent: "cyan",
  },
  {
    slug: "cabinet-medical",
    name: "Cabinet médical",
    french: "Cabinet médical",
    emoji: "➕",
    tagline: "Patients & records",
    description:
      "Appointments, patient records and billing with privacy-first access control built in.",
    modules: ["Appointments", "Patient records", "Staff scheduling"],
    status: "soon",
    accent: "teal",
  },
  {
    slug: "tienda",
    name: "Tienda",
    french: "Tienda",
    emoji: "🛒",
    tagline: "Neighbourhood retail",
    description:
      "A lightweight POS tuned for corner-shop retail — quick rings, daily close, simple stock.",
    modules: ["Orders / POS", "Inventory", "Staff scheduling"],
    status: "soon",
    accent: "deep",
  },
  {
    slug: "hotel",
    name: "Hotel",
    french: "Hôtel",
    emoji: "🏨",
    tagline: "Rooms, reservations, F&B",
    description:
      "Room inventory, reservations, check-in/out, housekeeping status and a restaurant POS — all under one roof, one bill.",
    modules: ["Rooms & reservations", "Check-in / out", "Orders / POS"],
    status: "soon",
    accent: "cyan",
  },
  {
    slug: "property",
    name: "Property & Rentals",
    french: "Immobilier & location",
    emoji: "🏠",
    tagline: "Buildings, units, tenants",
    description:
      "Own a building or rent houses? Track units, tenants and leases, collect rent monthly in TND, and log maintenance requests from one dashboard.",
    modules: ["Properties & units", "Leases & tenants", "Rent collection"],
    status: "soon",
    accent: "teal",
  },
];

export type Plan = {
  name: string;
  price: string;
  period: string;
  tagline: string;
  cta: string;
  highlighted?: boolean;
  features: string[];
  badge?: string;
};

export const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "49",
    period: "TND / month",
    tagline: "For a single business finding its feet.",
    cta: "Start free trial",
    features: [
      "1 business",
      "Orders / POS",
      "Inventory tracking",
      "1 staff seat",
      "WhatsApp receipts",
      "Konnect checkout (TND)",
    ],
  },
  {
    name: "Growth",
    price: "119",
    period: "TND / month",
    tagline: "For owners running more than one place.",
    cta: "Start free trial",
    highlighted: true,
    badge: "Most popular",
    features: [
      "Up to 3 businesses",
      "All modules per vertical",
      "5 staff seats",
      "Appointments & memberships",
      "WhatsApp + SMS notifications",
      "Priority support",
    ],
  },
  {
    name: "Scale",
    price: "Sur devis",
    period: "custom",
    tagline: "For groups, franchises and multi-site operators.",
    cta: "Talk to us",
    features: [
      "Unlimited businesses",
      "Custom roles & permissions",
      "Unlimited staff seats",
      "Audit log & data export",
      "Dedicated onboarding",
      "SLA & local support",
    ],
  },
];

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "Can I really run different business types from one login?",
    a: "Yes. One Organa account can own many organizations — a café, a boutique and a gym, for example — and you switch between them like Slack workspaces. Each business gets the modules that fit its type, but everything runs on one shared core.",
  },
  {
    q: "How does payment work in Tunisia?",
    a: "Organa uses Konnect, which supports Tunisian Dinar (TND), e-Dinar and local cards. Subscription billing is built on top of Konnect's one-off payment flow, with a grace period and a WhatsApp reminder before anything gets suspended.",
  },
  {
    q: "Is my data isolated from other businesses?",
    a: "Every business-data table is scoped by organization and protected by row-level security — no query can cross tenants, even by mistake. Sensitive records (like patient data) get additional access checks.",
  },
  {
    q: "What if my connection drops mid-sale?",
    a: "The order-taking flow keeps a small local queue, so a cashier can keep ringing up a sale when the network drops and sync the moment connectivity is back. The rest of the platform stays online as normal.",
  },
  {
    q: "Which languages does Organa support?",
    a: "The interface ships in French and Arabic, with English available for back-office work. Receipts and customer-facing messages are localised per business.",
  },
];

// ---- Module matrix (the "departments" each vertical gets) ----
export type ModuleCell = "yes" | "optional" | "no";

export type ModuleRow = {
  key: string;
  label: string;
  icon: string; // lucide icon name handled in component
  cells: Record<string, ModuleCell>;
};

// vertical order for the matrix columns (matches VERTICALS)
export const MATRIX_VERTICALS = [
  "cafe",
  "restaurant",
  "boutique",
  "tienda",
  "gym",
  "hotel",
  "property",
  "cabinet-medical",
] as const;

export const MODULE_MATRIX: ModuleRow[] = [
  {
    key: "pos",
    label: "Orders / POS",
    icon: "ShoppingCart",
    cells: {
      cafe: "yes",
      restaurant: "yes",
      boutique: "yes",
      tienda: "yes",
      gym: "optional",
      hotel: "yes",
      property: "no",
      "cabinet-medical": "no",
    },
  },
  {
    key: "tables",
    label: "Table management",
    icon: "Grid2x2",
    cells: {
      cafe: "no",
      restaurant: "yes",
      boutique: "no",
      tienda: "no",
      gym: "no",
      hotel: "yes",
      property: "no",
      "cabinet-medical": "no",
    },
  },
  {
    key: "rooms",
    label: "Rooms & reservations",
    icon: "BedDouble",
    cells: {
      cafe: "no",
      restaurant: "no",
      boutique: "no",
      tienda: "no",
      gym: "no",
      hotel: "yes",
      property: "no",
      "cabinet-medical": "no",
    },
  },
  {
    key: "properties",
    label: "Properties & units",
    icon: "Building2",
    cells: {
      cafe: "no",
      restaurant: "no",
      boutique: "no",
      tienda: "no",
      gym: "no",
      hotel: "optional",
      property: "yes",
      "cabinet-medical": "no",
    },
  },
  {
    key: "leases",
    label: "Leases & tenants",
    icon: "FileSignature",
    cells: {
      cafe: "no",
      restaurant: "no",
      boutique: "no",
      tienda: "no",
      gym: "no",
      hotel: "no",
      property: "yes",
      "cabinet-medical": "no",
    },
  },
  {
    key: "rent",
    label: "Rent collection",
    icon: "Wallet",
    cells: {
      cafe: "no",
      restaurant: "no",
      boutique: "no",
      tienda: "no",
      gym: "optional",
      hotel: "no",
      property: "yes",
      "cabinet-medical": "no",
    },
  },
  {
    key: "appointments",
    label: "Appointments",
    icon: "CalendarClock",
    cells: {
      cafe: "no",
      restaurant: "optional",
      boutique: "no",
      tienda: "no",
      gym: "yes",
      hotel: "optional",
      property: "no",
      "cabinet-medical": "yes",
    },
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: "Boxes",
    cells: {
      cafe: "yes",
      restaurant: "yes",
      boutique: "yes",
      tienda: "yes",
      gym: "optional",
      hotel: "yes",
      property: "no",
      "cabinet-medical": "no",
    },
  },
  {
    key: "memberships",
    label: "Memberships",
    icon: "IdCard",
    cells: {
      cafe: "no",
      restaurant: "no",
      boutique: "no",
      tienda: "no",
      gym: "yes",
      hotel: "no",
      property: "no",
      "cabinet-medical": "no",
    },
  },
  {
    key: "patient",
    label: "Patient records",
    icon: "FileHeart",
    cells: {
      cafe: "no",
      restaurant: "no",
      boutique: "no",
      tienda: "no",
      gym: "no",
      hotel: "no",
      property: "no",
      "cabinet-medical": "yes",
    },
  },
  {
    key: "staff",
    label: "Staff scheduling",
    icon: "UsersRound",
    cells: {
      cafe: "yes",
      restaurant: "yes",
      boutique: "yes",
      tienda: "yes",
      gym: "yes",
      hotel: "yes",
      property: "yes",
      "cabinet-medical": "yes",
    },
  },
  {
    key: "whatsapp",
    label: "WhatsApp receipts",
    icon: "MessageCircle",
    cells: {
      cafe: "yes",
      restaurant: "yes",
      boutique: "yes",
      tienda: "yes",
      gym: "yes",
      hotel: "yes",
      property: "yes",
      "cabinet-medical": "yes",
    },
  },
];

// ---- Testimonials ----
export type ValueScenario = {
  scenario: string;
  problem: string;
  solution: string;
  icon: "coffee" | "wallet" | "building";
  accent: "teal" | "cyan" | "deep";
};

export const VALUE_SCENARIOS: ValueScenario[] = [
  {
    scenario: "Running a café and a boutique",
    problem:
      "Two tills, two subscriptions, two sets of books to reconcile at the end of the night.",
    solution:
      "One login, one bill — switch between businesses in a tap, same account.",
    icon: "coffee",
    accent: "teal",
  },
  {
    scenario: "Getting paid without the reconciliation",
    problem:
      "Cash and bank transfers tracked by hand, hours spent matching totals every week.",
    solution:
      "Everything runs through Konnect in dinars, and the ledger keeps itself.",
    icon: "wallet",
    accent: "cyan",
  },
  {
    scenario: "Managing a rented building",
    problem:
      "Tracking who's paid and who's late means an entire spreadsheet per building.",
    solution:
      "See every unit's status at a glance, with automatic WhatsApp reminders for anyone late.",
    icon: "building",
    accent: "deep",
  },
];
