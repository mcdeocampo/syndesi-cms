-- Gardner School CMS — Module 3 (News) RLS policies
-- The `news` table was created in 0001_init.sql, RLS-enabled with zero
-- policies (default-deny) until now.

-- Public (anon + authenticated) can read only published rows -- powers the
-- public /news list page and /news/[slug] detail page. Unlike media/
-- website_settings, news rows can be drafts, so this is NOT a blanket
-- public-read policy.
create policy "public can read published news"
  on public.news for select
  using (status = 'published');

-- Any authenticated CMS role (editor/admin/super_admin) can read ALL rows,
-- including drafts -- required for the admin list view. Postgres OR's
-- multiple permissive SELECT policies together, so a CMS user matches this
-- policy (regardless of status) in addition to the public one above.
create policy "cms users can read all news"
  on public.news for select
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));

-- Content work: editor, admin, and super_admin can all create/edit/delete
-- News articles (unlike Website Settings/Media Library, which stay
-- admin-only). Matches the Server Action layer's use of requireAuth().
create policy "cms editors can insert news"
  on public.news for insert
  with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "cms editors can update news"
  on public.news for update
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "cms editors can delete news"
  on public.news for delete
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));
