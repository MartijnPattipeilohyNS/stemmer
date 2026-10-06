// Verhoog dit nummer na elke wijziging, dan halen telefoons de nieuwe versie op.
const CACHE = "stemmer-v1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png",
  "./apple-touch-icon.png", "./favicon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const eigen = url.origin === location.origin;
  const font = /(^|\.)(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!eigen && !font) return;
  // Uit de cache serveren (werkt offline), op de achtergrond verversen.
  e.respondWith(caches.open(CACHE).then(cache =>
    cache.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res.ok || res.type === "opaque") cache.put(e.request, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    })));
});
