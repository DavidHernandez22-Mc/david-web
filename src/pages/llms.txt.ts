// Resumen en texto plano para asistentes de IA (formato llms.txt). Sale de los mismos datos que la web.
import { BRAND_NAME, SITE_URL, WHATSAPP_NUMBER } from '../../site.config.mjs';
import { es } from '../i18n/es';
import { COP_MAINTENANCE, COP_PRICES, DEMOS, USD_PRICES, type PackageId } from '../i18n/shared';

const abs = (p: string) => new URL(p, SITE_URL).href;
const cop = (n: number) => `$${n.toLocaleString('es-CO')} COP`;
const ids = Object.keys(COP_PRICES) as PackageId[];

const body = `# ${BRAND_NAME}

> ${es.jsonLd.description} Lo hace David Hernández Castro, desde Bogotá, con atención en todo Colombia por llamada y WhatsApp.

- Web en español: ${abs('/')}
- Web en inglés: ${abs('/en/')}
- WhatsApp: https://wa.me/${WHATSAPP_NUMBER} (+57 324 428 1553). Respuesta el mismo día, todos los días (24/7).

## Paquetes (precios desde, en pesos colombianos)

${ids.map((id) => `- ${es.pricing.packages[id].name}: ${cop(COP_PRICES[id])} (aprox. USD ${USD_PRICES[id]}). ${es.pricing.packages[id].tagline} Incluye: ${es.pricing.packages[id].items.join('; ')}.`).join('\n')}
- Mantenimiento opcional: ${cop(COP_MAINTENANCE)} al mes. ${es.pricing.maintenance.text}

## Cómo trabaja

${es.faq.items.map((f) => `- ${f.q} ${f.a}`).join('\n')}

## Proyectos de ejemplo

Son negocios ficticios hechos para mostrar el trabajo; no son clientes reales.

${DEMOS.filter((d) => d.live).map((d) => `- ${d.name} (${es.demos.items[d.id].sector}): ${d.url}`).join('\n')}

## Opcional

- Política de privacidad: ${abs('/privacidad/')}
`;

export const GET = () => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
