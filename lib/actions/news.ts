'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/dal'
import { createClient } from '@/lib/supabase/server'
import { extractStoragePath } from '@/lib/storage'

export type NewsFormState = { error?: string; success?: string } | undefined

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Supa = Awaited<ReturnType<typeof createClient>>

// The ordered media ids the CMS submitted for this article, as a JSON array in
// a single hidden field. Validated to real uuids and de-duplicated, order
// preserved -- index 0 is the cover.
function parsePhotoIds(formData: FormData): string[] {
  const raw = formData.get('photo_ids')
  if (typeof raw !== 'string' || !raw) return []
  let arr: unknown
  try {
    arr = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(arr)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of arr) {
    if (typeof v === 'string' && UUID_RE.test(v) && !seen.has(v)) {
      seen.add(v)
      out.push(v)
    }
  }
  return out
}

// Every media id currently linked to an article: its news_photos rows plus its
// featured_image_id (the two are kept in sync, but a pre-existing record has
// only the latter). Used to diff what was removed on save.
async function currentArticleMedia(supabase: Supa, newsId: string): Promise<Set<string>> {
  const ids = new Set<string>()
  const { data: photos } = await supabase
    .from('news_photos')
    .select('media_id')
    .eq('news_id', newsId)
  for (const p of photos ?? []) ids.add((p as { media_id: string }).media_id)

  const { data: article } = await supabase
    .from('news')
    .select('featured_image_id')
    .eq('id', newsId)
    .single()
  const fid = (article as { featured_image_id: string | null } | null)?.featured_image_id
  if (fid) ids.add(fid)

  return ids
}

// Replaces the photo set for an article with the given ordered media ids, and
// keeps news.featured_image_id pointing at the first (the cover) so every
// existing cover-based reader keeps working unchanged.
async function writeArticlePhotos(
  supabase: Supa,
  newsId: string,
  mediaIds: string[]
): Promise<string | null> {
  // Replace-all is simplest and correct for a small per-article set: delete
  // then insert in order. Order is stored explicitly in sort_order.
  const { error: delErr } = await supabase.from('news_photos').delete().eq('news_id', newsId)
  if (delErr) return `Could not update photos: ${delErr.message}`

  if (mediaIds.length > 0) {
    const rows = mediaIds.map((media_id, i) => ({ news_id: newsId, media_id, sort_order: i }))
    const { error: insErr } = await supabase.from('news_photos').insert(rows)
    if (insErr) return `Could not save photos: ${insErr.message}`
  }
  return null
}

// Reference-counted storage cleanup. `media` is a SHARED library (logo,
// favicon, faculty photos, resource files all live in the same bucket), so a
// file is only safe to delete once nothing references it: not another article's
// photos, not any article's cover, not a faculty photo, not a resource file.
// Anything still referenced is left untouched. Best-effort and non-fatal --
// an orphaned file is harmless, a wrongly-deleted shared file is not.
async function cleanupOrphanedMedia(supabase: Supa, mediaIds: string[]): Promise<void> {
  for (const id of mediaIds) {
    const refChecks = await Promise.all([
      supabase.from('news_photos').select('id', { count: 'exact', head: true }).eq('media_id', id),
      supabase.from('news').select('id', { count: 'exact', head: true }).eq('featured_image_id', id),
      supabase.from('faculty').select('id', { count: 'exact', head: true }).eq('photo_id', id),
      supabase.from('resources').select('id', { count: 'exact', head: true }).eq('file_id', id),
    ])
    const stillReferenced = refChecks.some((r) => (r.count ?? 0) > 0)
    if (stillReferenced) continue

    const { data: row } = await supabase.from('media').select('file_url').eq('id', id).single()
    const url = (row as { file_url: string } | null)?.file_url
    // Delete the DB row first (source of truth for the Library), then the file.
    await supabase.from('media').delete().eq('id', id)
    const path = url ? extractStoragePath(url) : null
    if (path) await supabase.storage.from('media').remove([path])
  }
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'news-article'
  )
}

function textField(formData: FormData, name: string): string | null {
  const v = formData.get(name)
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

function parseStatus(formData: FormData): 'draft' | 'published' {
  return formData.get('status') === 'published' ? 'published' : 'draft'
}

// Publish Date is always recorded (record of when the article was published,
// used for the admin list and sorting) -- never null. Defaults to today if
// the field somehow comes back empty, matching the DB-level NOT NULL default.
function parsePublishDate(formData: FormData): string {
  return textField(formData, 'publish_date') ?? new Date().toISOString().slice(0, 10)
}

function parseFeatured(formData: FormData): boolean {
  // Checkboxes only appear in FormData when checked -- no value means false.
  return formData.get('featured') === 'on'
}

export async function createNews(
  _prevState: NewsFormState,
  formData: FormData
): Promise<NewsFormState> {
  const auth = await requireAuth()
  const supabase = await createClient()

  const title = textField(formData, 'title')
  if (!title) return { error: 'Title is required.' }

  const photoIds = parsePhotoIds(formData)
  // The cover is the first photo. Falls back to the legacy single-image field
  // if the form somehow submits no photo list, so nothing regresses.
  const coverId = photoIds[0] ?? textField(formData, 'featured_image_id')

  const baseSlug = slugify(title)
  let slug = baseSlug
  let newId: string | null = null

  // Auto-slugify with a numeric-suffix retry loop on unique-constraint
  // collision (same precedent as createFaculty) -- titles collide
  // plausibly ("Enrollment Now Open" reused year to year), and a silent
  // "-2" suffix is friendlier than a form error, since there's no slug
  // input field at all.
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) slug = `${baseSlug}-${attempt + 1}`

    const { data, error } = await supabase
      .from('news')
      .insert({
        slug,
        title,
        featured_image_id: coverId,
        summary: textField(formData, 'summary'),
        content_html: textField(formData, 'content'),
        publish_date: parsePublishDate(formData),
        date_label: textField(formData, 'date_label'),
        author: textField(formData, 'author'),
        category: textField(formData, 'category'),
        status: parseStatus(formData),
        featured: parseFeatured(formData),
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .select('id')
      .single()

    if (!error) {
      newId = data.id
      break
    }
    // 23505 = unique_violation. Only retry on slug collision; anything else
    // is a real error worth surfacing immediately.
    if (error.code !== '23505') {
      return { error: `Could not create news article: ${error.message}` }
    }
  }

  if (!newId) {
    return { error: 'Could not generate a unique slug. Try a slightly different title.' }
  }

  if (photoIds.length > 0) {
    const photoErr = await writeArticlePhotos(supabase, newId, photoIds)
    if (photoErr) return { error: photoErr }
  }

  revalidatePath('/admin/news')
  revalidatePath('/admin')
  revalidatePath('/news')
  revalidatePath('/')
  redirect('/admin/news')
}

export async function updateNews(
  _prevState: NewsFormState,
  formData: FormData
): Promise<NewsFormState> {
  const auth = await requireAuth()
  const supabase = await createClient()

  const id = textField(formData, 'id')
  if (!id) return { error: 'Missing news article id.' }

  const title = textField(formData, 'title')
  if (!title) return { error: 'Title is required.' }

  const photoIds = parsePhotoIds(formData)
  const coverId = photoIds[0] ?? textField(formData, 'featured_image_id')

  // Snapshot what was linked before, so we can clean up anything the edit
  // removed after the new set is written.
  const previousMedia = await currentArticleMedia(supabase, id)

  // Slug is derived once at creation and left stable on edit (re-slugging
  // on every title edit would break the article's public URL and any
  // external links/bookmarks/social shares pointing at it).
  // .select() so a silently-rejected UPDATE (RLS block / missing row) is
  // caught rather than reported as a false success. See settings.ts.
  const { data, error } = await supabase
    .from('news')
    .update({
      featured_image_id: coverId,
      title,
      summary: textField(formData, 'summary'),
      content_html: textField(formData, 'content'),
      publish_date: textField(formData, 'publish_date'),
      date_label: textField(formData, 'date_label'),
      author: textField(formData, 'author'),
      category: textField(formData, 'category'),
      status: parseStatus(formData),
      featured: parseFeatured(formData),
      updated_by: auth.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id')

  if (error) return { error: `Could not save changes: ${error.message}` }
  if (!data || data.length === 0) {
    return { error: 'Changes were not saved — the article was not found or your account lacks permission.' }
  }

  const photoErr = await writeArticlePhotos(supabase, id, photoIds)
  if (photoErr) return { error: photoErr }

  // Files the article no longer uses -- deleted from storage only if nothing
  // else references them (see cleanupOrphanedMedia).
  const removed = [...previousMedia].filter((m) => !photoIds.includes(m))
  if (removed.length > 0) await cleanupOrphanedMedia(supabase, removed)

  revalidatePath('/admin/news')
  revalidatePath('/news')
  revalidatePath('/')
  redirect('/admin/news')
}

export async function deleteNews(
  _prevState: NewsFormState,
  formData: FormData
): Promise<NewsFormState> {
  await requireAuth()
  const supabase = await createClient()

  const id = textField(formData, 'id')
  if (!id) return { error: 'Missing news article id.' }

  // Capture the article's media before deleting -- the news_photos rows
  // cascade away with the article (FK ON DELETE CASCADE), but the underlying
  // storage files don't, so gather them for reference-counted cleanup after.
  const media = await currentArticleMedia(supabase, id)

  const { data, error } = await supabase.from('news').delete().eq('id', id).select('id')
  if (error) return { error: `Could not delete: ${error.message}` }
  if (!data || data.length === 0) {
    return { error: 'Nothing was deleted — the article was already removed or your account lacks permission.' }
  }

  if (media.size > 0) await cleanupOrphanedMedia(supabase, [...media])

  revalidatePath('/admin/news')
  revalidatePath('/admin')
  revalidatePath('/news')
  revalidatePath('/')
  return { success: 'Deleted.' }
}

// Called directly from the client (not form-bound / useActionState) after a
// drag-and-drop reorder in NewsList.tsx -- direct port of reorderFaculty.
// Individual per-row UPDATEs rather than a bulk upsert -- title/slug are
// NOT NULL with no default, and a PostgREST upsert sending only
// {id, display_order} would fail the INSERT-path NOT NULL check before ON
// CONFLICT resolution kicks in. Also revalidates '/' (unlike Faculty's
// version) since News, unlike Faculty, feeds the homepage teaser.
export async function reorderNews(orderedIds: string[]): Promise<{ error?: string } | undefined> {
  const auth = await requireAuth()
  const supabase = await createClient()

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('news')
        .update({ display_order: index, updated_by: auth.userId })
        .eq('id', id)
        .select('id')
    )
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: `Could not save new order: ${failed.error.message}` }
  if (results.some((r) => !r.data || r.data.length === 0)) {
    return { error: 'The new order could not be saved — please reload and try again.' }
  }

  revalidatePath('/admin/news')
  revalidatePath('/news')
  revalidatePath('/')
}
