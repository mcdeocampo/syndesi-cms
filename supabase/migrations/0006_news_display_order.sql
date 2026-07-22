-- Gardner School CMS — News manual ordering
-- News previously ordered strictly by publish_date, which meant an
-- undated/ongoing announcement always sank to the bottom of the list.
-- This adds manual drag-and-drop ordering, matching Faculty's display_order.

alter table public.news
  add column display_order int not null default 0;
