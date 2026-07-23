# Organa — Full Plan, Zero to Launchable Platform

**What Organa is:** one platform, rented (subscription) to business owners in Tunisia (and beyond). Each owner manages one or more businesses — café, restaurant, boutique, gym, cabinet médical, tienda — under a single login. Each business type gets the tools relevant to it, but everything runs on one shared core, not six separate apps.

This document is meant to be read start to finish, by you or an AI build agent, and covers everything from concept to a working, launchable product.

---

## 0. Review Notes (added before build start)

This plan went through two passes before any code was written: a full technical review (schema traced statement by statement, market/competitive claims checked against current sources), then a second pass specifically for internal consistency, since this version is meant to go straight to an AI build agent rather than stay a discussion document — contradictions that a human would quietly reconcile are exactly what trips up an agent executing phase by phase. It was already unusually solid; what follows are the changes made directly in this document.

**Fixed in the schema (Section 3):**
- Money columns renamed `_cents` → `_millimes` throughout. TND has 3 decimal places, not 2 — a `_cents` name invites someone to divide by 100 instead of 1000 later, a silent 10x bug in every financial figure in the system.
- Removed `organizations.plan_id` — it conflicted with Section 2.11's own statement that billing is per-account, not per-org. An org's plan is now unambiguously its owner account's active subscription, with one place this can go out of sync instead of two (the super admin wireframe in Section 4 now spells out the join).
- Account email uniqueness made case-insensitive (`lower(email)`) — the original would have let "John@Gmail.com" and "john@gmail.com" register as two different accounts.
- Added `barcode` to `products_services` — Section 6 is built entirely around barcode scanning, but nothing in the original schema gave a scan anywhere to resolve to.
- Added a `subscription_payments` table — the original `payments` table required `order_id` on every row, so it was structurally unable to record Organa's own incoming subscription revenue. See the Konnect note below for why this needed more than a table, too.
- Added a uniqueness constraint on `inventory_stock`, an index on `customers(org_id, phone)`, `order_items.org_id`, `orders.updated_at`, retry tracking on `events`, and explicit `WITH CHECK` clauses on every RLS policy (belt-and-suspenders — Postgres's implicit fallback already covers this per current docs, but it's cheap to make explicit on the one mechanism this entire product's trust promise rests on).

**Verified against current sources rather than assumed:**
- Neither Flouci nor Konnect currently offers native recurring/subscription billing in Tunisia. Phase 2 and Section 2.11 now reflect that Organa has to build the recurring layer itself on top of one-off payment collection, not just "integrate" it.
- Tunisia's data protection authority (INPDP) requires declaration — and for transfers abroad, authorization — for processing personal data, with real penalties for skipping it. The entire proposed stack (Vercel, Railway/Fly.io, Supabase, S3/R2, Twilio, Resend/Postmark) is foreign-hosted, so this is a real pre-launch step now called out in Section 9, not a footnote.
- The Square/Tunisia competitive claim in Section 7 checked out as accurate against Square's current supported-countries list — no change needed there.

**Decisions the original left open, now resolved everywhere they're referenced (not just in one place):**
- **Backend framework → NestJS.** Same language as the Next.js frontend end-to-end; Django remains fine if you have deep Python experience, but the point was to stop leaving this open, since it blocks Phase 0. Updated in the architecture diagram (Section 2.1) and tech stack table (2.6), which previously disagreed with each other.
- **Payment provider → Konnect.** More API/developer-first than Flouci, a better fit for the custom recurring-billing layer Organa has to build (see above). Flouci can be added later. Updated in the tech stack table, Phase 0's env template, and Phase 2 — the original had these three places drifting between "Flouci and/or Konnect" and "not both," which is exactly the kind of contradiction an agent shouldn't have to resolve mid-build.
- **First vertical → boutique, by default** (Section 8's tiebreaker, now also reflected as the concrete instruction in Phase 3, not just a preference stated once and never applied).

---

## 1. Vision & Market Context

### 1.1 Core idea
One login → many businesses → each business type gets its own relevant tools (menu for café, class schedule for gym, patient records for cabinet médical) → but all of it runs on the same underlying system.

### 1.2 Who it's for
Primarily: a Tunisian business owner who runs more than one business (same type or different types) and is tired of juggling separate tools/logins/subscriptions for each. Secondarily: single-business owners who want something simpler and cheaper than importing Square/Toast/Mindbody, especially given payment friction with international providers.

### 1.3 Tunisia-specific market reality (must shape the whole build)
- **Currency:** Tunisian Dinar (TND) is the only currency most local customers can realistically pay in day-to-day. Stripe and PayPal do not work well/at all for local TND collection.
- **Local payment gateways exist and are mature:** Flouci, Konnect, and Paymee all support TND, e-Dinar, and local cards, with no setup/monthly fees, charging roughly 1.3–2% for local transactions.
- **Low average technical literacy** among many target business owners: forms, jargon ("dashboard," "org," "sync") and multi-step technical onboarding will lose users. WhatsApp is the dominant communication channel for business owners in this market, more than email.
- **Not everyone has fast/reliable hardware**, but this is a web/mobile platform (not an offline physical till), so standard always-online client-server architecture is fine for the platform as a whole — just design for modest phones and slower connections too. One deliberate exception: the order-taking/POS flow specifically is where a dropped connection mid-transaction actually stops a business from taking money. A full offline-first rebuild isn't worth the complexity for v1, but a small local queue just for order creation — let the cashier keep tapping through a sale, hold it client-side, sync the moment connectivity returns — covers the real failure mode without redesigning everything else around it.

---

## 2. Architecture

### 2.1 High-Level Architecture

```
                        ┌─────────────────────┐
                        │   Web App (Next.js) │
                        │   Mobile (later)     │
                        └──────────┬───────────┘
                                   │
                        ┌──────────▼───────────┐
                        │   API Gateway/Backend │
                        │   (NestJS)            │
                        └──────────┬───────────┘
                                   │
        ┌──────────────┬──────────┼──────────┬───────────────┐
        │              │          │          │               │
   ┌────▼────┐   ┌─────▼────┐ ┌──▼───┐ ┌────▼─────┐   ┌──────▼──────┐
   │Postgres │   │  Redis   │ │ S3/  │ │ Flouci/  │   │ Notifications│
   │ (RLS)   │   │ (cache/  │ │ R2   │ │ Konnect  │   │ (WhatsApp/   │
   │         │   │  queue)  │ │      │ │(billing) │   │  SMS/email)  │
   └─────────┘   └──────────┘ └──────┘ └──────────┘   └──────────────┘
```

One codebase, one database, modular UI/features that turn on/off based on `business_type`.

### 2.2 Multi-Tenancy Model
- Single shared PostgreSQL database.
- Every business-data table has `org_id`.
- Enforced with **Row Level Security (RLS)** so no query can ever cross tenants, even by mistake or a buggy query.
- Super admin (you) bypasses RLS via a completely separate database role/connection, never through the normal tenant-facing app.

### 2.3 Multi-Business Ownership
- One `account` (person) = one login, ever.
- `memberships` table links accounts to organizations, many-to-many.
- One owner with 5 businesses (same type or mixed types) = 5 rows in `memberships`, one login, and an **org switcher** in the UI to flip between them (like Slack workspaces).
- Staff working at someone else's business gets their own membership row with `role='staff'`.

### 2.4 Three Levels of Admin

| Level | Who | Scope |
|---|---|---|
| **Super admin** (you) | Organa team | Sees ALL organizations, billing, suspensions, platform-wide flags |
| **Org admin** | Business owner | Full control of their own org(s) only |
| **Staff** | Employees | Limited permissions inside one org |

### 2.5 Module System (per business type)

| Module | Café | Restaurant | Boutique/Tienda | Gym | Cabinet médical |
|---|---|---|---|---|---|
| Orders/POS | Yes | Yes | Yes | – | – |
| Table management | – | Yes | – | – | – |
| Appointments | – | optional | – | Yes (classes) | Yes |
| Inventory | Yes | Yes | Yes | optional | – |
| Memberships | – | – | – | Yes | – |
| Patient records | – | – | – | – | Yes |
| Staff scheduling | Yes | Yes | Yes | Yes | Yes |

`business_type` on `organizations`, plus per-org `org_features` flags, decide which modules the frontend renders. Backend exposes the same shared APIs underneath, scoped by `org_id`.

### 2.6 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Database | PostgreSQL + Row Level Security | Multi-tenant isolation, JSONB for flexible attributes |
| Backend | **NestJS (Node/TS)** — recommended over the original's open "pick one" | Same language as the Next.js frontend end-to-end: shared types/validation, one language to context-switch into as a small team. Django remains a fine choice if you already have deep Python experience — the point is to decide now, since leaving this open blocks Phase 0 |
| ORM | Prisma / Django ORM | Type-safety, migrations |
| Frontend | Next.js + Tailwind (this is React, with routing/SSR built in) | Fast, good for dashboard-heavy UI |
| Auth | Custom JWT | Full control, no vendor dependency; add 2FA later if needed |
| Payments | **Konnect** (TND, e-Dinar, local + international cards) as the primary integration; Flouci as a later/secondary option | Stripe/PayPal don't serve the Tunisian market well. Konnect positions itself as the more API/developer-first option for online sellers — a better fit than Flouci's more consumer-app-first product, given Organa needs to build custom recurring-billing logic on top (Section 2.11) |
| File storage | Cloudflare R2 / S3 | Receipts, product images, documents |
| Cache/Queue | Redis | Sessions, background jobs |
| Notifications | **WhatsApp Business API** (primary), SMS (Twilio or local alternative), email (Resend/Postmark) as fallback | WhatsApp is the dominant channel for business communication locally |
| Hosting | Vercel (frontend) + Railway/Fly.io (backend) — pick a **Europe region** (e.g. Paris/Amsterdam) explicitly, not a default US one — or Supabase for MVP speed | Fast to ship, and the closest available region to Tunisia on either platform meaningfully cuts latency versus us-east for a market already flagged as having slower connections |

### 2.7 Reference & Contribution-Worthy Open Source Projects
No existing project has your multi-tenant "one login, many businesses" core — that part is genuinely yours to build. For each vertical's actual features, these are real, active projects worth studying, borrowing patterns from, or even contributing to/back to as you build:

**General POS / core commerce (relevant across café, boutique, tienda, restaurant)**
- **Odoo POS** — full ERP with integrated POS, Python/Django-style backend, strong reference for checkout flow, tax handling, multi-store reporting: github.com/odoo/odoo
- **OSPOS (Open Source Point of Sale)** — lightweight PHP/MySQL retail POS, simplest code to read for basic order/checkout logic: github.com/opensourcepos/opensourcepos
- **uniCenta oPOS** — has both a desktop Java version and a separate cloud-hosted version; useful for retail-specific UX patterns (touchscreen layouts, barcode handling), but check which version you're referencing since the desktop codebase won't map directly to a web build: source at unicenta.com / forks on GitHub
- **InvenTree** — Python/Django, powerful general-purpose inventory and stock control system with a REST API, excellent reference for the `inventory_stock` module: github.com/inventree/InvenTree
- **Triangle POS** — Laravel/Livewire inventory + POS system, free and actively maintained, good modern reference: search "Triangle POS Laravel" on GitHub

**Café / restaurant specific**
- **restaurant-pos** (ahmedali5530) — React + SurrealDB, full modern restaurant POS covering ordering, kitchen display, delivery, staff, inventory, and RTL/Arabic support — very relevant reference given your market: github.com/ahmedali5530/restaurant-pos
- **TastyIgniter** — PHP/Laravel, mature online ordering + table reservation system for restaurants, active community project: github.com/tastyigniter/TastyIgniter
- **OpenKDS** — open source kitchen display system; deployment type (web vs desktop) wasn't independently verified, treat as unconfirmed and check before relying on it as a code reference
- **Floreant POS** — Java, restaurant-focused, strong table management and kitchen ticket routing logic — but note this one is **desktop-only** (no browser version), so it's useful for studying its *logic*, not as a direct code reference for your web build: github.com/floreantpos/floreantpos

**Boutique / tienda / retail**
- **InventorySystem / warehouse-inventory-system** — simple PHP/MySQL inventory systems, good for understanding basic stock-tracking schemas: github.com/ronknight/InventorySystem
- **EFLInventory-V2** — Laravel POS + inventory for small retail stores, covers purchases, sales, damaged/expired stock tracking: github.com/chrisidakwo/EFLInventory-V2

**Gym / fitness**
- **GYM One** — PHP, open-source gym management covering member management, class scheduling, ticketing, payment tracking: github.com/mayerbalintdev/GYM-One
- Several active MERN-stack (MongoDB/Express/React/Node) gym management systems on GitHub under the `gym-management-system` topic — good modern reference if your stack is JS-based end to end

**Cabinet médical**
- **OpenEMR** — the most established open-source electronic health records and practice management system, covers scheduling, billing, records: github.com/openemr/openemr
- **OpenClinic** — simpler PHP-based medical records system, easier to read than OpenEMR if you just need patient records + history, not a full EHR: github.com/jact/openclinic

**How to actually use these**
Clone the relevant repo locally, read how the tricky part is solved (tax math, stock deduction on sale, appointment conflict handling, kitchen ticket routing), then reimplement that logic natively inside your own module (`/modules/cafe`, `/modules/gym`, etc.) using your own multi-tenant schema and stack. Many of these projects also accept real contributions (issues, PRs) if you want to give back or build public credibility while you build Organa — genuinely worth doing if this becomes a portfolio piece.

### 2.8 Security & Isolation
- RLS policy on every table: `org_id IN (SELECT org_id FROM memberships WHERE account_id = current_account_id())`.
- **Production gotcha:** if using a connection pooler (e.g. PgBouncer) in transaction pooling mode, use `SET LOCAL` inside an explicit transaction for the RLS session variable — a plain `SET` can leak across pooled connections and expose the wrong tenant's data.
- Sensitive data (`medical_records`) gets extra access checks; consider column-level encryption before handling real patient data.
- `audit_log` table tracks every meaningful action for accountability.

### 2.9 Feature Flags
```
org_features (org_id, feature_key, enabled, config JSONB)
```
Enables/disables individual features per org (not just per vertical) — supports gradual rollouts, paid add-ons, A/B testing later.

### 2.10 Event/Notification Pattern
```
events (id, org_id, type, payload JSONB, created_at, processed_at)
```
Outbox pattern: an action (order placed, appointment booked) writes an event; a background worker fans it out to inventory updates, WhatsApp/SMS notifications, analytics — so one side-effect failing (e.g. WhatsApp API down) never breaks the core action.

### 2.11 Billing (Organa's own subscription revenue)
```
plans                 (id, name, price_millimes, max_orgs, features JSONB)
subscriptions         (id, account_id, plan_id, status, current_period_end, grace_period_end)
subscription_payments (id, subscription_id, account_id, amount_millimes, provider, status, period_start, period_end)
```
Each `account` (not each org) subscribes to a plan, priced in TND, which can cap number of businesses or feature modules. `plans.max_orgs` must be enforced in application code (Postgres can't natively check row counts across tables as a constraint). `organizations` deliberately has no `plan_id` of its own — an org's effective plan is always its owner account's active subscription, so there's exactly one place this can go out of sync, not two.

**Neither Flouci nor Konnect currently offers native recurring/subscription billing in Tunisia** — both are built for one-off payment collection (hosted checkout, payment links, QR codes), not automatic recurring charges. So this piece has to be built, not just integrated: a scheduled job creates a new payment request each billing cycle, writes a `subscription_payments` row, reconciles it via webhook, and — if it goes unpaid — moves `subscriptions.status` to `past_due` with a `grace_period_end` before the org is actually suspended. Given the audience is explicitly price-sensitive and new to paying for a tool like this (Section 1.3), that grace period should come with a WhatsApp warning through the same notification pipeline as Phase 4, not a silent cutoff.

### 2.12 Things Easy to Forget
- Multi-language: French/Arabic UI at minimum, since that's the real target market.
- Tax rules per business, stored per-org, not hardcoded.
- Double-booking prevention for appointments — enforced at the database level (see schema, Section 3).
- API rate limiting & versioning.
- Backups & point-in-time recovery.
- A reporting layer (materialized views or read replica later) so heavy reports don't slow down live traffic.

---

## 3. Database Schema (PostgreSQL — run this migration first)

```sql
-- ============================================================
-- ORGANA — Core Database Schema (PostgreSQL)
-- Multi-tenant vertical SaaS: one core, many business types
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists btree_gist; -- needed for appointment overlap constraint

-- ============================================================
-- 1. ACCOUNTS, ORGANIZATIONS, MEMBERSHIPS
-- ============================================================

create table accounts (
  id uuid primary key default uuid_generate_v4(),
  email text not null,        -- uniqueness enforced case-insensitively below, not with a column constraint
  email_verified boolean not null default false,
  phone text,
  password_hash text not null,
  full_name text,
  created_at timestamptz not null default now()
);
-- Case-insensitive: "John@Gmail.com" and "john@gmail.com" must be the same account.
-- Lowercase email in application code before every insert/lookup to match.
create unique index idx_accounts_email_lower on accounts (lower(email));

-- Email verification / password reset tokens (short-lived, single-use)
create table auth_tokens (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references accounts(id) on delete cascade,
  token_hash text not null,
  purpose text not null check (purpose in ('email_verify','password_reset')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_auth_tokens_account on auth_tokens(account_id);

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  business_type text not null check (business_type in
    ('cafe','restaurant','boutique','gym','cabinet_medical','tienda')),
  subdomain text unique,
  -- No plan_id here on purpose: billing lives on the ACCOUNT (see subscriptions,
  -- Part 2.11) so one owner's plan covers every business they run.
  status text not null default 'active' check (status in ('active','suspended','cancelled')),
  owner_account_id uuid not null references accounts(id),
  -- Single source of truth for ownership. Keep the matching `memberships` row
  -- (role='owner') in sync in the same transaction — app code's job, not a DB constraint.
  -- If Organa should support co-owned businesses (common for family-run shops), that's
  -- a product decision to make explicitly, not something to retrofit later.
  default_currency text not null default 'TND',
  timezone text not null default 'Africa/Tunis',
  locale text not null default 'fr',
  hardware_package text check (hardware_package in ('app_only','phone_scanner','tablet_kit')),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table memberships (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references accounts(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  role text not null check (role in ('owner','manager','staff')),
  created_at timestamptz not null default now(),
  unique (account_id, org_id)
);

create index idx_memberships_account on memberships(account_id);
create index idx_memberships_org on memberships(org_id);

-- Platform-level super admins (Organa team, NOT tenant staff)
create table platform_admins (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references accounts(id) on delete cascade,
  permission_level text not null check (permission_level in ('support','billing','superadmin')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. BILLING (Organa's own subscription revenue)
-- ============================================================

create table plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price_millimes int not null,       -- smallest TND unit: 1 dinar = 1000 millimes (NOT /100 like cents)
  currency text not null default 'TND',
  max_orgs int,               -- null = unlimited
  features jsonb not null default '{}'::jsonb
);

-- No fk_org_plan here: organizations has no plan_id (see note above it). An org's plan
-- is looked up via organizations.owner_account_id -> subscriptions.account_id.

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references accounts(id) on delete cascade,
  plan_id uuid not null references plans(id),
  status text not null check (status in ('active','past_due','cancelled')),
  current_period_end timestamptz not null,
  grace_period_end timestamptz,   -- past_due until this; drives the WhatsApp warning before suspension (Phase 4)
  created_at timestamptz not null default now()
);
-- One active subscription per account at a time
create unique index idx_one_active_subscription on subscriptions(account_id) where status = 'active';

-- Organa's own incoming revenue from business owners — distinct from `payments` below,
-- which is org-scoped money businesses collect from THEIR customers. Flouci/Konnect have
-- no native recurring billing in Tunisia today, so a scheduled job writes here each cycle:
-- generate a payment request, record it, reconcile via webhook, and flip subscriptions.status
-- if it goes unpaid past grace_period_end (see Part 2.11).
create table subscription_payments (
  id uuid primary key default uuid_generate_v4(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  amount_millimes int not null,
  currency text not null default 'TND',
  provider text not null check (provider in ('flouci','konnect','paymee')),
  provider_reference text,     -- external transaction/payment-link id, for reconciliation
  status text not null check (status in ('pending','paid','failed','refunded')),
  period_start date,
  period_end date,
  created_at timestamptz not null default now()
);
create index idx_subscription_payments_account on subscription_payments(account_id);
create index idx_subscription_payments_subscription on subscription_payments(subscription_id);

-- ============================================================
-- 3. CORE SHARED BUSINESS TABLES (org_id scoped)
-- ============================================================

create table customers (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  attributes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index idx_customers_org on customers(org_id);
create unique index idx_customers_org_email on customers(org_id, email) where email is not null;
create index idx_customers_org_phone on customers(org_id, phone) where phone is not null;

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_customers_updated before update on customers
  for each row execute function set_updated_at();
create trigger trg_organizations_updated before update on organizations
  for each row execute function set_updated_at();

create table locations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,          -- table, room, branch, chair
  attributes jsonb not null default '{}'::jsonb
);
create index idx_locations_org on locations(org_id);

create table products_services (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  type text not null check (type in ('product','service')),
  name text not null,
  barcode text,       -- scanned value, camera or HID scanner (Section 6); services leave this null
  price_millimes int not null,
  currency text not null default 'TND',
  attributes jsonb not null default '{}'::jsonb,   -- size, color, prep_time, duration_min, etc.
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index idx_products_org on products_services(org_id);
create unique index idx_products_org_barcode on products_services(org_id, barcode) where barcode is not null;
create trigger trg_products_updated before update on products_services
  for each row execute function set_updated_at();

create table staff_shifts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  check (end_time > start_time)
);
create index idx_shifts_org on staff_shifts(org_id);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid references customers(id),
  location_id uuid references locations(id),
  staff_account_id uuid references accounts(id),   -- who rang it up; useful for per-staff reporting
  status text not null default 'open' check (status in ('open','completed','cancelled','refunded')),
  total_millimes int not null default 0,
  currency text not null default 'TND',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index idx_orders_org on orders(org_id);
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  -- Denormalized from orders at insert time (copy orders.org_id): keeps RLS a direct
  -- column filter like every other table instead of a subquery through orders on
  -- what will be one of the highest-volume tables in the system.
  org_id uuid not null references organizations(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products_services(id),
  qty int not null check (qty > 0),
  price_millimes int not null
);
create index idx_order_items_order on order_items(order_id);
create index idx_order_items_org on order_items(org_id);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  amount_millimes int not null,
  method text not null check (method in ('cash','card','online','wallet')),
  provider text,              -- 'flouci', 'konnect', 'paymee', null for cash
  status text not null check (status in ('pending','paid','failed','refunded')),
  created_at timestamptz not null default now()
);
create index idx_payments_org on payments(org_id);

-- Appointments: shared by gym classes, medical visits, restaurant reservations
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid references customers(id),
  staff_account_id uuid references accounts(id),
  location_id uuid references locations(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'booked' check (status in ('booked','completed','cancelled','no_show')),
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index idx_appointments_org on appointments(org_id);

-- Prevent double-booking: same staff member cannot have overlapping appointments
alter table appointments add constraint no_overlap_staff
  exclude using gist (
    staff_account_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (staff_account_id is not null and status = 'booked');

-- ============================================================
-- 4. VERTICAL-SPECIFIC EXTENSION TABLES
-- ============================================================

create table inventory_stock (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  product_id uuid not null references products_services(id) on delete cascade,
  quantity int not null default 0,
  reorder_level int not null default 0,
  updated_at timestamptz not null default now(),
  unique (org_id, product_id)   -- one stock row per product; decrement via an atomic
                                  -- `UPDATE ... SET quantity = quantity - :qty WHERE quantity >= :qty`
                                  -- in app code, never read-then-write, or concurrent sales can oversell
);
create index idx_inventory_org on inventory_stock(org_id);

create table gym_memberships (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  plan_name text not null,
  start_date date not null,
  end_date date not null,
  check (end_date > start_date)
);
create index idx_gym_memberships_org on gym_memberships(org_id);

create table medical_records (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  patient_id uuid not null references customers(id) on delete cascade,
  notes text,           -- consider pgcrypto/application-level encryption before real patient data
  created_by uuid references accounts(id),
  created_at timestamptz not null default now()
);
create index idx_medical_org on medical_records(org_id);

-- ============================================================
-- 5. FEATURE FLAGS, EVENTS, AUDIT LOG
-- ============================================================

create table org_features (
  org_id uuid not null references organizations(id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  primary key (org_id, feature_key)
);

create table events (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  attempts int not null default 0,
  last_error text    -- surface stuck WhatsApp/SMS dispatch instead of failing silently
);
create index idx_events_unprocessed on events(org_id) where processed_at is null;

create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade,
  account_id uuid references accounts(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);
create index idx_audit_org on audit_log(org_id);

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- Assumes the app sets: SET LOCAL app.current_account_id = '<uuid>' inside
-- an explicit transaction, per request (see production gotcha note in Part 2.8)
-- ============================================================

create or replace function current_account_id() returns uuid as $$
  select nullif(current_setting('app.current_account_id', true), '')::uuid;
$$ language sql stable;

create or replace function accessible_orgs() returns setof uuid as $$
  select org_id from memberships where account_id = current_account_id()
$$ language sql stable;

do $$
declare t text;
begin
  foreach t in array array[
    'customers','locations','products_services','staff_shifts',
    'orders','order_items','payments','appointments','inventory_stock',
    'gym_memberships','medical_records','org_features','events','audit_log'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    -- USING alone already covers INSERT here too (Postgres reuses it as WITH CHECK for a
    -- FOR ALL policy when none is given) but it's spelled out explicitly below so tenant
    -- isolation on writes never depends on remembering that fallback.
    execute format(
      'create policy org_isolation on %I using (org_id in (select accessible_orgs())) with check (org_id in (select accessible_orgs()));', t
    );
  end loop;
end $$;

alter table organizations enable row level security;
create policy org_visibility on organizations
  using (id in (select accessible_orgs()))
  with check (id in (select accessible_orgs()));

-- subscription_payments is account-scoped, not org-scoped (billing lives on the account,
-- Part 2.11) — visible to the paying account itself; platform_admins see everything via
-- the separate BYPASSRLS role/connection below, same as every other table.
alter table subscription_payments enable row level security;
create policy subscription_payments_visibility on subscription_payments
  using (account_id = current_account_id())
  with check (account_id = current_account_id());

-- Super admins bypass RLS entirely via a separate DB role (run once, as a Postgres superuser):
--   CREATE ROLE organa_superadmin LOGIN PASSWORD '...' BYPASSRLS;
-- Only your admin backend service connects using this role/connection string.
-- The main tenant-facing API must NEVER use this role.

-- NOTE — enforced in application code, not the database:
--   1. plans.max_orgs: check count of orgs for the account's subscription
--      before allowing a new organization to be created.
--   2. Role permissions beyond org_id scoping (e.g. only 'owner' can delete
--      the org) — check memberships.role in the API layer.

-- ============================================================
-- End of migration
-- ============================================================
```

---

## 4. Wireframe / Layout Reference

Low-fidelity layout — structure and flow only, not final visual design.

### Screen 1 — Login
```
┌─────────────────────────────┐
│          ORGANA logo         │
│   [ Email input ]            │
│   [ Password input ]         │
│        [ Log in ]            │
└─────────────────────────────┘
```
One account, no separate login per business. Keep labels simple, French/Arabic by default.

### Screen 2 — Org Switcher (dropdown open, post-login)
```
┌───────────────────────────────────────────┐
│ ▾ Café Le Sud (café)          Account menu │
├───────────────────────────────────────────┤
│ ✔ Café Le Sud            café              │
│   Boutique Mode          boutique          │
│   FitZone Gym            gym               │
│   + Créer une nouvelle entreprise           │
└───────────────────────────────────────────┘
```
Selecting an org scopes every screen below to that `org_id` only.

### Screen 3 — Dashboard shell (generic, business_type-driven)
```
┌──────────┬──────────────────────────────────────┐
│ Tableau  │  [carte] [carte] [carte] [carte]      │
│ Ventes   │                                       │
│ Articles │  Activité récente :                   │
│ Stock    │  ┌──────┬──────────┬───────┬────────┐│
│ Personnel│  │ ID   │ Nom      │ Total │ Statut ││
│ Clients  │  │ ...  │ ...      │ ...   │ ...    ││
│ Rapports │  └──────┴──────────┴───────┴────────┘│
│ Réglages │                                       │
└──────────┴──────────────────────────────────────┘
```
Sidebar items and content are driven by `business_type` and `org_features`. Use plain, non-technical labels (avoid "org," "dashboard," "sync" in the actual UI — French/Arabic equivalents of "my business," "today's sales").

### Screen 4 — Super Admin Dashboard (Organa team only, separate login/subdomain)
```
┌──────────────┬──────────────────────────────────┐
│ All Orgs     │  [total] [MRR TND] [failed pay]   │
│ Billing      │                                    │
│ Support/     │  ┌──────────┬──────┬──────┬───────┐│
│  Impersonate │  │Business  │Type  │Plan  │Status ││
│ Feature Flags│  │ ...      │ ...  │ ...  │ ...   ││
│ Platform Use │  └──────────┴──────┴──────┴───────┘│
└──────────────┴──────────────────────────────────┘
```
The "Plan" column here is not a direct column read — join `organizations.owner_account_id → subscriptions.account_id` (where `status = 'active'`) to get it, same as everywhere else the effective plan is needed.

---

## 5. Build Roadmap, Start to Launch

### Phase 0 — Environment setup (before writing feature code)
- Local Postgres + Redis (Docker Compose recommended for consistency).
- Repo structure:
```
/core          → shared foundation
/modules/      → empty at first; cafe/, gym/, boutique/, etc. added one at a time
```
- `.env` template for DB connection, JWT secret, Konnect API keys, WhatsApp Business API token.
- Basic README with setup steps.

### Phase 1 — Foundation (build this fully before anything vertical-specific)
1. Apply the database migration (Section 3). Prove RLS isolation with a real test: two orgs, two accounts, confirm no cross-tenant leakage even via a deliberately broken query.
2. Backend: account signup/login (JWT), email verification, password reset, organizations CRUD, memberships (invite/roles), org switcher endpoint, generic CRUD for customers/products_services/orders/order_items/payments/appointments/staff_shifts/locations, feature flag read endpoint, event logging on key actions.
3. Frontend: login page, org switcher, generic dashboard shell (sidebar + cards + table) matching Section 4, calling the real backend — no mock data, no vertical-specific screens yet.
4. Basic super admin route: list all organizations, view subscription status.

**Done when:** you can sign up, create 2+ businesses under one account, switch between them, add a product/customer/order/appointment through real APIs, and see zero data leakage between businesses.

### Phase 2 — Payments
- Organa's own subscription billing first: integrate **Konnect** (Section 2.6) for one-off payment collection, then build the recurring layer on top yourself (scheduled job → payment request each cycle → `subscription_payments` row → webhook reconciles it → `subscriptions.status`/`grace_period_end` updated on failure). Konnect doesn't do recurring billing natively today, so budget real time here, not just an afternoon of webhook wiring.
- Payments businesses collect from their own customers (optional) fit more naturally after Phase 3, once real orders exist to attach them to — wire `payments.provider`/`payments.status` to webhook callbacks then.

### Phase 3 — First vertical, fully working
- **Boutique**, by default (see Section 8's tiebreaker) — override to café only if a café pilot business is already lined up and a boutique one isn't, since which real pilot owner is actually available matters more than this preference.
- Build its thin module on top of the core: vertical-specific labels, screens, and any extra tables (`inventory_stock` for café/boutique).
- Reference Odoo POS / OSPOS logic for checkout/tax/stock patterns where useful (Part 2.7), reimplemented in your own stack.
- Get it usable end-to-end: create products, take an order, collect payment, see it on the dashboard.
- Implement both barcode scanning input methods (camera-based and HID/keyboard-wedge) per Section 6, so all three hardware packages work against the same screens.

### Phase 4 — Notifications
- WhatsApp Business API integration first (order confirmations, appointment reminders) — this is the channel your actual users will trust and check. Start Meta's business verification early (Phase 0/1, in parallel with unrelated work) — it needs a registered legal entity and can take longer than expected, and it'll otherwise end up blocking this phase for reasons that have nothing to do with code.
- SMS and email as fallback channels.
- Driven by the `events` table (Part 2.10) — a background worker processes unsent events and dispatches accordingly, retrying failed sends (`attempts`/`last_error`, added to the schema) instead of dropping them silently.

### Phase 5 — Remaining verticals, one at a time
- Restaurant (adds table management via `locations`).
- Gym (adds `gym_memberships`, class scheduling via `appointments`).
- Cabinet médical (adds `medical_records`, extra care around access control).
- Tienda (same shape as boutique).
- Each vertical reuses the appointments/orders/products core — only the thin UI layer and small extra tables are new each time.

### Phase 6 — Polish before real users
- Design system pass: consistent colors, spacing, component choices (this was layout-only until now).
- Simplify onboarding into a guided, big-button wizard given the non-technical target audience; consider a short walkthrough video.
- French/Arabic localization pass across all UI text.
- Basic automated tests for the core (auth, org isolation, checkout math) so later changes don't silently break things.
- Rate limiting and basic API versioning on the backend.
- Backups configured and tested (not just assumed).

### Phase 7 — Launch
- Deploy: frontend to Vercel, backend to Railway/Fly.io (or Supabase-managed Postgres if you went that route).
- Seed a couple of real pilot businesses (even friends/family-run ones) before wider release, to catch real-world issues.
- Set your subscription pricing in TND, likely with a low-commitment monthly option given market price sensitivity.
- Have a basic support channel ready (WhatsApp number is a good first choice given the market).

---

## 6. Hardware Packages (café, restaurant, gym, boutique/tienda counters)

Beyond the software, three concrete hardware packages have been scoped for how businesses actually take orders/scan products at the counter or table-side.

### 6.1 The three packages

| Package | Hardware | Approx. cost (one-time) | Best for |
|---|---|---|---|
| **1 — App only** | Business's own phone; app uses the phone camera to scan barcodes | 0 TND (subscription only) | Very small shops, tightest budget |
| **2 — Phone + external scanner** | Business's own phone + wireless barcode scanner + USB-C adapter | ~109-130 TND | Shops wanting faster/more reliable scans than camera-only, while still using their own phone |
| **3 — Full tablet kit** | Organa-provided Android tablet + wireless barcode scanner + USB-C adapter | ~550-580 TND | Businesses wanting a dedicated, consistent counter/table-side setup (restaurant, café, gym reception) |

### 6.2 Example hardware researched (Tunisia market)
- **Tablet reference:** Infinix Xpad 30E, 11" IPS LCD, Android 15, MediaTek Helio G80, 4GB RAM (expandable to 8GB), 128GB storage, WiFi + 4G, ~439 TND. Any similar mid-range Android tablet with a USB-C port works; exact model not finalized.
- **Scanner reference:** YHD-1100LW wireless barcode scanner, laser 1D, ~300 scans/sec, 2.4GHz wireless with a USB-A receiver dongle, ~109 TND.

### 6.3 Critical technical detail: USB-C vs USB-A
The scanner's wireless receiver plugs in via **USB-A**, but modern Android tablets and phones are almost all **USB-C only**. Every package that uses this scanner (Packages 2 and 3) needs a cheap **USB-C to USB-A adapter/dongle** included. This should be bundled automatically into the hardware kit pricing so businesses don't discover a missing cable after purchase.

### 6.4 Software implication — two scanning input methods to support
The app's barcode scanning feature must support both:
1. **Camera-based scanning** (Package 1) — uses the device camera directly, no extra hardware, slightly slower and needs decent lighting.
2. **HID/keyboard-wedge input** (Packages 2 and 3) — most USB/wireless barcode scanners, including the YHD-1100LW, act like a keyboard automatically "typing" the scanned barcode digits into whatever field is focused. No special driver or SDK integration needed — just make sure the product-lookup input field is focused and ready to receive rapid keyboard input when scanning starts.

### 6.5 Schema addition
Added to `organizations` (see Section 3): a `hardware_package` field (`'app_only' | 'phone_scanner' | 'tablet_kit'`) so onboarding and support can tailor instructions and the UI can show the right setup guide per business.

### 6.6 Business model consideration
Selling or renting Package 3 (tablet + scanner) turns part of the business into **hardware procurement and support**, not just software:
- Decide whether Organa buys tablets in bulk upfront and bundles the cost into a higher subscription tier (simpler for the business owner, capital risk for you), or the business buys the hardware themselves from a list you provide (no capital risk for you, more friction for non-technical owners).
- Either way, budget for basic hardware support questions (tablet won't charge, scanner won't pair) as part of your support load, since your non-technical target users will likely contact you for this even if it's not strictly a software issue.

---

## 7. Competitive Positioning (why build this at all)

This was debated at length earlier and deserves to live in the plan itself, not just the conversation.

**What already exists and is strong:** Square (free tier, mature, huge feature set), Odoo/uniCenta/OSPOS (open source, free or near-free), Mindbody/Glofox (gym-specific), Doctolib (medical-specific). All are built for **one business at a time**, and several work in or near the Tunisian market already (Square doesn't serve TND well; open source options are self-hostable anywhere).

**The honest, narrow edge Organa actually has:** none of the above let one owner manage multiple different businesses (or multiple locations of the same business) under a single login with unified switching and reporting. That is a genuinely underserved niche, not a broad "better POS" claim. If the real target user runs only one café and nothing else, competing head-on with Square/Odoo on features alone is a hard, well-funded fight.

**Secondary edge, specific to this market:** native TND/e-Dinar payment integration (Flouci/Konnect) and WhatsApp-first support/notifications, tailored for less technical owners — most competitors treat this market as an afterthought.

**Implication for scope:** lead with the multi-business owner as the core wedge in marketing and onboarding, even while the product also works fine for single-business owners.

---

## 8. Smallest Launchable Slice (MVP scope, stated plainly)

Everything in Sections 2-6 is the full vision. The actual first launchable version should be smaller:

- **1 vertical** (café or boutique), not all 6.
- **Core + that vertical only** — no gym memberships, no medical records, no restaurant table management yet.
- **Package 1 (app only) as the default hardware path** — Packages 2 and 3 can wait until there's real demand, since they add procurement/support overhead before you know if anyone wants the software at all.
- **One payment provider — Konnect** (Section 2.6) — to start; Flouci can be added later if there's real demand for it.
- **A handful of real pilot businesses** (even friends/family-run ones), not a public launch, to catch real problems before wider release.

Resist the pull to build the whole vision before anyone has used it — the fastest way to find out if the core "one login, many businesses" idea actually matters to people is to get it in front of real owners early, even in this reduced form.

**On café vs. boutique specifically:** if pilot businesses are available in both, boutique/retail is the gentler first vertical — fewer, less time-pressured transactions than a café counter during a rush, so early UX issues surface without a queue of real customers waiting on them. This is a soft tiebreaker, not a hard rule — which pilot businesses you can actually recruit matters more than this preference.

---

## 9. Smaller Gaps Worth Knowing About

- **Refunds/voids:** `orders.status` now includes `refunded` (fixed directly in the schema, Section 3). For full audit trail on partial refunds, consider a dedicated `refunds` table referencing `payments` later, so each refund is its own tracked record rather than a status flip.
- **Data export / no lock-in:** given the non-technical, trust-sensitive audience, offer a simple "export my data" (CSV of customers/orders/products) from day one. It costs little to build and directly addresses a fear this audience is likely to have about depending on a new, unproven platform.
- **Tunisian VAT (TVA):** tax rules should be configurable per org (already planned via attributes/JSONB), but confirm actual current TVA rates and rules with a local accountant before launch — this plan intentionally does not state specific tax rates, since getting them wrong has real legal/financial consequences.
- **Ownership transfer:** no flow yet for "owner sells the business to someone else." Low priority for MVP, but worth a simple admin-assisted process (super admin reassigns `owner_account_id` and memberships) rather than leaving it fully unhandled.
- **Cross-border personal data & INPDP:** Tunisia's data protection authority (INPDP) requires prior declaration — and for transfers abroad, prior authorization — for processing personal data, with real penalties for skipping it. Every piece of the proposed stack (Vercel, Railway/Fly.io, Supabase, S3/R2, Twilio, Resend/Postmark) is hosted outside Tunisia, so customer data — phone numbers, emails, and especially `medical_records` — is transferred abroad by default the moment real customers are in the system. This doesn't mean the stack needs to change; it means the INPDP declaration/authorization needs to happen before real customer data flows through it. Get a local lawyer's sign-off on this alongside the TVA one, ideally before Phase 3 — and treat it as more time-sensitive than TVA, since the law is actively being modernized right now (a 2025 bill aligning it closer to GDPR is in progress), so what's confirmed today may not be the final word by launch.
- **Subscription lapse handling:** nothing originally described what happens when a business owner's payment fails — immediate suspension, or a grace period with a warning first? Given the audience is explicitly price-sensitive and new to paying for a tool like this, an owner discovering mid-service that they're locked out with no warning is close to a worst-case first impression. `subscriptions.grace_period_end` (added in Section 3) plus a WhatsApp warning through the existing notification pipeline before suspension is a small addition that avoids this.

---

## 10. Honest Notes

- The plan is solo-or-team agnostic — nothing here assumes you're building alone or with others; add a team-coordination layer (API docs, git workflow, review rules) only once you actually know that.
- This is the standard, proven shape for multi-tenant vertical SaaS (same underlying pattern as Shopify, Slack, Stripe) adapted specifically for the Tunisian market's payment and connectivity realities — not the most exotic architecture possible, but the one built to grow without needing a rewrite.
