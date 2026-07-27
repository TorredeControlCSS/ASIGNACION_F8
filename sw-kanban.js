/* ===========================================================================
 * SW-KANBAN — Service worker del panel de reporte de etapas
 * ---------------------------------------------------------------------------
 * REGLA CRÍTICA: nunca cachear las llamadas al backend.
 * El panel debe leer SIEMPRE el estado fresco del documento. Si se cacheara
 * una respuesta de script.google.com, un almacenista podría ver que el
 * documento sigue en recolección cuando el capturador ya lo movió, y
 * reportaría una etapa equivocada. Solo se cachea el armazón (HTML, iconos).
 *
 * Al publicar una versión nueva del panel, subir CACHE_VER. Eso obliga a
 * descartar la caché vieja y evita que la gente quede con una versión
 * anterior instalada en el celular.
 * =========================================================================== */

const CACHE_VER = 'kanban-v8';

// Solo el armazón. Nada de datos.
const ASSETS = [
  './kanban_reporte.html',
  './manifest-kanban.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', ev => {
  // skipWaiting: la versión nueva toma control sin esperar a que cierren la app.
  self.skipWaiting();
  ev.waitUntil(
    caches.open(CACHE_VER).then(c => c.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE_VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Backend: SIEMPRE a la red, nunca caché. El estado del documento cambia
  // minuto a minuto y un dato viejo produce reportes equivocados.
  if (url.hostname.indexOf('script.google') >= 0 ||
      url.hostname.indexOf('googleusercontent') >= 0) {
    return; // sin interceptar: el navegador va directo a la red
  }

  // Armazón: red primero, caché como respaldo si no hay señal. Así el panel
  // abre aunque el almacén tenga mala cobertura, pero siempre prefiere la
  // versión más reciente cuando hay conexión.
  ev.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copia = res.clone();
          caches.open(CACHE_VER).then(c => c.put(req, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
