// Simulador de PageSpeed (Lantern) sobre los artefactos de una pasada: qué entra en el cálculo de FCP/LCP y
// cuánto bajaría cada métrica si se quitan del camino ciertos recursos. No toca la tienda.
// uso: [LIGHTHOUSE_DIR=<carpeta de lighthouse@12>] node whatif.mjs <carpeta-artefactos> [-v] [--sin "patrón1,patrón2" ...]
import { pathToFileURL } from 'url';
import { createRequire } from 'module';
// Configuración de la tienda (opcional aquí): «tienda» acorta las direcciones y «jsPropio» separa tus scripts.
const cfg = createRequire(import.meta.url)('../config').load({ opcional: true });
const own = cfg.jsPropio ? new RegExp(cfg.jsPropio) : null;
// Carpeta de lighthouse@12: por defecto, la de node_modules junto a donde se ejecuta (npm i lighthouse@12); o LIGHTHOUSE_DIR.
const L = (process.env.LIGHTHOUSE_DIR || process.cwd() + '/node_modules/lighthouse').split('\\').join('/').replace(/\/+$/, '') + '/';
const imp = (p) => import(pathToFileURL(L + p).href);
const { loadArtifacts } = await imp('core/lib/asset-saver.js');
const { LanternLargestContentfulPaint } = await imp('core/computed/metrics/lantern-largest-contentful-paint.js');
const { LanternFirstContentfulPaint } = await imp('core/computed/metrics/lantern-first-contentful-paint.js');
const { LoadSimulator } = await imp('core/computed/load-simulator.js');
const { ProcessedNavigation } = await imp('core/computed/processed-navigation.js');
const constants = await imp('core/config/constants.js');
const Lantern = await imp('core/lib/lantern/lantern.js');

const args = process.argv.slice(2);
const dir = args[0];
const verbose = args.includes('-v');
const scenarios = [];
for (let i = 1; i < args.length; i++) if (args[i] === '--sin') scenarios.push(args[++i].split(','));

const artifacts = loadArtifacts(dir);
const settings = { ...constants.defaultSettings, formFactor: 'mobile', throttling: constants.throttling.mobileSlow4G, throttlingMethod: 'simulate', screenEmulation: constants.screenEmulationMetrics.mobile, emulatedUserAgent: constants.userAgents.mobile };
const data = { trace: artifacts.Trace || artifacts.traces.defaultPass, devtoolsLog: artifacts.DevtoolsLog || artifacts.devtoolsLogs.defaultPass, gatherContext: artifacts.GatherContext || { gatherMode: 'navigation' }, settings, URL: artifacts.URL, SourceMaps: artifacts.SourceMaps || [], simulator: null };
const context = { computedCache: new Map() };

const nav = await ProcessedNavigation.request(data.trace, context);
const fcp = await LanternFirstContentfulPaint.request(data, context);
const lcp = await LanternLargestContentfulPaint.request(data, context);
const simulator = await LoadSimulator.request(data, context);
const short = (u) => (cfg.tienda ? u.replace(cfg.tienda, '') : u.replace(/^https?:\/\/[^/]+/, '')).replace(/\?.*$/, '').replace(/\/cdn\/shop\/t\/\d+\/assets\//, 'A/').slice(0, 70);
const kind = (n) => { const u = n.request.url, t = n.request.resourceType || 'Redirección'; if (t !== 'Script') return t; return own && own.test(u) ? 'JS propio' : /\/t\/\d+\/assets\//.test(u) ? 'JS del tema' : 'JS de Shopify y terceros'; };

function describe(name, graph, estimate) {
  const net = [], cpu = [];
  graph.traverse((n) => (n.type === 'network' ? net : cpu).push(n));
  const grp = {};
  for (const n of net) { const k = kind(n); grp[k] = grp[k] || { n: 0, kb: 0 }; grp[k].n++; grp[k].kb += (n.request.transferSize || 0) / 1024; }
  const cpuMs = cpu.reduce((s, n) => s + n.duration / 1000, 0);
  console.log(`  ${name}: ${Math.round(estimate.timeInMs)} ms · ${net.length} peticiones ${Math.round(net.reduce((s, n) => s + (n.request.transferSize || 0), 0) / 1024)} KB · CPU ${cpu.length} tareas ${Math.round(cpuMs)} ms (x4 = ${Math.round(cpuMs * 4)}) → ` + Object.entries(grp).sort((a, b) => b[1].kb - a[1].kb).map(([k, v]) => `${k} ${v.n}/${Math.round(v.kb)}KB`).join(' · '));
  if (verbose) {
    const t = estimate.nodeTimings;
    const rows = [...t.entries()].map(([n, tm]) => ({ n, s: tm.startTime, e: tm.endTime })).sort((a, b) => a.e - b.e);
    for (const r of rows) {
      if (r.n.type === 'network') { if (kind(r.n) === 'JS del tema') continue; console.log(`      ${String(Math.round(r.s)).padStart(5)}–${String(Math.round(r.e)).padStart(5)}  ${String(Math.round((r.n.request.transferSize || 0) / 1024)).padStart(3)}KB ${String(r.n.request.priority).padEnd(8)} ${kind(r.n).padEnd(11)} ${short(r.n.request.url)}`); }
      else if (r.n.duration / 1000 >= 8) console.log(`      ${String(Math.round(r.s)).padStart(5)}–${String(Math.round(r.e)).padStart(5)}  CPU ${Math.round(r.n.duration / 1000)} ms real · ${[...r.n.getEvaluateScriptURLs()].map(short).join(', ').slice(0, 80) || r.n.childEvents.slice(0, 60).map((e) => e.name).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5).join(',')}`);
    }
  }
}

console.log(`${dir}: observado FCP ${Math.round(nav.timings.firstContentfulPaint)} ms · LCP ${Math.round(nav.timings.largestContentfulPaint)} ms`);
console.log(` FCP simulado ${Math.round(fcp.timing)} ms`);
describe('optimista', fcp.optimisticGraph, fcp.optimisticEstimate);
describe('pesimista', fcp.pessimisticGraph, fcp.pessimisticEstimate);
console.log(` LCP simulado ${Math.round(lcp.timing)} ms`);
describe('optimista', lcp.optimisticGraph, lcp.optimisticEstimate);
describe('pesimista', lcp.pessimisticGraph, lcp.pessimisticEstimate);

// «¿Y si…?»: quita del grafo las peticiones cuyo URL contiene alguno de los patrones (y las tareas de CPU que
// evalúan esos scripts) y vuelve a simular. Los nodos de los que depende algo que se queda vuelven solos.
const M = Lantern.Metrics;
function whatIf(patterns) {
  const hit = (u) => patterns.some((p) => u.includes(p));
  const keep = (n) => (n.type === 'network' ? !hit(n.request.url) : ![...n.getEvaluateScriptURLs()].some(hit));
  const out = {};
  for (const [label, Metric, res] of [['FCP', M.FirstContentfulPaint, fcp], ['LCP', M.LargestContentfulPaint, lcp]]) {
    const est = [res.optimisticGraph, res.pessimisticGraph].map((g) => {
      const g2 = g.cloneWithRelationships(keep);
      let back = 0, kb = 0, n = 0; g2.traverse((x) => { if (x.type === 'network') { n++; kb += (x.request.transferSize || 0) / 1024; if (hit(x.request.url)) back++; } });
      const sim = simulator.simulate(g2);
      const e = Metric.getEstimateFromSimulation(sim, { optimistic: g === res.optimisticGraph, fcpResult: out.FCPres });
      return { t: e.timeInMs, n, kb, back };
    });
    out[label] = (est[0].t + est[1].t) / 2;
    if (label === 'FCP') out.FCPres = { timing: out.FCP, optimisticEstimate: { timeInMs: est[0].t }, pessimisticEstimate: { timeInMs: est[1].t } };
    out[label + 'd'] = `opt ${Math.round(est[0].t)} (${est[0].n}p/${Math.round(est[0].kb)}KB) pes ${Math.round(est[1].t)} (${est[1].n}p/${Math.round(est[1].kb)}KB)` + (est[0].back + est[1].back ? ` [vuelven ${est[0].back}+${est[1].back}]` : '');
  }
  out.LCP = Math.max(out.LCP, out.FCP);
  console.log(` sin [${patterns.join(' | ').slice(0, 110)}]\n    → FCP ${Math.round(out.FCP)} ms (${out.FCPd}) · LCP ${Math.round(out.LCP)} ms (${out.LCPd})`);
}
for (const s of scenarios) whatIf(s);
