const CACHE_NAME = 'glorifier-shell-v2';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest'];
const API_PREFIXES = ['/api/', '/auth/'];

function isBackendRequest(pathname) {
  return /^\/(?:api|auth)(?:\/|$)/.test(pathname);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key === 'glorifier-ai-v1')
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isBackendRequest(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedShell = await caches.match('./index.html');
        return cachedShell || new Response(
          'GLORIFIER is offline. Reconnect and reload to try again.',
          { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        );
      })
    );
    return;
  }

  if (!['script', 'style', 'image', 'font'].includes(request.destination)) return;

  event.respondWith(
    fetch(request).then((response) => {
      if (!response.ok || response.type === 'opaque') return response;
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
      return response;
    }).catch(async () => {
      const cachedAsset = await caches.match(request);
      return cachedAsset || new Response('Asset unavailable while offline.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    })
  );
});
