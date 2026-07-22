import { notFound } from 'next/navigation'
import { getResourceById } from '@/lib/resources'
import ResourceForm from '@/components/admin/ResourceForm'

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const resource = await getResourceById(id)

  if (!resource) notFound()

  return (
    <>
      <h1>Edit Resource</h1>
      <p className="page-subtitle">Update this resource.</p>
      <ResourceForm resource={resource} />
    </>
  )
}
