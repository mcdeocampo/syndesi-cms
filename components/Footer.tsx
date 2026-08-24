import Link from 'next/link'
import { splitList, type WebsiteSettings } from '@/lib/settings'

export default function Footer({ settings }: { settings: WebsiteSettings }) {
  // Footer contact can be set separately; when a footer field is blank it
  // falls back to the shared Contact page value. Phone/email each allow
  // several values (one per line).
  const footerAddress = settings.footer_address ?? settings.address
  const phones = splitList(settings.footer_contact_number ?? settings.contact_number)
  const emails = splitList(settings.footer_email ?? settings.email)

  // Admins can write {year} in the Copyright field and it resolves to the
  // current year on every render, so the notice can't silently go stale in
  // January. A literal year typed instead still works untouched.
  const copyright = settings.copyright_text?.replace(
    /\{year\}/gi,
    String(new Date().getFullYear())
  )

  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <img
              src={settings.logo_url || '/images/syndesi-logo-web.png'}
              alt={`${settings.school_name} crest`}
              className="footer-logo-img"
            />
            <span className="footer-logo-text">{settings.school_name}</span>
          </div>
          <p>{settings.footer_text}</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/admissions">Admissions</Link></li>
            <li><Link href="/programs">Programs</Link></li>
            <li><Link href="/news">News</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>More</h4>
          <ul className="footer-links">
            <li><Link href="/student-life">Student Life</Link></li>
            <li><Link href="/faculty">Faculty</Link></li>
            <li><Link href="/resources">Resources</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul className="footer-contact">
            {footerAddress && (
              <li>
                <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
                <span>{footerAddress}</span>
              </li>
            )}
            {phones.map((phone) => (
              <li key={phone}>
                <i className="fas fa-phone-alt" aria-hidden="true"></i>
                <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
              </li>
            ))}
            {emails.map((email) => (
              <li key={email}>
                <i className="fas fa-envelope" aria-hidden="true"></i>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Skip the bar entirely when there's no copyright text, rather than
          rendering an empty strip below the divider. */}
      {copyright && (
        <div className="footer-bottom">
          <p>{copyright}</p>
        </div>
      )}
    </footer>
  )
}
