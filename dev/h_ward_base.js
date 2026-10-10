// 아주 작은 가짜 DOM으로 게임 스크립트를 실제로 돌려보는 점검기
const fs = require("fs");
const html = fs.readFileSync(process.argv[2], "utf8");
const errors = [];
let ID = 0;
class ClassList { constructor(el) { this.el = el; } get s() { return new Set((this.el.attrs.class || "").split(/\s+/).filter(Boolean)); }
  set(set) { this.el.attrs.class = [...set].join(" "); } add(c) { const s = this.s; s.add(c); this.set(s); } remove(c) { const s = this.s; s.delete(c); this.set(s); }
  toggle(c, f) { const s = this.s; const on = f === undefined ? !s.has(c) : !!f; on ? s.add(c) : s.delete(c); this.set(s); return on; } contains(c) { return this.s.has(c); } }
class El {
  constructor(tag) { this.tagName = (tag || "div").toUpperCase(); this.children = []; this.attrs = {}; this.style = {}; this.dataset = {}; this.listeners = {}; this._text = ""; this.parent = null; this.hidden = false; this.disabled = false; this.value = ""; this.uid = ID++; }
  get classList() { return new ClassList(this); }
  get parentElement() { return this.parent; }
  scrollIntoView() {}
  closest() { return null; }
  get className() { return this.attrs.class || ""; } set className(v) { this.attrs.class = v; }
  get id() { return this.attrs.id || ""; } set id(v) { this.attrs.id = v; }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k.startsWith("data-")) this.dataset[k.slice(5)] = String(v); } getAttribute(k) { return this.attrs[k]; }
  appendChild(c) { if (c.parent) c.parent.children = c.parent.children.filter(x => x !== c); c.parent = this; this.children.push(c); return c; }
  append(...cs) { cs.forEach(c => this.appendChild(c)); }
  get firstChild() { return this.children[0]; }
  set textContent(v) { this.children = []; this._text = String(v); } get textContent() { return this._text + this.children.map(c => c.textContent).join(""); }
  set innerHTML(h) { this.children = []; this._text = ""; parseInto(this, String(h)); } get innerHTML() { return ""; }
  addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); }
  dispatch(t, ev = {}, tgt) { const target = tgt || this; (this.listeners[t] || []).forEach(f => { try { f(Object.assign({ target, preventDefault() {}, clientX: 300, clientY: 200 }, ev)); } catch (e) { errors.push(t + " on " + this.tagName + "#" + this.id + ": " + e.stack); } }); if (this.parent && t === "click") this.parent.dispatch(t, ev, target); }
  click() { if (this.disabled) return; this.dispatch("click"); }
  getBoundingClientRect() { return { left: 0, top: 0, width: 640, height: 360 }; }
  getContext() { return ctx2d(); }
  querySelectorAll(sel) { return qsa(this, sel); } querySelector(sel) { return qsa(this, sel)[0] || null; }
  get width() { return +this.attrs.width || 300; } set width(v) { this.attrs.width = v; } get height() { return +this.attrs.height || 150; } set height(v) { this.attrs.height = v; }
}
function ctx2d() { const g = { addColorStop() {} }; return new Proxy({}, { get(t, p) { if (p === "measureText") return s => ({ width: String(s).length * 9 }); if (p === "createRadialGradient" || p === "createLinearGradient") return () => g; if (p in t) return t[p]; return () => {}; }, set(t, p, v) { t[p] = v; return true; } }); }
function parseInto(root, h) {
  const re = /<(\/?)([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g; let m; const stack = [root];
  const VOID = new Set(["br", "input", "img", "meta", "link"]);
  while ((m = re.exec(h))) {
    if (m[4]) { const top = stack[stack.length - 1]; const t = new El("#text"); t._text = m[4]; t.isText = true; top.children.push(t); t.parent = top; continue; }
    if (m[1]) { if (stack.length > 1) stack.pop(); continue; }
    const e = new El(m[2]); const ar = /([a-zA-Z-:]+)(?:="([^"]*)")?/g; let a;
    while ((a = ar.exec(m[3]))) { if (a[1] === "hidden") e.hidden = true; else e.setAttribute(a[1], a[2] ?? ""); }
    stack[stack.length - 1].appendChild(e);
    if (!VOID.has(m[2].toLowerCase()) && !m[3].trim().endsWith("/")) stack.push(e);
  }
}
function all(el, out = []) { el.children.forEach(c => { if (!c.isText) { out.push(c); all(c, out); } }); return out; }
function matchSimple(e, s) {
  const m = s.match(/^([a-zA-Z0-9]*)((?:#[\w-]+)?)((?:\.[\w-]+)*)((?:\[[^\]]+\])*)$/); if (!m) return false;
  if (m[1] && e.tagName !== m[1].toUpperCase()) return false;
  if (m[2] && e.id !== m[2].slice(1)) return false;
  if (m[3]) for (const c of m[3].split(".").filter(Boolean)) if (!e.classList.contains(c)) return false;
  return true;
}
function qsa(root, sel) {
  const parts = sel.trim().split(/\s+/);
  let cur = [root];
  for (const p of parts) { const next = []; cur.forEach(r => all(r).forEach(e => { if (matchSimple(e, p) && !next.includes(e)) next.push(e); })); cur = next; }
  return cur;
}
const body = new El("body");
parseInto(body, html.replace(/<script>[\s\S]*<\/script>/, "").replace(/<style>[\s\S]*<\/style>/, ""));
const store = new Map(); if (process.argv[3]) store.set("yageun-knight-v3", fs.readFileSync(process.argv[3], "utf8")); let rafCb = null; const intervals = []; let now = 1e6; let wall = +(process.env.WALL || Date.now());
const realNow = Date.now;
class FakeDate extends Date { constructor(...a) { if (a.length) super(...a); else super(wall); } static now() { return wall; } }
global.Date.now = () => wall;
const document = { hidden: false, activeElement: null, getElementById: id => qsa(body, "#" + id)[0] || null, createElement: t => new El(t), createTextNode: t => { const e = new El("#text"); e._text = t; e.isText = true; return e; }, querySelectorAll: s => qsa(body, s), addEventListener(t, f) { (docL[t] = docL[t] || []).push(f); } }; const docL = {};
const window = { matchMedia: () => ({ matches: false }), scrollTo() {}, claude: undefined };
const sandbox = { document, window, localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, v) },
  requestAnimationFrame: f => { rafCb = f; }, matchMedia: () => ({ matches: false }), performance: { now: () => now }, setInterval: (f, ms) => intervals.push(f), setTimeout: (f) => { try { f(); } catch (e) { errors.push("timeout: " + e.stack); } }, clearTimeout() {}, console, Math, Date: FakeDate };
const script = html.match(/<script>([\s\S]*)<\/script>/)[1].replace("const $ = id => document.getElementById(id);", "const $ = id => document.getElementById(id); window.__ev = c => eval(c);");
const fn = new Function(...Object.keys(sandbox), script);
try { fn(...Object.values(sandbox)); } catch (e) { errors.push("boot: " + e.stack); }
const $ = id => document.getElementById(id);
function run(ms) { const end = now + ms; while (now < end) { now += 50; wall += 50; const cb = rafCb; rafCb = null; try { cb && cb(now); } catch (e) { errors.push("frame: " + e.stack); break; } } intervals.forEach(f => { try { f(); } catch (e) { errors.push("interval: " + e.stack); } }); }
const S = () => JSON.parse(store.get("yageun-knight-v3") || "{}");
const clickAll = (sel) => qsa(body, sel).forEach(b => b.click());
const E = c => window.__ev(c);
const txt = id => ($(id) ? $(id).textContent.replace(/\s+/g, " ").trim() : "(none)");
const tabs = () => qsa(body, "#tabs button");
// v34부터 아래 메뉴는 묶음 5개: 화면 이름으로 부르면 머리띠 작은 메뉴 버튼(data-t)을 먼저 찾음
const TAB_ID = { "무기": "weapon", "말씀": "bible", "암송": "mem", "공부": "study", "동료": "pet", "옷장": "suit", "정장": "suit", "보물": "treasure", "업무": "daily", "정보": "info", "퇴사": "retire", "설정": "set" };
const T = n => { const id = TAB_ID[n], s = id && qsa(body, "#thSeg button").find(b => b.attrs["data-t"] === id); return s || tabs().find(t => t.textContent.startsWith(n)); };
run(1500); if ($("backGo") && !$("back").hidden) $("backGo").click(); run(300);
const out = (...a) => console.log(...a);
