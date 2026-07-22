'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'

// Extracted from page.tsx so that page can be a Server Component and render
// <AdminBrand />, which reads Website Settings. Only the interactive form
// needs to be a Client Component.
export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined)

  return (
    <>
      {state?.error && <div className="admin-error">{state.error}</div>}

      <form action={formAction}>
        <div className="admin-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="admin-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <button className="admin-btn" type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="admin-auth-links">
        <Link href="/admin/reset-password">Forgot your password?</Link>
      </div>
    </>
  )
}
