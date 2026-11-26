// Genera la marca DavidHC Webs: logotipo en trazos (no depende de la fuente), símbolo "dh",
// favicons (svg, png e ico), iconos de app e imágenes Open Graph.
// Uso: npm run brand
import { readFileSync, writeFileSync } from 'node:fs';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { chromium } from 'playwright';

const INK = '#050f16';
const ORANGE = '#ff7a1f';
const load = (w) => {
  const buf = readFileSync(`node_modules/@fontsource/red-hat-display/files/red-hat-display-latin-${w}-normal.woff`);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const black = load(900);
const medium = load(500);

// toPathData de opentype.js devuelve NaN con algunos valores; este serializador no.
const n = (v) => +v.toFixed(2);
const toD = (path) => path.commands.map((c) => {
  if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`;
  if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
  if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
  return 'Z';
}).join('');

const pathOf = (font, text, size, x, y, tracking = -0.03) => {
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

// Símbolo: cuadrado naranja de esquinas rectas con "dh" en tinta, centrado ópticamente.
const BOX = 64;
const dhSize = 40;
const dhProbe = pathOf(black, 'dh', dhSize, 0, 0, -0.04);
const bbox = (() => {
  const p = new opentype.Path();
  let cx = 0;
  black.stringToGlyphs('dh').forEach((g, i, arr) => {
    p.extend(g.getPath(cx, 0, dhSize));
    const kern = i < arr.length - 1 ? Number(black.getKerningValue(g, arr[i + 1])) || 0 : 0;
    cx += (((g.advanceWidth || 0) + kern) / black.unitsPerEm - 0.04) * dhSize;
  });
  return p.getBoundingBox();
})();
const dhX = (BOX - (bbox.x2 - bbox.x1)) / 2 - bbox.x1;
const dhY = (BOX - (bbox.y2 - bbox.y1)) / 2 - bbox.y1;
const dh = pathOf(black, 'dh', dhSize, dhX, dhY, -0.04).d;
void dhProbe;
const mark = (bg, fg) => `<rect width="${BOX}" height="${BOX}" fill="${bg}"/><path fill="${fg}" d="${dh}"/>`;

// Favicon SVG y variantes raster.
writeFileSync('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">${mark(ORANGE, INK)}</svg>`);
const square = (size) => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">${mark(ORANGE, INK)}</svg>`)).resize(size, size).png().toBuffer();
const padded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 88 88"><rect x="-12" y="-12" width="88" height="88" fill="${ORANGE}"/>${mark(ORANGE, INK)}</svg>`;
await sharp(Buffer.from(padded)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(padded)).resize(192, 192).png().toFile('public/icon-192.png');
await sharp(Buffer.from(padded)).resize(512, 512).png().toFile('public/icon-512.png');
writeFileSync('public/favicon-48.png', await square(48));

// favicon.ico con PNG dentro (16, 32 y 48 px): los navegadores lo piden aunque haya svg.
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map(square));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(icoSizes.length, 4);
let offset = 6 + 16 * icoSizes.length;
const entries = pngs.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i] % 256, 0); e.writeUInt8(icoSizes[i] % 256, 1);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...entries, ...pngs]));

// Logotipo horizontal: símbolo + "DavidHC" (900) + " Webs" (500), en currentColor.
const nameSize = 34;
const baseline = 45;
const name = pathOf(black, 'DavidHC', nameSize, 80, baseline);
const webs = pathOf(medium, 'Webs', nameSize, 80 + name.width + nameSize * 0.26, baseline);
const w = Math.ceil(80 + name.width + nameSize * 0.26 + webs.width + 2);
const logoSvg = (fg, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${BOX}" role="img"><rect width="${BOX}" height="${BOX}" fill="${ORANGE}"/><path fill="${INK}" d="${dh}"/><path fill="${fg}" d="${name.d}"/><path fill="${fg}" d="${webs.d}"/>${bg ? '' : ''}</svg>`;
writeFileSync('public/logo.svg', logoSvg(INK));
writeFileSync('src/components/logo-paths.json', JSON.stringify({ w, box: BOX, dh, name: name.d, webs: webs.d }));

// Logotipo gigante del pie: "DavidHC Webs" en una línea.
const bigName = pathOf(black, 'DavidHC', 100, 0, 76, -0.045);
const bigWebs = pathOf(medium, 'Webs', 100, bigName.width + 24, 76, -0.04);
writeFileSync('src/components/wordmark.json', JSON.stringify({ w: Math.ceil(bigName.width + 24 + bigWebs.width) + 2, d: bigName.d + bigWebs.d }));

// Imágenes Open Graph 1200×630: campo naranja, la frase del hero y la escena de dispositivos.
const fontB64 = (f) => readFileSync(`public/fonts/${f}.woff2`).toString('base64');
const img = (id, v, wd) => `data:image/webp;base64,${readFileSync(`public/demos/${id}-${v}-${wd}.webp`).toString('base64')}`;
const og = (lead, word, url) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:D;src:url(data:font/woff2;base64,${fontB64('display')});font-weight:300 900}
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:${ORANGE};color:${INK};font-family:D;overflow:hidden;position:relative}
h1{position:absolute;left:64px;top:64px;width:640px;font:900 92px/.9 D;letter-spacing:-.05em}
.logo{position:absolute;left:64px;bottom:56px;height:52px}
.url{position:absolute;right:64px;bottom:64px;font:800 26px/1 D;letter-spacing:-.01em}
.lap{position:absolute;right:-40px;top:70px;width:560px;background:${INK};padding:12px 12px 0;border-radius:12px 12px 0 0;box-shadow:0 40px 80px -30px rgb(5 15 22/.45);transform:rotate(-2deg)}
.lap img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top}
.ph{position:absolute;right:300px;top:150px;width:190px;background:${INK};border-radius:30px;padding:8px;box-shadow:0 30px 60px -20px rgb(5 15 22/.5);transform:rotate(5deg)}
.ph img{display:block;width:100%;aspect-ratio:390/844;object-fit:cover;object-position:top;border-radius:23px}
</style></head><body>
<h1>${lead} ${word}.</h1>
<div class="lap"><img src="${img('odontologia', 'desktop', 960)}"></div>
<div class="ph"><img src="${img('restaurante', 'mobile', 390)}"></div>
<svg class="logo" viewBox="0 0 ${w} ${BOX}"><rect width="${BOX}" height="${BOX}" fill="${INK}"/><path fill="${ORANGE}" d="${dh}"/><path fill="${INK}" d="${name.d}"/><path fill="${INK}" d="${webs.d}"/></svg>
<p class="url">${url}</p>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [file, html] of [
  ['og-es', og('Páginas web para tu', 'negocio', 'davidhcwebs.com')],
  ['og-en', og('A website for your', 'business', 'davidhcwebs.com/en')],
]) {
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).png({ quality: 86, compressionLevel: 9, palette: true }).toFile(`public/${file}.png`);
}
await browser.close();
console.log('marca lista');
