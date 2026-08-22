import { createClient } from '@/lib/supabase/server'

export type NewsPhoto = {
  // media row id -- the CMS works in media ids; the URL is for rendering.
  media_id: string
  url: string
  alt: string | null
}

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
  // Ordered gallery. Populated only by the single-record readers
  // (getNewsBySlug / getNewsById); the list readers leave it empty and use
  // featured_image_url as the cover. First entry is always the cover.
  photos: NewsPhoto[]
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
  return {
    ...rest,
    featured_image_url: media?.file_url ?? null,
    content: content_html,
    photos: [],
  }
}

// Loads the ordered photo gallery for one article. Backward-compatible: if the
// article has no news_photos rows yet (every article that predates this
// feature, until it's next saved), it synthesizes a single-photo list from the
// existing featured_image_id -- so old records "just appear as one photo" with
// no data migration. First entry is always the cover.
async function loadPhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  article: NewsArticle
): Promise<NewsPhoto[]> {
  const { data, error } = await supabase
    .from('news_photos')
    .select('media_id, sort_order, media(file_url, alt_text)')
    .eq('news_id', article.id)
    .order('sort_order', { ascending: true })

  if (!error && data && data.length > 0) {
    return (data as unknown as PhotoRow[])
      .filter((r) => r.media?.file_url)
      .map((r) => ({ media_id: r.media_id, url: r.media!.file_url, alt: r.media!.alt_text ?? null }))
  }

  // Fallback: the pre-existing single featured image, if any.
  if (article.featured_image_id && article.featured_image_url) {
    return [
      { media_id: article.featured_image_id, url: article.featured_image_url, alt: article.title },
    ]
  }
  return []
}

type PhotoRow = {
  media_id: string
  sort_order: number
  media: { file_url: string; alt_text: string | null } | null
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
  const article = toArticle(data as unknown as NewsRow)
  article.photos = await loadPhotos(supabase, article)
  return article
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
    const article = toArticle(data as unknown as NewsRow)
    article.photos = await loadPhotos(supabase, article)
    return article
  } catch {
    return null
  }
}
