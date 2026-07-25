import * as React from "react";
import { VERTICALS } from "@/components/site/nav-config";

const EXTRAS = [
  { emoji: "🇹🇳", label: "Made in Tunisia" },
  { emoji: "💳", label: "Konnect · TND" },
  { emoji: "💬", label: "WhatsApp receipts" },
  { emoji: "🔒", label: "Row-level security" },
  { emoji: "🌍", label: "FR · AR · EN" },
];

export function BusinessMarquee() {
  // duplicate the list so the marquee loops seamlessly
  const items = [...VERTICALS, ...EXTRAS];
  const loop = [...items, ...items];

  return (
    <section
      aria-label="Business types Organa supports"
      className="relative border-y border-border bg-background py-5 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-max animate-marquee items-center gap-3">
        {loop.map((item, i) => {
          const isVertical = "slug" in item;
          return (
            <span
              key={`${isVertical ? item.slug : item.label}-${i}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium whitespace-nowrap"
            >
              <span className="text-base" aria-hidden>
                {item.emoji}
              </span>
              <span className="text-foreground/80">
                {isVertical ? item.name : item.label}
              </span>
              {isVertical && (
                <span className="ml-1 rounded-full bg-brand-teal/8 dark:bg-brand-cyan/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-teal dark:text-brand-cyan">
                  {item.status === "early" ? "Live" : "Soon"}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </section>
  );
}
