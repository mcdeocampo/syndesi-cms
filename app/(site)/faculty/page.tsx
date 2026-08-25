import type { Metadata } from 'next'
import { getPublishedFaculty } from '@/lib/faculty'
import { getPageSections } from '@/lib/page-sections'
import SectionCta from '@/components/SectionCta'
import PageBanner from '@/components/PageBanner'

export const metadata: Metadata = {
  description: 'Meet the faculty and staff of Syndesi School.',
}

export default async function FacultyPage() {
  const [faculty, s] = await Promise.all([getPublishedFaculty(), getPageSections('faculty')])

  return (
    <>
      <PageBanner
        icon="fas fa-chalkboard-teacher"
        tag={s.intro.tag}
        title={s.intro.title}
        subtitle={s.intro.subtitle}
      />
      <section className="page-body">
      <div className="container">
        {faculty.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
            {s.intro.empty_text}
          </p>
        ) : (
          <div className="card-grid">
            {faculty.map((member) => (
              <div className="card reveal faculty-card" key={member.id}>
                <div className="faculty-photo-ring">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.full_name} className="faculty-photo" />
                  ) : (
                    <span className="faculty-fallback">
                      <i className="fas fa-user-graduate" aria-hidden="true"></i>
                    </span>
                  )}
                </div>
                <h4>{member.full_name}</h4>
                {(member.position || member.department) && (
                  <p className="faculty-role">
                    <i
                      className={member.icon?.trim() ? member.icon.trim() : 'fas fa-user-tie'}
                      aria-hidden="true"
                    ></i>
                    {member.position ?? member.department}
                  </p>
                )}
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
    </>
  )
}
