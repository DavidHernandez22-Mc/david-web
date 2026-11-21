// node scripts/_viewer.tmp.mjs <id> <host>  → visor en vivo de davidhcwebs.com (/ y /en/)
import { chromium } from 'playwright';
const [id, host] = process.argv.slice(2);
const b = await chromium.launch();
for (const [path, vp] of [['/', { width: 1280, height: 850 }], ['/en/', { width: 390, height: 800 }]]) {
  const page = await (await b.newContext({ viewport: vp })).newPage();
  const errs = []; page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 140)));
  await page.goto(`https://davidhcwebs.com${path}?v=${Date.now()}`, { waitUntil: 'load' });
  await page.$eval(`[data-demo-open="${id}"]`, (a) => a.click());
  let r = null;
  for (let i = 0; i < 40 && !r; i++) { await page.waitForTimeout(250); const f = page.frames().find((x) => x.url().startsWith(`https://${host}`)); if (f) r = await f.evaluate(() => document.body.innerText.length > 50 && { t: document.title, l: document.documentElement.lang }).catch(() => null); }
  const tab = await page.$eval('[data-viewer-tab]', (a) => a.href);
  console.log(`davidhcwebs.com${path.padEnd(4)} ${vp.width}px`, r ? `CARGA EN EL VISOR (lang=${r.l}): ${r.t}` : 'NO CARGA', '| pestaña:', tab, '| errores:', errs.length ? errs : 'ninguno');
}
await b.close();
