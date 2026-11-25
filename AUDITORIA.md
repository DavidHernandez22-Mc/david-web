# Auditoría de davidhcwebs.com · Fase 1

Rama: `mejora-web` (creada desde `main` en `b5891cb`). En esta fase no se cambió código: este archivo es lo único nuevo.
Fecha: 25 de noviembre de 2026. Revisado en vivo (https://davidhcwebs.com) a 320, 375, 768 y 1440 px, con teclado, y leyendo el código.

Skills usadas: website-design → web-review · impeccable → critique (dos evaluaciones independientes: diseño y detector automático) y audit · copywriting-kit → copy-diagnose · searchfit-seo → seo-audit y technical-seo · redesign-existing-projects · find-animation-opportunities · animation-performance.

---

## 1. Inventario intocable

Todo esto funciona hoy y debe seguir igual al final. Casi todo ya lo cubre `npm test` (lint + pruebas del Worker + build + e2e), que corre solo antes de cada push.

| # | Qué | Dónde vive | Cómo se comprueba |
|---|---|---|---|
| 1 | WhatsApp 573244281553 (+57) en todos los botones `wa.me` (10 en la home), con mensaje precargado según sector, paquete, demo, calculadora y formulario | `site.config.mjs:9` (`WHATSAPP_NUMBER`), mensajes en `src/i18n/es.ts` y `en.ts` (`wa`), función `wa()` en `src/i18n/shared.ts` | e2e: "10 enlaces van a 573244281553", "abre WhatsApp" |
| 2 | Visor de demos (iframe) con las 5 demos en `odontologia.`, `restaurante.`, `inmobiliaria.`, `veterinaria.` y `estetica.davidhcwebs.com`; desde `/en/` abre la versión `/en/` de las bilingües | `src/i18n/shared.ts` (`DEMOS`, `demoUrl`), `src/components/Home.astro:470` (`<dialog class="viewer">`), `src/scripts/main.ts` | e2e: "iframe carga contenido de…", "…se abre en inglés" |
| 3 | CSP que permite esos iframes (`frame-src`) y Cloudflare Web Analytics (`static.cloudflareinsights.com`, `cloudflareinsights.com`); además `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | `public/_headers` | e2e "sin errores de consola"; `curl -I` |
| 4 | Páginas legales y sus enlaces | `src/pages/privacidad/index.astro`, `src/pages/en/privacy/index.astro`, `src/components/Legal.astro`; enlaces en el footer (`Home.astro:459`) y en el consentimiento del formulario (`Home.astro:439`) | e2e + revisión de enlaces internos (0 rotos) |
| 5 | `sitemap.xml` (4 URLs con hreflang) y `robots.txt` | `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`, ambos leen `SITE_URL` de `site.config.mjs:3` | 200 en vivo |
| 6 | Canonical, hreflang (es/en/x-default), Open Graph y Twitter | `src/layouts/Base.astro:18-36`, imágenes `public/og-es.png` y `public/og-en.png` | revisado en `dist/` |
| 7 | Search Console | Verificado por **registro DNS TXT** `google-site-verification=…` en la zona de Cloudflare, no en el repo. No tocar el DNS. | `dig TXT davidhcwebs.com` |
| 8 | 404 propia (ES y EN, `noindex`) | `src/pages/404.astro`, `src/pages/en/404.astro`, `src/components/NotFound.astro`; `wrangler.jsonc` `not_found_handling: "404-page"`; integración en `astro.config.mjs` que mueve `en/404` | `/hola` → 404 |
| 9 | Redirecciones 301: `www.` y `david-web.castrod2207.workers.dev` → `https://davidhcwebs.com`, `http` → `https` | `worker/index.js:11-25` | `npm run test:worker` |
| 10 | Medición de clics y visitas (`/api/event`, Analytics Engine) | `worker/index.js`, `site.config.mjs:16`, eventos `data-track` en `Home.astro` | test:worker + e2e |
| 11 | Paleta: naranja `--orange: #ff7a1f` y tinta `--ink: #050f16` | `src/styles/site.css:8-9` | — |
| 12 | Despliegue: Workers Builds desde `main`; hooks `pre-commit`/`pre-push` | `wrangler.jsonc`, `.githooks/` | no se toca |

---

## 2. Línea base de rendimiento (Lighthouse móvil, sitio en vivo)

| Página | Performance | Accesibilidad | Buenas prácticas | SEO | LCP | CLS | TBT | Peso |
|---|---|---|---|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 | 1,4 s | 0 | 0 ms | 264 KB |
| `/en/` | 100 | 100 | 100 | 100 | 1,1 s | 0 | 0 ms | 230 KB |
| `/privacidad/` | 100 | 100 | 100 | 100 | 0,9 s | 0 | 0 ms | 87 KB |
| `/en/privacy/` | 100 | 100 | 100 | 100 | 0,9 s | 0 | 0 ms | 87 KB |

- JavaScript total: **9 KB**. Fuentes propias (2 woff2, `font-display: swap`). HTML de la home: 29 KB con Brotli. HTTP/2, TTFB ≈ 0,22 s.
- Build: 0 errores, 0 warnings (`astro check`). Sin scroll horizontal a 320 px.

**Esto cambia el plan:** la web ya está en el techo de rendimiento. La meta "≥ 90" ya se cumple; el riesgo real de un rediseño es **bajar** de 99-100. Cada cambio de la Fase 4 se medirá contra esta tabla.

---

## 3. Problemas, ordenados por impacto en ventas

Leyenda de severidad: **P1** = cuesta clientes; **P2** = resta confianza o claridad; **P3** = pulido. No hay P0 (nada bloquea contactarte).

### P1 · La foto de "Soy David" resta confianza en el momento decisivo
- Selfie con gafas de sol al atardecer, al lado de "Ingeniero de sistemas en formación". Es justo donde una dueña de consultorio decide si te paga $2.900.000.
- Arreglo: foto de frente, sin gafas, luz neutra (idealmente trabajando). **[PENDIENTE: foto nueva tuya]**.
- La frase "en formación" es verdad y no la voy a cambiar por mi cuenta. **[PENDIENTE: ¿cómo quieres describir tu formación?]**
- Fuente: impeccable critique (diseño).

### P1 · El primer pantallazo hace demasiadas cosas, y en escritorio el orden se invierte
- En móvil compiten 10 elementos: CTA, "ejemplo gratis", 2 enlaces, la pregunta, 6 chips, la burbuja del mensaje, la lista y el teléfono.
- En escritorio, "¿Qué negocio tienes?" y los chips van **encima** del título: lo primero que se lee es una pregunta pequeña, no la promesa.
- Los chips de sector se cortan a la derecha en móvil ("Ve…") sin indicar que se deslizan.
- Arreglo: mismo orden en todos los tamaños (título → subtítulo → WhatsApp → "ejemplo gratis en 48 horas"), y el selector justo debajo como paso 2. Sacar la burbuja del hero, porque ya aparece en el cierre.
- Fuentes: web-review, impeccable critique (carga cognitiva 4/8 fallos), copy-diagnose.

### P1 · La calculadora va antes de Paquetes y termina con un ancla negativa
- Nombra Esencial, Profesional y Premium antes de explicarlos, y lo último que se ve antes de los precios es "Premium 10,9 meses" con la barra más larga.
- Arreglo: mover la calculadora **después** de Paquetes (o integrarla en cada paquete) y destacar el Recomendado.
- Fuente: impeccable critique.

### P1 · La web no dice "Bogotá" ni tiene SEO local
- Todo dice "Colombia"; la única mención de Bogotá es la pregunta "¿Trabajas fuera de Bogotá?", que da por hecho algo que la página nunca dice.
- El título (`David Hernández · Webs para negocios en Colombia`) no incluye "páginas web" ni "Bogotá", que es lo que busca tu cliente.
- El JSON-LD es `ProfessionalService` con `areaServed: Colombia`, sin teléfono ni horario.
- Arreglo: posicionar Bogotá en título, H1/subtítulo, meta y JSON-LD (Fase 5).
- **[PENDIENTE]**: ver decisiones 2 y 3 abajo.
- Fuentes: seo-audit, copy-diagnose.

### P2 · La página es muy larga en celular (≈ 14.400 px)
- Cada demo ocupa ≈ 1.000 px; hay 11 secciones, 8 tarjetas en "Lo que recibes" que repiten lo que dicen los paquetes, y "48 horas", "20 minutos" y "Respondo el mismo día" se repiten 3 o más veces. El precio queda en la segunda mitad.
- Arreglo: demos más compactas en móvil, "Lo que recibes" en 4 bloques, quitar repeticiones.
- Fuentes: impeccable critique, web-review.

### P2 · El titular promete un resultado que la propia página dice no prometer
- "Tu negocio, con una web que **trae clientes** por WhatsApp" frente a "Tú decides. **Yo no te prometo un número.**"
- La meta description dice "Mira demos **reales**" y la nota dice "Son negocios **ficticios**".
- Arreglo: que el titular diga lo que haces sin garantizar el resultado, y cambiar "demos reales" por "demos que funcionan".
- Fuente: copy-diagnose.

### P2 · La oferta del 30% no se conecta con los precios
- "Mis primeros 3 clientes" no dice cuántos cupos quedan, y los paquetes muestran el precio lleno.
- **[PENDIENTE: ¿siguen los 3 cupos? Si queda alguno, ¿lo muestro con el precio rebajado en cada paquete?]**
- Fuente: impeccable critique.

### P2 · Jerga en Paquetes
- "Landing de una página", "SEO básico" y "Hosting" sin explicar, para un dueño de negocio que no es técnico.
- Arreglo: decirlo en sus palabras ("aparecer en Google cuando te buscan", etc.).
- Fuente: impeccable critique (heurística 2).

### P2 · Seguridad: el dominio principal no envía HSTS
- Las 5 demos sí lo envían; `davidhcwebs.com` no.
- No es un fallo de lo que hay, pero sí un encabezado que falta y que pediste mantener.
- **[PENDIENTE: decisión 6]**.
- Fuente: technical-seo.

### P2 · Con el texto al 200% aparece scroll horizontal
- A 375 px, el documento pasa a medir 491 px de ancho. WCAG 1.4.4 pide que el texto pueda agrandarse sin romper la página.
- Se revisa y corrige en la Fase 6 (break-ui).
- Fuente: impeccable audit.

### P3 · Pulido
- **Palabras sueltas al final de línea** en la lista "Cómo trabajo": "web.", "empezar." y "citas.". Lo detectó el detector de Impeccable. Se arregla con `text-wrap: pretty` en esos `li` (`site.css` solo lo aplica a `p`).
- **Reducir movimiento** se resuelve hoy con una regla global (`site.css:418-421`) que deja todas las transiciones en 0,01 ms. Funciona, pero apaga también la retroalimentación útil (por ejemplo, el cambio de color del hero al elegir sector). Mejor una alternativa más suave: solo opacidad, sin desplazamiento.
- **"Lo que recibes"**: las 8 tarjetas grises iguales son el único bloque que se ve genérico ("podría ser de cualquier agencia").
- **Sitemap sin `<lastmod>`**, `/favicon.ico` da 404 (hay svg y png declarados) y las URL sin barra final redirigen con 307 en vez de 301. Las canonicals lo compensan, así que el impacto es bajo.
- **No existe `llms.txt`** (Fase 5).
- **"Respondo el mismo día, de lunes a sábado"** aparece 3 veces.
- **Preguntas frecuentes**: las burbujas alineadas a la derecha y de ancho variable se leen en zigzag en móvil.
- **El teléfono del hero** arranca mostrando el restaurante, que es justo la demo que vuelve a aparecer después.
- **"Hablemos de mis números"** dice "Ya hice las cuentas en tu calculadora", pero no incluye las cifras en el mensaje.

### Lo que está bien y hay que conservar
- **Es específica, no genérica.** Todo gira alrededor de WhatsApp: mensaje precargado y visible, preguntas frecuentes como chat, cierre "Escríbeme". Los chips cambian titular y beneficios por sector. Veredicto de Impeccable: "otro producto no podría usar esta página tal cual".
- **La honestidad como estrategia.** "Aún no tengo una lista larga de clientes", demos marcadas como ficticias, "no te prometo un número" y el 30% a cambio de testimonio.
- **Las demos funcionando dentro del visor** son la mejor prueba de la página. Son el momento fuerte, justo después de "No te lo cuento. Tócalas."
- **Accesibilidad sólida.** Foco visible en todo, enlace "Saltar al contenido", errores del formulario junto a cada campo, `alt` en todas las imágenes, un solo H1 y sin saltos de títulos.
- **Sistema coherente.** Dos fuentes (Red Hat Display/Text), una paleta corta con tokens, esquinas rectas y una sola sombra; nada del "look IA" (degradados morados, vidrio, tarjetas de 3 columnas iguales).
- **Movimiento ya correcto.** Retroalimentación al presionar (`scale(.97)`), revelado al hacer scroll solo con `transform`/`opacity`, menú escalonado, hero con fundido sin parpadeo, y todo respetando "reducir movimiento".

### Puntajes de referencia
| Revisión | Resultado |
|---|---|
| Lighthouse móvil | 99–100 en las 4 categorías |
| Impeccable critique (Nielsen) | 26/32 (dos heurísticas n/a por ser página de venta): **bueno, con fricción de jerarquía y largo** |
| Impeccable audit | Accesibilidad 3 · Rendimiento 4 · Tokens 3 · Responsive 3 · Integridad 4 = **17/20 (bueno)** |
| Detector de Impeccable | Fuentes: 0 hallazgos. En vivo: 3 avisos menores (palabras sueltas) |
| SEO (seo-audit + technical-seo) | Base técnica excelente; falta el SEO **local** (Bogotá), HSTS y llms.txt |

### Animación (find-animation-opportunities + animation-performance)
Hoy la web casi no necesita más movimiento. Lo que sí vale la pena:

1. **Visor de demos.** Hoy se abre de golpe a pantalla completa. Abre de vez en cuando y el corte es brusco, así que conviene suavizarlo: `@starting-style` con `opacity: 0; transform: translateY(16px)` → reposo en 260 ms con `var(--ease-out)` (`cubic-bezier(.22,1,.36,1)`), cierre en 180 ms y fondo con fundido de 200 ms. Con "reducir movimiento", solo opacidad.
2. **Revelados por sección.** Escalonar 40–60 ms los elementos de un mismo bloque (pasos de "Cómo funciona", tarjetas de "Lo que recibes"), una sola entrada por contenedor y sin bloquear la interacción. Sale con el sistema CSS que ya existe, sin librerías.
3. **El scroll se lee leyendo y escribiendo el layout en la misma pasada.** El revelado lee `getBoundingClientRect()` dentro de un bucle que también quita clases. Es poco costoso, pero conviene pasarlo a `IntersectionObserver`.

**Descartado, a propósito:**
- **Lenis (scroll suave):** el scroll es la interacción más frecuente de la página, en móvil Lenis no actúa por defecto y añade JavaScript a todas las páginas. No aporta a la venta y va contra "velocidad > animaciones".
- **GSAP + ScrollTrigger:** pesa ≈ 25–30 KB comprimido para hacer lo que el CSS ya hace con 0 KB. Solo se justificaría para un efecto concreto que CSS no logre; hoy no hay ninguno.
- **Números de la calculadora que suben animados:** son datos que el usuario está leyendo; moverlos estorba.

---

## 4. Decisiones que necesito de ti antes de seguir

1. **Nombre de marca.** La web dice "**David Hernández · Webs para negocios**" (logo, títulos, Open Graph, JSON-LD). En tu pedido dices "**DavidHC Webs**". ¿Cambio la marca a "DavidHC Webs" (implica nuevo logo/wordmark e imágenes para compartir) o me quedo con la actual?
2. **Bogotá.** ¿Te presento como "en Bogotá", manteniendo que trabajas con todo Colombia?
3. **Datos para el JSON-LD local.** Al inicio del proyecto pediste no publicar dirección ni teléfono fuera de WhatsApp. `LocalBusiness` con "teléfono, horario, área de servicio" significa poner el número en los datos estructurados (no visible, pero público en el código).
   - ¿Lo autorizas?
   - **[PENDIENTE: horario exacto]**. Hoy solo dice "lunes a sábado".
   - Sin dirección, recomiendo `ProfessionalService` con `areaServed: Bogotá` en vez de `LocalBusiness` con dirección.
4. **Versión en inglés.** Si reescribo los textos, ¿actualizo también `/en/` (recomendado, para que no quede desfasada) o la dejo como está?
5. **Animación.** Recomiendo **no** usar GSAP ni Lenis (sección anterior) y quedarme en CSS. ¿De acuerdo, o quieres que los use igual en algún punto concreto?
6. **HSTS.** ¿Lo agrego al dominio principal? Recomiendo `max-age=31536000` sin `includeSubDomains`, porque las demos ya traen su propio HSTS.
7. **Foto y formación** (P1 arriba). ¿Tienes otra foto? ¿Cómo describimos tu formación?
8. **Oferta del 30%.** ¿Cuántos cupos quedan?

---

## 5. Plan de cambios por fases

Principio: **evolucionar, no reemplazar.** La identidad (naranja, Red Hat, esquinas rectas, voz honesta, WhatsApp como hilo conductor) es lo mejor que tiene la web; lo que falla es jerarquía, largo, confianza y SEO local.

| Fase | Qué | Resultado |
|---|---|---|
| 2 · Sistema de diseño | Documentar en `DESIGN.md` el sistema que ya existe y refinarlo: tokens de color con su función (naranja = acción y marca, nunca texto pequeño), escala tipográfica, espaciados, un solo estilo de botón de WhatsApp, superficies. Sin modo oscuro: hoy no existe y no lo recomiendo para esta página de venta. | `DESIGN.md` |
| 3 · Textos | Hero sin promesa de resultado y con Bogotá; orden de secciones: hero → problema → demos → cómo trabajo → qué incluye (4 bloques) → paquetes → calculadora → oferta → sobre mí → preguntas → cierre; quitar jerga y repeticiones; copy-proof-check de cada afirmación. Mismos cambios en `/en/` si apruebas la decisión 4. | `es.ts` / `en.ts` |
| 4 · Construcción | Hero con un solo foco y el mismo orden en todos los tamaños; demos más compactas en móvil; "Lo que recibes" rediseñado; calculadora después de Paquetes; visor con entrada suave; revelados escalonados; `text-wrap: pretty`; "reducir movimiento" más suave. Solo CSS y el JS que ya hay. | `Home.astro`, `site.css`, `main.ts` |
| 5 · SEO y visibilidad | Título y meta con "páginas web" y "Bogotá"; JSON-LD local según la decisión 3; `FAQPage` ya existe (se mantiene); `<lastmod>` en el sitemap; `favicon.ico`; `llms.txt`; revisar la imagen para compartir en WhatsApp. | `Base.astro`, `sitemap.xml.ts`, `public/` |
| 6 · Calidad | break-ui (textos largos, 320 px, zoom 200%), review-animations, web-review e impeccable audit de nuevo, security-review de encabezados, `npm test`, Lighthouse contra la línea base. | informe |
| 7 · Entrega | Commits ordenados en `mejora-web`, `CAMBIOS.md` con antes/después y el inventario con ✅. Sin merge hasta tu "aprobado". | — |
