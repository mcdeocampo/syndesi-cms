import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PAGES, SECTION_DEFAULTS, getPageSections } from '@/lib/page-sections'
import PageSectionsForm from '@/components/admin/PageSectionsForm'

export default async function EditPageContent({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = PAGES.find((p) => p.slug === slug)

  if (!page || !SECTION_DEFAULTS[slug]) notFound()

  const sections = await getPageSections(slug)

  return (
    <>
      <Link
        href="/admin/page-content"
        style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}
      >
        ← Back to Page Content
      </Link>
      <h1 style={{ marginTop: 8 }}>{page.label} Page</h1>
      <p className="page-subtitle">
        Changes appear on the live site immediately after saving.
      </p>
      <PageSectionsForm pageSlug={slug} pageLabel={page.label} sections={sections} />
    </>
  )
}
