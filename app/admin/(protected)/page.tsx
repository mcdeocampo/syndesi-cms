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
  const [media, pages, news, faculty, resources, galleryImages] = await Promise.all([
    supabase.from('media').select('*', { count: 'exact', head: true }),
    supabase.from('pages').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true }),
    supabase.from('faculty').select('*', { count: 'exact', head: true }),
    supabase.from('resources').select('*', { count: 'exact', head: true }),
    supabase.from('gallery_images').select('*', { count: 'exact', head: true }),
  ])

  return {
    media: media.count ?? 0,
    pages: pages.count ?? 0,
    news: news.count ?? 0,
    faculty: faculty.count ?? 0,
    resources: resources.count ?? 0,
    galleryImages: galleryImages.count ?? 0,
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

  const stats = [
    { label: 'Total Media Files', value: counts.media },
    { label: 'Total Pages', value: counts.pages },
    { label: 'Total News Articles', value: counts.news },
    { label: 'Total Faculty Members', value: counts.faculty },
    { label: 'Total Documents', value: counts.resources },
    { label: 'Total Gallery Images', value: counts.galleryImages },
  ]

  return (
    <>
      <h1>Dashboard</h1>
      <p className="page-subtitle">Overview of your school website content.</p>

      <div className="admin-stats-grid">
        {stats.map((s) => (
          <div className="admin-stat-card" key={s.label}>
            <div className="value">{s.value}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
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
