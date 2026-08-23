import type { Metadata } from 'next'
import { getPageSections } from '@/lib/page-sections'
import { getPageItems } from '@/lib/page-section-items'
import { SectionTag } from '@/components/SectionCta'

export const metadata: Metadata = {
  description:
    "Learn about Syndesi School: our story, mission, and core values, located in Batangas City, Batangas.",
}

export default async function AboutPage() {
  const [s, items] = await Promise.all([getPageSections('about'), getPageItems('about')])

  return (
    <section className="page-top">
      <div className="container">
        <SectionTag icon="fas fa-info-circle" label={s.intro.tag} />
        <h2 className="section-title">{s.intro.title}</h2>
        <div className="two-col-grid" style={{ gap: 40, alignItems: 'center' }}>
          <div>
            {/* One <p> per stored paragraph. An optional `title` renders as a
                bold lead-in inline at the start of the paragraph. The last
                paragraph drops its bottom margin, as the hardcoded copy did. */}
            {items.intro?.map((p, i) => (
              <p
                key={p.id ?? i}
                style={{
                  color: 'var(--text-muted)',
                  marginBottom: i === (items.intro?.length ?? 0) - 1 ? 0 : 16,
                }}
              >
                {p.title && <strong>{p.title}</strong>}
                {p.title && p.body ? ' ' : ''}
                {p.body}
              </p>
            ))}
          </div>
          <div className="stats-2x2-grid">
            {items.facts?.map((f, i) => (
              <div className="fact-card reveal" key={f.id ?? i}>
                <span className="fact-icon">
                  <i className={f.icon ?? ''} aria-hidden="true"></i>
                </span>
                <div className="fact-body">
                  <span className="fact-label">{f.title}</span>
                  <span className="fact-value">{f.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 50 }}>
          <h3 style={{ color: 'var(--navy)', fontSize: '1.6rem', marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>{s.values.title}</h3>
          <div className="card-grid">
            {items.values?.map((v, i) => (
              <div className="card reveal accent-card" key={v.id ?? i}>
                <h4>{v.title}</h4>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
