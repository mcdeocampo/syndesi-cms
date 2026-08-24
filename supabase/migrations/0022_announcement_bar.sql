-- 0022: editable announcement bar shown at the very top of the public site.
-- Additive, all nullable / default-off, so nothing appears until an admin
-- turns it on in Website Settings.

alter table public.website_settings
  add column if not exists announcement_enabled boolean not null default false,
  add column if not exists announcement_text text,
  add column if not exists announcement_link_href text,
  add column if not exists announcement_link_text text;
