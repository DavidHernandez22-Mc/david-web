// Capa de movimiento. main.ts la importa después del evento load, con el navegador libre,
// y nunca con "reducir movimiento" ni con conexión lenta. Si no llega, la página se ve completa:
// aquí solo se esconde (para animarlo) lo que todavía está debajo de la pantalla.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const DESKTOP = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';
const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
// Solo lo que aún no se ve: lo que ya está en pantalla nunca parpadea.
const below = <T extends HTMLElement>(els: T[]) => els.filter((el) => el.getBoundingClientRect().top > innerHeight * 0.92);

/* ---------- Lenis: solo en computador con mouse, sincronizado con ScrollTrigger ---------- */
if (matchMedia(DESKTOP).matches) {
  void import('lenis').then(({ default: Lenis }) => {
    const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.12 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // Con un diálogo abierto (menú o visor) la página no se mueve.
    addEventListener('dw:lock', () => lenis.stop());
    addEventListener('dw:unlock', () => lenis.start());
  });
}

const mm = gsap.matchMedia();
mm.add({ desktop: DESKTOP, mobile: `not all and ${DESKTOP}` }, (ctx) => {
  const desktop = Boolean(ctx.conditions?.desktop);
  const ease = 'power3.out';

  /* ---------- Entradas por sección: un nivel por contenedor y escalonado que no es uniforme ---------- */
  const reveal = below($$('[data-reveal]'));
  gsap.set(reveal, { opacity: 0, y: desktop ? 36 : 18 });
  ScrollTrigger.batch(reveal, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: desktop ? 0.9 : 0.6,
      ease,
      // Lo primero llega más rápido y los siguientes se suman con menos separación.
      stagger: { each: desktop ? 0.11 : 0.07, ease: 'power2.out' },
      overwrite: true,
    }),
  });

  /* ---------- Títulos de sección: las líneas suben desde su propia máscara ---------- */
  below($$('[data-split]')).forEach((h) => {
    const split = SplitText.create(h, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    gsap.from(split.lines, {
      yPercent: 110,
      duration: desktop ? 1 : 0.7,
      ease: 'power4.out',
      stagger: 0.09,
      scrollTrigger: { trigger: h, start: 'top 86%', once: true },
    });
  });

  /* ---------- Hero: profundidad al hacer scroll (cada capa a su velocidad) ---------- */
  const hero = document.querySelector('#hero');
  if (hero && desktop) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } });
    tl.to('[data-depth="1"]', { yPercent: -8, ease: 'none' }, 0)
      .to('[data-depth="2"]', { yPercent: -22, rotate: 2, ease: 'none' }, 0)
      .to('.frag-bubble', { yPercent: -60, ease: 'none' }, 0)
      .to('.frag-price', { yPercent: -45, ease: 'none' }, 0)
      .to('.frag-stamp', { yPercent: -80, ease: 'none' }, 0)
      .to('.hero-title', { yPercent: -6, ease: 'none' }, 0);

    // Los fragmentos siguen un poco al cursor (≤ 6 px).
    const frags = $$('.frag');
    const movers = frags.map((f, i) => ({
      x: gsap.quickTo(f, 'x', { duration: 0.6, ease: 'power3' }),
      y: gsap.quickTo(f, 'y', { duration: 0.6, ease: 'power3' }),
      k: (i + 1) * 2,
    }));
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX / innerWidth - 0.5;
      const dy = e.clientY / innerHeight - 0.5;
      movers.forEach((m) => { m.x(dx * m.k); m.y(dy * m.k); });
    };
    hero.addEventListener('pointermove', onMove as EventListener);
    ctx.add(() => () => hero.removeEventListener('pointermove', onMove as EventListener));
  } else if (hero) {
    // Celular: la escena aparece una vez al llegar, sin seguir el scroll.
    const scene = below($$('.hero-scene .device, .hero-scene .frag'));
    if (scene.length) {
      gsap.set(scene, { opacity: 0, y: 24 });
      ScrollTrigger.batch(scene, { start: 'top 92%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.6, ease, stagger: 0.08 }) });
    }
  }

  /* ---------- Demos: las capas del panel activo se mueven con el escenario fijo (solo computador) ---------- */
  const stage = document.querySelector('[data-demo-stage]');
  if (stage && desktop && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.fromTo('.demo-stage .demo-desktop', { yPercent: 4 }, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
    gsap.fromTo('.demo-stage .demo-phone', { yPercent: 10 }, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  }

  /* ---------- Así trabajo: la línea de tiempo se dibuja con el scroll ---------- */
  const line = document.querySelector('[data-tl-line]');
  if (line) {
    gsap.fromTo(line, { scaleX: desktop ? 0 : 1, scaleY: desktop ? 1 : 0 }, {
      scaleX: 1,
      scaleY: 1,
      ease: 'none',
      scrollTrigger: desktop
        ? { trigger: '.timeline', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 }
        : { trigger: '.timeline', start: 'top 80%', end: 'bottom 70%', scrub: 0.4 },
    });
  }

  /* ---------- Oferta: la cifra se revela de abajo arriba y el sello cae ---------- */
  const big = document.querySelector<HTMLElement>('[data-offer-big]');
  if (big && below([big]).length) {
    gsap.from(big, { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 12, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: big, start: 'top 85%', once: true } });
  }
  const stamp = document.querySelector<HTMLElement>('[data-offer-stamp]');
  if (stamp && below([stamp]).length) {
    gsap.from(stamp, { y: -40, rotate: -14, opacity: 0, duration: 0.8, ease: desktop ? 'back.out(1.6)' : 'power3.out', scrollTrigger: { trigger: stamp, start: 'top 90%', once: true } });
  }

  /* ---------- Sobre mí: la foto se revela y luego tiene un parallax suave ---------- */
  const media = document.querySelector<HTMLElement>('[data-about-media]');
  if (media) {
    if (below([media]).length) {
      gsap.from(media, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1, ease: 'power4.inOut', scrollTrigger: { trigger: media, start: 'top 82%', once: true } });
    }
    if (desktop) {
      gsap.fromTo(media.firstElementChild, { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    }
  }

  /* ---------- Cierre: "Escríbeme" se arma letra por letra ---------- */
  const word = document.querySelector<HTMLElement>('[data-close-word]');
  if (word) {
    const split = SplitText.create(word, { type: 'chars', mask: 'chars' });
    gsap.from(split.chars, desktop
      ? { yPercent: 110, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: word, start: 'top 95%', end: 'bottom 70%', scrub: 0.6 } }
      : { yPercent: 110, duration: 0.7, ease: 'power4.out', stagger: 0.04, scrollTrigger: { trigger: word, start: 'top 90%', once: true } });
  }

  /* ---------- Pie: el logotipo sube hasta su recorte ---------- */
  const mark = document.querySelector('[data-foot-mark]');
  if (mark && desktop) {
    gsap.fromTo(mark, { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
  }

  /* ---------- Microinteracciones: solo con mouse ---------- */
  if (desktop) {
    // Botones magnéticos: siguen al cursor hasta 8 px y vuelven con un resorte.
    $$('[data-magnetic]').forEach((el) => {
      const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        x(gsap.utils.clamp(-8, 8, dx * 8));
        y(gsap.utils.clamp(-8, 8, dy * 8));
      };
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      el.addEventListener('pointermove', move as EventListener);
      el.addEventListener('pointerleave', leave);
      ctx.add(() => () => { el.removeEventListener('pointermove', move as EventListener); el.removeEventListener('pointerleave', leave); });
    });

    // Inclinación 3D (≤ 4°) en tarjetas de demo, paquetes y bloques.
    $$('[data-tilt]').forEach((el) => {
      gsap.set(el, { transformPerspective: 1000 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 8);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
      };
      const leave = () => gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      el.addEventListener('pointermove', move as EventListener);
      el.addEventListener('pointerleave', leave);
      ctx.add(() => () => { el.removeEventListener('pointermove', move as EventListener); el.removeEventListener('pointerleave', leave); });
    });
  }
});

// Las posiciones dependen de las fuentes y de las imágenes perezosas: se recalculan una vez.
void document.fonts.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
