-- 0019: make the homepage hero background photo editable in Website Settings.
-- Additive: one nullable column. Null falls back to the shipped hero image
-- (/images/syndesi-hero-new.jpg) via DEFAULT_SETTINGS, so nothing changes
-- until an admin uploads a new photo.

alter table public.website_settings add column if not exists hero_image_url text;
