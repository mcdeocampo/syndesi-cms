import { createClient } from '@/lib/supabase/server'

export type WebsiteSettings = {
  school_name: string
  logo_url: string | null
  favicon_url: string | null
  address: string | null
  contact_number: string | null
  email: string | null
  office_hours: string | null
  facebook_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  footer_text: string | null
  copyright_text: string | null
  google_maps_embed: string | null
  seo_title: string | null
  seo_description: string | null
  hero_tagline: string | null
  hero_heading: string | null
  hero_heading_highlight: string | null
  hero_description: string | null
  hero_campus_caption: string | null
  // Homepage hero background photo. Null falls back to the shipped image.
  hero_image_url: string | null
  // Primary brand color (hex). Drives the navy fills across the site --
  // banners, stats, CTA, header, footer. Null falls back to the shipped navy
  // in site.css, so the default look is untouched until an admin changes it.
  brand_color: string | null
  // Wordmark shown in the CMS sidebar and on the login screen. Null means
  // "derive it from school_name" -- see adminLabel() below.
  admin_label: string | null
  updated_at: string
}

// The social networks the site knows about, in display order. Single source of
// truth: the contact page (and anywhere else that shows social icons) maps
// over this rather than hand-writing a block per network, so adding one is a
// single entry here. `satisfies` ties each key to a real settings column, so a
// typo or a removed column is a compile error rather than a silently dead icon.
export const SOCIAL_LINKS = [
  { key: 'facebook_url', name: 'Facebook', icon: 'fab fa-facebook-f' },
  { key: 'youtube_url', name: 'YouTube', icon: 'fab fa-youtube' },
  { key: 'instagram_url', name: 'Instagram', icon: 'fab fa-instagram' },
  { key: 'linkedin_url', name: 'LinkedIn', icon: 'fab fa-linkedin-in' },
] as const satisfies readonly {
  key: keyof WebsiteSettings
  name: string
  icon: string
}[]

// Accept only a plain 3- or 6-digit hex color. Anything else returns null so a
// stray value can never break the layout or, worse, inject CSS (the value is
// interpolated into a <style> tag). Returned normalized with a leading '#'.
export function sanitizeBrandColor(value: string | null | undefined): string | null {
  if (!value) return null
  const v = value.trim()
  return /^#?[0-9a-fA-F]{6}$/.test(v) || /^#?[0-9a-fA-F]{3}$/.test(v)
    ? v.startsWith('#')
      ? v
      : `#${v}`
    : null
}

// The CMS's own wordmark. Deliberately derived rather than stored by default,
// so renaming the school can't leave the admin panel showing the old brand.
export function adminLabel(settings: WebsiteSettings): string {
  return settings.admin_label?.trim() || `${settings.school_name} CMS`
}

// Fallback used if the settings row hasn't been seeded yet (e.g. the
// Supabase migration hasn't been run) so the site still renders sensibly
// during initial setup instead of crashing.
// Exported so render sites (e.g. the homepage hero) can fall back to the
// same copy if a column is null, rather than duplicating the strings.
export const DEFAULT_SETTINGS: WebsiteSettings = {
  school_name: 'Syndesi School',
  logo_url: '/images/syndesi-logo-web.png',
  favicon_url: '/images/syndesi-favicon.png',
  // Full street address -- the contact page renders this with
  // `whiteSpace: 'pre-line'`, so newlines entered in the CMS are preserved.
  address: '1887 Ibarra Street, Batangas City, Batangas',
  contact_number: '043 984 6533',
  email: 'contact@syndesi.edu.ph',
  office_hours: 'Mon – Fri, 7:30 AM – 4:30 PM',
  facebook_url:
    'https://www.facebook.com/SyndesiSchoolDemo',
  youtube_url: null,
  instagram_url: null,
  linkedin_url: null,
  footer_text:
    "A Multiple Intelligence School in Batangas City, Batangas, nurturing every child's unique talents.",
  copyright_text: 'DEMO WEBSITE | Concept Preview Only • Noetikon Technologies',
  google_maps_embed: null,
  seo_title: 'Syndesi School | Batangas',
  seo_description:
    "Syndesi School is a Preschool, Elementary, Junior High, and Special Education school in Batangas City, Batangas, nurturing every child's unique talents.",
  hero_tagline: 'Nurturing Excellence, Character, and Lifelong Learning',
  hero_heading: 'Nurturing',
  hero_heading_highlight: 'Multiple Intelligences',
  hero_description:
    "A holistic educational institution dedicated to developing every child's unique talents through Howard Gardner's Theory of Multiple Intelligences — from Preschool through Junior High, with dedicated Special Education support.",
  hero_campus_caption: 'Our Campus — Batangas City',
  hero_image_url: '/images/syndesi-hero-new.jpg',
  // Null by default so the layout injects no override and the shipped --navy
  // in site.css applies pixel-for-pixel. Set only when an admin picks a color.
  brand_color: null,
  // Null on purpose: falls back to "<school name> CMS" via adminLabel().
  admin_label: null,
  updated_at: new Date().toISOString(),
}

// Reads directly (no React cache() wrapper) — called once per request from
// the (site) route group's layout, which is the single place this is needed
// per render pass.
export async function getSiteSettings(): Promise<WebsiteSettings> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('website_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (!data) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...data }
  } catch {
    // Supabase isn't reachable yet (e.g. env vars still hold placeholder
    // values during initial setup) — fall back so the public site still
    // renders instead of crashing.
    return DEFAULT_SETTINGS
  }
}
