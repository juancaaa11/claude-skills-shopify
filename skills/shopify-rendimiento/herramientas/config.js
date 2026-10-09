// Configuración de la tienda para todas las herramientas.
// Se lee de la ruta que indique SHOPIFY_SKILLS_CONFIG o, si no, de ./tienda.config.json en la carpeta desde la que
// se ejecuta. Plantilla: config.ejemplo.json. Los resultados (out/, rec/, overlay/) se escriben en la carpeta de
// trabajo, nunca dentro de la skill.
const fs = require('fs');
const path = require('path');

function configPath() {
  return process.env.SHOPIFY_SKILLS_CONFIG || path.join(process.cwd(), 'tienda.config.json');
}

/** Devuelve la configuración; si no existe, termina con un mensaje claro (o devuelve {} con { opcional: true }). */
function load(options) {
  const file = configPath();
  if (!fs.existsSync(file)) {
    if (options && options.opcional) return {};
    console.error(`No encuentro la configuración de la tienda (${file}).\nCopia config.ejemplo.json, rellénalo con los datos de tu tienda y guárdalo como tienda.config.json en la carpeta\nde trabajo, o indica su ruta con SHOPIFY_SKILLS_CONFIG=<ruta>.`);
    process.exit(2);
  }
  const cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
  cfg.tienda = String(cfg.tienda || '').replace(/\/+$/, '');
  cfg.paginas = cfg.paginas || [];
  return cfg;
}

/** Ruta de Chrome: la de la configuración, CHROME_PATH, o la habitual de cada sistema. */
function chromePath(cfg) {
  const candidates = [
    cfg && cfg.chrome,
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) { console.error('No encuentro Chrome. Indica su ruta en "chrome" (configuración) o en CHROME_PATH.'); process.exit(2); }
  return found;
}

/** Carpeta de trabajo: donde se guardan grabaciones y resultados. */
function workDir() {
  return process.env.SHOPIFY_SKILLS_WORK || process.cwd();
}

module.exports = { load, chromePath, workDir, configPath };
