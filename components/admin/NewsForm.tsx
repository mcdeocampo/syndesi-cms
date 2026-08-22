'use client'

import { useActionState, useState } from 'react'
import { createNews, updateNews } from '@/lib/actions/news'
import type { NewsArticle } from '@/lib/news'
import type { MediaItem } from '@/lib/media'
import NewsPhotoManager from './NewsPhotoManager'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// Two separate concerns, never in conflict:
//   Publish Date  = WHEN the article was published (always recorded; admin
//                   list + sorting). Always present.
//   Public label  = OPTIONAL override for what visitors see in place of the
//                   date. '' means "just show the date".
const LABEL_OPTIONS = [
  { value: '', label: 'Show the date' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Postponed', label: 'Postponed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'TBA', label: 'TBA' },
  { value: 'custom', label: 'Custom…' },
] as const

const PRESET_CAPTIONS = new Set(['Ongoing', 'Completed', 'Postponed', 'Cancelled', 'TBA'])

function initialLabelChoice(article?: NewsArticle): string {
  if (!article?.date_label) return ''
  return PRESET_CAPTIONS.has(article.date_label) ? article.date_label : 'custom'
}

export default function NewsForm({
  article,
  mediaItems,
}: {
  article?: NewsArticle
  mediaItems: MediaItem[]
}) {
  const action = article ? updateNews : createNews
  const [state, formAction, pending] = useActionState(action, undefined)

  // Initial ordered photo ids: the article's gallery if it has one, otherwise
  // its legacy single featured image (so existing records open as one photo).
  const initialPhotoIds =
    article?.photos && article.photos.length > 0
      ? article.photos.map((p) => p.media_id)
      : article?.featured_image_id
        ? [article.featured_image_id]
        : []
  // Optional public-facing label override. '' = show the recorded date;
  // a preset or 'custom' = show that caption instead. The Publish Date is
  // always recorded regardless of this choice, so the two never conflict.
  const [labelChoice, setLabelChoice] = useState<string>(() => initialLabelChoice(article))
  const [customLabel, setCustomLabel] = useState(
    article?.date_label && !PRESET_CAPTIONS.has(article.date_label) ? article.date_label : ''
  )

  return (
    <form action={formAction}>
      {article && <input type="hidden" name="id" value={article.id} />}
      {state?.error && <div className="admin-error">{state.error}</div>}

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Photos</h2>
        <p className="admin-field-hint" style={{ marginTop: -6, marginBottom: 14 }}>
          Add one or more photos. The first is the cover shown on news cards and the homepage;
          a detail page with two or more photos shows a swipeable carousel. Upload images in
          Media Library first, then add them here.
        </p>
        <NewsPhotoManager items={mediaItems} initialIds={initialPhotoIds} />
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Article</h2>
        <div className="admin-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={article?.title} required />
        </div>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="category">Category</label>
            <input id="category" name="category" defaultValue={article?.category ?? ''} />
          </div>
          <div className="admin-field">
            <label htmlFor="author">Author</label>
            <input id="author" name="author" defaultValue={article?.author ?? ''} />
          </div>
        </div>
        <div className="admin-field">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" name="summary" defaultValue={article?.summary ?? ''} />
        </div>
        <div className="admin-field">
          <label htmlFor="content">Body</label>
          {/* Plain text only -- rendered on the public site with
              whiteSpace: 'pre-wrap', NOT dangerouslySetInnerHTML. This is a
              deliberate decision (no rich-text editor yet); a future
              rich-text upgrade must revisit the render path with proper
              sanitization before switching to HTML rendering. */}
          <textarea id="content" name="content" rows={12} defaultValue={article?.content ?? ''} />
        </div>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="publish_date">Publish Date</label>
            <input
              id="publish_date"
              name="publish_date"
              type="date"
              defaultValue={article?.publish_date?.slice(0, 10) ?? todayISO()}
            />
            <p className="admin-field-hint">
              When this article was published — always recorded, and used to sort the news list.
            </p>
          </div>
          <div className="admin-field">
            <label htmlFor="label_choice">Public Date Display</label>
            <select
              id="label_choice"
              value={labelChoice}
              onChange={(e) => setLabelChoice(e.target.value)}
            >
              {LABEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="admin-field-hint">
              What visitors see for the date. Choose a label (e.g. Ongoing) to show it instead of
              the actual date — the Publish Date above is still kept.
            </p>

            {labelChoice === 'custom' && (
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Custom label"
                style={{ marginTop: 10 }}
              />
            )}

            {/* Exactly one date_label value is ever submitted: the custom
                text, a preset caption, or nothing at all (when "Show the
                date" is selected, no date_label input is rendered, so it
                stays null in the database = show the recorded date). */}
            {labelChoice === 'custom' ? (
              <input type="hidden" name="date_label" value={customLabel} />
            ) : labelChoice !== '' ? (
              <input type="hidden" name="date_label" value={labelChoice} />
            ) : null}
          </div>
        </div>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={article?.status ?? 'draft'}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="admin-field admin-checkbox-field">
          <label htmlFor="featured">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={article?.featured ?? false}
            />
            Feature on Homepage
          </label>
          <p className="admin-field-hint">
            The homepage&apos;s Latest News section only shows articles checked here — not
            automatically the most recent ones.
          </p>
        </div>
      </div>

      <button className="admin-btn" type="submit" disabled={pending} style={{ maxWidth: 200 }}>
        {pending ? 'Saving…' : article ? 'Save Changes' : 'Create Article'}
      </button>
    </form>
  )
}
