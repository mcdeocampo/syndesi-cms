-- Gardner School CMS — Editable card/item content
-- Companion to page_sections: that table holds ONE heading per section, this
-- one holds MANY items per section (the repeating cards inside it).
--
-- Columns are a union across item shapes; each section uses only the subset
-- declared in lib/page-section-items-config.ts (ITEM_SECTIONS.fields), so the
-- admin form never renders dead inputs.
--
-- The seed below is GENERATED from ITEM_DEFAULTS via
--   node --experimental-strip-types scripts/gen-section-items-seed.mts
-- so the seeded rows can never drift from the runtime fallback copy.
-- Text is stored DECODED ('&' not '&amp;'); en/em dashes are intentionally
-- inconsistent between sections and are preserved exactly.

create table public.page_section_items (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  display_order int not null default 0,
  icon text,
  title text,
  subtitle text,
  body text,
  body_suffix text,
  link_href text,
  link_text text,
  anchor_id text,
  value text,
  value_suffix text,
  value_format text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index page_section_items_lookup
  on public.page_section_items (page_slug, section_key, display_order);

alter table public.page_section_items enable row level security;

-- Live site copy -- the public site reads this anonymously, no draft concept.
create policy "public can read page section items"
  on public.page_section_items for select
  using (true);

-- Admin & super_admin only, matching page_sections. DELETE is included here
-- (unlike headings) because items can genuinely be added and removed.
create policy "admins can insert page section items"
  on public.page_section_items for insert
  with check (public.current_user_role() in ('admin', 'super_admin'));

create policy "admins can update page section items"
  on public.page_section_items for update
  using (public.current_user_role() in ('admin', 'super_admin'))
  with check (public.current_user_role() in ('admin', 'super_admin'));

create policy "admins can delete page section items"
  on public.page_section_items for delete
  using (public.current_user_role() in ('admin', 'super_admin'));

-- ============================================================
-- Seed (generated -- see header)
-- ============================================================
insert into public.page_section_items (page_slug, section_key, display_order, icon, title, subtitle, body, body_suffix, link_href, link_text, anchor_id, value, value_suffix, value_format) values
  ('home', 'programs', 1, 'fas fa-child', 'Preschool', null, 'Play-based learning that builds curiosity and foundational skills in a nurturing environment.', null, '/programs#preschool', 'Learn More', null, null, null, null),
  ('home', 'programs', 2, 'fas fa-book', 'Elementary', null, 'A strong academic foundation balancing literacy, numeracy, and character education.', null, '/programs#elementary', 'Learn More', null, null, null, null),
  ('home', 'programs', 3, 'fas fa-user-graduate', 'Junior High School', null, 'A challenging curriculum that prepares students for higher education and beyond.', null, '/programs#junior-high', 'Learn More', null, null, null, null),
  ('home', 'programs', 4, 'fas fa-hands-helping', 'Special Education', null, 'Individualized support that helps every learner reach their full potential.', null, '/programs#special-education', 'Learn More', null, null, null, null),
  ('home', 'stats', 1, 'fas fa-calendar-check', 'Years of Excellence', null, null, null, null, null, null, '7', '+', null),
  ('home', 'stats', 2, 'fas fa-layer-group', 'Academic Programs', null, null, null, null, null, null, '4', null, null),
  ('home', 'stats', 3, 'fab fa-facebook', 'Facebook Community', null, null, null, null, null, null, '1900', '+', 'k'),
  ('home', 'stats', 4, 'fas fa-brain', 'Intelligences We Nurture', null, null, null, null, null, null, '8', null, null),
  ('home', 'mi_words', 1, null, 'Discover', null, null, null, null, null, null, null, null, null),
  ('home', 'mi_words', 2, null, 'Create', null, null, null, null, null, null, null, null, null),
  ('home', 'mi_words', 3, null, 'Lead', null, null, null, null, null, null, null, null, null),
  ('home', 'mi_words', 4, null, 'Inspire', null, null, null, null, null, null, null, null, null),
  ('home', 'student_life', 1, 'fas fa-medal', 'Clubs & Organizations', null, 'Debate, science, and art clubs — there''s something for every interest.', null, null, null, null, null, null, null),
  ('home', 'student_life', 2, 'fas fa-futbol', 'Sports', null, 'Basketball, volleyball, track, and chess in a team environment.', null, null, null, null, null, null, null),
  ('home', 'student_life', 3, 'fas fa-theater-masks', 'Events & Activities', null, 'Cultural festivals, field trips, and community service projects.', null, null, null, null, null, null, null),
  ('home', 'student_life', 4, 'fas fa-trophy', 'Achievements', null, 'Students who consistently excel in regional and national competitions.', null, null, null, null, null, null, null),
  ('home', 'testimonials', 1, 'fas fa-people-roof', 'Parents', 'Gardner Family', '"We''d love to share what makes your experience as a Gardner parent special. Your story could be the next one featured here."', null, '/contact', 'Share Your Story', null, null, null, null),
  ('home', 'testimonials', 2, 'fas fa-user-graduate', 'Students', 'Gardner Student', '"What''s your favorite Gardner memory? We''re inviting current students to share their experiences for this space."', null, '/contact', 'Share Your Story', null, null, null, null),
  ('home', 'testimonials', 3, 'fas fa-user-tie', 'Alumni', 'Gardner Graduate', '"Wherever your journey has taken you since Gardner, we''d be honored to feature your reflections here."', null, '/contact', 'Share Your Story', null, null, null, null),
  ('about', 'facts', 1, 'fas fa-calendar-alt', 'Founded', null, '2019', null, null, null, null, null, null, null),
  ('about', 'facts', 2, 'fas fa-map-pin', 'Location', null, 'San Antonio, San Pascual, Batangas', null, null, null, null, null, null, null),
  ('about', 'facts', 3, 'fas fa-user-graduate', 'School Head', null, 'Imeilyn Faltado', null, null, null, null, null, null, null),
  ('about', 'facts', 4, 'fas fa-award', 'Accreditation', null, 'DepEd Accredited', null, null, null, null, null, null, null),
  ('about', 'values', 1, null, 'Integrity', null, 'Upholding honesty and moral principles.', null, null, null, null, null, null, null),
  ('about', 'values', 2, null, 'Excellence', null, 'Striving for the highest quality in all we do.', null, null, null, null, null, null, null),
  ('about', 'values', 3, null, 'Innovation', null, 'Embracing creativity and forward-thinking.', null, null, null, null, null, null, null),
  ('about', 'values', 4, null, 'Community', null, 'Fostering a supportive and inclusive environment.', null, null, null, null, null, null, null),
  ('admissions', 'cards', 1, 'fas fa-clipboard-list', 'Admission Requirements', null, null, null, null, null, null, null, null, null),
  ('admissions', 'cards', 2, 'fas fa-calendar-check', 'Enrollment Procedure', null, null, null, null, null, null, null, null, null),
  ('admissions', 'cards', 3, 'fas fa-coins', 'Tuition & Fees', null, 'For the latest tuition fee schedule, please contact our finance office or visit the school. We offer flexible payment plans.', null, null, null, null, null, null, null),
  ('admissions', 'cards', 4, 'fas fa-graduation-cap', 'Scholarships', null, 'We offer academic and athletic scholarships. Inquire at the admissions office for qualification criteria and deadlines.', null, null, null, null, null, null, null),
  ('admissions', 'requirements', 1, null, null, null, 'Completed application form', null, null, null, null, null, null, null),
  ('admissions', 'requirements', 2, null, null, null, 'Birth certificate (PSA)', null, null, null, null, null, null, null),
  ('admissions', 'requirements', 3, null, null, null, 'Report card (previous grade)', null, null, null, null, null, null, null),
  ('admissions', 'requirements', 4, null, null, null, 'Good moral certificate', null, null, null, null, null, null, null),
  ('admissions', 'requirements', 5, null, null, null, '2x2 ID photos', null, null, null, null, null, null, null),
  ('admissions', 'procedure', 1, null, null, null, 'Submit requirements to the Registrar.', null, null, null, null, null, null, null),
  ('admissions', 'procedure', 2, null, null, null, 'Take the entrance assessment (if applicable).', null, null, null, null, null, null, null),
  ('admissions', 'procedure', 3, null, null, null, 'Interview with the Principal.', null, null, null, null, null, null, null),
  ('admissions', 'procedure', 4, null, null, null, 'Pay the registration fee.', null, null, null, null, null, null, null),
  ('admissions', 'procedure', 5, null, null, null, 'Receive class schedule and ID.', null, null, null, null, null, null, null),
  ('programs', 'levels', 1, 'fas fa-child', 'Preschool', null, 'Play-based learning that fosters curiosity and foundational skills in a nurturing environment.', null, null, null, 'preschool', null, null, null),
  ('programs', 'levels', 2, 'fas fa-book', 'Elementary', null, 'Strong academic foundation with a balanced approach to literacy, numeracy, and character education.', null, null, null, 'elementary', null, null, null),
  ('programs', 'levels', 3, 'fas fa-user-graduate', 'Junior High School', null, 'Challenging curriculum that prepares students for higher education and career readiness.', null, null, null, 'junior-high', null, null, null),
  ('programs', 'levels', 4, 'fas fa-hands-helping', 'Special Education', null, 'Individualized programs and support services designed around each learner''s needs.', null, null, null, 'special-education', null, null, null),
  ('programs', 'note', 1, 'fas fa-question-circle', 'Considering Senior High?', null, 'Please ', ' for current Senior High School offerings and available tracks.', '/contact', 'inquire with our admissions office', null, null, null, null),
  ('programs', 'framework', 1, null, 'Linguistic', null, 'Word and language mastery', null, null, null, null, null, null, null),
  ('programs', 'framework', 2, null, 'Logical-Mathematical', null, 'Reasoning and numbers', null, null, null, null, null, null, null),
  ('programs', 'framework', 3, null, 'Spatial', null, 'Visual and spatial thinking', null, null, null, null, null, null, null),
  ('programs', 'framework', 4, null, 'Bodily-Kinesthetic', null, 'Physical expression', null, null, null, null, null, null, null),
  ('programs', 'framework', 5, null, 'Musical', null, 'Rhythm and sound', null, null, null, null, null, null, null),
  ('programs', 'framework', 6, null, 'Interpersonal', null, 'Social understanding', null, null, null, null, null, null, null),
  ('programs', 'framework', 7, null, 'Intrapersonal', null, 'Self-awareness', null, null, null, null, null, null, null),
  ('programs', 'framework', 8, null, 'Naturalistic', null, 'Nature and environment', null, null, null, null, null, null, null),
  ('student-life', 'cards', 1, 'fas fa-medal', 'Clubs & Organizations', null, 'Join our debate club, science club, art society, and more – there''s something for every interest.', null, null, null, null, null, null, null),
  ('student-life', 'cards', 2, 'fas fa-futbol', 'Sports', null, 'Basketball, volleyball, track, and chess – compete and grow in a team environment.', null, null, null, null, null, null, null),
  ('student-life', 'cards', 3, 'fas fa-theater-masks', 'Events & Activities', null, 'Annual cultural festivals, field trips, and community service projects.', null, null, null, null, null, null, null),
  ('student-life', 'cards', 4, 'fas fa-trophy', 'Achievements', null, 'Our students consistently win in regional and national competitions, showcasing excellence.', null, null, null, null, null, null, null);
