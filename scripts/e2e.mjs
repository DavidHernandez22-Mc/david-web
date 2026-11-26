// Prueba de principio a fin contra el build servido. Uso: node scripts/e2e.mjs [base]
// npm test la corre con base https://davidhcwebs.com y E2E_MAP_TO=127.0.0.1:puerto: el navegador
// cree estar en el dominio real (así cargan las demos que solo se dejan mostrar en davidhcwebs.com),
// pero todo lo sirve el Worker local.
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:4321';
const MAP = process.env.E2E_MAP_TO;
const browser = await chromium.launch(MAP ? { args: [`--host-resolver-rules=MAP ${new URL(base).hostname} ${MAP}`] } : {});
let fails = 0;
const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) fails++; };
const text = (u) => new URL(u).searchParams.get('text') || '';

for (const [path, L] of [['/', { base: 'Hola David, vi tu página y quiero una web para mi', vet: 'veterinaria', vetVal: 'veterinaria', pack: 'Profesional', months: 'meses', title: 'Tu veterinaria' }], ['/en/', { base: 'Hi David, I saw your site and I’d like a website for my', vet: 'vet clinic', vetVal: 'veterinaria', pack: 'Professional', months: 'months', title: 'vet clinic' }]]) {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/frame|Refused|ERR_/.test(m.text())) errors.push(m.text()); });
  await page.goto(base + path, { waitUntil: 'load' });
  console.log('--', path);

  // Todos los enlaces de WhatsApp
  const links = await page.$$eval('a[href*="wa.me"]', (a) => a.map((x) => x.href));
  ok(links.length >= 8 && links.every((u) => u.startsWith('https://wa.me/573244281553?text=')), `${links.length} enlaces van a 573244281553`);
  ok(links.every((u) => text(u).startsWith(L.base)), 'todos con el mensaje base');
  const visible = await page.evaluate(() => document.body.innerText);
  ok(!/3244281553/.test(visible), 'teléfono no visible');

  // Selector de sector
  const before = await page.textContent('h1');
  const bgBefore = await page.$eval('.hero', (e) => getComputedStyle(e).backgroundColor);
  await page.tap(`.chip:has(input[value="${L.vetVal}"])`);
  await page.waitForTimeout(800);
  const after = await page.textContent('h1');
  ok(before !== after && after.includes(L.vet), `titular cambia: "${after.replace(/\s+/g, ' ').trim()}"`);
  const bgAfter = await page.$eval('.hero', (e) => getComputedStyle(e).backgroundColor);
  ok(bgBefore !== bgAfter, 'el hero toma el color del sector');
  await page.waitForTimeout(600);
  ok(await page.$$eval('.shot.is-on', (imgs) => ['laptop', 'phone', 'frame'].every((g) => imgs.some((i) => i.dataset.group === g && i.dataset.demo === 'veterinaria' && i.complete))), 'computador, celular y marco muestran la demo del sector');
  ok((await page.textContent('.hero-sub')).includes(path === '/' ? 'vacuna' : 'vaccine'), 'el subtítulo cambia con el sector');
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
  const calcHref = await page.$eval('[data-calc-cta]', (a) => a.href);
  ok(text(calcHref).includes('10') && text(calcHref).includes(path === '/' ? '290.000' : '92') && text(calcHref).includes('5'), `"Escríbeme con mis números" lleva las cifras: "${text(calcHref)}"`);
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
  ok(live.length === 5, `${live.length} demos en vivo`);
  ok(!(await page.textContent('#demos')).match(/Pídemela|Ask me for it/), 'ninguna demo pide WhatsApp en vez de abrir');
  for (const id of ['odontologia', 'restaurante', 'inmobiliaria', 'veterinaria', 'estetica']) {
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
    const demoUrl = await page.$eval(`[data-demo-open="${id}"]`, (a) => a.href);
    ok(tab === demoUrl && tab.startsWith('https://'), `botón pestaña nueva con URL de ${id} (${tab})`);
    // Las demos bilingües abren su versión en el idioma de la página.
    if (['odontologia', 'estetica', 'inmobiliaria'].includes(id)) {
      const en = path === '/en/';
      const src = await page.$eval('[data-viewer-frame]', (f) => f.src);
      const fl = await page.frames().find((x) => x !== page.mainFrame() && x.url().startsWith('https'))?.evaluate(() => document.documentElement.lang).catch(() => '');
      ok(src.endsWith('/en/') === en && (fl || '').startsWith(en ? 'en' : 'es'), `${id} se abre en ${en ? 'inglés' : 'español'} (${src}, lang=${fl})`);
    }
    const want = await page.$eval('[data-viewer-want]', (a) => a.href);
    ok(text(want).startsWith(L.base), `"Quiero una así": "${text(want)}"`);
    await page.tap('[data-viewer-close]');
    await page.waitForTimeout(450);
    ok(!(await page.$eval('[data-viewer]', (d) => d.open)) && !(await page.$eval('[data-viewer-frame]', (f) => f.hasAttribute('src'))), 'visor cierra y libera el iframe');
  }

  // Hero en celular: titular → subtítulo → botón → "Ver demos" en la primera pantalla; escena y selector después
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const order = await page.evaluate(() => ['h1', '.hero-sub', '.btn-hero', '[data-hero-demos]', '.hero-scene', '.picker'].map((q) => document.querySelector(q).getBoundingClientRect().top));
  ok(order.every((y, i) => i === 0 || y > order[i - 1]), `orden del hero en celular ${order.map(Math.round).join(' < ')}`);
  ok(await page.evaluate(() => document.querySelector('[data-hero-demos]').getBoundingClientRect().bottom <= innerHeight && document.querySelector('.picker').getBoundingClientRect().top >= innerHeight), 'primera pantalla: solo título, subtítulo, WhatsApp y "Ver demos"');
  ok(await page.$eval('.chips', (c) => c.getBoundingClientRect().height < 60), 'selector en una fila compacta');
  ok((await page.textContent('.close-lead')).includes(path === '/' ? 'lunes a sábado' : 'Monday to Saturday'), 'horario de respuesta: lunes a sábado');
  ok((await page.textContent('.ticket-badge')).trim() === (path === '/' ? 'Recomendado' : 'Recommended'), 'etiqueta Recomendado');
  ok((await page.$$('.ticket-offer')).length === 3 && (await page.textContent('[data-offer-stamp]')).includes('3'), 'oferta desde la configuración: precio rebajado en los 3 paquetes y cupos');
  ok((await page.textContent('.hero-scene .frag-price')).includes(path === '/' ? '1.600.000' : '510'), 'el precio del hero es el del paquete más barato');

  // Carrusel de demos en celular: la siguiente se asoma, puntos y contador
  await page.$eval('#demos', (e) => e.scrollIntoView());
  await page.waitForTimeout(300);
  ok(await page.$eval('[data-demo-panel="1"]', (p) => { const r = p.getBoundingClientRect(); return r.left < innerWidth && r.right > innerWidth; }), 'la siguiente demo se asoma en el carrusel');
  ok((await page.$$('[data-demo-dot]')).length === 5, '5 puntos de posición');
  await page.$eval('[data-demo-dot="2"]', (b) => b.click());
  await page.waitForTimeout(900);
  ok(await page.$eval('[data-demo-dot="2"]', (b) => b.getAttribute('aria-current') === 'true'), 'tocar el punto 3 lleva a la demo 3');

  ok(await page.$eval('.nav-lang', (e) => getComputedStyle(e).display !== 'none' && e.textContent.trim() === (location.pathname.startsWith('/en/') ? 'ES' : 'EN')), 'idioma visible junto al menú');

  // Menú en celular
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.tap('[data-menu-open]');
  await page.waitForTimeout(300);
  ok(await page.$eval('[data-menu]', (d) => d.open && d.getBoundingClientRect().height >= innerHeight - 1), 'menú abre a pantalla completa');
  ok((await page.$$eval('[data-menu-link]', (a) => a.map((x) => x.textContent))).length === 4, '4 enlaces en el menú');
  await page.tap('[data-menu-link][href="#paquetes"]');
  await page.waitForTimeout(1200);
  ok(!(await page.$eval('[data-menu]', (d) => d.open)), 'menú se cierra al tocar un enlace');
  ok(await page.$eval('#paquetes', (e) => Math.abs(e.getBoundingClientRect().top) < 80), 'y lleva a Paquetes');

  // Demos en celular: la captura no pasa del 55 % del alto de pantalla
  const tall = await page.$$eval('.demo-visual', (v) => Math.max(...v.map((x) => x.getBoundingClientRect().height)) / innerHeight);
  ok(tall <= 0.55, `captura de demo ocupa ${Math.round(tall * 100)} % del alto`);

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

  // Formulario: en celular empieza plegado
  ok(!(await page.$eval('[data-close-form]', (d) => d.open)), 'formulario plegado en celular');
  await page.$eval('[data-close-form] summary', (x) => x.click());
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
  ok(popup && popup.startsWith('https://wa.me/573244281553'), 'abre WhatsApp');
  console.log('     mensaje:', popup && text(popup));
  ok(popup && ['Ana', 'Clínica Sol', 'mostrar precios'].every((x) => text(popup).includes(x)), 'mensaje con todos los datos');
  ok((await page.textContent('[data-form-preview]')).includes('Ana'), 'vista previa en vivo');

  ok(errors.length === 0, `sin errores de consola ${errors.join(' ; ')}`);
  await ctx.close();
}

// Con animaciones activas (como en un celular normal): cada enlace con sector, sin errores
// y sin ninguna sección en blanco después de recorrer la página.
for (const path of ['/', '/en/', ...['odontologia', 'estetica', 'veterinaria', 'inmobiliaria', 'restaurante', 'otro', 'inventado'].map((s) => `/?negocio=${s}`), '/en/?negocio=estetica']) {
  const mc = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
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

// Saltos (ancla, menú) con animaciones activas: nada queda oculto por encima de la pantalla.
{
  const jc = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const jp = await jc.newPage();
  for (const hash of ['#demos', '#paquetes', '#preguntas', '#escribeme']) {
    await jp.goto(base + '/', { waitUntil: 'load' });
    await jp.evaluate((h) => { document.documentElement.style.scrollBehavior = 'auto'; location.hash = h; }, hash);
    await jp.waitForTimeout(500);
    await jp.waitForTimeout(1500);
    const hidden = await jp.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && Number(getComputedStyle(e).opacity) < 0.99; }).length);
    ok(hidden === 0, `salto a ${hash}: ${hidden} bloques ocultos a la vista`);
  }
  await jc.close();
}

// Enlace directo a un sector, 404, teclado y movimiento reducido
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.goto(base + '/?negocio=restaurante');
ok(await page.evaluate(() => document.querySelector('.picker').getBoundingClientRect().top > document.querySelector('h1').getBoundingClientRect().bottom), 'en computador el selector va debajo del titular');
ok(await page.$eval('[data-menu-open]', (b) => getComputedStyle(b).display === 'none'), 'en computador no aparece el botón de menú');
ok((await page.textContent('h1')).includes('restaurante') && (await page.textContent('.hero-sub')).includes('comisiones'), 'enlace ?negocio=restaurante');
ok(await page.$eval('.demo-sticky', (x) => getComputedStyle(x).position !== 'sticky'), 'movimiento reducido: las demos no se fijan, se apilan');
await page.keyboard.press('Tab');
ok(await page.evaluate(() => document.activeElement.classList.contains('skip')), 'Tab llega primero a "saltar al contenido"');
ok(await page.$eval('[data-reveal]', (e) => getComputedStyle(e).opacity === '1'), 'movimiento reducido: contenido visible sin animar');
// Computador con movimiento: escenario fijo de demos, poco scroll por sector y enlace para saltarlo
{
  const dc = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const dp = await dc.newPage();
  const derr = [];
  dp.on('pageerror', (e) => derr.push(e.message));
  await dp.goto(base + '/', { waitUntil: 'load' });
  await dp.waitForTimeout(800);
  const top = await dp.evaluate(() => document.querySelector('[data-demo-stage]').getBoundingClientRect().top + scrollY);
  const seen = [];
  for (let i = 0; i < 5; i++) {
    await dp.evaluate((y) => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, y); }, top + (i * 0.45 + 0.1) * 900);
    await dp.waitForTimeout(700);
    seen.push(await dp.textContent('[data-demo-count]'));
  }
  ok(seen.join(',') === '1/5,2/5,3/5,4/5,5/5', `escenario fijo: cada ~45vh pasa un sector (${seen.join(',')})`);
  ok(await dp.$eval('.demo-sticky', (x) => getComputedStyle(x).position === 'sticky'), 'el escenario de demos se fija en computador');
  await dp.evaluate((y) => window.scrollTo(0, y), top - 300);
  await dp.waitForTimeout(800);
  await dp.$eval('.skip-demos', (a) => a.click());
  await dp.waitForTimeout(1800);
  ok(await dp.$eval('#despues-demos', (e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }), '"Saltar las demos" lleva después del escenario');
  await dp.evaluate((y) => window.scrollTo(0, y), top + (2 * 0.45 + 0.1) * 900);
  await dp.waitForTimeout(800);
  await dp.$eval('[data-demo-panel="2"] [data-demo-open]', (a) => a.click());
  await dp.waitForTimeout(600);
  ok(await dp.$eval('[data-viewer-frame]', (f) => f.src.startsWith('https://inmobiliaria.davidhcwebs.com')), 'desde el escenario, el visor carga el subdominio real');
  ok(derr.length === 0, `computador sin errores ${derr.join('; ')}`);
  await dc.close();
}
{
  const h = (await page.goto(base + '/')).headers();
  ok(h['strict-transport-security'] === 'max-age=31536000', `HSTS sin preload (${h['strict-transport-security']})`);
  ok((h['content-security-policy'] || '').includes('https://static.cloudflareinsights.com') && h['x-content-type-options'] === 'nosniff', 'CSP con Web Analytics y demás encabezados intactos');
}
{
  const sm = await (await page.goto(base + '/sitemap.xml')).text();
  ok((sm.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length === 4, 'sitemap con <lastmod> en las 4 URL');
  const llms = await page.goto(base + '/llms.txt');
  const lt = await llms.text();
  ok(llms.status() === 200 && lt.startsWith('# DavidHC Webs') && lt.includes('1.600.000') && lt.includes('no son clientes reales') && lt.includes('573244281553'), 'llms.txt con paquetes, demos como ejemplos y WhatsApp');
}
// Peor caso del titular: cada sector a 320 px, en los dos idiomas, sin desbordar
{
  const nc = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 320, height: 640 }, reducedMotion: 'reduce' });
  const np = await nc.newPage();
  for (const path of ['/', '/en/']) {
    await np.goto(base + path, { waitUntil: 'load' });
    const bad = [];
    for (const v of await np.$$eval('input[name=sector]', (cs) => cs.map((c) => c.value))) {
      await np.$eval(`input[name=sector][value="${v}"]`, (c) => c.click());
      await np.waitForTimeout(80);
      if (await np.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.querySelector('[data-h-word]').getBoundingClientRect().right > innerWidth)) bad.push(v);
    }
    ok(bad.length === 0, `${path} a 320 px ningún sector desborda el titular ${bad.join(', ')}`);
  }
  await nc.close();
}
const res = await page.goto(base + '/no-existe/');
ok(res.status() === 404 && (await page.textContent('h1')).length > 3, `404 con personalidad (${res.status()})`);
const c2 = await browser.newContext({ ignoreHTTPSErrors: true, javaScriptEnabled: false, viewport: { width: 390, height: 780 } });
const p2 = await c2.newPage();
await p2.goto(base + '/');
ok(await p2.$eval('[data-reveal]', (e) => getComputedStyle(e).opacity === '1'), 'sin JavaScript: contenido visible');
await browser.close();
console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
process.exit(fails ? 1 : 0);
