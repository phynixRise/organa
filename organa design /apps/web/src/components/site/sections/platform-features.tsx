import * as React from "react";
import {
  ShoppingCart,
  Boxes,
  CalendarClock,
  IdCard,
  FileHeart,
  UsersRound,
  MessageCircle,
  CreditCard,
  Languages,
  BarChart3,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: ShoppingCart,
    title: "Orders / POS",
    body: "Fast, offline-tolerant checkout tuned to each vertical. Barcode scanning, tabs, course pacing — whichever applies.",
  },
  {
    icon: Boxes,
    title: "Inventory",
    body: "Stock-on-hand, variants, supplier orders, low-stock alerts. Deducted automatically on every sale.",
  },
  {
    icon: UsersRound,
    title: "Staff scheduling",
    body: "Shifts, roles and permissions per org. Staff get their own login scoped to one business.",
  },
  {
    icon: CalendarClock,
    title: "Appointments & classes",
    body: "Double-booking prevention enforced at the database level. Classes for gyms, slots for cabinets.",
  },
  {
    icon: IdCard,
    title: "Memberships",
    body: "Recurring memberships for gyms and clubs, with check-ins, renewals and grace periods.",
  },
  {
    icon: FileHeart,
    title: "Patient records",
    body: "Private, access-controlled records for cabinet médical — with column-level encryption on the roadmap.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp notifications",
    body: "Receipts, appointment reminders and subscription warnings via WhatsApp Business API — the channel Tunisians use.",
  },
  {
    icon: CreditCard,
    title: "Konnect payments",
    body: "TND, e-Dinar and local cards. Recurring subscription billing built on top of one-off payment collection.",
  },
  {
    icon: Languages,
    title: "FR · AR · EN",
    body: "Multi-language interface with RTL support for Arabic. Localised per business, not just per account.",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    body: "Per-org and cross-org reports. Revenue, top items, staff performance — without slowing live traffic.",
  },
  {
    icon: Bell,
    title: "Event outbox",
    body: "One action (order placed, appointment booked) fans out to inventory, WhatsApp and analytics safely.",
  },
  {
    icon: ShieldCheck,
    title: "Tenant isolation",
    body: "Row-level security on every table. No query can ever cross tenants — even a bug can't leak data.",
  },
];

export function PlatformFeatures() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Badge
            variant="outline"
            className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
          >
            Platform
          </Badge>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            A shared core that bends to each vertical.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Twelve building blocks that combine differently per business type —
            so a café gets a café, not a stripped-down restaurant.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-brand-cyan/40 hover:bg-brand-teal-soft/30 dark:hover:bg-brand-teal-soft/10 transition-all"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-teal/10 text-brand-teal dark:text-brand-cyan dark:bg-brand-cyan/15 group-hover:scale-105 transition-transform">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display text-base font-bold tracking-tight">
                {f.title}
              </h3>
              <p
                className="mt-1.5 text-sm text-muted-foreground leading-relaxed"
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
