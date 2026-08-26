import type { Metadata } from 'next'
import { getPageSections } from '@/lib/page-sections'
import { getPageItems } from '@/lib/page-section-items'
import SectionCta, { SectionTag } from '@/components/SectionCta'
import PageBanner from '@/components/PageBanner'

export const metadata: Metadata = {
  description:
    'Admission requirements, enrollment procedure, tuition, and scholarship information for Syndesi School.',
}

export default async function AdmissionsPage() {
  const [s, items] = await Promise.all([
    getPageSections('admissions'),
    getPageItems('admissions'),
  ])

  return (
    <>
      <PageBanner
        icon="fas fa-door-open"
        tag={s.intro.tag}
        title={s.intro.title}
        subtitle={s.intro.subtitle}
      />
      <section className="page-body">
      <div className="container">
        <div className="card-grid">
          {items.cards?.map((card, i) => (
            <div className="program-card reveal" key={card.id ?? i}>
              <span className="program-icon"><i className={card.icon ?? ''} aria-hidden="true"></i></span>
              <h4>{card.title}</h4>
              {/* Cards 1 and 2 render their body from the requirements /
                  procedure sections instead of their own `body` column. */}
              {i === 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                  {items.requirements?.map((r, ri) => (
                    <li style={{ padding: '6px 0' }} key={r.id ?? ri}>• {r.body}</li>
                  ))}
                </ul>
              ) : i === 1 ? (
                <ol style={{ paddingLeft: 20, color: 'var(--text-muted)' }}>
                  {items.procedure?.map((p, pi) => (
                    <li style={{ padding: '6px 0' }} key={p.id ?? pi}>{p.body}</li>
                  ))}
                </ol>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>{card.body}</p>
              )}
            </div>
          ))}
        </div>

        {items.faq && items.faq.length > 0 && (
          <div className="faq-section">
            <div className="section-head-center">
              <SectionTag icon="fas fa-circle-question" label={s.faq.tag} />
              <h2 className="section-title">{s.faq.title}</h2>
              {s.faq.subtitle && <p className="section-subtitle">{s.faq.subtitle}</p>}
            </div>
            <div className="faq-list">
              {items.faq.map((f, i) => (
                <details className="faq-item" key={f.id ?? i}>
                  <summary>
                    <span>{f.title}</span>
                    <i className="fas fa-chevron-down" aria-hidden="true"></i>
                  </summary>
                  <div className="faq-answer">
                    <p>{f.body}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        <SectionCta section={s.intro} />
      </div>
      </section>
    </>
  )
}
