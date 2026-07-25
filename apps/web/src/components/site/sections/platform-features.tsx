import * as React from "react";
import {
  ShoppingCart,
  Boxes,
  CalendarClock,
  MessageCircle,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: ShoppingCart,
    title: "POS & orders",
    body: "Fast checkout tuned to each vertical — barcode scanning, tabs, course pacing.",
  },
  {
    icon: Boxes,
    title: "Inventory",
    body: "Stock-on-hand, variants, low-stock alerts. Deducted automatically on every sale.",
  },
  {
    icon: CalendarClock,
    title: "Appointments",
    body: "Double-booking prevention at the database level. Classes for gyms, slots for cabinets.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    body: "Receipts, reminders and subscription warnings via the channel Tunisians actually use.",
  },
  {
    icon: CreditCard,
    title: "Konnect payments",
    body: "TND, e-Dinar and local cards. Subscription billing built on one-off payment collection.",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    body: "Per-org and cross-org reports. Revenue, top items, staff performance — without slowing traffic.",
  },
];

export function PlatformFeatures() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <Badge
            variant="outline"
            className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
          >
            Platform
          </Badge>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything you need. Nothing you don&apos;t.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-brand-cyan/40 hover:bg-brand-teal-soft/30 dark:hover:bg-brand-teal-soft/10 transition-all"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-teal/10 text-brand-teal dark:text-brand-cyan dark:bg-brand-cyan/15 group-hover:scale-105 transition-transform">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
