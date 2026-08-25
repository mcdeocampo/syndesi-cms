import { createClient } from '@/lib/supabase/server'

export type FacultyMember = {
  id: string
  slug: string
  photo_id: string | null
  photo_url: string | null
  full_name: string
  position: string | null
  department: string | null
  icon: string | null
  biography: string | null
  email: string | null
  display_order: number
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

type FacultyRow = Omit<FacultyMember, 'photo_url'> & {
  media: { file_url: string } | null
}

function withPhotoUrl(row: FacultyRow): FacultyMember {
  const { media, ...rest } = row
  return { ...rest, photo_url: media?.file_url ?? null }
}

// Public site reader: published only, ordered for display. Tolerates
// Supabase errors (matches getSiteSettings()'s precedent) since this runs
// in the unauthenticated (site) route group and the public site must not
// crash if Supabase is briefly unreachable.
export async function getPublishedFaculty(): Promise<FacultyMember[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('faculty')
      .select('*, media(file_url)')
      .eq('status', 'published')
      .order('display_order', { ascending: true })

    if (error || !data) return []
    return (data as FacultyRow[]).map(withPhotoUrl)
  } catch {
    return []
  }
}

// Admin list reader: all statuses, same ordering. No fallback -- this is
// only reachable post-login (matches getMediaLibrary()'s no-fallback
// precedent), so a genuine Supabase error should surface.
export async function getAllFaculty(): Promise<FacultyMember[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faculty')
    .select('*, media(file_url)')
    .order('display_order', { ascending: true })

  if (error) throw new Error(`Could not load faculty: ${error.message}`)
  return (data as FacultyRow[] ?? []).map(withPhotoUrl)
}

// Single-record reader for the edit page. Returns null if not found rather
// than throwing, so the page can call notFound().
export async function getFacultyById(id: string): Promise<FacultyMember | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faculty')
    .select('*, media(file_url)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return withPhotoUrl(data as FacultyRow)
}
