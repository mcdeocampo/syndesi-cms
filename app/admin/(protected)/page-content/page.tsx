import Link from 'next/link'
import { PAGES, SECTION_DEFAULTS } from '@/lib/page-sections-config'

export default function PageContentIndex() {
  return (
    <>
      <h1>Page Content</h1>
      <p className="page-subtitle">
        Edit the section headings and intro text on each public page.
      </p>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Editable Sections</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {PAGES.map((page) => {
              const count = Object.keys(SECTION_DEFAULTS[page.slug] ?? {}).length
              return (
                <tr key={page.slug}>
                  <td>{page.label}</td>
                  <td>
                    {count} section{count === 1 ? '' : 's'}
                  </td>
                  <td>
                    <Link
                      href={`/admin/page-content/${page.slug}`}
                      className="admin-btn media-item-btn"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
