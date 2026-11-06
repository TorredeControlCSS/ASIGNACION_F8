/* ===========================================================================
 * SW-MENSUALES — guarda el Tablero de Mensuales en la pantalla del almacén
 * ---------------------------------------------------------------------------
 * Alcance: solo tablero_mensuales.html (no toca el Kanban ni sw-kanban.js).
 * - La página: red primero con espera máxima de 8 s; sin señal, la copia guardada.
 * - La librería de Excel (cdnjs): copia guardada primero.
 * - Los datos del Kanban (kanban/tablero.json) NO se guardan aquí: el tablero
 *   ya guarda en su memoria la última versión buena y nunca la reemplaza por
 *   una descarga incompleta.
 * Al publicar una versión nueva del tablero, subir CACHE_VER.
 * =========================================================================== */
const CACHE_VER = 'mensuales-v5';
const PAGINA = './tablero_mensuales.html';
const EXCEL = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';

self.addEventListener('install', ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE_VER).then(c => c.addAll([PAGINA, './favicon.ico']).then(() => c.add(new Request(EXCEL, { mode: 'no-cors' })).catch(() => {}))).catch(() => {}));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.indexOf('mensuales-') === 0 && k !== CACHE_VER).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
function conEspera(p, ms) { return new Promise((ok, no) => { const t = setTimeout(() => no(new Error('lento')), ms); p.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); no(e); }); }); }
self.addEventListener('fetch', ev => {
  const req = ev.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.indexOf('/kanban/') >= 0 || url.hostname.indexOf('script.google') >= 0) return; // datos: directo a la red
  if (req.mode === 'navigate' || url.pathname.endsWith('/tablero_mensuales.html')) {
    ev.respondWith(conEspera(fetch(req), 8000).then(res => {
      if (res && res.status === 200) { const c = res.clone(); caches.open(CACHE_VER).then(x => x.put(PAGINA, c)); }
      return res;
    }).catch(() => caches.match(PAGINA)));
    return;
  }
  if (req.url === EXCEL || url.pathname.endsWith('/favicon.ico')) {
    ev.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const c = res.clone(); caches.open(CACHE_VER).then(x => x.put(req, c)); return res; })));
  }
});
