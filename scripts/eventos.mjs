// Resumen de clics y visitas guardados por el Worker en Workers Analytics Engine.
// Uso: CF_API_TOKEN=... npm run eventos [-- días]   (por defecto, últimos 30 días)
// El token necesita el permiso "Account Analytics: Read" (ver README).
const ACCOUNT = process.env.CF_ACCOUNT_ID || '58fd7e67166339727b2b08c31483152e';
const TOKEN = process.env.CF_API_TOKEN;
const DAYS = Math.max(1, Math.min(90, Number(process.argv[2]) || 30));

if (!TOKEN) {
  console.error('Falta CF_API_TOKEN. Créalo en Cloudflare con el permiso "Account Analytics: Read" y corre:\n  CF_API_TOKEN=tu_token npm run eventos');
  process.exit(1);
}

async function sql(query) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/analytics_engine/sql`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: query,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Cloudflare respondió ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text).data;
}

const since = `timestamp > NOW() - INTERVAL '${DAYS}' DAY`;
// SUM(_sample_interval) da el total real aunque Cloudflare muestree con mucho tráfico.
const totals = await sql(`SELECT blob1 AS evento, SUM(_sample_interval) AS total FROM david_web_events WHERE ${since} GROUP BY evento ORDER BY total DESC`);
const detail = await sql(`SELECT blob1 AS evento, blob2 AS detalle, SUM(_sample_interval) AS total FROM david_web_events WHERE ${since} GROUP BY evento, detalle ORDER BY evento, total DESC`);
const countries = await sql(`SELECT blob4 AS pais, SUM(_sample_interval) AS total FROM david_web_events WHERE ${since} AND blob1 = 'page_view' GROUP BY pais ORDER BY total DESC LIMIT 10`);

const names = { page_view: 'Visitas al inicio', whatsapp_click: 'Clics en WhatsApp', demo_open: 'Demos abiertas', package_click: 'Clics en paquetes' };
console.log(`\nÚltimos ${DAYS} días\n`);
console.table(totals.map((r) => ({ evento: names[r.evento] ?? r.evento, total: Number(r.total) })));
for (const ev of Object.keys(names)) {
  const rows = detail.filter((r) => r.evento === ev);
  if (!rows.length) continue;
  console.log(`\n${names[ev]} por detalle`);
  console.table(rows.map((r) => ({ detalle: r.detalle || '(sin detalle)', total: Number(r.total) })));
}
if (countries.length) {
  console.log('\nVisitas por país');
  console.table(countries.map((r) => ({ pais: r.pais || '?', total: Number(r.total) })));
}
