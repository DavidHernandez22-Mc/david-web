// Mide la transición del celular del hero cada ~16 ms: la cobertura combinada de las capturas
// nunca debe bajar de 99 % (si baja, se ve el fondo del marco).
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:4321';
const browser = await chromium.launch();
for (const [w, h] of [[375, 700], [1440, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'no-preference' });
  await page.goto(base + '/', { waitUntil: 'load' });
  const min = await page.evaluate(async (w) => {
    const shots = [...document.querySelectorAll('.hero-shot')];
    const coverage = () => 1 - shots.reduce((acc, s) => acc * (1 - (s.complete && s.naturalWidth ? +getComputedStyle(s).opacity : 0)), 1);
    let low = 1;
    const sample = (ms) => new Promise((done) => { const end = performance.now() + ms; const tick = () => { low = Math.min(low, coverage()); if (performance.now() < end) requestAnimationFrame(tick); else done(); }; tick(); });
    await sample(9000); // dos cambios automáticos del rotador
    const chips = [...document.querySelectorAll('input[name="sector"]')];
    for (const v of ['veterinaria', 'restaurante', 'estetica', 'inmobiliaria', 'odontologia']) { // cambios rápidos seguidos
      const c = chips.find((x) => x.value === v); c.click(); c.dispatchEvent(new Event('change', { bubbles: true }));
      await sample(w < 900 ? 150 : 120);
    }
    await sample(1500);
    return low;
  }, w);
  console.log(`${w}px: cobertura mínima durante los cambios ${(min * 100).toFixed(1)} %`, min >= 0.99 ? 'ok' : 'FALLA');
  await page.close();
}
await browser.close();
