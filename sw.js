// Versi cache: naikkan angka ini kalau ada perubahan besar pada file app.
const V = "tap-bbt-v2";
const SAME = self.location.origin;
const SHELL = [
  "./", "index.html", "digipos.html", "penjualan.html", "manifest.json",
  "icon-192.png", "icon-512.png", "nav.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
  "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await Promise.all(SHELL.map(u => {
      const sameOrigin = u.startsWith(SAME) || !u.startsWith("http");
      return fetch(u, { mode: sameOrigin ? "same-origin" : "no-cors", cache: "reload" })
        .then(r => { if (r.ok || r.type === "opaque") return c.put(u, r); })
        .catch(() => {});
    }));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const isPage = req.mode === "navigate" || (req.url.startsWith(SAME) && /\.html$|\/$/.test(new URL(req.url).pathname));

  if (isPage) {
    // HTML: ambil dari jaringan dulu (supaya update data langsung terlihat), kalau offline pakai cache
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        if (r.ok) (await caches.open(V)).put(req, r.clone());
        return r;
      } catch {
        return (await caches.match(req)) || (await caches.match("index.html"));
      }
    })());
    return;
  }

  // Aset lain (library, font, ikon): cache dulu
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r.ok || r.type === "opaque") (await caches.open(V)).put(req, r.clone());
      return r;
    } catch {
      return Response.error();
    }
  })());
});
