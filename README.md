# david-web

Web profesional de David Hernández · Webs para negocios. Sitio estático en español (`/`) e inglés (`/en/`).

## Publicar en Cloudflare Pages

| Ajuste | Valor |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Carpeta de salida | `dist` |
| Node | 22 o superior (`NODE_VERSION=22`) |

Las cabeceras de seguridad y caché están en `public/_headers`. La página `404.html` la sirve Cloudflare sola.

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
- **Tu foto:** guarda tu foto como `public/assets/foto-david.webp`, vertical en proporción 4:5 (por ejemplo 800 × 1000 px), y vuelve a hacer el build. Si el archivo existe se muestra la foto; si no, el monograma DH.
- **Apagar o encender una demo:** en `src/i18n/shared.ts`, `live: false` hace que su tarjeta lleve a WhatsApp en vez de abrir la demo. Después de cambiar una demo, corre `npm run capture` para actualizar sus capturas.

## Enlaces por sector

`/?negocio=odontologia`, `estetica`, `veterinaria`, `inmobiliaria`, `restaurante` u `otro` abren la página ya adaptada. Sirven para escribirle a un prospecto con su sector ya elegido.

## Analítica

Sin cookies y sin datos personales.

1. **Visitas:** crea un sitio en Cloudflare Web Analytics y pega el token en `CF_ANALYTICS_TOKEN`, dentro de `site.config.mjs`. Vacío, no se carga ningún script.
2. **Eventos:** Cloudflare Web Analytics mide visitas, no eventos personalizados. Por eso los clics van a una Pages Function propia, `functions/api/event.js`, que los escribe en Workers Analytics Engine:
   - En Cloudflare Pages: Settings → Functions → Analytics Engine bindings, crea el binding `EVENTS`.
   - Sin el binding, la función responde 204 y no guarda nada. El sitio funciona igual.

| Evento | Cuándo | `label` |
| --- | --- | --- |
| `whatsapp_click` | Clic en cualquier WhatsApp | `hero`, `calculadora`, `oferta`, `cierre`, `footer`, `flotante`, `formulario`, `visor-<demo>`, `demo-offline-<demo>` |
| `demo_open` | Abrir una demo | `<demo>`, `hero-<demo>`, `hero-celular-<demo>` |
| `package_click` | Botón de un paquete | `esencial`, `profesional`, `premium`, `mantenimiento` |

Cada evento también se emite en el navegador como `dw:track`, por si luego quieres conectar otra herramienta.

## Pruebas

Con `npm run preview` corriendo:

```bash
node scripts/e2e.mjs          # selector, visor, calculadora, WhatsApp, formulario
node scripts/lh.mjs           # Lighthouse en celular
node scripts/shots.mjs        # capturas en 375, 768 y 1440 px
node scripts/check-final.mjs  # CSP real, estados de sector y palabras prohibidas
```
