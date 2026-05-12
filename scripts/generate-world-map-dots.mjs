/**
 * Regenera `public/generated/world-map-dots.svg` desde `dotted-map` (mismos parámetros que WorldMap).
 * Requiere: `npm install` con `dotted-map` en devDependencies.
 * Ejecutar tras cambiar radio/color/grid en `src/components/ui/world-map.tsx`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import DottedMap from 'dotted-map';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'generated');
const outFile = join(outDir, 'world-map-dots.svg');

const map = new DottedMap({ height: 72, grid: 'diagonal' });
const svg = map.getSVG({
  radius: 0.22,
  color: '#9ca3af66',
  shape: 'circle',
  backgroundColor: 'transparent',
});

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, svg, 'utf8');
console.log('Wrote', outFile, `(${svg.length} bytes)`);
