// 오프라인에서도 열리도록 앱 파일과 글꼴을 저장해 둠
const CACHE = "yageun-v33";
const CORE = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
const BIBLE = "yageun-bible-1";  // 성경 본문은 앱을 업데이트해도 지우지 않음
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== BIBLE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com";
  if (url.origin === location.origin && (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/"))) {
    // 앱 화면: 새 버전 먼저, 안 되면 저장본
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("index.html", cp)); return r; }).catch(() => caches.match("index.html")));
    return;
  }
  if (url.origin === location.origin && url.pathname.includes("/bible/")) {
    e.respondWith(caches.open(BIBLE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin === location.origin || isFont) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })));
  }
});
// 읽을 때와 곳 알림 (웹 푸시): 받은 알림을 띄우고, 누르면 말씀 탭으로
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (er) { try { d = { body: e.data ? e.data.text() : "" }; } catch (er2) { d = {}; } }
  const title = String(d.title || "곽준영 키우기").slice(0, 60);
  const opt = { body: String(d.body || "말씀 한 장 읽을 시간이에요").slice(0, 200), icon: "icon-192.png", badge: "icon-192.png", tag: d.tag || "kjy-read", data: { url: d.url || "./?go=bible" } };
  e.waitUntil(self.registration.showNotification(title, opt));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const scope = self.registration.scope, raw = (e.notification.data && e.notification.data.url) || "./?go=bible";
  let url = scope; try { const u = new URL(raw, scope); if (u.origin === location.origin) url = u.href; } catch (er) {}
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) if (c.url.indexOf(scope) === 0 && "focus" in c) { c.postMessage({ go: "bible" }); return c.focus(); }
    return self.clients.openWindow ? self.clients.openWindow(url) : null;
  }));
});
