'use client'

import { useActionState, useState } from 'react'
import { updateWebsiteSettings } from '@/lib/actions/settings'
import type { WebsiteSettings } from '@/lib/settings'

export default function SettingsForm({ settings }: { settings: WebsiteSettings }) {
  const [state, formAction, pending] = useActionState(updateWebsiteSettings, undefined)
  const [logoPreview, setLogoPreview] = useState(settings.logo_url)
  const [faviconPreview, setFaviconPreview] = useState(settings.favicon_url)
  const [heroPreview, setHeroPreview] = useState(settings.hero_image_url)
  // Empty string means "no custom color" -- submitting it blank clears the
  // stored value and reverts the site to the shipped navy.
  const [brandColor, setBrandColor] = useState(settings.brand_color ?? '')

  return (
    <form action={formAction}>
      {state?.error && <div className="admin-error">{state.error}</div>}
      {state?.success && <div className="admin-success">{state.success}</div>}

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>General Information</h2>

        <div className="admin-field">
          <label htmlFor="school_name">School Name</label>
          <input id="school_name" name="school_name" defaultValue={settings.school_name} required />
        </div>

        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="logo">School Logo</label>
            <div className="admin-logo-preview">
              {logoPreview && <img src={logoPreview} alt="Current logo" />}
            </div>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setLogoPreview(URL.createObjectURL(f))
              }}
            />
            <p className="admin-field-hint">Leave blank to keep the current logo.</p>
          </div>
          <div className="admin-field">
            <label htmlFor="favicon">Favicon</label>
            <div className="admin-logo-preview">
              {faviconPreview && <img src={faviconPreview} alt="Current favicon" style={{ height: 32 }} />}
            </div>
            <input
              id="favicon"
              name="favicon"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFaviconPreview(URL.createObjectURL(f))
              }}
            />
            <p className="admin-field-hint">Leave blank to keep the current favicon.</p>
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" defaultValue={settings.address ?? ''} />
        </div>

        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="contact_number">Contact Number(s)</label>
            <textarea
              id="contact_number"
              name="contact_number"
              rows={2}
              defaultValue={settings.contact_number ?? ''}
            />
            <p className="admin-field-hint">
              Put each number on its own line to list several.
            </p>
          </div>
          <div className="admin-field">
            <label htmlFor="email">Email Address(es)</label>
            <textarea
              id="email"
              name="email"
              rows={2}
              defaultValue={settings.email ?? ''}
            />
            <p className="admin-field-hint">
              Put each address on its own line to list several.
            </p>
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="office_hours">Office Hours</label>
          <input id="office_hours" name="office_hours" defaultValue={settings.office_hours ?? ''} />
        </div>

        <div className="admin-field">
          <label htmlFor="admin_label">CMS Name</label>
          <input
            id="admin_label"
            name="admin_label"
            defaultValue={settings.admin_label ?? ''}
            placeholder={`${settings.school_name} CMS`}
          />
          <p className="admin-field-hint">
            The wording beside the logo in this admin panel and on the sign-in screen.
            Leave blank to use <strong>{settings.school_name} CMS</strong> automatically, so
            it updates whenever you change the school name above. The logo shown there is
            the School Logo you upload above.
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Social Media</h2>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="facebook_url">Facebook</label>
            <input id="facebook_url" name="facebook_url" type="url" defaultValue={settings.facebook_url ?? ''} />
          </div>
          <div className="admin-field">
            <label htmlFor="youtube_url">YouTube</label>
            <input id="youtube_url" name="youtube_url" type="url" defaultValue={settings.youtube_url ?? ''} />
          </div>
          <div className="admin-field">
            <label htmlFor="instagram_url">Instagram</label>
            <input id="instagram_url" name="instagram_url" type="url" defaultValue={settings.instagram_url ?? ''} />
          </div>
          <div className="admin-field">
            <label htmlFor="linkedin_url">LinkedIn (optional)</label>
            <input id="linkedin_url" name="linkedin_url" type="url" defaultValue={settings.linkedin_url ?? ''} />
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Announcement Bar</h2>
        <p className="admin-field-hint" style={{ marginTop: -6, marginBottom: 16 }}>
          A strip shown at the very top of every public page — great for
          enrollment notices. Visitors can dismiss it, and it reappears whenever
          you change the text.
        </p>
        <div className="admin-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="announcement_enabled"
              defaultChecked={settings.announcement_enabled}
              style={{ width: 18, height: 18 }}
            />
            Show the announcement bar
          </label>
        </div>
        <div className="admin-field">
          <label htmlFor="announcement_text">Announcement Text</label>
          <input
            id="announcement_text"
            name="announcement_text"
            defaultValue={settings.announcement_text ?? ''}
            placeholder="Enrollment for SY 2026–2027 is now open!"
          />
        </div>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="announcement_link_text">Button Text (optional)</label>
            <input
              id="announcement_link_text"
              name="announcement_link_text"
              defaultValue={settings.announcement_link_text ?? ''}
              placeholder="Enroll now"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="announcement_link_href">Button Link (optional)</label>
            <input
              id="announcement_link_href"
              name="announcement_link_href"
              defaultValue={settings.announcement_link_href ?? ''}
              placeholder="/admissions"
            />
            <p className="admin-field-hint">
              An internal path like /admissions, or a full https:// address. Leave both blank for
              text only.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Brand Color</h2>
        <p className="admin-field-hint" style={{ marginTop: -6, marginBottom: 16 }}>
          The main color used across the site — page banners, the header,
          footer, the stats band, and the call-to-action. Change it here and all
          of those update together.
        </p>
        <div className="admin-field">
          <label htmlFor="brand_color_text">Primary Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="color"
              aria-label="Pick primary brand color"
              value={brandColor || '#16225c'}
              onChange={(e) => setBrandColor(e.target.value)}
              style={{
                width: 52,
                height: 40,
                padding: 2,
                borderRadius: 8,
                border: '1px solid var(--admin-border)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
            <input
              id="brand_color_text"
              name="brand_color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              placeholder="#16225c"
              style={{ maxWidth: 160, textTransform: 'lowercase' }}
            />
            {brandColor && (
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setBrandColor('')}
                style={{ padding: '8px 12px' }}
              >
                Reset to default
              </button>
            )}
          </div>
          <p className="admin-field-hint">
            Pick a color or paste a hex code (e.g. <strong>#16225c</strong>). Leave
            blank to use the default navy. The gradient’s lighter shade is created
            from this color automatically.
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Homepage Hero</h2>
        <p className="admin-field-hint" style={{ marginTop: -6, marginBottom: 16 }}>
          The large banner text and photo at the top of the homepage.
        </p>
        <div className="admin-field">
          <label htmlFor="hero_image">Background Photo</label>
          {heroPreview && (
            <div
              style={{
                width: '100%',
                maxWidth: 360,
                aspectRatio: '16 / 9',
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid var(--admin-border)',
                marginBottom: 8,
              }}
            >
              <img
                src={heroPreview}
                alt="Current hero background"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          <input
            id="hero_image"
            name="hero_image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setHeroPreview(URL.createObjectURL(f))
            }}
          />
          <p className="admin-field-hint">
            A wide landscape photo of the campus works best (about 1600–1920px wide, under ~4MB).
            Leave blank to keep the current one.
          </p>
        </div>
        <div className="admin-field">
          <label htmlFor="hero_tagline">Tagline</label>
          <input
            id="hero_tagline"
            name="hero_tagline"
            defaultValue={settings.hero_tagline ?? ''}
          />
          <p className="admin-field-hint">The small line above the main headline.</p>
        </div>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="hero_heading">Headline — First Line</label>
            <input
              id="hero_heading"
              name="hero_heading"
              defaultValue={settings.hero_heading ?? ''}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="hero_heading_highlight">Headline — Second Line (highlighted)</label>
            <input
              id="hero_heading_highlight"
              name="hero_heading_highlight"
              defaultValue={settings.hero_heading_highlight ?? ''}
            />
            <p className="admin-field-hint">Shown in gold on its own line.</p>
          </div>
        </div>
        <div className="admin-field">
          <label htmlFor="hero_description">Description</label>
          <textarea
            id="hero_description"
            name="hero_description"
            rows={4}
            defaultValue={settings.hero_description ?? ''}
          />
          <p className="admin-field-hint">The paragraph below the headline.</p>
        </div>
        <div className="admin-field">
          <label htmlFor="hero_campus_caption">Campus Caption</label>
          <input
            id="hero_campus_caption"
            name="hero_campus_caption"
            defaultValue={settings.hero_campus_caption ?? ''}
          />
          <p className="admin-field-hint">
            The small location line with the pin icon at the bottom of the hero photo. Leave
            blank to hide it.
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h2>Website</h2>
        <div className="admin-field">
          <label htmlFor="footer_text">Footer Text</label>
          <textarea id="footer_text" name="footer_text" defaultValue={settings.footer_text ?? ''} />
        </div>
        <div className="admin-field">
          <label htmlFor="copyright_text">Copyright</label>
          <input id="copyright_text" name="copyright_text" defaultValue={settings.copyright_text ?? ''} />
          <p className="admin-field-hint">
            Shown in the bar at the very bottom of every page. Type{' '}
            <strong>{'{year}'}</strong> and it becomes the current year automatically, so the
            notice never goes out of date. Leave blank to hide the bar.
          </p>
        </div>
        <div className="admin-field">
          <label htmlFor="google_maps_embed">Google Maps Embed</label>
          <textarea
            id="google_maps_embed"
            name="google_maps_embed"
            defaultValue={settings.google_maps_embed ?? ''}
            placeholder="Paste an embed URL or <iframe> code"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="seo_title">SEO Title</label>
          <input id="seo_title" name="seo_title" defaultValue={settings.seo_title ?? ''} />
        </div>
        <div className="admin-field">
          <label htmlFor="seo_description">SEO Description</label>
          <textarea id="seo_description" name="seo_description" defaultValue={settings.seo_description ?? ''} />
        </div>
      </div>

      <button className="admin-btn" type="submit" disabled={pending} style={{ maxWidth: 200 }}>
        {pending ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
