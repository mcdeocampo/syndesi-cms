import Link from 'next/link'
import type { PageSection } from '@/lib/page-sections-config'

// An admin-entered href can be an internal route ('/contact'), a same-page
// anchor ('#programs'), or an external site ('https://facebook.com/...').
// next/link is only correct for the first; the other two need a plain <a>,
// and external links additionally need rel="noopener" with target="_blank".
export function SmartLink({
  href,
  className,
  style,
  children,
}: {
  href: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const isExternal = /^https?:\/\//i.test(href)
  const isAnchor = href.startsWith('#')

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener" className={className} style={style}>
        {children}
      </a>
    )
  }
  if (isAnchor) {
    return (
      <a href={href} className={className} style={style}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  )
}

// The small pill above a section heading. Rendered as a component rather than
// inline JSX because it can't be collapsed from CSS when its label is cleared:
// the decorative <i> means :empty never matches, and :only-child ignores text
// nodes. Hiding it has to be a render-time decision.
export function SectionTag({
  label,
  icon,
  style,
}: {
  label: string | null
  icon: string
  style?: React.CSSProperties
}) {
  if (!label) return null
  return (
    <span className="section-tag" style={style}>
      <i className={icon} aria-hidden="true"></i> {label}
    </span>
  )
}

// The closing block shared by most pages: an optional note paragraph followed
// by an optional call-to-action button. Both are driven by page_sections, and
// each hides itself when its copy is cleared in the CMS -- so an admin can
// remove either without leaving an empty gap behind.
export default function SectionCta({
  section,
  marginTop = 40,
}: {
  section: PageSection
  marginTop?: number
}) {
  const hasNote = Boolean(section.footnote)
  const hasButton = Boolean(section.link_text && section.link_href)
  if (!hasNote && !hasButton) return null

  return (
    <div style={{ marginTop, textAlign: 'center' }}>
      {hasNote && <p style={{ color: 'var(--text-muted)' }}>{section.footnote}</p>}
      {hasButton && (
        <SmartLink
          href={section.link_href!}
          className="btn-primary"
          style={hasNote ? { marginTop: 16 } : undefined}
        >
          {section.link_icon && (
            <i className={section.link_icon} aria-hidden="true" style={{ marginRight: 8 }}></i>
          )}
          {section.link_text}
        </SmartLink>
      )}
    </div>
  )
}
