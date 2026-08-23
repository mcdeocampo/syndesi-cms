import type { Metadata } from 'next'
import { getPageSections } from '@/lib/page-sections'
import { getPageItems } from '@/lib/page-section-items'
import SectionCta, { SectionTag } from '@/components/SectionCta'

export const metadata: Metadata = {
  description:
    'Clubs, sports, events, and achievements that make up student life at Gardner School of Multiple Intelligences.',
}

export default async function StudentLifePage() {
  const [s, items] = await Promise.all([
    getPageSections('student-life'),
    getPageItems('student-life'),
  ])

  return (
    <section className="page-top">
      <div className="container">
        <SectionTag icon="fas fa-users" label={s.intro.tag} />
        <h2 className="section-title">{s.intro.title}</h2>
        <p className="section-subtitle">{s.intro.subtitle}</p>

        <div className="card-grid">
          {items.cards?.map((c, i) => (
            <div className="card reveal accent-card" key={c.id ?? i}>
              <h4>
                {/* No explicit colour -- inherits the card's accent from h4. */}
                <i className={c.icon ?? ''} aria-hidden="true" style={{ marginRight: 8 }}></i>
                {c.title}
              </h4>
              <p>{c.body}</p>
            </div>
          ))}
        </div>

        <SectionCta section={s.intro} />
      </div>
    </section>
  )
}
