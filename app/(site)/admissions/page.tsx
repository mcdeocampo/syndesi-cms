import type { Metadata } from 'next'
import { getPageSections } from '@/lib/page-sections'
import { getPageItems } from '@/lib/page-section-items'
import SectionCta, { SectionTag } from '@/components/SectionCta'

export const metadata: Metadata = {
  description:
    'Admission requirements, enrollment procedure, tuition, and scholarship information for Gardner School of Multiple Intelligences.',
}

export default async function AdmissionsPage() {
  const [s, items] = await Promise.all([
    getPageSections('admissions'),
    getPageItems('admissions'),
  ])

  return (
    <section className="page-top">
      <div className="container">
        <SectionTag icon="fas fa-door-open" label={s.intro.tag} />
        <h2 className="section-title">{s.intro.title}</h2>
        <p className="section-subtitle">{s.intro.subtitle}</p>

        <div className="card-grid">
          {items.cards?.map((card, i) => (
            <div className="card reveal accent-card" key={card.id ?? i}>
              <h4>
                {/* No explicit colour -- inherits the card's accent from h4. */}
                <i className={card.icon ?? ''} aria-hidden="true" style={{ marginRight: 8 }}></i>
                {card.title}
              </h4>
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

        <SectionCta section={s.intro} />
      </div>
    </section>
  )
}
