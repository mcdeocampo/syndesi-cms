import type { Metadata } from 'next'
import { getPublishedFaculty } from '@/lib/faculty'
import { getPageSections } from '@/lib/page-sections'
import SectionCta, { SectionTag } from '@/components/SectionCta'

export const metadata: Metadata = {
  description: 'Meet the faculty and staff of Gardner School of Multiple Intelligences.',
}

export default async function FacultyPage() {
  const [faculty, s] = await Promise.all([getPublishedFaculty(), getPageSections('faculty')])

  return (
    <section className="page-top">
      <div className="container">
        <SectionTag icon="fas fa-chalkboard-teacher" label={s.intro.tag} />
        <h2 className="section-title">{s.intro.title}</h2>
        <p className="section-subtitle">{s.intro.subtitle}</p>

        {faculty.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
            {s.intro.empty_text}
          </p>
        ) : (
          <div className="card-grid">
            {faculty.map((member) => (
              <div className="card reveal faculty-card" style={{ textAlign: 'center' }} key={member.id}>
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.full_name} className="faculty-photo" />
                ) : (
                  <i className="fas fa-user-graduate" aria-hidden="true" style={{ fontSize: '3rem', color: 'var(--red)' }}></i>
                )}
                <h4>{member.full_name}</h4>
                <p>{member.position ?? member.department ?? ''}</p>
                {member.biography && (
                  <details className="faculty-bio">
                    <summary>Read Bio <i className="fas fa-arrow-right" aria-hidden="true"></i></summary>
                    <p>{member.biography}</p>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <SectionCta section={s.intro} />
      </div>
    </section>
  )
}
