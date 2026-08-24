import type { Metadata } from 'next'
import { getPageSections } from '@/lib/page-sections'
import { getPageItems } from '@/lib/page-section-items'
import PageBanner from '@/components/PageBanner'

export const metadata: Metadata = {
  description:
    "Learn about Syndesi School: our story, mission, and core values, located in Batangas City, Batangas.",
}

export default async function AboutPage() {
  const [s, items] = await Promise.all([getPageSections('about'), getPageItems('about')])

  return (
    <>
      <PageBanner
        icon="fas fa-info-circle"
        tag={s.intro.tag}
        title={s.intro.title}
        subtitle={s.intro.subtitle}
      />
      <section className="page-body">
      <div className="container">
        <div className="two-col-grid" style={{ gap: 40, alignItems: 'center' }}>
          <div className="our-story">
            {/* One <p> per stored paragraph. The first is styled as a larger
                "lead" line; an optional `title` renders as a bold lead-in
                inline at the start of the paragraph. */}
            {items.intro?.map((p, i) => (
              <p
                key={p.id ?? i}
                className={i === 0 ? 'story-lead' : undefined}
                style={{
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
        {items.mission_vision && items.mission_vision.length > 0 && (
          <div className="mv-grid">
            {items.mission_vision.map((m, i) => (
              <div className={`mv-card ${i === 0 ? 'mv-mission' : 'mv-vision'}`} key={m.id ?? i}>
                <span className="mv-icon">
                  <i className={m.icon ?? ''} aria-hidden="true"></i>
                </span>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </div>
            ))}
          </div>
        )}

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
    </>
  )
}
