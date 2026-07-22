// Generates web-sized logo + favicon from the full-resolution source.
//
//   node scripts/optimize-brand-images.mjs
//
// The source is 1024x1024. The header renders the logo at 46px tall and the
// favicon shows at 16-32px, so shipping the full-res file wastes ~1.5MB per
// asset on every page view. These outputs are sized for 3x retina and no more.

import sharp from 'sharp'
import { statSync } from 'node:fs'

const SRC = 'public/images/syndesi-logo.png'

const OUTPUTS = [
  // 192px covers a 46-64px display size at 3x device pixel ratio.
  { file: 'public/images/syndesi-logo-web.png', size: 192 },
  // 64px covers a 32px favicon at 2x.
  { file: 'public/images/syndesi-favicon.png', size: 64 },
]

const kb = (p) => Math.round(statSync(p).size / 1024)

console.log(`source: ${SRC} (${kb(SRC)} KB)\n`)

for (const { file, size } of OUTPUTS) {
  await sharp(SRC)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(file)
  console.log(`  ${file}  ->  ${size}x${size}px, ${kb(file)} KB`)
}
