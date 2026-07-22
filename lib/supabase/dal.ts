import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type Role = 'super_admin' | 'admin' | 'editor'

export type AuthContext = {
  userId: string
  email: string | undefined
  role: Role
}

// The real authorization check. proxy.ts only does an optimistic
// cookie-based redirect for UX — this is what actually gates data access,
// per Next.js's guidance to keep auth checks close to the data source.
// cache() dedupes this within a single render pass.
export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createClient()

  // getUser() revalidates against Supabase's servers rather than trusting
  // the cookie as-is — required here since this is the actual security gate.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return { userId: user.id, email: user.email, role: profile.role as Role }
})

// Use in Server Components / Server Actions that require any authenticated
// admin-area user (any role).
export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuthContext()
  if (!auth) redirect('/admin/login')
  return auth
}

// Use in Server Components / Server Actions that require write access
// (e.g. updating Website Settings). Editors are authenticated but not
// permitted to write in Phase 1.
export async function requireAdmin(): Promise<AuthContext> {
  const auth = await requireAuth()
  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    redirect('/admin?error=forbidden')
  }
  return auth
}
