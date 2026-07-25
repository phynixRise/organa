import * as React from "react";
import { VERTICALS } from "@/components/site/nav-config";

export function BusinessMarquee() {
  const loop = [...VERTICALS, ...VERTICALS];

  return (
    <section
      aria-label="Business types Organa supports"
      className="relative border-y border-border bg-background py-5 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-max animate-marquee items-center gap-3">
        {loop.map((v, i) => (
          <span
            key={`${v.slug}-${i}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium whitespace-nowrap"
          >
            <span className="text-base" aria-hidden>{v.emoji}</span>
            <span className="text-foreground/80">{v.name}</span>
            <span className="ml-1 rounded-full bg-brand-teal/8 dark:bg-brand-cyan/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-teal dark:text-brand-cyan">
              {v.status === "early" ? "Live" : "Soon"}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
