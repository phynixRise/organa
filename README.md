# Organa

One platform, rented (subscription) to business owners. Each owner manages one or more businesses under a single login. Each business type gets the tools relevant to it, but everything runs on one shared core.

## Tech Stack

- **Backend:** NestJS (Node/TypeScript)
- **Frontend:** Next.js + Tailwind CSS
- **Database:** PostgreSQL with Row Level Security
- **ORM:** Prisma
- **Cache/Queue:** Redis
- **Payments:** Konnect (TND, e-Dinar, local cards)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

## Setup

1. Start the database:
   ```bash
   docker compose up -d
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

4. Push the schema to the database:
   ```bash
   npm run db:push
   ```

5. Start the development servers:
   ```bash
   npm run dev
   ```

   - API: http://localhost:4000/api/health
   - Web: http://localhost:3000

## Project Structure

```
organa/
├── apps/
│   ├── api/          NestJS backend (auth, customers, orders, payments, gym, etc.)
│   └── web/          Next.js frontend (marketing site + dashboard)
├── core/             Prisma schema, migrations, shared DB logic
├── packages/
│   └── shared/       Shared TypeScript types
├── docker-compose.yml
└── .env
```

## Database

```bash
# View database
npm run db:studio

# Create a migration
npm run db:migrate
```
