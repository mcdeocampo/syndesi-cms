-- Gardner School CMS — Editable page section headings
-- Section tags/titles/subtitles across the 9 public pages were hardcoded in
-- JSX. This table moves that copy into the CMS. It is deliberately NOT extra
-- columns on website_settings: there are 16 sections x up to 3 strings, which
-- is repeating per-page content, not global site config.
--
-- Scope is section HEADINGS only -- full rich-text page bodies remain out of
-- scope (that was the original Module 2 with a rich text editor).
--
-- tag and subtitle are nullable because sections vary in shape (the homepage
-- CTA and About's "Our Core Values" have no tag; the stats block has no
-- subtitle).

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  tag text,
  title text,
  subtitle text,
  display_order int not null default 0,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (page_slug, section_key)
);

alter table public.page_sections enable row level security;

-- Live site copy -- the public site must read this anonymously, and there is
-- no draft concept here (same posture as website_settings).
create policy "public can read page sections"
  on public.page_sections for select
  using (true);

-- Site-wide structural copy, grouped with Website Settings rather than the
-- day-to-day content modules: admin & super_admin only.
create policy "admins can insert page sections"
  on public.page_sections for insert
  with check (public.current_user_role() in ('admin', 'super_admin'));

create policy "admins can update page sections"
  on public.page_sections for update
  using (public.current_user_role() in ('admin', 'super_admin'))
  with check (public.current_user_role() in ('admin', 'super_admin'));

-- No DELETE policy -- rows are seeded and edited, never removed via the UI.

-- ============================================================
-- Seed with the exact copy currently live, so nothing changes visually
-- until an admin actually edits something.
-- ============================================================
insert into public.page_sections (page_slug, section_key, tag, title, subtitle, display_order) values
  ('home', 'programs', 'Our Programs', 'What We Offer', 'Explore our holistic curriculum designed for the whole child.', 1),
  ('home', 'stats', 'Our Milestones', 'Gardner School at a Glance', null, 2),
  ('home', 'news', 'Updates', 'Latest News', 'Stay informed about our school community.', 3),
  ('home', 'student_life', 'Student Life', 'Beyond the Classroom', 'We believe in developing the whole student through clubs, sports, and activities.', 4),
  ('home', 'testimonials', 'Community Voices', 'What Our Community Says', 'We''re building a collection of real stories from Gardner families — here''s your invitation to be featured.', 5),
  ('home', 'cta', null, 'Ready to Begin Your Child''s Learning Journey?', 'Join the Gardner School community and give your child an education that nurtures every intelligence.', 6),

  ('about', 'intro', 'About Us', 'Our Story', null, 1),
  ('about', 'values', null, 'Our Core Values', null, 2),

  ('admissions', 'intro', 'Admissions', 'Enroll Your Child Today', 'We welcome students from Preschool through Junior High, with dedicated Special Education support. Discover the Gardner difference.', 1),

  ('programs', 'intro', 'Academic Programs', 'Our Educational Pathways', 'A seamless, enriched learning journey from Preschool through Junior High, with dedicated Special Education support.', 1),
  ('programs', 'framework', 'The Framework', 'Eight Multiple Intelligences', 'Our curriculum integrates Howard Gardner''s theory, nurturing each child''s unique strengths.', 2),

  ('student-life', 'intro', 'Student Life', 'Beyond the Classroom', 'We believe in developing the whole student through clubs, sports, and activities.', 1),

  ('faculty', 'intro', 'Faculty & Staff', 'Our Dedicated Team', 'Meet the educators who inspire and guide our students.', 1),

  ('news', 'intro', 'News & Announcements', 'Stay Updated', 'The latest happenings at Gardner School.', 1),

  ('resources', 'intro', 'Resources', 'Helpful Forms & Handbooks', 'Download the documents you need, or contact the school office for assistance.', 1),

  ('contact', 'intro', 'Get in Touch', 'We''d Love to Hear From You', 'Visit us, call, or send a message. We''re here to help.', 1);
