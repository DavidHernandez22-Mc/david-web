// Capturas de revisión: node scripts/shots.mjs [base] → reports/shots/
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';
const base = process.argv[2] || 'http://localhost:4321';
mkdirSync('reports/shots', { recursive: true });
const browser = await chromium.launch();
for (const w of [375, 768, 1440]) {
  for (const [lang, path] of [['es', '/'], ['en', '/en/']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w === 375 ? 667 : w === 768 ? 1024 : 900 }, deviceScaleFactor: w === 1440 ? 1 : 2, isMobile: w < 800, hasTouch: w < 800, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    await page.goto(base + path, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `reports/shots/${lang}-${w}-fold.jpg`, type: 'jpeg', quality: 70 });
    // Quita lo sticky solo para que la captura larga muestre todos los paneles.
    await page.addStyleTag({ content: '.demo-panel{position:relative!important}.float{display:none!important}' });
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); }))));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(lang, w, 'h', h, 'overflow', over);
    const slice = w === 375 ? 2600 : w === 768 ? 3000 : 3200;
    const full = await page.screenshot({ fullPage: true, type: 'png' });
    const meta = await sharp(full).metadata();
    const scale = meta.width / w;
    for (let i = 0, y = 0; y * scale < meta.height; i++, y += slice) {
      const height = Math.min(Math.round(slice * scale), meta.height - Math.round(y * scale));
      await sharp(full).extract({ left: 0, top: Math.round(y * scale), width: meta.width, height }).jpeg({ quality: 62 }).toFile(`reports/shots/${lang}-${w}-p${i}.jpg`);
    }
    await ctx.close();
  }
}
await browser.close();
