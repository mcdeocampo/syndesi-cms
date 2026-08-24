import type { Metadata } from 'next'
import { getPageSections } from '@/lib/page-sections'
import { getSiteSettings, SOCIAL_LINKS } from '@/lib/settings'
import PageBanner from '@/components/PageBanner'

export const metadata: Metadata = {
  description:
    'Get in touch with Syndesi School in Batangas City, Batangas. Phone, email, and address.',
}

export default async function ContactPage() {
  // School name, address, phone, email, office hours and social links all come
  // from Website Settings -- this page used to hardcode its own copies, which
  // had already drifted (it showed contact@ while settings held info@).
  const [s, settings] = await Promise.all([getPageSections('contact'), getSiteSettings()])

  // Each detail hides itself when its setting is blank, so clearing a value in
  // the CMS never leaves an empty labelled row behind.
  const details = [
    settings.contact_number && {
      cls: 'phone',
      icon: 'fas fa-phone-alt',
      label: 'Phone',
      value: settings.contact_number,
    },
    settings.email && {
      cls: 'email',
      icon: 'fas fa-envelope',
      label: 'Email',
      value: settings.email,
    },
    settings.office_hours && {
      cls: 'hours',
      icon: 'fas fa-clock',
      label: 'Office Hours',
      value: settings.office_hours,
    },
  ].filter(Boolean) as { cls: string; icon: string; label: string; value: string }[]

  return (
    <>
      <PageBanner
        icon="fas fa-paper-plane"
        tag={s.intro.tag}
        title={s.intro.title}
        subtitle={s.intro.subtitle}
      />
      <section className="page-body">
      <div className="container">
        <div className="two-col-grid contact-grid" style={{ gap: 28 }}>
          {/* Contact information card */}
          <div className="contact-info-card">
            <h3 className="contact-panel-title">{s.info.title}</h3>
            <p className="contact-address" style={{ whiteSpace: 'pre-line' }}>
              <strong>{settings.school_name}</strong>
              {settings.address ? `\n${settings.address}` : ''}
            </p>

            <ul className="contact-details">
              {details.map((d) => (
                <li className="contact-detail" key={d.label}>
                  <span className={`contact-detail-icon ${d.cls}`}>
                    <i className={d.icon} aria-hidden="true"></i>
                  </span>
                  <div>
                    <span className="contact-detail-label">{d.label}</span>
                    <span className="contact-detail-value">{d.value}</span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Each network is a real link when its URL is set in Website
                Settings, or a greyed "coming soon" placeholder otherwise. */}
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

          {/* Message form card */}
          <div className="contact-form-card">
            <h3 className="contact-panel-title">Send us a message</h3>
            <form className="contact-form" id="contactForm">
              <label htmlFor="contactName" style={{ display: 'none' }}>Name</label>
              <input type="text" id="contactName" placeholder="Name" required />
              <label htmlFor="contactEmail" style={{ display: 'none' }}>Email</label>
              <input type="email" id="contactEmail" placeholder="Email" required />
              <label htmlFor="contactSubject" style={{ display: 'none' }}>Subject</label>
              <input type="text" id="contactSubject" placeholder="Subject" />
              <label htmlFor="contactMessage" style={{ display: 'none' }}>Message</label>
              <textarea id="contactMessage" placeholder="Message" required></textarea>
              <button type="submit" className="btn-primary">
                <i className="fas fa-paper-plane" aria-hidden="true"></i> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      </section>
    </>
  )
}
