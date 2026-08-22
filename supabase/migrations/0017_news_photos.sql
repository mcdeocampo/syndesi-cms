-- 0017: multiple photos per news article.
--
-- Additive and backward-compatible. news.featured_image_id is left exactly as
-- it is -- it continues to hold the COVER photo, so every existing reader
-- (cards, homepage teaser, /news list) keeps working with no change. This
-- table only adds the *additional* photos and their order.
--
-- No data migration: existing single-image articles have zero rows here, and
-- the reader synthesizes a one-photo list from featured_image_id when this
-- table is empty for an article. An article that is later edited and saved
-- gets its rows written here, with featured_image_id kept in sync with the
-- first photo.

create table public.news_photos (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references public.news(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  -- The same photo can't be attached to the same article twice.
  unique (news_id, media_id)
);

-- Ordered reads per article are the hot path (detail page + admin edit).
create index news_photos_news_order_idx
  on public.news_photos (news_id, sort_order);

alter table public.news_photos enable row level security;

-- Public read: this is public display data, same posture as page_section_items
-- and the media table itself. The photos are only reachable joined to an
-- article, and the files already live in a public-read bucket.
create policy "public can read news photos"
  on public.news_photos for select
  using (true);

-- Writes mirror the news table's policy: editor/admin/super_admin.
create policy "cms editors can insert news photos"
  on public.news_photos for insert
  with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "cms editors can update news photos"
  on public.news_photos for update
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'))
  with check (public.current_user_role() in ('super_admin', 'admin', 'editor'));

create policy "cms editors can delete news photos"
  on public.news_photos for delete
  using (public.current_user_role() in ('super_admin', 'admin', 'editor'));
