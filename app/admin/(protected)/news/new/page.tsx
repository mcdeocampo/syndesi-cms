import { getMediaLibrary } from '@/lib/media'
import NewsForm from '@/components/admin/NewsForm'

export default async function NewNewsPage() {
  const mediaItems = await getMediaLibrary()

  return (
    <>
      <h1>Add Article</h1>
      <p className="page-subtitle">Create a new news article or announcement.</p>
      <NewsForm mediaItems={mediaItems} />
    </>
  )
}
