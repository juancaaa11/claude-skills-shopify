// Reproducción local de una página grabada: node replay.js <puerto> <carpeta de la grabación> [carpeta de cambios]
// Chrome se lanza con --host-resolver-rules para que todos los dominios caigan aquí. El texto se vuelve a comprimir
// (brotli) para que el peso transferido con la red limitada sea realista. Lo que no está grabado responde 404 y
// queda anotado en miss.log. Necesita key.pem y cert.pem (autofirmados) en la carpeta de trabajo: ver README.
const http2 = require('http2'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const [port, rec, overlay] = [Number(process.argv[2]), process.argv[3], process.argv[4]];
const WORK = process.env.SHOPIFY_SKILLS_WORK || process.cwd();
const index = JSON.parse(fs.readFileSync(path.join(rec, 'index.json'), 'utf8'));
const byPath = {}; const docs = {};
for (const [k, v] of Object.entries(index)) { const u = new URL('https://' + k.split(' ')[1]); (byPath[u.host + u.pathname] = byPath[u.host + u.pathname] || []).push(v); if (v.doc) docs[u.pathname] = v; }
const cache = new Map();
function body(v) {
  let b = cache.get(v.file); if (b) return b;
  let raw = fs.readFileSync(path.join(rec, v.file));
  if (overlay) { const o = path.join(overlay, v.file); if (fs.existsSync(o)) raw = fs.readFileSync(o); const n = v.name && path.join(overlay, v.name); if (n && fs.existsSync(n)) raw = fs.readFileSync(n); }
  const text = /text|javascript|json|svg|xml/.test(v.ct || '');
  b = { buf: text ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } }) : raw, enc: text ? 'br' : null };
  cache.set(v.file, b); return b;
}
const miss = new Set();
const server = http2.createSecureServer({ key: fs.readFileSync(path.join(WORK, 'key.pem')), cert: fs.readFileSync(path.join(WORK, 'cert.pem')), allowHTTP1: true });
server.on('request', (req, res) => {
  const host = req.headers[':authority'] || req.headers.host; const u = new URL('https://' + host + req.url);
  let v = index[req.method + ' ' + u.host + u.pathname + u.search];
  // Imágenes de la CDN: si no está el ancho exacto, la grabada con ese ancho o, a falta de ella, la primera.
  if (!v && req.method === 'GET') { const c = byPath[u.host + u.pathname]; if (c && (c.length === 1 || !/width=|[?&]v=/.test(u.search))) v = c[0]; else if (c) { const w = (u.search.match(/width=(\d+)/) || [])[1]; v = c.find(x => w && x.url.includes('width=' + w + '&')) || c.find(x => w && x.url.endsWith('width=' + w)) || c[0]; } }
  if (!v && req.method === 'GET' && docs[u.pathname]) v = docs[u.pathname];
  if (!v) { if (!miss.has(req.method + ' ' + u.href)) { miss.add(req.method + ' ' + u.href); fs.appendFileSync(path.join(rec, 'miss.log'), req.method + ' ' + u.href + '\n'); } res.writeHead(req.method === 'GET' ? 404 : 204, { 'access-control-allow-origin': req.headers.origin || '*', 'access-control-allow-credentials': 'true' }); return res.end(); }
  const b = body(v);
  const h = { 'content-type': v.ct || 'application/octet-stream', 'content-length': b.buf.length, 'cache-control': v.cc || 'no-cache', 'access-control-allow-origin': v.acao ? (v.acao === '*' ? '*' : (req.headers.origin || '*')) : (req.headers.origin || '*'), 'timing-allow-origin': '*' };
  if (b.enc) h['content-encoding'] = b.enc;
  // NOLINK=1 quita la cabecera Link grabada (el adelanto de hojas de estilo de Shopify) para medir sin él.
  if (v.link && process.env.NOLINK !== '1') h.link = v.link;
  res.writeHead(v.status === 304 ? 200 : v.status, h); res.end(b.buf);
});
server.listen(port, '127.0.0.1', () => console.log('reproduciendo ' + rec + ' en el puerto ' + port + ' (' + Object.keys(index).length + ' respuestas)'));
