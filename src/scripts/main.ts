// Interactividad esencial del sitio, sin dependencias (≈10 KB). El movimiento fino (GSAP y Lenis)
// vive en motion.ts y se carga después, solo si el navegador está libre y se permite movimiento.
// Sin JavaScript el sitio sigue funcionando: los enlaces van a WhatsApp y a las demos directamente.

interface SectorCopy { sub: string; noun: string; chip: string }
interface PageData {
  lang: string;
  number: string;
  events: boolean;
  themes: Record<string, Record<'bg' | 'ink' | 'btn' | 'btnInk', string>>;
  sectorToDemo: Record<string, string>;
  sectors: Record<string, SectorCopy>;
  wa: Record<'base' | 'fallbackNoun' | 'demoSuffix' | 'calcSuffix' | 'formName' | 'formBusiness' | 'formNeed', string>;
  prices: Record<string, number>;
  calc: Record<'months' | 'oneMonth' | 'lessThanOne' | 'empty' | 'locale', string>;
  errors: Record<string, string>;
  demos: Record<string, { name: string; url: string; live: boolean; iframe: boolean; bg: string; ink: string }>;
}

const data: PageData = JSON.parse(document.getElementById('page-data')!.textContent!);
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lockScroll = (on: boolean) => window.dispatchEvent(new CustomEvent(on ? 'dw:lock' : 'dw:unlock'));

/* ---------- Menú en celular: pantalla completa, se cierra al tocar un enlace ---------- */
const menu = $<HTMLDialogElement>('[data-menu]');
if (menu) {
  $('[data-menu-open]')?.addEventListener('click', () => { menu.showModal(); lockScroll(true); });
  $('[data-menu-close]')?.addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => lockScroll(false));
  $$<HTMLAnchorElement>('[data-menu-link]', menu).forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      menu.close();
      // Salto directo: el menú tapa la pantalla al cerrarse y un scroll suave de varias
      // pantallas tardaría segundos. El foco pasa a la sección para quien usa teclado.
      const target = document.querySelector<HTMLElement>(a.hash);
      requestAnimationFrame(() => {
        if (!target) return;
        target.scrollIntoView({ behavior: 'instant' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        history.replaceState(null, '', a.hash);
      });
    });
  });
}

/* ---------- Eventos: van al Worker (/api/event) y no guardan nada que identifique a la persona ---------- */
function track(name: string, label: string) {
  window.dispatchEvent(new CustomEvent('dw:track', { detail: { name, label } }));
  if (!data.events || /^(localhost|127\.)/.test(location.hostname)) return;
  navigator.sendBeacon?.('/api/event', new Blob([JSON.stringify({ name, label, lang: data.lang })], { type: 'application/json' }));
}
document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest<HTMLElement>('[data-track]');
  if (el) track(el.dataset.track!, el.dataset.label ?? '');
});

/* ---------- El mensaje: una sola fuente de verdad para todos los enlaces ---------- */
let sector = 'general';
const waUrl = (msg: string) => `https://wa.me/${data.number}?text=${encodeURIComponent(msg)}`;
const noun = () => data.sectors[sector]?.noun ?? data.wa.fallbackNoun;
const baseMsg = () => `${data.wa.base} ${noun()}.`;

function refreshLinks() {
  const base = baseMsg();
  $$<HTMLAnchorElement>('[data-wa]').forEach((a) => {
    const suffix = a.dataset.waSuffix;
    a.href = waUrl(suffix ? `${base} ${suffix}` : base);
  });
  $$('[data-bubble]').forEach((b) => {
    if (b.textContent === base) return;
    b.textContent = base;
    pop(b);
  });
  renderPreview();
}

function pop(el: HTMLElement) {
  if (reduced) return;
  el.animate([{ transform: 'scale(.96)', opacity: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 240, easing: 'cubic-bezier(.22,1,.36,1)' });
}

/* ---------- Escena del hero: computador, celular y marco del titular cambian juntos ---------- */
const shots = $$<HTMLImageElement>('.shot');
const groups = [...new Set(shots.map((s) => s.dataset.group!))];
let currentDemo = shots.find((s) => s.classList.contains('is-on'))?.dataset.demo ?? 'odontologia';
let rotator: number | undefined;
let swapSeq = 0;

function loadShot(img: HTMLImageElement) {
  if (img.dataset.srcset) {
    img.srcset = img.dataset.srcset;
    delete img.dataset.srcset;
  }
  if (img.dataset.src) {
    img.src = img.dataset.src;
    delete img.dataset.src;
  }
}
const shotsOf = (demo: string) => shots.filter((s) => s.dataset.demo === demo);
// Cruce sin parpadeo: las imágenes nuevas se decodifican antes y entran por encima mientras
// las anteriores siguen visibles debajo. Solo cuando las nuevas ya cubren todo, se apagan las otras.
function showDemo(demo: string) {
  const next = shotsOf(demo);
  if (!next.length) return;
  next.forEach(loadShot);
  if (demo === currentDemo) return;
  currentDemo = demo;
  const seq = ++swapSeq;
  shots.forEach((s) => { if (s.dataset.alt !== undefined) s.alt = s.dataset.demo === demo ? s.dataset.alt : ''; });
  Promise.all(next.map((img) => img.decode().catch(() => undefined))).then(() => {
    if (seq !== swapSeq) return;
    groups.forEach((g) => shots.filter((s) => s.dataset.group === g).forEach((s) => s.classList.toggle('is-top', s.dataset.demo === demo)));
    next.forEach((img) => img.classList.add('is-on'));
    window.setTimeout(() => {
      if (seq !== swapSeq) return;
      shots.forEach((s) => { if (s.dataset.demo !== demo) s.classList.remove('is-on'); });
    }, reduced ? 0 : 460);
  });
}
const sceneOrder = [...new Set(shots.map((s) => s.dataset.demo!))];
function startRotator() {
  stopRotator();
  if (reduced) return;
  rotator = window.setInterval(() => {
    if (document.hidden) return;
    const i = sceneOrder.indexOf(currentDemo);
    showDemo(sceneOrder[(i + 1) % sceneOrder.length]!);
    // La siguiente ya queda descargada antes de su turno.
    shotsOf(sceneOrder[(i + 2) % sceneOrder.length]!).forEach(loadShot);
  }, 3800);
}
function stopRotator() {
  if (rotator) clearInterval(rotator);
  rotator = undefined;
}

/* ---------- ¿Qué negocio tienes? Cambia la palabra del titular, el subtítulo, los colores y la escena ---------- */
const heroWord = $('[data-h-word]')!;
const heroSub = $('[data-h-sub]')!;

function applyTheme(id: string) {
  const th = data.themes[id] ?? data.themes.general!;
  const root = document.documentElement.style;
  root.setProperty('--h-bg', th.bg);
  root.setProperty('--h-ink', th.ink);
  root.setProperty('--h-btn', th.btn);
  root.setProperty('--h-btn-ink', th.btnInk);
}

function setSector(id: string, opts: { silent?: boolean } = {}) {
  if (!data.sectors[id]) return;
  sector = id;
  const copy = data.sectors[id];
  applyTheme(id);
  const swap = () => {
    // En celular el selector está debajo del hero: si el titular cambia de alto,
    // se compensa el scroll para que los chips no se muevan bajo el dedo.
    const picker = $('.picker');
    const before = picker?.getBoundingClientRect().top ?? 0;
    heroWord.textContent = `${copy.noun}.`;
    heroSub.textContent = copy.sub;
    const shift = (picker?.getBoundingClientRect().top ?? 0) - before;
    if (shift && !opts.silent) window.scrollBy({ top: shift, behavior: 'instant' });
  };
  const els = [heroWord, heroSub];
  if (reduced || opts.silent) {
    swap();
  } else {
    Promise.all(els.map((el) => el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-0.12em)' }], { duration: 120, easing: 'ease-out', fill: 'forwards' }).finished)).then(() => {
      swap();
      els.forEach((el, i) => {
        el.getAnimations().forEach((a) => a.cancel());
        el.animate([{ opacity: 0, transform: 'translateY(0.35em)' }, { opacity: 1, transform: 'none' }], { duration: 340, delay: i * 50, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      });
    });
  }
  const demo = data.sectorToDemo[id];
  if (demo) {
    stopRotator();
    showDemo(demo);
  } else {
    startRotator();
  }
  const heroDemos = $('[data-hero-demos] span');
  const link = $('[data-hero-demos]');
  if (heroDemos && link) heroDemos.textContent = demo && data.demos[demo]?.live ? link.dataset.this! : link.dataset.default!;
  const select = $<HTMLSelectElement>('#f-sector');
  if (select && id !== 'general') select.value = id;
  refreshLinks();
}

$$<HTMLInputElement>('input[name="sector"]').forEach((r) => {
  r.addEventListener('change', () => {
    setSector(r.value);
    const url = new URL(location.href);
    url.searchParams.set('negocio', r.value);
    history.replaceState(null, '', url);
  });
});

/* ---------- Visor de demos: se abre desde la tarjeta tocada y carga el subdominio real ---------- */
const viewer = $<HTMLDialogElement>('[data-viewer]')!;
const frame = $<HTMLIFrameElement>('[data-viewer-frame]')!;
const loading = $('[data-viewer-loading]')!;
const slow = $<HTMLAnchorElement>('[data-viewer-slow]')!;
let slowTimer: number | undefined;
let returnFocus: HTMLElement | null = null;

function openDemo(id: string, trigger: HTMLElement) {
  const demo = data.demos[id];
  if (!demo) return;
  returnFocus = trigger;
  $('[data-viewer-name]')!.textContent = demo.name;
  $<HTMLAnchorElement>('[data-viewer-tab]')!.href = demo.url;
  slow.href = demo.url;
  slow.hidden = true;
  loading.hidden = false;
  const want = $<HTMLAnchorElement>('[data-viewer-want]')!;
  want.href = waUrl(`${baseMsg()} ${data.wa.demoSuffix.replace('{d}', demo.name)}`);
  want.dataset.label = `visor-${id}`;
  frame.src = demo.url;
  viewer.showModal();
  lockScroll(true);
  document.documentElement.classList.add('viewer-open');
  // Se abre desde el rectángulo de la tarjeta hasta la pantalla completa.
  if (!reduced) {
    const r = trigger.getBoundingClientRect();
    const inset = `inset(${Math.max(r.top, 0)}px ${Math.max(innerWidth - r.right, 0)}px ${Math.max(innerHeight - r.bottom, 0)}px ${Math.max(r.left, 0)}px)`;
    viewer.animate([{ clipPath: inset }, { clipPath: 'inset(0px 0px 0px 0px)' }], { duration: 440, easing: 'cubic-bezier(.32,.72,0,1)' });
  }
  clearTimeout(slowTimer);
  slowTimer = window.setTimeout(() => { slow.hidden = false; }, 6000);
}
frame.addEventListener('load', () => {
  if (frame.getAttribute('src')) { loading.hidden = true; clearTimeout(slowTimer); }
});
function closeViewer() {
  if (!viewer.open) return;
  if (reduced) { viewer.close(); return; }
  viewer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-out' }).finished.then(() => viewer.close(), () => viewer.close());
}
viewer.addEventListener('cancel', (e) => { e.preventDefault(); closeViewer(); });
viewer.addEventListener('close', () => {
  frame.removeAttribute('src');
  document.documentElement.classList.remove('viewer-open');
  lockScroll(false);
  clearTimeout(slowTimer);
  returnFocus?.focus({ preventScroll: true });
});
$('[data-viewer-close]')!.addEventListener('click', closeViewer);
$$<HTMLAnchorElement>('[data-demo-open]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.dataset.demoOpen!;
    if (!data.demos[id]?.iframe || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    openDemo(id, a);
  });
});

// Desde el hero: "Ver esta demo" y la escena abren directamente la demo que se ve.
const heroDemoLink = $<HTMLAnchorElement>('[data-hero-demos]');
heroDemoLink?.addEventListener('click', (e) => {
  const id = data.sectorToDemo[sector];
  if (!id || !data.demos[id]?.live) return;
  e.preventDefault();
  track('demo_open', `hero-${id}`);
  openDemo(id, heroDemoLink);
});
const heroScene = $<HTMLAnchorElement>('[data-hero-phone]');
heroScene?.addEventListener('click', (e) => {
  if (!data.demos[currentDemo]?.live) return;
  e.preventDefault();
  track('demo_open', `hero-escena-${currentDemo}`);
  openDemo(currentDemo, heroScene);
});

/* ---------- Demos: escenario fijo en computador, carrusel en celular ---------- */
const stage = $('[data-demo-stage]');
if (stage) {
  const panels = $$('[data-demo-panel]', stage);
  const names = $$('[data-demo-name]', stage);
  const dots = $$<HTMLButtonElement>('[data-demo-dot]', stage);
  const count = $('[data-demo-count]', stage)!;
  const list = $('[data-demo-list]', stage)!;
  const pinQuery = matchMedia('(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let active = -1;

  const setActive = (i: number) => {
    if (i === active && panels[i]?.classList.contains('is-active')) return;
    active = i;
    panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
    names.forEach((n, k) => n.classList.toggle('is-on', k === i));
    dots.forEach((d, k) => {
      d.classList.toggle('is-on', k === i);
      if (k === i) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    count.textContent = `${i + 1}/${panels.length}`;
    const demo = Object.values(data.demos)[i];
    if (demo) { stage.style.setProperty('--stage-bg', demo.bg); stage.style.setProperty('--stage-ink', demo.ink); }
  };
  setActive(0);

  // Computador: cada "paso" invisible mide ~45vh de scroll; el que cruza el centro activa su demo.
  const stepIo = new IntersectionObserver((es) => {
    if (!pinQuery.matches) return;
    es.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.demoStep)); });
  }, { rootMargin: '-50% 0px -50% 0px' });
  $$('[data-demo-step]', stage).forEach((s) => stepIo.observe(s));

  // Celular: la tarjeta que ocupa la mayor parte del carrusel es la activa.
  const cardIo = new IntersectionObserver((es) => {
    if (pinQuery.matches) return;
    es.forEach((e) => { if (e.isIntersecting) setActive(panels.indexOf(e.target as HTMLElement)); });
  }, { root: list, threshold: 0.6 });
  panels.forEach((p) => cardIo.observe(p));

  dots.forEach((d, i) => d.addEventListener('click', () => {
    const p = panels[i]!;
    list.scrollTo({ left: p.offsetLeft - list.offsetLeft - (list.clientWidth - p.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
  }));

  // Con teclado en el escenario fijo: al enfocar una demo, el scroll la trae a pantalla.
  panels.forEach((p, i) => p.addEventListener('focusin', () => {
    if (!pinQuery.matches || i === active) return;
    const step = $$('[data-demo-step]', stage)[i]!;
    const r = step.getBoundingClientRect();
    window.scrollTo({ top: scrollY + r.top + r.height / 2 - innerHeight / 2, behavior: 'instant' });
    setActive(i);
  }));
}

/* ---------- Calculadora ---------- */
const calc = $<HTMLFormElement>('[data-calc]')!;
const calcCta = $<HTMLAnchorElement>('[data-calc-cta]');
const nf = new Intl.NumberFormat(data.calc.locale, { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat(data.calc.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const digits = (v: string) => Number(v.replace(/\D/g, '')) || 0;
const money = (n: number) => `$${nf.format(n)}`;

function renderCalc() {
  const clients = digits((calc.elements.namedItem('clients') as HTMLInputElement).value);
  const value = digits((calc.elements.namedItem('value') as HTMLInputElement).value);
  const extra = Number((calc.querySelector('input[name="extra"]:checked') as HTMLInputElement).value);
  const monthly = extra * value;
  $('[data-calc-today]')!.textContent = clients && value ? money(clients * value) : '—';
  $('[data-calc-with]')!.textContent = clients && value ? money((clients + extra) * value) : '—';
  const months = Object.fromEntries(Object.entries(data.prices).map(([k, p]) => [k, monthly ? p / monthly : 0]));
  const max = Math.max(...Object.values(months), 1);
  $$('[data-calc-row]').forEach((row) => {
    const m = months[row.dataset.calcRow!] ?? 0;
    const out = $('[data-calc-months]', row)!;
    if (!m) out.textContent = data.calc.empty;
    else if (m < 1) out.textContent = data.calc.lessThanOne;
    else if (m < 1.05) out.textContent = data.calc.oneMonth;
    else out.textContent = data.calc.months.replace('{n}', nf1.format(m));
    $<HTMLElement>('.calc-bar i', row)!.style.transform = `scaleX(${m ? Math.max(m / max, 0.03) : 0})`;
  });
  // "Escríbeme con mis números": el mensaje lleva las cifras que puso el visitante.
  if (calcCta) {
    if (clients && value) calcCta.dataset.waSuffix = data.wa.calcSuffix.replace('{c}', nf.format(clients)).replace('{v}', money(value)).replace('{e}', String(extra));
    else delete calcCta.dataset.waSuffix;
    calcCta.href = waUrl(calcCta.dataset.waSuffix ? `${baseMsg()} ${calcCta.dataset.waSuffix}` : baseMsg());
  }
}
calc.addEventListener('submit', (e) => e.preventDefault());
calc.addEventListener('change', renderCalc);
calc.addEventListener('input', (e) => {
  const input = e.target as HTMLInputElement;
  if (input.type === 'text') {
    const n = digits(input.value);
    input.value = n ? nf.format(n) : '';
    const ex = $('[data-calc-example]');
    if (ex) ex.hidden = true;
  }
  renderCalc();
});
renderCalc();

/* ---------- Paquetes: en celular, pestañas que mueven las tarjetas deslizables ---------- */
const rail = $('[data-tickets]')!;
const tabs = $$<HTMLButtonElement>('[data-tab]');
const tickets = $$('[data-ticket]');
const setTab = (id: string) => tabs.forEach((b) => {
  const on = b.dataset.tab === id;
  b.classList.toggle('is-on', on);
  b.setAttribute('aria-pressed', String(on));
});
const scrollToTicket = (id: string, behavior: ScrollBehavior) => {
  const el = tickets.find((x) => x.dataset.ticket === id);
  if (el && rail.scrollWidth > rail.clientWidth) {
    rail.scrollTo({ left: el.offsetLeft - (rail.clientWidth - el.offsetWidth) / 2, behavior });
  }
};
tabs.forEach((b) => b.addEventListener('click', () => {
  setTab(b.dataset.tab!);
  scrollToTicket(b.dataset.tab!, reduced ? 'auto' : 'smooth');
}));
scrollToTicket('profesional', 'auto');
const railIo = new IntersectionObserver((es) => {
  es.forEach((e) => { if (e.isIntersecting) setTab((e.target as HTMLElement).dataset.ticket!); });
}, { root: rail, threshold: 0.65 });
if (rail.scrollWidth > rail.clientWidth) tickets.forEach((x) => railIo.observe(x));

/* ---------- Formulario: en celular empieza plegado (es opcional; WhatsApp va primero) ---------- */
const closeForm = $<HTMLDetailsElement>('[data-close-form]');
if (!matchMedia('(min-width: 1024px)').matches) {
  if (closeForm) closeForm.open = false;
  // Las preguntas también empiezan cerradas en celular: la lista se lee de un vistazo.
  $$<HTMLDetailsElement>('.q').forEach((q) => { q.open = false; });
}

/* ---------- Formulario: el mensaje se escribe en vivo y se abre en WhatsApp ---------- */
const form = $<HTMLFormElement>('[data-lead-form]')!;
const preview = $('[data-form-preview]')!;
const field = (n: string) => form.elements.namedItem(n) as HTMLInputElement;

function buildFormMessage() {
  const name = field('name').value.trim();
  const business = field('business').value.trim();
  const sectorId = field('sector').value;
  const need = field('need').value.trim();
  const n = sectorId ? data.sectors[sectorId]?.noun : noun();
  const parts = [`${data.wa.base} ${n ?? data.wa.fallbackNoun}.`];
  if (name || business) parts.push(`${[name && `${data.wa.formName} ${name}`, business && `${data.wa.formBusiness} ${business}`].filter(Boolean).join(', ')}.`);
  if (need) parts.push(`${data.wa.formNeed} ${need}`);
  return parts.join(' ');
}
function renderPreview() {
  if (preview) preview.textContent = buildFormMessage();
}
form.addEventListener('input', renderPreview);
form.addEventListener('change', renderPreview);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let firstBad: HTMLElement | null = null;
  ['name', 'business', 'sector', 'need', 'consent'].forEach((n) => {
    const el = field(n);
    const bad = n === 'consent' ? !el.checked : !el.value.trim();
    const msg = $(`[data-err="${n}"]`, form)!;
    msg.textContent = bad ? (data.errors[n] ?? '') : '';
    el.toggleAttribute('aria-invalid', bad);
    if (bad) el.setAttribute('aria-invalid', 'true');
    if (bad && !firstBad) firstBad = el;
  });
  if (firstBad) { (firstBad as HTMLElement).focus(); return; }
  track('whatsapp_click', 'formulario');
  window.open(waUrl(buildFormMessage()), '_blank', 'noopener');
});

/* ---------- Botón flotante: aparece después del hero, se esconde en el cierre ---------- */
const float = $('[data-float]')!;
const seen = { hero: true, close: false };
const syncFloat = () => {
  const show = !seen.hero && !seen.close;
  float.classList.toggle('is-on', show);
  if (show) float.removeAttribute('tabindex');
  else float.setAttribute('tabindex', '-1');
};
const floatIo = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if ((e.target as HTMLElement).id === 'hero') seen.hero = e.isIntersecting;
    else seen.close = e.isIntersecting;
  });
  syncFloat();
});
floatIo.observe($('#hero')!);
floatIo.observe($('#escribeme')!);

// Un enlace como /?negocio=veterinaria llega con el hero ya adaptado (útil para escribirle a un prospecto).
// Va al final: setSector usa el formulario y el resto de la página, que ya existen aquí.
const preset = new URLSearchParams(location.search).get('negocio');
const idle = (cb: () => void) => (window.requestIdleCallback ? window.requestIdleCallback(cb, { timeout: 2500 }) : window.setTimeout(cb, 1200));
if (preset && data.sectors[preset]) {
  const radio = $<HTMLInputElement>(`input[name="sector"][value="${CSS.escape(preset)}"]`);
  if (radio) radio.checked = true;
  setSector(preset, { silent: true });
} else {
  // La primera captura ya está; las demás cargan cuando el navegador está libre.
  idle(() => { shotsOf(sceneOrder[1]!).forEach(loadShot); startRotator(); });
}

refreshLinks();

// Una visita a la página. Si llegó con un enlace por sector (?negocio=...), queda en el detalle,
// así se sabe qué prospectos abrieron el enlace que les mandaste.
track('page_view', `${location.pathname}${preset && data.sectors[preset] ? `?negocio=${preset}` : ''}`);

/* ---------- Capa de movimiento (GSAP + Lenis): después de cargar, con el navegador libre ---------- */
// No se carga con "reducir movimiento" ni con conexión lenta o ahorro de datos.
const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
const slowNet = Boolean(conn?.saveData) || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? '');
if (!reduced && !slowNet) {
  const start = () => idle(() => { import('./motion').catch(() => undefined); });
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}
