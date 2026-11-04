// raw-captures/*.png → public/demos/*.webp en los anchos que usa el srcset.
import sharp from 'sharp';
import { existsSync } from 'node:fs';

const ids = ['odontologia', 'restaurante', 'inmobiliaria', 'veterinaria', 'estetica'];
const sizes = { mobile: [260, 390, 560], desktop: [640, 960, 1440] };
for (const id of ids) {
  for (const [v, widths] of Object.entries(sizes)) {
    const src = `raw-captures/${id}-${v}.png`;
    if (!existsSync(src)) { console.log('falta', src); continue; }
    for (const w of widths) {
      const out = `public/demos/${id}-${v}-${w}.webp`;
      const info = await sharp(src).resize({ width: w }).webp({ quality: 74, effort: 6 }).toFile(out);
      console.log(out, Math.round(info.size / 1024) + 'KB');
    }
  }
}
