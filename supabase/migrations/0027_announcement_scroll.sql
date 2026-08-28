-- 0027: option to scroll the announcement bar as a ticker/marquee.
-- Default false keeps the current static bar until an admin turns it on.

alter table public.website_settings
  add column if not exists announcement_scroll boolean not null default false;
