// Genera el logo (texto convertido a trazos), favicons e imágenes Open Graph.
// Uso: npm run brand (con `npm run build` hecho no es necesario; no depende del build).
import { readFileSync, writeFileSync } from 'node:fs';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { chromium } from 'playwright';

const INK = '#050f16';
const ORANGE = '#ff7a1f';
const buf = readFileSync('node_modules/@fontsource/red-hat-display/files/red-hat-display-latin-900-normal.woff');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// toPathData de opentype.js devuelve NaN con algunos valores; este serializador no.
const n = (v) => +v.toFixed(2);
const toD = (path) => path.commands.map((c) => {
  if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`;
  if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
  if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
  return 'Z';
}).join('');

const pathOf = (text, size, x, y, tracking = -0.03) => {
  let cx = x;
  let d = '';
  const glyphs = font.stringToGlyphs(text);
  glyphs.forEach((g, i) => {
    d += toD(g.getPath(cx, y, size));
    const kern = i < glyphs.length - 1 ? Number(font.getKerningValue(g, glyphs[i + 1])) || 0 : 0;
    cx += (((g.advanceWidth || 0) + kern) / font.unitsPerEm + tracking) * size;
  });
  return { d, width: cx - x };
};

// La marca: una "d" dentro de un globo de mensaje, porque todo en esta web termina en un mensaje.
// El globo es un cuadrado de esquinas rectas con una sola cola, igual que las burbujas del sitio.
const bubble = 'M0 0H64V54H22L8 66V54H0Z';
const d = pathOf('d', 54, 0, 0, 0);
const dBox = font.charToGlyph('d').getMetrics();
const scale = 54 / font.unitsPerEm;
const dW = (dBox.xMax - dBox.xMin) * scale;
const dH = (dBox.yMax - dBox.yMin) * scale;
const dX = (64 - dW) / 2 - dBox.xMin * scale;
const dY = (54 + dH) / 2 + dBox.yMin * scale;
const dPath = pathOf('d', 54, dX, dY, 0).d;
void d;

const mark = (bg, fg) => `<path fill="${bg}" d="${bubble}"/><path fill="${fg}" d="${dPath}"/>`;

// Favicon SVG y variantes raster.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -5 76 76"><style>.b{fill:${ORANGE}}.d{fill:${INK}}@media(prefers-color-scheme:dark){.b{fill:${ORANGE}}}</style><path class="b" d="${bubble}"/><path class="d" d="${dPath}"/></svg>`;
writeFileSync('public/favicon.svg', faviconSvg);
const flat = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -11 92 92"><rect x="-14" y="-11" width="92" height="92" fill="${INK}"/>${mark(ORANGE, INK)}</svg>`;
await sharp(Buffer.from(flat)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(flat)).resize(192, 192).png().toFile('public/icon-192.png');
await sharp(Buffer.from(flat)).resize(512, 512).png().toFile('public/icon-512.png');
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -5 76 76">${mark(ORANGE, INK)}</svg>`)).resize(48, 48).png().toFile('public/favicon-48.png');

// Logo horizontal: marca + nombre + descriptor. Usa currentColor para seguir el color del hero.
const name = pathOf('David Hernández', 40, 80, 36);
const tag = pathOf('Webs para negocios', 24, 80, 63, -0.005);
const tagEn = pathOf('Websites for businesses', 24, 80, 63, -0.005);
const w = Math.ceil(Math.max(name.width, tag.width, tagEn.width) + 84);
const logo = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 68" role="img"><path fill="currentColor" d="${bubble}"/><path fill="var(--logo-cut, #fff)" d="${dPath}"/><path fill="currentColor" d="${name.d}"/><path fill="currentColor" d="${t.d}"/></svg>`;
writeFileSync('public/logo.svg', logo(tag).replace(/currentColor/g, INK).replace('var(--logo-cut, #fff)', '#fff'));
writeFileSync('public/logo-en.svg', logo(tagEn).replace(/currentColor/g, INK).replace('var(--logo-cut, #fff)', '#fff'));
writeFileSync('src/components/logo-paths.json', JSON.stringify({ w, bubble, d: dPath, name: name.d, tag: { es: tag.d, en: tagEn.d } }));
const nameBig = pathOf('David Hernández', 100, 0, 76);
writeFileSync('src/components/wordmark.json', JSON.stringify({ w: Math.ceil(nameBig.width) + 2, d: nameBig.d }));

// Imagen Open Graph 1200×630: el mismo gesto del hero, teléfono con demo real y burbuja de mensaje.
const fontB64 = (f) => readFileSync(`public/fonts/${f}.woff2`).toString('base64');
const img = (id) => `data:image/webp;base64,${readFileSync(`public/demos/${id}-mobile-560.webp`).toString('base64')}`;
const og = (title, tagline, msg) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:D;src:url(data:font/woff2;base64,${fontB64('display')});font-weight:300 900}
@font-face{font-family:T;src:url(data:font/woff2;base64,${fontB64('text')});font-weight:300 700}
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:${ORANGE};color:${INK};font-family:T;overflow:hidden;position:relative}
.logo{position:absolute;left:64px;top:56px;width:400px;color:${INK}}
h1{position:absolute;left:64px;top:172px;width:720px;font:900 70px/1 D;letter-spacing:-.035em;text-wrap:balance}
.b{position:absolute;left:64px;bottom:60px;background:#fff;padding:18px 24px;font-size:26px;font-weight:500;line-height:1.25;width:700px}
.p{position:absolute;width:300px;height:650px;background:${INK};border-radius:44px;padding:10px;top:60px}
.p img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:35px;display:block}
.p1{right:64px;}
</style></head><body>
<div class="logo">${logo(tag === tagline ? tag : tagline).replace('var(--logo-cut, #fff)', ORANGE)}</div>
<h1>${title}</h1><div class="b">${msg}</div>
<div class="p p1"><img src="${img('restaurante')}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [file, html] of [
  ['og-es', og('Tu negocio, con una web que trae clientes por WhatsApp.', tag, 'Hola David, vi tu página y quiero una web para mi negocio.')],
  ['og-en', og('A website that brings customers to your WhatsApp.', tagEn, 'Hi David, I saw your site and I’d like a website for my business.')],
]) {
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).png({ quality: 88, compressionLevel: 9, palette: true }).toFile(`public/${file}.png`);
}
await browser.close();
console.log('marca lista');
