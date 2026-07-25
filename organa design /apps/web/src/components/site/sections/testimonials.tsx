import * as React from "react";
import { Coffee, Wallet, Building2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VALUE_SCENARIOS } from "@/components/site/nav-config";
import { cn } from "@/lib/utils";

const ICONS = { coffee: Coffee, wallet: Wallet, building: Building2 } as const;

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
          >
            Built for real days, not demos
          </Badge>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            The problems we're actually solving.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Organa is early — we're building alongside the first Tunisian
            owners piloting it, not shipping a finished product to a crowd.
            Here's the everyday friction it's built to remove.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {VALUE_SCENARIOS.map((s) => (
            <ScenarioCard key={s.scenario} scenario={s} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#get-started"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-teal dark:text-brand-cyan hover:gap-2.5 transition-all"
          >
            Want to be one of the first pilot businesses?
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ScenarioCard({
  scenario,
}: {
  scenario: (typeof VALUE_SCENARIOS)[number];
}) {
  const accentClass = {
    teal: "bg-brand-teal text-white",
    cyan: "bg-brand-cyan text-white",
    deep: "bg-brand-teal/80 text-white",
  }[scenario.accent];
  const Icon = ICONS[scenario.icon];

  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-card p-6 hover:shadow-brand-lg transition-shadow">
      <div
        className={cn(
          "grid h-11 w-11 place-items-center rounded-full shrink-0",
          accentClass,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-base font-semibold">{scenario.scenario}</h3>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <span className="text-foreground/60 line-through decoration-muted-foreground/40">
          {scenario.problem}
        </span>
      </p>
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-foreground/90">
        {scenario.solution}
      </p>
    </div>
  );
}
