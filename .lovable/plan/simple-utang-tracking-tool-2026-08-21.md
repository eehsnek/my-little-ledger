# Simple Utang Tracking Tool

A clean, minimal debt/loan tracker ("utang" = Filipino for debt) backed by Lovable Cloud.

## What we're building
- A personal utang tracker where users log who owes them money and whom they owe.
- Each entry: person name, amount, type (lent/borrowed), description, date, paid status.
- Dashboard shows totals, an add form, and a list with quick actions.

## Plan

### 1. Database schema
- Create `public.debts` table:
  - `id` uuid primary key
  - `user_id` uuid references auth.users
  - `person_name` text not null
  - `amount` numeric not null
  - `type` text not null check ('lent' | 'borrowed')
  - `description` text
  - `paid` boolean default false
  - `created_at` timestamptz default now()
- GRANT to `authenticated` and `service_role`, enable RLS.
- Policies: users can only CRUD their own rows.

### 2. Authentication
- Add email/password sign-up and sign-in using Lovable Cloud.
- Create `src/routes/auth.tsx` as the public auth page.
- Wrap the app in an `_authenticated` layout so `/` and other routes require login.
- Move the current placeholder `index.tsx` content into the authenticated home.

### 3. Server functions
- `getDebts()` — list current user's debts.
- `createDebt(input)` — add a new debt.
- `updateDebtPaid(id, paid)` — toggle paid status.
- `deleteDebt(id)` — remove a debt.
All use `requireSupabaseAuth` middleware and `context.supabase`.

### 4. UI
- Authenticated home at `/`:
  - Summary cards: total lent, total borrowed, net balance.
  - Add utang form (name, amount, type, description).
  - List of utang entries with paid toggle and delete.
- Header with app name and sign-out.
- Use shadcn components and the existing Tailwind design tokens.

### 5. Validation
- Run build/typecheck after edits.
- Verify route strings match filenames.
- Test auth flow and CRUD in preview.
