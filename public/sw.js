const CACHE_NAME = 'glorifier-shell-v2';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest'];

function isBackendRequest(pathname) {
  return /^\/(?:api|auth)(?:\/|$)/.test(pathname);
}

function offlineResponse(message) {
  return new Response(message, {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

async function serveNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    return (await caches.match('./index.html')) ||
      offlineResponse('GLORIFIER is offline. Reconnect and reload to try again.');
  }
}

async function cacheSuccessfulAsset(request, event) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type !== 'opaque') {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
    }
    return response;
  } catch {
    return (await caches.match(request)) ||
      offlineResponse('Asset unavailable while offline.');
  }
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
  if (url.origin !== self.location.origin || isBackendRequest(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(serveNavigation(request));
    return;
  }

  const cacheableTypes = ['script', 'style', 'image', 'font'];
  if (!cacheableTypes.includes(request.destination)) return;

  event.respondWith(cacheSuccessfulAsset(request, event));
});
