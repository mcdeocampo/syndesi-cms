'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/lib/actions/auth'

export default function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, undefined)

  return (
    <>
      {state?.error && <div className="admin-error">{state.error}</div>}
      <form action={formAction}>
        <div className="admin-field">
          <label htmlFor="password">New password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <button className="admin-btn" type="submit" disabled={pending}>
          {pending ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </>
  )
}
