import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Next.js 16 renamed Middleware to Proxy (same functionality/API).
//
// This does an OPTIMISTIC session refresh + redirect only — it must not be
// the sole line of defense. The real authorization check lives in
// lib/supabase/dal.ts and runs in Server Components/Actions close to the
// data (per Next.js's auth guidance: Proxy runs on every route, including
// prefetches, so it should stay cheap and cookie-only).
export async function proxy(request: NextRequest) {
  // IMPORTANT: this response object is what the cookie handlers below write
  // to. It must be the one actually returned (whether as-is or via a new
  // NextResponse.redirect that carries the same headers) — constructing an
  // unrelated response afterward silently drops the refreshed session cookie.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() (not getSession()) — revalidates against Supabase's servers
  // rather than trusting a potentially-stale/tampered cookie. The call
  // itself is also what triggers the token-refresh side effect above.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute =
    pathname === '/admin/login' || pathname === '/admin/reset-password'
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute && !isAuthRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  if (pathname === '/admin/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
