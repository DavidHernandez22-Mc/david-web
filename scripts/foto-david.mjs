// Prepara la foto de "Sobre mí": recorte 4:5 centrado en la cara, fondo levemente desenfocado
// y webp sin metadatos (EXIF/GPS) en public/assets/foto-david.webp.
// Uso: node scripts/foto-david.mjs ruta/a/foto.jpg [vista-previa.jpg]
// Los números del recorte y de la máscara están medidos para la foto actual (1500×2000, atardecer).
import sharp from 'sharp';

const [src, preview] = process.argv.slice(2);
if (!src) {
  console.error('Uso: node scripts/foto-david.mjs ruta/a/foto.jpg');
  process.exit(1);
}

const W = 576;
const H = 720;
// Centrado en la cara (x ≈ 708); termina justo debajo del cuello en V de la camisa.
const crop = { left: 420, top: 660, width: W, height: H };

const sharpBuf = await sharp(src).rotate().extract(crop).removeAlpha().toBuffer();
const blurred = await sharp(sharpBuf).blur(5).toBuffer();

// Máscara: blanco = persona nítida, negro = fondo desenfocado. Bordes muy suaves para que no se note el corte.
const maskSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#000"/>
  <ellipse cx="286" cy="190" rx="150" ry="190" fill="#fff"/>
  <polygon points="183,320 388,320 438,410 576,480 576,720 0,720 0,510 138,410" fill="#fff"/>
</svg>`);
const mask = await sharp(maskSvg).blur(20).extractChannel(0).raw().toBuffer();

const person = await sharp(sharpBuf).joinChannel(mask, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
const final = sharp(blurred).composite([{ input: person }]);

const info = await final.clone().webp({ quality: 80, effort: 6 }).toFile('public/assets/foto-david.webp');
console.log(`public/assets/foto-david.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`);
if (preview) await final.clone().jpeg({ quality: 88 }).toFile(preview);
