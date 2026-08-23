import type { Metadata } from 'next'
import { getSiteSettings, DEFAULT_SETTINGS } from '@/lib/settings'

// Shared wrapper for every /admin route (both the (auth) and (protected)
// groups). Its only job is the browser-tab favicon: the CMS shows the same
// favicon uploaded in Website Settings as the public site, instead of the
// static crest inherited from the root layout. website_settings has a public
// SELECT policy, so this also resolves on the unauthenticated login page.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    icons: {
      icon: settings.favicon_url || DEFAULT_SETTINGS.favicon_url || '/images/syndesi-favicon.png',
    },
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Passthrough -- the (protected) group has its own shell layout; this exists
  // only to attach the favicon metadata above across all admin routes.
  return children
}
