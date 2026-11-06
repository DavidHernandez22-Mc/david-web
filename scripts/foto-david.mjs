// Prepara la foto de "Sobre mí": recorte 4:5 centrado en la cara, fondo levemente desenfocado
// y webp sin metadatos (EXIF/GPS) en public/assets/foto-david.webp.
// Uso: node scripts/foto-david.mjs ruta/a/foto.jpg [vista-previa.jpg]
// Los números del recorte y de la máscara están medidos para la foto original de 1340×1777.
import sharp from 'sharp';

const [src, preview] = process.argv.slice(2);
if (!src) {
  console.error('Uso: node scripts/foto-david.mjs ruta/a/foto.jpg');
  process.exit(1);
}

const W = 600;
const H = 750;
// Termina justo debajo del nudo de la corbata (y ≈ 1405 en la original) para mostrar poco la banda roja.
const crop = { left: 330, top: 670, width: W, height: H };

const sharpBuf = await sharp(src).rotate().extract(crop).removeAlpha().toBuffer();
const blurred = await sharp(sharpBuf).blur(5).toBuffer();

// Máscara: blanco = persona nítida, negro = fondo desenfocado. Bordes muy suaves para que no se note el corte.
const maskSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#000"/>
  <ellipse cx="296" cy="318" rx="190" ry="275" fill="#fff"/>
  <polygon points="175,500 430,500 560,610 600,650 600,750 0,750 0,660 60,610" fill="#fff"/>
</svg>`);
const mask = await sharp(maskSvg).blur(22).extractChannel(0).raw().toBuffer();

const person = await sharp(sharpBuf).joinChannel(mask, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
const final = sharp(blurred).composite([{ input: person }]);

const info = await final.clone().webp({ quality: 80, effort: 6 }).toFile('public/assets/foto-david.webp');
console.log(`public/assets/foto-david.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`);
if (preview) await final.clone().jpeg({ quality: 88 }).toFile(preview);
