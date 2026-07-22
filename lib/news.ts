import { createClient } from '@/lib/supabase/server'

export type NewsArticle = {
  id: string
  slug: string
  title: string
  featured_image_id: string | null
  featured_image_url: string | null
  summary: string | null
  content: string | null
  publish_date: string | null
  date_label: string | null
  author: string | null
  category: string | null
  status: 'draft' | 'published'
  featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

type NewsRow = {
  id: string
  slug: string
  title: string
  featured_image_id: string | null
  summary: string | null
  content_html: string | null
  publish_date: string | null
  date_label: string | null
  author: string | null
  category: string | null
  status: 'draft' | 'published'
  featured: boolean
  display_order: number
  created_at: string
  updated_at: string
  media: { file_url: string } | null
}

function toArticle(row: NewsRow): NewsArticle {
  const { media, content_html, ...rest } = row
  return { ...rest, featured_image_url: media?.file_url ?? null, content: content_html }
}

const SELECT_COLUMNS =
  'id, slug, title, featured_image_id, summary, content_html, publish_date, date_label, author, category, status, featured, display_order, created_at, updated_at, media(file_url)'

// Public site reader: published only, ordered newest-first by publish_date.
// Tolerates Supabase errors (matches getPublishedFaculty()'s precedent)
// since this runs in the unauthenticated (site) route group. Optional
// `limit` serves both the homepage teaser (latest 3) and the full /news
// page with one function.
export async function getPublishedNews(limit?: number): Promise<NewsArticle[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('news')
      .select(SELECT_COLUMNS)
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('publish_date', { ascending: false, nullsFirst: false })

    if (limit) query = query.limit(limit)

    const { data, error } = await query
    if (error || !data) return []
    return (data as unknown as NewsRow[]).map(toArticle)
  } catch {
    return []
  }
}

// Homepage teaser reader: published AND manually marked featured, so an
// important announcement can stay pinned regardless of publish date rather
// than always showing whatever's most recent. Tolerates errors like
// getPublishedNews() (public-facing).
export async function getFeaturedNews(limit?: number): Promise<NewsArticle[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('news')
      .select(SELECT_COLUMNS)
      .eq('status', 'published')
      .eq('featured', true)
      .order('display_order', { ascending: true })
      .order('publish_date', { ascending: false, nullsFirst: false })

    if (limit) query = query.limit(limit)

    const { data, error } = await query
    if (error || !data) return []
    return (data as unknown as NewsRow[]).map(toArticle)
  } catch {
    return []
  }
}

// Admin list reader: all statuses, newest-first. No fallback -- only
// reachable post-login, so a genuine Supabase error should surface.
export async function getAllNews(): Promise<NewsArticle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('news')
    .select(SELECT_COLUMNS)
    .order('display_order', { ascending: true })
    .order('publish_date', { ascending: false, nullsFirst: false })

  if (error) throw new Error(`Could not load news: ${error.message}`)
  return ((data ?? []) as unknown as NewsRow[]).map(toArticle)
}

// Single-record reader for the admin edit page. Null if not found.
export async function getNewsById(id: string): Promise<NewsArticle | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('news')
    .select(SELECT_COLUMNS)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return toArticle(data as unknown as NewsRow)
}

// Public detail-page reader. Published-only -- drafts 404 even if the slug
// is guessed (RLS also blocks this at the DB layer; this is defense in
// depth). Null if not found or not published, so the page can call
// notFound().
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('news')
      .select(SELECT_COLUMNS)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) return null
    return toArticle(data as unknown as NewsRow)
  } catch {
    return null
  }
}
