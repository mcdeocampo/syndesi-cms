import { requireAuth } from '@/lib/supabase/dal'
import { logout } from '@/lib/actions/auth'
import AdminBrand from '@/components/admin/AdminBrand'
import AdminNav from './admin-nav'
import '../admin.css'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The real authorization check — proxy.ts only did an optimistic
  // cookie-based redirect. This is what actually gates every page under
  // /admin (except the (auth) route group).
  const auth = await requireAuth()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <AdminBrand />
        <AdminNav />
        <div className="admin-sidebar-footer">
          <div className="admin-user">
            {auth.email}
            <br />
            <span style={{ textTransform: 'capitalize' }}>{auth.role.replace('_', ' ')}</span>
          </div>
          <form action={logout}>
            <button className="admin-logout-btn" type="submit">
              Log Out
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}
