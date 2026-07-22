import { createClient } from '@/lib/supabase/server'

export type MediaItem = {
  id: string
  file_url: string
  file_name: string
  file_type: string | null
  file_size: number | null
  alt_text: string | null
  created_at: string
  updated_at: string
}

// Read-only list, most recent first. Called from the Media Library Server
// Component. Relies on the "cms users can read media" RLS policy -- any
// authenticated CMS role (editor included) can call this. No fallback like
// getSiteSettings() -- this page is only reachable post-login, so a genuine
// Supabase error should surface rather than silently show an empty library.
//
// Filtered to image types: the Resources module also stores its uploaded
// documents (PDFs/Office files) as media rows via resources.file_id, but the
// Media Library grid and the Faculty/News image pickers render <img> for every
// item -- documents would show as broken thumbnails. Docs are managed through
// the Resources UI instead.
export async function getMediaLibrary(): Promise<MediaItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media')
    .select('id, file_url, file_name, file_type, file_size, alt_text, created_at, updated_at')
    .like('file_type', 'image/%')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Could not load media library: ${error.message}`)
  return data ?? []
}
