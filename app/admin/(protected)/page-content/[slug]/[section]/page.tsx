import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PAGES } from '@/lib/page-sections-config'
import { ITEM_SECTIONS } from '@/lib/page-section-items-config'
import { getSectionItemsForAdmin } from '@/lib/page-section-items'
import { getMediaLibrary } from '@/lib/media'
import SectionItemsEditor from '@/components/admin/SectionItemsEditor'

export default async function EditSectionItems({
  params,
}: {
  params: Promise<{ slug: string; section: string }>
}) {
  const { slug, section } = await params
  const page = PAGES.find((p) => p.slug === slug)
  const meta = ITEM_SECTIONS[slug]?.[section]

  if (!page || !meta) notFound()

  const items = await getSectionItemsForAdmin(slug, section)
  // Only fetch the media library for sections whose icon can be a photo.
  const mediaItems = meta.iconAsImage ? await getMediaLibrary() : []

  return (
    <>
      <Link
        href={`/admin/page-content/${slug}`}
        style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}
      >
        ← Back to {page.label} Page
      </Link>
      <h1 style={{ marginTop: 8 }}>{meta.label}</h1>
      <p className="page-subtitle">
        Drag the handle to reorder. Changes appear on the live site after saving.
      </p>
      <SectionItemsEditor
        pageSlug={slug}
        sectionKey={section}
        items={items}
        mediaItems={mediaItems}
      />
    </>
  )
}
