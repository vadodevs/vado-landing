/**
 * Genera `public/ai-section.webp` desde `public/ai-section.png` (más liviano que ~440 KiB PNG).
 * Ejecutar tras cambiar el PNG: `node scripts/optimize-ai-section.mjs`
 */
import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const input = join(root, 'public', 'ai-section.png');
const output = join(root, 'public', 'ai-section.webp');

const meta = await sharp(input).metadata();
const maxW = 1280;
const w = meta.width && meta.width > maxW ? maxW : meta.width ?? maxW;

await sharp(input)
  .resize(w, null, { withoutEnlargement: true })
  .webp({ quality: 82, effort: 6 })
  .toFile(output);

const { size } = await import('node:fs/promises').then((fs) => fs.stat(output));
console.log('Wrote', output, `${(size / 1024).toFixed(1)} KiB (from PNG ${meta.width}x${meta.height})`);
