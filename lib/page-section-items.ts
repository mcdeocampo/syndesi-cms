import { createClient } from '@/lib/supabase/server'
import { ITEM_DEFAULTS, type SectionItem } from '@/lib/page-section-items-config'

// Re-exported so server components can import everything from one place.
// Client Components must import from lib/page-section-items-config instead,
// since this file pulls in the server-only Supabase client.
export * from '@/lib/page-section-items-config'

const SELECT_COLUMNS =
  'id, page_slug, section_key, display_order, icon, title, subtitle, body, body_suffix, link_href, link_text, anchor_id, value, value_suffix, value_format'

function defaultsFor(pageSlug: string, sectionKey: string): SectionItem[] {
  return ITEM_DEFAULTS[pageSlug]?.[sectionKey] ?? []
}

// NOTE: there is deliberately no single-section PUBLIC reader here. Public
// pages fetch via getPageItems(), which applies the shipped-defaults fallback;
// the admin uses getSectionItemsForAdmin(), which must not. Keeping a
// fallback-returning single-section reader around invited it being used in the
// admin, which is what produced the empty-uuid save crash.

// Admin reader. Deliberately does NOT fall back to ITEM_DEFAULTS: those are
// display-only placeholders with no database id, and the editor needs a real
// id per row to save, reorder, or delete it. Rendering fallbacks in the admin
// produced rows whose hidden item_id was '', which Postgres rejected with
// 'invalid input syntax for type uuid'. A section with no rows must show as
// empty here so it can be seeded explicitly instead.
export async function getSectionItemsForAdmin(
  pageSlug: string,
  sectionKey: string
): Promise<SectionItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('page_section_items')
    .select(SELECT_COLUMNS)
    .eq('page_slug', pageSlug)
    .eq('section_key', sectionKey)
    .order('display_order', { ascending: true })

  // No try/catch, matching getAllFaculty/getMediaLibrary: this route is behind
  // auth, so a genuine error should surface rather than be silently swallowed.
  if (error) throw new Error(`Could not load section items: ${error.message}`)
  return (data ?? []) as SectionItem[]
}

// Public reader for every section on a page, grouped by section_key, so a
// page fetches once instead of per-section. Any section with no rows falls
// back to its shipped defaults.
export async function getPageItems(
  pageSlug: string
): Promise<Record<string, SectionItem[]>> {
  const grouped: Record<string, SectionItem[]> = {}

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('page_section_items')
      .select(SELECT_COLUMNS)
      .eq('page_slug', pageSlug)
      .order('display_order', { ascending: true })

    if (!error && data) {
      for (const row of data as SectionItem[] & { section_key: string }[]) {
        const key = (row as unknown as { section_key: string }).section_key
        ;(grouped[key] ??= []).push(row)
      }
    }
  } catch {
    // fall through to defaults below
  }

  // Backfill any section that came back empty with its shipped copy.
  for (const sectionKey of Object.keys(ITEM_DEFAULTS[pageSlug] ?? {})) {
    if (!grouped[sectionKey] || grouped[sectionKey].length === 0) {
      grouped[sectionKey] = defaultsFor(pageSlug, sectionKey)
    }
  }

  return grouped
}
