'use client'

import { useActionState, useState } from 'react'
import { deleteMedia, updateMediaAltText } from '@/lib/actions/media'
import type { MediaItem } from '@/lib/media'
import ConfirmDialog from './ConfirmDialog'

export default function MediaGridItem({ item }: { item: MediaItem }) {
  const [deleteState, deleteAction, deletePending] = useActionState(deleteMedia, undefined)
  const [altState, altAction, altPending] = useActionState(updateMediaAltText, undefined)
  const [altText, setAltText] = useState(item.alt_text ?? '')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isSvg = item.file_type === 'image/svg+xml'

  const handleConfirmDelete = () => {
    const formData = new FormData()
    formData.set('id', item.id)
    deleteAction(formData)
    setConfirmOpen(false)
  }

  return (
    <div className="media-item">
      <div className="media-thumb">
        <img src={item.file_url} alt={item.alt_text ?? item.file_name} loading="lazy" />
      </div>
      <div className="media-item-name" title={item.file_name}>
        {item.file_name}
      </div>
      {item.file_size != null && (
        <div className="media-item-meta">
          {(item.file_size / 1024).toFixed(0)} KB{isSvg ? ' · SVG' : ''}
        </div>
      )}

      <form action={altAction} className="media-item-alt-form">
        <input type="hidden" name="id" value={item.id} />
        <input
          type="text"
          name="alt_text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Alt text"
          aria-label={`Alt text for ${item.file_name}`}
        />
        <button className="admin-btn media-item-btn" type="submit" disabled={altPending}>
          {altPending ? 'Saving…' : 'Save'}
        </button>
      </form>
      {altState?.error && <div className="admin-error media-item-msg">{altState.error}</div>}

      <button
        type="button"
        className="admin-btn media-item-btn media-item-delete"
        onClick={() => setConfirmOpen(true)}
        disabled={deletePending}
      >
        {deletePending ? 'Deleting…' : 'Delete'}
      </button>
      {deleteState?.error && <div className="admin-error media-item-msg">{deleteState.error}</div>}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete image"
        message={`Delete "${item.file_name}"? This cannot be undone.`}
        pending={deletePending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
