# david-web

Web profesional de David Hernández · Webs para negocios. Sitio estático en español (`/`) e inglés (`/en/`).

## Publicar en Cloudflare Workers

El sitio se publica como Worker con archivos estáticos. Workers Builds corre `npm run build` y después `npx wrangler deploy`, que lee `wrangler.jsonc`.

| Ajuste | Valor |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Carpeta de salida | `dist` (definida en `wrangler.jsonc`) |

- `not_found_handling: "404-page"` hace que una URL inexistente responda 404 con la página propia: `/en/...` usa la versión en inglés (`dist/en/404.html`) y el resto la de español.
- Las cabeceras de seguridad y caché están en `public/_headers`.
- `worker/index.js` es la entrada del Worker: solo atiende `/api/*` (guarda clics y visitas). Todo lo demás, incluida la 404, lo sirve Cloudflare directo desde `dist/`.

Para probar el Worker en local: `npm run build && npx wrangler dev`.

## Comandos

```bash
npm install
npm run dev       # desarrollo
npm run build     # genera dist/
npm run preview   # sirve dist/ en local
npm run lint      # astro check + eslint
npm run capture   # recaptura las demos con Playwright y genera los webp
npm run brand     # regenera logo, favicon e imágenes para compartir
```

## Lo que vas a querer cambiar

- **Dominio, WhatsApp, analítica:** `site.config.mjs`. Es el único archivo que hay que tocar al comprar el dominio. Recuerda actualizar también `SITE_URL` en Cloudflare si usas redirecciones.
- **Textos:** `src/i18n/es.ts` y `src/i18n/en.ts`.
- **Demos, colores por sector y precios:** `src/i18n/shared.ts`.
- **Tu foto:** está en `public/assets/foto-david.webp` (576 × 720, 4:5). Para cambiarla, guarda otra foto vertical 4:5 con ese nombre y vuelve a hacer el build; `scripts/foto-david.mjs` muestra cómo se recortó y desenfocó esta. Si el archivo no existe, se ve el monograma DH.
- **Apagar o encender una demo:** en `src/i18n/shared.ts`, `live: false` hace que su tarjeta lleve a WhatsApp en vez de abrir la demo. Después de cambiar una demo, corre `npm run capture` para actualizar sus capturas.

## Enlaces por sector

`/?negocio=odontologia`, `estetica`, `veterinaria`, `inmobiliaria`, `restaurante` u `otro` abren la página ya adaptada. Sirven para escribirle a un prospecto con su sector ya elegido.

## Analítica

Sin cookies y sin guardar IP ni nada que identifique a la persona.

### Clics y visitas (ya funciona)

Cada clic en WhatsApp, demo o paquete, y cada visita al inicio, se envía a `POST /api/event`. El Worker (`worker/index.js`) lo guarda en **Workers Analytics Engine**, en el dataset `david_web_events`, que se crea solo con el primer evento.

| Evento | Cuándo | Detalle (`blob2`) |
| --- | --- | --- |
| `page_view` | Alguien abre el inicio | `/`, `/en/`, o `/?negocio=<sector>` si llegó con un enlace por sector |
| `whatsapp_click` | Clic en cualquier WhatsApp | `hero`, `calculadora`, `oferta`, `cierre`, `footer`, `flotante`, `formulario`, `visor-<demo>` |
| `demo_open` | Abrir una demo | `<demo>`, `hero-<demo>`, `hero-celular-<demo>` |
| `package_click` | Botón de un paquete | `esencial`, `profesional`, `premium`, `mantenimiento` |

También se guardan el idioma (`blob3`) y el país aproximado (`blob4`).

**Cómo ver los datos.** Analytics Engine no tiene gráficos en el panel; se consulta con SQL:

1. En Cloudflare: Manage Account → Account API Tokens → Create Token → Custom token, permiso **Account → Account Analytics → Read**.
2. En la terminal: `CF_API_TOKEN=tu_token npm run eventos` (o `npm run eventos -- 7` para los últimos 7 días).

Muestra totales por evento, el detalle de cada uno y las visitas por país. Los datos se guardan 3 meses. En el panel, Workers & Pages → david-web → Observability muestra además los registros del Worker.

### Visitas con Cloudflare Web Analytics (falta el token)

1. En Cloudflare: Analytics & Logs → Web Analytics → Add a site, con el nombre `david-web.castrod2207.workers.dev`.
2. Elige la instalación manual (JS snippet) y copia el valor de `"token"`.
3. Pégalo en `CF_ANALYTICS_TOKEN`, dentro de `site.config.mjs`, y haz commit y push.

Ahí verás visitas, páginas, países, dispositivos y de dónde llega la gente. La política de seguridad (`public/_headers`) ya permite su script.

## Pruebas

Con `npm run preview` corriendo:

```bash
node scripts/e2e.mjs          # selector, visor, calculadora, WhatsApp, formulario
node scripts/lh.mjs           # Lighthouse en celular
node scripts/shots.mjs        # capturas en 375, 768 y 1440 px
node scripts/check-final.mjs  # CSP real, estados de sector y palabras prohibidas
```
