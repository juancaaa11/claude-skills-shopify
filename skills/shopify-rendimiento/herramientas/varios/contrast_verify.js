// Comprueba por render los textos del aviso de contraste: color real, contraste, medidas y una captura del bloque
// que rodea a cada uno. Compone los fondos translúcidos (un fondo al 49 % cambia el contraste real).
// node contrast_verify.js <url> <etiqueta> [movil|escritorio]
// Los textos a medir salen de «contraste» en la configuración: [["nombre", "selector CSS"], ...].
// Deja contraste-<etiqueta>/<nombre>.png en la carpeta de trabajo e imprime un JSON (guárdalo para la hoja).
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { load, chromePath, workDir } = require('../config');
const cfg = load();
const [url, label, profile = 'movil'] = process.argv.slice(2);
if (!url || !label) { console.error('uso: node contrast_verify.js <url> <etiqueta> [movil|escritorio]'); process.exit(1); }
const TARGETS = cfg.contraste || [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath(cfg), headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.setViewport(profile === 'movil' ? { width: 393, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await sleep(4000);
  // Bajar como un visitante para que todo se pinte, y volver arriba.
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); } scrollTo(0, 0); });
  await sleep(1500);
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' + (cfg.cssCapturas || '') });
  const dir = path.join(workDir(), 'contraste-' + label);
  fs.mkdirSync(dir, { recursive: true });
  const out = { url: url.slice(0, 90), perfil: profile, tema: await page.evaluate(() => window.Shopify && Shopify.theme && Shopify.theme.name + ' #' + Shopify.theme.id), alturaPagina: await page.evaluate(() => document.documentElement.scrollHeight), textos: {}, erroresDePagina: errors };
  for (const [name, sel] of TARGETS) {
    const info = await page.evaluate((sel) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length) || document.querySelector(sel);
      if (!el) return null;
      const parse = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m[3] === undefined ? 1 : m[3] }; };
      const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      // Capas de fondo desde el texto hacia fuera hasta la primera opaca, compuestas sobre blanco.
      const layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c.a > 0) layers.push(c); if (c.a > 0.95) break; }
      let bg = { r: 255, g: 255, b: 255 }; for (const c of layers.reverse()) bg = { r: c.r * c.a + bg.r * (1 - c.a), g: c.g * c.a + bg.g * (1 - c.a), b: c.b * c.a + bg.b * (1 - c.a) };
      const s = getComputedStyle(el); const f0 = parse(s.color);
      const fg = { r: f0.r * f0.a + bg.r * (1 - f0.a), g: f0.g * f0.a + bg.g * (1 - f0.a), b: f0.b * f0.a + bg.b * (1 - f0.a) };
      const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
      const L1 = lum(fg), L2 = lum(bg); const rect = el.getBoundingClientRect();
      el.scrollIntoView({ block: 'center' });
      return { color: s.color, visto: hex(fg), fondo: hex(bg), contraste: Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 100) / 100, px: s.fontSize, peso: s.fontWeight, ancho: Math.round(rect.width * 10) / 10, alto: Math.round(rect.height * 10) / 10, texto: el.textContent.trim().slice(0, 30), visible: el.getClientRects().length > 0 };
    }, sel);
    out.textos[name] = info;
    if (info && info.visible) {
      await sleep(400);
      // Captura del bloque que rodea al texto (el propio texto es demasiado pequeño para juzgar el color).
      const handle = await page.evaluateHandle((sel) => { const el = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length); let box = el.parentElement; while (box.parentElement && box.getBoundingClientRect().height < 60) box = box.parentElement; return box; }, sel);
      await handle.asElement().screenshot({ path: path.join(dir, name + '.png') }).catch((e) => { out.textos[name].captura = String(e).slice(0, 120); });
    }
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
