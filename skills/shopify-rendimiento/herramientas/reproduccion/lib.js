// Piezas comunes: configuración, perfiles, arranque de Chrome y respuestas locales para todo lo que no debe salir
// de este ordenador (analítica, píxeles, carrito y, si la tienda la tiene, su API de pedidos propia).
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { load, chromePath, workDir } = require('../config');

const cfg = load();
const WORK = workDir();

const PROFILES = {
  m4: { viewport: { width: 390, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, cpu: 4, net: true, mobile: true },
  m6: { viewport: { width: 390, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, cpu: 6, net: false, mobile: true },
  f4: { viewport: { width: 390, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, cpu: 4, net: { latency: 150, down: 9000, up: 3000 }, mobile: true },
  f6: { viewport: { width: 390, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, cpu: 6, net: { latency: 150, down: 9000, up: 3000 }, mobile: true },
  m1: { viewport: { width: 390, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, cpu: 1, net: false, mobile: true },
  d: { viewport: { width: 1366, height: 800, deviceScaleFactor: 1 }, cpu: 1, net: false, mobile: false },
};
const UA_M = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const UA_D = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

// Peticiones que nunca deben salir de este ordenador.
const MOCKS = [
  [/facebook\.com\/tr|facebook\.com\/privacy_sandbox/, 'meta'],
  [/google-analytics\.com|analytics\.google\.com|doubleclick\.net|google\.[a-z.]+\/(pagead|ccm|ads|measurement)|googleadservices\.com|googlesyndication\.com|googletagmanager\.com\/(a|td)\?/, 'google'],
  [/analytics\.tiktok\.com\/api|analytics-ipv6\.tiktokw|tiktokw\.us\/api|tiktok\.com\/api\/v\d\/pixel/, 'tiktok'],
  [/\.well-known\/shopify\/(monorail|fec)|\/api\/collect|monorail-edge\.shopifysvc\.com|shopifysvc\.com\/v1\/produce|\/web-pixels-manager@[^/]+\/sandbox\/.*\/collect|error-analytics-sessions|notify\.bugsnag|otlp-http-production\.shopifysvc/, 'shopify-analytics'],
  [/clarity\.ms\/collect|bat\.bing\.com\/action|ct\.pinterest\.com|tr\.snapchat\.com|hotjar\.com\/api|a\.klaviyo\.com\/client/, 'other-analytics'],
];
const CART_WRITE = /\/cart\/(add|change|update|clear)(\.js)?(\?|$)/;
const OWN_API = cfg.apiPropia && cfg.apiPropia.patron ? new RegExp(cfg.apiPropia.patron) : null;

/** Devuelve true si la petición se ha respondido en local. */
function handleMock(req, log) {
  const url = req.url();
  const method = req.method();
  const origin = req.headers().origin || '*';
  const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': req.headers()['access-control-request-headers'] || 'content-type, authorization, x-requested-with, idempotency-key', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Credentials': 'true' };

  // API propia de la tienda (formulario de pedido, precios…): respuestas de la configuración. Lo que crearía un
  // pedido se responde siempre con error y queda anotado.
  if (OWN_API && OWN_API.test(url)) {
    log.push({ name: 'api-propia', method, url: url.slice(0, 140) });
    if (method === 'OPTIONS') { req.respond({ status: 204, headers: cors }); return true; }
    const pathname = new URL(url).pathname;
    if ((cfg.apiPropia.nuncaCrear || []).some((p) => pathname.includes(p))) {
      log.push({ name: 'INTENTO-DE-PEDIDO', url });
      req.respond({ status: 500, headers: cors, contentType: 'application/json', body: '{"error":"simulado"}' });
      return true;
    }
    const hit = (cfg.apiPropia.respuestas || []).find((r) => pathname.includes(r.ruta));
    req.respond({ status: (hit && hit.status) || 200, headers: cors, contentType: 'application/json', body: JSON.stringify((hit && hit.body) || {}) });
    return true;
  }

  for (const [re, name] of MOCKS) {
    if (!re.test(url)) continue;
    log.push({ name, method, url: url.slice(0, 140) });
    if (method === 'OPTIONS') { req.respond({ status: 204, headers: cors }); return true; }
    if (name === 'meta') { req.respond({ status: 200, headers: cors, contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAAAAACwAAAAAAQABAAA=', 'base64') }); return true; }
    req.respond({ status: 200, headers: cors, contentType: 'text/plain', body: '' }); return true;
  }
  if (method === 'POST' && CART_WRITE.test(url)) {
    log.push({ name: 'cart', method, url: url.slice(0, 140) });
    req.respond({ status: 200, contentType: 'application/json', body: '{"token":"mock","items":[],"item_count":0,"total_price":0,"currency":"EUR","attributes":{},"note":null}' }); return true;
  }
  return false;
}

async function launch(replayPort) {
  const args = ['--no-sandbox', '--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--disable-features=Translate,OptimizationHints,MediaRouter', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run', '--metrics-recording-only'];
  if (process.platform === 'win32') args.push('--use-angle=d3d11');
  if (replayPort) args.push(`--host-resolver-rules=MAP * 127.0.0.1:${replayPort}`, '--ignore-certificate-errors', '--disable-quic');
  return puppeteer.launch({ executablePath: chromePath(cfg), headless: 'new', args });
}

async function setup(page, prof) {
  await page.setUserAgent(prof.mobile ? UA_M : UA_D);
  await page.setViewport(prof.viewport);
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  // «4G lenta» de Lighthouse, aplicada: 562,5 ms de latencia, 1.474 Kbps de bajada, 675 Kbps de subida.
  if (prof.net) { const n = prof.net === true ? { latency: 562.5, down: 1474.56, up: 675 } : prof.net; await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: n.latency, downloadThroughput: n.down * 1024 / 8, uploadThroughput: n.up * 1024 / 8 }); }
  if (prof.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: prof.cpu });
  return cdp;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
module.exports = { cfg, WORK, PROFILES, handleMock, launch, setup, sleep, fs, path };
