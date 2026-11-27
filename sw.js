// Versi cache: naikkan angka ini kalau ada perubahan besar pada file app.
const V = "tap-bbt-v216";
const SAME = self.location.origin;
const SHELL = [
  "./", "index.html", "digipos.html", "penjualan.html", "wl.html","kalkulator.html","backup.html","cekst.html","cekst-data.js","wl-tap.html","wl-tap.js","c128.js", "manifest.json",
  "icon-192.png", "icon-512.png", "logo-rohil.svg", "nav.js", "penjualan-x.js","penjualan-tgt.js", "digipos-cvm.js", "digipos-kunj.js","digipos-site.js","digipos-xd.js","digipos-sso.js","digipos-nav.js","digipos-cuan.js","digipos-bio.js","digipos-bc.js","qr.js","digipos-so.js","status.json","ui.css","tabgroup.js","favicon.svg","favicon.ico","icon-maskable-192.png","logo-symbol.svg","logo-h.svg","logo-h-dark.svg", "digipos-x.js","data-tap.js","data-tap-pj.js","data-tap-mx.js", "icon-maskable.png",
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
  const isPage = req.mode === "navigate" || req.url.startsWith(SAME); // file app sendiri: jaringan dulu

  if (isPage) {
    // HTML: ambil dari jaringan dulu (supaya update data langsung terlihat), kalau offline pakai cache
    // Sinyal lemah: kalau jaringan tidak menjawab dalam 4 dtk dan ada cache, pakai cache (jaringan tetap jalan di belakang untuk memperbarui)
    e.respondWith((async () => {
      const cached = await caches.match(req, { ignoreSearch: true });
      const net = fetch(req, { cache: "no-store" }).then(async r => {
        if (r.ok) (await caches.open(V)).put(req, r.clone());
        return r;
      });
      if (!cached) {
        try { return await net; } catch { return (await caches.match("index.html")) || Response.error(); }
      }
      net.catch(() => {});
      try {
        return await Promise.race([net, new Promise((_, no) => setTimeout(no, 4000))]);
      } catch { return cached; }
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

// Notifikasi data baru (push tanpa isi: ambil status.json lalu tampilkan item terbaru)
self.addEventListener("push", e => {
  e.waitUntil((async () => {
    let body = "Buka aplikasi untuk melihat.";
    try {
      const j = await (await fetch("status.json", { cache: "no-store" })).json();
      const mx = j.items.reduce((m, x) => x.d > m ? x.d : m, "");
      const nm = j.items.filter(x => x.d === mx).map(x => x.n);
      const tg = new Date(mx + "T00:00:00");
      body = nm.slice(0, 5).join(", ") + (nm.length > 5 ? " +" + (nm.length - 5) : "") + " · " + tg.getDate() + "/" + (tg.getMonth() + 1);
    } catch {}
    await self.registration.showNotification("Cluster Rohil · Data baru masuk", { body, icon: "icon-192.png", badge: "icon-192.png", tag: "data-baru" });
  })());
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async () => {
    const L = await clients.matchAll({ type: "window", includeUncontrolled: true });
    if (L.length) return L[0].focus();
    return clients.openWindow("./");
  })());
});
