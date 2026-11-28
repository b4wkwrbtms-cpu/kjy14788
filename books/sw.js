// 설교 서가 — 오프라인에서도 열리도록 앱과 읽은 원고를 저장해 둠
const V = "sbk-app-16";
const BIB = "sbk-bib-56h";    // 20대 말투 본문·해설: 성경이 새로 배포되면 이름이 바뀌어 새로 받음
const DATA = "sbk-data-1";   // 원고·성경·글꼴은 앱을 업데이트해도 지우지 않음
const SHELL = ["./", "index.html", "manifest.webmanifest", "catalog.json", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("sbk-") && k !== V && k !== DATA && k !== BIB).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const netFirst = (req, cacheName, key) => fetch(req, { cache: "no-store" }).then(r => { if (r.ok) { const cp = r.clone(); caches.open(cacheName).then(c => c.put(key || req, cp)); } return r; }).catch(() => caches.match(key || req));
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    const scope = new URL(self.registration.scope).pathname;
    if (req.mode === "navigate" || url.pathname === scope || url.pathname === scope + "index.html") { e.respondWith(netFirst(req, V, "index.html")); return; }
    if (url.pathname.startsWith(scope) && /catalog\.json$/.test(url.pathname)) { e.respondWith(netFirst(req, V)); return; }
    if (/\/bible\/(sm|smv)\.json$/.test(url.pathname)) { e.respondWith(netFirst(req, DATA)); return; }
    if (/\/bible\/(mz|x|nt|he)\/|\/bible\/lin\.json$/.test(url.pathname)) {
      e.respondWith(caches.open(BIB).then(c => c.match(req).then(hit => hit || fetch(req, { cache: "no-store" }).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => caches.open(DATA).then(d => d.match(req)).then(o => o || Response.error())))));
      return;
    }
    if (url.pathname.includes("/bible/") || url.pathname.includes("/fonts/")) {
      e.respondWith(caches.open(DATA).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }))));
      return;
    }
    if (url.pathname.startsWith(scope)) { e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; }))); }
    return;
  }
  if (url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com") {
    e.respondWith(caches.open(DATA).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }))));
  }
});
