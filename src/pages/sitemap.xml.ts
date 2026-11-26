import { execFileSync } from 'node:child_process';
import { SITE_URL } from '../../site.config.mjs';

// Cada par ES/EN con los archivos de los que sale su contenido; <lastmod> es la fecha del último commit que los tocó.
const pairs: { es: string; en: string; sources: string[] }[] = [
  { es: '/', en: '/en/', sources: ['src/components/Home.astro', 'src/i18n', 'src/pages/index.astro', 'src/pages/en/index.astro', 'site.config.mjs'] },
  { es: '/privacidad/', en: '/en/privacy/', sources: ['src/components/Legal.astro', 'src/pages/privacidad', 'src/pages/en/privacy'] },
];

const today = new Date().toISOString().slice(0, 10);
const lastmod = (sources: string[]) => {
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...sources], { encoding: 'utf8' }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : today;
  } catch {
    return today;
  }
};

const abs = (p: string) => new URL(p, SITE_URL).href;
const entry = (loc: string, es: string, en: string, mod: string) =>
  `<url><loc>${abs(loc)}</loc><lastmod>${mod}</lastmod><xhtml:link rel="alternate" hreflang="es" href="${abs(es)}"/><xhtml:link rel="alternate" hreflang="en" href="${abs(en)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${abs(es)}"/></url>`;

export const GET = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${pairs
      .flatMap(({ es, en, sources }) => {
        const mod = lastmod(sources);
        return [entry(es, es, en, mod), entry(en, es, en, mod)];
      })
      .join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
