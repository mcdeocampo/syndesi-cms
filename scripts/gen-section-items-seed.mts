// Generates the INSERT statements for supabase/migrations/0012_page_section_items.sql
// directly from ITEM_DEFAULTS, so the seeded rows can never drift from the
// runtime fallback copy.
//
//   node --experimental-strip-types scripts/gen-section-items-seed.mts
//
// Prints SQL to stdout.

import { ITEM_DEFAULTS } from '../lib/page-section-items-config.ts'

const COLUMNS = [
  'page_slug',
  'section_key',
  'display_order',
  'icon',
  'title',
  'subtitle',
  'body',
  'body_suffix',
  'link_href',
  'link_text',
  'anchor_id',
  'value',
  'value_suffix',
  'value_format',
] as const

function sql(v: unknown): string {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'number') return String(v)
  return `'${String(v).replace(/'/g, "''")}'`
}

const rows: string[] = []

for (const [pageSlug, sections] of Object.entries(ITEM_DEFAULTS)) {
  for (const [sectionKey, items] of Object.entries(sections)) {
    items.forEach((item, index) => {
      const record: Record<string, unknown> = {
        page_slug: pageSlug,
        section_key: sectionKey,
        display_order: index + 1,
        ...item,
      }
      rows.push(`  (${COLUMNS.map((c) => sql(record[c])).join(', ')})`)
    })
  }
}

console.log(
  `insert into public.page_section_items (${COLUMNS.join(', ')}) values\n${rows.join(',\n')};`
)
console.error(`-- generated ${rows.length} rows`)
