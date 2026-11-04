// Lighthouse móvil: node scripts/lh.mjs [base] → reports/lh-*.json y resumen
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] || 'http://localhost:4321';
const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
for (const path of ['/', '/en/', '/privacidad/', '/en/privacy/']) {
  const r = await lighthouse(base + path, { port: chrome.port, output: 'json', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
  const c = r.lhr.categories;
  const a = r.lhr.audits;
  console.log(path, Object.values(c).map((x) => `${x.title.split(' ')[0]} ${Math.round(x.score * 100)}`).join(' · '), '| LCP', a['largest-contentful-paint'].displayValue, 'CLS', a['cumulative-layout-shift'].displayValue, 'TBT', a['total-blocking-time'].displayValue, 'bytes', a['total-byte-weight'].displayValue);
  for (const cat of Object.values(c)) for (const ref of cat.auditRefs) { const x = a[ref.id]; if (x.score !== null && x.score < 0.9 && ref.weight > 0) console.log('   -', cat.id, ref.id, x.score, x.displayValue || '', (x.details?.items?.[0]?.node?.snippet || '').slice(0, 90)); }
  writeFileSync(`reports/lh${path.replace(/\//g, '_')}.json`, JSON.stringify(r.lhr));
}
await chrome.kill();
