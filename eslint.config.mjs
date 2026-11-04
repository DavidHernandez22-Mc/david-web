import globals from 'globals';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/', 'public/', 'raw-captures/', 'reports/', '.taste-skill/'] },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { files: ['**/*.{mjs,ts}'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
];
