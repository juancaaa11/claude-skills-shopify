// Monta una hoja «antes / después» con las capturas de contrast_verify.js, para enseñársela al dueño de la tienda
// antes de publicar un cambio de colores.
// node contrast_sheet.js <etiqueta antes> <etiqueta después> <salida.png> ["Título"]
// Usa las carpetas contraste-<etiqueta>/ de la carpeta de trabajo y los nombres de «contraste» en la configuración.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { load, chromePath, workDir } = require('../config');
const cfg = load();
const [before, after, out, title = 'Contraste de textos: antes y después'] = process.argv.slice(2);
if (!before || !after || !out) { console.error('uso: node contrast_sheet.js <etiqueta antes> <etiqueta después> <salida.png> ["Título"]'); process.exit(1); }
const WORK = workDir();
const img = (label, name) => { const f = path.join(WORK, 'contraste-' + label, name + '.png'); return fs.existsSync(f) ? `<img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}">` : '<em>sin captura</em>'; };
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

(async () => {
  const rows = (cfg.contraste || []).map(([name]) => `<tr><td>${esc(name)}</td><td>${img(before, name)}</td><td>${img(after, name)}</td></tr>`).join('');
  const html = `<meta charset="utf-8"><style>body{margin:0;padding:24px;font:15px/1.4 system-ui,sans-serif;background:#fff;color:#222;width:860px}h1{font-size:19px;margin:0 0 16px}table{border-collapse:collapse;width:100%}th{text-align:left;padding:8px 10px;font-size:13px;color:#666;border-bottom:1px solid #ddd}td{padding:12px 10px;vertical-align:middle;border-bottom:1px solid #eee}td:first-child{width:150px;font-weight:600}img{max-width:330px;height:auto;display:block;border:1px solid #eee}</style>
<h1>${esc(title)}</h1><table><tr><th></th><th>Antes</th><th>Después</th></tr>${rows}</table>`;
  const wrapper = path.resolve(out + '.html');
  fs.writeFileSync(wrapper, html);
  const browser = await puppeteer.launch({ executablePath: chromePath(cfg), headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 908, height: 600, deviceScaleFactor: 1 });
  await page.goto('file:///' + wrapper.replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  fs.unlinkSync(wrapper);
  console.log('hoja guardada en', out);
})();
