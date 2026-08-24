import type { Metadata } from 'next'
import { getPageSections } from '@/lib/page-sections'
import { getPageItems } from '@/lib/page-section-items'
import SectionCta from '@/components/SectionCta'
import PageBanner from '@/components/PageBanner'

export const metadata: Metadata = {
  description:
    'Clubs, sports, events, and achievements that make up student life at Syndesi School.',
}

export default async function StudentLifePage() {
  const [s, items] = await Promise.all([
    getPageSections('student-life'),
    getPageItems('student-life'),
  ])

  return (
    <>
      <PageBanner
        icon="fas fa-users"
        tag={s.intro.tag}
        title={s.intro.title}
        subtitle={s.intro.subtitle}
      />
      <section className="page-body">
      <div className="container">
        <div className="card-grid">
          {items.cards?.map((c, i) => (
            <div className="program-card reveal" key={c.id ?? i}>
              <span className="program-icon"><i className={c.icon ?? ''} aria-hidden="true"></i></span>
              <h4>{c.title}</h4>
              <p>{c.body}</p>
            </div>
          ))}
        </div>

        <SectionCta section={s.intro} />
      </div>
      </section>
    </>
  )
}
