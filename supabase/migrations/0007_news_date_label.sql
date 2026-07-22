-- Gardner School CMS — News custom date label
-- When Publish Date is left blank (e.g. an ongoing announcement), the
-- public site previously always showed the word "Ongoing". This adds an
-- optional override so other captions (Completed, Postponed, TBA, etc.)
-- can be used instead. Falls back to "Ongoing" in the UI if left blank.

alter table public.news
  add column date_label text;
