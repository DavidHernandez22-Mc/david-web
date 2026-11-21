// node scripts/_audit.tmp.mjs <base> <rutas,separadas> [host-a-mapear:puerto] [--json]
import { chromium } from 'playwright';
const [base, paths, map] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const asJson = process.argv.includes('--json');
const args = ['--disable-features=LocalNetworkAccessChecks'];
if (map) args.push(`--host-resolver-rules=MAP ${map}`);
const b = await chromium.launch({ args });
const out = {};
for (const path of paths.split(',')) for (const vp of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  const ctx = await b.newContext({ viewport: vp, ignoreHTTPSErrors: true });
  await ctx.route('https://wa.me/**', (r) => r.fulfill({ body: 'wa' }));
  const page = await ctx.newPage();
  const errs = [], csp = [], failed = [];
  page.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
  page.on('console', (m) => { const t = m.text(); if (/Content.Security|Refused/i.test(t)) csp.push(t.slice(0, 160)); else if (m.type() === 'error' && !/cloudflareinsights/.test(t)) errs.push(t.slice(0, 120)); });
  page.on('requestfailed', (r) => !/wa\.me|cloudflareinsights/.test(r.url()) && failed.push(r.url().slice(0, 90)));
  const res = await page.goto(base + path, { waitUntil: 'load' });
  for (let y = 0; y < 25000; y += 600) { await page.mouse.wheel(0, 600); await page.waitForTimeout(90); }
  await page.waitForTimeout(2500);
  const imgs = await page.$$eval('img', (is) => is.filter((i) => i.currentSrc && !/tile|arcgis/.test(i.currentSrc)).map((i) => i.complete && i.naturalWidth > 0));
  const tiles = await page.$$eval('.leaflet-tile-loaded', (t) => t.length);
  const wa = await page.$$eval('a[href*="wa.me"]', (as) => [...new Set(as.map((a) => decodeURIComponent(new URL(a.href).searchParams.get('text') || '')))].sort());
  const r = { status: res.status(), lang: await page.evaluate(() => document.documentElement.lang), imgs: `${imgs.filter(Boolean).length}/${imgs.length}`, tiles: tiles > 0, wa, errs, csp, failed };
  out[`${path} ${vp.width}`] = r;
  if (!asJson) console.log(`${path} ${vp.width}px → ${r.status} lang=${r.lang} fotos ${r.imgs} mapa=${r.tiles ? 'sí' : 'no'} whatsapp=${wa.length} | errores: ${errs.length ? errs : 'ninguno'} | CSP: ${csp.length ? csp : 'sin bloqueos'} | fallidas: ${failed.length ? failed : 'ninguna'}`);
  await ctx.close();
}
await b.close();
if (asJson) console.log(JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { lang: v.lang, imgs: v.imgs, tiles: v.tiles, wa: v.wa }])), null, 1));
