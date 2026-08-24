import { createClient } from '@/lib/supabase/server'

export type Inquiry = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string
}

const SELECT_COLUMNS = 'id, name, email, subject, message, is_read, created_at'

// Admin list reader: all submissions, newest first. RLS restricts this to
// admins, so an editor simply sees an empty list rather than an error.
export async function getInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_inquiries')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Could not load inquiries: ${error.message}`)
  return (data ?? []) as Inquiry[]
}

// Count of unread submissions, for the Dashboard/nav. Tolerates errors (e.g.
// the table not existing yet before the migration is run) by returning 0.
export async function getUnreadInquiryCount(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('contact_inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
    return count ?? 0
  } catch {
    return 0
  }
}
