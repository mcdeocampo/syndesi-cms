import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNewsBySlug } from '@/lib/news'
import NewsPhotoCarousel from '@/components/NewsPhotoCarousel'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getNewsBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.summary ?? undefined,
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getNewsBySlug(slug)

  if (!article) notFound()

  return (
    <section className="page-top">
      <div className="container" style={{ maxWidth: 780 }}>
        <Link href="/news" className="card-learn-more" style={{ marginBottom: 24, display: 'inline-block' }}>
          <i className="fas fa-arrow-left" aria-hidden="true"></i> Back to News
        </Link>

        {article.category && <span className="news-category-badge">{article.category}</span>}
        <h1 style={{ marginTop: 12 }}>{article.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {/* date_label (if set) overrides the shown date; publish_date is
              always recorded and shown otherwise. */}
          {article.date_label
            ? article.date_label
            : article.publish_date
              ? new Date(article.publish_date).toLocaleDateString(undefined, { dateStyle: 'long' })
              : ''}
          {article.author && <> &middot; {article.author}</>}
        </p>

        {/* 0 photos → nothing; 1 → plain image; 2+ → carousel. photos[0] is
            the cover, and for pre-existing single-image articles the reader
            synthesizes a one-photo list from the old featured image. */}
        {article.photos.length === 1 && (
          <img
            src={article.photos[0].url}
            alt={article.photos[0].alt ?? article.title}
            className="news-detail-image"
          />
        )}
        {article.photos.length > 1 && (
          <NewsPhotoCarousel
            photos={article.photos.map((p) => ({ url: p.url, alt: p.alt ?? article.title }))}
          />
        )}

        {article.summary && <p className="news-detail-summary">{article.summary}</p>}

        {/* Deliberate: raw plain text stored in content_html, rendered via
            whiteSpace: pre-wrap so React auto-escapes it -- NOT
            dangerouslySetInnerHTML. See NewsForm.tsx / lib/actions/news.ts
            for the full rationale. A future rich-text editor would need to
            revisit this render path with proper HTML sanitization. */}
        {article.content && (
          <div className="news-detail-body" style={{ whiteSpace: 'pre-wrap' }}>
            {article.content}
          </div>
        )}
      </div>
    </section>
  )
}
