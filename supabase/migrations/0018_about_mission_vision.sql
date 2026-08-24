-- 0018: seed the About "Mission & Vision" section so it's editable in the CMS.
--
-- The two blocks already render from ITEM_DEFAULTS (about.mission_vision) even
-- before this runs -- this inserts the matching rows so an admin can edit them
-- in Page Content. Guarded by NOT EXISTS so it's safe to run once and can't
-- duplicate the pair.

insert into public.page_section_items
  (page_slug, section_key, display_order, icon, title, body)
select * from (values
    ('about', 'mission_vision', 1, 'fas fa-bullseye', 'Our Mission',
     'To nurture every child''s unique intelligences through holistic, learner-centered education — developing confident, compassionate, and capable individuals ready to contribute meaningfully to their community and the world.'),
    ('about', 'mission_vision', 2, 'fas fa-eye', 'Our Vision',
     'To be a leading school where every learner discovers their strengths, embraces lifelong learning, and grows into a responsible, globally-minded citizen.')
  ) as v(page_slug, section_key, display_order, icon, title, body)
where not exists (
  select 1 from public.page_section_items
  where page_slug = 'about' and section_key = 'mission_vision'
);
