import { getSiteSettings, adminLabel, DEFAULT_SETTINGS } from '@/lib/settings'

// The CMS's own crest + wordmark, shown in the sidebar and on the login and
// reset-password screens. A Server Component so it can read Website Settings
// directly -- the screens that use it pass no props, which is what keeps all
// three in sync.
//
// This replaces a hardcoded '/images/gardner-logo.png' and a hardcoded
// "Gardner CMS" string duplicated across those three files, which is why the
// admin panel kept showing the old brand after the site was renamed.
//
// Note this renders for LOGGED-OUT visitors on the login screen. That's fine:
// website_settings has a public SELECT policy (it's the same data the public
// site's header reads), so no privileged data is exposed here.
export default async function AdminBrand({
  className = 'admin-sidebar-logo',
}: {
  className?: string
}) {
  const settings = await getSiteSettings()
  const logo = settings.logo_url || DEFAULT_SETTINGS.logo_url
  const label = adminLabel(settings)

  return (
    <div className={className}>
      {logo && <img src={logo} alt={`${settings.school_name} crest`} />}
      <span>{label}</span>
    </div>
  )
}
