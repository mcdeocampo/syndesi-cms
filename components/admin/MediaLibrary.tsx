'use client'

import { useActionState, useRef } from 'react'
import { uploadMedia } from '@/lib/actions/media'
import type { MediaItem } from '@/lib/media'
import MediaGridItem from './MediaGridItem'
import { downscaleImage } from './downscale'

export default function MediaLibrary({ items }: { items: MediaItem[] }) {
  const [state, formAction, pending] = useActionState(uploadMedia, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <>
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Upload Images</h2>
        {state?.error && <div className="admin-error">{state.error}</div>}
        {state?.success && <div className="admin-success">{state.success}</div>}
        <form
          ref={formRef}
          action={async (formData) => {
            // Downscale large photos in the browser before upload so they fit
            // under Vercel's ~4.5MB request-body cap (and get optimised). The
            // rebuilt FormData replaces the raw files with the processed ones;
            // non-photos and already-small files pass through unchanged.
            const input = formRef.current?.querySelector<HTMLInputElement>('input[type=file]')
            const rawFiles = input?.files ? Array.from(input.files) : []
            const processed = await Promise.all(rawFiles.map((f) => downscaleImage(f)))
            const fd = new FormData()
            for (const f of processed) fd.append('files', f)
            await formAction(processed.length ? fd : formData)
            formRef.current?.reset()
          }}
        >
          <div className="admin-field">
            <label htmlFor="files">Select images</label>
            <input
              id="files"
              name="files"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml,image/gif"
              multiple
              required
            />
            <p className="admin-field-hint">
              JPG, PNG, WEBP, SVG or GIF. Large photos are automatically resized and
              optimized in your browser before upload, so phone photos work fine. You can
              select multiple files.
            </p>
          </div>
          <button className="admin-btn" type="submit" disabled={pending} style={{ maxWidth: 200 }}>
            {pending ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h2>Library ({items.length})</h2>
        {items.length === 0 ? (
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
            No media uploaded yet. Use the form above to add your first image.
          </p>
        ) : (
          <div className="media-grid">
            {items.map((item) => (
              <MediaGridItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
