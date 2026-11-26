# Cambios de la rama `mejora-web`

Rediseño de davidhcwebs.com con la dirección **"El mensaje en grande"** y la marca **DavidHC Webs**. Nada de esto está publicado: la rama no se ha subido ni mezclado con `main`. Se publica solo cuando digas "aprobado".

## Commits, en orden

| Commit | Qué |
|---|---|
| `10c3c25` | Fase 1: auditoría inicial, inventario intocable, línea base y plan (`AUDITORIA.md`) |
| `f679d92` | Fase 2: sistema de diseño (`DESIGN.md`) |
| `b1724f0` | DESIGN.md v2: dirección con GSAP y Lenis |
| `a4c4056` | Fase 3: textos nuevos ES/EN (`TEXTOS.md`) y ajustes aprobados |
| `97cdea1` | Fase 4: rediseño completo, marca, logo, favicon e imágenes para compartir |
| `e99a8e1` | HSTS en el dominio principal y prueba estable de "Saltar las demos" |
| `f33b610` | Fase 5: `llms.txt` y `<lastmod>` en el sitemap |
| `8bef5b3` | Fase 6: el titular ya no se desborda con sectores de varias palabras |
| `cf7a0f3` | Fase 7: este documento |
| (siguiente) | Foto nueva, atención 24/7, "realty" en inglés y correcciones de las revisiones finales |

## Rendimiento: antes y después (Lighthouse móvil)

"Antes" se midió en el sitio en vivo (Fase 1). "Después" se midió en la vista previa local (`astro preview`), porque la rama no está publicada. Al publicar conviene medir de nuevo en vivo.

| Página | Antes (Perf · A11y · BP · SEO · LCP · CLS) | Después (Perf · A11y · BP · SEO · LCP · CLS) |
|---|---|---|
| `/` | 99 · 100 · 100 · 100 · 1,4 s · 0 | **100 · 100 · 100 · 100 · 0,9 s · 0** |
| `/en/` | 100 · 100 · 100 · 100 · 1,1 s · 0 | **100 · 100 · 100 · 100 · 0,9 s · 0** |
| `/privacidad/` | 100 · 100 · 100 · 100 · 0,9 s · 0 | **100 · 100 · 100 · 100 · 0,6 s · 0** |
| `/en/privacy/` | 100 · 100 · 100 · 100 · 0,9 s · 0 | **100 · 100 · 100 · 100 · 0,6 s · 0** |

TBT 0 ms en todas. Lo que sí subió es el peso:

| | Antes | Después |
|---|---|---|
| Peso total de la home (Lighthouse) | 264 KB | 348 KB |
| JavaScript de la página (comprimido) | 9 KB | 5,2 KB al cargar |
| Capa de animación (GSAP + SplitText + ScrollTrigger) | — | 48,5 KB, se descarga **después** del evento `load`, con el navegador libre, y **nunca** con "reducir movimiento" ni con conexión lenta (ahorro de datos, 2G o 3G) |
| Lenis (scroll suave) | — | 5,4 KB, solo en computador con mouse |
| HTML de la home (comprimido) | 29 KB | 28,5 KB |

Altura de la home en celular: de unos 14.100 px a unos 10.000 px.

## Inventario intocable

| # | Qué | Estado | Cómo se comprobó |
|---|---|---|---|
| 1 | WhatsApp 573244281553 (+57) en todos los botones, con mensaje según sector, paquete, demo, calculadora y formulario | ✅ | e2e: todos los `wa.me` van a 573244281553; revisión de enlaces del build |
| 2 | Visor de demos con los 5 subdominios; desde `/en/` abre la versión en inglés de las bilingües | ✅ | e2e abre las 5 en celular y desde el escenario fijo de computador; las 8 URL responden 200 y permiten el iframe (`frame-ancestors https://davidhcwebs.com`) |
| 3 | CSP con los iframes y Cloudflare Web Analytics; `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | ✅ | e2e lee los encabezados; sin errores de consola |
| 3b | HSTS `max-age=31536000`, sin `preload` ni `includeSubDomains` (nuevo, aprobado) | ✅ | e2e |
| 4 | Páginas legales y sus enlaces en el pie y en el formulario | ✅ | e2e + revisión de enlaces (27 internos, 0 rotos, 0 anclas rotas) |
| 5 | `sitemap.xml` y `robots.txt` | ✅ | e2e; el sitemap ahora lleva `<lastmod>` |
| 6 | Canonical, hreflang, Open Graph y Twitter | ✅ | revisado en `dist/`; imágenes nuevas `og-es.png` y `og-en.png` de 1200×630 |
| 7 | Search Console (registro DNS TXT) | ✅ | no se tocó el DNS; `dig TXT davidhcwebs.com` sigue mostrando la verificación |
| 8 | 404 propia ES y EN | ✅ | e2e |
| 9 | Redirecciones 301 (`www.`, `workers.dev`, `http`) | ✅ | pruebas del Worker; `worker/` sin cambios |
| 10 | Medición de clics y visitas (`/api/event`) | ✅ | pruebas del Worker + e2e |
| 11 | Paleta naranja `#ff7a1f` y tinta `#050f16` | ✅ | `src/styles/site.css` |
| 12 | Despliegue igual: Workers Builds desde `main`, `wrangler.jsonc` y hooks | ✅ | `wrangler.jsonc`, `worker/` y `.githooks/` sin cambios respecto a `main` |

## Qué hay de nuevo

- **Marca DavidHC Webs:** logo "dh", favicon, íconos, manifest e imágenes para compartir.
- **Hero:** titular grande que cambia con el sector ("Páginas web para tu consultorio."), marco con la demo dentro del titular, escena con computador y celular. En celular la primera pantalla tiene solo título, subtítulo, WhatsApp y "Ver demos".
- **Demos:** en computador, escenario fijo con poco scroll por sector, contador 1/5 y enlace para saltarlo; en celular, carrusel con la siguiente asomándose y puntos de posición. El visor abre los subdominios reales.
- **Así trabajo**, **Qué recibes**, **Paquetes antes de la calculadora**, **oferta** (sale de `OFFER` en `site.config.mjs`), **Sobre mí** con la Javeriana, **FAQ**, cierre con formulario plegado en celular.
- **Animación:** GSAP con ScrollTrigger y SplitText, Lenis solo en computador con mouse, botones magnéticos e inclinación 3D solo con mouse. Con "reducir movimiento" no se anima nada y todo se ve.
- **SEO:** "Bogotá" y "páginas web" en título, H1/subtítulo, meta description y JSON-LD; JSON-LD `ProfessionalService` con teléfono, Bogotá, Colombia y atención 24/7 (lunes a domingo, 00:00–23:59); en ES y EN la web dice "Te respondo el mismo día, todos los días"; `FAQPage`; `llms.txt`; `<lastmod>`.
- **Pruebas:** `npm test` cubre todo lo anterior, incluido el escenario de demos en computador, el carrusel en celular, la oferta desde la configuración, los encabezados y el titular a 320 px con cada sector.

### Cómo apagar o cambiar la oferta

En `site.config.mjs`:

```js
export const OFFER = { active: true, spotsLeft: 3, spotsTotal: 3, discount: 0.3 };
```

`spotsLeft: 2` cambia "quedan 3 de 3" en ES y EN. `active: false` (o `spotsLeft: 0`) quita la sección y los precios rebajados.

## QA de la Fase 6

Hecho:

- Sin desborde horizontal en las 4 páginas a 320 px, 768 px y con zoom al 200 %.
- Titular con cada sector a 320, 390 y 1440 px en ES y EN. **Se encontró y arregló** un desborde con "clínica estética", "aesthetic clinic" y "real estate agency".
- Enlaces internos, anclas, números de WhatsApp y las 8 URL de demos.
- Encabezados de seguridad.
- `npm test` completo en verde y Lighthouse al final.

Revisiones formales sobre la versión final:

- **impeccable audit** (detector sobre la página renderizada + revisión manual): un hallazgo. Los nombres inactivos del índice de demos tenían contraste de 3,7:1 → ahora ≥ 4,5:1 en los 5 colores de sector. Sin objetivos táctiles menores de 24 px; 69 paradas de teclado, todas con foco visible; sin JavaScript y con "reducir movimiento" no queda contenido escondido.
- **web-review** (capturas de página completa a 375, 768 y 1440 px): en celular el celular de la escena tapaba "¿Qué negocio tienes?" y el sello "Ejemplo gratis en 48 horas" se montaba sobre la burbuja → la escena se ajusta al ancho y queda a ~29 px del título de 320 a 599 px. En tableta había 270–330 px de naranja vacío bajo los botones → la escena sube. La foto en celular pasó del 52 % al 72 % del ancho.
- **Animaciones**: `review-animations` no está instalada en esta sesión; usé `improve-animations` (misma escuela, Emil Kowalski) en modo rápido. Curvas y duraciones correctas, nada escala desde 0, "reducir movimiento" lo quita todo. Se corrigió que el rotador del hero siguiera girando y descargando capturas con el hero fuera de pantalla.

## [PENDIENTE]

Nada pendiente de tu parte. Resueltos en esta ronda: la foto nueva (`public/assets/foto-david.webp`, 576×720, 21 KB, sin metadatos de ubicación), el horario (24/7) y el titular en inglés ("realty", 3 líneas).

## Cómo verlo en tu computador

```bash
git checkout mejora-web
```

```bash
npm install
```

```bash
npm run build && npm run preview
```

Abre http://localhost:4321 (español) y http://localhost:4321/en/ (inglés). Para ver el escenario de demos y Lenis, usa una ventana de al menos 1024 px con mouse; para el carrusel, reduce la ventana o usa el modo celular del navegador.

Para correr todas las pruebas, como lo hace el `pre-push`:

```bash
npm test
```

## Para publicar (solo cuando digas "aprobado")

Mezclar `mejora-web` en `main` y subir `main`. Workers Builds publica solo. Después: medir Lighthouse en vivo y revisar en Search Console que el sitemap se lea con las fechas nuevas.
