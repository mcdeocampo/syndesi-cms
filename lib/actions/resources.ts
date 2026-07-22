'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/dal'
import { createClient } from '@/lib/supabase/server'

export type ResourceFormState = { error?: string; success?: string } | undefined

// Resources' own file-type allowlist -- documents plus images. The Media
// Library (lib/actions/media.ts) is images-only by design; this module
// brings the broader set its comment anticipated.
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]
const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20MB -- documents run larger than images

function textField(formData: FormData, name: string): string | null {
  const v = formData.get(name)
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null
}

function parseStatus(formData: FormData): 'draft' | 'published' {
  return formData.get('status') === 'published' ? 'published' : 'draft'
}

function extractStoragePath(fileUrl: string): string | null {
  const marker = '/object/public/media/'
  const idx = fileUrl.indexOf(marker)
  if (idx === -1) return null
  return fileUrl.slice(idx + marker.length)
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

// Uploads a document/image to the media bucket and inserts a media row,
// returning its id (to store in resources.file_id). Throws on validation or
// upload failure so the caller can surface a friendly form error.
async function uploadResourceFile(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`${file.name}: unsupported file type.`)
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`${file.name}: exceeds 20MB limit.`)
  }

  const ext = file.name.split('.').pop() || 'bin'
  const rand = Math.random().toString(36).slice(2, 8)
  const path = `resource-${Date.now()}-${rand}.${ext}`

  const { error: uploadError } = await supabase.storage.from('media').upload(path, file, {
    upsert: false,
  })
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)

  const { data: mediaRow, error: insertError } = await supabase
    .from('media')
    .insert({
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      created_by: userId,
      updated_by: userId,
    })
    .select('id')
    .single()

  if (insertError) {
    // Roll back the orphaned storage object if the DB insert fails.
    await supabase.storage.from('media').remove([path])
    throw new Error(`Could not save file: ${insertError.message}`)
  }

  return mediaRow.id
}

// Deletes a media row + its storage object (best-effort) -- used when a
// resource's file is replaced or the resource is deleted.
async function deleteMediaFile(supabase: SupabaseClient, fileId: string): Promise<void> {
  const { data: row } = await supabase.from('media').select('file_url').eq('id', fileId).single()
  await supabase.from('media').delete().eq('id', fileId)
  const path = row?.file_url ? extractStoragePath(row.file_url) : null
  if (path) await supabase.storage.from('media').remove([path])
}

export async function createResource(
  _prevState: ResourceFormState,
  formData: FormData
): Promise<ResourceFormState> {
  const auth = await requireAdmin()
  const supabase = await createClient()

  const title = textField(formData, 'title')
  if (!title) return { error: 'Title is required.' }

  let fileId: string | null = null
  const file = formData.get('file')
  if (file instanceof File && file.size > 0) {
    try {
      fileId = await uploadResourceFile(supabase, file, auth.userId)
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'File upload failed.' }
    }
  }

  const { error } = await supabase.from('resources').insert({
    title,
    description: textField(formData, 'description'),
    category: textField(formData, 'category'),
    file_id: fileId,
    status: parseStatus(formData),
    created_by: auth.userId,
    updated_by: auth.userId,
  })

  if (error) {
    if (fileId) await deleteMediaFile(supabase, fileId) // don't orphan the upload
    return { error: `Could not create resource: ${error.message}` }
  }

  revalidatePath('/admin/resources')
  revalidatePath('/admin')
  revalidatePath('/resources')
  redirect('/admin/resources')
}

export async function updateResource(
  _prevState: ResourceFormState,
  formData: FormData
): Promise<ResourceFormState> {
  const auth = await requireAdmin()
  const supabase = await createClient()

  const id = textField(formData, 'id')
  if (!id) return { error: 'Missing resource id.' }

  const title = textField(formData, 'title')
  if (!title) return { error: 'Title is required.' }

  const update: Record<string, unknown> = {
    title,
    description: textField(formData, 'description'),
    category: textField(formData, 'category'),
    status: parseStatus(formData),
    updated_by: auth.userId,
    updated_at: new Date().toISOString(),
  }

  // Only touch the file if a new one was uploaded; otherwise keep the
  // existing attachment. On replace, swap file_id then clean up the old file.
  const file = formData.get('file')
  let oldFileId: string | null = null
  if (file instanceof File && file.size > 0) {
    const { data: existing } = await supabase
      .from('resources')
      .select('file_id')
      .eq('id', id)
      .single()
    oldFileId = existing?.file_id ?? null

    try {
      update.file_id = await uploadResourceFile(supabase, file, auth.userId)
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'File upload failed.' }
    }
  }

  const { error } = await supabase.from('resources').update(update).eq('id', id)
  if (error) return { error: `Could not save changes: ${error.message}` }

  if (oldFileId) await deleteMediaFile(supabase, oldFileId)

  revalidatePath('/admin/resources')
  revalidatePath('/resources')
  redirect('/admin/resources')
}

export async function deleteResource(
  _prevState: ResourceFormState,
  formData: FormData
): Promise<ResourceFormState> {
  await requireAdmin()
  const supabase = await createClient()

  const id = textField(formData, 'id')
  if (!id) return { error: 'Missing resource id.' }

  const { data: row } = await supabase.from('resources').select('file_id').eq('id', id).single()

  const { error } = await supabase.from('resources').delete().eq('id', id)
  if (error) return { error: `Could not delete: ${error.message}` }

  // Clean up the attached file so it doesn't orphan in storage.
  if (row?.file_id) await deleteMediaFile(supabase, row.file_id)

  revalidatePath('/admin/resources')
  revalidatePath('/admin')
  revalidatePath('/resources')
  return { success: 'Deleted.' }
}
