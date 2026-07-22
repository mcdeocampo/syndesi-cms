import { getMediaLibrary } from '@/lib/media'
import FacultyForm from '@/components/admin/FacultyForm'

export default async function NewFacultyPage() {
  const mediaItems = await getMediaLibrary()

  return (
    <>
      <h1>Add Faculty Member</h1>
      <p className="page-subtitle">Create a new faculty or staff profile.</p>
      <FacultyForm mediaItems={mediaItems} />
    </>
  )
}
