# DESIGN.md · DavidHC Webs

Sistema visual de https://davidhcwebs.com. Es una **evolución** del sistema actual, no un reemplazo: se conservan el naranja, la tinta, Red Hat Display/Text, las esquinas rectas y la voz honesta, y se ordena lo que hoy está suelto. Todo lo que se construya en las fases 3 a 6 sigue este documento.

- **Marca:** DavidHC Webs. Páginas web a la medida para negocios, en Bogotá, con atención en todo Colombia.
- **Para quién:** dueños de negocios de servicios (consultorios, clínicas, restaurantes, veterinarias, inmobiliarias). No son técnicos y deciden desde el celular.
- **Lo que la página debe lograr:** que escriban por WhatsApp (+57 324 428 1553).
- **Sensación:** directa, segura y hecha a mano. Profesional sin ser corporativa.
- **Límites que no se negocian:** rendimiento móvil igual o mejor que la línea base (Lighthouse 99–100). Solo CSS y el JavaScript que ya existe (≈9 KB), sin GSAP ni Lenis. Todo movimiento respeta `prefers-reduced-motion`. Sin modo oscuro.

---

## 1. La idea

> En esta página, **el mensaje de WhatsApp que el visitante te va a mandar** se convierte en **la frase que compone cada sección**.

- **El hero es esa frase,** dicha en grande. En el lugar de una palabra va un marco pequeño con la demo del sector elegido, de modo que el visitante "completa" la frase con los ojos.
- **Lo que el visitante puede hacer (la parte viva):** elegir su sector cambia la palabra, la miniatura y el mensaje precargado. Esto ya existe; se conserva y se ordena.
- **El resto de la página repite esa gramática a menor escala:** una afirmación corta a la izquierda y su prueba a la derecha (la demo, el precio, los pasos), como una conversación que se lee de arriba abajo.

**Prueba del competidor:** cambiar "DavidHC Webs" por otra agencia de Bogotá rompe la frase. Ninguna otra muestra **el mensaje del cliente** ni **cinco demos funcionando en el visor**.

**Dirección de composición:** `sentence-as-layout`, de la skill design-taste-frontend (semilla 1763801763), adaptada a esta marca (ver §9).

---

## 2. Color

Una base clara, una tinta y un acento. El naranja es la marca y la acción; nunca es texto pequeño sobre blanco.

| Token | Valor | Función | Contraste |
|---|---|---|---|
| `--ink` | `#050f16` | Texto principal, botón principal sobre fondos claros o naranja, fondos invertidos | 19,3:1 sobre blanco · 7,4:1 sobre naranja |
| `--ground` | `#ffffff` | Fondo base | — |
| `--tone` | `#f1f2f0` | Superficies que se separan del fondo por un escalón de tono, no por líneas | tinta 17,2:1 |
| `--soft` | `#434c52` | Texto secundario (notas, ayudas, letra pequeña) | 8,8:1 sobre blanco · 7,8:1 sobre tono |
| `--orange` | `#ff7a1f` | Marca: campos de color (hero, oferta, cierre), botón principal sobre fondo de tinta, acentos gráficos | Solo con tinta encima (7,4:1). **Nunca** blanco sobre naranja (2,6:1) ni naranja como texto sobre blanco (2,6:1) |
| `--orange-text` *(nuevo)* | `#b34d08` | Las únicas veces en que hace falta texto anaranjado sobre blanco (por ejemplo, un precio destacado) | 5,3:1 sobre blanco |
| `--orange-soft` | `#ffb27d` | Texto o detalle anaranjado sobre tinta | 11,0:1 sobre tinta |
| `--on-ink-soft` | `#9aa3a8` | Texto secundario sobre tinta | 7,5:1 |
| `--wa` | `#25d366` | **Solo** el icono de WhatsApp y el botón flotante (con tinta encima) | tinta 9,8:1 |
| `--line-ink` | `rgb(5 15 22 / .14)` | Bordes de campos de formulario y del iframe; nada decorativo | — |

**Colores de sector** (`SECTOR_THEME` en `src/i18n/shared.ts`). Cuando el visitante elige un sector, el hero toma por un momento los colores de esa demo (fondo, tinta y botón). Es parte de la idea y se conserva, pero solo vive en el hero y en el panel de cada demo; ninguna otra sección los usa.

**Reglas**
- **Proporción por pantalla:** fondo blanco o tono ≈ 70%, tinta ≈ 20% y naranja ≤ 10%, salvo en los tres campos de marca (hero, oferta y cierre).
- **Los campos de color se alternan:** blanco → tono → tinta → naranja. Dos secciones seguidas nunca comparten el mismo campo.
- **Lo que no se usa:** degradados, brillos y sombras sobre elementos en reposo.

---

## 3. Tipografía

Dos familias, las que ya se cargan (woff2 propios con `font-display: swap` y un respaldo con las métricas ajustadas):

- **Red Hat Display:** títulos, cifras y botones. Pesos 800–900; 500 solo en frases-afirmación.
- **Red Hat Text:** texto corrido, etiquetas y formularios. Pesos 400, 500 y 600.

### Escala

Hoy hay 14 tamaños de título sueltos; quedan 7 pasos y uno de firma.

| Token | Valor | Uso | Interlineado / tracking |
|---|---|---|---|
| `--step-xs` | `0.875rem` (14 px) | Notas legales, ayudas de formulario, pie. Nunca menos de 13 px | 1.45 |
| `--step-body` | `clamp(1.0625rem, 1rem + .25vw, 1.1875rem)` (17–19 px) | Texto corrido, botones, campos | 1.5 · medida 55–70 caracteres |
| `--step-lead` | `clamp(1.25rem, 1.1rem + .7vw, 1.625rem)` (20–26 px) | Subtítulo del hero y entradas de sección | 1.3 · máx. 34ch |
| `--step-h3` | `clamp(1.375rem, 1.1rem + 1.1vw, 2rem)` (22–32 px) | Títulos de bloque (paquete, paso, pregunta) | 1.05 · −0.02em |
| `--step-statement` | `clamp(1.5rem, 1.1rem + 1.8vw, 2.25rem)` (24–36 px) | Frases-afirmación largas (biografía, cierre). Hasta unas 25 palabras, ≤ 3 líneas | 1.2 · −0.01em · peso 500 |
| `--step-h2` | `clamp(2.25rem, 1.2rem + 4.2vw, 4.5rem)` (36–72 px) | Títulos de sección | 0.98 · −0.03em |
| `--step-display` | `clamp(2.5rem, 1rem + 6.4vw, 7rem)` (40–112 px) | Solo la frase del hero | 0.95 · −0.04em |
| `--step-giant` *(firma)* | `clamp(5rem, 19vw, 19rem)` | La palabra "Escríbeme" del cierre y el logotipo recortado del pie. Una vez por página cada uno | 0.85 · −0.05em |

**Reglas**
- **Títulos en dos líneas o menos** a cualquier ancho; si no caben, se recorta el texto antes que achicar la letra. En móvil, el hero debe caber en unos 2 × 16 caracteres por línea a 375 px.
- **Saltos de línea:** `text-wrap: balance` en títulos; `text-wrap: pretty` en párrafos **y en elementos de lista** (corrige las palabras sueltas que detectó la auditoría).
- **Cifras** (precios, calculadora, plazos) con `font-variant-numeric: tabular-nums`.
- **Alineación** a la izquierda siempre. Nada centrado, salvo el contenido del botón.
- **Lo que no se usa:**
  - Etiquetas pequeñas sobre los títulos ni texto en mayúsculas con espaciado ancho.
  - Numeración decorativa (01 / 02).
  - Monoespaciadas.
  - Palabras destacadas con otro estilo dentro de un título.

---

## 4. Espacio

Escala de base 4. Ningún margen, relleno o separación usa un valor fuera de ella.

| Token | Valor |
|---|---|
| `--s-1` … `--s-10` | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 px |
| `--gutter` | `clamp(16px, 3vw, 40px)`: margen lateral único de toda la página |
| `--section` | `clamp(72px, 10vw, 160px)`: separación entre secciones, siempre mayor que cualquier separación dentro de una |
| `--wrap` | `1440px`: ancho máximo del contenedor |
| `--measure` | `62ch`: medida del texto corrido |

- **Rejilla:** 12 columnas en escritorio (≥ 1024 px), 6 en tablet y 1 en móvil. Los bloques de texto comparten 2 o 3 bordes izquierdos en toda la página.
- **Composición de sección:** la afirmación ocupa las columnas 1–6 y su prueba las 7–12. En móvil, primero la afirmación y luego la prueba.
- **Altura total en móvil (375 px):** de ≈ 14.400 px a ≤ 10.000 px, recortando repeticiones (ver §8).

---

## 5. Forma y profundidad

- **Radio:** `0` en todo (botones, campos, paneles, imágenes y el marco del hero). Son esquinas rectas, como ya es la marca.
  - Excepciones: el marco de celular de las demos, que imita un dispositivo real (`clamp(26px, 7vw, 46px)`), y el botón flotante de WhatsApp, que es circular por convención de WhatsApp.
- **Sombras:** ninguna sobre elementos en reposo. Una sola sombra, `--shadow-float: 0 18px 40px -16px rgb(5 15 22 / .35)`, para lo que de verdad flota: el botón flotante de WhatsApp, el teléfono del hero y los diálogos.
- **Separar superficies:** con un escalón de tono (`--ground` → `--tone`) o un cambio de campo, nunca con líneas de 1 px ni recuadros.
- **Capas (`z-index`):** `--z-float: 20` (botón flotante) · `--z-skip: 50` (saltar al contenido) · los `<dialog>` usan la capa superior nativa del navegador.

---

## 6. Componentes

### Botones (un solo tipo de acción, tres pieles según el fondo)

| Variante | Fondo | Texto | Dónde |
|---|---|---|---|
| Principal | `--ink` | `#fff` | Sobre blanco, tono o naranja: **todos** los botones de WhatsApp |
| Principal invertido | `--orange` | `--ink` | Solo sobre campos de tinta (calculadora, formulario de cierre) |
| Secundario | — | `--ink`, subrayado de 2 px con separación de .25em | Enlaces de texto: "Ver demos", "Ver paquetes" |

- **Tamaño:** alto mínimo de 54 px (44 en barras compactas) y relleno `12px 22px`.
- **Contenido:** el icono de WhatsApp de 20 px a la izquierda y el **verbo siempre igual**: "Escríbeme por WhatsApp". Las variantes de contexto solo agregan el objeto ("Escríbeme por el paquete Profesional"). Hoy conviven "Escríbeme", "Quiero…" y "Hablemos…".
- **Estados:**
  - Hover (solo con `(hover: hover) and (pointer: fine)`): el fondo pasa a `#1b2c36`, o a `#ff9147` en el invertido, en 180 ms.
  - Presionado: `scale(.97)` en 140 ms.
  - Foco: contorno de 3 px `currentColor` con separación de 3 px.
  - Deshabilitado: opacidad .45 y `cursor: not-allowed`. No se usa para la acción principal.

### Otros componentes

- **Marco del hero (nuevo):** caja en línea de `1.6em × 0.82em`, alineada a la línea base, de esquinas rectas, con un borde de tinta de 0.06em hecho con relleno (no con `border`). Dentro va la captura WebP de 260 px de la demo del sector (`object-fit: cover`), que ya existe en `public/demos/`. En móvil pasa a su propia línea entre las dos mitades de la frase.
- **Chips de sector:** `radio` con borde de 2 px de tinta; seleccionado = relleno de tinta. Alto de 44 px (hoy son 40 px). En móvil salen del primer pantallazo y quedan como "paso 2", justo debajo, en una fila deslizable que muestra parte del chip siguiente como pista.
- **Campos:** fondo blanco, borde de 2 px `--line-ink` y de tinta al enfocar. Etiqueta arriba en `--step-xs` con peso 600. El error va debajo, asociado con `aria-describedby`, con el texto en `#b3261e` sobre blanco (6,5:1; el `#d93b1c` actual da 4,6:1, justo en el límite) y sin depender del color.
- **Navegación:** logotipo a la izquierda, 3 enlaces (Demos, Paquetes, Preguntas), "EN" y un botón principal compacto. En móvil: logotipo, "EN" y "Menú", que abre un `<dialog>` a pantalla completa sobre naranja. Sin vidrio ni barra flotante.
- **Panel de demo:** fondo con el color del sector, título de la demo, una línea de qué hace y el enlace "Ver demo", con la captura en celular y en computador. En móvil es más compacto: solo el celular, de 200 px de ancho, al lado del texto, y no debajo.
- **Visor de demos:** el `<dialog>` a pantalla completa que ya existe. Su barra lleva el nombre, "Pestaña nueva", "Quiero una así" (botón principal) y cerrar.
- **Paquete:** bloque de tono, con nombre (`--step-h3`) y frase. El precio va como un objeto: cifra en `--step-h2` dentro de un bloque naranja con tinta encima. Debajo, la lista (`text-wrap: pretty`) y el botón principal al fondo. El recomendado se distingue por el campo naranja completo, no por ser más alto.
- **Preguntas frecuentes:**
  - **Escritorio:** la pregunta en las columnas 1–6 (`--step-h3`) y la respuesta en las 8–12, abiertas.
  - **Móvil:** acordeón nativo (`<details>`), alineado a la izquierda y no en burbujas en zigzag. Así la página queda más corta.
- **Pie:** invitación a escribir y el botón principal arriba; enlaces (Demos, Paquetes, Preguntas, Política de privacidad, English) y la línea legal; abajo, el logotipo "DavidHC Webs" en `--step-giant`, recortado por el borde inferior.

---

## 7. Marca: DavidHC Webs

- **Logotipo:** "DavidHC" en Red Hat Display 900 y " Webs" en 500, mismo tamaño y tracking de −0.03em, en tinta. Se dibuja como contornos SVG con `scripts/build-brand.mjs`, como el actual, para no depender de la fuente.
- **Símbolo:** cuadrado naranja con "dh" en tinta, peso 900, de esquinas rectas. Se usa en favicon (`favicon.svg`, `favicon-48.png`, `favicon.ico` nuevo), iconos (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) y el manifiesto.
- **Imagen para compartir** (`og-es.png` / `og-en.png`, 1200×630, PNG ≤ 80 KB):
  - Campo naranja con la frase del hero en tinta a dos líneas, el logotipo abajo a la izquierda y "davidhcwebs.com" abajo a la derecha.
  - Sin fotos, para que se lea bien en la vista previa pequeña de WhatsApp.
- **Nombre en el código:** `site.config.mjs` concentra el nombre de marca (nuevo `BRAND_NAME`), así que títulos, Open Graph y JSON-LD salen de ahí.

---

## 8. Estructura de la página y largo

Orden aprobado: **hero → problema → demos → cómo trabajo → qué incluye → paquetes → calculadora → oferta → sobre mí → preguntas → cierre → pie.**

| Sección | Campo | Composición | Recorte para móvil |
|---|---|---|---|
| Hero | Naranja (o el del sector) | Frase de dos líneas con el marco de la demo; subtítulo; botón de WhatsApp; enlace secundario "Ver demos" | Solo título, subtítulo, botón principal y un secundario. Chips, burbuja y lista salen del primer pantallazo |
| Problema | Blanco | Afirmación a la izquierda y tres pruebas dibujadas (chat, búsqueda, web vieja) a la derecha | Las tres pruebas, más compactas |
| Demos | Color de cada sector | Afirmación "No te lo cuento. Tócalas." y luego 5 paneles | Paneles de ≈ 1.000 px → ≤ 520 px |
| Cómo trabajo | Tono | Cuatro pasos como frases: plazo (`--step-h3`) y explicación | "20 minutos" y "48 horas" aparecen aquí y en ningún otro bloque largo |
| Qué incluye | Blanco | Un párrafo de afirmación y 4 bloques: diseño a medida, textos, WhatsApp + Maps + Google, a tu nombre | De 8 tarjetas a 4 |
| Paquetes | Tono | Tres paquetes, el recomendado en campo naranja | Carrusel con pestañas, como hoy |
| Calculadora | Tinta | Después de los precios, con el recomendado destacado | — |
| Oferta 30% | Naranja | "Quedan 3 de 3 cupos" y el precio rebajado junto a cada paquete | — |
| Sobre mí | Blanco | Foto 4:5 a la izquierda (576×720, el mismo espacio que hoy) y biografía en `--step-statement` | — |
| Preguntas | Tono | Pregunta / respuesta (ver §6) | Acordeón |
| Cierre | Naranja → tinta | "Escríbeme" gigante y formulario opcional | "Respondo el mismo día" aparece **una sola vez** en la página |
| Pie | Tinta | Ver §6 | — |

---

## 9. Movimiento (solo CSS y el JavaScript actual)

| Token | Valor |
|---|---|
| `--ease-out` | `cubic-bezier(.22, 1, .36, 1)` |
| `--t-press` | 140 ms |
| `--t-hover` | 180 ms |
| `--t-field` | 380 ms (cambio de color del hero al elegir sector) |
| `--t-reveal` | 420 ms (opacidad) y 520 ms (desplazamiento de 18 px) |
| `--stagger` | 50 ms entre hijos de un mismo bloque, con un máximo de 4 escalones |
| `--t-dialog-in` / `--t-dialog-out` | 260 ms / 180 ms |

1. **Entrada del visor:** `@starting-style` con `opacity: 0; transform: translateY(16px)` → reposo en 260 ms con `--ease-out`. Al cerrar, 180 ms. El fondo hace un fundido de 200 ms.
2. **Entradas escalonadas:** cada sección revela sus partes (título, texto, prueba) con `--stagger`. Se activan con `IntersectionObserver` en lugar del `scroll` actual, se disparan una sola vez y el contenido es visible si el script falla.
3. **Retroalimentación:** presionar, hover y foco en todo lo que se toca. Ya existe y se unifica con los tokens de arriba.
4. **Firma (opcional):** las dos líneas del hero suben desde su línea base al cargar (la segunda 110 ms después). **Solo se queda si Lighthouse sigue en 99–100.** Si retrasa el LCP, se quita.

**Reducir movimiento:** se reemplaza la regla global que deja todo en 0,01 ms por una alternativa que **conserva el estado y quita el desplazamiento**: solo fundidos de opacidad de ≤ 200 ms, sin `transform`, sin escalonado ni la animación de firma, y el cambio de color del hero se mantiene.

**Lo que no se usa:** GSAP, Lenis, secciones fijas al hacer scroll, parallax, contadores animados en la calculadora, `filter: blur` ni `backdrop-filter`.

---

## 10. Imágenes e iconos

- **Lo que hay:** las capturas de las 5 demos (WebP en 3 anchos, ya optimizadas en `public/demos/`) y la foto de David (`public/assets/foto-david.webp`, 576×720). **[PENDIENTE: foto nueva antes de la Fase 4]**, que irá en el mismo espacio y con las mismas medidas.
- **Ilustraciones del problema:** dibujadas con HTML y CSS (chat, búsqueda, web vieja), como hoy.
- **Sin fotos de archivo:** ni de personas ni de "ambiente". Cualquier foto se podría confundir con un cliente o un equipo que no existe.
- **Iconos:** el set SVG propio de `src/components/Icons.astro` (WhatsApp, flecha, cerrar, check, pin), con trazo de 2 px y esquinas rectas. No se agregan librerías.
- **Reglas:** toda imagen lleva `width`/`height` y `alt`. `loading="lazy"` y `decoding="async"` debajo del primer pantallazo; la del hero, con prioridad. Formato WebP (o AVIF si reduce peso sin perder calidad).

---

## 11. Decisiones descartadas, con su razón

- **De design-taste-frontend (dirección `sentence-as-layout`):**
  - Se quita la sección de introducción fija de 3 pantallas, porque alarga la página en móvil y tú pediste acortarla.
  - No se usan fotos de archivo de personas para ambientar, porque no son del negocio y se confundirían con clientes.
  - Las preguntas no quedan siempre abiertas en móvil, por el largo de la página.
  - El precio no va como "un plan en una frase", porque hay tres paquetes reales.
  - La biografía no va con la foto como letra capital, porque mantengo el espacio 4:5 que pediste.
  - Se queda en un movimiento mínimo y no en el mínimo de "8 elementos animados" que pide la skill, porque manda la regla de rendimiento.
- **De high-end-visual-design:**
  - No se usan botones tipo píldora, contenedores redondeados de doble borde, vidrio ni barra flotante, porque van contra las esquinas rectas de la marca y contra la otra skill.
  - No se usan etiquetas pequeñas sobre los títulos, porque design-taste-frontend las prohíbe y la auditoría no las necesita.
  - No se usan entradas con `blur`, porque cuestan rendimiento en móvil.
- **De la propia auditoría:** no hay modo oscuro, porque hoy no existe y no aporta a una página de venta.
- **Base de referencia:** UXKIN no está conectado, así que esta dirección no compara sitios reales de esa biblioteca. Se apoya en el estudio de design-taste-frontend (247 sitios) y en la auditoría.

---

## 12. Cómo se aplica en el código (Fase 4)

1. Los tokens de §2–§5 y §9 pasan a `:root` en `src/styles/site.css`, con los nombres de este documento. Los 14 tamaños sueltos se mapean a la escala de §3 y los espaciados a §4.
2. Ningún componente usa valores sueltos: solo tokens. El detector de Impeccable (`impeccable detect`) y el `inspect` de design-taste-frontend se corren al terminar la Fase 4.
3. Cada cambio se mide contra la línea base de [AUDITORIA.md](AUDITORIA.md) §2.
