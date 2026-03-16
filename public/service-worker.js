const SW_VERSION = "2026-02-26-1";

self.addEventListener("install", (event) => {
  // Immediately activate new worker so stale caches can be cleared quickly.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
      console.log(`[SW] Activated ${SW_VERSION} and cleared ${keys.length} cache(s)`);
    })()
  );
});

// Intentionally no custom fetch cache strategy:
// we prefer fresh network responses to avoid stale CSV/app payloads on PWA clients.
