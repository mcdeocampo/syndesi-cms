'use client'

import { useActionState, useEffect, useRef } from 'react'
import { submitInquiry } from '@/lib/actions/inquiries'

// The public "Send us a message" form. Submits to the submitInquiry server
// action, which stores the message for admins to read in the Inquiries tab.
export default function ContactForm() {
  const [state, action, pending] = useActionState(submitInquiry, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  // Clear the fields after a successful send so the confirmation reads cleanly
  // and the visitor doesn't accidentally submit twice.
  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state?.success])

  return (
    <form className="contact-form" action={action} ref={formRef}>
      {state?.success && (
        <div className="contact-form-note contact-form-success" role="status">
          <i className="fas fa-circle-check" aria-hidden="true"></i>
          <span>{state.success}</span>
        </div>
      )}
      {state?.error && (
        <div className="contact-form-note contact-form-error" role="alert">
          <i className="fas fa-triangle-exclamation" aria-hidden="true"></i>
          <span>{state.error}</span>
        </div>
      )}

      <label htmlFor="contactName" style={{ display: 'none' }}>
        Name
      </label>
      <input type="text" id="contactName" name="name" placeholder="Name" required />

      <label htmlFor="contactEmail" style={{ display: 'none' }}>
        Email
      </label>
      <input type="email" id="contactEmail" name="email" placeholder="Email" required />

      <label htmlFor="contactSubject" style={{ display: 'none' }}>
        Subject
      </label>
      <input type="text" id="contactSubject" name="subject" placeholder="Subject" />

      <label htmlFor="contactMessage" style={{ display: 'none' }}>
        Message
      </label>
      <textarea id="contactMessage" name="message" placeholder="Message" required></textarea>

      {/* Honeypot: positioned off-screen and hidden from assistive tech, so no
          real user fills it. The action treats a filled value as a bot. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      <button type="submit" className="btn-primary" disabled={pending}>
        <i className="fas fa-paper-plane" aria-hidden="true"></i>{' '}
        {pending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
