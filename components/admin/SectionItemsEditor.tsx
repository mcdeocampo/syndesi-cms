'use client'

import { useActionState, useState } from 'react'
import {
  saveSectionItems,
  addSectionItem,
  deleteSectionItem,
  reorderSectionItems,
  restoreSectionDefaults,
} from '@/lib/actions/page-section-items'
// Pure config only -- lib/page-section-items pulls in the server-only
// Supabase client and cannot be bundled into a Client Component.
import {
  ITEM_SECTIONS,
  ITEM_DEFAULTS,
  type ItemField,
  type SectionItem,
} from '@/lib/page-section-items-config'
import type { MediaItem } from '@/lib/media'
import ConfirmDialog from './ConfirmDialog'

// A stored icon value is a photo when it looks like a URL rather than a
// Font Awesome class.
function isImageValue(v: string | null | undefined): boolean {
  return !!v && (/^https?:\/\//i.test(v) || v.startsWith('/'))
}

const FIELD_LABELS: Record<ItemField, string> = {
  icon: 'Icon (Font Awesome class)',
  title: 'Title',
  subtitle: 'Subtitle',
  body: 'Description',
  body_suffix: 'Text after link',
  link_href: 'Link URL',
  link_text: 'Link text',
  anchor_id: 'Anchor ID',
  value: 'Number',
  value_suffix: 'Suffix',
  value_format: 'Format',
}

const FIELD_HINTS: Partial<Record<ItemField, string>> = {
  icon: 'e.g. fas fa-child — see fontawesome.com/icons',
  anchor_id: 'Used by links from other pages. Changing it breaks those links.',
  value_suffix: 'e.g. +',
  value_format: "Enter 'k' to display thousands as 1.9K. Leave blank otherwise.",
}

export default function SectionItemsEditor({
  pageSlug,
  sectionKey,
  items: initialItems,
  mediaItems = [],
}: {
  pageSlug: string
  sectionKey: string
  items: SectionItem[]
  mediaItems?: MediaItem[]
}) {
  const meta = ITEM_SECTIONS[pageSlug]?.[sectionKey]
  const [state, formAction, pending] = useActionState(saveSectionItems, undefined)
  const [addState, addAction, addPending] = useActionState(addSectionItem, undefined)
  const [items, setItems] = useState(initialItems)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteSectionItem,
    undefined
  )
  const [restoreState, restoreAction, restorePending] = useActionState(
    restoreSectionDefaults,
    undefined
  )

  const defaultCount = ITEM_DEFAULTS[pageSlug]?.[sectionKey]?.length ?? 0

  // After a save, revalidatePath() re-renders this route and sends fresh rows
  // down as `initialItems`. useState() ignores prop changes after mount, and
  // the fields below are uncontrolled (defaultValue), which React will not
  // re-apply to inputs that stay mounted. Without this the form kept showing
  // whatever was typed even when the write didn't land -- so the UI silently
  // disagreed with the database. Re-syncing state and bumping `formKey` to
  // remount the fields makes the form always show what was actually stored.
  const [syncedFrom, setSyncedFrom] = useState(initialItems)
  const [formKey, setFormKey] = useState(0)
  // Controlled icon values, only used when the section stores photos in the
  // icon slot (iconAsImage). Keyed by item id so the picker can update the
  // preview and the submitted value live. Re-synced with the server on save.
  const buildIconValues = (rows: SectionItem[]) =>
    Object.fromEntries(rows.map((r) => [r.id ?? '', (r.icon as string) ?? '']))
  const [iconValues, setIconValues] = useState<Record<string, string>>(() =>
    buildIconValues(initialItems)
  )
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null)
  if (initialItems !== syncedFrom) {
    setSyncedFrom(initialItems)
    setItems(initialItems)
    setIconValues(buildIconValues(initialItems))
    setPickerOpenFor(null)
    setFormKey((k) => k + 1)
  }

  if (!meta) return <div className="admin-error">Unknown section.</div>

  const finishDrag = async (fromId: string, toId: string | null) => {
    if (!toId || toId === fromId) return
    const fromIndex = items.findIndex((i) => i.id === fromId)
    const toIndex = items.findIndex((i) => i.id === toId)
    if (fromIndex === -1 || toIndex === -1) return

    const previous = items
    const reordered = [...items]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    setItems(reordered)
    setReorderError(null)

    const result = await reorderSectionItems(
      pageSlug,
      sectionKey,
      reordered.map((i) => i.id!).filter(Boolean)
    )
    if (result?.error) {
      setItems(previous)
      setReorderError(result.error)
    }
  }

  // Pointer Events, matching FacultyList/NewsList -- native HTML5 drag is
  // unreliable for rows across browsers/devices.
  const handlePointerDown = (item: SectionItem) => (e: React.PointerEvent) => {
    if (!item.id) return
    e.preventDefault()
    const handle = e.currentTarget as HTMLElement
    handle.setPointerCapture(e.pointerId)
    setDraggedId(item.id)

    let currentOverId: string | null = null

    const onPointerMove = (moveEvent: PointerEvent) => {
      const el = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)
      const row = el?.closest('[data-item-id]') as HTMLElement | null
      const id = row?.dataset.itemId ?? null
      if (id !== currentOverId) {
        currentOverId = id
        setDragOverId(id)
      }
    }

    const onPointerUp = () => {
      handle.releasePointerCapture(e.pointerId)
      handle.removeEventListener('pointermove', onPointerMove)
      handle.removeEventListener('pointerup', onPointerUp)
      handle.removeEventListener('pointercancel', onPointerUp)
      setDraggedId(null)
      setDragOverId(null)
      finishDrag(item.id!, currentOverId)
    }

    handle.addEventListener('pointermove', onPointerMove)
    handle.addEventListener('pointerup', onPointerUp)
    handle.addEventListener('pointercancel', onPointerUp)
  }

  const handleConfirmDelete = () => {
    if (!confirmId) return
    const fd = new FormData()
    fd.set('id', confirmId)
    fd.set('page_slug', pageSlug)
    fd.set('section_key', sectionKey)
    deleteAction(fd)
    setItems((prev) => prev.filter((i) => i.id !== confirmId))
    setConfirmId(null)
  }

  return (
    <>
      {reorderError && <div className="admin-error">{reorderError}</div>}
      {deleteState?.error && <div className="admin-error">{deleteState.error}</div>}
      {addState?.error && <div className="admin-error">{addState.error}</div>}
      {restoreState?.error && <div className="admin-error">{restoreState.error}</div>}
      {restoreState?.success && <div className="admin-success">{restoreState.success}</div>}

      <form action={formAction} key={formKey}>
        <input type="hidden" name="page_slug" value={pageSlug} />
        <input type="hidden" name="section_key" value={sectionKey} />
        {state?.error && <div className="admin-error">{state.error}</div>}
        {state?.success && <div className="admin-success">{state.success}</div>}

        {items.length === 0 && (
          <div className="admin-card">
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
              No items yet.
              {defaultCount > 0 &&
                ' This section ships with default content that hasn’t been added to the database yet.'}
            </p>
          </div>
        )}

        {items.map((item, index) => (
          <div
            className="admin-card"
            style={{
              marginBottom: 16,
              opacity: draggedId === item.id ? 0.4 : 1,
              borderTop:
                dragOverId === item.id && draggedId !== item.id
                  ? '2px solid var(--admin-gold)'
                  : undefined,
            }}
            key={item.id ?? index}
            data-item-id={item.id}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="drag-handle"
                  title="Drag to reorder"
                  onPointerDown={handlePointerDown(item)}
                  style={{ display: 'inline-block' }}
                >
                  ⠿
                </span>
                <strong style={{ fontSize: '0.9rem' }}>Item {index + 1}</strong>
              </div>
              <button
                type="button"
                className="admin-btn media-item-btn media-item-delete"
                onClick={() => setConfirmId(item.id ?? null)}
                disabled={deletePending}
              >
                Delete
              </button>
            </div>

            <input type="hidden" name="item_id" value={item.id ?? ''} />

            <div className="admin-form-grid">
              {meta.fields.map((field) => {
                // Photo-capable icon field (testimonials): a photo picker + a
                // live preview, storing the chosen image URL (or a typed FA
                // class) in the same `icon` value.
                if (field === 'icon' && meta.iconAsImage) {
                  const id = item.id ?? ''
                  const val = iconValues[id] ?? ''
                  const isPhoto = isImageValue(val)
                  return (
                    <div className="admin-field" key={field} style={{ gridColumn: '1 / -1' }}>
                      <label>Photo or Icon</label>
                      {/* Submitted value -- a photo URL or a Font Awesome class. */}
                      <input type="hidden" name={`${id}__icon`} value={val} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                        <span className="news-photo-item" style={{ width: 56, height: 56, borderRadius: '50%', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {isPhoto ? (
                            <img src={val} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <i className={val || 'fas fa-user'} aria-hidden="true" style={{ color: 'var(--admin-text-muted)' }}></i>
                          )}
                        </span>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ width: 'auto' }}
                            onClick={() => setPickerOpenFor(pickerOpenFor === id ? null : id)}
                          >
                            {pickerOpenFor === id ? 'Close' : isPhoto ? 'Change photo' : 'Choose photo'}
                          </button>
                          {isPhoto && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-secondary"
                              style={{ width: 'auto' }}
                              onClick={() => setIconValues((p) => ({ ...p, [id]: '' }))}
                            >
                              Remove photo
                            </button>
                          )}
                        </div>
                      </div>
                      {pickerOpenFor === id && (
                        mediaItems.length === 0 ? (
                          <p className="admin-field-hint">
                            No images in the Media Library yet. Upload one there first.
                          </p>
                        ) : (
                          <div className="media-grid media-picker-grid" style={{ marginBottom: 8 }}>
                            {mediaItems.map((m) => (
                              <div
                                key={m.id}
                                className={`media-thumb media-picker-thumb${val === m.file_url ? ' media-picker-thumb-selected' : ''}`}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  setIconValues((p) => ({ ...p, [id]: m.file_url }))
                                  setPickerOpenFor(null)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    setIconValues((p) => ({ ...p, [id]: m.file_url }))
                                    setPickerOpenFor(null)
                                  }
                                }}
                              >
                                <img src={m.file_url} alt={m.alt_text ?? m.file_name} loading="lazy" />
                              </div>
                            ))}
                          </div>
                        )
                      )}
                      <input
                        value={isPhoto ? '' : val}
                        onChange={(e) => setIconValues((p) => ({ ...p, [id]: e.target.value }))}
                        placeholder="…or a Font Awesome class, e.g. fas fa-user-graduate"
                        disabled={isPhoto}
                      />
                      <p className="admin-field-hint">
                        Pick a photo from the Media Library, or type a Font Awesome icon class as a
                        fallback. Upload photos in Media Library first.
                      </p>
                    </div>
                  )
                }
                return (
                <div className="admin-field" key={field}>
                  <label htmlFor={`${item.id}__${field}`}>{FIELD_LABELS[field]}</label>
                  {field === 'body' || field === 'body_suffix' ? (
                    <textarea
                      id={`${item.id}__${field}`}
                      name={`${item.id}__${field}`}
                      rows={2}
                      defaultValue={(item[field] as string) ?? ''}
                    />
                  ) : (
                    <input
                      id={`${item.id}__${field}`}
                      name={`${item.id}__${field}`}
                      defaultValue={(item[field] as string) ?? ''}
                    />
                  )}
                  {FIELD_HINTS[field] && (
                    <p className="admin-field-hint">{FIELD_HINTS[field]}</p>
                  )}
                </div>
                )
              })}
            </div>
          </div>
        ))}

        <button className="admin-btn" type="submit" disabled={pending} style={{ maxWidth: 200 }}>
          {pending ? 'Saving…' : 'Save Items'}
        </button>
      </form>

      {/* Recovery path for a section with no rows -- e.g. its migration hasn't
          been run, or every item was deleted. Kept outside the save form
          above, since nested forms are invalid HTML. */}
      {items.length === 0 && defaultCount > 0 && (
        <form action={restoreAction} style={{ marginTop: 12 }}>
          <input type="hidden" name="page_slug" value={pageSlug} />
          <input type="hidden" name="section_key" value={sectionKey} />
          <button
            className="admin-btn"
            type="submit"
            disabled={restorePending}
            style={{ maxWidth: 260 }}
          >
            {restorePending
              ? 'Restoring…'
              : `Restore ${defaultCount} default item(s)`}
          </button>
        </form>
      )}

      {meta.allowAdd && (
        <form action={addAction} style={{ marginTop: 12 }}>
          <input type="hidden" name="page_slug" value={pageSlug} />
          <input type="hidden" name="section_key" value={sectionKey} />
          <button
            className="admin-btn admin-btn-secondary"
            type="submit"
            disabled={addPending}
            style={{ maxWidth: 200 }}
          >
            {addPending ? 'Adding…' : '+ Add Item'}
          </button>
        </form>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete item"
        message="Delete this item? This cannot be undone."
        pending={deletePending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </>
  )
}
