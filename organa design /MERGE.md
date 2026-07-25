# Merging this into phynixRise/organa — instructions for the build agent

This folder is the **design only**, extracted from a separate Z.ai-generated
workspace and cleaned. It is not a full app. Read this whole file before
touching anything — it tells you what to keep, what to skip, and what's
still fake data that needs wiring to real APIs later.

## What's in here

Everything under `apps/web/` mirrors where it should land in the real
`apps/web` (Next.js frontend) of the organa repo:

```
apps/web/src/components/site/       — the actual marketing page design
apps/web/src/components/ui/         — 7 shadcn primitives it depends on
apps/web/src/hooks/                 — 3 hooks it depends on
apps/web/src/lib/utils.ts           — the cn() class-merge helper
apps/web/src/app/globals.css        — full brand theme (light + dark)
apps/web/src/app/layout.tsx         — root layout + SEO metadata
apps/web/src/app/page.tsx           — page composition (14 sections)
apps/web/tailwind.config.ts
apps/web/postcss.config.mjs
apps/web/components.json            — shadcn aliases, for reference
apps/web/public/logo.jpg, logo.svg, robots.txt
```

This is a deliberate subset. The original workspace bundled ~50 shadcn
components and ~45 npm packages; only 7 components and the packages listed
below are actually imported anywhere in the design. Don't pull the rest in
"just in case" — that's exactly the bloat this cleanup removed.

## Before you copy anything: check for conflicts

I don't have visibility into the current state of `apps/web` in the real
repo, so **check each target path for an existing file before overwriting**,
especially `layout.tsx`, `globals.css`, `page.tsx`, and `tailwind.config.ts`
— if scaffolding already exists there, merge into it rather than clobbering
it. Everything under `components/site/` is new and safe to add outright
(nothing else should already be using those paths).

## Do NOT bring over from the original Z.ai workspace, if you still have it

- `prisma/schema.prisma`, `src/lib/db.ts`, `src/app/api/route.ts` — placeholder
  boilerplate (a generic `User`/`Post` model on SQLite, an API route that
  returns `"Hello, world!"`). None of it relates to Organa. The real schema
  is the one in `ORGANA_FULL_PLAN.md`, served by the NestJS backend — not by
  Next.js API routes or Prisma directly.
- `next-auth` and `z-ai-web-dev-sdk` from `package.json` — the plan already
  settled on custom JWT auth (Section 2.6); adding NextAuth on top gives you
  two competing auth systems. `z-ai-web-dev-sdk` is specific to the sandbox
  that generated this and has no reason to exist in this repo.
- `.zscripts/`, `mini-services/`, `Caddyfile`, `.env`, `db/custom.db`,
  `examples/websocket/`, `tests/python-runtime-*` — all sandbox/deployment
  scaffolding from the tool that generated the workspace, unrelated to Organa.

## Dependencies to add to the real `apps/web/package.json`

Traced by actual import, not copied from the original bloated list:

```json
{
  "dependencies": {
    "next-themes": "^0.4.6",
    "framer-motion": "^12.23.2",
    "lucide-react": "^0.525.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-toast": "^1.2.14"
  },
  "devDependencies": {
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.3.5"
  }
}
```

(`next`, `react`, `react-dom`, `typescript`, `tailwindcss` should already be
in the real `apps/web` — don't duplicate or downgrade them to match this
workspace's versions, which were whatever the Z.ai sandbox happened to pin.)

## Already fixed, no action needed

The original had three fabricated customer testimonials (invented names,
invented businesses, invented quotes) and a "Trusted by owners across
Tunisia" claim with real city names implying existing customers — neither
true for a pre-launch product. `testimonials.tsx` and `nav-config.ts` here
already replace that with honest scenario-based content; `hero.tsx`'s city
row already reads "Built for," not "Trusted by." Don't reintroduce the
original versions if you still have that workspace open somewhere.

## Real decisions this design made on its own — confirm before they stick

- **"Hotel" appears as a full 8th vertical** (own module row, own FAQ entry)
  — not in `ORGANA_FULL_PLAN.md`, never discussed. Either drop it or add it
  to the plan properly; don't let it exist only here.
- **Pricing shown is 49 / 119 TND / "Sur devis"** — the landing page built
  earlier in this project used 29 / 69 / 129. Both are placeholders; pick
  one number per tier and use it everywhere, not two different guesses.
- **The FAQ says "Boutique and Café are the first live verticals"** (plural)
  — the plan's Phase 3 default is boutique alone. Reconcile before this
  implies a launch sequence that isn't the real one.
- **Brand colors here are `#005f6b` / `#00b4d8`**, close but not identical to
  the exact colors sampled from the uploaded logo file (`#024648` / `#00b8e0`
  — see `organa-icon.jpg` in this project's other outputs). Close enough to
  not look wrong, but if pixel-perfect brand match matters, swap the values
  in `globals.css`'s `:root` and `.dark` blocks.
- **Body font is Inter here**; the landing page built earlier uses Figtree.
  Both pair fine with Plus Jakarta Sans for headings — pick one for the real
  app rather than shipping both.
- Numbers throughout the hero mockup, stat cards, and module matrix (sales
  figures, "4/8 active", etc.) are illustrative placeholders, not wired to
  anything. That's expected for a marketing page and doesn't need fixing now
  — just don't mistake it for real data when it's time to connect the actual
  API.
