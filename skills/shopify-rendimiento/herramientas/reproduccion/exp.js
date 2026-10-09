// «¿Y si…?» sobre una grabación, sin tocar la tienda: aplica cambios de prueba al HTML grabado y deja el resultado
// en overlay/<nombre>/ para que la reproducción lo sirva en lugar del original.
// node exp.js <grabación> <nombre> <t1,t2,...>
// Las transformaciones de abajo son ejemplos genéricos; añade las tuyas al diccionario T. Cada una recibe el HTML
// y devuelve el HTML cambiado.
const fs = require('fs'), path = require('path');
const [rec, name, ts] = process.argv.slice(2);
const WORK = process.env.SHOPIFY_SKILLS_WORK || process.cwd();
const ix = JSON.parse(fs.readFileSync(path.join(WORK, 'rec', rec, 'index.json'), 'utf8'));
const d = Object.values(ix).find((v) => v.doc);
let h = fs.readFileSync(path.join(WORK, 'rec', rec, d.file), 'utf8');

const T = {
  // Todas las imágenes de producto menos la primera pasan a diferidas y de prioridad baja.
  lazyresto(h) { let i = 0; return h.replace(/<img([^>]*class="[^"]*product[^"]*"[^>]*)>/g, (m, a) => { i++; if (i === 1 || /loading="lazy"/.test(a)) return m; return '<img' + a.replace(/fetchpriority="(auto|high)"/, 'fetchpriority="low"') + ' loading="lazy">'; }); },
  // Sin precargas de fuentes.
  sinprecargafuentes(h) { return h.replace(/<link[^>]*as="font"[^>]*rel="preload"[^>]*>|<link[^>]*rel="preload"[^>]*as="font"[^>]*>/g, ''); },
  // Sin la hoja externa de Google Fonts.
  singooglefonts(h) { return h.replace(/<link[^>]+href="https:\/\/fonts\.googleapis\.com\/css2?[^>]*>/g, ''); },
  // Las secciones bajo la primera no se calculan hasta acercarse.
  cv(h) { return h.replace('</head>', '<style>#MainContent > .shopify-section:not(:first-child), footer > .shopify-section{content-visibility:auto;contain-intrinsic-size:auto 800px}</style></head>'); },
  // La imagen prioritaria se decodifica en su fotograma.
  decodesync(h) { return h.replace(/<img([^>]*fetchpriority="high"[^>]*)>/, '<img$1 decoding="sync">'); },
  // Sin las ilustraciones de ejemplo de Shopify (secciones vacías).
  sinplaceholder(h) { return h.replace(/<svg[^>]*class="[^"]*placeholder[^"]*"[\s\S]*?<\/svg>/g, ''); },
  // Sin precarga del checkout de Shopify.
  sinprecargacheckout(h) { return h.replace(/<script[^>]*\/checkouts\/internal\/preloads\.js[^>]*><\/script>/g, ''); },
};

for (const t of String(ts || '').split(',').filter(Boolean)) {
  if (!T[t]) { console.error('transformación desconocida:', t, '· disponibles:', Object.keys(T).join(', ')); process.exit(1); }
  const before = h.length; h = T[t](h); console.error(t, 'cambia', h.length - before, 'caracteres');
}
fs.mkdirSync(path.join(WORK, 'overlay', name), { recursive: true });
fs.writeFileSync(path.join(WORK, 'overlay', name, d.file), h);
