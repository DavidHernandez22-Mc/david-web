// Activa los hooks de .githooks (npm install lo corre solo, vía "prepare").
// Fuera de un repositorio git (por ejemplo, en algunos entornos de build) no hace nada.
import { spawnSync } from 'node:child_process';
const inRepo = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' }).status === 0;
if (inRepo) spawnSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'inherit' });
