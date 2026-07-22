'use client'

import { useActionState } from 'react'
import { createResource, updateResource } from '@/lib/actions/resources'
import type { Resource } from '@/lib/resources'

export default function ResourceForm({ resource }: { resource?: Resource }) {
  const action = resource ? updateResource : createResource
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction}>
      {resource && <input type="hidden" name="id" value={resource.id} />}
      {state?.error && <div className="admin-error">{state.error}</div>}

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Resource</h2>
        <div className="admin-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={resource?.title} required />
        </div>
        <div className="admin-field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            defaultValue={resource?.category ?? ''}
            placeholder="e.g. Forms, Handbooks, Policies"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" defaultValue={resource?.description ?? ''} />
        </div>
        <div className="admin-field">
          <label htmlFor="file">File</label>
          {resource?.file_name && (
            <p className="admin-field-hint" style={{ marginTop: 0, marginBottom: 6 }}>
              Current file: <strong>{resource.file_name}</strong>
            </p>
          )}
          <input
            id="file"
            name="file"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
          />
          <p className="admin-field-hint">
            PDF, Word, Excel, PowerPoint, or image. 20MB max.
            {resource ? ' Leave blank to keep the current file.' : ' Optional.'}
          </p>
        </div>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={resource?.status ?? 'draft'}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      <button className="admin-btn" type="submit" disabled={pending} style={{ maxWidth: 200 }}>
        {pending ? 'Saving…' : resource ? 'Save Changes' : 'Create Resource'}
      </button>
    </form>
  )
}
