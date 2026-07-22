-- Gardner School CMS — Editable homepage hero text
-- The hero's tagline, headline, and description were hardcoded in
-- app/(site)/page.tsx. These columns move that copy into Website Settings so
-- admins can edit it without a developer. The headline is two columns because
-- its second line is styled differently (the gold ".highlight" span).
--
-- The existing singleton row is backfilled with the current live copy, so the
-- site looks identical until someone actually edits it.

alter table public.website_settings
  add column hero_tagline text,
  add column hero_heading text,
  add column hero_heading_highlight text,
  add column hero_description text;

update public.website_settings
set
  hero_tagline = 'Nurturing Excellence, Character, and Lifelong Learning',
  hero_heading = 'Nurturing',
  hero_heading_highlight = 'Multiple Intelligences',
  hero_description = 'A holistic educational institution dedicated to developing every child''s unique talents through Howard Gardner''s Theory of Multiple Intelligences — from Preschool through Junior High, with dedicated Special Education support.'
where id = 1;
