'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { deleteNews, reorderNews } from '@/lib/actions/news'
import type { NewsArticle } from '@/lib/news'
import ConfirmDialog from './ConfirmDialog'

// Deterministic date format (fixed locale + UTC) so this client component
// renders identically on the server and the browser -- a bare
// toLocaleDateString() uses each environment's own locale and causes a
// hydration mismatch (e.g. "15/07/2026" server vs "7/15/2026" client).
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function NewsRow({
  item,
  isDragging,
  isDragOver,
  onHandlePointerDown,
}: {
  item: NewsArticle
  isDragging: boolean
  isDragOver: boolean
  onHandlePointerDown: (e: React.PointerEvent) => void
}) {
  const [state, deleteAction, pending] = useActionState(deleteNews, undefined)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirmDelete = () => {
    const formData = new FormData()
    formData.set('id', item.id)
    deleteAction(formData)
    setConfirmOpen(false)
  }

  return (
    <tr
      data-news-id={item.id}
      className={`${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`.trim()}
    >
      <td className="drag-handle" title="Drag to reorder" onPointerDown={onHandlePointerDown}>
        ⠿
      </td>
      <td>
        {item.featured_image_url ? (
          <img src={item.featured_image_url} alt={item.title} />
        ) : (
          <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>—</span>
        )}
      </td>
      <td>
        {item.title}
        {item.featured && (
          <i
            className="fas fa-star"
            title="Featured on Homepage"
            style={{ color: 'var(--admin-gold)', marginLeft: 8, fontSize: '0.8rem' }}
          ></i>
        )}
      </td>
      <td>{item.category ?? '—'}</td>
      <td>
        <span className={`status-badge status-badge-${item.status}`}>{item.status}</span>
      </td>
      <td>
        {item.publish_date ? formatDate(item.publish_date) : '—'}
        {item.date_label && (
          <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.72rem', marginTop: 2 }}>
            {item.date_label}
          </div>
        )}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href={`/admin/news/${item.id}/edit`} className="admin-btn media-item-btn">
            Edit
          </Link>
          <button
            type="button"
            className="admin-btn media-item-btn media-item-delete"
            onClick={() => setConfirmOpen(true)}
            disabled={pending}
          >
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
        {state?.error && <div className="admin-error media-item-msg">{state.error}</div>}

        <ConfirmDialog
          open={confirmOpen}
          title="Delete news article"
          message={`Delete "${item.title}"? This cannot be undone.`}
          pending={pending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </td>
    </tr>
  )
}

export default function NewsList({ items: initialItems }: { items: NewsArticle[] }) {
  const [items, setItems] = useState(initialItems)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="admin-card">
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
          No news articles yet. Click &ldquo;Add Article&rdquo; to create one.
        </p>
      </div>
    )
  }

  const finishDrag = async (draggedFromId: string, dropOnId: string | null) => {
    if (!dropOnId || dropOnId === draggedFromId) return

    const fromIndex = items.findIndex((i) => i.id === draggedFromId)
    const toIndex = items.findIndex((i) => i.id === dropOnId)
    if (fromIndex === -1 || toIndex === -1) return

    const previousItems = items
    const reordered = [...items]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)

    setItems(reordered)
    setReorderError(null)

    const result = await reorderNews(reordered.map((i) => i.id))
    if (result?.error) {
      setItems(previousItems)
      setReorderError(result.error)
    }
  }

  // Pointer Events instead of the native HTML5 Drag and Drop API -- same
  // reasoning as FacultyList.tsx: native <tr draggable> reordering proved
  // unreliable across browsers/devices there.
  const handlePointerDown = (item: NewsArticle) => (e: React.PointerEvent) => {
    e.preventDefault()
    const handle = e.currentTarget as HTMLElement
    handle.setPointerCapture(e.pointerId)
    setDraggedId(item.id)

    let currentOverId: string | null = null

    const onPointerMove = (moveEvent: PointerEvent) => {
      const el = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)
      const row = el?.closest('tr[data-news-id]') as HTMLElement | null
      const id = row?.dataset.newsId ?? null
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
      finishDrag(item.id, currentOverId)
    }

    handle.addEventListener('pointermove', onPointerMove)
    handle.addEventListener('pointerup', onPointerUp)
    handle.addEventListener('pointercancel', onPointerUp)
  }

  return (
    <div className="admin-card">
      {reorderError && <div className="admin-error">{reorderError}</div>}
      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Image</th>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Publish Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <NewsRow
              key={item.id}
              item={item}
              isDragging={draggedId === item.id}
              isDragOver={dragOverId === item.id && draggedId !== item.id}
              onHandlePointerDown={handlePointerDown(item)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
