'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { WebsiteSettings } from '@/lib/settings'

const NAV_LINKS: [string, string][] = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/admissions', 'Admissions'],
  ['/programs', 'Programs'],
  ['/student-life', 'Student Life'],
  ['/faculty', 'Faculty'],
  ['/news', 'News'],
  ['/resources', 'Resources'],
]

export default function Header({ settings }: { settings: WebsiteSettings }) {
  const pathname = usePathname()

  return (
    <nav id="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
          <img
            src={settings.logo_url || '/images/syndesi-logo-web.png'}
            alt={`${settings.school_name} crest`}
          />
          <span>{settings.school_name}</span>
        </Link>
        <ul className="nav-links" id="navLinks">
          {NAV_LINKS.map(([href, label]) => (
            <li key={href}>
              <Link href={href} className={pathname === href ? 'active' : ''}>
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/contact"
              className={`nav-cta${pathname === '/contact' ? ' active' : ''}`}
            >
              Contact
            </Link>
          </li>
        </ul>
        <button className="hamburger" id="hamburger" aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}
