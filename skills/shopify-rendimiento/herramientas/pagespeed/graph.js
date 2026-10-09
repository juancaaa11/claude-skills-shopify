// Qué entra en el cálculo del LCP de PageSpeed: las peticiones que terminaron antes del LCP observado, que es lo
// que el simulador «cobra». Agrupa los scripts en «propio», «del tema» y «de Shopify».
// node graph.js <informe.json> [más informes] [-v]
// Con «jsPropio» en la configuración (una expresión regular sobre la URL) distingue tus scripts de los del tema base.
const fs = require('fs');
const { load } = require('../config');
const cfg = load({ opcional: true });
const own = cfg.jsPropio ? new RegExp(cfg.jsPropio) : null;
const short = (u) => (cfg.tienda ? u.replace(cfg.tienda, '') : u.replace(/^https?:\/\/[^/]+/, '')).slice(0, 95);
const group = (r) => (r.resourceType !== 'Script' ? r.resourceType : own && own.test(r.url) ? 'JS propio' : /\/t\/\d+\/assets\//.test(r.url) ? 'JS del tema' : 'JS de Shopify y terceros');

for (const f of process.argv.slice(2).filter((a) => a.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8')); const a = j.audits; const m = a.metrics.details.items[0];
  const lcp = m.observedLargestContentfulPaint, fcp = m.observedFirstContentfulPaint;
  const reqs = a['network-requests'].details.items;
  const t0 = Math.min(...reqs.map((r) => r.networkRequestTime));
  const before = reqs.filter((r) => (r.networkEndTime - t0) <= lcp);
  const grp = {};
  for (const r of before) { const k = group(r); grp[k] = grp[k] || { n: 0, kb: 0 }; grp[k].n++; grp[k].kb += (r.transferSize || 0) / 1024; }
  console.log(`${f}: nota ${Math.round(j.categories.performance.score * 100)} · FCP ${a['first-contentful-paint'].displayValue} LCP ${a['largest-contentful-paint'].displayValue} TBT ${a['total-blocking-time'].displayValue} SI ${a['speed-index'].displayValue} · observado FCP ${Math.round(fcp)} LCP ${Math.round(lcp)} ms`);
  console.log(`   antes del LCP observado: ${before.length} peticiones, ${Math.round(before.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024)} KB → ` + Object.entries(grp).sort((x, y) => y[1].kb - x[1].kb).map(([k, v]) => `${k} ${v.n}/${Math.round(v.kb)}KB`).join(' · '));
  if (process.argv.includes('-v')) for (const r of before.filter((r) => group(r) !== 'JS del tema')) console.log(`      ${String(Math.round(r.networkRequestTime - t0)).padStart(5)}–${String(Math.round(r.networkEndTime - t0)).padStart(5)} ${String(Math.round((r.transferSize || 0) / 1024)).padStart(4)}KB ${String(r.priority).padEnd(8)} ${String(r.resourceType).padEnd(10)} ${short(r.url)}`);
}
