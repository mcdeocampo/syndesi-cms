'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { updatePageSections } from '@/lib/actions/page-sections'
import { ITEM_SECTIONS } from '@/lib/page-section-items-config'
// Imports the pure config, NOT lib/page-sections -- that file pulls in the
// server-only Supabase client, which cannot be bundled into a Client Component.
import {
  SECTION_DEFAULTS,
  SECTION_FIELDS,
  SECTION_FIELD_META,
  type PageSection,
} from '@/lib/page-sections-config'

export default function PageSectionsForm({
  pageSlug,
  pageLabel,
  sections,
}: {
  pageSlug: string
  pageLabel: string
  sections: Record<string, PageSection>
}) {
  const [state, formAction, pending] = useActionState(updatePageSections, undefined)
  const defs = SECTION_DEFAULTS[pageSlug] ?? {}

  // Item sections that have no matching heading section. Their "Edit items"
  // link is rendered inside a heading card below, so without this they'd have
  // no route into them at all -- which silently hid 9 of the 17 item editors
  // (Quick Facts, the Admissions lists, Program Levels, and others).
  const itemOnlySections = Object.entries(ITEM_SECTIONS[pageSlug] ?? {}).filter(
    ([key]) => !defs[key]
  )

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="page_slug" value={pageSlug} />
      {state?.error && <div className="admin-error">{state.error}</div>}
      {state?.success && <div className="admin-success">{state.success}</div>}

      {Object.entries(defs).map(([key, def]) => {
        const current =
          sections[key] ??
          (Object.fromEntries(SECTION_FIELDS.map((f) => [f, null])) as PageSection)
        return (
          <div className="admin-card" style={{ marginBottom: 20 }} key={key}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <h2 style={{ margin: 0 }}>{def.label}</h2>
              {ITEM_SECTIONS[pageSlug]?.[key] && (
                <Link
                  href={`/admin/page-content/${pageSlug}/${key}`}
                  className="admin-btn media-item-btn"
                >
                  Edit items
                </Link>
              )}
            </div>

            {/* Rendered from SECTION_FIELDS/SECTION_FIELD_META rather than
                hand-written blocks, so a section that declares a new field
                gets its input here with no change to this component. */}
            {SECTION_FIELDS.filter((f) => def.fields.includes(f)).map((f) => {
              const meta = SECTION_FIELD_META[f]
              const id = `${key}__${f}`
              return (
                <div className="admin-field" key={f}>
                  <label htmlFor={id}>{meta.label}</label>
                  {meta.control === 'textarea' ? (
                    <textarea id={id} name={id} rows={2} defaultValue={current[f] ?? ''} />
                  ) : (
                    <input id={id} name={id} defaultValue={current[f] ?? ''} />
                  )}
                  {meta.hint && <p className="admin-field-hint">{meta.hint}</p>}
                </div>
              )
            })}
          </div>
        )
      })}

        <button className="admin-btn" type="submit" disabled={pending} style={{ maxWidth: 240 }}>
          {pending ? 'Saving…' : `Save ${pageLabel} Sections`}
        </button>
      </form>

      {/* Content lists that aren't attached to a heading -- e.g. About's Quick
          Facts, the Admissions requirement/procedure lists. These have their
          own editors and are saved there, so they sit outside the form above. */}
      {itemOnlySections.length > 0 && (
        <div className="admin-card" style={{ marginTop: 24 }}>
          <h2 style={{ marginTop: 0 }}>Other Content on This Page</h2>
          <p className="admin-field-hint" style={{ marginTop: -6, marginBottom: 16 }}>
            These lists don’t have their own heading, so they’re edited on their own
            screens.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {itemOnlySections.map(([key, meta]) => (
              <Link
                key={key}
                href={`/admin/page-content/${pageSlug}/${key}`}
                className="admin-btn admin-btn-secondary"
                style={{ width: 'auto' }}
              >
                {meta.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
