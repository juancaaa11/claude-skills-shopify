// Mediana y rango de las pasadas: node sum.js "<patrón>" ["<patrón>" ...]
// Cada patrón es una expresión regular sobre el nombre del archivo en out/ (sin .json), por ejemplo:
//   node sum.js "rp-antes-producto-m4-r\d" "rp-despues-producto-m4-r\d"
const fs = require('fs'), path = require('path');
const OUT = path.join(process.env.SHOPIFY_SKILLS_WORK || process.cwd(), 'out');
const med = (a) => { const v = a.filter((x) => x != null && !isNaN(x)).sort((x, y) => x - y); return v.length ? v[Math.floor((v.length - 1) / 2)] : null; };

for (const pat of process.argv.slice(2)) {
  const re = new RegExp('^' + pat + '\\.json$');
  const files = fs.readdirSync(OUT).filter((f) => re.test(f));
  if (!files.length) { console.log(pat, '- sin pasadas'); continue; }
  const runs = files.map((f) => JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')));
  const r = (fn) => { const v = runs.map(fn); const ok = v.filter((x) => x != null && !isNaN(x)); return med(v) + (ok.length > 1 ? ' [' + Math.min(...ok) + '-' + Math.max(...ok) + ']' : ''); };
  const marks = [...new Set(runs.flatMap((j) => Object.keys((j.m && j.m.marks) || {})))].filter((k) => !['dcl'].includes(k));
  console.log(
    pat.padEnd(30), 'n=' + runs.length,
    '| FCP', r((j) => j.m.fcp), '| LCP', r((j) => j.lcpFinal && j.lcpFinal.t), '| SI', r((j) => j.si && j.si.si), '| TBT', r((j) => j.tbt),
    '| CLS', med(runs.map((j) => +j.m.cls.toFixed(3))), '| KB', r((j) => j.net.kb), '| pet', r((j) => j.net.requests),
    '| cpu 0-8s', r((j) => j.cpu.busyLoad0to8s), '| reposo ms/s', r((j) => Math.round(j.cpu.busyIdle10toEnd / (j.cpu.idleWindowMs / 1000))),
    '|', marks.map((k) => k + ' ' + r((j) => j.m.marks[k])).join(' | '),
  );
}
