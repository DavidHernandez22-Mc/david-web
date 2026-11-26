// Propuestas de monograma "DH" para DavidHC Webs (no integradas en la web).
// Genera logo-propuestas/logo-propuestas.html (página de comparación) y logo-propuestas/svg/*.svg.
// Uso, desde la raíz del repo: node logo-propuestas/build.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import opentype from 'opentype.js';

const OUT = 'logo-propuestas';
const INK = '#050f16';
const ORANGE = '#ff7a1f';
const WHITE = '#ffffff';

// ---------- Texto en trazos (Red Hat Display, la fuente de la web) ----------
const load = (w) => {
  const buf = readFileSync(`node_modules/@fontsource/red-hat-display/files/red-hat-display-latin-${w}-normal.woff`);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const black = load(900);
const light = load(300);

const n = (v) => +v.toFixed(2);
const toD = (path) => path.commands.map((c) => {
  if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`;
  if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
  if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
  return 'Z';
}).join('');

// Devuelve el trazado y la caja real de un texto; tracking en em.
const text = (font, str, size, tracking) => {
  const p = new opentype.Path();
  let cx = 0;
  const glyphs = font.stringToGlyphs(str);
  const pieces = [];
  glyphs.forEach((g, i) => {
    const gp = g.getPath(cx, 0, size);
    pieces.push(gp);
    p.extend(gp);
    const kern = i < glyphs.length - 1 ? Number(font.getKerningValue(g, glyphs[i + 1])) || 0 : 0;
    cx += (((g.advanceWidth || 0) + kern) / font.unitsPerEm + tracking) * size;
  });
  const bb = p.getBoundingBox();
  return { pieces, bb };
};

// "DavidHC": David y HC por separado para poder colorearlos.
const DH_SIZE = 100;
const word = text(black, 'DavidHC', DH_SIZE, -0.03);
const davidD = word.pieces.slice(0, 5).map(toD).join('');
const hcD = word.pieces.slice(5).map(toD).join('');
const wordW = word.bb.x2 - word.bb.x1;
const wordTop = word.bb.y1;
const wordBottom = 0; // línea base: ninguna letra de "DavidHC" baja de ella

// "WEBS": fina (300) y espaciada hasta igualar el ancho de "DavidHC".
const WEBS_SIZE = 46;
const websNatural = text(light, 'WEBS', WEBS_SIZE, 0);
const websTrack = (wordW - (websNatural.bb.x2 - websNatural.bb.x1)) / 3 / WEBS_SIZE;
const webs = text(light, 'WEBS', WEBS_SIZE, websTrack);
const websCap = -webs.bb.y1;
const websGap = 24;
const websY = wordBottom + websGap + websCap; // línea base de WEBS
const websDx = word.bb.x1 - webs.bb.x1;
const websD = webs.pieces.map((p) => {
  p.commands.forEach((c) => {
    ['x', 'x1', 'x2'].forEach((k) => { if (k in c) c[k] += websDx; });
    ['y', 'y1', 'y2'].forEach((k) => { if (k in c) c[k] += websY; });
  });
  return toD(p);
}).join('');
const blockTop = wordTop;
const blockBottom = websY + webs.bb.y2;
const blockH = blockBottom - blockTop;

// ---------- Monogramas (lienzo 100 × 100) ----------
// Cada uno: draw(fg, cut) devuelve el SVG interior; box = caja visual; avatar = cómo va en círculo.
const S = 12; // grosor común
const strokeAttrs = (fg, w = S) => `fill="none" stroke="${fg}" stroke-width="${w}" stroke-linejoin="miter" stroke-miterlimit="4" stroke-linecap="butt"`;

const proposals = [
  {
    id: 'a',
    name: 'Chaflán',
    note: 'Letras separadas y rectas, con la D cortada a 45°. La más legible y la que mejor encaja con las esquinas rectas de la web.',
    box: [12, 20, 76, 60],
    draw: (fg) => `<g ${strokeAttrs(fg)}><path d="M18 26H30L40 36V64L30 74H18Z"/><path d="M60 20V80M82 20V80M60 50H82"/></g>`,
  },
  {
    id: 'b',
    name: 'Arco',
    note: 'La curva de la D se funde con el palo de la H y sigue en su travesaño: una sola línea que va de una letra a la otra.',
    box: [10, 20, 80, 60],
    draw: (fg) => `<g ${strokeAttrs(fg)}><path d="M16 26H34A24 24 0 0 1 34 74H16Z"/><path d="M58 20V80M84 20V80M58 50H84"/></g>`,
  },
  {
    id: 'c',
    name: 'Placa',
    note: 'Un cuadrado naranja con las letras en tinta, como un sello. Ocupa todo el espacio, así que es la que más pesa en pequeño.',
    box: [0, 0, 100, 100],
    solid: true,
    draw: (fg, cut) => `<rect width="100" height="100" fill="${fg}"/><g ${strokeAttrs(cut, 11)}><path d="M23.5 31.5H28.5A12 12 0 0 1 40.5 43.5V56.5A12 12 0 0 1 28.5 68.5H23.5Z"/><path d="M59.5 26V74M76.5 26V74M59.5 50H76.5"/></g>`,
  },
  {
    id: 'd',
    name: 'Píxel',
    note: 'Las dos letras construidas sobre una cuadrícula de 9 × 7 bloques, como en una pantalla. Directa y con un guiño a lo digital.',
    box: [0.5, 11.5, 99, 77],
    draw: (fg) => {
      const u = 11, x0 = 0.5, y0 = 11.5;
      const cells = [];
      for (let c = 0; c <= 2; c++) cells.push([c, 0], [c, 6]); // D: arriba y abajo
      for (let r = 1; r <= 5; r++) cells.push([0, r], [3, r]); // D: lados
      for (let r = 0; r <= 6; r++) cells.push([5, r], [8, r]); // H: palos
      cells.push([6, 3], [7, 3]); // H: travesaño
      // Une celdas contiguas por fila para que no queden costuras al escalar.
      const rows = {};
      cells.forEach(([c, r]) => { (rows[r] ||= new Set()).add(c); });
      let d = '';
      Object.entries(rows).forEach(([r, set]) => {
        const cs = [...set].sort((a, b) => a - b);
        let start = cs[0], prev = cs[0];
        const flush = () => { d += `M${x0 + start * u} ${y0 + r * u}h${(prev - start + 1) * u}v${u}h${-(prev - start + 1) * u}Z`; };
        cs.slice(1).forEach((c) => { if (c === prev + 1) prev = c; else { flush(); start = prev = c; } });
        flush();
      });
      return `<path fill="${fg}" d="${d}"/>`;
    },
  },
];

// ---------- Ensamblado de piezas ----------
const svg = (vb, inner, attrs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" ${attrs}>${inner}</svg>`;

// Monograma en su lienzo cuadrado completo (para favicon / tamaños fijos).
const markSquare = (p, fg, cut, label) => svg('0 0 100 100', p.draw(fg, cut), `role="img" aria-label="${label}"`);

// Monograma recortado a su caja visual (para el logo horizontal y vistas grandes).
const markTight = (p, fg, cut, label) => {
  const [x, y, w, h] = p.box;
  return svg(`${x} ${y} ${w} ${h}`, p.draw(fg, cut), `role="img" aria-label="${label}"`);
};

// Logo horizontal: monograma + DavidHC + WEBS.
const lockup = (p, { mark, cut, david, hc, websC }, label) => {
  const [bx, by, bw, bh] = p.box;
  const scale = blockH / bh;
  const mw = bw * scale;
  const gap = blockH * 0.32;
  const tx = mw + gap - word.bb.x1;
  const W = mw + gap + wordW;
  const inner = `<g transform="translate(0 0) scale(${n(scale)}) translate(${-bx} ${-by})">${p.draw(mark, cut)}</g>`
    + `<g transform="translate(${n(tx)} ${n(-blockTop)})"><path fill="${david}" d="${davidD}"/><path fill="${hc}" d="${hcD}"/><path fill="${websC}" d="${websD}"/></g>`;
  return svg(`0 0 ${n(W)} ${n(blockH)}`, inner, `role="img" aria-label="${label}"`);
};

// Avatar circular (foto de perfil de WhatsApp: la imagen se recorta en círculo).
const avatar = (p) => {
  if (p.solid) {
    // La placa llena el círculo: fondo naranja y letras en tinta, más grandes.
    return svg('0 0 100 100', `<circle cx="50" cy="50" r="50" fill="${ORANGE}"/><g transform="translate(50 50) scale(1.08) translate(-50 -50)">${p.draw('none', INK).replace('<rect width="100" height="100" fill="none"/>', '')}</g>`, 'role="img" aria-label="Avatar circular"');
  }
  const [x, y, w, h] = p.box;
  const target = 54; // ancho del monograma dentro del círculo de 100
  const s = target / Math.max(w, h);
  return svg('0 0 100 100', `<circle cx="50" cy="50" r="50" fill="${INK}"/><g transform="translate(${n(50 - (w * s) / 2)} ${n(50 - (h * s) / 2)}) scale(${n(s)}) translate(${-x} ${-y})">${p.draw(ORANGE, INK)}</g>`, 'role="img" aria-label="Avatar circular"');
};

const v = {
  dark: { mark: ORANGE, cut: INK, david: WHITE, hc: ORANGE, websC: WHITE },
  light: { mark: ORANGE, cut: INK, david: INK, hc: ORANGE, websC: INK },
  monoInk: { mark: INK, cut: WHITE, david: INK, hc: INK, websC: INK },
  monoWhite: { mark: WHITE, cut: INK, david: WHITE, hc: WHITE, websC: WHITE },
};

// ---------- Archivos SVG sueltos ----------
mkdirSync(`${OUT}/svg`, { recursive: true });
mkdirSync(`${OUT}/fonts`, { recursive: true });
copyFileSync('public/fonts/display.woff2', `${OUT}/fonts/display.woff2`);
copyFileSync('public/fonts/text.woff2', `${OUT}/fonts/text.woff2`);
proposals.forEach((p) => {
  const L = `DavidHC Webs, propuesta ${p.id.toUpperCase()}`;
  writeFileSync(`${OUT}/svg/${p.id}-monograma.svg`, markSquare(p, ORANGE, INK, L));
  writeFileSync(`${OUT}/svg/${p.id}-monograma-tinta.svg`, markSquare(p, INK, WHITE, L));
  writeFileSync(`${OUT}/svg/${p.id}-horizontal-oscuro.svg`, lockup(p, v.dark, L));
  writeFileSync(`${OUT}/svg/${p.id}-horizontal-claro.svg`, lockup(p, v.light, L));
  writeFileSync(`${OUT}/svg/${p.id}-horizontal-tinta.svg`, lockup(p, v.monoInk, L));
  writeFileSync(`${OUT}/svg/${p.id}-avatar.svg`, avatar(p));
});

// ---------- Página de comparación ----------
const L = (p) => `Monograma DH, propuesta ${p.id.toUpperCase()}`;
const LL = (p) => `DavidHC Webs, propuesta ${p.id.toUpperCase()}`;

const rows = [
  {
    title: 'Fondo oscuro',
    note: 'Tinta de la web, #050f16.',
    tone: 'ink',
    cell: (p) => `<div class="big">${markTight(p, ORANGE, INK, L(p))}</div><div class="lock">${lockup(p, v.dark, LL(p))}</div>`,
  },
  {
    title: 'Fondo blanco',
    note: 'David pasa a tinta; HC sigue en naranja.',
    tone: 'white',
    cell: (p) => `<div class="big">${markTight(p, ORANGE, INK, L(p))}</div><div class="lock">${lockup(p, v.light, LL(p))}</div>`,
  },
  {
    title: 'A 32 px',
    note: 'Tamaño real, como favicon o icono pequeño.',
    tone: 'split',
    cell: (p) => `<div class="px"><span class="on-ink">${markSquare(p, ORANGE, INK, L(p)).replace('<svg ', '<svg width="32" height="32" ')}</span><span class="on-white">${markSquare(p, ORANGE, INK, L(p)).replace('<svg ', '<svg width="32" height="32" ')}</span></div>
      <div class="tab"><span class="tab-icon">${markSquare(p, ORANGE, INK, L(p)).replace('<svg ', '<svg width="16" height="16" ')}</span><span>DavidHC Webs</span></div>`,
  },
  {
    title: 'A 64 px',
    note: 'Tamaño real, como icono de app o miniatura.',
    tone: 'split',
    cell: (p) => `<div class="px"><span class="on-ink">${markSquare(p, ORANGE, INK, L(p)).replace('<svg ', '<svg width="64" height="64" ')}</span><span class="on-white">${markSquare(p, ORANGE, INK, L(p)).replace('<svg ', '<svg width="64" height="64" ')}</span></div>`,
  },
  {
    title: 'En círculo',
    note: 'Foto de perfil de WhatsApp: grande y en la lista de chats.',
    tone: 'wa',
    cell: (p) => `<div class="wa">${avatar(p).replace('<svg ', '<svg class="av-lg" ')}<div class="chat">${avatar(p).replace('<svg ', '<svg class="av-sm" ')}<div><b>DavidHC Webs</b><span>Hola, quiero una página para mi negocio</span></div></div></div>`,
  },
  {
    title: 'Una sola tinta',
    note: 'Para sellos, grabados, impresión a un color.',
    tone: 'split-mono',
    cell: (p) => `<div class="mono"><div class="m-white">${markTight(p, INK, WHITE, L(p)).replace('<svg ', '<svg class="m-mark" ')}${lockup(p, v.monoInk, LL(p))}</div><div class="m-ink">${markTight(p, WHITE, INK, L(p)).replace('<svg ', '<svg class="m-mark" ')}${lockup(p, v.monoWhite, LL(p))}</div></div>`,
  },
];

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Logo DavidHC Webs: cuatro propuestas</title>
<style>
@font-face { font-family: 'Red Hat Display'; src: url('fonts/display.woff2') format('woff2'); font-weight: 300 900; font-display: swap; }
@font-face { font-family: 'Red Hat Text'; src: url('fonts/text.woff2') format('woff2'); font-weight: 300 700; font-display: swap; }
:root {
  --ink: ${INK}; --ink-2: #0f1d26; --white: #fff; --tone: #f1f2f0; --soft: #434c52; --on-ink-soft: #9aa3a8;
  --orange: ${ORANGE}; --orange-text: #b34d08; --wa-chat: #111b21;
  --gutter: clamp(16px, 3vw, 40px);
  --display: 'Red Hat Display', system-ui, sans-serif;
  --text: 'Red Hat Text', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
* { box-sizing: border-box; }
html { background: var(--tone); color: var(--ink); }
body { margin: 0; font-family: var(--text); font-size: 1.0625rem; line-height: 1.5; -webkit-font-smoothing: antialiased; }
::selection { background: var(--orange); color: var(--ink); }
svg { display: block; }

.top { background: var(--ink); color: var(--white); padding: clamp(40px, 6vw, 88px) var(--gutter) clamp(32px, 4vw, 56px); }
.top h1 { margin: 0; font-family: var(--display); font-weight: 900; font-size: clamp(2.5rem, 1rem + 5.5vw, 5.5rem); letter-spacing: -.045em; line-height: .92; max-width: 14ch; text-wrap: balance; }
.top p { margin: 20px 0 0; max-width: 58ch; color: var(--on-ink-soft); font-size: clamp(1.0625rem, 1rem + .3vw, 1.25rem); text-wrap: pretty; }
.top p strong { color: var(--white); font-weight: 600; }

.grid { display: grid; grid-template-columns: minmax(150px, 200px) repeat(4, minmax(0, 1fr)); gap: 6px; padding: 6px var(--gutter) var(--gutter); }
.head { position: sticky; top: 0; z-index: 2; background: var(--tone); padding: 20px 4px 14px; }
.head h2 { margin: 0; font-family: var(--display); font-weight: 900; font-size: clamp(1.5rem, 1rem + 1.4vw, 2.25rem); letter-spacing: -.035em; line-height: 1; }
.head h2 span { color: var(--orange-text); }
.head p { margin: 8px 0 0; font-size: .9375rem; line-height: 1.4; color: var(--soft); max-width: 36ch; text-wrap: pretty; }
.corner { position: sticky; top: 0; z-index: 2; background: var(--tone); }

.label { padding: 22px 4px; }
.label h3 { margin: 0; font-family: var(--display); font-weight: 900; font-size: 1.375rem; letter-spacing: -.025em; line-height: 1.05; }
.label p { margin: 6px 0 0; font-size: .9375rem; line-height: 1.4; color: var(--soft); }

/* La letra de la propuesta solo hace falta en celular, donde no hay cabecera de columnas. */
.tag { display: none; }
.cell { position: relative; min-height: 180px; padding: clamp(20px, 2.4vw, 36px); display: flex; flex-direction: column; justify-content: center; gap: 28px; }
.t-ink { background: var(--ink); }
.t-white { background: var(--white); }
.t-split, .t-split-mono { background: var(--white); padding: 0; }
.t-wa { background: var(--wa-chat); }

.big svg { height: clamp(72px, 7vw, 112px); width: auto; }
.lock svg { width: 100%; max-width: 340px; height: auto; }

.px { display: grid; grid-template-columns: 1fr 1fr; flex: 1; }
.px span { display: grid; place-items: center; min-height: 120px; }
.on-ink { background: var(--ink); }
.on-white { background: var(--white); }
.tab { display: flex; align-items: center; gap: 8px; margin: 0 16px 16px; padding: 8px 12px; background: #dfe3e6; font: 500 .8125rem/1 var(--text); color: var(--ink); width: fit-content; max-width: calc(100% - 32px); white-space: nowrap; overflow: hidden; }
.t-split:has(.tab) { gap: 0; }

.wa { display: grid; gap: 24px; justify-items: start; }
.av-lg { width: 112px; height: 112px; }
.chat { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; background: #202c33; color: #e9edef; min-width: 0; }
.av-sm { width: 48px; height: 48px; flex: none; }
.chat div { display: grid; min-width: 0; }
.chat b { font-weight: 600; font-size: 1rem; }
.chat span { font-size: .875rem; color: #8696a0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.mono { display: grid; flex: 1; }
.mono > div { display: flex; flex-direction: column; gap: 20px; padding: clamp(20px, 2.4vw, 32px); }
.m-white { background: var(--white); }
.m-ink { background: var(--ink); }
.m-mark { height: 56px; width: auto; }
.mono svg:not(.m-mark) { width: 100%; max-width: 260px; height: auto; }

.foot { padding: 0 var(--gutter) 48px; max-width: 80ch; color: var(--soft); font-size: .9375rem; }
.foot a { color: var(--ink); text-underline-offset: 3px; text-decoration-thickness: 2px; text-decoration-color: var(--orange); }
.foot a:focus-visible { outline: 3px solid var(--orange); outline-offset: 2px; }

@media (max-width: 960px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .corner { display: none; }
  .head { position: static; }
  .label { grid-column: 1 / -1; padding: 28px 4px 6px; }
  .tag { display: grid; place-items: center; position: absolute; top: 0; left: 0; z-index: 1; width: 28px; height: 28px; background: var(--orange); color: var(--ink); font: 900 .9375rem/1 var(--display); }
  .cell { padding-top: 40px; }
  .t-split, .t-split-mono { padding-top: 0; }
}
</style>
</head>
<body>
<header class="top">
  <h1>El logo de DavidHC Webs, en cuatro propuestas</h1>
  <p>Cada columna es una propuesta y cada fila, un lugar donde va a vivir el logo. Las letras están dibujadas en trazos, en el naranja <strong>#ff7a1f</strong> y la tinta <strong>#050f16</strong> de la web, con Red Hat Display. <strong>Todavía no está en la web:</strong> elige una y la integro.</p>
</header>
<main class="grid">
  <div class="corner" aria-hidden="true"></div>
  ${proposals.map((p) => `<div class="head"><h2><span>${p.id.toUpperCase()}</span> ${p.name}</h2><p>${p.note}</p></div>`).join('\n  ')}
  ${rows.map((r) => `<div class="label"><h3>${r.title}</h3><p>${r.note}</p></div>
  ${proposals.map((p) => `<div class="cell t-${r.tone}" aria-label="${r.title}, propuesta ${p.id.toUpperCase()}"><b class="tag" aria-hidden="true">${p.id.toUpperCase()}</b>${r.cell(p)}</div>`).join('\n  ')}`).join('\n  ')}
</main>
<footer class="foot">
  <p>Cada propuesta también está en archivos SVG sueltos (monograma, horizontal oscuro, claro, a una tinta y avatar) en la carpeta <a href="svg/">svg</a>.</p>
</footer>
</body>
</html>
`;
writeFileSync(`${OUT}/logo-propuestas.html`, html);
console.log('ok', { wordW: n(wordW), websTrack: n(websTrack), blockH: n(blockH) });
