-- 0015: make the CMS's own branding editable.
--
-- The admin sidebar and the login / reset-password screens hardcoded both the
-- crest image path and the wordmark ("Gardner CMS"), so they kept showing the
-- old brand after the site itself was rebranded.
--
-- The LOGO needs no column: those screens now read website_settings.logo_url,
-- the image already uploaded under Website Settings, instead of a fixed path.
-- Only the wordmark needs storage, and it stays nullable -- when it's blank the
-- app falls back to "<school name> CMS", so it can never go stale on its own.

alter table public.website_settings add column if not exists admin_label text;
