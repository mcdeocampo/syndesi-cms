import type { Metadata } from 'next'
import { getPageSections } from '@/lib/page-sections'
import { getSiteSettings, SOCIAL_LINKS, splitList } from '@/lib/settings'
import PageBanner from '@/components/PageBanner'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  description:
    'Get in touch with Syndesi School in Batangas City, Batangas. Phone, email, and address.',
}

export default async function ContactPage() {
  // School name, address, phone, email, office hours and social links all come
  // from Website Settings -- this page used to hardcode its own copies, which
  // had already drifted (it showed contact@ while settings held info@).
  const [s, settings] = await Promise.all([getPageSections('contact'), getSiteSettings()])

  // Phone and email can each hold several values (one per line in the CMS);
  // office hours stays a single value. Each detail hides itself when its
  // setting is blank, so clearing a value never leaves an empty labelled row.
  // `link` turns each value into a tel:/mailto: anchor; hours has none.
  const phones = splitList(settings.contact_number)
  const emails = splitList(settings.email)
  const details = [
    phones.length > 0 && {
      cls: 'phone',
      icon: 'fas fa-phone-alt',
      label: 'Phone',
      values: phones,
      link: (v: string) => `tel:${v.replace(/\s/g, '')}`,
    },
    emails.length > 0 && {
      cls: 'email',
      icon: 'fas fa-envelope',
      label: 'Email',
      values: emails,
      link: (v: string) => `mailto:${v}`,
    },
    settings.office_hours && {
      cls: 'hours',
      icon: 'fas fa-clock',
      label: 'Office Hours',
      values: [settings.office_hours],
      link: null,
    },
  ].filter(Boolean) as {
    cls: string
    icon: string
    label: string
    values: string[]
    link: ((v: string) => string) | null
  }[]

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
                    {d.values.map((v) =>
                      d.link ? (
                        <a key={v} href={d.link(v)} className="contact-detail-value">
                          {v}
                        </a>
                      ) : (
                        <span key={v} className="contact-detail-value">
                          {v}
                        </span>
                      )
                    )}
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
            <ContactForm />
          </div>
        </div>
      </div>
      </section>
    </>
  )
}
