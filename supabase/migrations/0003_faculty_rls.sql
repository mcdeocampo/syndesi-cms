-- Gardner School CMS — Module 4 (Faculty) RLS policies
-- The `faculty` table was created in 0001_init.sql, RLS-enabled with zero
-- policies (default-deny) until now.

-- Public (anon + authenticated) can read only published rows -- powers the
-- public /faculty page. Unlike media/website_settings, faculty rows can be
-- drafts, so this is NOT a blanket public-read policy.
create policy "public can read published faculty"
  on public.faculty for select
  using (status = 'published');

-- Any authenticated CMS role (editor/admin/super_admin) can read ALL rows,
-- including drafts -- required for the admin list view. Postgres OR's
-- multiple permissive SELECT policies together, so a CMS user matches this
-- policy (regardless of status) in addition to the public one above.
create policy "cms users can read all faculty"
  on public.faculty for select
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));

-- Content work: editor, admin, and super_admin can all create/edit/delete
-- Faculty entries (unlike Website Settings/Media Library, which stay
-- admin-only). Matches the Server Action layer's use of requireAuth().
create policy "cms editors can insert faculty"
  on public.faculty for insert
  with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "cms editors can update faculty"
  on public.faculty for update
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "cms editors can delete faculty"
  on public.faculty for delete
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));
