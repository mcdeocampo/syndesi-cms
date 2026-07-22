'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/dal'
import { createClient } from '@/lib/supabase/server'

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
  try {
    logoUrl = await uploadIfPresent(supabase, formData.get('logo') as File | null, 'logo')
    faviconUrl = await uploadIfPresent(
      supabase,
      formData.get('favicon') as File | null,
      'favicon'
    )
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Upload failed.' }
  }

  const textField = (name: string) => {
    const v = formData.get(name)
    return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
  }

  const update: Record<string, unknown> = {
    school_name: textField('school_name') || 'Gardner School of Multiple Intelligences',
    address: textField('address'),
    contact_number: textField('contact_number'),
    email: textField('email'),
    office_hours: textField('office_hours'),
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
    admin_label: textField('admin_label'),
    updated_at: new Date().toISOString(),
  }

  if (logoUrl) update.logo_url = logoUrl
  if (faviconUrl) update.favicon_url = faviconUrl

  const { error } = await supabase.from('website_settings').update(update).eq('id', 1)

  if (error) {
    return { error: `Could not save settings: ${error.message}` }
  }

  // 'layout' (not the default 'page' type) — website_settings is read in
  // the (site) route group's layout, which every one of the 9 public pages
  // nests under. Revalidating with 'layout' busts the whole route tree's
  // cache; a bare revalidatePath('/') would only refresh the home page and
  // leave the other 8 serving stale settings.
  revalidatePath('/', 'layout')

  return { success: 'Settings saved.' }
}
