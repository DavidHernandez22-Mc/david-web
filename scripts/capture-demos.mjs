// Captura cada demo en celular y computador → raw-captures/*.png (no se versiona).
// Después corre optimize-images.mjs. Uso: npm run capture
// LUMEN_URL permite capturar Lumen desde otra URL (por ejemplo, una build local).
import { chromium } from 'playwright';

const demos = {
  odontologia: 'https://odontologiademo1.netlify.app',
  restaurante: 'https://restauranteejemplodc.netlify.app',
  inmobiliaria: 'https://altamira-demo.vercel.app',
  veterinaria: 'https://arrayan-vet-demo.vercel.app',
  estetica: process.env.LUMEN_URL || 'https://lumen-estetica-demo.vercel.app',
};
const views = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

// Recorre la página para disparar lazy loading y espera a que las imágenes del viewport decodifiquen.
async function settle(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < Math.min(h, 3000); y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
    await Promise.race([Promise.all([...document.images].filter((i) => i.getBoundingClientRect().top < innerHeight).map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 6000))]);
  });
  await page.waitForTimeout(2800);
  // Los botones flotantes (WhatsApp) de las demos tapan texto en una foto fija.
  // Solo para la captura: se ocultan los elementos fijos pequeños de la parte de abajo.
  const hidden = await page.evaluate(() => {
    let n = 0;
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.width < 140 && r.height < 140 && r.top > innerHeight * 0.6) { el.style.visibility = 'hidden'; n++; }
    }
    return n;
  });
  return hidden;
}

const browser = await chromium.launch();
const failed = [];
for (const [id, url] of Object.entries(demos)) {
  for (const [v, opts] of Object.entries(views)) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      if (!res || res.status() >= 400) throw new Error(`HTTP ${res?.status()}`);
      const floats = await settle(page);
      await page.screenshot({ path: `raw-captures/${id}-${v}.png` });
      console.log('ok', id, v, floats ? `(${floats} botón flotante oculto)` : '');
    } catch (e) {
      failed.push(id);
      console.log('FALLÓ', id, v, e.message.split('\n')[0]);
    }
    await ctx.close();
  }
}
await browser.close();
if (failed.length) console.log('Sin captura:', [...new Set(failed)].join(', '));
