-- Gardner School CMS — Module 6 (Media Library) RLS policies
-- The `media` table and storage bucket/policies were created in 0001_init.sql.
-- This migration only adds row-level-security policies for the `media` TABLE,
-- which has been RLS-enabled with zero policies (default-deny) until now.

-- Any authenticated CMS role can browse the library. The storage bucket is
-- already public-read (see 0001_init.sql), so restricting this SELECT to
-- admin/super_admin would add no confidentiality benefit -- it would only
-- block editors from a future media picker in Pages/News/Faculty modules.
create policy "cms users can read media"
  on public.media for select
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));

-- Upload/delete/edit stay admin & super_admin only, matching Storage bucket
-- write policies already in place.
create policy "admins can insert media"
  on public.media for insert
  with check (public.current_user_role() in ('admin', 'super_admin'));

create policy "admins can update media"
  on public.media for update
  using (public.current_user_role() in ('admin', 'super_admin'))
  with check (public.current_user_role() in ('admin', 'super_admin'));

create policy "admins can delete media"
  on public.media for delete
  using (public.current_user_role() in ('admin', 'super_admin'));
