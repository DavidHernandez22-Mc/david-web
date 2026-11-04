// Toda la interactividad del sitio. Sin dependencias.
// Sin JavaScript el sitio sigue funcionando: los enlaces van a WhatsApp y a las demos directamente.

interface SectorCopy { title: string; sub: string; features: string[]; noun: string; chip: string }
interface PageData {
  lang: string;
  number: string;
  events: boolean;
  themes: Record<string, Record<'bg' | 'ink' | 'btn' | 'btnInk', string>>;
  sectorToDemo: Record<string, string>;
  sectors: Record<string, SectorCopy>;
  wa: Record<'base' | 'fallbackNoun' | 'packageSuffix' | 'demoSuffix' | 'calcSuffix' | 'offer' | 'formName' | 'formBusiness' | 'formNeed' | 'lumenSuffix', string>;
  prices: Record<string, number>;
  calc: Record<'months' | 'oneMonth' | 'lessThanOne' | 'empty' | 'locale', string>;
  errors: Record<string, string>;
  demos: Record<string, { name: string; url: string; live: boolean; iframe: boolean }>;
}

const data: PageData = JSON.parse(document.getElementById('page-data')!.textContent!);
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Eventos: Cloudflare no guarda nada que identifique a la persona ---------- */
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
  el.animate([{ transform: 'scale(.97)', opacity: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' });
}

/* ---------- Experiencia firma 1: ¿Qué negocio tienes? ---------- */
const heroTitle = $('[data-h-title]')!;
const heroSub = $('[data-h-sub]')!;
const heroList = $('[data-h-list]')!;
const shots = $$<HTMLImageElement>('.hero-shot');
let rotator: number | undefined;

function loadShot(img: HTMLImageElement) {
  if (img.dataset.srcset) {
    img.srcset = img.dataset.srcset;
    img.src = img.srcset.split(', ')[1]!.split(' ')[0]!;
    delete img.dataset.srcset;
  }
}
function showShot(img: HTMLImageElement) {
  loadShot(img);
  shots.forEach((s) => {
    s.classList.toggle('is-on', s === img);
    s.alt = s === img ? (s.dataset.alt ?? '') : '';
  });
}
function startRotator() {
  stopRotator();
  if (reduced) return;
  rotator = window.setInterval(() => {
    if (document.hidden) return;
    const i = shots.findIndex((s) => s.classList.contains('is-on'));
    showShot(shots[(i + 1) % shots.length]!);
    loadShot(shots[(i + 2) % shots.length]!);
  }, 3600);
}
function stopRotator() {
  if (rotator) clearInterval(rotator);
  rotator = undefined;
}

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
    heroTitle.textContent = copy.title;
    heroSub.textContent = copy.sub;
    heroList.innerHTML = '';
    copy.features.forEach((f) => {
      const li = document.createElement('li');
      li.innerHTML = '<svg class="ico-check" aria-hidden="true"><use href="#i-check"></use></svg>';
      const span = document.createElement('span');
      span.textContent = f;
      li.append(span);
      heroList.append(li);
    });
  };
  const swapEls = [heroTitle, heroSub, heroList];
  if (reduced || opts.silent) {
    swap();
  } else {
    Promise.all(swapEls.map((el) => el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 110, easing: 'ease-out', fill: 'forwards' }).finished)).then(() => {
      swap();
      swapEls.forEach((el, i) => {
        el.getAnimations().forEach((a) => a.cancel());
        el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: i * 40, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      });
    });
  }
  const demo = data.sectorToDemo[id];
  if (demo) {
    stopRotator();
    showShot(shots.find((s) => s.dataset.demo === demo)!);
  } else {
    startRotator();
  }
  const heroDemos = $('[data-hero-demos]');
  if (heroDemos) heroDemos.textContent = demo && data.demos[demo]?.live ? heroDemos.dataset.this! : heroDemos.dataset.default!;
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

// Un enlace como /?negocio=veterinaria llega con el hero ya adaptado (útil para escribirle a un prospecto).
const preset = new URLSearchParams(location.search).get('negocio');
if (preset && data.sectors[preset]) {
  const radio = $<HTMLInputElement>(`input[name="sector"][value="${CSS.escape(preset)}"]`);
  if (radio) radio.checked = true;
  setSector(preset, { silent: true });
} else {
  // La primera captura ya está; las demás cargan cuando el navegador está libre.
  const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
  idle(() => { shots.slice(1, 2).forEach(loadShot); startRotator(); });
}

/* ---------- Experiencia firma 2: visor de demos ---------- */
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
  document.documentElement.classList.add('viewer-open');
  clearTimeout(slowTimer);
  slowTimer = window.setTimeout(() => { slow.hidden = false; }, 6000);
}
frame.addEventListener('load', () => {
  if (frame.getAttribute('src')) { loading.hidden = true; clearTimeout(slowTimer); }
});
function closeViewer() {
  if (viewer.open) viewer.close();
}
viewer.addEventListener('close', () => {
  frame.removeAttribute('src');
  document.documentElement.classList.remove('viewer-open');
  clearTimeout(slowTimer);
  returnFocus?.focus();
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

// Desde el hero: "Ver esta demo" y el celular abren directamente la demo del sector elegido.
const heroDemoLink = $<HTMLAnchorElement>('[data-hero-demos]');
heroDemoLink?.addEventListener('click', (e) => {
  const id = data.sectorToDemo[sector];
  if (!id || !data.demos[id]?.live) return;
  e.preventDefault();
  track('demo_open', `hero-${id}`);
  openDemo(id, heroDemoLink);
});
const heroPhone = $<HTMLAnchorElement>('[data-hero-phone]');
heroPhone?.addEventListener('click', (e) => {
  const id = shots.find((s) => s.classList.contains('is-on'))?.dataset.demo;
  if (!id || !data.demos[id]?.live) return;
  e.preventDefault();
  track('demo_open', `hero-celular-${id}`);
  openDemo(id, heroPhone);
});

/* ---------- Experiencia firma 3: calculadora ---------- */
const calc = $<HTMLFormElement>('[data-calc]')!;
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
if ('IntersectionObserver' in window) {
  const railIo = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) setTab((e.target as HTMLElement).dataset.ticket!); });
  }, { root: rail, threshold: 0.65 });
  if (rail.scrollWidth > rail.clientWidth) tickets.forEach((x) => railIo.observe(x));
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

/* ---------- Entradas al hacer scroll: una vez, y rápidas ---------- */
const reveals = $$('[data-reveal]');
if (reduced || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  reveals.forEach((el) => io.observe(el));
}

refreshLinks();
