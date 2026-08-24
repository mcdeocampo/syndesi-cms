-- 0020: make the primary brand color editable in Website Settings.
-- Additive: one nullable hex-color column. Null falls back to the shipped
-- --navy in site.css (the (site) layout injects an override only when a value
-- is set), so the default look is unchanged until an admin picks a color.

alter table public.website_settings add column if not exists brand_color text;
