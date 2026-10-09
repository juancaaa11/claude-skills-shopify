// Una carga con todo medido a la vez: FCP, LCP (y qué elemento es), CLS, tareas largas y TBT, índice de velocidad,
// peso, peticiones, cascada, trabajo del procesador en carga y en reposo, y las marcas propias de la configuración
// («el botón de compra ya está», «el formulario está listo», «ha salido el banner de cookies»…).
// node measure.js <etiqueta> <url> <m4|f4|m6|m1|d> [--rec=nombre] [--replay=puerto] [--post] [--shots] [--wait=14000]
// Analítica, píxeles, carrito y la API propia de la tienda se responden en local (lib.js).
// Salida: out/<etiqueta>.json en la carpeta de trabajo (más fotogramas y, con --shots, capturas).
const { cfg, WORK, PROFILES, handleMock, launch, setup, sleep, fs, path } = require('./lib');
const crypto = require('crypto');
const [label, url, profName] = process.argv.slice(2);
const opt = Object.fromEntries(process.argv.slice(5).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return [m[1], m[2] === undefined ? true : m[2]]; }));
const prof = PROFILES[profName];
const WAIT = Number(opt.wait || 14000);
const OUT = path.join(WORK, 'out'); fs.mkdirSync(OUT, { recursive: true });

function inPage(marcas) {
  const m = (window.__m = { lcp: [], cls: 0, shifts: [], lt: [], marks: {}, fcp: null });
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { const el = e.element; m.lcp.push({ t: Math.round(e.startTime), render: Math.round(e.renderTime), load: Math.round(e.loadTime), size: e.size, tag: el && el.tagName, cls: el && String(el.className || '').slice(0, 90), url: (e.url || '').slice(0, 200), txt: el && !e.url ? (el.textContent || '').trim().slice(0, 60) : '' }); } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (e.hadRecentInput) continue; m.cls += e.value; m.shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: (e.sources || []).slice(0, 3).map((s) => s.node && (s.node.tagName + '.' + String(s.node.className || '').slice(0, 50))) }); } }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) m.lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') m.fcp = Math.round(e.startTime); }).observe({ type: 'paint', buffered: true });
  } catch (e) {}
  const mark = (k) => { if (!(k in m.marks)) m.marks[k] = Math.round(performance.now()); };
  const iv = setInterval(() => {
    if (!document.body) return;
    // Marcas de la configuración: { selector } (el elemento existe), { selector, visible: true } (y se ve) o
    // { global: "objeto.propiedad" } (esa variable global ya es cierta).
    for (const [k, def] of Object.entries(marcas || {})) {
      try {
        if (def.global) { let v = window; for (const part of String(def.global).split('.')) v = v == null ? v : v[part]; if (v) mark(k); continue; }
        const el = def.selector && document.querySelector(def.selector);
        if (!el) continue;
        if (def.visible && (el.closest('[hidden]') || !el.getClientRects().length)) continue;
        mark(k);
      } catch (e) {}
    }
    if (document.fonts && document.fonts.status === 'loaded' && document.readyState !== 'loading') mark('fontsSettled');
    if (performance.now() > 30000) clearInterval(iv);
  }, 100);
  document.addEventListener('DOMContentLoaded', () => mark('dcl'));
  window.addEventListener('load', () => mark('load'));
}

(async () => {
  const browser = await launch(opt.replay ? Number(opt.replay) : 0);
  const page = await browser.newPage();
  const cdp = await setup(page, prof);
  const mocks = [], reqs = new Map(), failed = [], consoleMsgs = [], recIndex = {};
  let recDir = null;
  if (opt.rec) { recDir = path.join(WORK, 'rec', opt.rec); fs.mkdirSync(recDir, { recursive: true }); if (fs.existsSync(path.join(recDir, 'index.json'))) Object.assign(recIndex, JSON.parse(fs.readFileSync(path.join(recDir, 'index.json'), 'utf8'))); }
  await page.setRequestInterception(true);
  page.on('request', (r) => { try { if (!handleMock(r, mocks)) r.continue(); } catch (e) {} });
  cdp.on('Network.requestWillBeSent', (e) => { reqs.set(e.requestId, { url: e.request.url, type: e.type, t0: e.timestamp, method: e.request.method, prio: e.request.initialPriority }); if (!reqs.nav && e.type === 'Document') reqs.nav = e.timestamp; });
  cdp.on('Network.responseReceived', (e) => { const r = reqs.get(e.requestId); if (r) { r.status = e.response.status; r.type = e.type; r.mime = e.response.mimeType; r.proto = e.response.protocol; r.tResp = e.timestamp; } });
  cdp.on('Network.loadingFinished', (e) => { const r = reqs.get(e.requestId); if (r) { r.bytes = e.encodedDataLength; r.t1 = e.timestamp; } });
  cdp.on('Network.loadingFailed', (e) => { const r = reqs.get(e.requestId); if (r) { r.failed = e.errorText; r.canceled = e.canceled; } });
  page.on('console', (msg) => { if (['error', 'warn'].includes(msg.type())) consoleMsgs.push({ type: msg.type(), text: msg.text().slice(0, 300), url: (msg.location() || {}).url }); });
  page.on('pageerror', (e) => consoleMsgs.push({ type: 'pageerror', text: String(e && e.message || e).slice(0, 300) }));
  const pending = [];
  if (recDir) page.on('response', (res) => { const rq = res.request(); if (rq.method() !== 'GET' || !/^https?:/.test(res.url()) || (res.status() >= 300 && !(res.status() === 404 && rq.resourceType() === 'document' && rq.frame() === page.mainFrame()))) return; pending.push((async () => { try { const buf = await res.buffer(); const u = new URL(res.url()); const key = 'GET ' + u.host + u.pathname + u.search; const h = res.headers(); const file = crypto.createHash('md5').update(key).digest('hex'); fs.writeFileSync(path.join(recDir, file), buf); recIndex[key] = { file, url: res.url(), status: res.status(), ct: h['content-type'], cc: h['cache-control'], acao: h['access-control-allow-origin'], link: rq.resourceType() === 'document' ? h.link : undefined, doc: rq.resourceType() === 'document' && rq.frame() === page.mainFrame() || undefined, name: path.basename(u.pathname) }; } catch (e) {} })()); });
  await page.evaluateOnNewDocument(inPage, cfg.marcas || {});
  await page.tracing.start({ path: path.join(OUT, label + '.trace.json'), categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.screenshot', 'loading', 'blink.user_timing'].concat(opt.keeptrace ? ['disabled-by-default-devtools.timeline.stack', 'disabled-by-default-v8.cpu_profiler'] : []) });
  const t0 = Date.now();
  let navErr = null;
  const resp = await page.goto(url, { waitUntil: 'load', timeout: 120000 }).catch((e) => { navErr = String(e); return null; });
  await sleep(Math.max(0, WAIT - (Date.now() - t0)));
  await page.tracing.stop();
  const res = { label, url, profile: profName, finalUrl: page.url(), status: resp && resp.status(), navErr, when: new Date().toISOString() };
  res.m = await page.evaluate(() => window.__m).catch(() => null);
  res.title = await page.title().catch(() => '');
  res.challenge = /captcha|challenge|Checking your browser|cdn-cgi\/challenge/i.test(res.title + ' ' + (await page.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '')));
  // foto de la red al final de la ventana de medición
  const nav = reqs.nav;
  const list = [...reqs.values()].filter((r) => r.url && /^https?:/.test(r.url));
  const byType = {};
  for (const r of list) { const t = r.type || 'Other'; byType[t] = byType[t] || { n: 0, kb: 0 }; byType[t].n++; byType[t].kb += (r.bytes || 0) / 1024; }
  res.net = { requests: list.length, kb: Math.round(list.reduce((s, r) => s + (r.bytes || 0), 0) / 1024), byType: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, { n: v.n, kb: Math.round(v.kb) }])) };
  res.failed = list.filter((r) => (r.failed && r.status !== 200 && r.type !== 'Ping') || (r.status >= 400)).map((r) => ({ url: r.url.slice(0, 160), status: r.status, err: r.failed, canceled: r.canceled }));
  res.waterfall = list.map((r) => ({ u: r.url.replace(/^https?:\/\//, '').slice(0, 110), ty: r.type, p: r.prio, s: Math.round((r.t0 - nav) * 1000), e: r.t1 ? Math.round((r.t1 - nav) * 1000) : null, kb: +((r.bytes || 0) / 1024).toFixed(1) })).sort((a, b) => a.s - b.s);
  res.mocks = mocks.reduce((o, x) => { o[x.name] = (o[x.name] || 0) + 1; return o; }, {});
  res.hosts = [...new Set(list.map((r) => new URL(r.url).host))];
  res.console = consoleMsgs.slice(0, 40);
  res.dom = await page.evaluate(() => ({ nodes: document.getElementsByTagName('*').length, html: document.documentElement.outerHTML.length, h: document.documentElement.scrollHeight, fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight + ' ' + f.style) })).catch(() => null);

  // ---- análisis de la traza
  const ev = JSON.parse(fs.readFileSync(path.join(OUT, label + '.trace.json'), 'utf8')).traceEvents;
  const navEv = ev.filter((e) => e.name === 'navigationStart' && e.args && e.args.data && e.args.data.isOutermostMainFrame && /^https?:/.test(e.args.data.documentLoaderURL || '')).pop();
  const start = navEv ? navEv.ts : 0;
  const tn = {}; ev.filter((e) => e.name === 'thread_name').forEach((e) => (tn[e.pid + ':' + e.tid] = e.args.name));
  const mainKey = navEv ? navEv.pid + ':' + navEv.tid : null;
  const main = ev.filter((e) => e.ph === 'X' && e.dur && e.pid + ':' + e.tid === mainKey && e.ts >= start).sort((a, b) => a.ts - b.ts || b.dur - a.dur);
  const cat = (n) => /EvaluateScript|FunctionCall|v8\.|V8\.|RunMicrotasks|TimerFire|EventDispatch|FireAnimationFrame|FireIdleCallback|XHR|Compile|GC|ProfileCall|ResourceReceive|IntersectionObserver/.test(n) ? 'script' : /ParseHTML|ParseAuthorStyleSheet/.test(n) ? 'parse' : /Layout|UpdateLayoutTree|RecalculateStyles|InvalidateLayout|ScheduleStyle|HitTest|UpdateLayer/.test(n) ? 'style+layout' : /Paint|Composite|Raster|Decode|PrePaint|Layerize|Commit|Draw|UpdateLayer|AnimationFrame|Animation/.test(n) ? 'paint' : 'other';
  const win = { load: [0, 8e6], idle: [10e6, WAIT * 1000] };
  const self = { load: {}, idle: {} }, busy = { load: 0, idle: 0 }, byUrl = {};
  const stack = [];
  const flush = (e) => { const selfDur = e.dur - e._kids; for (const w of ['load', 'idle']) { const [a, b] = win[w]; const rel = e.ts - start; if (rel >= a && rel < b) { if (e.name !== 'RunTask') self[w][cat(e.name)] = (self[w][cat(e.name)] || 0) + selfDur / 1000; else { busy[w] += e.dur / 1000; self[w].other = (self[w].other || 0) + selfDur / 1000; } } } };
  for (const e of main) { e._kids = 0; while (stack.length && stack[stack.length - 1].ts + stack[stack.length - 1].dur <= e.ts) flush(stack.pop()); if (stack.length) stack[stack.length - 1]._kids += e.dur; stack.push(e);
    if (/EvaluateScript|FunctionCall|v8\.compile|EventDispatch|TimerFire|FireAnimationFrame/.test(e.name) && !stack.slice(0, -1).some((p) => /EvaluateScript|FunctionCall|EventDispatch|TimerFire|FireAnimationFrame/.test(p.name))) { const d = (e.args && e.args.data) || {}; const u = (d.url || d.scriptName || (d.type ? 'event:' + d.type : e.name) || '').replace(/^https?:\/\/[^/]+/, '').replace(/\?.*/, '').slice(-70) || 'inline'; byUrl[u] = (byUrl[u] || 0) + e.dur / 1000; } }
  while (stack.length) flush(stack.pop());
  const r1 = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v)]).sort((a, b) => b[1] - a[1]));
  res.cpu = { busyLoad0to8s: Math.round(busy.load), busyIdle10toEnd: Math.round(busy.idle), idleWindowMs: WAIT - 10000, load: r1(self.load), idle: r1(self.idle), scripts: Object.fromEntries(Object.entries(r1(byUrl)).slice(0, 14)) };
  const lcpC = ev.filter((e) => e.name === 'largestContentfulPaint::Candidate' && e.ts >= start).pop();
  res.traceLcp = lcpC ? Math.round((lcpC.ts - start) / 1000) : null;
  // fotogramas
  const shots = ev.filter((e) => e.name === 'Screenshot' && e.ts >= start).sort((a, b) => a.ts - b.ts);
  const fdir = path.join(OUT, label + '-frames'); fs.mkdirSync(fdir, { recursive: true });
  for (const s of [1, 2, 3, 5, 8]) { const f = shots.filter((e) => e.ts - start <= s * 1e6).pop(); if (f) fs.writeFileSync(path.join(fdir, `t${s}s.jpg`), Buffer.from(f.args.snapshot, 'base64')); }
  // índice de velocidad: se decodifican los fotogramas en una página en blanco; completo = parecido al último
  try {
    const p2 = await browser.newPage();
    const sample = shots.filter((e, i) => i === 0 || i === shots.length - 1 || e.ts - shots[Math.max(0, i - 1)].ts > 30000).slice(0, 400);
    const frames = sample.map((e) => ({ t: (e.ts - start) / 1000, b: e.args.snapshot }));
    res.si = await p2.evaluate(async (frames) => {
      const W = 60, H = 120; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d', { willReadFrequently: true });
      const px = []; for (const f of frames) { const img = new Image(); img.src = 'data:image/jpeg;base64,' + f.b; await img.decode(); g.drawImage(img, 0, 0, W, H); px.push(g.getImageData(0, 0, W, H).data); }
      const last = px[px.length - 1]; const diff = (a) => { let d = 0; for (let i = 0; i < a.length; i += 4) d += (Math.abs(a[i] - last[i]) + Math.abs(a[i + 1] - last[i + 1]) + Math.abs(a[i + 2] - last[i + 2]) > 60) ? 1 : 0; return d; };
      const blank = new Uint8ClampedArray(last.length).fill(255); const base = diff(blank) || 1; let si = frames[0].t; let prevT = frames[0].t, prevVc = Math.max(0, 1 - diff(px[0]) / base); const curve = [];
      for (let i = 1; i < frames.length; i++) { si += (1 - prevVc) * (frames[i].t - prevT); prevT = frames[i].t; prevVc = Math.max(0, Math.min(1, 1 - diff(px[i]) / base)); curve.push([Math.round(prevT), +prevVc.toFixed(2)]); }
      const vc = (p) => (curve.find((x) => x[1] >= p) || [null])[0];
      return { si: Math.round(si), vc50: vc(0.5), vc85: vc(0.85), vc95: vc(0.95), frames: frames.length };
    }, frames);
    await p2.close();
  } catch (e) { res.si = { err: String(e).slice(0, 200) }; }
  if (!opt.keeptrace) fs.unlinkSync(path.join(OUT, label + '.trace.json'));
  // TBT a partir de las tareas largas entre el FCP y los 10 s
  if (res.m) { const fcp = res.m.fcp || 0; res.tbt = res.m.lt.filter(([s]) => s >= fcp - 50 && s < 10000).reduce((a, [, d]) => a + Math.max(0, d - 50), 0); res.longest = Math.max(0, ...res.m.lt.map((x) => x[1])); res.lcpFinal = res.m.lcp[res.m.lcp.length - 1] || null; }

  // ---- después: sin límites. Recorre la página entera y revisa imágenes, desbordes, vídeos y animaciones; con --shots, capturas pantalla a pantalla.
  if (opt.post) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    const scroller = prof.mobile ? null : (cfg.scrollEscritorio || null); // algunos temas desplazan un contenedor, no el documento
    const scrollAll = async () => { await page.evaluate(async (sel) => { const el = (sel && document.querySelector(sel) && document.querySelector(sel).scrollHeight > innerHeight + 50) ? document.querySelector(sel) : document.scrollingElement; const h = el.scrollHeight; for (let y = 0; y < h; y += Math.round(innerHeight * 0.8)) { el.scrollTo(0, y); await new Promise((r) => setTimeout(r, 250)); } el.scrollTo(0, 0); }, scroller); };
    await scrollAll(); await sleep(2500);
    const sizes = Object.fromEntries([...reqs.values()].filter((r) => r.bytes).map((r) => [r.url, r.bytes]));
    const audit = () => page.evaluate(() => {
      const dpr = devicePixelRatio; const iw = document.documentElement.clientWidth;
      const imgs = [...document.querySelectorAll('img')].map((i) => { const r = i.getBoundingClientRect(); return { src: (i.currentSrc || i.src || '').slice(0, 220), nw: i.naturalWidth, nh: i.naturalHeight, w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + scrollY), loading: i.loading, fp: i.fetchPriority, dec: i.decoding, sizes: i.sizes, complete: i.complete, wAttr: i.getAttribute('width'), cls: String(i.className).slice(0, 40), par: i.closest('section,[class*="product"],header,footer') ? String(i.closest('section,[class*="product"],header,footer').className).slice(0, 50) : '' }; });
      const over = []; for (const el of document.querySelectorAll('body *')) { const r = el.getBoundingClientRect(); if (r.width && r.height && (r.right > iw + 2 || r.left < -2)) { let p = el.parentElement, clipped = false; while (p && p !== document.body) { const s = getComputedStyle(p); if (/hidden|auto|scroll|clip/.test(s.overflowX)) { clipped = true; break; } p = p.parentElement; } const st = getComputedStyle(el); if (!clipped && st.position !== 'fixed') over.push(el.tagName + '.' + String(el.className).slice(0, 60) + ' L' + Math.round(r.left) + ' R' + Math.round(r.right)); } }
      return { dpr, iw, scrollW: document.documentElement.scrollWidth, bodyScrollW: document.body.scrollWidth, pageH: document.documentElement.scrollHeight, imgs, over: over.slice(0, 15),
        videos: [...document.querySelectorAll('video')].map((v) => ({ src: (v.currentSrc || v.src || (v.querySelector('source') || {}).src || '').slice(0, 200), preload: v.preload, autoplay: v.autoplay, poster: !!v.poster, loop: v.loop, rs: v.readyState, w: Math.round(v.getBoundingClientRect().width), top: Math.round(v.getBoundingClientRect().top + scrollY) })),
        iframes: [...document.querySelectorAll('iframe')].map((f) => (f.src || '').slice(0, 120)),
        anims: document.getAnimations().filter((a) => a.playState === 'running').map((a) => (a.animationName || a.transitionProperty || 'waapi') + '@' + (a.effect && a.effect.target ? String(a.effect.target.className).slice(0, 40) : '')).reduce((o, k) => { o[k] = (o[k] || 0) + 1; return o; }, {}) };
    });
    res.post = await audit();
    res.post.imgs.forEach((i) => { i.kb = sizes[Object.keys(sizes).find((u) => u.startsWith(i.src.slice(0, 219))) || ''] ? Math.round(sizes[Object.keys(sizes).find((u) => u.startsWith(i.src.slice(0, 219)))] / 1024) : null; });
    res.post.broken = res.post.imgs.filter((i) => i.src && i.complete && i.nw === 0 && !/^data:/.test(i.src));
    res.post.afterScroll = { requests: [...reqs.values()].length, kb: Math.round([...reqs.values()].reduce((s, r) => s + (r.bytes || 0), 0) / 1024), media: [...reqs.values()].filter((r) => r.type === 'Media').map((r) => ({ u: r.url.slice(-90), kb: Math.round((r.bytes || 0) / 1024) })) };
    res.post.failedAfter = [...reqs.values()].filter((r) => (r.failed && !r.canceled) || r.status >= 400).map((r) => ({ url: r.url.slice(0, 160), status: r.status, err: r.failed }));
    if (prof.mobile) { await page.setViewport({ ...prof.viewport, width: 360 }); await sleep(600); const a = await audit(); res.post.w360 = { scrollW: a.scrollW, bodyScrollW: a.bodyScrollW, over: a.over, pageH: a.pageH }; await page.setViewport(prof.viewport); await sleep(400); }
    if (opt.shots) {
      const sdir = path.join(OUT, label + '-shots'); fs.mkdirSync(sdir, { recursive: true });
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}video{visibility:hidden!important}' + (cfg.cssCapturas || '') });
      await scrollAll(); await sleep(1500);
      const H = await page.evaluate((sel) => { const el = (sel && document.querySelector(sel) && document.querySelector(sel).scrollHeight > innerHeight + 50) ? document.querySelector(sel) : document.scrollingElement; return el.scrollHeight; }, scroller);
      res.post.shotH = H; let n = 0;
      for (let y = 0; y < H && n < 40; y += prof.viewport.height, n++) { await page.evaluate((sel, y) => { const el = (sel && document.querySelector(sel) && document.querySelector(sel).scrollHeight > innerHeight + 50) ? document.querySelector(sel) : document.scrollingElement; el.scrollTo(0, y); }, scroller, y); await sleep(350); await page.screenshot({ path: path.join(sdir, String(n).padStart(2, '0') + '.png') }); }
    }
  }
  if (recDir) { await Promise.all(pending); fs.writeFileSync(path.join(recDir, 'index.json'), JSON.stringify(recIndex)); res.recorded = Object.keys(recIndex).length; }
  fs.writeFileSync(path.join(OUT, label + '.json'), JSON.stringify(res, null, 1));
  const l = res.lcpFinal || {};
  console.log(`${label} [${profName}] status ${res.status}${res.challenge ? ' CHALLENGE?' : ''} | FCP ${res.m && res.m.fcp} | LCP ${l.t} (${l.tag}.${(l.cls || '').slice(0, 30)} ${(l.url || l.txt || '').slice(-60)}) | SI ${res.si && res.si.si} | TBT ${res.tbt} (max ${res.longest}) | CLS ${res.m && res.m.cls.toFixed(3)} | ${res.net.kb} KB / ${res.net.requests} req | CPU 0-8s ${res.cpu.busyLoad0to8s} ms, idle ${res.cpu.busyIdle10toEnd}/${res.cpu.idleWindowMs} ms | marks ${JSON.stringify(res.m && res.m.marks)} | mocks ${JSON.stringify(res.mocks)} | failed ${res.failed.length} | console ${res.console.length}`);
  await browser.close();
})().catch((e) => { console.error('ERROR', e); process.exit(1); });
