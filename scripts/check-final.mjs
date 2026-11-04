// Revisión final: CSP real de public/_headers, sectores, 404 y lectura de copy prohibido.
import { chromium } from 'playwright';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const base = 'http://localhost:4321';
const csp = readFileSync('public/_headers', 'utf8').match(/Content-Security-Policy: (.+)/)[1];
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await c.newPage();
const bad = [];
p.on('console', (m) => { if (/Content Security Policy|violates/i.test(m.text())) bad.push(m.text().slice(0, 160)); });
await p.route(`${base}/**`, async (r) => { const res = await r.fetch(); await r.fulfill({ response: res, headers: { ...res.headers(), 'content-security-policy': csp } }); });
await p.goto(base + '/', { waitUntil: 'load' });
await p.waitForTimeout(800);
await p.tap('.chip:has(input[value="veterinaria"])');
await p.waitForTimeout(900);
await p.screenshot({ path: 'reports/sector-vet.jpg', type: 'jpeg', quality: 70 });
await p.tap('[data-hero-demos]');
await p.waitForTimeout(5000);
console.log('CSP: visor abierto', await p.$eval('[data-viewer]', (d) => d.open), 'frame', p.frames().some((f) => f.url().includes('arrayan')), 'violaciones', bad.length, bad.slice(0, 3));
await p.tap('[data-viewer-close]');
for (const s of ['restaurante', 'inmobiliaria', 'odontologia', 'otro']) {
  await p.goto(`${base}/?negocio=${s}`, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  await p.screenshot({ path: `reports/sector-${s}.jpg`, type: 'jpeg', quality: 70 });
}
await p.goto(`${base}/nada/`);
await p.waitForTimeout(300);
await p.screenshot({ path: 'reports/404.jpg', type: 'jpeg', quality: 70 });
await b.close();
const walk = (d) => readdirSync(d).flatMap((f) => { const x = join(d, f); return statSync(x).isDirectory() ? walk(x) : [x]; });
const html = walk('dist').filter((f) => f.endsWith('.html')).map((f) => [f, readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ')]);
const banned = /soluciones digitales|innovador|transformaci[oó]n digital|siguiente nivel|universidad|university|next\.?js|\breact\b|\bastro\b|framework|nosotros|nuestro|573008564773|testimonios? de/i;
for (const [f, t] of html) { const m = t.match(banned); console.log(f, m ? `PROHIBIDO: ${m[0]}` : 'copy limpio'); }
