import Link from 'next/link'
import { splitList, type WebsiteSettings } from '@/lib/settings'

export default function Footer({ settings }: { settings: WebsiteSettings }) {
  // Phone and email can each list several values (one per line in the CMS).
  const phones = splitList(settings.contact_number)
  const emails = splitList(settings.email)

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
            {settings.address && (
              <li>
                <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
                <span>{settings.address}</span>
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
