'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/dal'
import { createClient } from '@/lib/supabase/server'
import { SECTION_DEFAULTS, SECTION_FIELDS } from '@/lib/page-sections-config'

export type PageSectionsFormState = { error?: string; success?: string } | undefined

function textField(formData: FormData, name: string): string | null {
  const v = formData.get(name)
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

// page_slug maps 1:1 to its public route, except 'home' which is '/'.
function publicRoute(pageSlug: string): string {
  return pageSlug === 'home' ? '/' : `/${pageSlug}`
}

// Saves every section belonging to a single page in one submit. Form fields
// are namespaced `${section_key}__${field}` so one form can carry several
// sections without collisions.
export async function updatePageSections(
  _prevState: PageSectionsFormState,
  formData: FormData
): Promise<PageSectionsFormState> {
  const auth = await requireAdmin()
  const supabase = await createClient()

  const pageSlug = textField(formData, 'page_slug')
  if (!pageSlug) return { error: 'Missing page.' }

  const sections = SECTION_DEFAULTS[pageSlug]
  if (!sections) return { error: 'Unknown page.' }

  const now = new Date().toISOString()
  const rows = Object.entries(sections).map(([sectionKey, def], index) => ({
    page_slug: pageSlug,
    section_key: sectionKey,
    // Only read the fields this section actually uses; the rest stay null so
    // an unused column can't pick up stray input. Derived from SECTION_FIELDS
    // so a newly added field is picked up here automatically.
    ...Object.fromEntries(
      SECTION_FIELDS.map((f) => [
        f,
        def.fields.includes(f) ? textField(formData, `${sectionKey}__${f}`) : null,
      ])
    ),
    // Derived from the declaration order in SECTION_DEFAULTS, which is the
    // real source of truth for section ordering.
    display_order: index + 1,
    updated_by: auth.userId,
    updated_at: now,
  }))

  const { error } = await supabase
    .from('page_sections')
    .upsert(rows, { onConflict: 'page_slug,section_key' })

  if (error) {
    // PostgREST reports an unknown column as a "schema cache" miss, which is
    // opaque if you're not a developer. It almost always means a migration
    // hasn't been applied yet, so say that instead of leaking the raw message.
    if (/schema cache|column .* does not exist/i.test(error.message)) {
      return {
        error:
          'This page needs a database update that hasn’t been applied yet. ' +
          'Run the latest file in supabase/migrations/ in the Supabase SQL editor, ' +
          `then try again. (Details: ${error.message})`,
      }
    }
    return { error: `Could not save changes: ${error.message}` }
  }

  revalidatePath('/admin/page-content')
  revalidatePath(publicRoute(pageSlug))

  return { success: 'Saved.' }
}
