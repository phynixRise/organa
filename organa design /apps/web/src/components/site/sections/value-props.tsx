import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Globe2,
  Boxes,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ScrollReveal,
  ScrollRevealGroup,
  ScrollRevealItem,
} from "@/components/site/scroll-reveal";

const VALUES = [
  {
    icon: Layers,
    title: "One login, many businesses",
    body: "Own a café, a boutique and a gym? One Organa account, one subscription, switch between them like Slack workspaces. Staff get their own scoped memberships.",
    accent: "teal",
  },
  {
    icon: Globe2,
    title: "Built for Tunisia",
    body: "Prices in TND. Konnect checkout with e-Dinar and local cards. French and Arabic interfaces. WhatsApp-first notifications — the channel your customers actually use.",
    accent: "cyan",
  },
  {
    icon: Boxes,
    title: "One core, many verticals",
    body: "Every business type gets the modules it needs — POS, inventory, tables, appointments, memberships, patient records — on top of one shared, multi-tenant database.",
    accent: "deep",
  },
  {
    icon: TrendingUp,
    title: "Pay as you grow",
    body: "A single subscription covers every business you own. Start with one, add more as you grow, never pay per vertical. Grace period and WhatsApp reminder before suspension.",
    accent: "teal",
  },
];

export function ValueProps() {
  return (
    <section id="platform" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
            >
              Why Organa
            </Badge>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Stop juggling eight apps for eight businesses.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Most owners run a patchwork of Excel, WhatsApp and a different POS
              for each place. Organa replaces all of that with one subscription
              that actually fits the Tunisian market.
            </p>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <ScrollRevealItem key={v.title}>
              <ValueCard {...v} index={i} />
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}

type ValueCardProps = {
  icon: React.ElementType;
  title: string;
  body: string;
  accent: "teal" | "cyan" | "deep";
  index: number;
};

function ValueCard({ icon: Icon, title, body, accent, index }: ValueCardProps) {
  const accentClass = {
    teal: "bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white",
    cyan: "bg-brand-cyan/15 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-white",
    deep: "bg-brand-teal/5 text-brand-teal group-hover:bg-brand-teal group-hover:text-white",
  }[accent];

  return (
    <div className="group relative h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-brand-cyan/40 hover:shadow-brand-lg hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${accentClass} transition-colors`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-mono text-muted-foreground/60">
          0{index + 1}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {body}
      </p>
      <Link
        href="#how-it-works"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-teal hover:text-brand-cyan transition-colors"
      >
        Learn more
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
