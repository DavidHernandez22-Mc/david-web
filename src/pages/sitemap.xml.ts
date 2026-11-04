import { SITE_URL } from '../../site.config.mjs';

const pairs = [
  ['/', '/en/'],
  ['/privacidad/', '/en/privacy/'],
];
const abs = (p: string) => new URL(p, SITE_URL).href;
const entry = (loc: string, es: string, en: string) =>
  `<url><loc>${abs(loc)}</loc><xhtml:link rel="alternate" hreflang="es" href="${abs(es)}"/><xhtml:link rel="alternate" hreflang="en" href="${abs(en)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${abs(es)}"/></url>`;

export const GET = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${pairs.flatMap(([es, en]) => [entry(es, es, en), entry(en, es, en)]).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
