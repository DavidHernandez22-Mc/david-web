import { defineConfig } from 'astro/config';
import { existsSync, renameSync, rmdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from './site.config.mjs';

// Cloudflare Workers (not_found_handling: "404-page") busca un 404.html en cada carpeta.
// Astro genera la del inglés como en/404/index.html; aquí se mueve a en/404.html.
const notFoundPerLanguage = {
  name: 'not-found-per-language',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const out = fileURLToPath(dir);
      const from = `${out}en/404/index.html`;
      if (existsSync(from)) {
        renameSync(from, `${out}en/404.html`);
        rmdirSync(`${out}en/404`);
      }
    },
  },
};

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
  integrations: [notFoundPerLanguage],
});
