import AdminBrand from '@/components/admin/AdminBrand'
import LoginForm from './login-form'
import '../../admin.css'

// A Server Component so the crest and wordmark can come from Website Settings
// via <AdminBrand />; the form itself is the Client Component.
export default function LoginPage() {
  return (
    <div className="admin-auth">
      <div className="admin-auth-card">
        <AdminBrand className="admin-auth-logo" />
        <h1>Sign in</h1>
        <p className="subtitle">Manage your school website content.</p>
        <LoginForm />
      </div>
    </div>
  )
}
