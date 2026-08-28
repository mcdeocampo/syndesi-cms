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
  const marqueeRef = useRef<HTMLDivElement>(null)
  const itemRef = useRef<HTMLSpanElement>(null)
  // How many copies of the message make up ONE looping sequence. Enough to
  // overflow the bar so the ticker reads as a continuous stream (not just two
  // side-by-side copies) and loops seamlessly at any screen width.
  const [repeats, setRepeats] = useState(4)

  // Measure the message vs. the bar width and repeat it enough to fill+overflow.
  useEffect(() => {
    if (!scroll || dismissed) return
    const compute = () => {
      const containerW = marqueeRef.current?.offsetWidth ?? 0
      const itemW = itemRef.current?.offsetWidth ?? 0
      if (containerW > 0 && itemW > 0) {
        setRepeats(Math.max(2, Math.ceil(containerW / itemW) + 1))
      }
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [scroll, dismissed, text, linkText])

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
          <div className="announcement-marquee" ref={marqueeRef}>
            <div className="announcement-marquee-track">
              {/* Two identical sequences of `repeats` copies. The first copy is
                  the real (interactive, announced) message; every other copy is
                  an aria-hidden visual clone. Animating the track by -50% moves
                  exactly one sequence, so the loop is seamless. */}
              {Array.from({ length: repeats * 2 }, (_, i) => (
                <span
                  key={i}
                  className="announcement-marquee-item"
                  ref={i === 0 ? itemRef : undefined}
                  aria-hidden={i === 0 ? undefined : true}
                >
                  {i === 0 ? message : messageClone}
                </span>
              ))}
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
