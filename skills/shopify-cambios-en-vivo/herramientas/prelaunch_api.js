// Repaso previo a un lanzamiento, sin navegador y sin dejar nada en la tienda ni en las plataformas de anuncios:
//  - salud de un servicio propio (si la tienda tiene uno)
//  - los destinos de los anuncios responden, sin cadenas de redirección raras, y el producto está disponible
//  - comprobaciones HTTP propias: por ejemplo, que la ruta que crea pedidos RECHAZA un token inventado
//    (así se sabe que responde sin crear ningún pedido)
// node prelaunch_api.js
// Lee «repasoPrevio» de la configuración: SHOPIFY_SKILLS_CONFIG=<ruta> o ./tienda.config.json (ver el ejemplo en
// la skill shopify-rendimiento, herramientas/config.ejemplo.json). No necesita dependencias (Node 18+).
const fs = require('fs');
const path = require('path');
const file = process.env.SHOPIFY_SKILLS_CONFIG || path.join(process.cwd(), 'tienda.config.json');
if (!fs.existsSync(file)) { console.error(`No encuentro la configuración (${file}). Indica su ruta con SHOPIFY_SKILLS_CONFIG=<ruta>.`); process.exit(2); }
const plan = JSON.parse(fs.readFileSync(file, 'utf8')).repasoPrevio || {};
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
let bad = 0;
const line = (ok, text) => { if (!ok) bad += 1; console.log((ok ? '  OK    ' : '  FALLO ') + text); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  if (plan.salud) {
    console.log('== Servicio propio');
    const t0 = Date.now(); const h = await fetch(plan.salud).catch((e) => ({ status: 0, error: String(e) }));
    line(h.status === 200, `${plan.salud} → ${h.status || h.error} en ${Date.now() - t0} ms`);
  }

  if ((plan.comprobaciones || []).length) console.log('== Comprobaciones');
  for (const c of plan.comprobaciones || []) {
    const headers = { 'user-agent': UA };
    if (c.cuerpo !== undefined) headers['content-type'] = 'application/json';
    if (c.origen) headers.origin = c.origen;
    const res = await fetch(c.url, { method: c.metodo || 'GET', headers, body: c.cuerpo !== undefined ? JSON.stringify(c.cuerpo) : undefined }).catch((e) => ({ status: 0, error: String(e) }));
    let json = null; try { json = await res.json(); } catch (e) {}
    let ok = (c.esperado || [200]).includes(res.status);
    let extra = '';
    // «valores»: campos de la respuesta que deben coincidir, p. ej. { "total": 2999 }.
    for (const [k, v] of Object.entries(c.valores || {})) { const got = json ? k.split('.').reduce((o, p) => (o == null ? o : o[p]), json) : undefined; if (got !== v) ok = false; extra += ` · ${k}=${JSON.stringify(got)}${got === v ? '' : ' (esperado ' + JSON.stringify(v) + ')'}`; }
    line(ok, `${c.nombre || c.url} → ${res.status || res.error}${extra}`);
    await sleep(400);
  }

  if ((plan.destinos || []).length) console.log('== Destinos de los anuncios');
  for (const d of plan.destinos || []) {
    const hops = []; let current = d.url, res = null;
    for (let i = 0; i < 5; i++) { res = await fetch(current, { redirect: 'manual', headers: { 'user-agent': UA } }); if (res.status >= 300 && res.status < 400 && res.headers.get('location')) { hops.push(res.status); current = new URL(res.headers.get('location'), current).href; } else break; }
    const direct = d.url.startsWith('https://') && !/\/\/www\./.test(d.url);
    // Una dirección https sin www debería responder sin redirecciones; las variantes http:// o www., con una.
    line(res.status === 200 && (direct ? hops.length === 0 : hops.length <= 2), `${d.url} → ${hops.length ? hops.join(' → ') + ' → ' : ''}${res.status}${hops.length ? ' en ' + current : ''}`);
    if (d.producto && res.status === 200) {
      const pj = await fetch(new URL('/products/' + d.producto + '.js', current).href, { headers: { 'user-agent': UA } }).then((r) => r.json()).catch(() => null);
      line(pj && pj.available && pj.variants.every((v) => v.available), pj ? `   producto «${pj.title.slice(0, 44)}»: disponible ${pj.available}, precio ${(pj.price / 100).toFixed(2)}` : '   no se pudo leer el producto');
    }
    await sleep(1500);
  }
  console.log(bad ? `\n${bad} fallo(s)` : '\nTodo correcto');
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });
