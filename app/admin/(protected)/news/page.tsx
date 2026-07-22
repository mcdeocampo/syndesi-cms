import Link from 'next/link'
import { getAllNews } from '@/lib/news'
import NewsList from '@/components/admin/NewsList'

export default async function NewsPage() {
  const news = await getAllNews()

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>News</h1>
          <p className="page-subtitle">
            Manage news articles and announcements shown on the public site.
          </p>
        </div>
        <Link href="/admin/news/new" className="admin-btn" style={{ width: 'auto' }}>
          Add Article
        </Link>
      </div>
      <NewsList items={news} />
    </>
  )
}
