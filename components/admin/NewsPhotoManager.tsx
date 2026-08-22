'use client'

import { useState } from 'react'
import type { MediaItem } from '@/lib/media'

// Multi-photo manager for a news article. Reuses the Media Library as the
// source of images (upload there, pick here) -- same model as the single
// MediaPicker it replaces, so no new upload path and no nested <form>.
//
// Selected photos render as ordered thumbnails with an X to remove and move
// controls to reorder; the first is the cover. The ordered media ids are
// submitted as a JSON array in the hidden `photo_ids` field, which the server
// action parses.
export default function NewsPhotoManager({
  items,
  initialIds,
}: {
  items: MediaItem[]
  initialIds: string[]
}) {
  // Keep only ids that still exist in the library (a picked image could have
  // been deleted from the Library since), preserving order.
  const byId = new Map(items.map((m) => [m.id, m]))
  const [ids, setIds] = useState<string[]>(() => initialIds.filter((id) => byId.has(id)))
  const [adding, setAdding] = useState(false)

  const remove = (id: string) => setIds((prev) => prev.filter((x) => x !== id))
  const add = (id: string) => {
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setAdding(false)
  }
  const move = (index: number, dir: -1 | 1) => {
    setIds((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const available = items.filter((m) => !ids.includes(m.id))

  return (
    <div className="news-photo-manager">
      {/* Authoritative value the server reads. Order = display order, [0] = cover. */}
      <input type="hidden" name="photo_ids" value={JSON.stringify(ids)} />

      {ids.length === 0 && (
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', margin: '0 0 12px' }}>
          No photos yet. Add one or more — the first is the cover shown on cards and the homepage.
        </p>
      )}

      {ids.length > 0 && (
        <div className="news-photo-list">
          {ids.map((id, i) => {
            const item = byId.get(id)!
            return (
              <div className="news-photo-item" key={id}>
                <img src={item.file_url} alt={item.alt_text ?? item.file_name} loading="lazy" />
                {i === 0 && <span className="news-photo-cover-badge">Cover</span>}
                <button
                  type="button"
                  className="news-photo-remove"
                  aria-label="Remove photo"
                  title="Remove photo"
                  onClick={() => remove(id)}
                >
                  ×
                </button>
                <div className="news-photo-move">
                  <button
                    type="button"
                    aria-label="Move left"
                    title="Move left"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Move right"
                    title="Move right"
                    disabled={i === ids.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    ›
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!adding && (
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          style={{ width: 'auto', marginTop: ids.length > 0 ? 14 : 0 }}
          onClick={() => setAdding(true)}
        >
          + Add Photo
        </button>
      )}

      {adding && (
        <div style={{ marginTop: 12 }}>
          {available.length === 0 ? (
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
              {items.length === 0
                ? 'No images in the Media Library yet. Upload some in Media Library first.'
                : 'All library images are already added to this article.'}
            </p>
          ) : (
            <div className="media-grid media-picker-grid">
              {available.map((item) => (
                <div
                  key={item.id}
                  className="media-thumb media-picker-thumb"
                  role="button"
                  tabIndex={0}
                  onClick={() => add(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      add(item.id)
                    }
                  }}
                >
                  <img src={item.file_url} alt={item.alt_text ?? item.file_name} loading="lazy" />
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            style={{ width: 'auto', marginTop: 12 }}
            onClick={() => setAdding(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
