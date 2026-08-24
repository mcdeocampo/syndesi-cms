// A titled header band shown at the top of each inner page, replacing the bare
// heading-on-cream. Full-width navy gradient with the page's tag, title, and
// (optional) subtitle -- gives every page a designed, intentional header.
// Content is CMS-driven (passed in from each page's page_sections intro).
export default function PageBanner({
  icon,
  tag,
  title,
  subtitle,
}: {
  icon: string
  tag: string | null
  title: string | null
  subtitle?: string | null
}) {
  return (
    <section className="page-banner">
      <div className="container">
        {tag && (
          <span className="page-banner-tag">
            <i className={icon} aria-hidden="true"></i> {tag}
          </span>
        )}
        {title && <h1 className="page-banner-title">{title}</h1>}
        {subtitle && <p className="page-banner-subtitle">{subtitle}</p>}
      </div>
    </section>
  )
}
