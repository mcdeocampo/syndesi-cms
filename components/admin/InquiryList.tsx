'use client'

import { useActionState, useState } from 'react'
import { deleteInquiry, markInquiryRead } from '@/lib/actions/inquiries'
import type { Inquiry } from '@/lib/inquiries'
import ConfirmDialog from './ConfirmDialog'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function InquiryCard({ item }: { item: Inquiry }) {
  const [markState, markAction, markPending] = useActionState(markInquiryRead, undefined)
  const [delState, deleteAction, delPending] = useActionState(deleteInquiry, undefined)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const toggleRead = () => {
    const fd = new FormData()
    fd.set('id', item.id)
    fd.set('read', String(!item.is_read))
    markAction(fd)
  }

  const handleDelete = () => {
    const fd = new FormData()
    fd.set('id', item.id)
    deleteAction(fd)
    setConfirmOpen(false)
  }

  const replyHref = `mailto:${item.email}?subject=${encodeURIComponent(
    item.subject ? `Re: ${item.subject}` : 'Re: your message to Syndesi School'
  )}`

  return (
    <div className={`inquiry-card${item.is_read ? '' : ' inquiry-card-unread'}`}>
      <div className="inquiry-card-head">
        <div>
          <span className="inquiry-name">
            {item.name}
            {!item.is_read && <span className="inquiry-new-badge">New</span>}
          </span>
          <a className="inquiry-email" href={`mailto:${item.email}`}>
            {item.email}
          </a>
        </div>
        <span className="inquiry-date">{formatDate(item.created_at)}</span>
      </div>

      {item.subject && <div className="inquiry-subject">{item.subject}</div>}
      <p className="inquiry-message">{item.message}</p>

      <div className="inquiry-actions">
        <a href={replyHref} className="admin-btn media-item-btn">
          <i className="fas fa-reply" aria-hidden="true"></i> Reply
        </a>
        <button
          type="button"
          className="admin-btn media-item-btn"
          onClick={toggleRead}
          disabled={markPending}
        >
          {markPending ? 'Saving…' : item.is_read ? 'Mark as unread' : 'Mark as read'}
        </button>
        <button
          type="button"
          className="admin-btn media-item-btn media-item-delete"
          onClick={() => setConfirmOpen(true)}
          disabled={delPending}
        >
          {delPending ? 'Deleting…' : 'Delete'}
        </button>
      </div>
      {(markState?.error || delState?.error) && (
        <div className="admin-error media-item-msg">{markState?.error || delState?.error}</div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete inquiry"
        message={`Delete the message from "${item.name}"? This cannot be undone.`}
        pending={delPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

export default function InquiryList({ items }: { items: Inquiry[] }) {
  if (items.length === 0) {
    return (
      <div className="admin-card">
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
          No inquiries yet. Messages submitted through the website contact form will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="inquiry-list">
      {items.map((item) => (
        <InquiryCard key={item.id} item={item} />
      ))}
    </div>
  )
}
