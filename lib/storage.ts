// Parses the storage object path back out of a Supabase public URL.
// getPublicUrl() produces .../storage/v1/object/public/media/<path>.
// Returns null if the URL isn't a recognizable media-bucket public URL, so
// callers can skip storage cleanup rather than guessing at a path.
export function extractStoragePath(fileUrl: string): string | null {
  const marker = '/object/public/media/'
  const idx = fileUrl.indexOf(marker)
  if (idx === -1) return null
  return fileUrl.slice(idx + marker.length)
}
