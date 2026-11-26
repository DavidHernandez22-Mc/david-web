// Genera la marca DavidHC Webs a partir del monograma "DH" (propuesta B, "Arco"):
// logotipo horizontal en trazos (no depende de la fuente), favicons (svg, png e ico), iconos de app,
// imágenes Open Graph y la carpeta marca/ con los archivos para usar fuera de la web.
// Uso: npm run brand
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { chromium } from 'playwright';

const INK = '#050f16';
const ORANGE = '#ff7a1f';
const WHITE = '#ffffff';
const load = (w) => {
  const buf = readFileSync(`node_modules/@fontsource/red-hat-display/files/red-hat-display-latin-${w}-normal.woff`);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const black = load(900);
const medium = load(500);
const light = load(400);

// toPathData de opentype.js devuelve NaN con algunos valores; este serializador no.
const n = (v) => +v.toFixed(2);
const toD = (path) => path.commands.map((c) => {
  if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`;
  if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
  if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
  return 'Z';
}).join('');

// Texto en trazos, letra por letra, con su caja. tracking en em.
const glyphRun = (font, text, size, x, y, tracking = -0.03) => {
  let cx = x;
  const pieces = [];
  const all = new opentype.Path();
  const glyphs = font.stringToGlyphs(text);
  glyphs.forEach((g, i) => {
    const p = g.getPath(cx, y, size);
    pieces.push(p);
    all.extend(p);
    const kern = i < glyphs.length - 1 ? Number(font.getKerningValue(g, glyphs[i + 1])) || 0 : 0;
    cx += (((g.advanceWidth || 0) + kern) / font.unitsPerEm + tracking) * size;
  });
  return { pieces, bb: all.getBoundingBox(), width: cx - x };
};
const pathOf = (font, text, size, x, y, tracking) => {
  const r = glyphRun(font, text, size, x, y, tracking);
  return { d: r.pieces.map(toD).join(''), width: r.width };
};

// ---------- Monograma B "Arco" ----------
// Lienzo 100 × 100; ocupa x 10–90, y 20–80. Trazo uniforme de 12. Relleno con regla nonzero:
// la D y los palos van en sentido horario y el hueco de la D en antihorario.
const MARK = 'M10 20H34A30 30 0 0 1 34 80H10Z'
  + 'M22 32V68H34A18 18 0 0 0 34 32Z'
  + 'M52 20H64V80H52Z'
  + 'M78 20H90V80H78Z'
  + 'M64 44H78V56H64Z';
const MB = { x: 10, y: 20, w: 80, h: 60 };

// Monograma dentro de un cuadrado de 100 con un fondo: k escala el monograma alrededor del centro.
const tile = (bg, fg, k = 1, shape = 'square') => {
  const back = shape === 'circle' ? `<circle cx="50" cy="50" r="50" fill="${bg}"/>` : `<rect width="100" height="100" fill="${bg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${back}<path fill="${fg}" transform="translate(50 50) scale(${k}) translate(-50 -50)" d="${MARK}"/></svg>`;
};

// ---------- Logotipo horizontal: monograma + "DavidHC" + "WEBS" ----------
// "DavidHC" en 900; "WEBS" en 400 (en 300 se pierde a tamaño de header), espaciada hasta igualar el ancho de "DavidHC".
const word = glyphRun(black, 'DavidHC', 100, 0, 0, -0.03);
const wordW = word.bb.x2 - word.bb.x1;
const WEBS_SIZE = 46;
const websNat = glyphRun(light, 'WEBS', WEBS_SIZE, 0, 0, 0);
const websTrack = (wordW - (websNat.bb.x2 - websNat.bb.x1)) / 3 / WEBS_SIZE;
const websProbe = glyphRun(light, 'WEBS', WEBS_SIZE, 0, 0, websTrack);
const websY = 24 - websProbe.bb.y1; // 24 unidades bajo la línea base de "DavidHC"
const webs = glyphRun(light, 'WEBS', WEBS_SIZE, word.bb.x1 - websProbe.bb.x1, websY, websTrack);
const blockTop = word.bb.y1;
const blockH = webs.bb.y2 - blockTop;
const markScale = blockH / MB.h;
const markW = MB.w * markScale;
const gap = blockH * 0.32;
const tx = markW + gap - word.bb.x1;
const LOCK_W = Math.ceil(markW + gap + wordW);
const LOCK_H = Math.ceil(blockH);
const lock = {
  w: LOCK_W,
  h: LOCK_H,
  markTransform: `scale(${n(markScale)}) translate(${-MB.x} ${-MB.y})`,
  textTransform: `translate(${n(tx)} ${n(-blockTop)})`,
  mark: MARK,
  david: word.pieces.slice(0, 5).map(toD).join(''),
  hc: word.pieces.slice(5).map(toD).join(''),
  webs: webs.pieces.map(toD).join(''),
};
const lockupSvg = ({ mark, david, hc, websC }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOCK_W} ${LOCK_H}" role="img" aria-label="DavidHC Webs">`
  + `<path fill="${mark}" transform="${lock.markTransform}" d="${MARK}"/>`
  + `<g transform="${lock.textTransform}"><path fill="${david}" d="${lock.david}"/><path fill="${hc}" d="${lock.hc}"/><path fill="${websC}" d="${lock.webs}"/></g></svg>`;
const V = {
  oscuro: { mark: ORANGE, david: WHITE, hc: ORANGE, websC: WHITE },
  claro: { mark: ORANGE, david: INK, hc: ORANGE, websC: INK },
  'una-tinta': { mark: INK, david: INK, hc: INK, websC: INK },
  'una-tinta-blanco': { mark: WHITE, david: WHITE, hc: WHITE, websC: WHITE },
};

// Para el header y el menú: todo en currentColor, porque van sobre el campo de color del hero.
writeFileSync('src/components/logo-paths.json', JSON.stringify(lock));
writeFileSync('public/logo.svg', lockupSvg(V.claro));

// ---------- Favicons e iconos: monograma en tinta sobre naranja ----------
const FAV = tile(ORANGE, INK, 1.1); // en pequeño el monograma llena casi todo el cuadrado
const ICON = tile(ORANGE, INK, 0.86); // iconos de app: margen para el recorte redondeado del sistema
writeFileSync('public/favicon.svg', FAV);
const png = (svg, size) => sharp(Buffer.from(svg), { density: 72 * Math.max(1, size / 100) }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
writeFileSync('public/favicon-32.png', await png(FAV, 32));
writeFileSync('public/favicon-48.png', await png(FAV, 48));
writeFileSync('public/apple-touch-icon.png', await png(ICON, 180));
writeFileSync('public/icon-192.png', await png(ICON, 192));
writeFileSync('public/icon-512.png', await png(ICON, 512));

// favicon.ico con PNG dentro (16, 32 y 48 px): los navegadores lo piden aunque haya svg.
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((s) => png(FAV, s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(icoSizes.length, 4);
let offset = 6 + 16 * icoSizes.length;
const entries = pngs.map((p, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i] % 256, 0); e.writeUInt8(icoSizes[i] % 256, 1);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(p.length, 8); e.writeUInt32LE(offset, 12);
  offset += p.length;
  return e;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...entries, ...pngs]));

// ---------- Logotipo gigante del pie: "DavidHC Webs" en una línea ----------
const bigName = pathOf(black, 'DavidHC', 100, 0, 76, -0.045);
const bigWebs = pathOf(medium, 'Webs', 100, bigName.width + 24, 76, -0.04);
writeFileSync('src/components/wordmark.json', JSON.stringify({ w: Math.ceil(bigName.width + 24 + bigWebs.width) + 2, d: bigName.d + bigWebs.d }));

// ---------- Carpeta marca/: archivos para usar fuera de la web ----------
mkdirSync('marca', { recursive: true });
// WhatsApp recorta la foto en círculo: la versión cuadrada se ve como círculo naranja y no deja esquinas
// transparentes (que algunas apps pintan de negro). La versión circular es para otros usos.
const AVATAR = tile(ORANGE, INK, 0.72);
await sharp(Buffer.from(AVATAR), { density: 72 * 6.4 }).resize(640, 640).png().toFile('marca/avatar-whatsapp-640.png');
await sharp(Buffer.from(tile(ORANGE, INK, 0.72, 'circle')), { density: 72 * 6.4 }).resize(640, 640).png().toFile('marca/avatar-whatsapp-640-circulo.png');
writeFileSync('marca/monograma.svg', tile(ORANGE, INK, 1.1));
for (const [name, colors] of Object.entries(V)) {
  const svg = lockupSvg(colors);
  writeFileSync(`marca/logo-horizontal-${name}.svg`, svg);
  const PNG_W = 2400;
  await sharp(Buffer.from(svg), { density: 72 * (PNG_W / LOCK_W) }).resize(PNG_W).png({ compressionLevel: 9 }).toFile(`marca/logo-horizontal-${name}.png`);
}

// ---------- Imágenes Open Graph 1200×630 ----------
// Campo naranja, la frase del hero, la escena de dispositivos y el logotipo a una tinta.
const fontB64 = (f) => readFileSync(`public/fonts/${f}.woff2`).toString('base64');
const img = (id, v, wd) => `data:image/webp;base64,${readFileSync(`public/demos/${id}-${v}-${wd}.webp`).toString('base64')}`;
const og = (lead, word2, url) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:D;src:url(data:font/woff2;base64,${fontB64('display')});font-weight:300 900}
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:${ORANGE};color:${INK};font-family:D;overflow:hidden;position:relative}
h1{position:absolute;left:64px;top:64px;width:640px;font:900 92px/.9 D;letter-spacing:-.05em}
.logo{position:absolute;left:64px;bottom:56px;height:64px;width:auto}
.url{position:absolute;right:64px;bottom:64px;font:800 26px/1 D;letter-spacing:-.01em}
.lap{position:absolute;right:-40px;top:70px;width:560px;background:${INK};padding:12px 12px 0;border-radius:12px 12px 0 0;box-shadow:0 40px 80px -30px rgb(5 15 22/.45);transform:rotate(-2deg)}
.lap img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top}
.ph{position:absolute;right:300px;top:150px;width:190px;background:${INK};border-radius:30px;padding:8px;box-shadow:0 30px 60px -20px rgb(5 15 22/.5);transform:rotate(5deg)}
.ph img{display:block;width:100%;aspect-ratio:390/844;object-fit:cover;object-position:top;border-radius:23px}
</style></head><body>
<h1>${lead} ${word2}.</h1>
<div class="lap"><img src="${img('odontologia', 'desktop', 960)}"></div>
<div class="ph"><img src="${img('restaurante', 'mobile', 390)}"></div>
${lockupSvg(V['una-tinta']).replace('<svg ', '<svg class="logo" ')}
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
  const shot = await page.screenshot({ type: 'png' });
  await sharp(shot).png({ quality: 86, compressionLevel: 9, palette: true }).toFile(`public/${file}.png`);
}
await browser.close();
console.log('marca lista', { lockup: `${LOCK_W}×${LOCK_H}` });
