import fs from "node:fs";
const code = fs.readFileSync(process.argv[2], "utf8");
const L = {}, shown = [], opened = [], posted = [];
let focused = 0;
const clientsList = [];
const self = {
  addEventListener: (t, f) => { L[t] = f; },
  registration: { scope: "https://b4wkwrbtms-cpu.github.io/kjy14788/", showNotification: async (t, o) => { shown.push([t, o]); } },
  clients: { matchAll: async () => clientsList, openWindow: async u => { opened.push(u); return {}; }, claim: async () => {} },
  skipWaiting: () => {},
};
const location = { origin: "https://b4wkwrbtms-cpu.github.io" };
const caches = { open: async () => ({ addAll: async () => {}, put: async () => {}, match: async () => null }), keys: async () => [], match: async () => null };
new Function("self", "location", "caches", "fetch", code)(self, location, caches, async () => new Response(""));
const ev = (data) => { let p; return { data, waitUntil: x => { p = x; }, get p() { return p; } }; };
// 1) JSON push
let e = ev({ json: () => ({ title: "말씀 읽을 시간이에요", body: "한 장이면 충분해요", url: "./?go=bible", tag: "kjy-read" }), text: () => "" }); L.push(e); await e.p;
// 2) text push (json 실패)
e = ev({ json: () => { throw new Error("x"); }, text: () => "그냥 글" }); L.push(e); await e.p;
// 3) no data
e = ev(null); L.push(e); await e.p;
console.log("shown", JSON.stringify(shown));
// 4) click with no open window → openWindow (same-origin url only)
const note = url => ({ notification: { close() {}, data: { url } } });
let c = Object.assign(note("./?go=bible"), { waitUntil(x) { this.p = x; } }); L.notificationclick(c); await c.p;
c = Object.assign(note("https://evil.example.com/"), { waitUntil(x) { this.p = x; } }); L.notificationclick(c); await c.p;
console.log("opened", JSON.stringify(opened));
// 5) click with an open window → focus + postMessage
clientsList.push({ url: "https://b4wkwrbtms-cpu.github.io/kjy14788/", focus: async () => { focused++; }, postMessage: m => posted.push(m) });
c = Object.assign(note("./?go=bible"), { waitUntil(x) { this.p = x; } }); L.notificationclick(c); await c.p;
console.log("focused", focused, "posted", JSON.stringify(posted));
