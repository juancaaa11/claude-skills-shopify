// Para un texto con poco contraste, busca el tono más cercano que llega a 4,5:1 con margen: mismo matiz y
// saturación y menos luminosidad si es opaco; más opacidad si es translúcido.
// node contrast_calc.js <color del texto> <color del fondo> [más pares…] [--objetivo=4.6]
//   node contrast_calc.js "#b06f78" "#ffffff" "rgba(126,6,63,0.5)" "#ffffff"
// El fondo es el color ya compuesto que ve el auditor (lo da a11y_contrast.sh).
const args = process.argv.slice(2);
const TARGET = Number((args.find((a) => a.startsWith('--objetivo=')) || '').split('=')[1]) || 4.6;
const colors = args.filter((a) => !a.startsWith('--'));
if (colors.length < 2 || colors.length % 2) { console.error('uso: node contrast_calc.js <texto> <fondo> [<texto> <fondo> …] [--objetivo=4.6]'); process.exit(1); }

function parse(c) {
  c = c.trim();
  if (c[0] === '#') { const h = c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1); return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 }; }
  const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m[3] === undefined ? 1 : m[3] };
}
const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05); };
const over = (fg, bg, a) => ({ r: Math.round(fg.r * a + bg.r * (1 - a)), g: Math.round(fg.g * a + bg.g * (1 - a)), b: Math.round(fg.b * a + bg.b * (1 - a)) });
function toHsl({ r, g, b }) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; }
function fromHsl([h, s, l]) { const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; const [r, g, b] = [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255)); return { r, g, b }; }

for (let i = 0; i < colors.length; i += 2) {
  const fg = parse(colors[i]), bg = parse(colors[i + 1]);
  const now = ratio(over(fg, bg, fg.a), bg);
  if (now >= 4.5) { console.log(`${colors[i]} sobre ${colors[i + 1]}: ${now.toFixed(2)} — ya cumple`); continue; }
  if (fg.a < 1) {
    // Translúcido: se sube la opacidad; si ni opaco llega, hace falta otro tono.
    let found = null;
    for (let a = fg.a; a <= 1.0001; a += 0.01) { if (ratio(over(fg, bg, a), bg) >= TARGET) { found = a; break; } }
    if (found !== null) { console.log(`${colors[i]} sobre ${colors[i + 1]}: ${now.toFixed(2)} → opacidad ${found.toFixed(2)} (se ve ${hex(over(fg, bg, found))}, ${ratio(over(fg, bg, found), bg).toFixed(2)})`); continue; }
    console.log(`${colors[i]} sobre ${colors[i + 1]}: ${now.toFixed(2)} → ni con opacidad 1 llega (${ratio(over(fg, bg, 1), bg).toFixed(2)}); se busca un tono opaco:`);
  }
  // Opaco: se oscurece (o se aclara, si el fondo es oscuro) sin cambiar matiz ni saturación.
  const [h, s, l] = toHsl(fg); const darker = lum(bg) > 0.18; let step = 0, out = { r: fg.r, g: fg.g, b: fg.b };
  while (ratio(out, bg) < TARGET && step < 100) { step += 0.5; out = fromHsl([h, s, Math.min(1, Math.max(0, l + (darker ? -step : step) / 100))]); }
  console.log(`${colors[i]} sobre ${colors[i + 1]}: ${now.toFixed(2)} → ${hex(out)} (${ratio(out, bg).toFixed(2)}), luminosidad ${darker ? '−' : '+'}${step} puntos`);
}
