// Client-side image downscaling, run before an upload leaves the browser.
//
// Why: uploads POST through a Vercel Server Action, and Vercel caps the
// serverless request body at ~4.5MB regardless of our own limits. A photo
// straight off a phone is often 5-12MB and would fail. Shrinking it here --
// to a sensible max dimension and re-encoding as WebP -- brings it well under
// the cap (a 1600px WebP is typically 150-400KB) and optimises the asset at
// the same time.
//
// Safe by construction: only raster photos (jpeg/png/webp) are touched; SVGs,
// GIFs, and anything already small pass through untouched, and any failure
// falls back to the original file so an upload never breaks because of this.

const MAX_DIM = 1920
const QUALITY = 0.85
// Files at or under this are left alone -- comfortably inside Vercel's cap, so
// there's no need to re-encode (and no risk of degrading a small logo/graphic).
const PASSTHROUGH_BYTES = 4 * 1024 * 1024

export async function downscaleImage(file: File): Promise<File> {
  if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) return file

  try {
    const bitmap = await createImageBitmap(file)
    const largestSide = Math.max(bitmap.width, bitmap.height)
    const scale = Math.min(1, MAX_DIM / largestSide)

    // Already within bounds and small enough -- leave it exactly as-is.
    if (scale >= 1 && file.size <= PASSTHROUGH_BYTES) {
      bitmap.close?.()
      return file
    }

    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', QUALITY)
    )
    if (!blob || blob.size >= file.size) return file // no gain -> keep original

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
    return new File([blob], name, { type: 'image/webp', lastModified: Date.now() })
  } catch {
    return file
  }
}
