'use client'

import { useActionState, useState } from 'react'
import { createFaculty, updateFaculty } from '@/lib/actions/faculty'
import type { FacultyMember } from '@/lib/faculty'
import type { MediaItem } from '@/lib/media'
import MediaPicker from './MediaPicker'

export default function FacultyForm({
  faculty,
  mediaItems,
}: {
  faculty?: FacultyMember
  mediaItems: MediaItem[]
}) {
  const action = faculty ? updateFaculty : createFaculty
  const [state, formAction, pending] = useActionState(action, undefined)
  const [photoId, setPhotoId] = useState<string | null>(faculty?.photo_id ?? null)

  return (
    <form action={formAction}>
      {faculty && <input type="hidden" name="id" value={faculty.id} />}
      {state?.error && <div className="admin-error">{state.error}</div>}

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Photo</h2>
        <input type="hidden" name="photo_id" value={photoId ?? ''} />
        <MediaPicker items={mediaItems} selectedId={photoId} onSelect={setPhotoId} />
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Profile</h2>
        <div className="admin-field">
          <label htmlFor="full_name">Full Name</label>
          <input id="full_name" name="full_name" defaultValue={faculty?.full_name} required />
        </div>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="position">Position</label>
            <input id="position" name="position" defaultValue={faculty?.position ?? ''} />
          </div>
          <div className="admin-field">
            <label htmlFor="department">Department</label>
            <input id="department" name="department" defaultValue={faculty?.department ?? ''} />
          </div>
        </div>
        <div className="admin-field">
          <label htmlFor="icon">Role Icon (optional)</label>
          <input id="icon" name="icon" defaultValue={faculty?.icon ?? ''} placeholder="e.g. fas fa-user-shield" />
          <p className="admin-field-hint">
            A Font Awesome class shown beside the role — e.g.{' '}
            <strong>fas fa-user-shield</strong> (principal), <strong>fas fa-graduation-cap</strong>{' '}
            (academic), <strong>fas fa-heart</strong> (counselor). Leave blank for a default icon.
          </p>
        </div>
        <div className="admin-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={faculty?.email ?? ''} />
        </div>
        <div className="admin-field">
          <label htmlFor="biography">Biography</label>
          <textarea id="biography" name="biography" defaultValue={faculty?.biography ?? ''} />
        </div>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="display_order">Display Order</label>
            <input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={faculty?.display_order ?? 0}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={faculty?.status ?? 'draft'}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      <button className="admin-btn" type="submit" disabled={pending} style={{ maxWidth: 200 }}>
        {pending ? 'Saving…' : faculty ? 'Save Changes' : 'Create Faculty Member'}
      </button>
    </form>
  )
}
