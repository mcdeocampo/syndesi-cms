import type { Metadata } from 'next'
import { getPublishedResources } from '@/lib/resources'
import { getPageSections } from '@/lib/page-sections'
import { SmartLink } from '@/components/SectionCta'
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
              <div className="resource-card reveal" key={r.id}>
                <span className="resource-icon">
                  {/* Custom icon (a full Font Awesome class) if set, else one
                      derived from the file type. */}
                  <i
                    className={r.icon?.trim() ? r.icon.trim() : `fas ${fileIcon(r.file_type)}`}
                    aria-hidden="true"
                  ></i>
                </span>
                {r.category && <span className="resource-kicker">{r.category}</span>}
                <h4>{r.title}</h4>
                <span className="resource-underline" aria-hidden="true"></span>
                {r.description && <p>{r.description}</p>}
                {r.file_url ? (
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener"
                    className="resource-foot resource-foot-link"
                  >
                    <span>
                      <i className="fas fa-download" aria-hidden="true"></i> Download
                    </span>
                    <i className="fas fa-arrow-right" aria-hidden="true"></i>
                  </a>
                ) : (
                  <div className="resource-foot">
                    <span>
                      <i className="fas fa-map-marker-alt" aria-hidden="true"></i> Available at the
                      school office
                    </span>
                    <i className="fas fa-arrow-right" aria-hidden="true"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* "Can't find what you need?" help banner. The button (text + link) is
            CMS-driven via the Resources intro; the surrounding copy is fixed. */}
        {s.intro.link_text && s.intro.link_href && (
          <div className="resource-help">
            <span className="resource-help-icon">
              <i className="fas fa-comments" aria-hidden="true"></i>
            </span>
            <div className="resource-help-text">
              <h3>Can&rsquo;t find what you need?</h3>
              <p>
                Our school office is here to help you. Reach out to us for any documents or
                information.
              </p>
            </div>
            <SmartLink href={s.intro.link_href} className="btn-primary resource-help-btn">
              <i className="fas fa-envelope" aria-hidden="true" style={{ marginRight: 8 }}></i>
              {s.intro.link_text}
            </SmartLink>
          </div>
        )}
      </div>
      </section>
    </>
  )
}
