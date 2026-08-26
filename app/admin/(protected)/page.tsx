import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getCounts() {
  const supabase = await createClient()

  // pages/gallery_images have zero RLS policies until their modules are
  // built, so these counts only work because this Server Component runs
  // inside the already-authenticated /admin context — see the schema
  // migration's comments for why that's the intended, safe behavior.
  // media/faculty/news/resources are the exceptions: they have real SELECT
  // policies now that their modules are built, but the count works the same
  // way either way.
  const [media, pages, news, faculty, resources, galleryImages, inquiries, unread] =
    await Promise.all([
      supabase.from('media').select('*', { count: 'exact', head: true }),
      supabase.from('pages').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*', { count: 'exact', head: true }),
      supabase.from('faculty').select('*', { count: 'exact', head: true }),
      supabase.from('resources').select('*', { count: 'exact', head: true }),
      supabase.from('gallery_images').select('*', { count: 'exact', head: true }),
      supabase.from('contact_inquiries').select('*', { count: 'exact', head: true }),
      supabase
        .from('contact_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false),
    ])

  return {
    media: media.count ?? 0,
    pages: pages.count ?? 0,
    news: news.count ?? 0,
    faculty: faculty.count ?? 0,
    resources: resources.count ?? 0,
    galleryImages: galleryImages.count ?? 0,
    inquiries: inquiries.count ?? 0,
    unreadInquiries: unread.count ?? 0,
  }
}

async function getLastUpdated() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('website_settings')
    .select('updated_at')
    .eq('id', 1)
    .single()
  return data?.updated_at ?? null
}

export default async function DashboardPage() {
  const [counts, lastUpdated] = await Promise.all([getCounts(), getLastUpdated()])

  const stats: {
    label: string
    value: number
    icon: string
    accent: string
    href?: string
    badge?: string | null
  }[] = [
    { label: 'News Articles', value: counts.news, icon: 'fa-newspaper', accent: '#d1232a', href: '/admin/news' },
    { label: 'Faculty Members', value: counts.faculty, icon: 'fa-chalkboard-user', accent: '#059669', href: '/admin/faculty' },
    { label: 'Documents', value: counts.resources, icon: 'fa-file-lines', accent: '#d97706', href: '/admin/resources' },
    {
      label: 'Inquiries',
      value: counts.inquiries,
      icon: 'fa-inbox',
      accent: '#7c3aed',
      href: '/admin/inquiries',
      badge: counts.unreadInquiries > 0 ? `${counts.unreadInquiries} new` : null,
    },
    { label: 'Media Files', value: counts.media, icon: 'fa-images', accent: '#2563eb', href: '/admin/media' },
    { label: 'Gallery Images', value: counts.galleryImages, icon: 'fa-panorama', accent: '#db2777' },
    { label: 'Pages', value: counts.pages, icon: 'fa-file', accent: '#0891b2' },
  ]

  const quickActions = [
    { label: 'Website Settings', icon: 'fa-gear', href: '/admin/settings' },
    { label: 'Page Content', icon: 'fa-file-lines', href: '/admin/page-content' },
    { label: 'Add News', icon: 'fa-plus', href: '/admin/news/new' },
    { label: 'Add Faculty', icon: 'fa-plus', href: '/admin/faculty/new' },
    { label: 'Add Resource', icon: 'fa-plus', href: '/admin/resources/new' },
  ]

  return (
    <>
      <h1>Dashboard</h1>
      <p className="page-subtitle">Overview of your school website content.</p>

      <div className="admin-stats-grid">
        {stats.map((s) => {
          const inner = (
            <>
              <span
                className="admin-stat-icon"
                style={{
                  background: `color-mix(in srgb, ${s.accent} 12%, #fff)`,
                  color: s.accent,
                }}
              >
                <i className={`fas ${s.icon}`} aria-hidden="true"></i>
              </span>
              <div className="admin-stat-body">
                <div className="value">{s.value}</div>
                <div className="label">
                  {s.label}
                  {s.badge && <span className="admin-stat-badge">{s.badge}</span>}
                </div>
              </div>
            </>
          )
          return s.href ? (
            <Link
              href={s.href}
              className="admin-stat-card admin-stat-link"
              key={s.label}
              style={{ ['--stat-acc' as string]: s.accent }}
            >
              {inner}
            </Link>
          ) : (
            <div
              className="admin-stat-card"
              key={s.label}
              style={{ ['--stat-acc' as string]: s.accent }}
            >
              {inner}
            </div>
          )
        })}
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Quick Actions</h2>
        <div className="admin-quick-actions">
          {quickActions.map((a) => (
            <Link href={a.href} className="admin-quick-action" key={a.label}>
              <i className={`fas ${a.icon}`} aria-hidden="true"></i>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <h2>Recent Activity</h2>
        {lastUpdated ? (
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
            Website Settings last updated{' '}
            {new Date(lastUpdated).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
            .
          </p>
        ) : (
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
            No activity yet.
          </p>
        )}
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', marginTop: 12 }}>
          Section headings across the public pages are editable under Page
          Content. Gallery is scheduled for a future phase, and the Pages
          count stays 0 — full rich-text page bodies aren&apos;t built yet.
        </p>
      </div>
    </>
  )
}
