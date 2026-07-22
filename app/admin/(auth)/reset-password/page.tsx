import { createClient } from '@/lib/supabase/server'
import AdminBrand from '@/components/admin/AdminBrand'
import RequestResetForm from './request-form'
import UpdatePasswordForm from './update-form'
import '../../admin.css'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Supabase's password-recovery email link signs the user into a
  // temporary recovery session and lands them here — in that case we show
  // the "set a new password" form. Otherwise (arrived here directly), show
  // the "request a reset link" form.
  const hasRecoverySession = Boolean(user)

  return (
    <div className="admin-auth">
      <div className="admin-auth-card">
        <AdminBrand className="admin-auth-logo" />
        <h1>{hasRecoverySession ? 'Set a new password' : 'Reset your password'}</h1>
        <p className="subtitle">
          {hasRecoverySession
            ? 'Choose a new password for your account.'
            : "We'll email you a link to reset your password."}
        </p>
        {hasRecoverySession ? <UpdatePasswordForm /> : <RequestResetForm />}
      </div>
    </div>
  )
}
