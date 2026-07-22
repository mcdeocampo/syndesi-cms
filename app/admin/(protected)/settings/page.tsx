import { getSiteSettings } from '@/lib/settings'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  const settings = await getSiteSettings()

  return (
    <>
      <h1>Website Settings</h1>
      <p className="page-subtitle">
        Changes here update the live website immediately after saving.
      </p>
      <SettingsForm settings={settings} />
    </>
  )
}
