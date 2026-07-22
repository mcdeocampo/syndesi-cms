import { getMediaLibrary } from '@/lib/media'
import MediaLibrary from '@/components/admin/MediaLibrary'

export default async function MediaPage() {
  const items = await getMediaLibrary()

  return (
    <>
      <h1>Media Library</h1>
      <p className="page-subtitle">
        Upload and manage images used across the website.
      </p>
      <MediaLibrary items={items} />
    </>
  )
}
