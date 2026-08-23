import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedNews } from '@/lib/news'
import { getPageSections } from '@/lib/page-sections'
import SectionCta, { SectionTag } from '@/components/SectionCta'

export const metadata: Metadata = {
  description:
    'The latest news, announcements, and past achievements from Syndesi School.',
}

export default async function NewsPage() {
  const [news, s] = await Promise.all([getPublishedNews(), getPageSections('news')])

  return (
    <section className="page-top">
      <div className="container">
        <SectionTag icon="fas fa-newspaper" label={s.intro.tag} />
        <h2 className="section-title">{s.intro.title}</h2>
        <p className="section-subtitle">{s.intro.subtitle}</p>

        {news.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
            {s.intro.empty_text}
          </p>
        ) : (
          <div className="card-grid">
            {news.map((article) => (
              <div className="card news-card reveal" key={article.id}>
                {/* Only rendered when an image is attached in the CMS, so
                    articles without one keep the plain text card rather than
                    showing an empty placeholder block. The wrapper clips the
                    hover zoom to the rounded top corners. */}
                {article.featured_image_url && (
                  <div className="news-card-media">
                    <img
                      src={article.featured_image_url}
                      alt={article.title}
                      className="news-card-image"
                      loading="lazy"
                    />
                  </div>
                )}
                {article.category && <span className="news-category-badge">{article.category}</span>}
                <h4>{article.title}</h4>
                <p>
                  <small style={{ color: 'var(--text-muted)' }}>
                    {/* An optional date_label overrides the shown date; the
                        publish_date is always recorded and shown otherwise. */}
                    {article.date_label
                      ? article.date_label
                      : article.publish_date
                        ? new Date(article.publish_date).toLocaleDateString(undefined, {
                            dateStyle: 'long',
                          })
                        : ''}
                  </small>
                </p>
                {article.summary && <p>{article.summary}</p>}
                <Link href={`/news/${article.slug}`} className="card-learn-more">
                  Read More <i className="fas fa-arrow-right" aria-hidden="true"></i>
                </Link>
              </div>
            ))}
          </div>
        )}

        <SectionCta section={s.intro} />
      </div>
    </section>
  )
}
