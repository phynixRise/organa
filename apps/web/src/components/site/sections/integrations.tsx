import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import { CreditCard, MessageCircle, Mail, Smartphone, Globe, Receipt } from "lucide-react";

const INTEGRATIONS = [
  {
    name: "Konnect",
    icon: CreditCard,
    category: "Payments",
    desc: "TND, e-Dinar, local & international cards",
    tone: "teal",
    status: "Primary",
  },
  {
    name: "WhatsApp Business",
    icon: MessageCircle,
    category: "Notifications",
    desc: "Receipts, reminders, subscription warnings",
    tone: "cyan",
    status: "Primary",
  },
  {
    name: "e-Dinar",
    icon: Smartphone,
    category: "Payments",
    desc: "Local card & e-wallet support",
    tone: "deep",
    status: "Via Konnect",
  },
  {
    name: "Flouci",
    icon: Globe,
    category: "Payments",
    desc: "Secondary gateway (roadmap)",
    tone: "teal",
    status: "Planned",
  },
  {
    name: "Resend",
    icon: Mail,
    category: "Email",
    desc: "Fallback channel for receipts & reports",
    tone: "cyan",
    status: "Fallback",
  },
  {
    name: "Twilio SMS",
    icon: Receipt,
    category: "SMS",
    desc: "Backup notifications when WhatsApp is down",
    tone: "deep",
    status: "Fallback",
  },
];

export function Integrations() {
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <Badge
              variant="outline"
              className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
            >
              Integrations
            </Badge>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Plugs into the tools Tunisians already use.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No Stripe. No PayPal. Organa is wired for the local payment and
              communication channels your customers actually reach for.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.map((int) => (
              <div
                key={int.name}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 hover:border-brand-cyan/40 hover:shadow-brand transition-all"
              >
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                    int.tone === "teal"
                      ? "bg-brand-teal/10 text-brand-teal"
                      : int.tone === "cyan"
                        ? "bg-brand-cyan/15 text-brand-cyan"
                        : "bg-brand-teal/5 text-brand-teal dark:bg-brand-cyan/10 dark:text-brand-cyan"
                  } group-hover:scale-105 transition-transform`}
                >
                  <int.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-bold tracking-tight truncate">
                      {int.name}
                    </h3>
                    <span
                      className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide rounded-full px-1.5 py-0.5 ${
                        int.status === "Primary"
                          ? "bg-brand-teal/10 text-brand-teal dark:bg-brand-cyan/15 dark:text-brand-cyan"
                          : int.status === "Planned"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {int.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {int.category}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {int.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
