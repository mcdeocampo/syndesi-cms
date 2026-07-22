import Link from 'next/link'
import { getAllFaculty } from '@/lib/faculty'
import FacultyList from '@/components/admin/FacultyList'

export default async function FacultyPage() {
  const faculty = await getAllFaculty()

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Faculty</h1>
          <p className="page-subtitle">
            Manage faculty and staff profiles shown on the public site.
          </p>
        </div>
        <Link href="/admin/faculty/new" className="admin-btn" style={{ width: 'auto' }}>
          Add Faculty Member
        </Link>
      </div>
      <FacultyList items={faculty} />
    </>
  )
}
