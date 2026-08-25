import { createClient } from '@/lib/supabase/server'

export type Resource = {
  id: string
  title: string
  description: string | null
  category: string | null
  icon: string | null
  file_id: string | null
  file_url: string | null
  file_name: string | null
  file_type: string | null
  file_size: number | null
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

type ResourceRow = {
  id: string
  title: string
  description: string | null
  category: string | null
  icon: string | null
  file_id: string | null
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  media: {
    file_url: string
    file_name: string
    file_type: string | null
    file_size: number | null
  } | null
}

function toResource(row: ResourceRow): Resource {
  const { media, ...rest } = row
  return {
    ...rest,
    file_url: media?.file_url ?? null,
    file_name: media?.file_name ?? null,
    file_type: media?.file_type ?? null,
    file_size: media?.file_size ?? null,
  }
}

const SELECT_COLUMNS =
  'id, title, description, category, icon, file_id, status, created_at, updated_at, media(file_url, file_name, file_type, file_size)'

// Public site reader: published only, grouped-friendly order (category then
// title). Tolerates Supabase errors like getPublishedNews() -- runs in the
// unauthenticated (site) route group.
export async function getPublishedResources(): Promise<Resource[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('resources')
      .select(SELECT_COLUMNS)
      .eq('status', 'published')
      .order('category', { ascending: true, nullsFirst: false })
      .order('title', { ascending: true })

    if (error || !data) return []
    return (data as unknown as ResourceRow[]).map(toResource)
  } catch {
    return []
  }
}

// Admin list reader: all statuses. No fallback -- only reachable post-login.
export async function getAllResources(): Promise<Resource[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select(SELECT_COLUMNS)
    .order('category', { ascending: true, nullsFirst: false })
    .order('title', { ascending: true })

  if (error) throw new Error(`Could not load resources: ${error.message}`)
  return ((data ?? []) as unknown as ResourceRow[]).map(toResource)
}

// Single-record reader for the admin edit page. Null if not found.
export async function getResourceById(id: string): Promise<Resource | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select(SELECT_COLUMNS)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return toResource(data as unknown as ResourceRow)
}
