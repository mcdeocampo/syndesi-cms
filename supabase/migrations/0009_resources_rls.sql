-- Gardner School CMS — Module 5 (Resources) RLS policies
-- The `resources` table was created in 0001_init.sql, RLS-enabled with zero
-- policies (default-deny) until now.

-- Public (anon + authenticated) can read only published rows -- powers the
-- public /resources download center.
create policy "public can read published resources"
  on public.resources for select
  using (status = 'published');

-- Any authenticated CMS role can read ALL rows (including drafts) for the
-- admin list view. Postgres ORs multiple permissive SELECT policies.
create policy "cms users can read all resources"
  on public.resources for select
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));

-- Writes are admin & super_admin only (unlike Faculty/News) -- Resources
-- uploads document files, and file uploads to the shared storage bucket are
-- already admin-gated. Matches the Server Action layer's use of requireAdmin().
create policy "admins can insert resources"
  on public.resources for insert
  with check (public.current_user_role() in ('admin', 'super_admin'));

create policy "admins can update resources"
  on public.resources for update
  using (public.current_user_role() in ('admin', 'super_admin'))
  with check (public.current_user_role() in ('admin', 'super_admin'));

create policy "admins can delete resources"
  on public.resources for delete
  using (public.current_user_role() in ('admin', 'super_admin'));
