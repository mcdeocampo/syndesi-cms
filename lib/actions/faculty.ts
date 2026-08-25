'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/dal'
import { createClient } from '@/lib/supabase/server'

export type FacultyFormState = { error?: string; success?: string } | undefined

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'faculty-member'
  )
}

function textField(formData: FormData, name: string): string | null {
  const v = formData.get(name)
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

function parseDisplayOrder(formData: FormData): number {
  const raw = formData.get('display_order')
  const n = typeof raw === 'string' && raw !== '' ? parseInt(raw, 10) : 0
  return Number.isFinite(n) ? n : 0
}

function parseStatus(formData: FormData): 'draft' | 'published' {
  return formData.get('status') === 'published' ? 'published' : 'draft'
}

export async function createFaculty(
  _prevState: FacultyFormState,
  formData: FormData
): Promise<FacultyFormState> {
  const auth = await requireAuth()
  const supabase = await createClient()

  const fullName = textField(formData, 'full_name')
  if (!fullName) return { error: 'Full name is required.' }

  const baseSlug = slugify(fullName)
  let slug = baseSlug
  let newId: string | null = null

  // Auto-slugify with a numeric-suffix retry loop on unique-constraint
  // collision, rather than surfacing the raw DB error to the user --
  // faculty names collide plausibly (e.g. two "Maria Santos" over time),
  // and a silent "-2" suffix is friendlier than a form error demanding the
  // user invent their own slug (there's no slug input field at all).
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) slug = `${baseSlug}-${attempt + 1}`

    const { data, error } = await supabase
      .from('faculty')
      .insert({
        slug,
        photo_id: textField(formData, 'photo_id'),
        full_name: fullName,
        position: textField(formData, 'position'),
        department: textField(formData, 'department'),
        icon: textField(formData, 'icon'),
        biography: textField(formData, 'biography'),
        email: textField(formData, 'email'),
        display_order: parseDisplayOrder(formData),
        status: parseStatus(formData),
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
      return { error: `Could not create faculty member: ${error.message}` }
    }
  }

  if (!newId) {
    return { error: 'Could not generate a unique slug. Try a slightly different name.' }
  }

  revalidatePath('/admin/faculty')
  revalidatePath('/admin')
  revalidatePath('/faculty')
  redirect('/admin/faculty')
}

export async function updateFaculty(
  _prevState: FacultyFormState,
  formData: FormData
): Promise<FacultyFormState> {
  const auth = await requireAuth()
  const supabase = await createClient()

  const id = textField(formData, 'id')
  if (!id) return { error: 'Missing faculty id.' }

  const fullName = textField(formData, 'full_name')
  if (!fullName) return { error: 'Full name is required.' }

  // Slug is derived once at creation and left stable on edit (re-slugging
  // on every name edit would break any external links/bookmarks to the
  // faculty member's slug).
  // .select() so a silently-rejected UPDATE (RLS block / missing row) surfaces
  // as an error rather than a false success -- see settings.ts for the full
  // rationale on why a bare UPDATE can no-op without erroring.
  const { data, error } = await supabase
    .from('faculty')
    .update({
      photo_id: textField(formData, 'photo_id'),
      full_name: fullName,
      position: textField(formData, 'position'),
      department: textField(formData, 'department'),
      icon: textField(formData, 'icon'),
      biography: textField(formData, 'biography'),
      email: textField(formData, 'email'),
      display_order: parseDisplayOrder(formData),
      status: parseStatus(formData),
      updated_by: auth.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id')

  if (error) return { error: `Could not save changes: ${error.message}` }
  if (!data || data.length === 0) {
    return { error: 'Changes were not saved — the record was not found or your account lacks permission.' }
  }

  revalidatePath('/admin/faculty')
  revalidatePath('/faculty')
  redirect('/admin/faculty')
}

export async function deleteFaculty(
  _prevState: FacultyFormState,
  formData: FormData
): Promise<FacultyFormState> {
  await requireAuth()
  const supabase = await createClient()

  const id = textField(formData, 'id')
  if (!id) return { error: 'Missing faculty id.' }

  const { data, error } = await supabase.from('faculty').delete().eq('id', id).select('id')
  if (error) return { error: `Could not delete: ${error.message}` }
  if (!data || data.length === 0) {
    return { error: 'Nothing was deleted — the record was already removed or your account lacks permission.' }
  }

  revalidatePath('/admin/faculty')
  revalidatePath('/admin')
  revalidatePath('/faculty')
  return { success: 'Deleted.' }
}

// Called directly from the client (not form-bound / useActionState) after a
// drag-and-drop reorder in FacultyList.tsx. Individual per-row UPDATEs
// rather than a bulk upsert -- full_name/slug are NOT NULL with no default,
// and a PostgREST upsert sending only {id, display_order} would fail the
// INSERT-path NOT NULL check before ON CONFLICT resolution kicks in. The
// faculty roster is small (no pagination in this module), so N parallel
// UPDATEs is cheap.
export async function reorderFaculty(orderedIds: string[]): Promise<{ error?: string } | undefined> {
  const auth = await requireAuth()
  const supabase = await createClient()

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('faculty')
        .update({ display_order: index, updated_by: auth.userId })
        .eq('id', id)
        .select('id')
    )
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: `Could not save new order: ${failed.error.message}` }
  // A row that matched nothing (RLS / deleted mid-drag) means the order didn't
  // fully persist -- surface it so the client can revert rather than drift.
  if (results.some((r) => !r.data || r.data.length === 0)) {
    return { error: 'The new order could not be saved — please reload and try again.' }
  }

  revalidatePath('/admin/faculty')
  revalidatePath('/faculty')
}
