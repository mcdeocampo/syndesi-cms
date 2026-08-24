import type { Metadata } from 'next'
import '../site.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SiteInteractions from './site-interactions'
import { getSiteSettings, sanitizeBrandColor } from '@/lib/settings'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    // Falls back to the school name rather than a hardcoded string, so the
    // browser tab can never show a stale identity if SEO Title is left blank.
    title: settings.seo_title || settings.school_name,
    description: settings.seo_description || undefined,
    icons: {
      icon: settings.favicon_url || '/images/syndesi-favicon.png',
    },
  }
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()

  // Override the brand color only when a valid one is stored -- otherwise the
  // shipped --navy in site.css applies untouched. The lighter gradient stop is
  // derived from the chosen color so a single picker themes every navy band.
  const brand = sanitizeBrandColor(settings.brand_color)

  return (
    <>
      {brand && (
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--navy:${brand};--navy-light:color-mix(in srgb, ${brand}, #ffffff 16%);}`,
          }}
        />
      )}
      <Header settings={settings} />
      {children}
      <Footer settings={settings} />
      <SiteInteractions />
    </>
  )
}
