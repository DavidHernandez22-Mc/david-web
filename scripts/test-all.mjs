// Todas las pruebas, en orden. Se detiene en la primera que falle y sale con código 1.
// Uso: npm test. El hook pre-push (.githooks/pre-push) lo corre antes de cada push.
//
// 1. lint (astro check + eslint)   2. pruebas del Worker   3. build
// 4. e2e contra el Worker local (wrangler dev en HTTPS), con el navegador apuntando
//    davidhcwebs.com a ese servidor: mismos encabezados, CSP, 404 y redirecciones que en producción.
import { spawn, spawnSync } from 'node:child_process';
import https from 'node:https';

const PORT = 8798;
const run = (label, cmd, args, env = {}) => {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });
  if (r.status !== 0) {
    console.error(`\n✖ Falló: ${label}. No se sube nada hasta que pase.`);
    stop();
    process.exit(1);
  }
};

let server;
const stop = () => { if (server) try { process.kill(-server.pid); } catch { /* ya terminó */ } };
process.on('SIGINT', () => { stop(); process.exit(130); });

const up = () => new Promise((resolve) => {
  https.get({ host: 'localhost', port: PORT, path: '/', rejectUnauthorized: false }, (res) => { res.resume(); resolve(res.statusCode === 200); })
    .on('error', () => resolve(false));
});

run('lint', 'npm', ['run', 'lint', '--silent']);
run('pruebas del Worker', 'npm', ['run', 'test:worker', '--silent']);
run('build', 'npm', ['run', 'build', '--silent']);

console.log(`\n▶ Worker local en https://localhost:${PORT}`);
server = spawn('npx', ['wrangler', 'dev', '--port', String(PORT), '--local-protocol', 'https', '--log-level', 'error'], { detached: true, stdio: 'ignore' });
let ready = false;
for (let i = 0; i < 60 && !ready; i++) { await new Promise((r) => setTimeout(r, 1000)); ready = await up(); }
if (!ready) { console.error('\n✖ El Worker local no arrancó en 60 s.'); stop(); process.exit(1); }

run('e2e', 'node', ['scripts/e2e.mjs', 'https://davidhcwebs.com'], { E2E_MAP_TO: `127.0.0.1:${PORT}` });
stop();
console.log('\n✔ Todas las pruebas pasaron.');
