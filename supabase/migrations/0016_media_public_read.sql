-- 0016: let the public site resolve media URLs.
--
-- 0002_media_rls.sql gave `media` a single SELECT policy limited to
-- super_admin/admin/editor. That is right for the Media Library screen, but
-- the PUBLIC site reads this table too: faculty photos, news featured images
-- and resource downloads are all resolved through a `media(file_url)` join.
--
-- Anonymous visitors match no role, so those joins returned null and every
-- page silently fell back to its placeholder icon -- 8 faculty had photos
-- assigned and none of them rendered. A row filtered out by RLS inside a join
-- is not an error, which is why this failed quietly rather than loudly.
--
-- Granting public SELECT costs nothing in confidentiality: the `media` storage
-- bucket is already public-read (it has to be -- the logo and favicon must
-- load for anonymous visitors with no auth context), so every file_url in this
-- table is a publicly fetchable URL by design. This policy only lets the site
-- discover URLs it is already allowed to serve.
--
-- Writes are unchanged: insert/update/delete remain admin/super_admin only.

create policy "public can read media"
  on public.media for select
  using (true);
