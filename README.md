# Gardner School Website + CMS (Phase 1)

A Next.js + Supabase rebuild of the Gardner School website. The public site
(9 pages, ported from the original static HTML/CSS/JS) lives at the root
routes; a CMS admin area lives under `/admin`.

**Phase 1 scope**: Auth (login/logout/password reset) + a Dashboard shell +
the **Website Settings** module, fully working end-to-end. Page Management,
News, Faculty, Resources, Media Library, and Gallery are scheduled for later
phases — their database tables exist (so the schema won't need
restructuring later) but have no admin UI yet and are locked down with zero
RLS policies until built.

## One-time setup

You'll need a free [Supabase](https://supabase.com) project. These steps
involve creating an account and copying credentials — do them yourself
rather than sharing login access.

### 1. Create the Supabase project

Go to [supabase.com](https://supabase.com), sign in, and create a new
project (any name/region/password). Wait for it to finish provisioning
(~2 minutes).

### 2. Get your API credentials

In your Supabase project: **Settings → API**. Copy:

- **Project URL**
- **anon / public** key

**Never copy the `service_role` / secret key anywhere in this project** — it
bypasses Row Level Security and should never be exposed to the browser or
committed to source control.

### 3. Set environment variables

Copy `.env.local.example` to `.env.local` and fill in the two values from
step 2:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3300
```

When you deploy (e.g. to Vercel), set the same three variables in your
hosting provider's environment variable settings — update
`NEXT_PUBLIC_SITE_URL` to your real deployed URL, since it's used to build
the password-reset email link.

### 4. Run the database migration

In your Supabase project, go to the **SQL Editor**, paste the entire
contents of `supabase/migrations/0001_init.sql`, and run it.

This creates every table (including the stub tables for future modules),
all Row Level Security policies, the `media` storage bucket, and seeds the
one-row `website_settings` table. This step **must** be run through the SQL
Editor (or `supabase db push` if you use the Supabase CLI) — not through the
app — because seeding the settings row requires bypassing RLS as the table
owner, which the app intentionally can't do (it never uses the
service-role key).

### 5. Create your first admin account

The CMS has no public sign-up page — accounts are created manually:

1. In Supabase: **Authentication → Users → Add user**. Create a user with
   your email and a password.
2. In the **SQL Editor**, run (replace the email):

   ```sql
   update public.profiles
   set role = 'super_admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

   If no row exists yet in `profiles` for that user (it's created
   automatically only if you've wired up a trigger, which Phase 1 doesn't
   include), insert it instead:

   ```sql
   insert into public.profiles (id, role)
   select id, 'super_admin' from auth.users where email = 'you@example.com';
   ```

You can now log in at `/admin/login` with that email/password.

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3300` for the public site, `/admin` for the CMS
(redirects to `/admin/login` if you're not signed in).

## Project structure

```
app/
  (site)/          Public website — 9 pages, shared Header/Footer, reads
                    Website Settings from the database on every request
  admin/
    (auth)/         /admin/login, /admin/reset-password — no auth required,
                     no sidebar
    (protected)/     /admin, /admin/settings — auth-guarded, sidebar shell
lib/
  supabase/         Browser client, server client, and the Data Access
                     Layer (lib/supabase/dal.ts) — the DAL is what actually
                     enforces auth on every protected page/action; proxy.ts
                     only does a cheap optimistic redirect
  actions/          Server Actions (auth, settings)
supabase/migrations/ SQL schema + RLS — run manually in the Supabase SQL
                      Editor, see step 4 above
proxy.ts            Next.js 16's renamed "Middleware" — refreshes the
                    Supabase session cookie on every request
```

## Verifying it's working

- [ ] All 9 public pages load and match the original site's design/behavior
- [ ] Visiting `/admin` while logged out redirects to `/admin/login`
- [ ] Logging in with your admin account lands on the Dashboard
- [ ] Dashboard stat cards show 0 for Pages/News/Faculty/Resources/Gallery
      (expected — those modules aren't built yet) without erroring
- [ ] Editing Website Settings (e.g. school name, logo) and saving updates
      the live public site immediately, without a redeploy
- [ ] Logging out and revisiting `/admin` redirects to login again
