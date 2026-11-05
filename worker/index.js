// Worker del sitio. Solo atiende /api/* (ver run_worker_first en wrangler.jsonc): todo lo demás
// lo sirve Cloudflare directo desde dist/, con la 404 propia, sin pasar por aquí.
//
// POST /api/event guarda un evento en Workers Analytics Engine (binding EVENTS).
// No guarda IP, cookies ni nada que identifique a la persona: solo el evento, un detalle corto,
// el idioma de la página y el país aproximado que ya calcula Cloudflare.

const ALLOWED = new Set(['whatsapp_click', 'demo_open', 'package_click', 'page_view']);
const MAX_BODY = 1024;

const clean = (value, max) => String(value ?? '').replace(/[^\p{L}\p{N}/?=._-]/gu, '').slice(0, max);

export async function handleEvent(request, env) {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  try {
    const text = await request.text();
    if (text.length <= MAX_BODY) {
      const { name, label, lang } = JSON.parse(text);
      if (ALLOWED.has(name) && env.EVENTS) {
        env.EVENTS.writeDataPoint({
          // blob1 evento · blob2 detalle · blob3 idioma · blob4 país
          blobs: [name, clean(label, 64), clean(lang, 2), clean(request.cf?.country, 2)],
          doubles: [1],
          indexes: [name],
        });
      }
    }
  } catch {
    // Un evento mal formado no debe afectar a nadie.
  }
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/event') return handleEvent(request, env);
    if (pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    // Por si alguna ruta llegara aquí: se sirve igual que el sitio estático.
    return env.ASSETS.fetch(request);
  },
};
