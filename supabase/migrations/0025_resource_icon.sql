-- 0025: optional custom icon per resource. Null falls back to the icon derived
-- from the file type, so existing resources are unchanged until an admin sets
-- an icon.

alter table public.resources add column if not exists icon text;
