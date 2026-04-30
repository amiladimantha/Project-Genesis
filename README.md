# FinTrack

FinTrack is a personal finance and subscription tracker built with Next.js App Router and Supabase.

It includes authentication, subscription management, transaction tracking, charts, import/export tools, and profile settings.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (Auth + Postgres)
- Recharts (analytics)
- jsPDF (PDF export)

## Features

- Email/password auth (login, signup, logout)
- Dashboard with KPI cards and analytics charts
- Subscriptions CRUD
- Categories CRUD
- Transactions CRUD
- Upcoming payment reminders
- Search and filters
- Popular services quick-add
- CSV import
- Export to CSV, JSON, PDF
- Profile settings (name, currency, password, account delete)
- Theme toggle (dark/light)
- Mobile navigation

## Routes

- `/` Landing page
- `/login` Login
- `/signup` Signup
- `/dashboard` Main dashboard
- `/dashboard/subscriptions` Subscription management
- `/dashboard/categories` Category management
- `/dashboard/transactions` Transaction history
- `/dashboard/settings` Profile and account settings

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project

## Local Setup

1. Fork and clone this repo.
2. Install dependencies:

```bash
npm install
```

3. Copy the env template:

```bash
cp .env.example .env.local
```

4. Fill `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the app:

```bash
npm run dev
```

6. Open http://localhost:3000

## Supabase Setup

Run [SCHEMA.sql](SCHEMA.sql) in your Supabase SQL Editor. It creates all tables, indexes, RLS policies, triggers, and RPC functions needed by the app:

- `profiles` — user accounts (auto-created on signup via trigger)
- `categories` — user-defined labels
- `subscriptions` — recurring payments
- `transactions` — one-off payment records
- `notification_preferences` — per-user alert settings
- `payment_alerts` — in-app notification records

Confirm your generated types align with [src/types/database.types.ts](src/types/database.types.ts).

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY` — from [resend.com/keys](https://resend.com/keys) (for payment alert emails)
- `CRON_SECRET` — random secret token to protect the cron endpoint
- `NEXT_PUBLIC_SITE_URL` — your production URL (used in alert emails)

Notes:

- Do not commit `.env.local`.
- `.env*` is gitignored in [.gitignore](.gitignore).
- If you add server-only secrets later, do not prefix them with `NEXT_PUBLIC_`.

## Deploying to Vercel

Do not upload or commit `.env.local`.

1. Push your code to GitHub.
2. Import the repository in Vercel.
3. In Project Settings -> Environment Variables, add:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

If env vars change, redeploy the project.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Security Notes

- If any secret was ever committed, rotate it immediately.
- Never expose Supabase service role keys to the client.
- Keep RLS enabled on all user data tables.

## Contributing

1. Create a branch.
2. Make changes with clear commit messages.
3. Run lint/build before opening a pull request.

