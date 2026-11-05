// Único archivo que hay que tocar al comprar el dominio o cambiar datos de contacto.
// Lo leen astro.config, canonical, og:url, og:image, sitemap, robots, hreflang y los datos estructurados.
export const SITE_URL = 'https://david-web.castrod2207.workers.dev';

// Sin "+" ni espacios. Solo se usa dentro de enlaces de WhatsApp, nunca como texto visible.
export const WHATSAPP_NUMBER = '573008564773';

// Token de Cloudflare Web Analytics. Vacío = no se carga ningún script de analítica.
export const CF_ANALYTICS_TOKEN = '';

// Enciende el envío de eventos a la Pages Function /api/event (ver README).
export const EVENTS_ENDPOINT_ENABLED = true;
