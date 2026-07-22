'use client'

import type { MediaItem } from '@/lib/media'

export default function MediaPicker({
  items,
  selectedId,
  onSelect,
}: {
  items: MediaItem[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  if (items.length === 0) {
    return (
      <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
        No images in the Media Library yet. Upload one first.
      </p>
    )
  }

  return (
    <div className="media-grid media-picker-grid">
      {items.map((item) => (
        <div
          key={item.id}
          className={`media-thumb media-picker-thumb${
            selectedId === item.id ? ' media-picker-thumb-selected' : ''
          }`}
          onClick={() => onSelect(selectedId === item.id ? null : item.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect(selectedId === item.id ? null : item.id)
            }
          }}
        >
          <img src={item.file_url} alt={item.alt_text ?? item.file_name} loading="lazy" />
        </div>
      ))}
    </div>
  )
}
