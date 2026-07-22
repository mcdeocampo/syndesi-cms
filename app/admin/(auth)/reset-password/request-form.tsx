'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/lib/actions/auth'

export default function RequestResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined)

  if (state?.success) {
    return (
      <>
        <div className="admin-success">{state.success}</div>
        <div className="admin-auth-links">
          <Link href="/admin/login">Back to sign in</Link>
        </div>
      </>
    )
  }

  return (
    <>
      {state?.error && <div className="admin-error">{state.error}</div>}
      <form action={formAction}>
        <div className="admin-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <button className="admin-btn" type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
      <div className="admin-auth-links">
        <Link href="/admin/login">Back to sign in</Link>
      </div>
    </>
  )
}
