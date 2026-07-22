'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { deleteFaculty, reorderFaculty } from '@/lib/actions/faculty'
import type { FacultyMember } from '@/lib/faculty'
import ConfirmDialog from './ConfirmDialog'

function FacultyRow({
  item,
  isDragging,
  isDragOver,
  onHandlePointerDown,
}: {
  item: FacultyMember
  isDragging: boolean
  isDragOver: boolean
  onHandlePointerDown: (e: React.PointerEvent) => void
}) {
  const [state, deleteAction, pending] = useActionState(deleteFaculty, undefined)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirmDelete = () => {
    const formData = new FormData()
    formData.set('id', item.id)
    deleteAction(formData)
    setConfirmOpen(false)
  }

  return (
    <tr
      data-faculty-id={item.id}
      className={`${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`.trim()}
    >
      <td
        className="drag-handle"
        title="Drag to reorder"
        onPointerDown={onHandlePointerDown}
      >
        ⠿
      </td>
      <td>
        {item.photo_url ? (
          <img src={item.photo_url} alt={item.full_name} />
        ) : (
          <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>—</span>
        )}
      </td>
      <td>{item.full_name}</td>
      <td>{item.position ?? '—'}</td>
      <td>
        <span className={`status-badge status-badge-${item.status}`}>{item.status}</span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href={`/admin/faculty/${item.id}/edit`} className="admin-btn media-item-btn">
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
          title="Delete faculty member"
          message={`Delete "${item.full_name}"? This cannot be undone.`}
          pending={pending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </td>
    </tr>
  )
}

export default function FacultyList({ items: initialItems }: { items: FacultyMember[] }) {
  const [items, setItems] = useState(initialItems)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="admin-card">
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
          No faculty members yet. Click &ldquo;Add Faculty Member&rdquo; to create one.
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

    const result = await reorderFaculty(reordered.map((i) => i.id))
    if (result?.error) {
      setItems(previousItems)
      setReorderError(result.error)
    }
  }

  // Pointer Events instead of the native HTML5 Drag and Drop API -- native
  // <tr draggable> reordering is unreliable across browsers/devices (breaks
  // on touch entirely, flaky drag-image/target-detection behavior on some
  // desktop browsers for table rows specifically). Pointer Events work
  // uniformly for mouse, trackpad, and touch.
  const handlePointerDown = (item: FacultyMember) => (e: React.PointerEvent) => {
    e.preventDefault()
    const handle = e.currentTarget as HTMLElement
    handle.setPointerCapture(e.pointerId)
    setDraggedId(item.id)

    let currentOverId: string | null = null

    const onPointerMove = (moveEvent: PointerEvent) => {
      const el = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)
      const row = el?.closest('tr[data-faculty-id]') as HTMLElement | null
      const id = row?.dataset.facultyId ?? null
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
            <th>Photo</th>
            <th>Name</th>
            <th>Position</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <FacultyRow
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
