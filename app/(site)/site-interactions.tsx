'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Ported 1:1 from the static site's js/main.js — same vanilla DOM behaviors,
// just run inside a React effect instead of a plain <script> tag. No change
// in behavior, only in how it's wired up.
export default function SiteInteractions() {
  const pathname = usePathname()

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // 1. Navbar scroll effect
    const navbar = document.getElementById('navbar')
    const onScroll = () => {
      if (!navbar) return
      navbar.classList.toggle('scrolled', window.scrollY > 60)
    }
    if (navbar) window.addEventListener('scroll', onScroll)

    // 2. Hamburger menu
    const hamburger = document.getElementById('hamburger')
    const navLinks = document.getElementById('navLinks')
    const closeMenu = () => navLinks?.classList.remove('open')
    const toggleMenu = () => navLinks?.classList.toggle('open')
    const navLinkAnchors = navLinks
      ? Array.from(navLinks.querySelectorAll('a'))
      : []
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', toggleMenu)
      navLinkAnchors.forEach((a) => a.addEventListener('click', closeMenu))
    }

    // 3. Scroll-reveal animation
    const autoRevealSelectors =
      '.section-tag, .section-title, .section-subtitle, .stats-strip, .card:not(.reveal)'
    document
      .querySelectorAll(autoRevealSelectors)
      .forEach((el) => el.classList.add('reveal'))

    const revealEls = document.querySelectorAll('.reveal')
    let revealObserver: IntersectionObserver | null = null
    if (revealEls.length) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view')
              revealObserver?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.15 }
      )
      revealEls.forEach((el) => revealObserver!.observe(el))
    }

    // 3b. Hero parallax
    const heroShapes = document.querySelector<HTMLElement>('.hero-shapes')
    const heroIcons = document.querySelector<HTMLElement>('.hero-mi-orbit')
    let ticking = false
    const onParallaxScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const offset = window.scrollY * 0.25
        if (heroShapes) heroShapes.style.transform = `translateY(${offset}px)`
        if (heroIcons)
          heroIcons.style.transform = `translateY(${offset * 0.6}px)`
        ticking = false
      })
    }
    if ((heroShapes || heroIcons) && !prefersReducedMotion) {
      window.addEventListener('scroll', onParallaxScroll, { passive: true })
    }

    // 3e. Hero rotating word
    const rotatingWordEl = document.getElementById('rotatingWord')
    let rotatingInterval: ReturnType<typeof setInterval> | null = null
    if (rotatingWordEl && !prefersReducedMotion) {
      const words = ['Think', 'Create', 'Perform', 'Lead', 'Inspire']
      let wordIndex = 0
      rotatingInterval = setInterval(() => {
        rotatingWordEl.classList.add('swap')
        setTimeout(() => {
          wordIndex = (wordIndex + 1) % words.length
          rotatingWordEl.textContent = words[wordIndex]
          rotatingWordEl.classList.remove('swap')
        }, 350)
      }, 2400)
    }

    // 3c. Animated stat counters
    const counterEls = document.querySelectorAll<HTMLElement>('[data-count]')
    let counterObserver: IntersectionObserver | null = null
    if (counterEls.length) {
      const formatCount = (el: HTMLElement, value: number) => {
        const suffix = el.dataset.suffix || ''
        if (el.dataset.format === 'k') {
          return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K' + suffix
        }
        return Math.round(value) + suffix
      }

      const runCounter = (el: HTMLElement) => {
        const target = parseFloat(el.dataset.count || '0')
        if (prefersReducedMotion) {
          el.textContent = formatCount(el, target)
          return
        }
        const duration = 1400
        const start = performance.now()
        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          el.textContent = formatCount(el, target * eased)
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }

      counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCounter(entry.target as HTMLElement)
              counterObserver?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.4 }
      )
      counterEls.forEach((el) => counterObserver!.observe(el))
    }

    // 3d. Testimonial carousel
    const testimonialTrack = document.getElementById('testimonialTrack')
    const testimonialDotsWrap = document.getElementById('testimonialDots')
    let autoplayId: ReturnType<typeof setInterval> | null = null
    const dotButtons: HTMLButtonElement[] = []
    let goTo: ((index: number) => void) | null = null
    let stopAutoplay: (() => void) | null = null
    let startAutoplay: (() => void) | null = null
    let carousel: HTMLElement | null = null

    if (testimonialTrack && testimonialDotsWrap) {
      const slides = testimonialTrack.querySelectorAll('.testimonial-slide')
      let activeIndex = 0

      slides.forEach((_, i) => {
        const dot = document.createElement('button')
        dot.setAttribute('aria-label', `Show testimonial ${i + 1}`)
        if (i === 0) dot.classList.add('active')
        dot.addEventListener('click', () => goTo?.(i))
        testimonialDotsWrap.appendChild(dot)
        dotButtons.push(dot)
      })

      goTo = (index: number) => {
        activeIndex = (index + slides.length) % slides.length
        testimonialTrack.style.transform = `translateX(-${activeIndex * 100}%)`
        dotButtons.forEach((d, i) => d.classList.toggle('active', i === activeIndex))
      }

      stopAutoplay = () => {
        if (autoplayId) clearInterval(autoplayId)
      }
      startAutoplay = () => {
        if (prefersReducedMotion || slides.length < 2) return
        stopAutoplay?.()
        autoplayId = setInterval(() => goTo?.(activeIndex + 1), 5500)
      }

      carousel = document.getElementById('testimonialCarousel')
      carousel?.addEventListener('mouseenter', stopAutoplay)
      carousel?.addEventListener('mouseleave', startAutoplay)
      carousel?.addEventListener('focusin', stopAutoplay)
      carousel?.addEventListener('focusout', startAutoplay)

      startAutoplay()
    }

    // 4. Contact form (mailto — no backend)
    const contactForm = document.getElementById(
      'contactForm'
    ) as HTMLFormElement | null
    const onSubmit = (e: Event) => {
      e.preventDefault()
      if (!contactForm) return
      const name = (contactForm.querySelector('#contactName') as HTMLInputElement)?.value
      const email = (contactForm.querySelector('#contactEmail') as HTMLInputElement)?.value
      const subject =
        (contactForm.querySelector('#contactSubject') as HTMLInputElement)?.value ||
        'Website Inquiry'
      const message = (contactForm.querySelector('#contactMessage') as HTMLTextAreaElement)?.value

      const body = `Name: ${name}\nEmail: ${email}\n\n${message}`
      const mailto = `mailto:contact@syndesi.edu.ph?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
      window.location.href = mailto
    }
    contactForm?.addEventListener('submit', onSubmit)

    return () => {
      if (navbar) window.removeEventListener('scroll', onScroll)
      if (hamburger && navLinks) {
        hamburger.removeEventListener('click', toggleMenu)
        navLinkAnchors.forEach((a) => a.removeEventListener('click', closeMenu))
      }
      revealObserver?.disconnect()
      window.removeEventListener('scroll', onParallaxScroll)
      if (rotatingInterval) clearInterval(rotatingInterval)
      counterObserver?.disconnect()
      stopAutoplay?.()
      carousel?.removeEventListener('mouseenter', stopAutoplay!)
      carousel?.removeEventListener('mouseleave', startAutoplay!)
      carousel?.removeEventListener('focusin', stopAutoplay!)
      carousel?.removeEventListener('focusout', startAutoplay!)
      contactForm?.removeEventListener('submit', onSubmit)
    }
  }, [pathname])

  return null
}
