"use client";

import * as React from "react";
import {
  ShoppingCart,
  Grid2x2,
  BedDouble,
  Building2,
  FileSignature,
  Wallet,
  CalendarClock,
  Boxes,
  IdCard,
  FileHeart,
  UsersRound,
  MessageCircle,
  Check,
  Minus,
  Circle,
  MousePointerClick,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  MODULE_MATRIX,
  MATRIX_VERTICALS,
  type ModuleCell,
} from "@/components/site/nav-config";
import { VERTICALS } from "@/components/site/nav-config";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  ShoppingCart,
  Grid2x2,
  BedDouble,
  Building2,
  FileSignature,
  Wallet,
  CalendarClock,
  Boxes,
  IdCard,
  FileHeart,
  UsersRound,
  MessageCircle,
};

const VERTICAL_META: Record<
  string,
  { emoji: string; name: string }
> = Object.fromEntries(VERTICALS.map((v) => [v.slug, { emoji: v.emoji, name: v.name }]));

export function ModuleMatrix() {
  const [active, setActive] = React.useState<string>("boutique");

  return (
    <section id="modules" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Badge
            variant="outline"
            className="rounded-full border-brand-cyan/30 bg-brand-cyan-soft/50 dark:bg-brand-cyan-soft/10 text-brand-teal dark:text-brand-cyan"
          >
            Modules
          </Badge>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            The right departments,
            <span className="block text-muted-foreground">
              turned on per business type.
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Each vertical gets only the modules it actually needs — never a
            bloated template. Click a column to highlight what that business
            type ships with.
          </p>
        </div>

        {/* Legend + selector */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <LegendDot tone="yes" label="Included" />
            <LegendDot tone="optional" label="Optional" />
            <LegendDot tone="no" label="Not used" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5 text-brand-cyan" />
            Click a column to focus a vertical
          </div>
        </div>

        {/* Matrix table */}
        <div className="mt-8 overflow-x-auto scrollbar-slim -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[760px]">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-background/95 backdrop-blur px-4 py-3 text-left align-bottom min-w-[200px]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Department
                    </span>
                  </th>
                  {MATRIX_VERTICALS.map((slug) => {
                    const meta = VERTICAL_META[slug];
                    const isActive = active === slug;
                    return (
                      <th
                        key={slug}
                        className="px-2 py-3 text-center align-bottom"
                      >
                        <button
                          type="button"
                          onClick={() => setActive(slug)}
                          aria-pressed={isActive}
                          className={cn(
                            "group mx-auto flex w-full max-w-[88px] flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 transition-all",
                            isActive
                              ? "bg-brand-teal/10 ring-1 ring-brand-teal/30"
                              : "hover:bg-muted/60",
                          )}
                        >
                          <span
                            className={cn(
                              "text-xl transition-transform group-hover:scale-110",
                              isActive && "scale-110",
                            )}
                          >
                            {meta.emoji}
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-semibold leading-tight",
                              isActive
                                ? "text-brand-teal dark:text-brand-cyan"
                                : "text-muted-foreground",
                            )}
                          >
                            {meta.name}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {MODULE_MATRIX.map((row) => {
                  const Icon = ICONS[row.icon] ?? Boxes;
                  return (
                    <tr key={row.key} className="group/row">
                      <td className="sticky left-0 z-20 bg-background/95 backdrop-blur px-4 py-3 border-t border-border">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand-teal/8 text-brand-teal dark:text-brand-cyan dark:bg-brand-cyan/15 shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {row.label}
                          </span>
                        </div>
                      </td>
                      {MATRIX_VERTICALS.map((slug) => (
                        <td
                          key={slug}
                          className="px-2 py-3 border-t border-border text-center"
                        >
                          <Cell
                            value={row.cells[slug]}
                            active={active === slug}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active vertical summary */}
        <ActiveSummary slug={active} />
      </div>
    </section>
  );
}

function Cell({ value, active }: { value: ModuleCell; active: boolean }) {
  if (value === "yes") {
    return (
      <span
        className={cn(
          "inline-grid h-7 w-7 place-items-center rounded-full transition-all",
          active
            ? "bg-brand-teal text-white shadow-brand scale-110 dark:bg-brand-cyan dark:text-brand-teal"
            : "bg-brand-teal/12 text-brand-teal dark:bg-brand-cyan/20 dark:text-brand-cyan group-hover/row:scale-105",
        )}
        aria-label="included"
        title="Included"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }
  if (value === "optional") {
    return (
      <span
        className={cn(
          "inline-grid h-7 w-7 place-items-center rounded-full border-2 border-dashed transition-all",
          active
            ? "border-brand-cyan text-brand-cyan scale-110 bg-brand-cyan-soft/60 dark:bg-brand-cyan/10"
            : "border-brand-cyan/40 text-brand-cyan/70",
        )}
        aria-label="optional"
        title="Optional add-on"
      >
        <Circle className="h-2 w-2 fill-current" />
      </span>
    );
  }
  return (
    <span
      className="inline-grid h-7 w-7 place-items-center rounded-full text-muted-foreground/30"
      aria-label="not used"
      title="Not used by this vertical"
    >
      <Minus className="h-3.5 w-3.5" />
    </span>
  );
}

function LegendDot({
  tone,
  label,
}: {
  tone: ModuleCell;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <Cell value={tone} active={false} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function ActiveSummary({ slug }: { slug: string }) {
  const vertical = VERTICALS.find((v) => v.slug === slug);
  if (!vertical) return null;

  const included = MODULE_MATRIX.filter((m) => m.cells[slug] === "yes");
  const optional = MODULE_MATRIX.filter((m) => m.cells[slug] === "optional");

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-teal/10 text-2xl border border-border">
            {vertical.emoji}
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-tight">
              {vertical.name}
            </p>
            <p className="text-sm text-muted-foreground">{vertical.tagline}</p>
          </div>
        </div>
        <div className="sm:ml-auto flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-3 py-1 font-medium text-brand-teal dark:text-brand-cyan dark:bg-brand-cyan/15">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            {included.length} included
          </span>
          {optional.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-cyan-soft/70 dark:bg-brand-cyan/10 px-3 py-1 font-medium text-brand-teal dark:text-brand-cyan">
              <Circle className="h-2 w-2 fill-current" />
              {optional.length} optional
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {included.map((m) => {
          const Icon = ICONS[m.icon] ?? Boxes;
          return (
            <div
              key={m.key}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-background/60 px-3 py-2"
            >
              <div className="grid h-6 w-6 place-items-center rounded-md bg-brand-teal/10 text-brand-teal dark:text-brand-cyan dark:bg-brand-cyan/15">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium">{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
