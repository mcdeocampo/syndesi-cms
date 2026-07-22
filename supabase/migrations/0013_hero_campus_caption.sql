-- Gardner School CMS — Editable hero campus caption
-- The small location line over the hero photo ("Our Campus — San Antonio,
-- San Pascual") was hardcoded in app/(site)/page.tsx. It joins the other
-- hero fields in Website Settings so it can be changed without a developer.
--
-- The location-pin icon stays in code -- it's design, not copy, matching how
-- the other section icons are handled.

alter table public.website_settings
  add column hero_campus_caption text;

update public.website_settings
set hero_campus_caption = 'Our Campus — San Antonio, San Pascual'
where id = 1;
