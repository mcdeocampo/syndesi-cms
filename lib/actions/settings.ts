'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/dal'
import { createClient } from '@/lib/supabase/server'
import { sanitizeBrandColor } from '@/lib/settings'

export type SettingsFormState = { error?: string; success?: string } | undefined

async function uploadIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null,
  prefix: string
): Promise<string | null> {
  if (!file || file.size === 0) return null

  // Versioned filename (not overwriting e.g. logo.png in place) so the
  // browser/CDN cache can't serve a stale image after a swap.
  const ext = file.name.split('.').pop() || 'png'
  const path = `${prefix}-${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('media').upload(path, file, {
    upsert: false,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}

export async function updateWebsiteSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  // The real authorization check (not just the optimistic proxy.ts redirect
  // and not just the layout's requireAuth — write access specifically
  // requires admin/super_admin, matching the RLS policy on this table).
  await requireAdmin()

  const supabase = await createClient()

  let logoUrl: string | null = null
  let faviconUrl: string | null = null
  let heroUrl: string | null = null
  let aboutUrl: string | null = null
  try {
    logoUrl = await uploadIfPresent(supabase, formData.get('logo') as File | null, 'logo')
    faviconUrl = await uploadIfPresent(
      supabase,
      formData.get('favicon') as File | null,
      'favicon'
    )
    heroUrl = await uploadIfPresent(
      supabase,
      formData.get('hero_image') as File | null,
      'hero'
    )
    aboutUrl = await uploadIfPresent(
      supabase,
      formData.get('about_image') as File | null,
      'about'
    )
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Upload failed.' }
  }

  const textField = (name: string) => {
    const v = formData.get(name)
    return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
  }

  const update: Record<string, unknown> = {
    school_name: textField('school_name') || 'Syndesi School',
    address: textField('address'),
    contact_number: textField('contact_number'),
    email: textField('email'),
    office_hours: textField('office_hours'),
    footer_address: textField('footer_address'),
    footer_contact_number: textField('footer_contact_number'),
    footer_email: textField('footer_email'),
    facebook_url: textField('facebook_url'),
    youtube_url: textField('youtube_url'),
    instagram_url: textField('instagram_url'),
    linkedin_url: textField('linkedin_url'),
    footer_text: textField('footer_text'),
    copyright_text: textField('copyright_text'),
    google_maps_embed: textField('google_maps_embed'),
    seo_title: textField('seo_title'),
    seo_description: textField('seo_description'),
    hero_tagline: textField('hero_tagline'),
    hero_heading: textField('hero_heading'),
    hero_heading_highlight: textField('hero_heading_highlight'),
    hero_description: textField('hero_description'),
    hero_campus_caption: textField('hero_campus_caption'),
    // Normalized to a safe hex or null; an invalid value clears it (reverts to
    // the shipped navy) rather than being stored and injected verbatim.
    brand_color: sanitizeBrandColor(textField('brand_color')),
    // Unchecked checkboxes aren't submitted at all, so absence means false.
    announcement_enabled: formData.get('announcement_enabled') === 'on',
    announcement_text: textField('announcement_text'),
    announcement_link_href: textField('announcement_link_href'),
    announcement_link_text: textField('announcement_link_text'),
    admin_label: textField('admin_label'),
    updated_at: new Date().toISOString(),
  }

  if (logoUrl) update.logo_url = logoUrl
  if (faviconUrl) update.favicon_url = faviconUrl
  if (heroUrl) update.hero_image_url = heroUrl
  // A new upload sets the photo; the remove checkbox clears it. A new upload
  // wins if somehow both are sent.
  if (aboutUrl) update.about_image_url = aboutUrl
  else if (formData.get('about_image_remove') === 'on') update.about_image_url = null

  // .select() is REQUIRED, not decorative: a PostgREST UPDATE that matches no
  // row (blocked by RLS, or the row absent) returns error:null -- a silent
  // no-op that looked like success and then reverted on the next read. Reading
  // the row back lets us tell a real save from a rejected one.
  const { data, error } = await supabase
    .from('website_settings')
    .update(update)
    .eq('id', 1)
    .select('id')

  if (error) {
    return { error: `Could not save settings: ${error.message}` }
  }
  if (!data || data.length === 0) {
    return {
      error:
        'Settings were not saved — the database rejected the change. This usually ' +
        'means your account lacks admin rights. Ask a super admin to check your role.',
    }
  }

  // 'layout' (not the default 'page' type) — website_settings is read in
  // the (site) route group's layout, which every one of the 9 public pages
  // nests under. Revalidating with 'layout' busts the whole route tree's
  // cache; a bare revalidatePath('/') would only refresh the home page and
  // leave the other 8 serving stale settings.
  revalidatePath('/', 'layout')

  return { success: 'Settings saved.' }
}
