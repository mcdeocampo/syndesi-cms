-- 0023: editable photo beside the "Our Story" text on the About page.
-- Additive, nullable. When null the story spans full width (no empty box),
-- so nothing changes until an admin uploads a photo in Website Settings.

alter table public.website_settings add column if not exists about_image_url text;
