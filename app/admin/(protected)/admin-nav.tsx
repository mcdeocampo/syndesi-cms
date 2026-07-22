'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Only Dashboard + Website Settings are real destinations in Phase 1. The
// rest are listed (per the full CMS spec) but disabled — the modules don't
// exist yet, and a nav item that 404s or silently does nothing is worse
// than one that's honestly marked "coming soon".
const NAV_ITEMS: { href: string; label: string; icon: string; enabled: boolean }[] = [
  { href: '/admin', label: 'Dashboard', icon: 'fa-gauge', enabled: true },
  { href: '/admin/settings', label: 'Website Settings', icon: 'fa-gear', enabled: true },
  { href: '/admin/page-content', label: 'Page Content', icon: 'fa-file-lines', enabled: true },
  { href: '/admin/news', label: 'News', icon: 'fa-newspaper', enabled: true },
  { href: '/admin/faculty', label: 'Faculty', icon: 'fa-chalkboard-user', enabled: true },
  { href: '/admin/resources', label: 'Resources', icon: 'fa-download', enabled: true },
  { href: '/admin/media', label: 'Media Library', icon: 'fa-images', enabled: true },
  { href: '#', label: 'Gallery', icon: 'fa-panorama', enabled: false },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <ul className="admin-nav">
      {NAV_ITEMS.map((item) =>
        item.enabled ? (
          <li key={item.href}>
            <Link href={item.href} className={pathname === item.href ? 'active' : ''}>
              <i className={`fas ${item.icon}`} aria-hidden="true"></i> {item.label}
            </Link>
          </li>
        ) : (
          <li key={item.label}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.35)',
                cursor: 'default',
              }}
              title="Coming in a future phase"
            >
              <i className={`fas ${item.icon}`} aria-hidden="true"></i> {item.label}
            </span>
          </li>
        )
      )}
    </ul>
  )
}
