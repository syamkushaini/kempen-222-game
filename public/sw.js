/*
 * Lets the game open with no network once it has been played online. Nothing is installed ahead of time: what the game asks
 * for is kept as it goes by, so a first visit costs no extra download.
 *
 *  - The page itself (and any other navigation) goes to the network first and falls back to the last copy, so that a new
 *    release is picked up as soon as there is a connection and is never held back by an old cached page.
 *  - Files whose names carry a hash (everything Vite builds into assets/) never change, so they are kept and served from the cache.
 *  - Everything else on this site (pictures, the manifest) is served from the cache and refreshed in the background.
 *  - Other sites (cloud saves, the leaderboard), partial downloads (music is streamed in ranges) and anything that is not a
 *    plain GET are left alone.
 */
const CACHE = 'k222-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('k222-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

const keep = async (request, response) => {
  if (response && response.status === 200 && response.type === 'basic') (await caches.open(CACHE)).put(request, response.clone());
  return response;
};

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.includes('/.well-known/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((r) => keep(request, r)).catch(async () => (await caches.match(request)) || (await caches.match(new URL('./', self.location.href).href)) || Response.error()));
    return;
  }
  if (/\/assets\/[^/]+-[\w-]{8,}\.\w+$/.test(url.pathname)) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((r) => keep(request, r))));
    return;
  }
  event.respondWith(caches.match(request).then((hit) => {
    const fresh = fetch(request).then((r) => keep(request, r)).catch(() => hit || Response.error());
    return hit || fresh;
  }));
});
