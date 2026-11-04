// Pages Function opcional: guarda los clics en Workers Analytics Engine si existe el binding EVENTS.
// Sin binding responde 204 y no hace nada. No guarda IP, cookies ni datos personales.
const ALLOWED = new Set(['whatsapp_click', 'demo_open', 'package_click']);

export async function onRequestPost({ request, env }) {
  try {
    const { name, label, lang } = await request.json();
    if (ALLOWED.has(name) && env.EVENTS) {
      env.EVENTS.writeDataPoint({
        blobs: [name, String(label ?? '').slice(0, 64), String(lang ?? '').slice(0, 2)],
        indexes: [name],
      });
    }
  } catch {
    // Un evento mal formado no debe afectar a nadie.
  }
  return new Response(null, { status: 204 });
}
