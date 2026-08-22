'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/dal'
import { createClient } from '@/lib/supabase/server'
import { extractStoragePath } from '@/lib/storage'

export type MediaFormState = { error?: string; success?: string } | undefined

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

// NOTE for the future Resources module (Module 5): that module needs
// broader file-type support (PDFs, docs, etc). Do not widen ALLOWED_TYPES
// here to accommodate it -- Resources should use its own validation set in
// its own action, or this module should grow an explicit `kind` param then.

export async function uploadMedia(
  _prevState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  const auth = await requireAdmin()
  const supabase = await createClient()

  // Multi-file support: the client submits every selected file under the
  // same 'files' key (native <input type="file" multiple> behavior), so
  // this action handles the whole batch in one call/one revalidate.
  const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)

  if (files.length === 0) {
    return { error: 'Select at least one image to upload.' }
  }

  const errors: string[] = []
  let uploadedCount = 0

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: unsupported file type.`)
      continue
    }
    if (file.size > MAX_SIZE_BYTES) {
      errors.push(`${file.name}: exceeds 10MB limit.`)
      continue
    }

    const ext = file.name.split('.').pop() || 'jpg'
    // Date.now() alone can collide when multiple files in the same batch
    // land in the same millisecond -- add a short random suffix.
    const rand = Math.random().toString(36).slice(2, 8)
    const path = `upload-${Date.now()}-${rand}.${ext}`

    const { error: uploadError } = await supabase.storage.from('media').upload(path, file, {
      upsert: false,
    })
    if (uploadError) {
      errors.push(`${file.name}: upload failed (${uploadError.message}).`)
      continue
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)

    const { error: insertError } = await supabase.from('media').insert({
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      created_by: auth.userId,
      updated_by: auth.userId,
    })
    if (insertError) {
      // Roll back the orphaned storage object if the DB insert fails.
      await supabase.storage.from('media').remove([path])
      errors.push(`${file.name}: could not save (${insertError.message}).`)
      continue
    }

    uploadedCount++
  }

  revalidatePath('/admin/media')
  revalidatePath('/admin')

  if (uploadedCount === 0) {
    return { error: errors.join(' ') || 'Upload failed.' }
  }
  if (errors.length > 0) {
    return { success: `Uploaded ${uploadedCount} file(s). ${errors.join(' ')}` }
  }
  return { success: `Uploaded ${uploadedCount} file(s).` }
}

export async function deleteMedia(
  _prevState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  await requireAdmin()
  const supabase = await createClient()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) {
    return { error: 'Missing media id.' }
  }

  const { data: row, error: fetchError } = await supabase
    .from('media')
    .select('file_url')
    .eq('id', id)
    .single()

  if (fetchError || !row) {
    return { error: 'Media item not found.' }
  }

  // Parse the storage path before deleting the DB row so a parse failure
  // doesn't leave an orphaned but undeletable-via-UI storage file.
  const path = extractStoragePath(row.file_url)

  const { error: deleteRowError } = await supabase.from('media').delete().eq('id', id)
  if (deleteRowError) {
    return { error: `Could not delete: ${deleteRowError.message}` }
  }

  // FK references from pages/news/faculty/resources/gallery use
  // ON DELETE SET NULL (gallery_images uses ON DELETE CASCADE) -- already
  // enforced at the DB level per 0001_init.sql, nothing extra needed here.

  if (path) {
    // Best-effort: the DB row is already gone (source of truth for the
    // library listing); a failed storage cleanup just leaves an orphaned
    // object, not a broken UI state.
    await supabase.storage.from('media').remove([path])
  }

  revalidatePath('/admin/media')
  revalidatePath('/admin')

  return { success: 'Deleted.' }
}

export async function updateMediaAltText(
  _prevState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  const auth = await requireAdmin()
  const supabase = await createClient()

  const id = formData.get('id')
  const altText = formData.get('alt_text')
  if (typeof id !== 'string' || !id) {
    return { error: 'Missing media id.' }
  }

  const { error } = await supabase
    .from('media')
    .update({
      alt_text: typeof altText === 'string' ? altText.trim() || null : null,
      updated_by: auth.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: `Could not save alt text: ${error.message}` }
  }

  revalidatePath('/admin/media')
  return { success: 'Alt text saved.' }
}
