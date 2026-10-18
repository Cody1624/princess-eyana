/** Make browser-safe copies from the originals; never modify the originals. */
import { readdir, mkdir, writeFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('public');
const output = path.join(root, 'photos');
await mkdir(output, { recursive: true });
const originals = (await readdir(root))
  .filter(name => /^\d+_/.test(name) && /\.(jpe?g|png|heic|webp)$/i.test(name))
  .sort((a, b) => Number(a.split('_')[0]) - Number(b.split('_')[0]));
const prepared = [];
for (const filename of [...originals, 'final_photo.JPG']) {
  const target = filename === 'final_photo.JPG' ? 'finale.jpg' : `memory${String(Number(filename.split('_')[0])).padStart(2, '0')}.jpg`;
  // libvips decodes the original JPEG, bakes in EXIF orientation, and converts
  // wide-gamut profiles to sRGB. Avoid the macOS conversion path that made black copies.
  const data = await sharp(path.join(root, filename))
    .rotate()
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .toColourspace('srgb')
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  const stats = await sharp(data).stats();
  if (stats.channels.every(channel => channel.stdev < 0.5)) {
    throw new Error(`Refusing to save a blank photo: ${filename}`);
  }
  prepared.push({ target, data });
}
// Validate every conversion before replacing any existing game photos.
for (const { target, data } of prepared) {
  const temp = path.join(output, `${target}.tmp`);
  try {
    await writeFile(temp, data);
    await rename(temp, path.join(output, target));
  } finally {
    await rm(temp, { force: true });
  }
}
console.log(`Prepared and pixel-checked ${originals.length} memories plus the finale. Originals unchanged.`);
