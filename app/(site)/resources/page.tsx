import type { Metadata } from 'next'
import { getPublishedResources } from '@/lib/resources'
import { getPageSections } from '@/lib/page-sections'
import SectionCta from '@/components/SectionCta'
import PageBanner from '@/components/PageBanner'

export const metadata: Metadata = {
  description:
    'Forms, handbooks, and policy information for Syndesi School families.',
}

function fileIcon(fileType: string | null): string {
  if (!fileType) return 'fa-file-alt'
  if (fileType === 'application/pdf') return 'fa-file-pdf'
  if (fileType.includes('word')) return 'fa-file-word'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fa-file-excel'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint'
  if (fileType.startsWith('image/')) return 'fa-file-image'
  return 'fa-file-alt'
}

export default async function ResourcesPage() {
  const [resources, s] = await Promise.all([
    getPublishedResources(),
    getPageSections('resources'),
  ])

  return (
    <>
      <PageBanner
        icon="fas fa-download"
        tag={s.intro.tag}
        title={s.intro.title}
        subtitle={s.intro.subtitle}
      />
      <section className="page-body">
      <div className="container">
        {resources.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
            {s.intro.empty_text}
          </p>
        ) : (
          <div className="card-grid">
            {resources.map((r) => (
              <div className="card reveal" key={r.id}>
                {r.category && <span className="news-category-badge">{r.category}</span>}
                <h4>
                  <i
                    className={`fas ${fileIcon(r.file_type)}`}
                    aria-hidden="true"
                    style={{ color: 'var(--red)', marginRight: 8 }}
                  ></i>
                  {r.title}
                </h4>
                {r.description && <p>{r.description}</p>}
                {r.file_url ? (
                  <a href={r.file_url} target="_blank" rel="noopener" className="card-learn-more">
                    Download <i className="fas fa-arrow-down" aria-hidden="true"></i>
                  </a>
                ) : (
                  <span style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <i className="fas fa-map-marker-alt" aria-hidden="true"></i> Available at the school office
                  </span>
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
