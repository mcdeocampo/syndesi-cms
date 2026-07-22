import { notFound } from 'next/navigation'
import { getNewsById } from '@/lib/news'
import { getMediaLibrary } from '@/lib/media'
import NewsForm from '@/components/admin/NewsForm'

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [article, mediaItems] = await Promise.all([getNewsById(id), getMediaLibrary()])

  if (!article) notFound()

  return (
    <>
      <h1>Edit Article</h1>
      <p className="page-subtitle">Update this news article.</p>
      <NewsForm article={article} mediaItems={mediaItems} />
    </>
  )
}
