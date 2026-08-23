import type { Metadata } from 'next'
import Link from 'next/link'
import { getPageSections } from '@/lib/page-sections'
import { getPageItems } from '@/lib/page-section-items'
import { SectionTag } from '@/components/SectionCta'

export const metadata: Metadata = {
  description:
    "Gardner School of Multiple Intelligences offers Preschool, Elementary, Junior High, and Special Education, guided by Howard Gardner's theory of multiple intelligences.",
}

export default async function ProgramsPage() {
  const [s, items] = await Promise.all([getPageSections('programs'), getPageItems('programs')])

  return (
    <section className="page-top">
      <div className="container">
        <SectionTag icon="fas fa-book-open" label={s.intro.tag} />
        <h2 className="section-title">{s.intro.title}</h2>
        <p className="section-subtitle">{s.intro.subtitle}</p>

        <div className="card-grid">
          {items.levels?.map((lvl, i) => (
            <div className="card reveal" id={lvl.anchor_id ?? undefined} key={lvl.id ?? i}>
              <h4>
                <i className={lvl.icon ?? ''} aria-hidden="true" style={{ color: 'var(--red)', marginRight: 8 }}></i>
                {lvl.title}
              </h4>
              <p>{lvl.body}</p>
            </div>
          ))}
        </div>

        {items.note?.map((n, i) => (
          <div className="card reveal" style={{ marginTop: 24, background: '#f3efe4', border: '1px dashed var(--border)' }} key={n.id ?? i}>
            <h4>
              <i className={n.icon ?? ''} aria-hidden="true" style={{ color: 'var(--navy)', marginRight: 8 }}></i>
              {n.title}
            </h4>
            {/* body / link / body_suffix keeps the link mid-sentence */}
            <p>
              {n.body}
              {n.link_text && (
                <Link href={n.link_href ?? '#'} style={{ color: 'var(--red)', fontWeight: 600 }}>
                  {n.link_text}
                </Link>
              )}
              {n.body_suffix}
            </p>
          </div>
        ))}

        <div style={{ marginTop: 50 }}>
          <SectionTag icon="fas fa-puzzle-piece" label={s.framework.tag} />
          <h2 className="section-title">{s.framework.title}</h2>
          <p className="section-subtitle">{s.framework.subtitle}</p>
          <div className="card-grid">
            {items.framework?.map((f, i) => (
              <div className="card reveal framework-card" key={f.id ?? i}>
                <h4>{f.title}</h4>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
