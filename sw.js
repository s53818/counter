/* Service Worker – bei jeder Änderung an den Dateien CACHE_VERSION erhöhen! */
const CACHE_VERSION = "v3";
const CACHE = "rep-counter-" + CACHE_VERSION;
const SHELL = [
  "./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest",
  "./icon.svg", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png",
];

// Installieren: App-Shell vorab cachen (wartet danach auf "Neu laden")
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

// Aktivieren: alte Cache-Versionen löschen
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Die App sendet SKIP_WAITING, wenn "Neu laden" getippt wird
self.addEventListener("message", (e) => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });

// Cache-first; Navigationen fallen offline auf index.html zurück
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) =>
      hit || fetch(e.request).catch(() => e.request.mode === "navigate" ? caches.match("./index.html") : Response.error())
    )
  );
});
