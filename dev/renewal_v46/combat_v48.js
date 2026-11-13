/* ===================== v48 영웅서기5식 연출 레이어: 타격 · 스킬 · 몬스터 · 보스 · 빛 번짐 =====================
   사용자(11-13): "영웅서기5에 들어간 캐릭터·스킬·타격·이펙트·몬스터·보스 연출 양식 코드를 곽준영키우기에 가져와서 고도화" ·
   "이미 모든 자료가 다 있는데 그거 토대로" · 범위: 타격 이펙트, 스킬 연출, 몬스터 반응, 보스 연출 전부.
   토대: 영웅서기5 아이폰 플레이어(b4wkwrbtms-cpu/heroes-lore-3-web · wie-web/public/hl5/hl5.js, 우리가 만든 코드)의
     Fx 클래스(게임 픽셀 격자에 맞춘 불꽃·빛·베기 선·치명타 별·고리, 한 방향 흔들림)와 빛 번짐 셰이더(FS_BRIGHT: 밝고 색 있는 부분만).
   그 값(크기·속도·감쇠)을 곽준영키우기 픽셀 층 격자(PXS=3, 640x360 → 213x120)에 그대로 옮기고, 스킬·몬스터·보스로 넓힘.
   ① 타격: 픽셀 불꽃(밝은 머리 + 2칸 꼬리) · 둥근 빛 · 픽셀 베기 선 · 치명타 8갈래 별 · 납작한 픽셀 고리 · 몬스터 몸 색 파편
   ② 흔들림: 한 방향으로 흔들렸다 잦아드는 흔들림 — 기존 트라우마 흔들림 위에 더함 (설정 '화면 흔들림'·동작 줄이기 따름)
   ③ 몬스터: 처치하면 몸이 그림 칸 그대로 픽셀 조각으로 부서져 흩어짐(맞은 쪽부터) + 고리 두 겹 + 솟는 불씨
   ④ 스킬: 손으로 모이는 빛 알갱이 + 줄어드는 고리 + 화면 가장자리 어둡게 → 맞는 순간 큰 별 · 고리 세 겹 · 빛 번짐 순간 강하게
   ⑤ 보스: 착지 충격파 · 체력 절반에서 격노(붉은 고리 · 울림 · 몸에서 불씨) · 처치 때 몸 곳곳 연쇄 폭발 + 큰 부서짐
   ⑥ 빛 번짐: 장면을 1/5로 줄여 밝고 색 있는 곳만 남기고(흰 글자·회색 판 제외) 흐리게 키워 더함 — 캔버스 합성만 써서 픽셀을 읽지 않음, 두 프레임에 한 번 계산
   번쩍임은 새로 만들지 않음(기존 1초 3번 안전 장치 그대로). 설정 › 화면 설정 아래 '타격 연출' 카드. */
function fx48K() { const f = fxSet(), v = f.hl == null ? 1 : +f.hl; return v >= 0 && v <= 1.4 ? v : 1; }
function fx48BloomK() { const f = fxSet(), v = f.bloom == null ? 1 : +f.bloom; return v >= 0 && v <= 1 ? v : 1; }
var fx48 = { parts: [], glows: [], cuts: [], stars: [], rings: [], chips: [], shards: [], motes: [], embers: [], chain: [],
  vig: 0, vigCol: "0,0,0", spike: 0, sway: 0, swayT: 0, swayAng: 0, last: 0, hitT: 0, petT: 0, emberT: 0 };
const FX48_CAP = 420;
function fx48Pal() { try { const p = feelFxPal(performance.now()); return [p[0] || "#ffb13b", p[1] || "#fff7c2"]; } catch (e) { return ["#ffb13b", "#fff7c2"]; } }
function fx48Push(arr, o) { arr.push(o); if (arr.length > FX48_CAP) arr.shift(); }
/* 한 방향 흔들림 (hl5 Fx.kick): 더 센 요청만 받음 */
function fx48Kick(px) {
  if (reduceMotion) px *= 0.3;
  if (!(px > fx48.sway)) return;
  fx48.sway = px; fx48.swayT = 0; fx48.swayAng = Math.random() * Math.PI * 2;
}
/* 몬스터 몸 색 */
function fx48MonCols(m) {
  const p = (m && m.pal) || {}, out = [];
  for (const k in p) { const c = p[k]; if (typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c) && k !== "k") out.push(c); }
  return out.length ? out : ["#c9cfe0"];
}
function fx48Chips(x, y, n, k) {
  if (!mon) return;
  const cols = fx48MonCols(mon), G = PXS;
  for (let i = 0; i < n; i++) fx48Push(fx48.chips, { x, y, vx: (1 + Math.random() * 2.4) * G * k * 0.6, vy: (-1.6 - Math.random() * 1.8) * G * 0.6, life: 1, decay: 0.022 + Math.random() * 0.02, w: Math.random() < 0.3 ? 2 : 1, c: cols[Math.floor(Math.random() * cols.length)] });
}
/* 맞은 자리: hl5 Fx.hit 값 그대로 (게임 픽셀 = 우리 격자 한 칸) */
function fx48Hit(x, y, crit, big, small) {
  const k = fx48K(); if (!k || x == null || y == null) return;
  const now = performance.now(), G = PXS, red = reduceMotion ? 0.5 : 1;
  if (small) { if (now - fx48.petT < 80) return; fx48.petT = now; }
  else if (!crit && !big && now - fx48.hitT < 45) return;
  if (!small) fx48.hitT = now;
  const [c0, c1] = fx48Pal(), hot = crit || big;
  const n = Math.round((small ? 4 : big ? 26 : crit ? 18 : 10) * k * red);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = (hot ? 2.6 : 2) * (0.5 + Math.random()) * Math.min(k, 1.2);
    fx48Push(fx48.parts, { x, y, vx: Math.cos(a) * sp * G * 0.5, vy: (Math.sin(a) * sp - 0.6) * G * 0.5, life: 1, decay: 0.04 + Math.random() * 0.035, w: hot && i % 3 === 0 ? 2 : 1, c: hot ? (i % 2 ? "#ffd54a" : c1) : (i % 2 ? c0 : c1) });
  }
  if (small) return;
  fx48Push(fx48.glows, { x, y, r: (big ? 34 : crit ? 24 : 16) * k * G, life: 1, decay: hot ? 0.075 : 0.11, c: hot ? "#ffd54a" : c0 });
  const ang = -0.6 + Math.random() * 1.2 + (Math.random() < 0.5 ? 0 : Math.PI / 2);
  fx48Push(fx48.cuts, { x, y, ang, len: (big ? 40 : crit ? 30 : 22) * k * G, life: 1, decay: crit ? 0.1 : 0.14, c: hot ? "#ffd54a" : c0 });
  if (hot) {
    fx48Push(fx48.stars, { x, y, len: (big ? 21 : 13) * k * G, life: 1, decay: big ? 0.06 : 0.085 });
    fx48Push(fx48.rings, { x, y, r: 5 * G, vr: 2.8 * k * G, life: 1, decay: 0.065, c: "#ffd54a", sq: 0.6 });
    if (big) {
      fx48Push(fx48.rings, { x, y, r: 3 * G, vr: 2 * k * G, life: 1, decay: 0.05, c: c0, sq: 0.6 });
      fx48Push(fx48.rings, { x, y, r: 8 * G, vr: 3.6 * k * G, life: 1, decay: 0.075, c: "#ffffff", sq: 0.6 });
      fx48.spike = 1;
    }
  }
  fx48Chips(x, y, hot ? 7 : 3, k);
  fx48Kick((big ? 4.2 : crit ? 3.6 : 1.5) * k);
}
/* 처치: hl5 Fx.kill (고리 두 겹 + 솟는 알갱이) */
function fx48KillAt(x, y, big) {
  const k = fx48K(); if (!k) return; const G = PXS;
  fx48Push(fx48.rings, { x, y, r: 4 * G, vr: 2.4 * k * G * (big ? 1.6 : 1), life: 1, decay: 0.05, c: "#ff8a3a", sq: 0.6 });
  fx48Push(fx48.rings, { x, y, r: 2 * G, vr: 1.6 * k * G * (big ? 1.6 : 1), life: 1, decay: 0.045, c: "#ffd54a", sq: 0.6 });
  for (let i = 0; i < 14 * k * (big ? 2 : 1); i++) {
    const a = Math.random() * Math.PI * 2, sp = 1.2 * (0.4 + Math.random()) * k;
    fx48Push(fx48.parts, { x, y, vx: Math.cos(a) * sp * G * 0.5, vy: (Math.sin(a) * sp - 0.9) * G * 0.5, life: 1, decay: 0.03 + Math.random() * 0.03, w: 1, c: i % 2 ? "#ffb13b" : "#ff6a3a" });
  }
  fx48Kick((big ? 5 : 2.7) * k);
}
/* 몸이 그림 칸 그대로 부서짐: 맞은 쪽(왼쪽)부터 */
function fx48Shatter(m, big) {
  if (!m || !SPR[m.sprite] || fx48K() <= 0) return;
  const map = SPR[m.sprite], pal = m.pal || {}, sc = m.scale, rows = map.length, cols = map[0].length, w = cols * sc, h = rows * sc;
  const cx = MON_X + monOX() + (m.kb || 0) * 26 + (m.fx || 0), by = GROUND + (m.fy || 0), midY = by - h * 0.5;
  let cells = 0; map.forEach(r => { for (let i = 0; i < r.length; i++) if (r[i] !== "." && pal[r[i]]) cells++; });
  const cap = (big ? 460 : 260) * (reduceMotion ? 0.5 : 1), step = Math.max(1, Math.ceil(Math.sqrt(cells / cap))), pw = big ? 1.35 : 1;
  for (let r = 0; r < rows; r += step) for (let c = 0; c < cols; c += step) {
    const ch = map[r][c]; if (ch === "." || !pal[ch]) continue;
    const x = cx - w / 2 + (cols - 1 - c + 0.5) * sc, y = by - h + (r + 0.5) * sc;
    const dx = x - cx, dy = y - midY, L = Math.hypot(dx, dy) || 1, sp = (1.2 + Math.random() * 2.6) * pw;
    fx48.shards.push({ x, y, vx: dx / L * sp + 1.6 + Math.random() * 2.4, vy: dy / L * sp - 2.2 - Math.random() * 3.2, s: sc * step, c: pal[ch], life: 1,
      wait: ((x - (cx - w / 2)) / w) * (big ? 260 : 140) + Math.random() * 60 });
  }
  if (fx48.shards.length > 900) fx48.shards.splice(0, fx48.shards.length - 900);
  m.shat = true;
}
/* 스킬 쓰는 순간: 손으로 모이는 알갱이 + 줄어드는 고리 + 가장자리 어둡게 */
const FX48_SKCOL = { stamp: "#ff5d5d", rush: "#ffb13b", night: "#9b8cff", party: "#ffd54a", resign: "#bfe3ff" };
function fx48Cast(s) {
  const k = fx48K(); if (!k) return;
  const col = FX48_SKCOL[s && s.id] || fx48Pal()[0], hx = (typeof heroHand !== "undefined" && heroHand.x) || HERO_X + 40, hy = (typeof heroHand !== "undefined" && heroHand.y) || GROUND - 60;
  for (let i = 0; i < Math.round(26 * Math.min(1, k)); i++) { const a = Math.random() * Math.PI * 2, R = 70 + Math.random() * 50; fx48.motes.push({ x0: hx + Math.cos(a) * R, y0: hy + Math.sin(a) * R * 0.7, x1: hx, y1: hy, t: -Math.random() * 120, dur: 300, c: i % 3 ? col : "#ffffff" }); }
  fx48Push(fx48.rings, { x: hx, y: hy, r: 22 * PXS, vr: -1.3 * PXS, life: 1, decay: 0.06, c: col, sq: 0.8 });
  fx48.vig = 1; fx48.vigCol = s && s.id === "night" ? "20,8,48" : s && s.id === "stamp" ? "40,4,8" : "0,0,0";
  fx48Kick(1.2 * k);
}
/* 보스 착지 충격파 */
function fx48Land() {
  const k = fx48K(); if (!k || !mon) return; const G = PXS, x = MON_X + monOX(), y = GROUND - 4;
  [[3, 3.4, "#ffffff"], [2, 2.4, "#ffd54a"], [5, 4.4, "#c9cfe0"]].forEach(([r, vr, c]) => fx48Push(fx48.rings, { x, y, r: r * G, vr: vr * k * G, life: 1, decay: 0.045, c, sq: 0.3 }));
  for (let i = 0; i < 18 * k; i++) fx48Push(fx48.chips, { x: x + (Math.random() - .5) * 90, y, vx: (Math.random() - .5) * 7, vy: -2 - Math.random() * 5, life: 1, decay: 0.025, w: 1, c: i % 2 ? "#8a90a8" : "#c9cfe0" });
  fx48Kick(5.5 * k);
}
/* 보스 체력 절반: 격노 */
function fx48Rage(m) {
  const k = fx48K(); if (!k) return; const G = PXS, { h } = monSize(m), x = MON_X + monOX(), y = GROUND - h * 0.5;
  m.red = 1; fx48.spike = Math.max(fx48.spike, 0.7);
  [[4, 3.2, "#ff3b3b"], [2, 2.2, "#ff9a3a"]].forEach(([r, vr, c]) => fx48Push(fx48.rings, { x, y, r: r * G, vr: vr * k * G, life: 1, decay: 0.04, c, sq: 0.6 }));
  if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 12);
  fx48Kick(4.5 * k);
  tone(72, 0.55, "sawtooth", 0.07, 0, 44); tone(54, 0.7, "square", 0.04, 0.05, 36);
  say(m.kind >= 3 ? "드래곤이 분노했다... 버텨야 해!" : `${m.name}님 표정이 바뀌었다... 조심!`, 2.4);
}
/* 보스 처치: 몸 곳곳 연쇄 폭발 */
function fx48BossChain(m) {
  const { w, h } = monSize(m), x0 = MON_X + monOX();
  for (let i = 0; i < 5; i++) fx48.chain.push({ at: performance.now() + 70 + i * 110, x: x0 + (Math.random() - .5) * w * 0.7, y: GROUND - h * (0.2 + Math.random() * 0.65), last: i === 4 });
}
/* ---------- 물리 (실제 시간, 히트스톱 중에도 흐름 — hl5와 같음) ---------- */
function fx48Step(now) {
  const dt = fx48.last ? Math.min(100, Math.max(0, now - fx48.last)) : 16.7; fx48.last = now;
  const f = Math.min(dt / 16.7, 3);
  for (const p of fx48.parts) { p.x += p.vx * f; p.y += p.vy * f; p.vy += 0.24 * f; p.vx *= Math.pow(0.96, f); p.life -= p.decay * f; }
  for (const r of fx48.rings) { r.r = Math.max(0, r.r + r.vr * f); r.vr *= Math.pow(0.93, f); r.life -= r.decay * f; }
  for (const g of fx48.glows) g.life -= g.decay * f;
  for (const c of fx48.cuts) c.life -= c.decay * f;
  for (const b of fx48.stars) b.life -= b.decay * f;
  for (const c of fx48.chips) { c.x += c.vx * f; c.y += c.vy * f; c.vy += 0.42 * f; c.vx *= Math.pow(0.97, f); if (c.y > GROUND - 2) { c.y = GROUND - 2; c.vy *= -0.35; c.vx *= 0.6; } c.life -= c.decay * f; }
  for (const e of fx48.embers) { e.x += e.vx * f; e.y += e.vy * f; e.vy -= 0.02 * f; e.life -= e.decay * f; }
  for (const m of fx48.motes) m.t += dt;
  for (const s of fx48.shards) {
    if (s.wait > 0) { s.wait -= dt; continue; }
    s.x += s.vx * f; s.y += s.vy * f; s.vy += 0.45 * f; s.vx *= Math.pow(0.985, f);
    if (s.y > GROUND - s.s / 2) { s.y = GROUND - s.s / 2; s.vy *= -0.32; s.vx *= 0.7; }
    s.life -= 0.019 * f;
  }
  const alive = o => o.life > 0;
  fx48.parts = fx48.parts.filter(alive); fx48.rings = fx48.rings.filter(r => r.life > 0 && r.r > 0.5); fx48.glows = fx48.glows.filter(alive); fx48.cuts = fx48.cuts.filter(alive);
  fx48.stars = fx48.stars.filter(alive); fx48.chips = fx48.chips.filter(alive); fx48.embers = fx48.embers.filter(alive); fx48.shards = fx48.shards.filter(alive);
  fx48.motes = fx48.motes.filter(m => m.t < m.dur);
  fx48.vig = Math.max(0, fx48.vig - dt / 620); fx48.spike = Math.max(0, fx48.spike - dt / 420);
  fx48.swayT += dt; fx48.sway = fx48.sway < 0.15 ? 0 : fx48.sway * Math.pow(0.84, f);
  // 보스 연쇄 폭발
  if (fx48.chain.length) {
    const due = fx48.chain.filter(c => now >= c.at); fx48.chain = fx48.chain.filter(c => now < c.at);
    due.forEach(c => { fx48Hit(c.x, c.y, true, c.last, false); fx48KillAt(c.x, c.y, c.last); if (!reduceMotion) shakeAmt = Math.max(shakeAmt, c.last ? 16 : 8); hitSound(c.last ? 1.5 : 1); });
  }
  // 보스 격노 + 불씨
  if (mon && mon.kind >= 2 && !mon.dying && mon.max > 0 && fx48K() > 0) {
    if (!mon.rage48 && mon.hp <= mon.max * 0.5 && !(intro && !intro.light && intro.t < intro.dur)) { mon.rage48 = 1; fx48Rage(mon); }
    if (mon.rage48 && now - fx48.emberT > (reduceMotion ? 260 : 110)) {
      fx48.emberT = now; const { w, h } = monSize();
      fx48Push(fx48.embers, { x: MON_X + monOX() + (Math.random() - .5) * w * 0.6, y: GROUND - h * (0.15 + Math.random() * 0.7), vx: (Math.random() - .5) * 0.5, vy: -0.6 - Math.random() * 0.8, life: 1, decay: 0.012 + Math.random() * 0.01, c: Math.random() < 0.5 ? "#ff5a1f" : "#ffb13b" });
    }
  }
}
/* ---------- 그리기: 픽셀 층(격자 한 칸 = PXS) ---------- */
function fx48DrawPx(g) {
  const F = fx48, busy = F.parts.length || F.rings.length || F.glows.length || F.cuts.length || F.stars.length || F.chips.length || F.embers.length || F.motes.length;
  if (!busy) return false;
  const G = PXS;
  const dot = (x, y, size) => g.fillRect(Math.round(x / G - size / 2) * G, Math.round(y / G - size / 2) * G, size * G, size * G);
  const line = (x0, y0, x1, y1, size) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / G)); for (let i = 0; i <= n; i++) dot(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, size); };
  g.save(); g.globalCompositeOperation = "lighter";
  for (const o of F.glows) {
    const r = o.r * (1.2 - o.life * 0.4), gr = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
    gr.addColorStop(0, hexA(mixHex(o.c, "#ffffff", 0.55), 0.8 * o.life)); gr.addColorStop(0.35, hexA(o.c, 0.4 * o.life)); gr.addColorStop(1, hexA(o.c, 0));
    g.fillStyle = gr; g.fillRect(o.x - r, o.y - r, r * 2, r * 2);
  }
  for (const s of F.cuts) {
    const grow = 1.25 - s.life * 0.25, half = s.len * grow / 2, dx = Math.cos(s.ang) * half, dy = Math.sin(s.ang) * half * 0.8;
    g.fillStyle = hexA(s.c, 0.5 * s.life); line(s.x - dx, s.y - dy, s.x + dx, s.y + dy, s.life > 0.5 ? 3 : 2);
    g.fillStyle = `rgba(255,255,240,${s.life})`; line(s.x - dx * 0.85, s.y - dy * 0.85, s.x + dx * 0.85, s.y + dy * 0.85, 1);
  }
  for (const b of F.stars) {   // 4갈래 긴 빛 + 4갈래 짧은 빛
    const len = b.len * (1.35 - b.life * 0.35);
    g.fillStyle = `rgba(255,250,215,${b.life})`;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, l = i % 2 ? len * 0.55 : len, r0 = len * 0.18 * (1 - b.life); line(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0 * 0.8, b.x + Math.cos(a) * l, b.y + Math.sin(a) * l * 0.8, 1); }
    g.fillStyle = `rgba(255,220,120,${0.8 * b.life})`; dot(b.x, b.y, 3);
  }
  for (const p of F.parts) {   // 밝은 머리 + 흐려지는 꼬리 두 칸
    g.fillStyle = hexA(mixHex(p.c, "#ffffff", 0.25 + 0.5 * p.life), p.life); dot(p.x, p.y, p.w);
    g.fillStyle = hexA(p.c, 0.45 * p.life); dot(p.x - p.vx * 0.9, p.y - p.vy * 0.9, 1); dot(p.x - p.vx * 1.8, p.y - p.vy * 1.8, 1);
  }
  for (const r of F.rings) {
    g.fillStyle = hexA(mixHex(r.c, "#ffffff", 0.3), 0.8 * r.life);
    const n = Math.max(12, Math.ceil(r.r / G * 4.2));
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; dot(r.x + Math.cos(a) * r.r, r.y + Math.sin(a) * r.r * (r.sq || 0.6), 1); }
  }
  for (const e of F.embers) { g.fillStyle = hexA(e.c, Math.min(1, e.life * 1.6)); dot(e.x, e.y, 1); g.fillStyle = hexA(e.c, 0.35 * e.life); dot(e.x - e.vx * 2, e.y - e.vy * 2, 1); }
  for (const m of F.motes) {
    const k = Math.max(0, Math.min(1, m.t / m.dur)); if (m.t < 0) continue; const e = k * k;
    g.fillStyle = hexA(m.c, 0.4 + 0.6 * k); dot(m.x0 + (m.x1 - m.x0) * e, m.y0 + (m.y1 - m.y0) * e, k > 0.7 ? 2 : 1);
  }
  g.globalCompositeOperation = "source-over";
  for (const c of F.chips) { g.fillStyle = hexA(c.c, Math.min(1, c.life * 1.5)); dot(c.x, c.y, c.w); }
  g.restore();
  return true;
}
/* 몸 조각과 스킬 어둠은 큰 화면(월드) 위에 */
function fx48DrawWorld() {
  const F = fx48;
  if (F.vig > 0 && !reduceMotion) {
    const a = 0.42 * Math.min(1, F.vig * 1.6) * Math.min(1, fx48K()), cx = (HERO_X + MON_X) / 2, cy = GROUND - 80;
    const gr = ctx.createRadialGradient(cx, cy, 80, cx, cy, 420);
    gr.addColorStop(0, `rgba(${F.vigCol},0)`); gr.addColorStop(0.55, `rgba(${F.vigCol},${a * 0.55})`); gr.addColorStop(1, `rgba(${F.vigCol},${a})`);
    ctx.fillStyle = gr; ctx.fillRect(cx - 700, cy - 500, 1400, 1000);
  }
  if (F.shards.length) {
    ctx.save();
    for (const s of F.shards) { ctx.globalAlpha = Math.max(0, Math.min(1, s.life * 1.8)); ctx.fillStyle = s.c; ctx.fillRect(Math.round(s.x - s.s / 2), Math.round(s.y - s.s / 2), Math.ceil(s.s), Math.ceil(s.s)); }
    ctx.restore();
  }
}
/* ---------- 빛 번짐 (hl5 FS_BRIGHT + 흐림): 밝고 색 있는 부분만 ----------
   셰이더 대신 캔버스 합성으로(픽셀을 CPU로 읽지 않아 아이폰에서 멈칫하지 않음):
   작은 장면 A → 회색 판에 A의 밝기만(luminosity) = 무채색 D → |A − D|(difference) = 색이 진한 정도 →
   A³(multiply 두 번) = 밝은 정도 → 둘을 곱함(multiply): 흰 글자·회색 판은 0, 불·마법·불꽃만 남음 → 네 배로 키우고 반으로 줄였다 늘려 흐림 */
var fx48Bl = { n: 0, ok: true, w: 0, h: 0 };
function fx48BlCan(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function fx48Bloom() {
  const v = fx48BloomK(); if (!v || !fx48Bl.ok) return;
  const cv = ctx.canvas; if (!cv || !cv.width) return;
  const B = fx48Bl, w = Math.max(32, Math.round(cv.width / 5)), h = Math.max(18, Math.round(cv.height / 5));
  if (B.w !== w || B.h !== h) {
    [B.a, B.ax] = fx48BlCan(w, h); [B.d, B.dx] = fx48BlCan(w, h); [B.m, B.mx] = fx48BlCan(w, h); [B.o, B.ox] = fx48BlCan(w, h); [B.s, B.sx] = fx48BlCan(Math.ceil(w / 2), Math.ceil(h / 2));
    B.w = w; B.h = h; B.n = 0;
    if (!B.ax || !B.dx || !B.mx || !B.ox || !B.sx) { B.ok = false; return; }
  }
  if (B.n++ % 2 === 0) {
    try {
      const op = (g, mode, src, alpha) => { g.globalCompositeOperation = mode; g.globalAlpha = alpha == null ? 1 : alpha; g.drawImage(src, 0, 0, g.canvas.width, g.canvas.height); };
      B.ax.imageSmoothingEnabled = true; op(B.ax, "copy", cv);                                      // A
      B.dx.globalCompositeOperation = "copy"; B.dx.fillStyle = "#808080"; B.dx.fillRect(0, 0, w, h); op(B.dx, "luminosity", B.a);   // D = A의 밝기만
      op(B.dx, "difference", B.a);                                                                  // |A − D|
      op(B.mx, "copy", B.a); op(B.mx, "multiply", B.a); op(B.mx, "multiply", B.a);                // A³
      op(B.mx, "multiply", B.d);                                                                    // A³ · |A − D|
      op(B.ox, "copy", B.m); op(B.ox, "lighter", B.m); op(B.ox, "lighter", B.ox);                  // 네 배
      B.sx.imageSmoothingEnabled = true; op(B.sx, "copy", B.o);                                     // 흐림(반으로)
      [B.ax, B.dx, B.mx, B.ox, B.sx].forEach(g => { g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; });
    } catch (e) { B.ok = false; return; }
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "lighter"; ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = Math.min(1, 0.6 * v + 0.45 * fx48.spike); ctx.drawImage(B.s, 0, 0, cv.width, cv.height);
  ctx.globalAlpha = Math.min(1, 0.3 * v + 0.3 * fx48.spike); ctx.drawImage(B.o, 0, 0, cv.width, cv.height);
  ctx.restore();
}
/* ---------- 이어 붙이기 ---------- */
(function () {
  const hit0 = hit;
  hit = function (amount, crit, src, px, py) {
    const alive = !!(mon && !mon.dying);
    const r = hit0.apply(this, arguments);
    if (alive && fx48K() > 0) {
      const heavy = src === "hero" || src === "tap" || src === "jhero" || src === "skill", small = src === "pet" || src === "clone";
      if (heavy || small) {
        let x = px, y = py; if (x == null || y == null) { try { [x, y] = monHitPoint(); } catch (e) { x = MON_X - 14; y = GROUND - 80; } }
        fx48Hit(x, y, !!crit, src === "skill", small);
      }
    }
    return r;
  };
  const kill0 = kill;
  kill = function () {
    const m = mon, was = !!(m && !m.dying);
    const r = kill0.apply(this, arguments);
    if (was && m && m.dying && fx48K() > 0) {
      const { h } = monSize(m), big = m.kind >= 2;
      fx48KillAt(MON_X + monOX(), GROUND - h * 0.45, big);
      fx48Shatter(m, big);
      if (big) fx48BossChain(m);
    }
    return r;
  };
  const cs0 = castSkill;
  castSkill = function (s, auto) { const ok = cs0.apply(this, arguments); if (ok) fx48Cast(s); return ok; };
  const bl0 = bossLand;
  bossLand = function () { const r = bl0.apply(this, arguments); fx48Land(); return r; };
  const px0 = drawPixelFx;
  drawPixelFx = function (now, hx) {
    const r = px0.apply(this, arguments);
    fx48Step(performance.now());
    fx48DrawWorld();
    pixelPass(g => fx48DrawPx(g), true);
    return r;
  };
  const fv0 = feelView;
  feelView = function (now) {
    const r = fv0.apply(this, arguments);
    if (fx48.sway > 0) { const k = shakeK(), v = Math.sin(fx48.swayT * 0.09) * fx48.sway * k; bgShx += Math.cos(fx48.swayAng) * v; bgShy += Math.sin(fx48.swayAng) * v * 0.7; }
    return r;
  };
  const dr0 = draw;
  draw = function (t) { const r = dr0.apply(this, arguments); fx48Bloom(); return r; };
  const fc0 = buildFxCard;
  buildFxCard = function () { const r = fc0.apply(this, arguments); fx48Card(); return r; };
})();
function fx48Card() {
  const card = el("div", "card fxset fx48");
  const seg = (id, lbl, opts) => `<div class="fx-row"><span>${lbl}</span><div class="seg" role="group" aria-label="${lbl}">${opts.map(([v, n]) => `<button type="button" data-fx48="${id}" data-v="${v}" aria-pressed="false">${n}</button>`).join("")}</div></div>`;
  card.innerHTML = `<div class="fx48-t">타격 연출 <small>영웅서기5 방식</small></div>`
    + seg("hl", "타격·스킬·보스 효과", [[1.4, "강하게"], [1, "보통"], [0, "끄기"]])
    + seg("bloom", "빛 번짐", [[1, "보통"], [0.5, "약하게"], [0, "끄기"]])
    + `<p class="muted">맞은 자리 픽셀 불꽃·별·고리, 처치하면 몸이 픽셀로 부서짐, 스킬 모으기, 보스 격노·연쇄 폭발. 빛 번짐은 불·마법처럼 밝고 색 있는 부분만 은은하게 번져요.</p>`;
  addCustom("info", card, () => {
    const f = fxSet(), cur = { hl: fx48K(), bloom: fx48BloomK() };
    card.querySelectorAll("button").forEach(b => { const ds = b.dataset || {}; b.setAttribute("aria-pressed", String(+ds.v === +cur[ds.fx48])); });
  });
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset || !b.dataset.fx48) return;
    fxSet()[b.dataset.fx48] = +b.dataset.v; sfx("tick"); updateUI(true); save();
  });
}
