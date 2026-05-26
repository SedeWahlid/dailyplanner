# DailyPlanner

Your all-in-one daily planner and productivity companion — accessible on any device.


## Full App access 
https://dailyplanner-lime.vercel.app/

## Features

| Feature | Description |
|---|---|
| Dashboard | Today's schedule, upcoming tasks, habit overview, quick notes |
| Calendar | Day/week/month views with drag-and-drop time blocking |
| Tasks | Full CRUD with categories, priorities, search, and filters |
| Habits | Daily/weekly/monthly tracking with streak counters |
| Notes | Journal entries with mood tracking and pin support |
| Goals | Progress tracking with milestones and checklist support |
| Settings | Custom categories, theme control, calendar preferences |

Cross-device sync via Supabase real-time. Install as PWA on iOS, Android, and desktop.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4 (dark mode support)
- **Database:** Supabase (PostgreSQL + real-time sync)
- **Auth:** Supabase Auth (email/password)
- **Calendar:** FullCalendar 6
- **State:** TanStack Query + Zustand
- **Drag & Drop:** dnd-kit
- **Icons:** Lucide

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) account

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/dailyplanner.git
cd dailyplanner

# 2. Install dependencies
npm install

# 3. Create a Supabase project at https://supabase.com

# 4. Run the database migration
#    Go to Supabase SQL Editor and paste the contents of:
#    supabase/migrations/001_initial_schema.sql

# 5. Create environment file
cp .env.local.example .env.local

# 6. Edit .env.local with your Supabase credentials
#    (find them under Supabase > Settings > API)
```

### `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create your account.

## Security

All tables have Row Level Security (RLS) enabled with user-scoped policies. Every row is tied to an authenticated user via `user_id`. The anon key is safe to use in the frontend — RLS blocks unauthorized access.

## Deploy

Deploy to Vercel with one click:

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables
4. In Supabase Auth settings, add `https://your-app.vercel.app/auth/callback` as an allowed redirect URL

## Project Structure

```
src/
├── app/            # Next.js App Router pages
│   ├── (app)/      # Protected routes (dashboard, calendar, tasks, etc.)
│   └── auth/       # Login / signup
├── components/     # React components
│   ├── ui/         # Reusable primitives
│   ├── layout/     # Sidebar, header, mobile nav
│   ├── dashboard/  # Dashboard widgets
│   └── tasks/      # Task components
├── lib/            # Business logic
│   ├── supabase/   # Supabase clients
│   ├── hooks/      # TanStack Query hooks
│   ├── stores/     # Zustand stores
│   ├── utils/      # Date helpers, recurrence
│   └── types/      # TypeScript types
└── middleware.ts   # Auth middleware

supabase/
└── migrations/     # Database schema SQL
```

## License

MIT
