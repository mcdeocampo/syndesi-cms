'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/dal'
import { createClient } from '@/lib/supabase/server'

export type InquiryFormState = { error?: string; success?: string } | undefined

function field(fd: FormData, name: string): string {
  const v = fd.get(name)
  return typeof v === 'string' ? v.trim() : ''
}

// PUBLIC action -- no auth. Any site visitor submits through the contact form;
// the RLS insert policy allows the anon role. Validates input, uses a honeypot
// to swallow obvious bots, and stores the row for admins to read later.
export async function submitInquiry(
  _prev: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  // Honeypot: a hidden field real users never see. If it's filled, it's a bot;
  // pretend success so the bot doesn't learn it was caught, and store nothing.
  if (field(formData, 'company')) {
    return { success: 'Thank you! Your message has been sent.' }
  }

  const name = field(formData, 'name')
  const email = field(formData, 'email')
  const subject = field(formData, 'subject')
  const message = field(formData, 'message')

  if (!name || !email || !message) {
    return { error: 'Please fill in your name, email, and message.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }
  if (name.length > 200 || email.length > 200 || subject.length > 300) {
    return { error: 'One of the fields is too long. Please shorten it.' }
  }
  if (message.length > 5000) {
    return { error: 'Your message is too long (5000 characters max).' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('contact_inquiries').insert({
    name,
    email,
    subject: subject || null,
    message,
  })

  if (error) {
    return {
      error:
        'Sorry, something went wrong sending your message. Please try again, or email us directly.',
    }
  }

  // Surface new submissions immediately in the admin.
  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
  return {
    success: "Thank you! Your message has been sent — we'll be in touch soon.",
  }
}

// ADMIN action: toggle the read/unread flag on a submission.
export async function markInquiryRead(
  _prev: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  await requireAdmin()
  const supabase = await createClient()

  const id = field(formData, 'id')
  if (!id) return { error: 'Missing inquiry id.' }
  const read = field(formData, 'read') === 'true'

  // .select() verifies a row actually changed -- an RLS-blocked update returns
  // error:null with zero rows, which would otherwise look like success.
  const { data, error } = await supabase
    .from('contact_inquiries')
    .update({ is_read: read })
    .eq('id', id)
    .select('id')

  if (error) return { error: `Could not update: ${error.message}` }
  if (!data || data.length === 0) {
    return { error: 'Nothing was updated — it may have been removed, or your account lacks permission.' }
  }

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
  return { success: 'Updated.' }
}

// ADMIN action: permanently delete a submission.
export async function deleteInquiry(
  _prev: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  await requireAdmin()
  const supabase = await createClient()

  const id = field(formData, 'id')
  if (!id) return { error: 'Missing inquiry id.' }

  const { data, error } = await supabase
    .from('contact_inquiries')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) return { error: `Could not delete: ${error.message}` }
  if (!data || data.length === 0) {
    return { error: 'Nothing was deleted — it was already removed, or your account lacks permission.' }
  }

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
  return { success: 'Deleted.' }
}
