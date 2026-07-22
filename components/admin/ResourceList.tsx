'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { deleteResource } from '@/lib/actions/resources'
import type { Resource } from '@/lib/resources'
import ConfirmDialog from './ConfirmDialog'

function ResourceRow({ item }: { item: Resource }) {
  const [state, deleteAction, pending] = useActionState(deleteResource, undefined)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirmDelete = () => {
    const formData = new FormData()
    formData.set('id', item.id)
    deleteAction(formData)
    setConfirmOpen(false)
  }

  return (
    <tr>
      <td>{item.title}</td>
      <td>{item.category ?? '—'}</td>
      <td>
        {item.file_url ? (
          <a href={item.file_url} target="_blank" rel="noopener" style={{ color: 'var(--admin-navy)' }}>
            {item.file_name}
          </a>
        ) : (
          <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>—</span>
        )}
      </td>
      <td>
        <span className={`status-badge status-badge-${item.status}`}>{item.status}</span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href={`/admin/resources/${item.id}/edit`} className="admin-btn media-item-btn">
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
          title="Delete resource"
          message={`Delete "${item.title}"? This cannot be undone.`}
          pending={pending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </td>
    </tr>
  )
}

export default function ResourceList({ items }: { items: Resource[] }) {
  if (items.length === 0) {
    return (
      <div className="admin-card">
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
          No resources yet. Click &ldquo;Add Resource&rdquo; to create one.
        </p>
      </div>
    )
  }

  return (
    <div className="admin-card">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>File</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <ResourceRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
