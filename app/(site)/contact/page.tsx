import type { Metadata } from 'next'
import { getPageSections } from '@/lib/page-sections'
import { getSiteSettings, SOCIAL_LINKS } from '@/lib/settings'
import { SectionTag } from '@/components/SectionCta'

export const metadata: Metadata = {
  description:
    'Get in touch with Gardner School of Multiple Intelligences in San Antonio, San Pascual, Batangas. Phone, email, and address.',
}

export default async function ContactPage() {
  // School name, address, phone, email, office hours and social links all come
  // from Website Settings -- this page used to hardcode its own copies, which
  // had already drifted (it showed contact@ while settings held info@).
  const [s, settings] = await Promise.all([getPageSections('contact'), getSiteSettings()])

  return (
    <section className="page-top">
      <div className="container">
        <SectionTag icon="fas fa-paper-plane" label={s.intro.tag} />
        <h2 className="section-title">{s.intro.title}</h2>
        <p className="section-subtitle">{s.intro.subtitle}</p>

        <div className="two-col-grid" style={{ gap: 48 }}>
          <div>
            <h3 style={{ color: 'var(--navy)', fontSize: '1.4rem', marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>{s.info.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, whiteSpace: 'pre-line' }}>
              <strong>{settings.school_name}</strong>
              {settings.address ? `\n${settings.address}` : ''}
            </p>
            {/* Each row hides itself when its setting is blank, so clearing a
                detail in the CMS doesn't leave an empty labelled row behind. */}
            {settings.contact_number && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <i className="fas fa-phone-alt" aria-hidden="true" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(22,34,92,0.06)', borderRadius: 12, color: 'var(--navy)' }}></i>
                <div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</div><div style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{settings.contact_number}</div></div>
              </div>
            )}
            {settings.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <i className="fas fa-envelope" aria-hidden="true" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(22,34,92,0.06)', borderRadius: 12, color: 'var(--navy)' }}></i>
                <div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div><div style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{settings.email}</div></div>
              </div>
            )}
            {settings.office_hours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <i className="fas fa-clock" aria-hidden="true" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(22,34,92,0.06)', borderRadius: 12, color: 'var(--navy)' }}></i>
                <div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Office Hours</div><div style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{settings.office_hours}</div></div>
              </div>
            )}
            {/* All four networks are treated identically: a real link when its
                URL is set in Website Settings, a greyed "coming soon"
                placeholder when it isn't. Previously Facebook vanished
                entirely when unset while the others left placeholders, which
                made the row shift around depending on what was filled in. */}
            <div className="contact-social-row">
              {SOCIAL_LINKS.map(({ key, name, icon }) => {
                const url = settings[key]
                return url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener"
                    aria-label={`${settings.school_name} on ${name}`}
                    className="contact-social-icon"
                  >
                    <i className={icon} aria-hidden="true"></i>
                  </a>
                ) : (
                  <span
                    key={key}
                    className="contact-social-icon placeholder"
                    title={`${name} (coming soon)`}
                    aria-label={`${name} (coming soon)`}
                  >
                    <i className={icon} aria-hidden="true"></i>
                  </span>
                )
              })}
            </div>
          </div>

          <form className="contact-form" id="contactForm">
            <label htmlFor="contactName" style={{ display: 'none' }}>Name</label>
            <input type="text" id="contactName" placeholder="Name" required />
            <label htmlFor="contactEmail" style={{ display: 'none' }}>Email</label>
            <input type="email" id="contactEmail" placeholder="Email" required />
            <label htmlFor="contactSubject" style={{ display: 'none' }}>Subject</label>
            <input type="text" id="contactSubject" placeholder="Subject" />
            <label htmlFor="contactMessage" style={{ display: 'none' }}>Message</label>
            <textarea id="contactMessage" placeholder="Message" required></textarea>
            {/* No inline width: an inline style outranks the stylesheet, so a
                hardcoded width:100% here made this the one button on the site
                that ignored the shared sizing. It follows .btn-primary now. */}
            <button type="submit" className="btn-primary">
              <i className="fas fa-paper-plane" aria-hidden="true"></i> Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
