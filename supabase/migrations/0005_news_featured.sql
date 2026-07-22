-- Gardner School CMS — News "Featured on Homepage" flag
-- The homepage's Latest News teaser was showing the 3 most-recently
-- published articles automatically; switched to manual curation so an
-- important announcement can stay pinned regardless of publish date.

alter table public.news
  add column featured boolean not null default false;
