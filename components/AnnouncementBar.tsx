'use client'

import { useEffect, useRef, useState } from 'react'
import { SmartLink } from '@/components/SectionCta'

// A dismissible strip at the very top of the site. It sits above the fixed
// nav; both the nav (top offset) and inner-page content padding read the
// --ann-h CSS variable, which this component keeps in sync with the bar's real
// height so nothing is ever hidden underneath it.
//
// Dismissal is remembered per-message: the current text is stored in
// localStorage, so editing the announcement in the CMS re-shows it to everyone
// even if they dismissed the previous one.
const STORAGE_KEY = 'syndesi-announcement-dismissed'

export default function AnnouncementBar({
  text,
  linkHref,
  linkText,
  scroll = false,
}: {
  text: string
  linkHref: string | null
  linkText: string | null
  scroll?: boolean
}) {
  const [dismissed, setDismissed] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  // On mount, hide immediately if this exact message was already dismissed.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === text) setDismissed(true)
    } catch {
      /* localStorage blocked (private mode) -- just show the bar. */
    }
  }, [text])

  // Publish the bar's real height to --ann-h whenever it's shown, and keep it
  // current on resize (the text can wrap to two lines on narrow screens).
  useEffect(() => {
    const root = document.documentElement
    if (dismissed) {
      root.style.setProperty('--ann-h', '0px')
      return
    }
    const update = () => {
      const h = barRef.current?.offsetHeight ?? 0
      root.style.setProperty('--ann-h', `${h}px`)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [dismissed])

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, text)
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }

  if (dismissed) return null

  // The message content, shared by both modes.
  const message = (
    <>
      {text}
      {linkHref && (
        <SmartLink href={linkHref} className="announcement-link">
          {linkText || 'Learn more'} <i className="fas fa-arrow-right" aria-hidden="true"></i>
        </SmartLink>
      )}
    </>
  )

  // A non-interactive visual clone of the message, used to make the ticker loop
  // seamlessly without a second focusable/announced copy of the link.
  const messageClone = (
    <>
      {text}
      {linkHref && (
        <span className="announcement-link">
          {linkText || 'Learn more'} <i className="fas fa-arrow-right" aria-hidden="true"></i>
        </span>
      )}
    </>
  )

  return (
    <div
      className={`announcement-bar${scroll ? ' announcement-bar-scroll' : ''}`}
      ref={barRef}
      role="region"
      aria-label="Announcement"
    >
      {scroll ? (
        <>
          <span className="announcement-lead" aria-hidden="true">
            <i className="fas fa-bullhorn"></i>
          </span>
          <div className="announcement-marquee">
            <div className="announcement-marquee-track">
              <span className="announcement-marquee-item">{message}</span>
              <span className="announcement-marquee-item" aria-hidden="true">
                {messageClone}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="announcement-inner">
          <span className="announcement-text">
            <i className="fas fa-bullhorn" aria-hidden="true"></i> {message}
          </span>
        </div>
      )}
      <button
        type="button"
        className="announcement-close"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
      >
        <i className="fas fa-xmark" aria-hidden="true"></i>
      </button>
    </div>
  )
}
