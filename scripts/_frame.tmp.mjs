import { chromium } from 'playwright';
const [target, map] = process.argv.slice(2);
const b = await chromium.launch({ args: [...(map ? [`--host-resolver-rules=MAP ${map}`] : []), '--disable-features=LocalNetworkAccessChecks'] });
for (const parent of ['https://davidhcwebs.com/visor-prueba', 'https://otro-sitio.example/visor-prueba']) {
  const ctx = await b.newContext({ ignoreHTTPSErrors: true });
  await ctx.route(parent, (r) => r.fulfill({ contentType: 'text/html', body: `<iframe src="${target}" width="800" height="600"></iframe>` }));
  const page = await ctx.newPage(); await page.goto(parent); await page.waitForTimeout(3000);
  const f = page.frames().find((x) => x.url().startsWith(target));
  const t = f ? await f.evaluate(() => document.body.innerText.length > 50 && document.title).catch(() => '') : '';
  console.log('visor desde', new URL(parent).host.padEnd(20), t ? `CARGA: ${t}` : 'BLOQUEADO');
  await ctx.close();
}
await b.close();
