// Único archivo que hay que tocar al comprar el dominio o cambiar datos de contacto.
// Lo leen astro.config, canonical, og:url, og:image, sitemap, robots, hreflang y los datos estructurados.
export const SITE_URL = 'https://davidhcwebs.com';

// Correo de contacto que aparece en la política de privacidad.
export const CONTACT_EMAIL = 'castrod2207@gmail.com';

// Sin "+" ni espacios. Solo se usa dentro de enlaces de WhatsApp, nunca como texto visible.
export const WHATSAPP_NUMBER = '573244281553';

// Token de Cloudflare Web Analytics (visitas, sin cookies). Vacío = no se carga ningún script.
// Se obtiene en el panel: Analytics & Logs → Web Analytics → Add a site (ver README).
export const CF_ANALYTICS_TOKEN = '';

// Enciende el envío de clics y visitas al Worker en /api/event (worker/index.js, ver README).
export const EVENTS_ENDPOINT_ENABLED = true;

// Nombre de la marca: logotipo, títulos, Open Graph, JSON-LD y pie.
export const BRAND_NAME = 'DavidHC Webs';

// Oferta de lanzamiento (español e inglés salen de aquí). Para cambiar los cupos o apagarla,
// edita solo esta línea: active: false la quita de toda la web; spotsLeft: 0 también.
export const OFFER = { active: true, spotsLeft: 3, spotsTotal: 3, discount: 0.3 };
