const C="jubo-v5";
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","manifest.webmanifest","icon-192.png"].map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("jubo-")&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);const same=url.origin===location.origin;
  if(same&&(req.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith(".html"))){
    // 앱 화면은 늘 새 버전 먼저, 인터넷이 없을 때만 저장본
    e.respondWith(fetch(req,{cache:"no-store"}).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put("index.html",cp));}return r;}).catch(()=>caches.open(C).then(c=>c.match("index.html"))));return;}
  e.respondWith(caches.open(C).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&(r.ok||r.type==="opaque"))c.put(req,r.clone());return r;}))));
});
