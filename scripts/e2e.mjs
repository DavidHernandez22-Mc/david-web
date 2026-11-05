// Prueba de principio a fin contra el build servido. Uso: node scripts/e2e.mjs [base]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:4321';
const browser = await chromium.launch();
let fails = 0;
const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) fails++; };
const text = (u) => new URL(u).searchParams.get('text') || '';

for (const [path, L] of [['/', { base: 'Hola David, vi tu página y quiero una web para mi', vet: 'veterinaria', vetVal: 'veterinaria', pack: 'Profesional', months: 'meses', title: 'Tu veterinaria' }], ['/en/', { base: 'Hi David, I saw your site and I’d like a website for my', vet: 'vet clinic', vetVal: 'veterinaria', pack: 'Professional', months: 'months', title: 'vet clinic' }]]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/frame|Refused|ERR_/.test(m.text())) errors.push(m.text()); });
  await page.goto(base + path, { waitUntil: 'load' });
  console.log('--', path);

  // Todos los enlaces de WhatsApp
  const links = await page.$$eval('a[href*="wa.me"]', (a) => a.map((x) => x.href));
  ok(links.length >= 8 && links.every((u) => u.startsWith('https://wa.me/573008564773?text=')), `${links.length} enlaces van a 573008564773`);
  ok(links.every((u) => text(u).startsWith(L.base)), 'todos con el mensaje base');
  const visible = await page.evaluate(() => document.body.innerText);
  ok(!/3008564773/.test(visible), 'teléfono no visible');

  // Selector de sector
  const before = await page.textContent('h1');
  const bgBefore = await page.$eval('.hero', (e) => getComputedStyle(e).backgroundColor);
  await page.tap(`.chip:has(input[value="${L.vetVal}"])`);
  await page.waitForTimeout(800);
  const after = await page.textContent('h1');
  ok(before !== after && after.includes(L.title), `titular cambia: "${after}"`);
  const bgAfter = await page.$eval('.hero', (e) => getComputedStyle(e).backgroundColor);
  ok(bgBefore !== bgAfter, 'el hero toma el color del sector');
  ok(await page.$eval('.hero-shot.is-on', (i) => i.dataset.demo === 'veterinaria' && i.complete), 'muestra la demo del sector');
  ok((await page.$$('.hero-list li')).length === 3, '3 funciones');
  const heroHref = await page.$eval('[data-wa="hero"]', (a) => a.href);
  ok(text(heroHref) === `${L.base} ${L.vet}.`, `mensaje con sector: "${text(heroHref)}"`);
  ok((await page.textContent('[data-bubble]')).includes(L.vet), 'la burbuja muestra el sector');

  // Paquetes
  const proHref = await page.$eval('[data-label="profesional"]', (a) => a.href);
  ok(text(proHref).includes(L.pack) && text(proHref).includes(L.vet), `paquete en el mensaje: "${text(proHref)}"`);

  // Eventos

  // Calculadora
  await page.fill('#c-clients', '10');
  await page.fill('#c-value', path === '/' ? '290000' : '92');
  await page.tap('.seg label:has(input[value="1"])');
  await page.waitForTimeout(100);
  const pro = await page.textContent('[data-calc-row="profesional"] [data-calc-months]');
  ok(/^10[.,]0 /.test(pro), `Profesional, 1 cliente adicional = "${pro}" (esperado 10,0)`);
  await page.tap('.seg label:has(input[value="5"])');
  const pro5 = await page.textContent('[data-calc-row="profesional"] [data-calc-months]');
  ok(/^2[.,]0 /.test(pro5), `5 clientes = "${pro5}" (esperado 2,0)`);
  await page.fill('#c-value', '');
  ok((await page.textContent('[data-calc-row="esencial"] [data-calc-months]')).length > 3, 'sin datos no muestra NaN');
  ok(!(await page.textContent('.calc-out')).includes('NaN'), 'sin NaN');

  // Pestañas
  await page.tap('[data-tab="premium"]');
  await page.waitForTimeout(700);
  const inView = await page.$eval('[data-ticket="premium"]', (t) => { const r = t.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2; });
  ok(inView, 'la pestaña Premium muestra su tiquete completo');

  // Visor
  const live = await page.$$('[data-demo-open]');
  ok(live.length === 4, `${live.length} demos en vivo`);
  for (const id of ['odontologia', 'restaurante', 'inmobiliaria', 'veterinaria']) {
    await page.$eval(`[data-demo-open="${id}"]`, (a) => a.click());
    await page.waitForTimeout(200);
    ok(await page.$eval('[data-viewer]', (d) => d.open), `visor abre ${id}`);
    let loaded = false;
    for (let t = 0; t < 30 && !loaded; t++) {
      await page.waitForTimeout(500);
      const f = page.frames().find((x) => x !== page.mainFrame() && x.url().startsWith('https'));
      if (f) loaded = await f.evaluate(() => document.body.innerText.length > 50).catch(() => false);
    }
    ok(loaded, `iframe carga contenido de ${id}`);
    const tab = await page.$eval('[data-viewer-tab]', (a) => a.href);
    ok(tab.includes('.app'), 'botón pestaña nueva con URL');
    const want = await page.$eval('[data-viewer-want]', (a) => a.href);
    ok(text(want).startsWith(L.base), `"Quiero una así": "${text(want)}"`);
    await page.tap('[data-viewer-close]');
    await page.waitForTimeout(100);
    ok(!(await page.$eval('[data-viewer]', (d) => d.open)) && !(await page.$eval('[data-viewer-frame]', (f) => f.hasAttribute('src'))), 'visor cierra y libera el iframe');
  }

  // Botón flotante
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
  await page.waitForTimeout(900);
  ok(!(await page.$eval('[data-float]', (f) => f.classList.contains('is-on'))), `flotante oculto en el hero (scrollY ${await page.evaluate(() => scrollY)})`);
  await page.evaluate(() => window.scrollTo(0, document.querySelector('.problem').offsetTop + 300));
  await page.waitForTimeout(400);
  ok(await page.$eval('[data-float]', (f) => f.classList.contains('is-on') && !!f.getAttribute('aria-label')), 'flotante aparece después del hero, con aria-label');
  await page.evaluate(() => document.querySelector('#escribeme').scrollIntoView());
  await page.waitForTimeout(400);
  ok(!(await page.$eval('[data-float]', (f) => f.classList.contains('is-on'))), 'flotante se quita en el formulario para no tapar');

  // Formulario
  let popup = null;
  await page.evaluate(() => { window.__open = null; window.open = (u) => { window.__open = u; return null; }; });
  await page.click('.btn-submit');
  ok((await page.$$eval('.err', (e) => e.filter((x) => x.textContent).length)) === 4 || (await page.$$eval('.err', (e) => e.filter((x) => x.textContent).length)) === 5, 'valida campos vacíos');
  ok((await page.evaluate(() => window.__open)) === null, 'no abre WhatsApp sin datos');
  await page.fill('#f-name', 'Ana');
  await page.fill('#f-business', 'Clínica Sol');
  await page.selectOption('#f-sector', 'estetica');
  await page.fill('#f-need', 'mostrar precios');
  await page.click('.btn-submit');
  ok((await page.evaluate(() => window.__open)) === null, 'exige autorización de datos');
  await page.check('#f-consent');
  await page.click('.btn-submit');
  popup = await page.evaluate(() => window.__open);
  ok(popup && popup.startsWith('https://wa.me/573008564773'), 'abre WhatsApp');
  console.log('     mensaje:', popup && text(popup));
  ok(popup && ['Ana', 'Clínica Sol', 'mostrar precios'].every((x) => text(popup).includes(x)), 'mensaje con todos los datos');
  ok((await page.textContent('[data-form-preview]')).includes('Ana'), 'vista previa en vivo');

  ok(errors.length === 0, `sin errores de consola ${errors.join(' ; ')}`);
  await ctx.close();
}

// Con animaciones activas (como en un celular normal): cada enlace con sector, sin errores
// y sin ninguna sección en blanco después de recorrer la página.
for (const path of ['/', '/en/', ...['odontologia', 'estetica', 'veterinaria', 'inmobiliaria', 'restaurante', 'otro', 'inventado'].map((s) => `/?negocio=${s}`), '/en/?negocio=estetica']) {
  const mc = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const mp = await mc.newPage();
  const errs = [];
  mp.on('pageerror', (e) => errs.push(e.message));
  await mp.goto(base + path, { waitUntil: 'load' });
  await mp.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
  });
  await mp.waitForTimeout(900);
  const r = await mp.evaluate(() => {
    const all = [...document.querySelectorAll('[data-reveal]')];
    return { total: all.length, hidden: all.filter((e) => getComputedStyle(e).opacity === '0').map((e) => e.textContent.trim().slice(0, 30)) };
  });
  ok(errs.length === 0 && r.hidden.length === 0, `${path}: sin errores (${errs.join('; ') || 'ninguno'}) y ${r.total - r.hidden.length}/${r.total} bloques visibles ${r.hidden.slice(0, 3).join(' | ')}`);
  await mc.close();
}

// Enlace directo a un sector, 404, teclado y movimiento reducido
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.goto(base + '/?negocio=restaurante');
ok((await page.textContent('h1')).includes('comisiones'), 'enlace ?negocio=restaurante');
await page.keyboard.press('Tab');
ok(await page.evaluate(() => document.activeElement.classList.contains('skip')), 'Tab llega primero a "saltar al contenido"');
ok(await page.$eval('[data-reveal]', (e) => getComputedStyle(e).opacity === '1'), 'movimiento reducido: contenido visible sin animar');
const res = await page.goto(base + '/no-existe/');
ok(res.status() === 404 && (await page.textContent('h1')).length > 3, `404 con personalidad (${res.status()})`);
const c2 = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 780 } });
const p2 = await c2.newPage();
await p2.goto(base + '/');
ok(await p2.$eval('[data-reveal]', (e) => getComputedStyle(e).opacity === '1'), 'sin JavaScript: contenido visible');
await browser.close();
console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
process.exit(fails ? 1 : 0);
