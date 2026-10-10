/* ===================== 타격 이펙트 2: 픽셀 초승달 베기, 충격 파열, 흙먼지, 하늘 낙뢰, 폭발, 임팩트 프레임 =====================
   이펙트는 1/3 해상도 레이어에 그린 뒤 픽셀 그대로 키워서 도트 그림과 어울리게 하고,
   빛나는 이펙트는 흐리게 키운 사본을 한 번 더 겹쳐 은은한 빛을 낸다. */
let slashes = [], bursts = [], dusts = [], eruptions = [], gflashes = [], strikes = [], explos = [];
let impactF = null, lastImpactF = 0, swingIdx = 0;
const PXS = 3, PXW = Math.ceil(W / PXS), PXH = Math.ceil(H / PXS);
let pxCan = null, pxCtx = null, glCan = null, glCtx = null;
const SWING_CYCLE = ["rise", "sweep", "chop"];
// [치켜든 각도, 내리친 각도, 지나치는 양]  (0 = 위, 시계 방향 +)
const SWING_POSE = { chop: [-2.3, 2.05, 0.3], rise: [2.35, -0.35, -0.28], sweep: [-1.6, 1.65, 0.22], thrust: [0.9, 1.6, 0.06] };
const SLASH_STYLE = { flame: "fire", ember: "fire", frost: "ice", spark: "volt", laser: "volt", holy: "holy", gold: "gold", cosmic: "magic", rgb: "magic" };
const slashStyle = () => SLASH_STYLE[WEAPONS[skinIdx()].fx] || "steel";
const nextSwing = () => SWING_CYCLE[swingIdx++ % SWING_CYCLE.length];
const ang2phi = th => th - Math.PI / 2;
const heroPivot = () => ({ x: HERO_X + 10 + 9.5 * 6, y: GROUND - 14 * 6 + 1 + 8.4 * 6 });
function slashPal(style, crit, now) {
  if (crit) return ["#b3151b", "#ff5a3c", "#ffffff"];
  switch (style) {
    case "leaf": return ["#1f7a2a", "#5fe36a", "#eaffd8"];
    case "clone": return ["#4a2a8a", "#b18cff", "#f3eaff"];
    case "fire": return ["#a8200c", "#ff7a1a", "#ffe58a"];
    case "ice": return ["#1d56b0", "#5cc8ff", "#f2fdff"];
    case "volt": return ["#1b5fc1", "#7fe9ff", "#ffffff"];
    case "gold": return ["#a8650c", "#ffc23b", "#fff6cf"];
    case "holy": return ["#b88a1a", "#ffe27a", "#ffffff"];
    case "magic": {
      if (WEAPONS[skinIdx()].fx === "rgb") { const h = Math.floor(now / 6) % 360; return [`hsl(${h},85%,40%)`, `hsl(${(h + 50) % 360},100%,65%)`, "#ffffff"]; }
      return ["#7a1aa0", "#ff5fd2", "#ffe6fb"];
    }
    default: return ["#6f7d9c", "#d6e2f5", "#ffffff"];
  }
}

/* 초승달 모양: 바깥 호를 따라가다 안쪽으로 되돌아오며 가운데가 두껍고 양끝이 뾰족함 */
function crescentPath(g, cx, cy, r, a0, a1, thick, u0, u1, jag, seed) {
  const N = 26; g.beginPath();
  for (let i = 0; i <= N; i++) { const u = u0 + (u1 - u0) * i / N, a = a0 + (a1 - a0) * u; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  for (let i = N; i >= 0; i--) {
    const u = u0 + (u1 - u0) * i / N, a = a0 + (a1 - a0) * u;
    let p = Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(Math.min(1, u), 1.35))), 0.75) * Math.min(1, (u - u0) / 0.14 + 0.05);
    if (jag) p *= 0.68 + 0.32 * Math.abs(Math.sin(u * 41 + seed) + Math.sin(u * 17 + seed * 2)) / 2;
    const ri = r - thick * p; g.lineTo(cx + Math.cos(a) * ri, cy + Math.sin(a) * ri);
  }
  g.closePath();
}

/* 베기 생성: 자동 공격은 올려베기 → 회전베기 → 내려찍기, 터치는 찌르기, 치명타는 X자 */
function addSlash(type, crit) {
  if (reduceMotion) return;
  const p = heroPivot(), style = slashStyle(), big = crit ? 1.2 : 1, base = { t: 0, dur: crit ? 300 : 230, style, crit, seed: Math.random() * 100, flat: 1 };
  const mk = o => slashes.push(Object.assign({}, base, o));
  if (type === "sweep") mk({ type, cx: p.x - 16, cy: p.y + 8, r: 98 * big, a0: Math.PI + 0.4, a1: -0.6, flat: 0.34, thick: 24 * big });
  else if (type === "rise") mk({ type, cx: p.x, cy: p.y, r: 86 * big, a0: ang2phi(2.35), a1: ang2phi(-0.55), thick: 24 * big });
  else if (type === "thrust") mk({ type, x0: p.x + 14, y: p.y - 6, len: 175, w: 9, dur: 170 });
  else mk({ type: "chop", cx: p.x, cy: p.y, r: 90 * big, a0: ang2phi(-1.4), a1: ang2phi(2.3), thick: 27 * big });
  if (crit) mk({ type: "x", t: -70, cx: MON_X + 92, cy: GROUND - 172, r: 150, a0: 3.0, a1: 1.45, thick: 30, dur: 300 });
  if (style === "fire") for (let i = 0; i < 7; i++) sparks.push({ x: MON_X - 20 + Math.random() * 40, y: GROUND - 40 - Math.random() * 60, vx: (Math.random() - .5) * 3, vy: -2 - Math.random() * 4, life: 1, c: i % 2 ? "#ffb13b" : "#ff5a1f" });
  if (slashes.length > 7) slashes.splice(0, slashes.length - 7);
}
function drawSlash(g, s, now) {
  const k = s.t / s.dur; if (k < 0 || k >= 1) return false;
  const pal = slashPal(s.style, s.crit, now);
  if (s.type === "thrust") {
    const hx = s.x0 + s.len * Math.min(1, k / 0.2), tx = s.x0 + s.len * Math.max(0, (k - 0.22) / 0.78), w = s.w * (1 - 0.5 * k);
    if (hx - tx < 6) return false;
    const arrow = (ww, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(tx, s.y); g.lineTo(hx - 26, s.y - ww); g.lineTo(hx, s.y); g.lineTo(hx - 26, s.y + ww); g.closePath(); g.fill(); };
    arrow(w * 1.6, pal[0]); arrow(w, pal[1]); arrow(w * 0.4, pal[2]);
    g.fillStyle = pal[1]; [-16, 14, -26].forEach((dy, i) => g.fillRect(tx + 20 + i * 18, s.y + dy, Math.max(0, (hx - tx) * 0.45), 2));
    return true;
  }
  const head = Math.min(1, k / 0.16), tail = k < 0.16 ? 0 : Math.pow((k - 0.16) / 0.84, 0.85), thin = 1 - 0.5 * k;
  const strands = s.style === "gold" || s.style === "holy" ? [[0, 1], [10, 0.42], [-10, 0.32], [18, 0.22]] : s.style === "steel" ? [[0, 1], [11, 0.3]] : [[0, 1], [11, 0.3], [-9, 0.24]];
  g.save(); g.translate(s.cx, s.cy); if (s.flat !== 1) g.scale(1, s.flat);
  let drew = false;
  strands.forEach(([dr, th], si) => {
    const r = s.r + dr, T = s.thick * th * thin, u0 = Math.min(head, tail + si * 0.05), u1 = head;
    if (u1 - u0 < 0.03 || T < 1) return;
    drew = true;
    g.fillStyle = pal[0]; crescentPath(g, 0, 0, r + T * 0.18, s.a0, s.a1, T * 1.35, u0, u1, s.style === "fire", s.seed); g.fill();
    g.fillStyle = pal[1]; crescentPath(g, 0, 0, r, s.a0, s.a1, T, u0, u1, s.style === "fire", s.seed + 1); g.fill();
    g.fillStyle = pal[2]; crescentPath(g, 0, 0, r, s.a0, s.a1, T * 0.42, u0, u1, false, 0); g.fill();
  });
  // 무기 성질별 덧붙임: 번개 지그재그, 얼음 조각, 별 반짝임, 금가루
  if (drew && k < 0.75) {
    const u0 = Math.min(head, tail), span = head - u0, at = u => { const a = s.a0 + (s.a1 - s.a0) * u; return [Math.cos(a), Math.sin(a)]; };
    if (s.style === "volt") {
      g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.beginPath();
      for (let i = 0; i <= 10; i++) { const u = u0 + span * i / 10, [c, sn] = at(u), rr = s.r - s.thick * 0.5 + (Math.random() - .5) * 22; g.lineTo(c * rr, sn * rr); }
      g.stroke();
    } else if (s.style === "ice" || s.style === "magic" || s.style === "gold" || s.style === "holy") {
      g.fillStyle = s.style === "ice" ? "#ffffff" : s.style === "magic" ? "#fff0fb" : "#fff7c2";
      for (let i = 0; i < 6; i++) {
        const u = u0 + span * ((i * 0.37 + s.seed) % 1), [c, sn] = at(u), rr = s.r - s.thick * (0.3 + (i % 3) * 0.35), x = c * rr, y = sn * rr, z = 4 + (i % 2) * 3;
        g.beginPath(); g.moveTo(x, y - z); g.lineTo(x + z * 0.45, y); g.lineTo(x, y + z); g.lineTo(x - z * 0.45, y); g.closePath(); g.fill();
      }
    }
  }
  g.restore();
  return drew;
}

/* 맞은 자리: 가시 별 + 끊어진 고리 */
function addBurst(x, y, crit) {
  if (reduceMotion) return;
  bursts.push({ x, y, t: 0, dur: crit ? 260 : 190, crit, rot: Math.random() * 6.28, seed: Math.random() * 100, style: slashStyle() });
  if (bursts.length > 8) bursts.shift();
}
function drawBurst(g, b, now) {
  const k = b.t / b.dur; if (k >= 1) return false;
  const pal = slashPal(b.style, b.crit, now), R = (b.crit ? 52 : 32) * (0.55 + 0.6 * Math.sqrt(k));
  g.save(); g.translate(b.x, b.y); g.rotate(b.rot);
  if (k < 0.55) {
    const n = b.crit ? 14 : 10; g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? R * 0.36 : R * (0.72 + 0.28 * Math.abs(Math.sin(i * 7.1 + b.seed))); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = pal[1]; g.fill();
    g.save(); g.scale(0.55, 0.55); g.fillStyle = pal[2]; g.fill(); g.restore();
  }
  g.strokeStyle = b.crit ? "#ff7a3b" : pal[1]; g.lineWidth = (b.crit ? 8 : 6) * (1 - k) + 2;
  const rr = 16 + k * (b.crit ? 84 : 58);
  for (let i = 0; i < 4; i++) { const s0 = i * Math.PI / 2 + 0.35; g.beginPath(); g.arc(0, 0, rr, s0, s0 + 0.85 * (1 - k * 0.5)); g.stroke(); }
  g.restore();
  return true;
}

/* 흙먼지 (발밑, 내려찍은 자리) */
function addDust(x, y, n, dir, big) {
  if (reduceMotion) return;
  for (let i = 0; i < n; i++) dusts.push({ x: x + (Math.random() - .5) * 16, y: y - Math.random() * 6, vx: dir * (0.6 + Math.random() * 2.4) + (Math.random() - .5) * 0.6, vy: -0.25 - Math.random() * 0.9, r: (big ? 10 : 6) + Math.random() * 6, life: 1, dur: 520 + Math.random() * 380 });
  if (dusts.length > 60) dusts.splice(0, dusts.length - 60);
}
function drawDusts(g) {
  if (!dusts.length) return false;
  dusts.forEach(d => {
    const a = Math.max(0, d.life);
    g.globalAlpha = 0.75 * a; g.fillStyle = "#6c6152"; g.beginPath(); g.arc(d.x, d.y + d.r * 0.25, d.r, 0, 6.283); g.fill();
    g.globalAlpha = 0.85 * a; g.fillStyle = "#b9ab92"; g.beginPath(); g.arc(d.x - d.r * 0.22, d.y - d.r * 0.18, d.r * 0.74, 0, 6.283); g.fill();
    g.globalAlpha = 0.6 * a; g.fillStyle = "#dcd0b8"; g.beginPath(); g.arc(d.x - d.r * 0.38, d.y - d.r * 0.36, d.r * 0.34, 0, 6.283); g.fill();
  });
  g.globalAlpha = 1; return true;
}

/* 바닥 섬광, 보스 착지 땅 솟음, 하늘 낙뢰, 폭발 */
function addGroundFlash(x, col) { if (!reduceMotion) gflashes.push({ x, t: 0, dur: 260, col: col || "#ffd54a" }); }
function addEruption(x, col) { if (!reduceMotion) eruptions.push({ x, t: 0, dur: 700, col, seed: Math.random() * 100 }); }
function addSkyStrike(x, big) { strikes.push({ x, t: 0, dur: big ? 560 : 400, big, seed: Math.random() * 100 }); if (strikes.length > 4) strikes.shift(); }
function addExplosion(x, y, big) { if (!reduceMotion) explos.push({ x, y, t: 0, dur: big ? 720 : 460, R: big ? 92 : 58, seed: Math.random() * 100 }); }
function jaggedDisc(g, x, y, r, seed, n = 16, amp = 0.18) {
  g.beginPath();
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = r * (1 - amp + amp * 2 * Math.abs(Math.sin(i * 2.7 + seed))); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath();
}
function drawGroundFx(g) {
  let drew = false;
  gflashes.forEach(f => {
    const k = f.t / f.dur; if (k >= 1) return; drew = true;
    g.save(); g.translate(f.x, GROUND - 2); g.scale(1, 0.2);
    g.globalAlpha = 1 - k; g.fillStyle = f.col; g.beginPath(); g.arc(0, 0, 70 + 70 * k, 0, 6.283); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(0, 0, (40 + 40 * k) * (1 - k * 0.6), 0, 6.283); g.fill();
    g.restore();
  });
  eruptions.forEach(e => {
    const k = e.t / e.dur; if (k >= 1) return; drew = true;
    const grow = k < 0.22 ? k / 0.22 : 1 - (k - 0.22) / 0.78 * 0.75;
    g.globalAlpha = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
    for (let i = 0; i < 11; i++) {
      const off = (i - 5) * 15 + Math.sin(e.seed + i) * 5, h = (26 + 52 * Math.abs(Math.sin(e.seed * 3 + i * 1.7))) * grow * (1 - Math.abs(i - 5) / 7), w = 6 + 5 * Math.abs(Math.sin(i * 2.3 + e.seed));
      if (h < 2) continue;
      g.fillStyle = e.col; g.beginPath(); g.moveTo(e.x + off - w, GROUND); g.lineTo(e.x + off + Math.sin(i * 1.3) * 6, GROUND - h); g.lineTo(e.x + off + w, GROUND); g.closePath(); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(e.x + off - w * 0.35, GROUND); g.lineTo(e.x + off + Math.sin(i * 1.3) * 6, GROUND - h * 0.85); g.lineTo(e.x + off + w * 0.35, GROUND); g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
  });
  strikes.forEach(s => {
    const k = s.t / s.dur; if (k >= 1) return; drew = true;
    const top = 74, bw = s.big ? 9 : 5;
    // 공중의 후광 고리
    if (k < 0.85) {
      const a = Math.min(1, k / 0.12, (0.85 - k) / 0.25);
      [[0, 0, 1], [-46, 22, 0.75], [44, 14, 0.8]].forEach(([dx, dy, sc], i) => {
        if (!s.big && i > 0) return;
        g.save(); g.globalAlpha = a; g.translate(s.x + dx, top + dy - k * 10); g.scale(1, 0.2);
        g.strokeStyle = "#ffb13b"; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 36 * sc * (0.7 + 0.3 * Math.min(1, k / 0.15)), 0, 6.283); g.stroke();
        g.strokeStyle = "#fff6cf"; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 36 * sc * (0.7 + 0.3 * Math.min(1, k / 0.15)), 0, 6.283); g.stroke();
        g.restore();
      });
      if (k < 0.4) { const z = 10 * (1 - k / 0.4) + 4; g.globalAlpha = 1; g.fillStyle = "#fff6cf"; g.beginPath(); g.moveTo(s.x, top - 30 - z); g.lineTo(s.x + z * 0.5, top - 30); g.lineTo(s.x, top - 30 + z); g.lineTo(s.x - z * 0.5, top - 30); g.closePath(); g.fill(); }
    }
    // 내리꽂는 번개
    if (k > 0.08 && k < 0.55) {
      const bk = (k - 0.08) / 0.47, w = bw * (1 - bk * 0.7), jit = Math.sin(s.seed + k * 40) * 4;
      [[w * 1.8, "#ff9a1f"], [w, "#ffd54a"], [w * 0.4, "#ffffff"]].forEach(([ww, c]) => { g.globalAlpha = 1; g.fillStyle = c; g.beginPath(); g.moveTo(s.x, top); g.lineTo(s.x + ww, (top + GROUND) / 2); g.lineTo(s.x + jit, GROUND); g.lineTo(s.x - ww, (top + GROUND) / 2); g.closePath(); g.fill(); });
    }
    // 땅에서 튀는 가시 먼지 + 전기 불꽃
    if (k > 0.15) {
      const dk = (k - 0.15) / 0.85, a = 1 - dk;
      g.globalAlpha = a * 0.9; g.fillStyle = "#b9a184";
      for (let i = 0; i < 7; i++) { const off = (i - 3) * 9, h = (22 + 26 * Math.abs(Math.sin(s.seed + i * 2.1))) * Math.min(1, dk * 4) * (1 - Math.abs(i - 3) / 5); g.beginPath(); g.moveTo(s.x + off - 6, GROUND); g.lineTo(s.x + off + (i - 3) * 3, GROUND - h); g.lineTo(s.x + off + 6, GROUND); g.closePath(); g.fill(); }
      if (dk < 0.5) { g.strokeStyle = "#e6f6ff"; g.lineWidth = 2; g.globalAlpha = 1 - dk * 2; for (let i = 0; i < 4; i++) { const sx = s.x + (i - 1.5) * 16; g.beginPath(); g.moveTo(sx, GROUND - 2); g.lineTo(sx + (i - 1.5) * 8 + (Math.random() - .5) * 6, GROUND - 14 - Math.random() * 10); g.lineTo(sx + (i - 1.5) * 14, GROUND - 6); g.stroke(); } }
      g.globalAlpha = 1;
    }
  });
  explos.forEach(e => {
    const k = e.t / e.dur; if (k >= 1) return; drew = true;
    const r = e.R * (0.3 + 0.7 * (1 - Math.pow(1 - k, 3)));
    if (k < 0.55) {
      [["#5a0f0a", 1], ["#c0280f", 0.86], ["#ff7a1a", 0.7], ["#ffd54a", 0.52], ["#ffffff", 0.32 * (1 - k * 1.4)]].forEach(([c, f], i) => { if (f <= 0) return; g.fillStyle = c; jaggedDisc(g, e.x, e.y, r * f, e.seed + i * 3); g.fill(); });
    } else {
      const sk = (k - 0.55) / 0.45; g.globalAlpha = 1 - sk;
      g.strokeStyle = "#2a1a14"; g.lineWidth = 14 * (1 - sk) + 2; jaggedDisc(g, e.x, e.y - sk * 14, r * (1 + sk * 0.25), e.seed, 14, 0.12); g.stroke();
      g.strokeStyle = "#7a2a10"; g.lineWidth = 5 * (1 - sk) + 1; g.stroke();
      g.globalAlpha = 1;
    }
  });
  return drew;
}

/* 버프가 켜져 있으면 발밑에서 도는 소용돌이 */
function drawBuffVortex(g, hx, now) {
  const act = ["haste", "gold2", "rage"].filter(b => S.active[b] > 0); if (idolBuff.t > 0) act.push("idol"); if (!act.length || reduceMotion) return false;
  const col = { haste: "#6fd3ff", gold2: "#ffd54a", rage: "#ff4a4a", idol: "#ff8fc8" }[act[act.length - 1]];
  g.save(); g.translate(hx + 36, GROUND - 2); g.scale(1, 0.26); g.strokeStyle = col;
  for (let i = 0; i < 3; i++) { const r = 42 + i * 15, s0 = now / (240 + i * 90) * (i % 2 ? -1 : 1); g.globalAlpha = 0.75 - i * 0.18; g.lineWidth = 8 - i * 2; g.beginPath(); g.arc(0, 0, r, s0, s0 + 4.2); g.stroke(); }
  g.restore(); return true;
}

/* 1/3 해상도 픽셀 레이어로 그리기 (glow면 흐린 빛을 아래에 한 번 더) */
function pixelPass(fn, glow) {
  if (!pxCan) { pxCan = document.createElement("canvas"); pxCan.width = PXW; pxCan.height = PXH; pxCtx = pxCan.getContext("2d"); }
  if (!pxCtx || !pxCtx.setTransform) return;
  pxCtx.setTransform(1, 0, 0, 1, 0, 0); pxCtx.clearRect(0, 0, PXW, PXH); pxCtx.setTransform(1 / PXS, 0, 0, 1 / PXS, 0, 0);
  if (!fn(pxCtx)) return;
  ctx.save();
  if (glow) {
    if (!glCan) { glCan = document.createElement("canvas"); glCan.width = Math.ceil(PXW / 3); glCan.height = Math.ceil(PXH / 3); glCtx = glCan.getContext("2d"); }
    if (glCtx) {
      glCtx.clearRect(0, 0, glCan.width, glCan.height); glCtx.imageSmoothingEnabled = true; glCtx.drawImage(pxCan, 0, 0, glCan.width, glCan.height);
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.75; ctx.imageSmoothingEnabled = true; ctx.drawImage(glCan, 0, 0, W, H);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
  }
  ctx.imageSmoothingEnabled = false; ctx.drawImage(pxCan, 0, 0, PXW * PXS, PXH * PXS);
  ctx.restore();
}
function drawPixelFx(now, hx) {
  if (reduceMotion && !strikes.length) return;
  pixelPass(g => drawDusts(g), false);
  pixelPass(g => {
    let d = drawBuffVortex(g, hx, now);
    if (drawGroundFx(g)) d = true;
    if (drawPetFx(g)) d = true;
    slashes.forEach(s => { if (drawSlash(g, s, now)) d = true; });
    bursts.forEach(b => { if (drawBurst(g, b, now)) d = true; });
    return d;
  }, true);
}
function fx4Phys(dt) {
  const k = dt / 16;
  slashes.forEach(s => s.t += dt); slashes = slashes.filter(s => s.t < s.dur);
  bursts.forEach(b => b.t += dt); bursts = bursts.filter(b => b.t < b.dur);
  [gflashes, eruptions, strikes, explos].forEach(a => a.forEach(o => o.t += dt));
  gflashes = gflashes.filter(o => o.t < o.dur); eruptions = eruptions.filter(o => o.t < o.dur); strikes = strikes.filter(o => o.t < o.dur); explos = explos.filter(o => o.t < o.dur);
  dusts.forEach(d => { d.x += d.vx * k; d.y += d.vy * k; d.vx *= Math.pow(0.94, k); d.vy *= Math.pow(0.95, k); d.r += 0.26 * k; d.life -= dt / d.dur; });
  dusts = dusts.filter(d => d.life > 0);
}

/* 만화식 임팩트 프레임: 순간 흑백 반전 + 집중 광선 (치명타·보스 처치, 0.9초에 한 번까지) */
function triggerImpactFrame(x, y, force) {
  if (reduceMotion) return; const now = performance.now();
  if (!force && now - lastImpactF < 900) return; lastImpactF = now;
  impactF = { t: 0, x, y, seed: Math.random() * 6.28 };
}
