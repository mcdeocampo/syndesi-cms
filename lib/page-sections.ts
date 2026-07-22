import { createClient } from '@/lib/supabase/server'
import {
  SECTION_DEFAULTS,
  SECTION_FIELDS,
  type PageSection,
  type PageSectionRow,
} from '@/lib/page-sections-config'

// Re-exported so server components can keep importing everything from one
// place. Client Components must import from lib/page-sections-config instead,
// since this file pulls in the server-only Supabase client.
export * from '@/lib/page-sections-config'

// Public site reader.
//
// Fallback rule: the shipped defaults apply when a section has NO ROW at all,
// or when the query fails outright. Once a row exists it is the source of
// truth -- including its nulls, which mean "the admin deliberately cleared
// this" and must render as absent.
//
// This previously coalesced per-field (`row[f] || default[f]`) to guarantee a
// heading was never blank. That made cleared fields impossible to remove: an
// admin clearing a call-to-action button saw "Saved", then watched the shipped
// button reappear. Per-field coalescing is the wrong place for that safety --
// whole-query failure is already covered by the catch below.
export async function getPageSections(
  pageSlug: string
): Promise<Record<string, PageSection>> {
  const defaults = SECTION_DEFAULTS[pageSlug] ?? {}

  // Normalise the Partial defaults into full PageSections. Driven by
  // SECTION_FIELDS rather than a hand-written field list, so adding a field to
  // the type doesn't silently drop it here.
  const blank = () =>
    Object.fromEntries(SECTION_FIELDS.map((f) => [f, null])) as PageSection

  const merged: Record<string, PageSection> = {}
  for (const [key, def] of Object.entries(defaults)) {
    const section = blank()
    for (const f of SECTION_FIELDS) section[f] = def[f] ?? null
    merged[key] = section
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('page_sections')
      .select(['section_key', ...SECTION_FIELDS].join(', '))
      .eq('page_slug', pageSlug)
      .overrideTypes<(Partial<PageSection> & { section_key: string })[]>()

    if (error || !data) return merged

    for (const row of data) {
      // The row replaces the defaults wholesale -- no per-field coalescing, so
      // a cleared field stays cleared. Empty string is normalised to null so
      // callers only ever test for one "absent" value.
      const section = blank()
      for (const f of SECTION_FIELDS) section[f] = row[f]?.trim() ? row[f]! : null
      merged[row.section_key] = section
    }
    return merged
  } catch {
    return merged
  }
}

// Admin reader: every section row, ordered for display.
export async function getAllPageSections(): Promise<PageSectionRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('page_sections')
    .select(
      ['id', 'page_slug', 'section_key', ...SECTION_FIELDS, 'display_order', 'updated_at'].join(
        ', '
      )
    )
    .order('page_slug', { ascending: true })
    .order('display_order', { ascending: true })
    .overrideTypes<PageSectionRow[]>()

  if (error) throw new Error(`Could not load page sections: ${error.message}`)
  return data ?? []
}
