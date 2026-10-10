/* ===================== 큰 전투 화면: 카메라, 화면 글자 레이어, 동료 배치와 공격, 보스 ===================== */
/* 색 도우미 */
function hexRGB(h) { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); if (!m) return [128, 128, 128]; const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbHex(r, g, b) { return "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join(""); }
function tone(h, f) { const [r, g, b] = hexRGB(h); return f >= 0 ? rgbHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f) : rgbHex(r * (1 + f), g * (1 + f), b * (1 + f)); }
function mixHex(a, b, t) { const A = hexRGB(a), B = hexRGB(b); return rgbHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }

/* 보스 그림 (오른쪽을 보고 그림, 화면에선 뒤집혀 곽준영 쪽을 봄) */
SPR.exec = ["..kOkk...............kkOk...", "..kOoOkkkkkkkkkkkkkkkooOk...", "...kOoooooHHHHHHHoooooOk....", "....kOOOohHHHHhhhhooOOk.....", ".....kkkHhhhhhhhhhhhkk......", ".......khkkHhhhhhkkhk.......", ".......khSSSSssSSSShk.......", "........kseEssssEeSk........", "........kmsssSSsssmk........", "..k..k..ksnmnmmnmnSk..k..k..", ".kOkkOk.ksnmmnnmmnSk.kOkkOk.", "koOkoOkkkSSSSSSSSSSkkoOkoOk.", "kOoqooqqqJjwwttwjjJqqooqoOk.", "kkqjjjjjjJjwwttwjjJjjjjjJkk.", "qqjjjjjjjjJwwttwjJjjjjjjjqJk", "qjjjjjjjjjJjwttjjJjjjjjjggJk", "qjjjjjjjjjjJwttjJjjjjjjjggJk", "qjjjjjjjjjjJjttjJjjjjjjjggJk", "JjjjjjjjjjjjJttJjjjjjjjjggJk", "kqjjjjjjjjjjJttJjjjjjjjjggJk", "kqjjjjjjjjjjjJJjjjjjjjjJggJk", "kqjJJjjjjjjjjJJjjjjjjjJkggSk", "kqJkkbbbbbbbbggbbbbbbbbssssS", "ksssqjjjjjjjjjjjjjjjjjjssssS", "sssssjjjjjjjJJjjjjjjjgggggSk", "sssssjjjJjjJkkJjjjjrrrrrrrrR", "nSsSnJJJkqppPkkqppprrrrrrrrR", "kknkkkkkkqppPkkqppprrrrrrrrR", "..k.....kqppPkkqppprrrrrrrrR", ".......kZzzzzZZzzzzrRRRRRRRR", ".......kzzzzzzzzzzzzzkkkkkkk", "........kkkkkkkkkkkkk......."];
SPR.dragon2 = ["...k......kk.........kXXkkXk......", "..kWkkk..kwBk...kk....kXXkXk......", "...kBwWkkwwBWk.kwBk....kXXkXkk....", "....kBwwwwwwBWkwwBk.....kLLhDDk...", ".....kBwwwwwBwwwwBk.kk.kLhhDkkDkk.", ".....kBwwwwwBwwwwBWkwBkLhhheeEhLDk", "......kBwwwwBwwwwBwwwBkLhhhhhhhhDk", ".......kBBwwwBwwBBwwBkkLhhhhhhhDk.", "........kWBwwBwwBwwwBkxxhhhhnmnmnk", ".........kWBwBwwBwwBkkLhhhhhhnhnk.", "..........kBwwBwBwwBXxhhhbDDDDDk..", "........kkkxxwxxBwBWkLhhbDkkkkk...", ".......kXXkLhhhhhxXkLhhbbk........", ".......kkLLhhhhhhhhLhhhbbk........", "......kLLhhhhhhhhhhhhhbbk.........", "......kLhhhhhhhhhhhhhbbbk.........", ".....kLhhhhhhhhhhhhhhhbk..........", ".....kLhhhhhhbbbbbhhhhDk..........", "....kkLhhhbbbbbbbbbbbhDk..........", "...kLLhhhhbbbbbbbbbhhDk...........", "..kLhhDDhhhhbbbbbhhhhDk...........", ".kLhhDkkLhhhbbbbbhhhDk............", ".kLhDk.kLhhhDbbbbDhhhDk...........", "kLhDk..kLhhDkkkkkkLhhDk...........", "xxDk...kLhhDk....kLhhDkk..........", "XDk...kLhhhhDk..kLhhhhLDk.........", "kk....kLDhDhDk..kLDhDhDDk.........", "......knknknk...knknknknk........."];
var execPalCache, dragonPalCache;
function execPalOf(z) {
  execPalCache = execPalCache || new Map();
  if (execPalCache.has(z)) return execPalCache.get(z);
  const b = z.bossPal, p = {
    k: "#120c14", j: b.j, J: tone(b.j, -0.35), q: tone(b.j, 0.22), w: b.w, W: tone(b.w, -0.25), t: b.t, T: tone(b.t, -0.3),
    s: b.s, S: tone(b.s, -0.25), h: b.h, H: tone(b.h, 0.3), e: "#ff3b3b", E: "#fff2a8", m: "#2a0a0a", n: "#f4efe6",
    o: "#e2d6c2", O: "#9a8c76", p: tone(b.j, 0.08), P: tone(b.j, -0.3), z: "#0d0d12", Z: "#5a5a6a", b: "#0d0d12", g: "#ffd54a", r: "#d8262c", R: "#8a1418",
  };
  execPalCache.set(z, p); return p;
}
function dragonPalOf(i) {
  dragonPalCache = dragonPalCache || new Map();
  if (dragonPalCache.has(i)) return dragonPalCache.get(i);
  const src = DRAGON_PAL[i % DRAGON_PAL.length], [c0, c1, c2] = Array.isArray(src) ? src : [src.h, src.w || src.b, src.m], p = {
    k: "#0c0a12", h: c0, D: tone(c0, -0.38), L: tone(c0, 0.25), w: mixHex(c0, c1, 0.3), W: tone(mixHex(c0, c1, 0.3), -0.3), B: tone(c0, -0.55),
    b: c1, c: tone(c1, 0.3), x: c2, X: tone(c2, -0.35), e: c2, E: "#ffffff", m: "#2a0a0a", n: "#f4efe6",
  };
  dragonPalCache.set(i, p); return p;
}
var eyeCache;
function eyeCells(map) {
  eyeCache = eyeCache || new WeakMap();
  if (eyeCache.has(map)) return eyeCache.get(map);
  const out = []; map.forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] === "e") out.push([c, r]); });
  eyeCache.set(map, out); return out;
}
const monOX = (m = mon) => Math.max(0, monSize(m).w / 2 - 64);

/* 도트 그림 캐시: 그림·팔레트마다 작은 캔버스로 한 번만 그리고 키워서 붙임.
   pretty = 외곽선 1칸 + 아래·오른쪽 그림자 + 위·왼쪽 밝은 면 (일반 몹·동료용) */
var sprCache;
function prettyPixels(map, pal) {
  const h = map.length, w = Math.max(...map.map(r => r.length));
  const at = (x, y) => (y >= 0 && y < h && x >= 0 && x < map[y].length && map[y][x] !== "." && pal[map[y][x]]) ? map[y][x] : null;
  const out = [];
  for (let y = -1; y <= h; y++) {
    const row = [];
    for (let x = -1; x <= w; x++) {
      const c = at(x, y);
      if (!c) { row.push(at(x + 1, y) || at(x - 1, y) || at(x, y + 1) || at(x, y - 1) ? "#140f1c" : null); continue; }
      let hex = pal[c];
      if (c !== "k" && /^#[0-9a-f]{6}$/i.test(hex)) {
        const below = at(x, y + 1), right = at(x + 1, y), above = at(x, y - 1), left = at(x - 1, y);
        if (!below) hex = tone(hex, -0.3); else if (!right) hex = tone(hex, -0.16); else if (!above || !left) hex = tone(hex, 0.2);
      }
      row.push(hex);
    }
    out.push(row);
  }
  return out;
}
function spriteCanvas(map, pal, mode, pretty) {
  sprCache = sprCache || new WeakMap();
  let byKey = sprCache.get(map); if (!byKey) { byKey = new Map(); sprCache.set(map, byKey); }
  let key = (pretty ? "P" : "") + mode + "|" + pal.k + pal.h + pal[0] + pal.s; for (const k in pal) key += k + pal[k];
  if (byKey.has(key)) return byKey.get(key);
  if (byKey.size > 80) byKey.clear();
  const c = document.createElement("canvas"), g0 = c.getContext && c.getContext("2d");
  if (!g0 || !g0.fillRect) { byKey.set(key, null); return null; }
  if (pretty) {
    const px = prettyPixels(map, pal); c.width = px[0].length; c.height = px.length;
    const g = c.getContext("2d");
    px.forEach((row, y) => row.forEach((hex, x) => { if (!hex) return; g.fillStyle = mode === "white" ? "#ffffff" : mode || hex; g.fillRect(x, y, 1, 1); }));
  } else {
    c.width = Math.max(...map.map(r => r.length)); c.height = map.length;
    const g = c.getContext("2d");
    for (let r = 0; r < map.length; r++) for (let x = 0; x < map[r].length; x++) {
      const ch = map[r][x]; if (ch === "." || !pal[ch]) continue;
      g.fillStyle = mode === "white" ? "#ffffff" : mode || pal[ch]; g.fillRect(x, r, 1, 1);
    }
  }
  byKey.set(key, c); return c;
}
function drawSprite(ctx, map, pal, x, y, sc, opts = {}) {
  const pretty = !!opts.pretty, cnv = spriteCanvas(map, pal, opts.white ? "white" : opts.solid || "", pretty);
  if (cnv && cnv.width) {
    const ox = pretty ? sc : 0, w = cnv.width * sc, h = cnv.height * sc, prev = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    if (opts.flip) { ctx.save(); ctx.translate(x - ox + w, y - ox); ctx.scale(-1, 1); ctx.drawImage(cnv, 0, 0, w, h); ctx.restore(); }
    else ctx.drawImage(cnv, x - ox, y - ox, w, h);
    ctx.imageSmoothingEnabled = prev; return;
  }
  for (let r = 0; r < map.length; r++) {
    const row = map[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]; if (ch === "." || !pal[ch]) continue;
      ctx.fillStyle = opts.white ? "#ffffff" : opts.solid || pal[ch];
      const cx = opts.flip ? row.length - 1 - c : c;
      ctx.fillRect(Math.round(x + cx * sc), Math.round(y + r * sc), Math.ceil(sc), Math.ceil(sc));
    }
  }
}
const isBigBossMap = map => map === SPR.exec || map === SPR.dragon2;

/* 카메라: 월드(640x360) 가운데 정사각 창을 크게 보여 줌. 보스 등장·처치 때 살짝 다가가고, 타격마다 줌이 튐 */
const VIEW = 360, UW = 360, UH = 360;
const CS = (window.devicePixelRatio || 1) >= 2.5 ? 1080 : 720;
cv.width = CS; cv.height = CS;
const cam = { x: 404, y: 180, z: 1, kick: 0 };
let VX0 = 224, VY0 = 0, VW = 360, VH = 360;
function fx5Step(dt) {
  let tz = 1, tx = 404, ty = 180;
  if (intro && !intro.light) { const k = intro.t / intro.dur; if (k > 0.45 && k < 0.92) { tz = 1.14; tx = MON_X + 10; ty = 196; } }
  else if (stampFx && stampFx.kind >= 2 && stampFx.t < 950) { tz = 1.1; tx = MON_X - 10; ty = 198; }
  else if (slowMo > 0) { tz = 1.08; tx = MON_X - 20; ty = 200; }
  const f = Math.min(1, dt / 120);
  cam.z += (tz - cam.z) * f; cam.x += (tx - cam.x) * f; cam.y += (ty - cam.y) * f;
  cam.kick = Math.max(0, cam.kick - dt / 150);
  if (impactF) { impactF.t += dt; if (impactF.t > 110) impactF = null; }
}
function camApply() {
  const z = cam.z * (1 + (reduceMotion ? 0 : cam.kick * 0.04)), half = VIEW / 2 / z;
  const cx = Math.max(half, Math.min(W - half, cam.x)), cy = Math.max(half, Math.min(H - half, cam.y));
  VX0 = cx - half; VY0 = cy - half; VW = VH = half * 2;
  const s = CS / VW; ctx.setTransform(s, 0, 0, s, -VX0 * s, -VY0 * s);
}
const uiApply = () => { const s = CS / UW; ctx.setTransform(s, 0, 0, s, 0, 0); };
const w2u = (x, y) => [(x - VX0) / VW * UW, (y - VY0) / VH * UH];

/* 동료 배치: 뒷줄(사람) / 앞줄(동물·화분) / 맨 앞 로봇 */
const PET_BACK = [["intern", 232], ["idol", 258], ["legend", 284]];
const PET_FRONT = [["ddeok", 226, "ddeok"], ["squirrel", 252, "squirrel"], ["cactus", 278, "plant"], ["cat", 303, "cat"]];
let needles = [], hearts = [], cloneIdx = 0, cactusPop = 0;
function drawPetsBack(t) {
  PET_BACK.forEach(([id, x]) => { if (!petLv(id)) return; const bob = id === "idol" ? Math.abs(Math.sin(t / 200)) * 5 : 0; drawSprite(ctx, HERO, PAL[id], x, GROUND - 6 - 14 * 2.8 - bob, 2.8, { pretty: true }); });
}
function drawPetsFront(t) {
  PET_FRONT.forEach(([id, x, spr]) => {
    if (!petLv(id)) return;
    const jump = id === "cat" ? Math.sin(petT * Math.PI) * -12 : id === "cactus" ? -cactusPop * 5 : 0;
    drawSprite(ctx, SPR[spr], PAL[id], x, GROUND + 24 - 12 * 2.6 + jump, 2.6, { pretty: true });
  });
  if (petLv("robot")) drawSprite(ctx, SPR.robot, PAL.robot, 262 + Math.sin(t / 1400) * 34, GROUND + 50 - 12 * 2.4, 2.4, { pretty: true });
}
var clonePalCache;
function clonePal(p) {
  clonePalCache = clonePalCache || new WeakMap(); if (!clonePalCache.has(p)) clonePalCache.set(p, Object.assign({}, p, { s: "#c9a6ff", h: "#7c5cff", w: "#b9a6ff", p: "#5a4a9a", b: "#3a2a6a", t: "#ffffff", a: "#b9a6ff" })); return clonePalCache.get(p); }

/* 동료 공격 이펙트 */
function fireNeedles() {
  if (reduceMotion || !mon) return; cactusPop = 1;
  const { h: mh } = monSize();
  for (let i = 0; i < 3; i++) needles.push({ x0: 293, y0: GROUND + 2, x1: MON_X - 14 + (Math.random() - .5) * 24, y1: GROUND - mh * (0.3 + Math.random() * 0.35), t: -i * 60, dur: 230, arc: 40 + Math.random() * 30 });
}
function throwCloneJavelin() {
  if (reduceMotion || cloneIdx++ % 2) return;
  slashes.push({ type: "thrust", t: 0, dur: 190, style: "clone", crit: false, x0: HERO_X - 6, y: GROUND - 58 + (cloneIdx % 4) * 4, len: 150, w: 6, seed: 0, flat: 1 });
}
function cheerHearts() {
  if (reduceMotion) return;
  for (let i = 0; i < 6; i++) hearts.push({ x: 275 + (Math.random() - .5) * 20, y: GROUND - 52, vx: (Math.random() - .5) * 1.4, vy: -1.2 - Math.random() * 1.2, life: 1, dur: 900 + Math.random() * 400, s: 2 + Math.floor(Math.random() * 2) });
}
function petPhys(dt) {
  const k = dt / 16;
  needles.forEach(n => { n.t += dt; if (!n.hit && n.t >= n.dur) { n.hit = true; bursts.push({ x: n.x1, y: n.y1, t: 0, dur: 160, crit: false, rot: Math.random() * 6.28, seed: Math.random() * 100, style: "leaf" }); } });
  needles = needles.filter(n => n.t < n.dur + 10);
  hearts.forEach(h => { h.x += h.vx * k + Math.sin(h.life * 12) * 0.3; h.y += h.vy * k; h.life -= dt / h.dur; });
  hearts = hearts.filter(h => h.life > 0);
  cactusPop = Math.max(0, cactusPop - dt / 200);
}
function drawPetFx(g) {
  let d = false;
  needles.forEach(n => {
    if (n.t < 0 || n.t >= n.dur) return; d = true;
    const at = k => [n.x0 + (n.x1 - n.x0) * k, n.y0 + (n.y1 - n.y0) * k - Math.sin(Math.PI * k) * n.arc];
    const k = n.t / n.dur, [x, y] = at(k), [x2, y2] = at(Math.max(0, k - 0.14));
    const a = Math.atan2(y - y2, x - x2), len = Math.hypot(x - x2, y - y2) + 10;
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = "#1f7a2a"; g.beginPath(); g.moveTo(7, 0); g.lineTo(-len, -4); g.lineTo(-len, 4); g.closePath(); g.fill();
    g.fillStyle = "#7dff8a"; g.beginPath(); g.moveTo(7, 0); g.lineTo(-len * 0.8, -2); g.lineTo(-len * 0.8, 2); g.closePath(); g.fill();
    g.fillStyle = "#ffffff"; g.fillRect(-4, -1, 10, 2);
    g.restore();
  });
  hearts.forEach(h => {
    d = true; const s = h.s * 2, x = Math.round(h.x), y = Math.round(h.y);
    g.globalAlpha = Math.min(1, h.life * 2); g.fillStyle = "#ff6fae";
    [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 2], [2, 2], [3, 2], [2, 3]].forEach(([cx, cy]) => g.fillRect(x + (cx - 2.5) * s, y + cy * s, s, s));
    g.fillStyle = "#ffd6ea"; g.fillRect(x - 1.5 * s, y + s, s, s);
    g.globalAlpha = 1;
  });
  return d;
}

/* ---------- 화면 글자 레이어 (360 x 360 기준) ---------- */
function drawVignette() {
  if (!vignette) {
    vignette = document.createElement("canvas"); vignette.width = UW; vignette.height = UH;
    const g = vignette.getContext && vignette.getContext("2d");
    if (g && g.createRadialGradient) { const gr = g.createRadialGradient(UW / 2, UH * 0.56, 90, UW / 2, UH * 0.56, 265); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.5)"); g.fillStyle = gr; g.fillRect(0, 0, UW, UH); }
  }
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(vignette, 0, 0, UW, UH); ctx.restore();
}
function drawDanger(t) {
  if (mode !== "tower" || !mon || mon.dying || !TIME_LIMIT[mon.kind] || introBlocking()) return;
  const r = bossTime / bossTimeOf(mon.kind); if (r >= 0.3) return;
  const a = (0.3 - r) / 0.3 * (0.5 + 0.5 * Math.sin(t / 140));
  const gr = ctx.createRadialGradient(UW / 2, UH / 2, 90, UW / 2, UH / 2, 260);
  gr.addColorStop(0, "rgba(255,30,30,0)"); gr.addColorStop(1, `rgba(255,30,30,${0.55 * a})`);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, UW, UH);
  ctx.save(); ctx.globalAlpha = 0.65 + 0.35 * a; ctx.font = '20px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const tx = `퇴근까지 ${Math.ceil(bossTime)}초!`; ctx.lineWidth = 5; ctx.strokeStyle = "#2a0606"; ctx.strokeText(tx, UW / 2, UH - 24); ctx.fillStyle = "#ff6b6b"; ctx.fillText(tx, UW / 2, UH - 24);
  ctx.restore();
}
function drawFever(t) {
  if (combo >= 50 && !reduceMotion) { ctx.strokeStyle = `rgba(255,213,74,${0.25 + 0.2 * Math.sin(t / 120)})`; ctx.lineWidth = 5; ctx.strokeRect(2.5, 2.5, UW - 5, UH - 5); }
  if (fever.t <= 0) return;
  const k = 1 - fever.t, a = Math.min(1, fever.t * 3), sc = k < 0.12 ? 2.2 - (k / 0.12) * 1.2 : 1;
  const txt = `${fever.n}연타!`, sub = fever.n >= 100 ? "야근 폭주 모드" : fever.n >= 50 ? "업무 몰입!" : "손이 안 보인다!";
  ctx.save(); ctx.translate(UW / 2, UH * 0.36); ctx.rotate(-0.08); ctx.scale(sc, sc); ctx.globalAlpha = a;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = '38px "Do Hyeon", sans-serif';
  ctx.lineWidth = 10; ctx.strokeStyle = "#1b1206"; ctx.strokeText(txt, 0, 0);
  const gr = ctx.createLinearGradient(0, -19, 0, 19); gr.addColorStop(0, "#fff7c2"); gr.addColorStop(0.5, "#ffd54a"); gr.addColorStop(1, "#ff8a3b");
  ctx.fillStyle = gr; ctx.fillText(txt, 0, 0);
  ctx.font = '14px "Do Hyeon", sans-serif'; ctx.lineWidth = 4; ctx.strokeText(sub, 0, 28); ctx.fillStyle = "#ffffff"; ctx.fillText(sub, 0, 28);
  ctx.restore();
}
function drawImpactFrame() {
  if (!impactF) return;
  const t = impactF.t, [ix, iy] = w2u(impactF.x, impactF.y);
  ctx.save();
  if (t < 55) {
    ctx.globalCompositeOperation = "saturation"; ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, UW, UH);
    ctx.globalCompositeOperation = "difference"; ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, UW, UH);
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.globalAlpha = t < 55 ? 0.92 : Math.max(0, 0.9 * (1 - (t - 55) / 50)); ctx.fillStyle = t < 55 ? "#000000" : "#ffffff";
  for (let i = 0; i < 16; i++) {
    const a0 = impactF.seed + i * Math.PI * 2 / 16, w = 0.06 + 0.05 * Math.abs(Math.sin(i * 3.3 + impactF.seed));
    ctx.beginPath(); ctx.moveTo(ix + Math.cos(a0) * 40, iy + Math.sin(a0) * 40);
    ctx.lineTo(ix + Math.cos(a0 - w) * 520, iy + Math.sin(a0 - w) * 520); ctx.lineTo(ix + Math.cos(a0 + w) * 520, iy + Math.sin(a0 + w) * 520); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function drawScreenFlash() {
  if (screenFlash <= 0) return;
  if (flashCol === "#ff2a2a") { const vg = ctx.createRadialGradient(UW / 2, UH / 2, 60, UW / 2, UH / 2, 270); vg.addColorStop(0, hexA("#ff2a2a", screenFlash * 0.25)); vg.addColorStop(1, hexA("#ff2a2a", Math.min(0.7, screenFlash * 1.8))); ctx.fillStyle = vg; }
  else ctx.fillStyle = hexA(flashCol, screenFlash);
  ctx.fillRect(0, 0, UW, UH);
}
function drawStamp() {
  if (!stampFx) return;
  const s = stampFx, big = s.kind >= 2, T0 = 120, T1 = 230, HOLD = big ? 1150 : 650, END = big ? 1500 : 950;
  if (s.t < T0) return;
  const k = Math.min(1, (s.t - T0) / (T1 - T0)), sc = 1 + (1 - k) * 1.9;
  const a = s.t > HOLD ? Math.max(0, 1 - (s.t - HOLD) / (END - HOLD)) : Math.min(1, k * 1.6);
  let x = UW / 2, y = UH * 0.44, R = 58;
  if (!big) { const p = w2u(MON_X - 30, 190); x = p[0]; y = p[1]; R = 30; }
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.22); ctx.scale(sc, sc); ctx.globalAlpha = a * 0.92;
  ctx.strokeStyle = "#e0262c"; ctx.lineWidth = R * 0.11; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = R * 0.045; ctx.beginPath(); ctx.arc(0, 0, R * 0.8, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#e0262c"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `${Math.round(R * 0.66)}px "Do Hyeon", sans-serif`; ctx.fillText(s.text, 0, R * 0.04);
  if (big) { ctx.font = `${Math.round(R * 0.2)}px "Do Hyeon", sans-serif`; ctx.fillText(s.kind >= 3 ? "드래곤 퇴치" : "칼퇴 승인", 0, -R * 0.52); ctx.fillText("곽준영", 0, R * 0.55); }
  ctx.globalCompositeOperation = "destination-out"; ctx.globalAlpha = 0.5;
  for (let i = 0; i < 14; i++) { const ang = i * 2.4, rr = R * (0.3 + (i % 5) * 0.15); ctx.fillRect(Math.cos(ang) * rr, Math.sin(ang) * rr, 1.5 + (i % 3) * 0.7, 1.5); }
  ctx.restore();
}
function drawIntro(t) {
  if (!intro) return;
  const k = intro.t / intro.dur;
  if (intro.light) {
    const a = Math.min(1, k / 0.12, (1 - k) / 0.2), x = -(1 - Math.min(1, k / 0.18)) * 220;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, 0);
    ctx.fillStyle = "rgba(150,20,28,.9)"; ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(200, 36); ctx.lineTo(184, 62); ctx.lineTo(0, 62); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffd54a"; ctx.fillRect(0, 36, 200, 2.5);
    ctx.font = '17px "Do Hyeon", sans-serif'; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffffff"; ctx.fillText("! 우두머리 등장", 12, 50);
    ctx.restore(); return;
  }
  const dragon = intro.kind >= 3, acc = dragon ? "#ff3b3b" : "#ffd54a";
  const a = Math.min(1, k / 0.08, (1 - k) / 0.18), dim = k < 0.62 ? 0.55 : 0.55 * Math.max(0, 1 - (k - 0.62) / 0.2);
  ctx.fillStyle = `rgba(0,0,0,${dim * a})`; ctx.fillRect(0, 0, UW, UH);
  if (dragon && k < 0.62) { ctx.fillStyle = `rgba(255,20,20,${0.18 * (0.5 + 0.5 * Math.sin(t / 90)) * a})`; ctx.fillRect(0, 0, UW, UH); }
  const band = y => {
    ctx.fillStyle = hexA(acc, 0.95 * a); ctx.fillRect(0, y, UW, 24);
    ctx.fillStyle = `rgba(15,10,10,${0.95 * a})`; const off = (t / 18) % 32;
    for (let x = -36 + off; x < UW + 36; x += 32) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 14, y); ctx.lineTo(x + 2, y + 24); ctx.lineTo(x - 12, y + 24); ctx.closePath(); ctx.fill(); }
  };
  const bandIn = Math.min(1, k / 0.12);
  ctx.save(); ctx.translate(-(1 - bandIn) * UW, 0); band(26); ctx.restore();
  ctx.save(); ctx.translate((1 - bandIn) * UW, 0); band(UH - 50); ctx.restore();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (k < 0.6) {
    const pop = k < 0.1 ? 1.8 - (k / 0.1) * 0.8 : 1, blink = Math.floor(intro.t / 160) % 2 ? 1 : 0.75;
    ctx.save(); ctx.translate(UW / 2, UH * 0.33); ctx.scale(pop, pop); ctx.globalAlpha = a * blink * Math.min(1, (0.6 - k) / 0.08);
    ctx.font = '15px "Do Hyeon", sans-serif'; ctx.fillStyle = acc; ctx.fillText("W A R N I N G", 0, -30);
    const tt = dragon ? "드래곤 출현!!" : "임원 출현!";
    ctx.font = '38px "Do Hyeon", sans-serif'; ctx.lineWidth = 10; ctx.strokeStyle = dragon ? "#3a0505" : "#2a1d05"; ctx.strokeText(tt, 0, 4);
    ctx.fillStyle = "#ffffff"; ctx.fillText(tt, 0, 4);
    ctx.restore();
  }
  const pk = Math.min(1, Math.max(0, (k - 0.08) / 0.15)), pw = UW * 0.8, px = UW - pw * easeIO(pk), py = UH * 0.7;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(10,12,22,.92)"; ctx.fillRect(px, py, pw + 20, 44);
  ctx.fillStyle = acc; ctx.fillRect(px, py, 5, 44);
  ctx.textAlign = "left"; ctx.font = '12px "Do Hyeon", sans-serif'; ctx.fillStyle = acc; ctx.fillText(dragon ? "100층 지배자" : "10층 결재권자", px + 16, py + 12);
  ctx.font = '20px "Do Hyeon", sans-serif'; ctx.fillStyle = "#ffffff"; ctx.fillText(intro.name, px + 16, py + 30);
  ctx.restore();
}
function drawLift(t) {
  if (!lift) return;
  const lt = lift.t;
  const c = lt < L_DELAY ? 0 : lt < L_CLOSED ? easeIO((lt - L_DELAY) / (L_CLOSED - L_DELAY)) : lt < L_OPEN ? 1 : 1 - easeIO(Math.min(1, (lt - L_OPEN) / (L_END - L_OPEN)));
  if (c <= 0) return;
  const dw = (UW / 2) * c;
  [0, 1].forEach(side => {
    const x0 = side ? UW - dw : 0;
    const gr = ctx.createLinearGradient(x0, 0, x0 + Math.max(1, dw), 0);
    gr.addColorStop(0, side ? "#4a5268" : "#58617a"); gr.addColorStop(0.45, "#a3acc4"); gr.addColorStop(1, side ? "#58617a" : "#4a5268");
    ctx.fillStyle = gr; ctx.fillRect(x0, 0, dw, UH);
    ctx.fillStyle = "rgba(255,255,255,.07)"; for (let y = 3; y < UH; y += 6) ctx.fillRect(x0, y, dw, 1);
    ctx.strokeStyle = "rgba(25,30,44,.55)"; ctx.lineWidth = 2; if (dw > 30) ctx.strokeRect(x0 + 16, 100, dw - 32, UH - 136);
    ctx.fillStyle = "#262c3e"; ctx.fillRect(side ? x0 : x0 + dw - 2.5, 0, 2.5, UH);
  });
  ctx.fillStyle = "#151a28"; ctx.fillRect(0, 0, UW, 10); ctx.fillRect(0, UH - 7, UW, 7);
  if (lt > L_CLOSED - 120 && lt < L_OPEN + 220) {
    const pa = Math.min(1, (lt - (L_CLOSED - 120)) / 120, (L_OPEN + 220 - lt) / 160);
    ctx.save(); ctx.globalAlpha = pa;
    ctx.fillStyle = "#0b0d14"; ctx.fillRect(UW / 2 - 66, 20, 132, 58); ctx.strokeStyle = "#3a4058"; ctx.lineWidth = 2.5; ctx.strokeRect(UW / 2 - 66, 20, 132, 58);
    const roll = Math.min(1, Math.max(0, (lt - L_CLOSED) / 180)), on = Math.floor(lt / 150) % 2;
    ctx.save(); ctx.beginPath(); ctx.rect(UW / 2 - 63, 23, 126, 52); ctx.clip();
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = '34px "Do Hyeon", sans-serif'; ctx.shadowColor = "#ff9a1f"; ctx.shadowBlur = 10; ctx.fillStyle = "#ffb13b";
    ctx.fillText(`${lift.from}F`, UW / 2 + 12, 49 - roll * 50); ctx.fillText(`${lift.to}F`, UW / 2 + 12, 99 - roll * 50);
    ctx.font = '20px "Do Hyeon", sans-serif'; ctx.fillStyle = on ? "#ffb13b" : "#6a4a1a"; ctx.fillText("▲", UW / 2 - 44, 49);
    ctx.restore();
    if (lift.swapped) { ctx.font = '14px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e9edf6"; ctx.fillText(`${cycleOf(lift.to)}${zoneOf(lift.to).n}`, UW / 2, 92); }
    ctx.restore();
  }
}
function drawZoneBanner() {
  if (zoneBanner.t <= 0) return;
  const a = Math.min(1, zoneBanner.t / 0.4, (2.8 - zoneBanner.t) / 0.3), y0 = UH * 0.3;
  ctx.fillStyle = `rgba(8,10,20,${0.72 * a})`; ctx.fillRect(0, y0, UW, 62);
  ctx.fillStyle = hexA("#ffd54a", a); ctx.fillRect(0, y0, UW, 2.5); ctx.fillRect(0, y0 + 59.5, UW, 2.5);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = '28px "Do Hyeon", sans-serif'; ctx.fillStyle = hexA("#ffffff", a); ctx.fillText(zoneBanner.text, UW / 2, y0 + 25);
  ctx.font = '13px "Do Hyeon", sans-serif'; ctx.fillStyle = hexA("#ffd54a", a); ctx.fillText(zoneBanner.sub, UW / 2, y0 + 47);
}
function drawMissions() {
  const lines = missionLines(); if (!lines.length) return;
  ctx.font = '13px "Do Hyeon", sans-serif'; ctx.textAlign = "right"; ctx.textBaseline = "top";
  const mw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 14;
  ctx.fillStyle = "rgba(10,14,26,.62)"; ctx.fillRect(UW - 8 - mw, 8, mw, lines.length * 17 + 7);
  lines.forEach((l, i) => { ctx.fillStyle = i === 0 && (l.startsWith("무기") || l.startsWith("업무")) ? "#ffd54a" : "#e9edf6"; ctx.fillText(l, UW - 15, 12 + i * 17); });
}
function drawFloorLabel() {
  const f = shownFloor(), vault = mode === "vault";
  const label = vault ? `지하 문서고 ${vaultRun.depth}m` : `${cycleOf(f)}${zoneOf(f).n} ${f}F`;
  ctx.font = '14px "Do Hyeon", sans-serif'; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  const w = Math.max(70, ctx.measureText(label).width + 18);
  ctx.fillStyle = vault ? "rgba(111,211,255,.92)" : "rgba(255,213,74,.92)"; ctx.fillRect(8, 8, w, 22);
  ctx.fillStyle = vault ? "#06263a" : "#2a2206"; ctx.fillText(label, 17, 19.5);
}
function drawHint() {
  if (mode !== "tower" || !hintOn) return;
  ctx.save(); ctx.globalAlpha = 0.55 + 0.35 * Math.sin(performance.now() / 380);
  ctx.font = '12px "Gowun Dodum", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  const ht = "화면을 톡톡 눌러 같이 때리세요 · 월급은 보스만 줘요";
  ctx.lineWidth = 3.5; ctx.strokeStyle = "rgba(14,19,33,.9)"; ctx.strokeText(ht, UW / 2, UH - 8); ctx.fillStyle = "#e9edf6"; ctx.fillText(ht, UW / 2, UH - 8);
  ctx.restore();
}
