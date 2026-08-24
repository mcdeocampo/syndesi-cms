-- 0021: capture website contact-form submissions ("Inquiries").
--
-- Public visitors (the anon role) can INSERT a submission; only admins can
-- read, mark-read, or delete them. Same RLS posture as the rest of the CMS,
-- using public.current_user_role(). No email is sent -- submissions are read
-- in the admin's Inquiries tab.

create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Newest first is the only list order the admin uses.
create index contact_inquiries_created_idx
  on public.contact_inquiries (created_at desc);

alter table public.contact_inquiries enable row level security;

-- Anyone, including unauthenticated site visitors, may submit an inquiry.
-- The insert is the only thing the public can do; there is no public read.
create policy "anyone can submit an inquiry"
  on public.contact_inquiries for insert
  with check (true);

-- Reading and managing submissions is admin-only (editors excluded -- these
-- contain personal contact details).
create policy "admins can read inquiries"
  on public.contact_inquiries for select
  using (public.current_user_role() in ('super_admin', 'admin'));

create policy "admins can update inquiries"
  on public.contact_inquiries for update
  using (public.current_user_role() in ('super_admin', 'admin'))
  with check (public.current_user_role() in ('super_admin', 'admin'));

create policy "admins can delete inquiries"
  on public.contact_inquiries for delete
  using (public.current_user_role() in ('super_admin', 'admin'));
