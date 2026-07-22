'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/dal'
import { createClient } from '@/lib/supabase/server'
import { ITEM_SECTIONS, ITEM_DEFAULTS } from '@/lib/page-section-items-config'

export type ItemsFormState = { error?: string; success?: string } | undefined

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function textField(formData: FormData, name: string): string | null {
  const v = formData.get(name)
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

// page_slug maps 1:1 to its public route, except 'home' which is '/'.
function publicRoute(pageSlug: string): string {
  return pageSlug === 'home' ? '/' : `/${pageSlug}`
}

function revalidateFor(pageSlug: string, sectionKey: string) {
  revalidatePath(`/admin/page-content/${pageSlug}/${sectionKey}`)
  revalidatePath(publicRoute(pageSlug))
}

// Saves every item in one section from a single submit. Fields are namespaced
// `${itemId}__${field}` so one form can carry many items without collisions.
export async function saveSectionItems(
  _prevState: ItemsFormState,
  formData: FormData
): Promise<ItemsFormState> {
  const auth = await requireAdmin()
  const supabase = await createClient()

  const pageSlug = textField(formData, 'page_slug')
  const sectionKey = textField(formData, 'section_key')
  if (!pageSlug || !sectionKey) return { error: 'Missing section.' }

  const meta = ITEM_SECTIONS[pageSlug]?.[sectionKey]
  if (!meta) return { error: 'Unknown section.' }

  // The client submits the ids it rendered, in their current display order.
  const submitted = formData
    .getAll('item_id')
    .filter((v): v is string => typeof v === 'string')

  // Every id must be a real uuid. Anything else means the form rendered a row
  // with no database identity, which previously reached Postgres as
  // .eq('id', '') and surfaced as a raw 'invalid input syntax for type uuid'.
  // Fail loudly here instead: a partial save would silently drop edits.
  const ids = submitted.filter((id) => UUID_RE.test(id))
  if (ids.length !== submitted.length) {
    return {
      error:
        'This section is out of sync with the database. Reload the page and try again.',
    }
  }
  if (ids.length === 0) return { success: 'Nothing to save.' }

  const now = new Date().toISOString()
  const results = await Promise.all(
    ids.map((id, index) => {
      const update: Record<string, unknown> = {
        display_order: index + 1,
        updated_by: auth.userId,
        updated_at: now,
      }
      // Only write the fields this section declares, so an unused column
      // can never pick up stray input.
      for (const field of meta.fields) {
        update[field] = textField(formData, `${id}__${field}`)
      }
      // .select() is REQUIRED, not decorative. Without it PostgREST reports
      // error: null for an UPDATE that matched zero rows -- so an update
      // blocked by RLS, or aimed at a row that doesn't exist, looked like a
      // success and then silently reverted on the next read. Selecting back
      // lets us confirm the write actually landed.
      return supabase.from('page_section_items').update(update).eq('id', id).select('id')
    })
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: `Could not save: ${failed.error.message}` }

  const notWritten = results.filter((r) => !r.data || r.data.length === 0).length
  if (notWritten > 0) {
    return {
      error:
        `${notWritten} of ${ids.length} item(s) could not be saved -- the database ` +
        `rejected the change. This usually means your account lacks admin rights on ` +
        `this table, or the items were deleted in another tab. Reload and try again.`,
    }
  }

  revalidateFor(pageSlug, sectionKey)
  return { success: 'Saved.' }
}

export async function addSectionItem(
  _prevState: ItemsFormState,
  formData: FormData
): Promise<ItemsFormState> {
  const auth = await requireAdmin()
  const supabase = await createClient()

  const pageSlug = textField(formData, 'page_slug')
  const sectionKey = textField(formData, 'section_key')
  if (!pageSlug || !sectionKey) return { error: 'Missing section.' }

  const meta = ITEM_SECTIONS[pageSlug]?.[sectionKey]
  if (!meta) return { error: 'Unknown section.' }
  if (!meta.allowAdd) return { error: 'This section has a fixed set of items.' }

  // Append to the end.
  const { count } = await supabase
    .from('page_section_items')
    .select('id', { count: 'exact', head: true })
    .eq('page_slug', pageSlug)
    .eq('section_key', sectionKey)

  const { error } = await supabase.from('page_section_items').insert({
    page_slug: pageSlug,
    section_key: sectionKey,
    display_order: (count ?? 0) + 1,
    title: meta.fields.includes('title') ? 'New item' : null,
    updated_by: auth.userId,
  })

  if (error) return { error: `Could not add item: ${error.message}` }

  revalidateFor(pageSlug, sectionKey)
  return { success: 'Item added.' }
}

// Seeds an empty section from the copy the site ships with. This is the
// recovery path for a section whose rows don't exist yet -- either because its
// migration hasn't been run, or because every item was deleted. Refuses to run
// when the section already has rows, so it can never overwrite real edits.
export async function restoreSectionDefaults(
  _prevState: ItemsFormState,
  formData: FormData
): Promise<ItemsFormState> {
  const auth = await requireAdmin()
  const supabase = await createClient()

  const pageSlug = textField(formData, 'page_slug')
  const sectionKey = textField(formData, 'section_key')
  if (!pageSlug || !sectionKey) return { error: 'Missing section.' }

  if (!ITEM_SECTIONS[pageSlug]?.[sectionKey]) return { error: 'Unknown section.' }

  const defaults = ITEM_DEFAULTS[pageSlug]?.[sectionKey]
  if (!defaults || defaults.length === 0) {
    return { error: 'This section has no default content to restore.' }
  }

  const { count } = await supabase
    .from('page_section_items')
    .select('id', { count: 'exact', head: true })
    .eq('page_slug', pageSlug)
    .eq('section_key', sectionKey)

  if ((count ?? 0) > 0) {
    return { error: 'This section already has items. Delete them first to restore defaults.' }
  }

  const { error } = await supabase.from('page_section_items').insert(
    defaults.map((item, index) => ({
      ...item,
      page_slug: pageSlug,
      section_key: sectionKey,
      display_order: index + 1,
      updated_by: auth.userId,
    }))
  )

  if (error) return { error: `Could not restore defaults: ${error.message}` }

  revalidateFor(pageSlug, sectionKey)
  return { success: `Restored ${defaults.length} item(s).` }
}

export async function deleteSectionItem(
  _prevState: ItemsFormState,
  formData: FormData
): Promise<ItemsFormState> {
  await requireAdmin()
  const supabase = await createClient()

  const id = textField(formData, 'id')
  const pageSlug = textField(formData, 'page_slug')
  const sectionKey = textField(formData, 'section_key')
  if (!id || !pageSlug || !sectionKey) return { error: 'Missing item.' }

  const { error } = await supabase.from('page_section_items').delete().eq('id', id)
  if (error) return { error: `Could not delete: ${error.message}` }

  revalidateFor(pageSlug, sectionKey)
  return { success: 'Deleted.' }
}

// Called directly from the client after a drag-and-drop reorder -- direct
// port of reorderNews. Individual per-row UPDATEs, not a bulk upsert.
export async function reorderSectionItems(
  pageSlug: string,
  sectionKey: string,
  orderedIds: string[]
): Promise<{ error?: string } | undefined> {
  const auth = await requireAdmin()
  const supabase = await createClient()

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('page_section_items')
        .update({ display_order: index + 1, updated_by: auth.userId })
        .eq('id', id)
    )
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: `Could not save new order: ${failed.error.message}` }

  revalidateFor(pageSlug, sectionKey)
}
