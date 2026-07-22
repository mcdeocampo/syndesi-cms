import { notFound } from 'next/navigation'
import { getFacultyById } from '@/lib/faculty'
import { getMediaLibrary } from '@/lib/media'
import FacultyForm from '@/components/admin/FacultyForm'

export default async function EditFacultyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [faculty, mediaItems] = await Promise.all([getFacultyById(id), getMediaLibrary()])

  if (!faculty) notFound()

  return (
    <>
      <h1>Edit Faculty Member</h1>
      <p className="page-subtitle">Update this faculty profile.</p>
      <FacultyForm faculty={faculty} mediaItems={mediaItems} />
    </>
  )
}
