-- Gardner School CMS — Phase 1 schema
-- Run this in the Supabase SQL editor (bypasses RLS as table owner, which is
-- required for the seed insert below).

-- ============================================================
-- Shared enum for content status (used by every content module)
-- ============================================================
create type content_status as enum ('draft', 'published');

-- ============================================================
-- profiles — one row per auth user, holds the CMS role
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('super_admin', 'admin', 'editor')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- ============================================================
-- Role-check helper — used by every RLS policy, present and future.
-- security definer + explicit search_path avoids search-path hijacking;
-- stable lets Postgres cache the result within a query.
-- ============================================================
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- website_settings — singleton row (Module 1, active in Phase 1)
-- ============================================================
create table public.website_settings (
  id int primary key default 1 check (id = 1),
  school_name text not null default 'Gardner School of Multiple Intelligences',
  logo_url text,
  favicon_url text,
  address text,
  contact_number text,
  email text,
  office_hours text,
  facebook_url text,
  youtube_url text,
  instagram_url text,
  linkedin_url text,
  footer_text text,
  copyright_text text,
  google_maps_embed text,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.website_settings enable row level security;

create policy "public can read settings"
  on public.website_settings for select
  using (true);

-- WITH CHECK (not just USING) so the policy re-validates the row's state
-- after the update, not only which row can be targeted.
create policy "admins can update settings"
  on public.website_settings for update
  using (public.current_user_role() in ('admin', 'super_admin'))
  with check (public.current_user_role() in ('admin', 'super_admin'));

-- Seeded once here (singleton). No INSERT/DELETE policy — this is the only
-- row this table will ever have.
insert into public.website_settings (id) values (1);

-- ============================================================
-- media — canonical asset store (Module 6). Other modules FK into this
-- rather than storing their own duplicate storage URLs.
-- ============================================================
create table public.media (
  id uuid primary key default gen_random_uuid(),
  file_url text not null,
  file_name text not null,
  file_type text,
  file_size int,
  alt_text text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.media enable row level security;
-- No policies yet — RLS enabled with zero policies = fully locked down
-- (default-deny) until Module 6 is built. See lib/supabase/dal.ts / plan
-- notes: the Phase 1 Dashboard's count() queries run inside the
-- already-authenticated /admin Server Component context, so they're
-- unaffected by the lack of a public policy here.

-- ============================================================
-- pages — Module 2 (deferred, stub only)
-- ============================================================
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  hero_image_id uuid references public.media(id) on delete set null,
  content_json jsonb,
  content_html text,
  status content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pages enable row level security;
-- No policies yet — see media table comment above.

-- ============================================================
-- news — Module 3 (deferred, stub only)
-- ============================================================
create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  featured_image_id uuid references public.media(id) on delete set null,
  summary text,
  content_json jsonb,
  content_html text,
  publish_date timestamptz,
  author text,
  category text,
  status content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news enable row level security;
-- No policies yet — see media table comment above.

-- ============================================================
-- faculty — Module 4 (deferred, stub only)
-- ============================================================
create table public.faculty (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  photo_id uuid references public.media(id) on delete set null,
  full_name text not null,
  position text,
  department text,
  biography text,
  email text,
  display_order int not null default 0,
  status content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faculty enable row level security;
-- No policies yet — see media table comment above.

-- ============================================================
-- resources — Module 5 (deferred, stub only)
-- ============================================================
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  file_id uuid references public.media(id) on delete set null,
  status content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resources enable row level security;
-- No policies yet — see media table comment above.

-- ============================================================
-- gallery / gallery_images — Module 7 (deferred, stub only)
-- ============================================================
create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_id uuid references public.media(id) on delete set null,
  status content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gallery enable row level security;
-- No policies yet — see media table comment above.

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.gallery(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  display_order int not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.gallery_images enable row level security;
-- No policies yet — see media table comment above.

-- ============================================================
-- Storage: public "media" bucket for logos/favicons/uploads.
-- Reads are public (must load for anonymous visitors); writes gated to
-- admin/super_admin via the same role-check function.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public can read media bucket"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "admins can upload to media bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and public.current_user_role() in ('admin', 'super_admin')
  );

create policy "admins can update media bucket objects"
  on storage.objects for update
  using (
    bucket_id = 'media'
    and public.current_user_role() in ('admin', 'super_admin')
  );

create policy "admins can delete media bucket objects"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and public.current_user_role() in ('admin', 'super_admin')
  );
