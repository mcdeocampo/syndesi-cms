'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/dal'
import { createClient } from '@/lib/supabase/server'

export type NewsFormState = { error?: string; success?: string } | undefined

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
        featured_image_id: textField(formData, 'featured_image_id'),
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

  // Slug is derived once at creation and left stable on edit (re-slugging
  // on every title edit would break the article's public URL and any
  // external links/bookmarks/social shares pointing at it).
  const { error } = await supabase
    .from('news')
    .update({
      featured_image_id: textField(formData, 'featured_image_id'),
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

  if (error) return { error: `Could not save changes: ${error.message}` }

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

  const { error } = await supabase.from('news').delete().eq('id', id)
  if (error) return { error: `Could not delete: ${error.message}` }

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
      supabase.from('news').update({ display_order: index, updated_by: auth.userId }).eq('id', id)
    )
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: `Could not save new order: ${failed.error.message}` }

  revalidatePath('/admin/news')
  revalidatePath('/news')
  revalidatePath('/')
}
