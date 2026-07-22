import Link from 'next/link'
import { getAllResources } from '@/lib/resources'
import ResourceList from '@/components/admin/ResourceList'

export default async function ResourcesPage() {
  const resources = await getAllResources()

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Resources</h1>
          <p className="page-subtitle">
            Manage downloadable files (forms, handbooks, policies) shown on the public site.
          </p>
        </div>
        <Link href="/admin/resources/new" className="admin-btn" style={{ width: 'auto' }}>
          Add Resource
        </Link>
      </div>
      <ResourceList items={resources} />
    </>
  )
}
