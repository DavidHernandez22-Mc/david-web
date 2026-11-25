# DESIGN.md · DavidHC Webs

> **Versión 2. Dirección "portafolio de estudio".** Reemplaza la versión de evolución prudente.
> Pendiente de tu aprobación antes de construir.

Sistema visual de https://davidhcwebs.com. La web es el portafolio: quien entra tiene que pensar "este man sabe hacer webs" antes de leer una sola línea.

- **Se conserva:** el naranja, la tinta, Red Hat Display/Text, las esquinas rectas, la voz honesta y WhatsApp como hilo conductor.
- **Cambia:** la escala, la profundidad, el movimiento y la forma de mostrar las demos.

| | |
|---|---|
| **Marca** | DavidHC Webs. Páginas web a la medida para negocios, en Bogotá, con atención en todo Colombia. |
| **Para quién** | Dueños de negocios de servicios (consultorios, clínicas, restaurantes, veterinarias, inmobiliarias) que deciden desde el celular. |
| **Acción** | Escribir por WhatsApp (+57 324 428 1553). |
| **Sensación** | Segura, con oficio y con un punto de espectáculo. Ni corporativa ni de plantilla. |

**Límites que no se negocian**
- **Rendimiento en celular:** Lighthouse **≥ 90** en las cuatro categorías, **CLS 0** y **LCP < 2,5 s** (línea base: 99–100, LCP 1,4 s). Si algo lo baja, se simplifica.
- **Movimiento:** GSAP y Lenis cargados de forma diferida. Con `prefers-reduced-motion`, nada se anima y todo es visible.
- **Sin JavaScript** el contenido se ve completo y funciona. El movimiento es una capa encima, nunca una condición.

---

## 1. Dirección visual

**Nombre de trabajo: "El mensaje en grande".** La página habla como un chat de WhatsApp, pero a escala de cartel.

1. **El hero:**
   - Es una frase gigante, en dos líneas, que aparece palabra por palabra. Es el mensaje que el visitante te va a mandar.
   - Junto a ella, una **escena en capas**: un computador con la demo del sector, un celular delante con la misma demo y tres fragmentos sueltos de interfaz que flotan a distintas profundidades:
     - la burbuja verde del mensaje precargado;
     - la etiqueta del precio "desde $1.600.000";
     - el sello "Ejemplo gratis en 48 h".
   - Al hacer scroll, cada capa se mueve a su propia velocidad.
2. **Las demos son el centro del portafolio:**
   - En computador, la sección se **fija** en pantalla y el scroll **pasa de un sector a otro**: el fondo cambia al color de cada negocio, los dispositivos se intercambian y el nombre del sector sube como en un letrero.
   - En celular es un carrusel horizontal a pantalla casi completa, que se desliza con el dedo.
3. **Profundidad en vez de planos:**
   - Los dispositivos y fragmentos se superponen, cruzan el borde de su sección y se inclinan unos grados.
   - Cada capa lleva una sombra teñida de tinta, nunca negra pura.
   - Las secciones alternan campos enteros de color (naranja, tinta, blanco, tono) en lugar de líneas.
4. **Tipografía de cartel:** los títulos de sección casi duplican su tamaño actual; las cifras (precio, "48 h", "30%") se tratan como objetos gráficos.
5. **Microinteracciones con oficio:**
   - El botón de WhatsApp responde al cursor (efecto magnético) y al toque.
   - Las flechas se adelantan al pasar el cursor.
   - Las tarjetas de demo y de paquete se inclinan en 3D en computador.

**Prueba del competidor:** cambiar "DavidHC Webs" por otra agencia de Bogotá rompe el hero (el mensaje del cliente con *su* sector) y la sección de demos (cinco negocios funcionando). Ninguna otra puede reutilizarlos.

---

## 2. Color

La paleta no cambia; cambia la proporción: más campos enteros de color, sobre todo naranja y tinta.

| Token | Valor | Función | Contraste |
|---|---|---|---|
| `--ink` | `#050f16` | Texto, botón principal sobre claro o naranja, campos oscuros | 19,3:1 sobre blanco · 7,4:1 sobre naranja |
| `--ink-2` *(nuevo)* | `#0f1d26` | Superficie elevada dentro de campos de tinta (tarjetas de paquete, calculadora) | blanco 17,2:1 |
| `--ground` | `#ffffff` | Fondo base | — |
| `--tone` | `#f1f2f0` | Superficie clara alterna | tinta 17,2:1 |
| `--soft` | `#434c52` | Texto secundario sobre claro | 8,8:1 |
| `--on-ink-soft` | `#9aa3a8` | Texto secundario sobre tinta | 7,5:1 |
| `--orange` | `#ff7a1f` | Marca: campos, botón sobre tinta, cifras-objeto sobre tinta | Solo con tinta encima. **Nunca** blanco sobre naranja (2,6:1) ni naranja como texto sobre blanco (2,6:1) |
| `--orange-text` | `#b34d08` | Texto anaranjado sobre blanco (casos puntuales) | 5,3:1 |
| `--orange-soft` | `#ffb27d` | Detalle anaranjado sobre tinta | 11,0:1 |
| `--wa` | `#25d366` | Icono de WhatsApp, burbuja del mensaje y botón flotante, siempre con tinta encima | 9,8:1 |
| `--error` | `#b3261e` | Errores de formulario | 6,5:1 |
| `--shadow-ink` | `rgb(5 15 22 / .35)` | Base de las sombras (teñidas de tinta, nunca negro) | — |

- **Colores de sector** (`SECTOR_THEME`): el hero los toma al elegir sector y la sección de demos los recorre uno por uno. No aparecen en ninguna otra sección.
- **Secuencia de campos:** naranja (hero) → blanco (problema) → colores de sector (demos) → tinta (cómo trabajo) → blanco (qué incluye) → tono (paquetes) → tinta (calculadora) → naranja (oferta) → blanco (sobre mí) → tono (preguntas) → naranja → tinta (cierre y pie).
- **Lo que no se usa:**
  - Degradados de color.
  - Brillos.
  - Morado o índigo.
  - Vidrio esmerilado (`backdrop-filter`): cuesta rendimiento en celular.

---

## 3. Tipografía

Las dos familias que ya se cargan: Red Hat Display (títulos, cifras, botones; pesos 800–900) y Red Hat Text (texto corrido; 400–600). El carácter viene de la **escala y el contraste de tamaños**, no de una fuente nueva, que añadiría peso de descarga.

| Token | Valor | Uso | Interlineado · tracking |
|---|---|---|---|
| `--step-xs` | `0.875rem` | Notas, ayudas, pie (nunca menos de 13 px) | 1.45 |
| `--step-body` | `clamp(1.0625rem, 1rem + .25vw, 1.1875rem)` | Texto corrido, botones | 1.5 · medida 55–70 caracteres |
| `--step-lead` | `clamp(1.25rem, 1.05rem + .9vw, 1.875rem)` | Subtítulos | 1.3 |
| `--step-h3` | `clamp(1.5rem, 1.1rem + 1.6vw, 2.5rem)` | Bloques (paquete, paso, pregunta) | 1.02 · −0.025em |
| `--step-statement` | `clamp(1.5rem, 1rem + 2.4vw, 2.75rem)` | Frases largas (biografía, cierre); ≤ 25 palabras | 1.15 · −0.015em · 500 |
| `--step-h2` | `clamp(2.75rem, 1rem + 7.5vw, 8rem)` | Títulos de sección: **casi el doble que hoy** | 0.92 · −0.045em |
| `--step-display` | `clamp(3rem, .5rem + 10.5vw, 11.5rem)` | La frase del hero | 0.88 · −0.05em |
| `--step-giant` | `clamp(6rem, 24vw, 26rem)` | "Escríbeme" del cierre, logotipo del pie y cifras-objeto ("30%", "48 h") | 0.82 · −0.06em |

- **Títulos en dos líneas como máximo** a cualquier ancho: se recorta el texto antes que achicar la letra. En el hero, unos 2 × 14 caracteres en un celular de 375 px.
- **Saltos de línea:** `text-wrap: balance` en títulos y `pretty` en párrafos y listas.
- **Cifras** con `tabular-nums`.
- **Alineación:** todo a la izquierda. El único momento centrado es el cierre "Escríbeme".
- **Sin etiquetas pequeñas** sobre los títulos, sin mayúsculas con tracking ancho, sin numeración decorativa y sin una palabra destacada en otro estilo.

---

## 4. Espacio y rejilla

- **Escala** (base 4): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 192 px.
- **Margen lateral:** `--gutter: clamp(16px, 3vw, 40px)`.
- **Separación entre secciones:** `--section: clamp(80px, 12vw, 200px)`. Más aire que hoy: las secciones respiran como páginas de una revista.
- **Rejilla:** 12 columnas en escritorio (≥ 1024 px), 6 en tablet y 1 en celular.
- **Medida de texto:** `62ch`. Ancho máximo del contenedor: `1440px`. Los campos de color y los dispositivos llegan al borde.
- **Composición:** se rompe la simetría. La afirmación va en las columnas 1–7 y la prueba se sale por la derecha hasta el borde de la pantalla. Dos secciones seguidas nunca comparten composición.
- **Altura total en celular (375 px):** de ≈ 14.400 px a ≤ 10.000 px, recortando repeticiones (§8).

---

## 5. Forma y profundidad

- **Radio:** `0` en todo lo de la marca (botones, campos, paneles, tarjetas, imágenes). Los dispositivos imitan los reales: celular `clamp(26px, 7vw, 46px)` y computador `10px` arriba. El botón flotante de WhatsApp es circular.
- **Capas de profundidad** (el número va de atrás hacia adelante):

  | Capa | Qué | Sombra | Inclinación |
  |---|---|---|---|
  | 0 | Campo de color de la sección | — | — |
  | 1 | Computador con la demo | `0 40px 80px -30px var(--shadow-ink)` | −2° a 0° |
  | 2 | Celular con la demo | `0 30px 60px -20px var(--shadow-ink)` | 3° a 6° |
  | 3 | Fragmentos de interfaz (burbuja, precio, sello) | `0 16px 32px -14px var(--shadow-ink)` | −4° a 4° |

- **Las capas cruzan el borde** inferior de su sección hacia la siguiente (por ejemplo, el celular del hero se monta sobre el inicio de "Problema"). Así la página deja de ser una pila de planos.
- **Separar superficies:** un escalón de tono o un cambio de campo; nunca líneas de 1 px ni recuadros decorativos.
- **Capas de la interfaz (`z-index`):** escena 1–3, botón flotante 20, saltar al contenido 50. Los `<dialog>` usan la capa superior nativa.

---

## 6. Componentes y microinteracciones

Todas las microinteracciones de hover solo existen con `(hover: hover) and (pointer: fine)`. En celular, solo la respuesta al toque.

| Componente | Reposo | Interacción |
|---|---|---|
| **Botón principal** (WhatsApp): tinta y blanco; sobre tinta, naranja y tinta | Recto, alto ≥ 54 px, icono de WhatsApp de 20 px, verbo único "Escríbeme por WhatsApp" | Hover: fondo `#1b2c36` en 180 ms y el icono sube 2 px. **Magnético** en computador: sigue al cursor hasta 8 px con `gsap.quickTo` (0,4 s, `power3`) y vuelve con un resorte. Presionado: `scale(.97)` en 140 ms. Foco: contorno de 3 px |
| **Enlace secundario** ("Ver demos ↗") | Subrayado de 2 px | La flecha se adelanta `translate(3px, −3px)` y el subrayado se redibuja de izquierda a derecha (`scaleX`) en 220 ms |
| **Tarjeta de demo / paquete** | Recta, sin borde | **Inclinación 3D** en computador: `rotateX/Y` ≤ 4° según el cursor, `perspective: 1000px`, con `quickTo`. Las capas internas (celular, precio) se mueven un poco más que la tarjeta y dan profundidad. Al salir, vuelve con un resorte. Presionado: `scale(.98)` |
| **Chips de sector** | Borde de 2 px de tinta; seleccionado con relleno de tinta; alto 44 px | Presionado: `scale(.96)`. El relleno del seleccionado se desliza al nuevo chip (un solo indicador que se mueve, no un parpadeo) |
| **Pregunta frecuente** (`<details>`) | Pregunta en `--step-h3` | El "+" gira 45° en 180 ms y la respuesta entra con un fundido de 8 px. En celular es acordeón |
| **Botón flotante de WhatsApp** | Círculo verde con tinta y sombra de capa 3 | Aparece al salir del hero (escala .8 → 1, 260 ms) y se oculta en el cierre |
| **Visor de demos** (`<dialog>`) | A pantalla completa, como hoy | Se abre **desde la tarjeta tocada**: `clip-path` del rectángulo de la tarjeta a la pantalla completa en 420 ms con `cubic-bezier(.32,.72,0,1)`. Se cierra en 220 ms |

**Marca DavidHC Webs** (se construye en la Fase 4)
- **Logotipo:** "DavidHC" en Red Hat Display 900 + " Webs" en 500, en contornos SVG (`scripts/build-brand.mjs`).
- **Símbolo:** cuadrado naranja con "dh" en tinta. Se usa en favicon (svg, png e **ico nuevo**), iconos de app y manifiesto.
- **Imagen para compartir (1200×630, PNG ≤ 80 KB):** campo naranja, la frase del hero en tinta y la escena de dispositivos simplificada a la derecha. Está pensada para leerse en la vista previa pequeña de WhatsApp.
- **Configuración:** el nombre sale de `BRAND_NAME` en `site.config.mjs`.

---

## 7. Imágenes

- **Lo único que se muestra son las demos reales:** capturas de computador y de celular, WebP en 3 anchos, ya en `public/demos/`. No se usan fotos de archivo, que se confundirían con clientes.
- **Fragmentos de interfaz** (burbuja, precio, sello): son HTML y CSS, no imágenes. Pesan casi nada y se leen nítidos a cualquier tamaño.
- **Foto de David:** 576×720, 4:5. **[PENDIENTE: foto nueva antes de la Fase 4]**.
- **Reglas de carga:**
  - `width` y `height` siempre (CLS 0) y `alt` siempre.
  - `loading="lazy"` y `decoding="async"` debajo del primer pantallazo.
  - Las imágenes de la escena del hero (computador y celular) van con `fetchpriority="high"` solo en la versión de computador. En celular la escena va después del primer pantallazo, con carga diferida.

---

## 8. Estructura y largo

| Sección | Campo | Composición |
|---|---|---|
| **Hero** | Naranja (o el del sector elegido) | **Computador:** frase en `--step-display` (columnas 1–7), subtítulo, botón de WhatsApp, "Ver demos ↗" y la escena en capas a la derecha (columnas 7–12, hasta el borde). Los chips de sector van debajo como paso 2. **Celular:** solo título, subtítulo, botón de WhatsApp y "Ver demos". La escena y los chips vienen justo después |
| **Problema** | Blanco | Afirmación grande y tres "pruebas" dibujadas (chat repetitivo, búsqueda sin resultados, web en construcción) en una composición escalonada, no en tres columnas iguales |
| **Demos** | Colores de sector | **Computador:** escenario fijo (ver §9). **Celular:** carrusel horizontal con `scroll-snap`, una tarjeta por sector al 86 % del ancho, con el celular grande y "Ver demo". Paneles de ≈ 1.000 px → una sola franja de ≈ 640 px |
| **Cómo trabajo** | Tinta | Línea de tiempo horizontal en computador y vertical en celular. El plazo ("15 min", "48 h", "5–10 días", "Al publicar") va como cifra-objeto naranja y la explicación al lado |
| **Qué incluye** | Blanco | Mosaico asimétrico de 4 piezas (diseño a medida · textos escritos para ti · WhatsApp + Google + Maps · a tu nombre), de tamaños distintos y con un fragmento visual real en cada una |
| **Paquetes** | Tono | Tres tickets. El recomendado va en campo naranja y se adelanta hacia el frente (capa 2). El precio rebajado de la oferta va al lado del precio lleno |
| **Calculadora** | Tinta | Después de los precios, con el recomendado destacado |
| **Oferta 30%** | Naranja | "30%" en `--step-giant` y "Quedan 3 de 3 cupos" como sello |
| **Sobre mí** | Blanco | Foto 4:5 (576×720) a la izquierda y la biografía en `--step-statement` con la formación ("Estudio Ingeniería de Sistemas en la Pontificia Universidad Javeriana") |
| **Preguntas** | Tono | Computador: pregunta a la izquierda y respuesta a la derecha. Celular: acordeón |
| **Cierre + pie** | Naranja → tinta | "Escríbeme" gigante a todo el ancho, el formulario opcional y el pie con "DavidHC Webs" recortado por el borde inferior |

"Respondo el mismo día" aparece **una vez**. "48 horas" y "20 minutos", una vez cada uno en un bloque largo.

---

## 9. Animaciones por sección

### Cómo se carga (para no tocar el LCP)

1. **Primer pintado:** HTML y CSS con todo visible. El `main.ts` actual (≈ 9 KB) maneja el visor, los chips, la calculadora y WhatsApp, como hoy.
2. **Titular del hero:** se divide en palabras al generar la página (Astro, sin esperar a ningún script) y se anima **con CSS** desde el primer pintado. Si esperara a GSAP, el LCP se iría por encima de 2,5 s.
3. **Después del evento `load`, cuando el navegador queda libre** (`requestIdleCallback`, con un máximo de 2,5 s): `import('./motion.ts')` carga GSAP + ScrollTrigger + SplitText. Lenis se suma **solo** si `(pointer: fine) and (min-width: 1024px)`. El presupuesto es ≤ 55 KB comprimidos.
   - **No se carga nada** si `prefers-reduced-motion: reduce` está activo o si la conexión es lenta (`navigator.connection.saveData` o `effectiveType` de 2G o 3G).
4. **Al iniciarse, GSAP solo esconde lo que está debajo del pantallazo actual** (`gsap.set`). Lo que ya se ve no parpadea. Si el script no llega, todo sigue visible.
5. **`gsap.matchMedia()`** separa computador, celular y movimiento reducido. Cada contexto se limpia solo al cambiar de tamaño.
6. **Lenis:** `autoRaf: false`, movido desde `gsap.ticker` (`lenis.raf(time * 1000)`), `lenis.on('scroll', ScrollTrigger.update)` y `gsap.ticker.lagSmoothing(0)`. Importa `lenis/dist/lenis.css`. Con `anchors: true` y el desfase del encabezado, el visor y el menú (`<dialog>`) llevan `data-lenis-prevent`.

### Curvas y tiempos

- **Entradas:** `power3.out` / CSS `cubic-bezier(.22, 1, .36, 1)`.
- **Movimiento en pantalla:** `power2.inOut`.
- **Diálogos:** `cubic-bezier(.32, .72, 0, 1)`.
- **Escalonado:**
  - Interfaz: 30–80 ms.
  - Momentos de marketing (hero, títulos): 90–140 ms, **nunca uniforme**. Lo principal se desplaza más, lo de apoyo menos y la decoración solo aparece con un fundido.
  - Un solo nivel de entrada por contenedor.
- **Scrub:** siempre con `scrub: 0.6` (suavizado) y solo `transform`/`opacity`/`clip-path`.

### Lista por sección

| Sección | Computador (≥ 1024 px, puntero fino) | Celular | Coste |
|---|---|---|---|
| **Hero: titular** | Palabras que suben desde su línea base (máscara), 700 ms `cubic-bezier(.22,1,.36,1)`, escalonado 90 → 70 → 60 ms; subtítulo y botón con un fundido de 12 px al final | Igual, más corto (500 ms, 60 ms) | **CSS**, 0 KB. Se mide su efecto en el LCP: si lo pasa de 2,5 s, se cambia por un solo fundido |
| **Hero: escena en capas** | Entrada: computador, celular y fragmentos llegan en ese orden, solapados (0,9 s). Con scroll (`scrub`): computador `yPercent −8`, celular `yPercent −22` y `rotate 6° → 2°`, fragmentos `yPercent −40` a `−60`, el titular sube `−6%`. Parallax de cursor ≤ 6 px en los fragmentos (`quickTo`) | La escena va después del pantallazo: el celular sube 24 px con un fundido al entrar y los fragmentos se fijan en su sitio. Sin `scrub` ni cursor | GSAP |
| **Hero: cambio de sector** | Fundido cruzado de colores (380 ms, ya existe), la palabra del sector se reescribe (SplitText por letras, 25 ms) y los dispositivos cambian de captura con un fundido de 300 ms | Igual, sin la reescritura por letras | CSS + GSAP |
| **Problema** | Las tres pruebas entran escalonadas con distinto recorrido (40 / 28 / 16 px) y las burbujas del chat aparecen una por una (ya existe, se ajusta) | Igual, recorridos a la mitad | GSAP `batch` |
| **Demos (la estrella)** | **Fijada durante 5 × 70vh.** Al hacer scroll: el fondo pasa por el color de cada sector (`backgroundColor` del contenedor fijado, un solo elemento), el nombre del sector sube por una máscara (SplitText por líneas), el computador y el celular salen hacia arriba y entra el siguiente con una ligera rotación. Una barra de progreso hecha con los 5 nombres de sector marca el actual. `snap` a cada sector. "Ver demo" abre el visor desde la tarjeta. El alto se reserva **en CSS** (`min-height` del contenedor) y `pinSpacing: false`, para que fijar la sección no mueva nada (CLS 0) | **Sin fijar.** Carrusel horizontal nativo (`scroll-snap`). Las tarjetas entran con un fundido de 24 px al aparecer. Sin `scrub` | GSAP (computador) / CSS (celular) |
| **Cómo trabajo** | La línea de tiempo se dibuja con el scroll (`scaleX` 0 → 1, `scrub`) y cada paso aparece cuando la línea lo alcanza: la cifra-objeto con escala .9 → 1 y el texto con un fundido | La línea es vertical (`scaleY`) y los pasos entran al aparecer, sin `scrub` | GSAP |
| **Qué incluye** | Las 4 piezas del mosaico entran escalonadas por importancia (110 / 90 / 80 ms) con recorridos distintos; inclinación 3D al pasar el cursor | Entrada simple, una sola vez | GSAP `batch` |
| **Paquetes** | Los tickets suben solapados; el recomendado llega al final, un poco más grande y con su sombra de capa 2. Inclinación 3D al pasar el cursor | Pestañas y carrusel como hoy; solo entrada | GSAP |
| **Calculadora** | Las barras se llenan al entrar (`scaleX`, ya existe). Los números no se animan: son datos que se leen | Igual | CSS |
| **Oferta 30%** | "30%" se revela por máscara de abajo arriba (`clip-path`), el sello "Quedan 3 de 3" cae con un pequeño rebote (`back.out(1.4)`) | Igual, sin rebote | GSAP |
| **Sobre mí** | La foto se revela con `clip-path: inset(100% 0 0 0) → inset(0)` en 900 ms y luego tiene parallax de `yPercent −6`. Las líneas de la biografía entran escalonadas (SplitText por líneas) | Revelado de la foto sin parallax; el texto con un solo fundido | GSAP |
| **Preguntas** | Solo la interacción del acordeón (CSS). Sin entradas: es contenido que se consulta | Igual | CSS |
| **Cierre** | "Escríbeme" se arma letra por letra con el scroll (SplitText por caracteres, `yPercent 110 → 0`, `scrub`). La flecha es magnética | Las letras suben una sola vez al entrar (sin `scrub`) | GSAP |
| **Pie** | "DavidHC Webs" sube desde abajo hasta su recorte final (`yPercent 30 → 0`, `scrub`) | Fijo | GSAP |
| **Global** | Lenis (scroll suave). Botones magnéticos. Inclinación 3D en tarjetas | Scroll nativo; solo la respuesta al toque | — |

### Con movimiento reducido (`prefers-reduced-motion: reduce`)

- No se importa GSAP ni Lenis.
- El titular no se divide y aparece completo.
- No hay `scrub`, fijado ni parallax: la sección de demos se muestra como una lista vertical de 5 paneles estáticos, igual que sin JavaScript.
- Todo es visible desde el inicio.
- Solo quedan los cambios de estado sin desplazamiento: los colores del hero al elegir sector, el foco y el acordeón.

### Lo que no se hace (y por qué)

- **Cursor personalizado:** cuesta accesibilidad y no aporta a la venta.
- **`filter: blur` y `backdrop-filter`:** se repintan en cada fotograma del scroll y hacen que la página se trabe en un celular.
- **Fijado y `scrub` en celular:** con el dedo se sienten pesados y le cuestan batería al visitante.
- **Contadores animados** en precios y calculadora: son datos que se leen.

---

## 10. Presupuesto y verificación

| Métrica (celular, Lighthouse) | Línea base | Mínimo aceptado | Objetivo |
|---|---|---|---|
| Rendimiento | 99 | 90 | ≥ 95 |
| Accesibilidad, buenas prácticas, SEO | 100 | 90 | 100 |
| LCP | 1,4 s | < 2,5 s | < 1,8 s |
| CLS | 0 | 0 | 0 |
| JS del primer pintado | 9 KB | — | ≤ 12 KB |
| JS diferido (GSAP + plugins + Lenis) | 0 | ≤ 60 KB gz | ≤ 55 KB gz |

- **Medición:** cada sección se mide al terminarla (Lighthouse en celular y en computador). Si una baja del mínimo, se simplifica esa sección antes de seguir.
- **Paquetes nuevos:** `gsap` (incluye SplitText y ScrollTrigger; todos sus plugins son gratis) y `lenis`, como dependencias de npm. No cambian el stack ni el despliegue.
- **El sitio sigue en Astro, sin React,** así que la skill `gsap-react` no aplica. Se usa la misma limpieza que enseña (`gsap.matchMedia` y `revert`) en TypeScript.
- **La CSP no necesita cambios:** GSAP y Lenis se sirven desde el propio dominio.

---

## 11. De dónde sale cada decisión

- **design-taste-frontend:** composición asimétrica, tipografía de cartel, una idea propia del cliente, campos de color en vez de líneas y prohibición de etiquetas pequeñas y degradados. Su dirección `sentence-as-layout` (semilla 1763801763) aporta el hero como frase.
- **high-end-visual-design:** profundidad por capas, inclinaciones, botones magnéticos, curvas propias, `IntersectionObserver`/ScrollTrigger en lugar de escuchar el scroll, y solo `transform`/`opacity`.
  - **Descartado:** botones tipo píldora, doble borde redondeado y vidrio, porque van contra las esquinas rectas de la marca y el rendimiento.
- **impeccable (`bolder`, `typeset`, `polish`):** amplificar lo que la marca ya tiene (el naranja, la frase y las demos) en lugar de inventar adornos, con un solo gesto decisivo por sección.
- **emil-design-eng + choreograph:** curvas fuertes de salida, respuesta al presionar de 0,97, visor que se abre desde su origen, un solo nivel de entrada por contenedor, escalonado nunca uniforme y nada que bloquee la interacción.
- **gsap-core, timeline, scrolltrigger y performance:** `matchMedia`, `batch`, `quickTo`, `scrub` suavizado, fijar solo lo necesario y limpiar al cambiar de tamaño.
- **lenis:** un solo motor de animación, sincronizado con ScrollTrigger, y `lagSmoothing(0)`.
- **Se mantienen de la v1:** tokens de color con contraste medido, esquinas rectas, la marca DavidHC Webs, la estructura y el orden de secciones, y el largo ≤ 10.000 px en celular.

---

## Ajustes aprobados (v2.1)

1. **Precio del hero:** "desde $1.600.000" = paquete Esencial, el más barato (verificado). En la Fase 4 sale de `COP_PRICES`/`USD_PRICES`, no queda escrito a mano.
2. **Demos fijadas (computador):**
   - Cada sector pasa con **poco scroll**: ≈ 45vh por sector, 5 × 45vh en total, en lugar de una pantalla por sector.
   - Lleva un **indicador de progreso "1/5"** al lado de los nombres de sector y un enlace **"Saltar las demos ↓"** visible arriba del escenario, que lleva al ancla de la sección siguiente.
   - Este pedido explícito tuyo prima sobre la regla de "sin numeración" de design-taste-frontend.
3. **Carrusel en celular:**
   - Las tarjetas ocupan el 84 % del ancho, así que **la siguiente siempre se asoma**.
   - **Puntos de posición** debajo, que se actualizan con `scroll-snap` y `IntersectionObserver`. Los puntos son botones de 24 px con `aria-label` "Demo 2 de 5".
4. **Visor que se abre desde la tarjeta:** sigue cargando el **subdominio real** de cada demo en el iframe (odontologia., restaurante., inmobiliaria., veterinaria., estetica.davidhcwebs.com). Las pruebas e2e lo comprueban con las 5, en español y en inglés.
5. **Botón magnético e inclinación 3D:** **solo** con `(hover: hover) and (pointer: fine)`. En pantallas táctiles no se registran esos listeners.
