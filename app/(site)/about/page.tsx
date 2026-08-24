import type { Metadata } from 'next'
import { getPageSections } from '@/lib/page-sections'
import { getPageItems } from '@/lib/page-section-items'
import { getSiteSettings } from '@/lib/settings'
import PageBanner from '@/components/PageBanner'

export const metadata: Metadata = {
  description:
    "Learn about Syndesi School: our story, mission, and core values, located in Batangas City, Batangas.",
}

export default async function AboutPage() {
  const [s, items, settings] = await Promise.all([
    getPageSections('about'),
    getPageItems('about'),
    getSiteSettings(),
  ])

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
        <div
          className={settings.about_image_url ? 'two-col-grid' : undefined}
          style={{ gap: 40, alignItems: 'center' }}
        >
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
          {/* Photo (uploaded in Website Settings) sits beside the story. Until
              one is set, the story simply spans the full width -- no empty box. */}
          {settings.about_image_url && (
            <div className="about-photo">
              <img src={settings.about_image_url} alt={`${settings.school_name} campus`} />
            </div>
          )}
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
