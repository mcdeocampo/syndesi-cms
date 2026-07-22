import ResourceForm from '@/components/admin/ResourceForm'

export default function NewResourcePage() {
  return (
    <>
      <h1>Add Resource</h1>
      <p className="page-subtitle">Upload a new downloadable file for the public site.</p>
      <ResourceForm />
    </>
  )
}
