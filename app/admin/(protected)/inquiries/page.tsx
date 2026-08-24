import { getInquiries } from '@/lib/inquiries'
import InquiryList from '@/components/admin/InquiryList'

export default async function InquiriesPage() {
  const inquiries = await getInquiries()
  const unread = inquiries.filter((i) => !i.is_read).length

  return (
    <>
      <h1>Inquiries</h1>
      <p className="page-subtitle">
        Messages submitted through the website contact form.
        {unread > 0 ? ` ${unread} unread.` : ''}
      </p>
      <InquiryList items={inquiries} />
    </>
  )
}
