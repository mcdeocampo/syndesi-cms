-- 0024: let the footer carry its own address / phone / email, separate from
-- the Contact page. All nullable: when a footer field is blank the footer
-- falls back to the shared contact value, so current behavior is unchanged
-- until an admin fills these in.

alter table public.website_settings
  add column if not exists footer_address text,
  add column if not exists footer_contact_number text,
  add column if not exists footer_email text;
