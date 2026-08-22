'use client'

import { useEffect, useRef, useState } from 'react'

export type CarouselPhoto = { url: string; alt: string }

// Responsive photo carousel for the news detail page. No external library --
// a translateX track with modulo (infinite-loop) navigation, mirroring the
// behavior of the existing testimonial carousel and the Barangay/Calendar
// carousel spec: over-image arrows, a "1 / N" counter, touch swipe, and
// left/right keyboard navigation while the page is open.
//
// Render contract is handled by the caller: 0 photos → nothing, 1 photo →
// a plain <img>. This component is only used for 2+.
export default function NewsPhotoCarousel({ photos }: { photos: CarouselPhoto[] }) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const count = photos.length

  // Modulo keeps navigation infinite in both directions.
  const go = (n: number) => setIndex((prev) => (n + count) % count)
  const prev = () => go(index - 1)
  const next = () => go(index + 1)

  // Left/right keys navigate while this page is mounted. Ignored when the user
  // is typing in a field, so it never hijacks form input elsewhere on a page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndex((p) => (p - 1 + count) % count)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIndex((p) => (p + 1) % count)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    // 40px threshold so a tap or tiny drag doesn't flip the slide.
    if (delta > 40) prev()
    else if (delta < -40) next()
    touchStartX.current = null
  }

  return (
    <div
      className="news-carousel"
      role="group"
      aria-roledescription="carousel"
      aria-label="Article photos"
    >
      <div className="news-carousel-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div
          className="news-carousel-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {photos.map((p, i) => (
            <div className="news-carousel-slide" key={i} aria-hidden={i !== index}>
              <img
                src={p.url}
                alt={p.alt}
                /* Only the cover is eager; the rest defer until navigated to. */
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="news-carousel-arrow news-carousel-prev"
          aria-label="Previous photo"
          onClick={prev}
        >
          <i className="fas fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          className="news-carousel-arrow news-carousel-next"
          aria-label="Next photo"
          onClick={next}
        >
          <i className="fas fa-chevron-right" aria-hidden="true"></i>
        </button>

        <div className="news-carousel-counter" aria-live="polite">
          {index + 1} / {count}
        </div>
      </div>

      <div className="news-carousel-dots" role="tablist" aria-label="Choose photo">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`news-carousel-dot${i === index ? ' active' : ''}`}
            aria-label={`Go to photo ${i + 1}`}
            aria-selected={i === index}
            role="tab"
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  )
}
