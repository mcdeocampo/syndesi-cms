'use client'

import { useActionState, useState } from 'react'
import {
  createResource,
  updateResource,
  createResourceUploadUrl,
  registerResourceFile,
} from '@/lib/actions/resources'
import { createClient } from '@/lib/supabase/client'
import type { Resource } from '@/lib/resources'

// Files larger than this are uploaded straight to Supabase Storage via a
// signed URL, bypassing Vercel's ~4.5MB Server Action body cap. Smaller files
// keep the simpler FormData path through the server action. 4MB leaves margin.
const DIRECT_UPLOAD_THRESHOLD = 4 * 1024 * 1024

export default function ResourceForm({ resource }: { resource?: Resource }) {
  const action = resource ? updateResource : createResource
  const [state, formAction, pending] = useActionState(action, undefined)
  // Errors from the client-side direct-upload steps (separate from the server
  // action's own `state.error`).
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  return (
    <form
      action={async (formData) => {
        setUploadError(null)
        const file = formData.get('file')

        // Large file: upload direct to storage, then hand the server just the
        // resulting file_id (no bytes through the Server Action).
        if (file instanceof File && file.size > DIRECT_UPLOAD_THRESHOLD) {
          setUploading(true)
          try {
            const urlRes = await createResourceUploadUrl(file.name, file.type, file.size)
            if (urlRes.error || !urlRes.path || !urlRes.token) {
              setUploadError(urlRes.error ?? 'Could not start the upload.')
              return
            }
            const supabase = createClient()
            const { error: upErr } = await supabase.storage
              .from('media')
              .uploadToSignedUrl(urlRes.path, urlRes.token, file)
            if (upErr) {
              setUploadError(`Upload failed: ${upErr.message}`)
              return
            }
            const reg = await registerResourceFile(urlRes.path, file.name, file.type, file.size)
            if (reg.error || !reg.fileId) {
              setUploadError(reg.error ?? 'Could not save the uploaded file.')
              return
            }
            // Swap the bytes for the pre-uploaded id so the action stays tiny.
            formData.delete('file')
            formData.set('file_id', reg.fileId)
          } finally {
            setUploading(false)
          }
        }

        await formAction(formData)
      }}
    >
      {resource && <input type="hidden" name="id" value={resource.id} />}
      {uploadError && <div className="admin-error">{uploadError}</div>}
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
          <label htmlFor="icon">Icon (optional)</label>
          <input
            id="icon"
            name="icon"
            defaultValue={resource?.icon ?? ''}
            placeholder="e.g. fas fa-users"
          />
          <p className="admin-field-hint">
            A Font Awesome class shown in the card&rsquo;s circle — e.g.{' '}
            <strong>fas fa-users</strong> (families), <strong>fas fa-shield-halved</strong>{' '}
            (policies), <strong>fas fa-book-open</strong> (handbook). Leave blank to use an icon
            based on the file type.
          </p>
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
            PDF, Word, Excel, PowerPoint, or image. 20MB max. Large files upload directly and
            may take a moment.
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

      <button
        className="admin-btn"
        type="submit"
        disabled={pending || uploading}
        style={{ maxWidth: 200 }}
      >
        {uploading ? 'Uploading file…' : pending ? 'Saving…' : resource ? 'Save Changes' : 'Create Resource'}
      </button>
    </form>
  )
}
