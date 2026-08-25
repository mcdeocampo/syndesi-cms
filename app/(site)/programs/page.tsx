import type { Metadata } from 'next'
import Link from 'next/link'
import { getPageSections } from '@/lib/page-sections'
import { getPageItems } from '@/lib/page-section-items'
import { SectionTag } from '@/components/SectionCta'
import PageBanner from '@/components/PageBanner'

export const metadata: Metadata = {
  description:
    "Syndesi School offers Preschool, Elementary, Junior High, and Special Education, guided by Howard Gardner's theory of multiple intelligences.",
}

export default async function ProgramsPage() {
  const [s, items] = await Promise.all([getPageSections('programs'), getPageItems('programs')])

  return (
    <>
      <PageBanner
        icon="fas fa-book-open"
        tag={s.intro.tag}
        title={s.intro.title}
        subtitle={s.intro.subtitle}
      />
      <section className="page-body">
      <div className="container">
        <div className="card-grid">
          {items.levels?.map((lvl, i) => (
            <div className="program-card reveal" id={lvl.anchor_id ?? undefined} key={lvl.id ?? i}>
              <span className="program-icon">
                <i className={lvl.icon ?? ''} aria-hidden="true"></i>
              </span>
              <h4>{lvl.title}</h4>
              <p>{lvl.body}</p>
            </div>
          ))}
        </div>

        {items.note?.map((n, i) => (
          <div className="program-note reveal" key={n.id ?? i}>
            <span className="program-note-icon">
              <i className={n.icon ?? ''} aria-hidden="true"></i>
            </span>
            <div>
              <h4>{n.title}</h4>
              {/* body / link / body_suffix keeps the link mid-sentence */}
              <p>
                {n.body}
                {n.link_text && (
                  <Link href={n.link_href ?? '#'}>{n.link_text}</Link>
                )}
                {n.body_suffix}
              </p>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 50 }}>
          <SectionTag icon="fas fa-puzzle-piece" label={s.framework.tag} />
          <h2 className="section-title">{s.framework.title}</h2>
          <p className="section-subtitle">{s.framework.subtitle}</p>
          <div className="card-grid">
            {items.framework?.map((f, i) => (
              <div className="card reveal accent-card" key={f.id ?? i}>
                <h4>{f.title}</h4>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </section>
    </>
  )
}
