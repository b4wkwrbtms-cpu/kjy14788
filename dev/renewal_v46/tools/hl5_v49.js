/* ================= v49: 영웅서기5 자료 불러오기 =================
   내 폰에 있는 영웅서기5 zip(또는 apk)을 한 번 고르면, 폰 안에서 캐릭터·몬스터·보스·이펙트 그림과 동작을 꺼내
   이 폰(IndexedDB)에만 두고 씀. 게임 자료는 저장소·사이트·서버 어디에도 올라가지 않음 — 여기 있는 건 읽는 코드뿐.
   · 꺼내기: 우리 에뮬레이터(hl5x.wasm)로 게임 자체의 자료 읽기 함수를 불러 씀
   · 그리기: 조각 가운데 기준 · 뒤집기 · 크기 · 시계 방향 회전 · 투명도 · 합성 방식 (게임의 그리기와 대조해 맞춘 규칙)
   · 화면 다듬기: 영웅서기5 플레이어에서 쓰던 가장자리 방향 확대(선명하게) + 프레임 사이 이어 그리기(부드럽게) */
var HL5_WASM_B64 = "__HL5X_WASM_B64__";
var HL5_K = 4;                                    // 그림 다듬기 배율
var HL5_BLEND = { 1: "darken", 2: "lighten", 3: "multiply", 4: "screen", 5: "color-dodge", 6: "color-burn", 7: "lighter", 8: "multiply", 11: "hard-light", 14: "difference" };
var HL5_HDIR = 2;                                 // 방향: 0 뒷모습 · 1 앞모습 · 2 오른쪽 옆모습 (왼쪽은 좌우 뒤집기)
var HL5_CLS = {                                   // 직업별 동작 번호
  knight: { cif: "001", idle: 2, atk: [9, 10, 11], sk: [16, 17, 23, 14] },
  rogue: { cif: "002", idle: 2, atk: [9, 10, 11, 12], sk: [16, 15, 22, 27] },
  gunner: { cif: "003", idle: 2, atk: [9, 10, 13], sk: [11, 18, 20, 22] },
  axe: { cif: "004", idle: 2, atk: [9, 10, 11, 12], sk: [13, 21, 22, 26] },
};
var HL5_CLS_ORDER = ["knight", "rogue", "gunner", "axe"];
var HL5_JOB = { sales: "knight", dev: "rogue", plan: "gunner", hr: "axe", audit: "gunner" };   // 직무 → 영웅서기5 직업
var HL5_BIG = ["악몽의 잔해", "불완전 강림자", "죽은자의 왕", "극의 주인", "악몽의 감시자", "크레이지 머신", "빙의된 루퍼스", "알테나"];   // 100층마다 나오는 큰 보스
var hl5 = { ready: false, busy: false, msg: "", files: null, banks: {}, cifs: {}, types: {}, heroT: {}, lists: null, effB: null, fx: [], fxT: 0, tmp: null, warm: [], h: { seq: 0, sk: -1, skT: -1e9, skI: 0, cur: null, from: null, fromT: 0, last: null, atkT: 0, gap: 600 } };

function hl5Use() { try { return fxSet().hl5 !== 0; } catch (e) { return false; } }
function hl5On() { return hl5.ready && hl5Use(); }
function hl5Hd() { try { return fxSet().hl5hd !== 0; } catch (e) { return true; } }
function hl5Pad3(n) { return String(n).padStart(3, "0"); }

/* ---------- 폰 안 저장소 ---------- */
function hl5Db() { return new Promise((res, rej) => { const r = indexedDB.open("kjy_hl5", 1); r.onupgradeneeded = () => r.result.createObjectStore("pack"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function hl5DbDo(mode, fn) { const db = await hl5Db(); return new Promise((res, rej) => { const q = fn(db.transaction("pack", mode).objectStore("pack")); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }

/* ---------- zip 읽기 (zip 안의 apk 안의 파일까지) ---------- */
function hl5ZipList(u8) {
  if (u8.length < 22) return null;
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); let e = -1;
  for (let i = u8.length - 22, lo = Math.max(0, u8.length - 66000); i >= lo; i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) return null;
  const n = dv.getUint16(e + 10, true), out = [], td = new TextDecoder(); let o = dv.getUint32(e + 16, true);
  for (let i = 0; i < n && o + 46 <= u8.length; i++) {
    if (dv.getUint32(o, true) !== 0x02014b50) break;
    const nl = dv.getUint16(o + 28, true), xl = dv.getUint16(o + 30, true), cl = dv.getUint16(o + 32, true);
    out.push({ name: td.decode(u8.subarray(o + 46, o + 46 + nl)), method: dv.getUint16(o + 10, true), cs: dv.getUint32(o + 20, true), lo: dv.getUint32(o + 42, true) });
    o += 46 + nl + xl + cl;
  }
  return out;
}
async function hl5ZipData(u8, en) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), o = en.lo, st = o + 30 + dv.getUint16(o + 26, true) + dv.getUint16(o + 28, true), raw = u8.subarray(st, st + en.cs);
  if (en.method === 0) return raw;
  if (en.method !== 8 || typeof DecompressionStream !== "function") throw new Error("이 zip은 풀 수 없어요");
  return new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
}
async function hl5FindGame(u8, depth) {
  const list = hl5ZipList(u8); if (!list) return null;
  const so = list.find(e => /(^|\/)lib\/armeabi[^/]*\/libHeroesLore5\.so$/.test(e.name)), vfs = list.find(e => /(^|\/)assets\/data\.vfs\.mp3$/.test(e.name));
  if (so && vfs) return { so: await hl5ZipData(u8, so), vfs: await hl5ZipData(u8, vfs) };
  if ((depth | 0) >= 2) return null;
  for (const e of list) if (/\.(apk|zip)$/i.test(e.name)) { const r = await hl5FindGame(await hl5ZipData(u8, e), (depth | 0) + 1); if (r) return r; }
  return null;
}

/* ---------- 꺼내기: 게임의 자료 읽기 함수(StaticUtil::LoadRes)를 에뮬레이터에서 부름 ---------- */
async function hl5Extract(so, vfs, onp) {
  const bin = Uint8Array.from(atob(HL5_WASM_B64), c => c.charCodeAt(0)); let mem;
  const env = {
    host_log() {}, host_now: () => Date.now(), host_pow: Math.pow, host_audio: () => 0, host_file_saved() {}, host_file_deleted() {},
    host_vfs_read: (off, dst, len) => { const s = vfs.subarray(off, off + len); new Uint8Array(mem.buffer, dst, s.length).set(s); return s.length; },
    host_event: k => (k === 4 ? 1 : 0),
  };
  const ex = (await WebAssembly.instantiate(bin, { env })).instance.exports; mem = ex.memory;
  const put = b => { const p = ex.host_alloc(b.length); new Uint8Array(mem.buffer, p, b.length).set(b); return p; };
  const enc = s => { const b = new Uint8Array(s.length + 1); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 255; return b; };
  const sp = put(so);
  if (ex.load_library(sp, so.length) !== 0) throw new Error("게임 파일을 읽지 못했어요");
  ex.set_native_hooks(1); ex.set_vfs_size(vfs.length); ex.app_start(800, 480, 400, 240, 2.0, 1);
  const LR = ex.find_symbol(put(enc("_ZN10StaticUtil7LoadResEPcPi")));
  if (!LR) throw new Error("이 파일은 영웅서기5가 아니에요");
  const G = a => ex.guest_base() + (a & 0x3ffffff), sz = ex.guest_malloc(4), pbuf = ex.guest_malloc(256), ap = ex.host_alloc(8);
  const paths = [];
  for (let d = 0; d <= 6; d++) for (let i = 0; i < 160; i++) paths.push(`/c/sp/img${d}/${hl5Pad3(i)}.mgr`);
  for (let i = 0; i < 200; i++) paths.push(`/c/sp/cif/${hl5Pad3(i)}.cif`);
  for (let i = 0; i < 640; i++) paths.push(`/c/sp/pal/${hl5Pad3(i)}.pal`);
  ["eff", "imo"].forEach(n => { paths.push(`/c/sp/imgcom/${n}.mgr`); paths.push(`/c/sp/cif/${n}.cif`); });
  paths.push("/c/csv/enemy_0.dat", "/c/csv/enemy_g.dat");
  const got = []; let total = 0;
  for (let i = 0; i < paths.length; i++) {
    const b = enc(paths[i]); new Uint8Array(mem.buffer, G(pbuf), b.length).set(b); new DataView(mem.buffer).setInt32(G(sz), 0, true);
    const av = new Uint32Array(mem.buffer, ap, 2); av[0] = pbuf; av[1] = sz;
    const r = ex.guest_call(LR, 2, ap) >>> 0, len = new DataView(mem.buffer).getInt32(G(sz), true);
    if (ex.is_halted()) break;
    if (r && len > 0 && len < (8 << 20)) { got.push([paths[i], new Uint8Array(mem.buffer, G(r), len).slice()]); total += len; }
    if (i % 50 === 49) { if (onp) onp(i + 1, paths.length); await new Promise(z => setTimeout(z, 0)); }
  }
  const buf = new Uint8Array(total), idx = []; let o = 0;
  got.forEach(([p, d]) => { buf.set(d, o); idx.push([p, o, d.length]); o += d.length; });
  return { v: 1, idx, buf };
}

/* ---------- 묶음 읽기: 몬스터 목록 · 그림 묶음(.mgr) · 색 바꿈(.pal) · 동작(.cif) ---------- */
function hl5Recs(b) {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength), n = dv.getUint16(0, true), out = []; let o = 2;
  for (let i = 0; i < n && o + 2 <= b.length; i++) { const L = dv.getUint16(o, true); out.push(b.subarray(o + 2, o + 2 + L)); o += 2 + L; }
  return out;
}
function hl5Load(pack) {
  const files = new Map(); pack.idx.forEach(([p, o, n]) => files.set(p, pack.buf.subarray(o, o + n)));
  hl5.files = files; hl5.banks = {}; hl5.cifs = {}; hl5.types = {}; hl5.heroT = {}; hl5.effB = null; hl5.fx.length = 0; hl5.ready = false; hl5.lists = null;
  const E = files.get("/c/csv/enemy_0.dat"), Gd = files.get("/c/csv/enemy_g.dat"); if (!E || !Gd) return false;
  const er = hl5Recs(E), gr = hl5Recs(Gd), s8 = v => (v > 127 ? v - 256 : v), all = []; let td; try { td = new TextDecoder("euc-kr"); } catch (e) { td = new TextDecoder(); }
  for (let i = 0; i < er.length && i < gr.length; i++) {
    const e = er[i], g = gr[i], nl = e[0], raw = td.decode(e.subarray(1, 1 + nl)), dv = new DataView(g.buffer, g.byteOffset, g.byteLength), banks = [], pals = [];
    if (g.length < 24) continue;
    for (let k = 0; k < 9; k++) banks.push(s8(g[3 + k]));
    for (let k = 0; k < 6; k++) pals.push(dv.getInt16(12 + 2 * k, true));
    all.push({ i, raw, name: raw.replace(/^[\^'\[]+/, "").replace(/\{+$/, "").trim(), grade: e[1 + nl], cif: s8(g[0]), banks, pals });
  }
  const seen = new Set(), uniq = a => a.filter(e => { const k = e.cif + "|" + e.banks.join(",") + "|" + e.pals.join(","); if (seen.has(k) || e.cif < 0 || !files.has(`/c/sp/cif/${hl5Pad3(e.cif)}.cif`)) return false; seen.add(k); return true; });
  const boss = uniq(all.filter(e => e.grade === 3)), named = uniq(all.filter(e => e.grade === 1));
  const norm = uniq(all.filter(e => e.grade === 0 && e.raw[0] !== "[" && e.name !== "소환물" && e.name !== "지뢰"));
  const big = HL5_BIG.map(n => boss.find(e => e.name === n)).filter(Boolean);
  const box = all.find(e => e.cif === 97) || null;
  if (!norm.length) return false;
  hl5.lists = { all, norm, named: named.length ? named : norm, boss: boss.length ? boss : norm, big: big.length ? big : (boss.length ? boss : norm), box };
  hl5.ready = true; return true;
}
function hl5PalMap(pid) {
  const b = pid >= 0 ? hl5.files.get(`/c/sp/pal/${hl5Pad3(pid)}.pal`) : null; if (!b) return null;
  const m = new Map(), n = b[0]; for (let k = 0; k < n && 4 + 4 * k < b.length + 1; k++) m.set(b[1 + 4 * k] | (b[2 + 4 * k] << 8), b[3 + 4 * k] | (b[4 + 4 * k] << 8));
  return m;
}
function hl5Bank(slot, bank, pid) {
  const key = slot + ":" + bank + ":" + pid; if (hl5.banks[key] !== undefined) return hl5.banks[key];
  const path = typeof slot === "string" ? `/c/sp/imgcom/${slot}.mgr` : `/c/sp/img${slot > 6 ? 5 : slot}/${hl5Pad3(bank)}.mgr`, b = hl5.files.get(path);
  if (!b || b.length < 4) return (hl5.banks[key] = null);
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength), n = dv.getUint32(0, true), out = [], remap = hl5PalMap(pid); let o = 4;
  for (let i = 0; i < n && o + 4 <= b.length; i++) { const size = dv.getUint32(o, true), rec = b.subarray(o + 4, o + 4 + size); o += 4 + size; out.push({ rec, remap, w: rec.length >= 6 ? rec[2] | (rec[3] << 8) : 0, h: rec.length >= 6 ? rec[4] | (rec[5] << 8) : 0, c: null }); }
  return (hl5.banks[key] = out);
}
function hl5Canvas(px, w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; c.getContext("2d").putImageData(new ImageData(px, w, h), 0, 0); return c; }
/* 그림 한 장: [형식][색 수][w][h][팔레트 RGB565][픽셀 색 번호], 투명색 0xf81f. 처음 쓸 때 풀고(선명하게면 4배로 다듬어) 캔버스로 둠 */
function hl5Img(im) {
  if (im.c === false) return false;
  if (!im.lo) {
    const rec = im.rec, w = im.w, h = im.h; if (w < 1 || h < 1 || (w <= 1 && h <= 1) || w > 1024 || h > 1024) return (im.c = false);
    const nc = rec[1] || 256, bits = nc <= 16 ? 4 : 8, base = 6 + 2 * nc, stride = bits === 4 ? (w + 1) >> 1 : w, px = new Uint8ClampedArray(w * h * 4), pal = new Int32Array(nc);
    for (let k = 0; k < nc; k++) { let c = rec[6 + 2 * k] | (rec[7 + 2 * k] << 8); if (c === 0xf81f) { pal[k] = -1; continue; } if (im.remap && im.remap.has(c)) c = im.remap.get(c); pal[k] = c === 0xf81f ? -1 : c; }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let ci;
      if (bits === 4) { const k = base + y * stride + (x >> 1); if (k >= rec.length) continue; ci = x & 1 ? rec[k] & 15 : rec[k] >> 4; }
      else { const k = base + y * w + x; if (k >= rec.length) continue; ci = rec[k]; }
      const c = ci < nc ? pal[ci] : -1; if (c < 0) continue;
      const o = (y * w + x) * 4; px[o] = ((c >> 11) & 31) * 255 / 31 | 0; px[o + 1] = ((c >> 5) & 63) * 255 / 63 | 0; px[o + 2] = (c & 31) * 255 / 31 | 0; px[o + 3] = 255;
    }
    im.lo = hl5Canvas(px, w, h); im.px = px;
  }
  if (hl5Hd() && im.w * im.h <= 40000) { if (im.hd) return im.hd; if (!im.q) { im.q = 2; hl5.warm.unshift(im); } else if (im.q === 1) { im.q = 2; const i = hl5.warm.indexOf(im); if (i > 0) { hl5.warm.splice(i, 1); hl5.warm.unshift(im); } } }
  return im.lo;
}
/* 선명하게 다듬기: 한 프레임에 ms만큼만 (화면에 보이는 그림 먼저) */
function hl5WarmStep(ms) {
  const t0 = performance.now();
  while (hl5.warm.length && performance.now() - t0 < ms) {
    const im = hl5.warm.shift(); if (im.hd || im.c === false) continue;
    try { if (!im.lo) hl5Img(im); if (im.px && hl5Hd()) im.hd = hl5Canvas(hl5Xbr(im.px, im.w, im.h, HL5_K), im.w * HL5_K, im.h * HL5_K); } catch (e) {}
    im.px = null;
  }
}
/* 이 캐릭터가 쓸 그림을 미리 줄 세움(아직 다듬지 않음 — 다듬기는 쉬는 틈에) */
function hl5Prewarm(cif, banks, dir) {
  if (!hl5Hd()) return; const seen = new Set();
  cif.motions.forEach(m => { const d = m[Math.min(dir, m.length - 1)]; (d || []).forEach(fr => fr.forEach(p => { const bk = banks[p.slot], im = bk && bk[p.idx]; if (!im || seen.has(im) || im.hd || im.q) return; seen.add(im); im.q = 1; hl5.warm.push(im); })); });
}
function hl5ClearImg() { hl5.warm.length = 0; Object.keys(hl5.banks).forEach(k => { const b = hl5.banks[k]; if (b) b.forEach(im => { if (im.c !== false) { im.c = null; im.lo = null; im.hd = null; im.px = null; im.q = 0; } }); }); }
/* 가장자리 방향 확대 (영웅서기5 플레이어의 화면 다듬기를 그림 한 장 단위로 옮김):
   ① 픽셀의 네 모서리마다 '가장자리 건너편인지'를 두 대각선 방향의 이웃이 얼마나 잘 이어지는지로 정하고(45°·2:1 기울기 구분)
   ② 확대한 자리에서 그 모서리 쪽만 이웃 색으로, 가장자리 선을 따라 좁게 부드럽게 넘김. 투명한 곳도 하나의 색처럼 다뤄 윤곽이 매끈해짐 */
function hl5Xbr(src, w, h, K) {
  const N = w * h, Y = new Float32Array(N), U = new Float32Array(N), V = new Float32Array(N);
  for (let i = 0; i < N; i++) { const r = src[i * 4] / 255, g = src[i * 4 + 1] / 255, b = src[i * 4 + 2] / 255; Y[i] = 0.299 * r + 0.587 * g + 0.114 * b; U[i] = -0.169 * r - 0.331 * g + 0.5 * b; V[i] = 0.5 * r - 0.419 * g - 0.081 * b; }
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h || !src[(y * w + x) * 4 + 3] ? -1 : y * w + x);
  const wd = (i, j) => (i < 0 ? (j < 0 ? 0 : 64) : j < 0 ? 64 : 48 * Math.abs(Y[i] - Y[j]) + 7 * Math.abs(U[i] - U[j]) + 6 * Math.abs(V[i] - V[j]));
  const eq = (i, j) => wd(i, j) < 2.4;
  const corner = (E, B, D, F, H, C, G, I, F4, H5, I4, I5) => {
    if (eq(E, F) || eq(E, H)) return 0;
    if (!((!eq(F, B) && !eq(H, D)) || (eq(E, I) && !eq(F, I4) && !eq(H, I5)) || eq(E, G) || eq(E, C))) return 0;
    if (wd(E, C) + wd(E, G) + wd(I, F4) + wd(I, H5) + 4 * wd(H, F) >= wd(H, D) + wd(H, I5) + wd(F, I4) + wd(F, B) + 4 * wd(E, I)) return 0;
    let v = 1; const fg = wd(F, G), hc = wd(H, C);
    if (2 * fg <= hc && !eq(E, G) && !eq(D, G)) v += 2;
    if (fg >= 2 * hc && !eq(E, C) && !eq(B, C)) v += 4;
    if (wd(E, F) > wd(E, H)) v += 8;
    return v;
  };
  const W2 = w * K, out = new Uint8ClampedArray(W2 * h * K * 4), d = 0.5 / K, a1 = 0.5 - d * 1.414, b1 = 0.5 + d * 1.414, a2 = 0.25 - d * 1.118, b2 = 0.25 + d * 1.118;
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let best = 0, col = -1;
  const apply = (v, s, t, F, H) => {
    if (!v) return;
    let m = ss(a1, b1, s + t);
    if (v & 2) m = Math.max(m, ss(a2, b2, t + 0.5 * s));
    if (v & 4) m = Math.max(m, ss(a2, b2, s + 0.5 * t));
    if (m > best) { best = m; col = v >= 8 ? H : F; }
  };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const A1 = at(x - 1, y - 2), B1 = at(x, y - 2), C1 = at(x + 1, y - 2), A0 = at(x - 2, y - 1), A = at(x - 1, y - 1), B = at(x, y - 1), C = at(x + 1, y - 1), C4 = at(x + 2, y - 1);
    const D0 = at(x - 2, y), D = at(x - 1, y), E = at(x, y), F = at(x + 1, y), F4 = at(x + 2, y), G0 = at(x - 2, y + 1), G = at(x - 1, y + 1), H = at(x, y + 1), I = at(x + 1, y + 1), I4 = at(x + 2, y + 1);
    const G5 = at(x - 1, y + 2), H5 = at(x, y + 2), I5 = at(x + 1, y + 2);
    if (E < 0 && D < 0 && F < 0 && B < 0 && H < 0) continue;
    const c0 = corner(E, B, D, F, H, C, G, I, F4, H5, I4, I5), c1 = corner(E, D, H, B, F, A, I, C, B1, F4, C1, C4), c2 = corner(E, H, F, D, B, G, C, A, D0, B1, A0, A1), c3 = corner(E, F, B, H, D, I, A, G, H5, D0, G5, G0);
    const any = c0 | c1 | c2 | c3, e4 = E * 4;
    if (!any && E < 0) continue;
    for (let sy = 0; sy < K; sy++) for (let sx = 0; sx < K; sx++) {
      const o = ((y * K + sy) * W2 + x * K + sx) * 4;
      if (!any) { out[o] = src[e4]; out[o + 1] = src[e4 + 1]; out[o + 2] = src[e4 + 2]; out[o + 3] = 255; continue; }
      const fx = (sx + 0.5) / K - 0.5, fy = (sy + 0.5) / K - 0.5; best = 0; col = E;
      apply(c0, fx, fy, F, H); apply(c1, -fy, fx, B, F); apply(c2, -fx, -fy, D, B); apply(c3, fy, -fx, H, D);
      const ea = E < 0 ? 0 : 1 - best, ca = col < 0 ? 0 : best, a = ea + ca; if (a <= 0.003) continue;
      const c4 = col * 4;
      out[o] = ((E < 0 ? 0 : src[e4] * ea) + (col < 0 ? 0 : src[c4] * ca)) / a; out[o + 1] = ((E < 0 ? 0 : src[e4 + 1] * ea) + (col < 0 ? 0 : src[c4 + 1] * ca)) / a;
      out[o + 2] = ((E < 0 ? 0 : src[e4 + 2] * ea) + (col < 0 ? 0 : src[c4 + 2] * ca)) / a; out[o + 3] = a * 255;
    }
  }
  return out;
}
/* 동작 파일: [묶음 수][묶음 번호…][동작 수] 동작마다 [방향 수] 방향마다 [프레임 수] 프레임마다 [조각 수] 조각 4/9바이트(영웅 형식은 5/10) */
function hl5CifParse(b, flag) {
  const s8 = v => (v > 127 ? v - 256 : v); let o = 0;
  const n0 = s8(b[o++]), imgs = []; for (let i = 0; i < n0; i++) imgs.push(b[o++]);
  const M = b[o++], motions = [];
  for (let m = 0; m < M; m++) {
    const D = s8(b[o++]), dirs = [];
    for (let d = 0; d < D; d++) {
      const L = b[o++], frames = [];
      for (let l = 0; l < L; l++) {
        const P = s8(b[o++]), parts = [];
        for (let p = 0; p < P; p++) {
          if (o >= b.length) throw new Error("cif");
          const fl = b[o], big = fl & 0x80, q = { slot: fl & 15, idx: b[o + 1], x: 0, y: 0, sx: 1, sy: 1, rot: 0, a: 1, bl: 0, hf: !!(fl & 0x20), vf: !!(fl & 0x40) }; let e;
          if (flag) { const v1 = (b[o + 2] << 4) | (b[o + 3] >> 4), v2 = ((b[o + 3] & 15) << 8) | b[o + 4]; q.x = v1 >= 2048 ? v1 - 4096 : v1; q.y = v2 >= 2048 ? v2 - 4096 : v2; e = o + 5; }
          else { q.x = s8(b[o + 2]); q.y = s8(b[o + 3]); e = o + 4; }
          if (big) { const md = b[e + 4]; q.sx = b[e] / 25; q.sy = b[e + 1] / 25; q.rot = b[e + 2] * 2; q.a = b[e + 3] / 255; q.bl = md >> 2; if ((md & 3) === 1) q.hf = true; else if (md & 3) q.vf = true; e += 5; }
          parts.push(q); o = e;
        }
        frames.push(parts);
      }
      dirs.push(frames);
    }
    motions.push(dirs);
  }
  return { imgs, motions, used: o };
}
function hl5Cif(name) {
  if (hl5.cifs[name] !== undefined) return hl5.cifs[name];
  const b = hl5.files.get(`/c/sp/cif/${name}.cif`); let r = null;
  if (b) for (const flag of [0, 1]) { try { const c = hl5CifParse(b, flag); if (c.used === b.length) { r = c; break; } } catch (e) {} }
  return (hl5.cifs[name] = r);
}
function hl5Frames(cif, mi, dir) { const m = cif.motions[mi]; return m && m.length ? m[Math.min(dir, m.length - 1)] : null; }

/* ---------- 조립해 그리기: 조각 그림의 가운데가 (x, y). 다음 프레임과 같은 조각은 자리·각도·크기·투명도를 이어 그림(부드럽게) ---------- */
function hl5Layer(g, parts, next, u, banks, plain) {
  const sm = g.imageSmoothingEnabled; g.imageSmoothingEnabled = hl5Hd();
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]; if (plain && p.bl) continue;
    const bk = banks[p.slot], im = bk && bk[p.idx]; if (!im) continue; const c = hl5Img(im); if (!c) continue;
    let x = p.x, y = p.y, sx = p.sx, sy = p.sy, rot = p.rot, a = p.a;
    if (next && u > 0.002) {
      let q = next[i];
      if (!q || q.slot !== p.slot || q.idx !== p.idx || q.hf !== p.hf || q.vf !== p.vf || q.bl !== p.bl) { q = null; for (let j = 0; j < next.length; j++) { const n = next[j]; if (n.slot === p.slot && n.idx === p.idx && n.hf === p.hf && n.vf === p.vf && n.bl === p.bl) { q = n; break; } } }
      if (q) { if (Math.abs(q.x - x) + Math.abs(q.y - y) < 48) { x += (q.x - x) * u; y += (q.y - y) * u; sx += (q.sx - sx) * u; sy += (q.sy - sy) * u; rot += (((q.rot - rot + 540) % 360) - 180) * u; a += (q.a - a) * u; } }
      else if (p.bl) a *= 1 - u * 0.5;
    }
    if (a <= 0.004 || !sx || !sy) continue;
    g.save(); g.translate(x, y); if (rot) g.rotate(rot * Math.PI / 180); g.scale(p.hf ? -sx : sx, p.vf ? -sy : sy);
    if (a < 1) g.globalAlpha *= a; if (p.bl) g.globalCompositeOperation = HL5_BLEND[p.bl] || "source-over";
    g.drawImage(c, p.hf ? -(im.w - (im.w >> 1)) : -(im.w >> 1), p.vf ? -(im.h - (im.h >> 1)) : -(im.h >> 1), im.w, im.h);
    g.restore();
  }
  g.imageSmoothingEnabled = sm;
}
function hl5Pose(frames, pos, loop) {
  const n = frames.length; let f0 = Math.floor(pos), u = pos - f0, f1;
  if (loop) { f0 = ((f0 % n) + n) % n; f1 = (f0 + 1) % n; } else { if (f0 >= n - 1) { f0 = n - 1; u = 0; } if (f0 < 0) { f0 = 0; u = 0; } f1 = Math.min(n - 1, f0 + 1); }
  if (typeof reduceMotion !== "undefined" && reduceMotion) u = 0;
  return [frames[f0], f1 !== f0 ? frames[f1] : null, u];
}
function hl5Draw(g, a, b, u, banks, ox, oy, sc, flip, tint) {
  if (!a) return;
  if (!tint) { g.save(); g.translate(ox, oy); g.scale(flip ? -sc : sc, sc); hl5Layer(g, a, b, u, banks, false); g.restore(); return; }
  /* 흰 번쩍임·빨간 물듦: 몸만 따로 그려 한 색으로 채움 */
  const SZ = 360, R = 1.5, T = hl5.tmp || (hl5.tmp = document.createElement("canvas")); if (T.width !== SZ * R) { T.width = SZ * R; T.height = SZ * R; }
  const tg = T.getContext("2d"); tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = "source-over"; tg.globalAlpha = 1; tg.clearRect(0, 0, T.width, T.height);
  tg.setTransform(R, 0, 0, R, SZ * R / 2, SZ * R * 0.8); hl5Layer(tg, a, b, u, banks, true);
  tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = "source-in"; tg.fillStyle = tint; tg.fillRect(0, 0, T.width, T.height);
  g.save(); g.translate(ox, oy); g.scale(flip ? -sc : sc, sc); g.drawImage(T, -SZ / 2, -SZ * 0.8, SZ, SZ); g.restore();
}
function hl5Anim(g, frames, pos, loop, banks, ox, oy, sc, flip, tint) { if (!frames.length) return; const [a, b, u] = hl5Pose(frames, pos, loop); hl5Draw(g, a, b, u, banks, ox, oy, sc, flip, tint); }
/* 동작 재생기: 원작처럼 일정한 속도로 끝까지 보여 주고, 다음 동작으로 넘어갈 때 앞 자세에서 90ms 동안 이어 감 */
const HL5_BLEND_MS = 90;
function hl5Set(st, tag, fr, rate, loop, now) {
  if (!fr || !fr.length) return;
  if (st.cur && st.cur.tag === tag && st.cur.fr === fr && (loop || now - st.cur.t0 < 30)) return;
  if (st.last) { st.from = st.last; st.fromT = now; }
  st.cur = { tag, fr, rate, loop, t0: now };
}
function hl5Done(st, now) { const c = st.cur; return !c || (!c.loop && (now - c.t0) / 1000 * c.rate >= c.fr.length); }
function hl5Play(st, g, banks, ox, oy, sc, flip, tint, now) {
  const c = st.cur; if (!c) return;
  const [a, b, u] = hl5Pose(c.fr, (now - c.t0) / 1000 * c.rate, c.loop);
  if (st.from && now - st.fromT < HL5_BLEND_MS) { const k = (now - st.fromT) / HL5_BLEND_MS; hl5Draw(g, st.from, a, k * k * (3 - 2 * k), banks, ox, oy, sc, flip, tint); }
  else { st.from = null; hl5Draw(g, a, b, u, banks, ox, oy, sc, flip, tint); }
  st.last = a;
}

/* ---------- 곽준영: 직무에 따라 영웅서기5 직업 모습 ---------- */
function hl5HeroCls() {
  const f = fxSet().hl5c | 0; if (f >= 1 && f <= 4) return HL5_CLS[HL5_CLS_ORDER[f - 1]];
  const pv = typeof jobPreviewId === "function" ? jobPreviewId() : "", j = pv || (typeof curJob === "function" && curJob() ? curJob().id : "");
  return HL5_CLS[HL5_JOB[j] || "knight"];
}
function hl5HeroT(cls) {
  if (hl5.heroT[cls.cif] !== undefined) return hl5.heroT[cls.cif];
  const cif = hl5Cif(cls.cif); if (!cif || !hl5Frames(cif, cls.idle, HL5_HDIR)) return (hl5.heroT[cls.cif] = null);
  const banks = {}; cif.imgs.forEach((n, k) => { const b = hl5Bank(k, n, -1); if (b) banks[k] = b; });
  return (hl5.heroT[cls.cif] = { cif, banks });
}
function hl5HeroAtk() {
  const H = hl5.h, now = performance.now();
  if (H.atkT) { const g = now - H.atkT; if (g > 60 && g < 3000) H.gap += (g - H.gap) * 0.35; }
  H.atkT = now; H.seq++; H.atkQ = true;
}
function hl5DrawHero(hx, hy, hs) {
  const cls = hl5HeroCls(), T = hl5HeroT(cls); if (!T) return false;
  if (T.warmed !== true) { T.warmed = true; hl5Prewarm(T.cif, T.banks, HL5_HDIR); }
  const now = performance.now(), H = hl5.h, cx = hx + 10 * hs, fy = hy + 24 * hs, HS = 2.3;
  if (H.cls !== cls) { H.cls = cls; H.cur = null; H.from = null; H.last = null; }
  if (H.skQ) { H.skQ = false; const f = hl5Frames(T.cif, H.sk, HL5_HDIR); if (f) hl5Set(H, "sk" + H.sk, f, 15, false, now); }
  else if (H.atkQ) {
    H.atkQ = false;
    const busySk = H.cur && H.cur.tag.startsWith("sk") && !hl5Done(H, now);
    const f = hl5Frames(T.cif, cls.atk[H.seq % cls.atk.length], HL5_HDIR);
    if (f && !busySk) hl5Set(H, "atk" + H.seq, f, Math.max(14, Math.min(30, f.length / (Math.max(120, H.gap) / 1000 * 0.92))), false, now);
  }
  if (hl5Done(H, now)) hl5Set(H, "idle", hl5Frames(T.cif, cls.idle, HL5_HDIR), 10, true, now);
  ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(cx - 24, GROUND - 3, 48, 6);
  const keep = { from: H.from, fromT: H.fromT, last: H.last };
  reflect(() => hl5Play(H, ctx, T.banks, cx, fy, HS, false, null, now));
  H.from = keep.from; H.fromT = keep.fromT; H.last = keep.last;
  hl5Play(H, ctx, T.banks, cx, fy, HS, false, null, now);
  heroHand.x = cx + 34; heroHand.y = fy - 46; fHero.sh.x = cx + 6; fHero.sh.y = fy - 52;
  return true;
}

/* ---------- 몬스터·보스: 층에 따라 영웅서기5 몬스터를 고름 ---------- */
function hl5Pick(m) {
  const L = hl5.lists, f = S.floor | 0, k = S.k | 0;
  if (mode === "vault") return L.box;
  if (mode !== "tower") return null;
  if (m.kind >= 3) return L.big[Math.max(0, Math.round(f / 100) - 1) % L.big.length];
  if (m.kind === 2) return L.boss[Math.max(0, Math.floor(f / 10) - 1) % L.boss.length];
  const zn = typeof zoneNo === "function" ? zoneNo(f) | 0 : Math.floor(f / 50);
  if (m.kind === 1) return L.named[(zn * 2 + (f & 1)) % L.named.length];
  return L.norm[(Math.floor(Math.max(0, f - 1) / 10) * 2 + (f + k) % 4) % L.norm.length];   // 10층마다 두 종씩 새 몬스터
}
function hl5MonType(e, kind) {
  const key = e.i + "_" + kind; if (hl5.types[key] !== undefined) return hl5.types[key];
  const cif = hl5Cif(hl5Pad3(e.cif)); if (!cif || !cif.motions.length || !cif.motions[0].length) return (hl5.types[key] = null);
  const banks = {}; e.banks.forEach((b, k) => { if (b >= 0) { const bk = hl5Bank(k, b, k < 6 ? e.pals[k] : -1); if (bk) banks[k] = bk; } });
  const nd = cif.motions[0].length, dir = nd >= 3 ? 2 : nd === 2 ? 1 : 0, flip = nd >= 3, fr0 = hl5Frames(cif, 0, dir)[0] || [];
  let x0 = 1e9, x1 = -1e9, y0 = 1e9;
  fr0.forEach(p => { if (p.bl) return; const bk = banks[p.slot], im = bk && bk[p.idx]; if (!im || (im.w <= 1 && im.h <= 1)) return; const hw = im.w * p.sx / 2, hh = im.h * p.sy / 2; x0 = Math.min(x0, p.x - hw); x1 = Math.max(x1, p.x + hw); y0 = Math.min(y0, p.y - hh); });
  if (x1 <= x0) return (hl5.types[key] = null);
  const pw = Math.max(8, Math.max(-x0, x1) * 2), ph = Math.max(8, -y0);
  let ms = [2.4, 3, 3.2, 3.8][Math.max(0, Math.min(3, kind))]; ms = Math.min(ms, 215 / ph, 300 / pw); if (ph * ms < 60) ms = Math.min(5, 60 / ph);
  const T = { key, e, cif, banks, dir, flip, ms, w: pw * ms, h: ph * ms };
  /* 칸 그림: 크기 계산과 '부서지는 몸'에 쓰는 굵은 실루엣 (원래 게임 그림 형식에 맞춤) */
  const CELL = 4, cols = Math.max(2, Math.ceil(T.w / CELL)), rows = Math.max(2, Math.ceil(T.h / CELL)), c = document.createElement("canvas"); c.width = cols; c.height = rows;
  const g = c.getContext("2d"); g.setTransform(cols / pw, 0, 0, rows / ph, cols / 2, rows); if (flip) g.scale(-1, 1); hl5Layer(g, fr0, null, 0, banks, true);
  const d = g.getImageData(0, 0, cols, rows).data, cnt = new Map();
  for (let i = 0; i < cols * rows; i++) if (d[i * 4 + 3] >= 110) { const kk = ((d[i * 4] >> 5) << 6) | ((d[i * 4 + 1] >> 5) << 3) | (d[i * 4 + 2] >> 5); cnt.set(kk, (cnt.get(kk) || 0) + 1); }
  const AB = "gabcdfhijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", keys = [...cnt.keys()].sort((a, b) => cnt.get(b) - cnt.get(a)), chOf = new Map(), pal = {};
  keys.forEach((kk, i) => { const ch = AB[Math.min(i, AB.length - 1)]; chOf.set(kk, ch); if (i < AB.length) pal[ch] = "#" + [(kk >> 6) & 7, (kk >> 3) & 7, kk & 7].map(v => ((v << 5) + 16).toString(16).padStart(2, "0")).join(""); });
  if (!pal.g) pal.g = "#c9cfe0";
  const map = [];
  for (let r = 0; r < rows; r++) { let row = ""; for (let cc = 0; cc < cols; cc++) { const i = r * cols + (cols - 1 - cc); row += d[i * 4 + 3] >= 110 ? chOf.get(((d[i * 4] >> 5) << 6) | ((d[i * 4 + 1] >> 5) << 3) | (d[i * 4 + 2] >> 5)) : "."; } map.push(row); }
  map.hl5 = T; T.spr = "hl5m" + key; T.pal = pal; SPR[T.spr] = map;
  return (hl5.types[key] = T);
}
function hl5Assign(m) {
  if (!hl5On() || !m || !hl5.lists || m.hl5) return false;
  let e = null, T = null; try { e = hl5Pick(m); T = e ? hl5MonType(e, m.kind | 0) : null; } catch (err) { T = null; }
  if (!T) return false;
  m.hl5 = { T, hitT: -1e9, atkT: performance.now() + 2200 + Math.random() * 3000, atkT0: 0, atkEnd: 0, atkF: null };
  m.sprite = T.spr; m.scale = 4; m.pal = T.pal;
  if (mode === "tower") {
    const f = S.floor | 0, pre = typeof cycleOf === "function" ? cycleOf(f) : "";
    m.name = (m.golden ? "황금 " : "") + pre + (m.kind === 2 && f % 50 === 0 ? "구역장 " : m.kind === 1 ? "우두머리 " : "") + e.name;
  }
  return true;
}
function hl5DrawMon(g, T, ox, oy, opts) {
  const now = performance.now(), live = mon && mon.hl5 && mon.hl5.T === T ? mon.hl5 : null, cif = T.cif;
  if (!T.warmed) { T.warmed = true; hl5Prewarm(cif, T.banks, T.dir); }
  const st = live || T.still || (T.still = {});
  const idle = hl5Frames(cif, 0, T.dir);
  if (live) {
    const dieF = hl5Frames(cif, 3, T.dir) || hl5Frames(cif, 5, T.dir), hitF = hl5Frames(cif, 2, T.dir);
    if (mon.dying > 0) return;   // 쓰러짐은 hl5.corpses에서 따로 그림
    else {
      if (now > st.atkT && cif.motions.length > 6 && !(typeof introBlocking === "function" && introBlocking())) {
        const cand = []; for (let i = 6; i < Math.min(cif.motions.length, 10); i++) { const a = hl5Frames(cif, i, T.dir); if (a && a.length >= 4) cand.push(a); }
        const f = cand.length ? cand[Math.floor(Math.random() * cand.length)] : null;
        if (f) hl5Set(st, "atk" + now, f, 13, false, now);
        st.atkT = now + (mon.kind >= 2 ? 2600 : 3600) + Math.random() * 3200 + (f ? f.length * 77 : 0);
      }
      const atking = st.cur && st.cur.tag.startsWith("atk") && !hl5Done(st, now);
      if (!atking && hitF && hitF.length && now - st.hitT < 260) hl5Set(st, "hit" + st.hitT, hitF, Math.max(10, hitF.length / 0.26), false, now);
      if (hl5Done(st, now) || (st.cur && st.cur.tag === "walk") || (st.cur && st.cur.tag === "idle")) {
        let dx = 0; try { dx = enterOffset().dx; } catch (e) {} const wf = Math.abs(dx) > 2 ? hl5Frames(cif, 1, T.dir) : null;
        if (wf && wf.length > 1) hl5Set(st, "walk", wf, 10, true, now); else if (hl5Done(st, now) || (st.cur && st.cur.tag === "walk")) hl5Set(st, "idle", idle, 8, true, now);
      }
    }
  } else if (!st.cur) hl5Set(st, "idle", idle, 8, true, now);
  if (!st.cur) return;
  const keep = { from: st.from, fromT: st.fromT, last: st.last };
  if (live && !opts.white && !opts.solid) { st.mat = g.getTransform(); st.ox = ox; st.oy = oy; }
  hl5Play(st, g, T.banks, ox, oy, T.ms, T.flip, opts.white ? "#ffffff" : opts.solid || null, now);
  if (opts.white || opts.solid) { st.from = keep.from; st.fromT = keep.fromT; st.last = keep.last; }
}

/* ---------- 공통 이펙트 (맞음·치명타·연기·먼지 고리) ---------- */
function hl5Fx(mi, x, y, sc, fps) { if (!hl5On() || hl5.fx.length > 28 || (typeof fx48K === "function" && fx48K() <= 0)) return; hl5.fx.push({ mi, x, y, sc: sc || 2.2, fps: fps || 16, t0: performance.now() }); }
function hl5DrawCorpses() {
  if (!hl5.corpses || !hl5.corpses.length) return; const now = performance.now();
  for (let i = hl5.corpses.length - 1; i >= 0; i--) {
    const c = hl5.corpses[i], el = now - c.t0, n = c.fr.length, end = n / 12 * 1000;
    if (el > end + 500) { hl5.corpses.splice(i, 1); continue; }
    ctx.save(); ctx.setTransform(c.mat); ctx.globalAlpha = el > end ? Math.max(0, 1 - (el - end) / 500) : 1;
    hl5Draw(ctx, ...hl5Pose(c.fr, el / 1000 * 12, false), c.T.banks, c.ox, c.oy, c.T.ms, c.T.flip, null);
    ctx.restore();
  }
}
function hl5DrawFx() {
  if (!hl5.fx.length) return;
  const cif = hl5On() ? hl5Cif("eff") : null, bank = cif ? hl5Bank("eff", 0, -1) : null; if (!bank) { hl5.fx.length = 0; return; }
  const B = hl5.effB || (hl5.effB = (() => { const o = {}; for (let k = 0; k < 16; k++) o[k] = bank; return o; })()), now = performance.now();
  for (let i = hl5.fx.length - 1; i >= 0; i--) {
    const f = hl5.fx[i], fr = hl5Frames(cif, f.mi, 0), pos = (now - f.t0) / 1000 * f.fps;
    if (!fr || pos >= fr.length) { hl5.fx.splice(i, 1); continue; }
    hl5Anim(ctx, fr, pos, false, B, f.x, f.y, f.sc, false, null);
  }
}

/* ---------- 불러오기 ---------- */
function hl5Stat(m) { hl5.msg = m; const n = $("hl5Stat"); if (n) n.textContent = hl5StatText(); }
function hl5StatText() {
  if (hl5.msg) return hl5.msg;
  if (hl5.ready && hl5.lists) return `불러왔어요 · 몬스터 ${hl5.lists.norm.length + hl5.lists.named.length}종 · 보스 ${hl5.lists.boss.length}종 · 파일 ${hl5.files.size}개 (이 폰에만 저장)`;
  return "아직 불러오지 않았어요. 아래 버튼으로 영웅서기5 zip을 골라 주세요.";
}
function hl5Refresh() { try { if (mon && !mon.dying && hl5Assign(mon)) { if (typeof intro !== "undefined" && intro) intro.name = mon.name; renderTop(true); } } catch (e) {} }
async function hl5Import(file) {
  if (hl5.busy || !file) return; hl5.busy = true;
  try {
    hl5Stat("파일 읽는 중…"); const u8 = new Uint8Array(await file.arrayBuffer());
    hl5Stat("게임 파일 찾는 중…"); const g = await hl5FindGame(u8, 0);
    if (!g) throw new Error("영웅서기5 파일을 찾지 못했어요 (영웅서기5 apk 또는 그 apk가 든 zip이어야 해요)");
    const pack = await hl5Extract(g.so, g.vfs, (i, n) => hl5Stat(`자료 꺼내는 중… ${Math.round(i / n * 100)}%`));
    if (pack.idx.length < 100) throw new Error("자료를 꺼내지 못했어요");
    hl5Stat("저장하는 중…"); let kept = true; try { await hl5DbDo("readwrite", s => s.put(pack, "main")); } catch (e) { kept = false; }
    if (!hl5Load(pack)) throw new Error("자료를 읽지 못했어요");
    if (fxSet().hl5 === 0) { fxSet().hl5 = 1; save(); }
    hl5.msg = ""; hl5Stat(""); hl5Refresh(); toast(kept ? "영웅서기5 자료를 불러왔어요" : "불러왔지만 폰에 저장하지 못했어요 (다시 열면 한 번 더 골라야 해요)");
  } catch (e) { hl5Stat("불러오지 못했어요: " + ((e && e.message) || e)); }
  hl5.busy = false;
}
async function hl5Forget() { try { await hl5DbDo("readwrite", s => s.delete("main")); } catch (e) {} hl5.ready = false; hl5.files = null; hl5.lists = null; hl5.banks = {}; hl5.cifs = {}; hl5.types = {}; hl5.heroT = {}; hl5.fx.length = 0; hl5Stat(""); toast("영웅서기5 자료를 이 폰에서 지웠어요"); }
function hl5Card() {
  const card = el("div", "card stg fxset fx48 hl5-card");
  const seg = (id, lbl, opts) => `<div class="fx-row"><span>${lbl}</span><div class="seg" role="group" aria-label="${lbl}">${opts.map(([v, n]) => `<button type="button" data-hl5="${id}" data-v="${v}" aria-pressed="false">${n}</button>`).join("")}</div></div>`;
  card.innerHTML = `<div class="fx48-t">영웅서기5 자료 <small>내 폰에서만 꺼내 씀</small></div><p class="muted" id="hl5Stat"></p>`
    + `<div class="hl5-row"><label class="btn primary hl5-pick">영웅서기5 zip 고르기<input type="file" id="hl5File" accept=".zip,.apk,application/zip,application/vnd.android.package-archive" hidden></label><button type="button" class="btn ghost" data-hl5del="1">지우기</button></div>`
    + seg("hl5", "영웅서기5 모습", [[1, "켜기"], [0, "끄기"]])
    + seg("hl5hd", "그림 다듬기", [[1, "선명하게"], [0, "원래 픽셀"]])
    + seg("hl5c", "주인공", [[0, "자동"], [1, "대검"], [2, "쌍검"], [3, "포"], [4, "도끼"]])
    + `<p class="muted">폰에 있는 영웅서기5 zip(또는 apk)을 고르면 캐릭터·몬스터·보스·이펙트를 꺼내 이 폰에만 저장해요. 파일은 어디에도 올라가지 않아요. 주인공 '자동'은 직무에 따라 바뀌어요(영업 대검 · 개발 쌍검 · 기획·감사 포 · 인사 도끼). 끄면 다음 몬스터부터 원래 그림으로 돌아와요.</p>`;
  addCustom("set", card, () => {
    const cur = { hl5: hl5Use() ? 1 : 0, hl5hd: hl5Hd() ? 1 : 0, hl5c: fxSet().hl5c | 0 };
    card.querySelectorAll("button[data-hl5]").forEach(b => { const ds = b.dataset || {}; b.setAttribute("aria-pressed", String(+ds.v === +cur[ds.hl5])); });
    const n = $("hl5Stat"), txt = hl5StatText(); if (n && n.textContent !== txt) n.textContent = txt;
  });
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset) return;
    if (b.dataset.hl5del) { if (hl5.ready && !hl5.busy) hl5Forget(); return; }
    if (!b.dataset.hl5) return;
    fxSet()[b.dataset.hl5] = +b.dataset.v; if (b.dataset.hl5 === "hl5hd") hl5ClearImg(); if (b.dataset.hl5 === "hl5" && +b.dataset.v) hl5Refresh();
    sfx("tick"); updateUI(true); save();
  });
  card.addEventListener("change", e => { const t = e.target; if (t && t.id === "hl5File" && t.files && t.files[0]) { hl5Import(t.files[0]); try { t.value = ""; } catch (err) {} } });
}

/* ---------- 이어 붙이기 ---------- */
(function () {
  const rig0 = drawHeroRig;
  drawHeroRig = function (t, look, pose, hx, hy, hs) {
    if (hl5On() && (mode === "tower" || mode === "vault")) { try { if (hl5DrawHero(hx, hy, hs)) return; } catch (e) {} }
    return rig0.apply(this, arguments);
  };
  const ds0 = drawSprite;
  drawSprite = function (g, map, pal, x, y, sc, opts) {
    if (map && map.hl5 && hl5On()) { try { hl5DrawMon(g, map.hl5, x + map[0].length * sc / 2, y + map.length * sc, opts || {}); return; } catch (e) {} }
    return ds0.apply(this, arguments);
  };
  const en0 = entrance;
  entrance = function (m) { try { hl5Assign(m); } catch (e) {} return en0.apply(this, arguments); };
  const fb0 = feelBegin;
  feelBegin = function (h, mv) { if (h === fHero) hl5HeroAtk(); return fb0.apply(this, arguments); };
  const hit0 = hit;
  hit = function (amount, crit, src, px, py) {
    const alive = !!(mon && !mon.dying), r = hit0.apply(this, arguments);
    if (alive && mon && hl5On()) {
      const now = performance.now(), st = mon.hl5, heavy = src === "hero" || src === "tap" || src === "jhero" || src === "skill";
      if (st && heavy && now - st.hitT > 330) st.hitT = now;
      if (heavy) { try { if (typeof fx48Kick === "function") fx48Kick(crit ? 6 : 2.5); } catch (e) {} }
      if (heavy && now - hl5.fxT > 70) {
        hl5.fxT = now; let x = px, y = py; if (x == null || y == null) { try { [x, y] = monHitPoint(); } catch (e) { x = MON_X - 14; y = GROUND - 80; } }
        hl5Fx(crit ? 0 : src === "skill" ? 32 : 19, x, y, crit ? 2.3 : 2, 18);
      }
    }
    return r;
  };
  const kill0 = kill;
  kill = function () {
    const m = mon, was = !!(m && !m.dying), r = kill0.apply(this, arguments);
    if (was && m && m.dying && m.hl5 && hl5On()) {
      const st = m.hl5, T = st.T, cif = T.cif, dieF = hl5Frames(cif, 3, T.dir) || hl5Frames(cif, 5, T.dir);
      if (dieF && dieF.length > 1 && st.mat) { (hl5.corpses || (hl5.corpses = [])).push({ T, fr: dieF, mat: st.mat, ox: st.ox, oy: st.oy, t0: performance.now() }); if (hl5.corpses.length > 3) hl5.corpses.shift(); }
      const { h } = monSize(m), big = m.kind >= 2; hl5Fx(big ? 24 : 23, MON_X + monOX(), GROUND - h * 0.45, big ? 3.6 : 2.4, 12); if (big) hl5Fx(7, MON_X + monOX(), GROUND - h * 0.5, 3.2, 12);
      try { if (typeof fx48Kick === "function") fx48Kick(big ? 9 : 5); } catch (e) {}
    }
    return r;
  };
  const cs0 = castSkill;
  castSkill = function (s, auto) {
    const ok = cs0.apply(this, arguments);
    if (ok && hl5On()) { try { const cls = hl5HeroCls(), H = hl5.h; H.sk = cls.sk[H.skI++ % cls.sk.length]; H.skT = performance.now(); H.skQ = true; hl5Fx(1, HERO_X + 35, GROUND - 44, 2.2, 14); } catch (e) {} }
    return ok;
  };
  const bl0 = bossLand;
  bossLand = function () { const r = bl0.apply(this, arguments); hl5Fx(27, MON_X, GROUND - 6, 3.4, 12); return r; };
  const px0 = drawPixelFx;
  drawPixelFx = function (now, hx) {
    if (hl5On()) { try { hl5DrawCorpses(); } catch (e) { hl5.corpses = []; } try { hl5DrawFx(); } catch (e) { hl5.fx.length = 0; } try { hl5WarmStep(5); } catch (e) {} return; }   // 영웅서기5 모습일 때는 원래 게임의 베기·폭발·먼지 효과를 그리지 않음
    return px0.apply(this, arguments);
  };
  /* 영웅서기5 모습일 때 섞이던 효과 끄기: 원래 게임의 스킬 섬광·분출·낙뢰·폭발, 만화식 흑백 반전, 48a 타격층(조각·고리·부서지는 몸) */
  const ph0 = fx4Phys;
  fx4Phys = function (dt) { const r = ph0.apply(this, arguments); if (hl5On()) { slashes = []; bursts = []; dusts = []; eruptions = []; gflashes = []; strikes = []; explos = []; rings = []; debris = []; sparks = []; streaks = []; critLines = 0; screenFlash = 0; } return r; };
  const ti0 = triggerImpactFrame;
  triggerImpactFrame = function () { if (hl5On()) return; return ti0.apply(this, arguments); };
  /* 원래 게임의 스킬 그림(도장·사직서)·직업 효과·치명타 방사선도 끔 — 피해 계산은 그대로 */
  const sf0 = drawSkillFx; drawSkillFx = function () { if (hl5On()) return; return sf0.apply(this, arguments); };
  const jf0 = drawJobFx; drawJobFx = function () { if (hl5On()) return; return jf0.apply(this, arguments); };
  const cl0 = drawCritLines; drawCritLines = function () { if (hl5On()) return; return cl0.apply(this, arguments); };
  const g1 = fx48Hit; fx48Hit = function () { if (hl5On()) return; return g1.apply(this, arguments); };
  const g2 = fx48KillAt; fx48KillAt = function () { if (hl5On()) return; return g2.apply(this, arguments); };
  const g3 = fx48Shatter; fx48Shatter = function () { if (hl5On()) return; return g3.apply(this, arguments); };
  const g4 = fx48Cast; fx48Cast = function () { if (hl5On()) return; return g4.apply(this, arguments); };
  const g5 = fx48Land; fx48Land = function () { if (hl5On()) return; return g5.apply(this, arguments); };
  const g6 = fx48Rage; fx48Rage = function () { if (hl5On()) return; return g6.apply(this, arguments); };
  const g7 = fx48BossChain; fx48BossChain = function () { if (hl5On()) return; return g7.apply(this, arguments); };
  /* 쉬는 틈에 다듬기 더 */
  (function idle() { try { if (hl5On() && hl5.warm.length) hl5WarmStep(8); } catch (e) {} if (typeof requestIdleCallback === "function") requestIdleCallback(idle, { timeout: 500 }); else setTimeout(idle, 200); })();
  const fc0 = buildScrCard;
  buildScrCard = function () { const r = fc0.apply(this, arguments); hl5Card(); return r; };
  /* 시작할 때: 폰에 저장해 둔 자료가 있으면 바로 씀 */
  (async () => { try { const p = await hl5DbDo("readonly", s => s.get("main")); if (p && p.v === 1 && p.idx && p.buf && hl5Load(p)) hl5Refresh(); } catch (e) {} })();
})();
