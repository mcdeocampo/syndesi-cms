-- Gardner School CMS — News: Publish Date is always recorded
-- Previously, choosing a date_label caption (Ongoing/Completed/etc) cleared
-- publish_date to null, losing the record of when the article was published.
-- Publish Date and date_label now answer different questions:
--   publish_date  = WHEN it was published (record-keeping, admin list, sort)
--   date_label    = optional PUBLIC display override (what visitors see)
-- This backfills any existing nulls, then enforces the invariant at the DB
-- level so a publish date can never be lost again.

update public.news set publish_date = created_at where publish_date is null;

alter table public.news alter column publish_date set default now();
alter table public.news alter column publish_date set not null;
