/* ===================== 전투 연출 확장: 엘리베이터, 보스 등장, 결재 도장, 코인, 분위기 ===================== */
let lift = null;               // 층 이동 엘리베이터 { t, from, to, swapped, dinged, spawned }
let intro = null;              // 보스 등장 컷인 { t, dur, kind, name, landed, light }
let slowMo = 0;                // 남은 슬로모션 (실제 ms)
let coins = [], puffs = [], stampFx = null, critLines = 0, fever = { t: 0, n: 0 }, angerT = 0, lastBump = 0;
const L_DELAY = 260, L_CLOSED = 560, L_OPEN = 1000, L_END = 1350;
const easeIO = k => k * k * (3 - 2 * k);
const easeOutBack = k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

function tone(freq, dur, type = "sine", vol = 0.1, delay = 0, slideTo = 0) {
  if (!S.sound || !audioCtx || document.hidden) return;
  try {
    const t = audioCtx.currentTime + delay, o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t + dur + 0.03);
  } catch (e) {}
}
const dingSound = () => { tone(1318, 0.55, "sine", 0.09); tone(1047, 0.8, "sine", 0.08, 0.17); };
const warnSound = k => { for (let i = 0; i < (k >= 3 ? 4 : 2); i++) tone(k >= 3 ? 120 : 190, 0.24, "square", 0.045, i * 0.32, k >= 3 ? 70 : 130); };
const stampSound = () => { hitSound(1.4); tone(85, 0.28, "triangle", 0.2, 0, 48); };
const coinSound = () => tone(1700 + Math.random() * 500, 0.1, "triangle", 0.035);

/* 층 이동: 문이 닫히고 → 띵 → 다음 층 → 문이 열림 */
function startLift(from, to) {
  if (reduceMotion) return;
  lift = { t: 0, from, to, swapped: false, dinged: false, spawned: false };
  spawnWait = Math.max(spawnWait, L_OPEN + 500);
}
const shownFloor = () => (lift && !lift.swapped ? lift.from : S.floor);

/* 몬스터 등장 방식 */
function entrance(m) {
  m.born = 0; m.enter = "drop";
  if (mode !== "tower") { m.enter = "poof"; puffAt(MON_X, GROUND - 40, 12, "#c9cfe0"); return; }
  if (m.kind >= 2 && !reduceMotion) {
    intro = { t: 0, dur: m.kind >= 3 ? 2300 : 1700, kind: m.kind, name: m.name, landed: false, light: false };
    m.enter = "boss"; warnSound(m.kind);
    say(m.kind >= 3 ? "드래곤이라니... 오늘 야근 확정이다!" : `${m.name}님... 결재 받으러 왔습니다!`, 2.6);
    return;
  }
  if (m.kind === 1) { intro = { t: 0, dur: 1000, kind: 1, name: m.name, landed: true, light: true }; m.enter = "drop"; return; }
  m.enter = pick(["drop", "walk", "poof"]);
  if (m.enter === "poof") puffAt(MON_X, GROUND - monSize(m).h * 0.5, 12, "#e9edf6");
}
const introBlocking = () => !!(intro && !intro.light && intro.t < intro.dur * 0.8);
function enterOffset() {
  const o = { dx: 0, dy: 0, s: 1, a: 1 }, m = mon;
  if (!m || m.dying) return o;
  if (m.enter === "boss") {
    if (intro && !intro.light) { const k = intro.t / intro.dur; if (k < 0.45) o.a = 0; else if (k < 0.62) { const e = (k - 0.45) / 0.17; o.dy = -(1 - e * e) * 400; } }
    return o;
  }
  const b = Math.min(1, m.born || 0);
  if (b >= 1) return o;
  if (m.enter === "walk") { const e = 1 - Math.pow(1 - b, 3); o.dx = (1 - e) * 230; o.dy = -Math.abs(Math.sin(b * Math.PI * 3)) * 12 * (1 - b); }
  else if (m.enter === "poof") { o.s = 0.2 + 0.8 * easeOutBack(b); o.a = Math.min(1, b * 2.5); }
  else o.dy = -(1 - b) * (1 - b) * 130;
  return o;
}
function puffAt(x, y, n, col = "#ffffff") {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 3; puffs.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6 - 0.6, r: 6 + Math.random() * 10, life: 1, c: col }); }
}
function bossLand() {
  const { w: mw, h: mh } = monSize();
  shakeAmt = Math.max(shakeAmt, intro && intro.kind >= 3 ? 24 : 16); hitStop = Math.max(hitStop, 90);
  mon.squash = 1.3;
  rings.push({ x: MON_X, y: GROUND - 6, life: 1, crit: true, big: true });
  puffAt(MON_X - mw * 0.4, GROUND - 6, 10, "#c9cfe0"); puffAt(MON_X + mw * 0.4, GROUND - 6, 10, "#c9cfe0");
  for (let i = 0; i < 12; i++) debris.push({ x: MON_X + (Math.random() - .5) * mw, y: GROUND - 4, vx: (Math.random() - .5) * 10, vy: -3 - Math.random() * 6, life: 1, c: "#8a90a8", s: 3 + Math.random() * 4 });
  hitSound(1.5); tone(60, 0.4, "sine", 0.25, 0, 35);
}

/* 보스 처치: 슬로모션 + 결재 도장 + 월급 코인 */
function bossFinish(kind) {
  if (kind >= 2 && !reduceMotion) slowMo = kind >= 3 ? 700 : 500;
  stampFx = { t: 0, kind, hit: false, text: kind >= 3 ? "퇴근" : kind === 2 ? "결재" : "완료" };
  spawnCoins(kind === 1 ? 7 : kind === 2 ? 18 : 30);
}
function spawnCoins(n) {
  const { h: mh } = monSize();
  for (let i = 0; i < n; i++) coins.push({ x: MON_X + (Math.random() - .5) * 30, y: GROUND - mh * 0.5, vx: (Math.random() - 0.65) * 8, vy: -5 - Math.random() * 8, t: -i * 18, spin: Math.random() * 6, fly: false });
}
function bumpWallet() {
  const now = performance.now(); if (now - lastBump < 110) return; lastBump = now;
  const g = $("gold"); const box = g && (g.parentElement || g.parent); if (!box || !box.classList) return;
  box.classList.remove("bump"); void box.offsetWidth; box.classList.add("bump");
}
function comboMilestone(n) {
  fever = { t: 1, n };
  screenFlash = Math.max(screenFlash, 0.12); flashCol = "#ffd54a";
  tone(880, 0.12, "square", 0.04); tone(1320, 0.18, "square", 0.04, 0.08);
}

/* 실제 시간으로 흐르는 연출 시계. 게임 시간 배율(슬로모션)을 돌려줌 */
function fxStep(dt) {
  if (lift) {
    lift.t += dt;
    if (!lift.swapped && lift.t >= L_CLOSED) lift.swapped = true;
    if (!lift.dinged && lift.t >= L_CLOSED + 60) { lift.dinged = true; dingSound(); }
    if (!lift.spawned && lift.t >= L_OPEN - 30) { lift.spawned = true; if (spawnWait > 0) spawnWait = 0.001; }
    if (lift.t >= L_END) lift = null;
  }
  if (intro) {
    intro.t += dt;
    if (!intro.light && intro.kind >= 3 && intro.t < intro.dur * 0.45 && !reduceMotion) shakeAmt = Math.max(shakeAmt, 3.5);
    if (!intro.landed && intro.t >= intro.dur * 0.62) { intro.landed = true; if (mon) bossLand(); }
    if (intro.t >= intro.dur) intro = null;
  }
  if (stampFx) {
    stampFx.t += dt;
    if (!stampFx.hit && stampFx.t >= 230) { stampFx.hit = true; stampSound(); if (!reduceMotion) shakeAmt = Math.max(shakeAmt, stampFx.kind >= 2 ? 14 : 6); }
    if (stampFx.t > (stampFx.kind >= 2 ? 1500 : 950)) stampFx = null;
  }
  critLines = Math.max(0, critLines - dt / 170);
  if (fever.t > 0) fever.t = Math.max(0, fever.t - dt / 1300);
  angerT += dt;
  AMB.planeCd -= dt / 1000;
  if (AMB.plane) { AMB.plane.x += dt * 0.045; if (AMB.plane.x > W + 30) AMB.plane = null; }
  else if (AMB.planeCd <= 0 && AMB.stars.length > 5) { AMB.plane = { x: -30, y: 26 + Math.random() * 50 }; AMB.planeCd = 18 + Math.random() * 14; }
  if (slowMo > 0) { slowMo -= dt; return dt * 0.28; }
  return dt;
}
/* 게임 시간으로 움직이는 입자들 */
function fxPhys(dt) {
  const k = dt / 16;
  coins.forEach(c => {
    c.t += dt; if (c.t < 0) return;
    c.spin += 0.35 * k;
    if (!c.fly) {
      c.x += c.vx * k; c.y += c.vy * k; c.vy += 0.55 * k;
      if (c.y > GROUND - 4) { c.y = GROUND - 4; c.vy *= -0.45; c.vx *= 0.7; }
      if (c.t > 650) c.fly = true;
    } else {
      const tx = 34, ty = H + 30, dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy) || 1, sp = Math.min(d, (6 + (c.t - 650) * 0.04) * k);
      c.x += dx / d * sp; c.y += dy / d * sp;
      if (d < 12 || c.y > H + 10) { c.done = true; coinSound(); bumpWallet(); }
    }
  });
  coins = coins.filter(c => !c.done);
  puffs.forEach(p => { p.x += p.vx * k; p.y += p.vy * k; p.vx *= Math.pow(0.92, k); p.vy *= Math.pow(0.92, k); p.r += 0.35 * k; p.life -= dt / 520; });
  puffs = puffs.filter(p => p.life > 0);
  if (mon && mon.kind >= 1 && !mon.dying && mon.hp / mon.max < 0.35 && Math.random() < dt / 260) {
    const { w: mw, h: mh } = monSize();
    puffs.push({ x: MON_X + (Math.random() - .5) * mw * 0.5, y: GROUND - mh - 4, vx: (Math.random() - .5) * 0.8, vy: -1.4, r: 4, life: 1, c: "#ffffff" });
  }
}

/* 배경 분위기: 별 반짝임(어두운 하늘에만), 떠다니는 먼지, 지나가는 비행기, 바닥 빛 */
const AMB = { stars: [], dust: Array.from({ length: 22 }, () => ({ x: Math.random() * W, y: 40 + Math.random() * (GROUND - 40), s: 1 + Math.random() * 2, v: 0.04 + Math.random() * 0.12, p: Math.random() * 6.28 })), plane: null, planeCd: 8, key: "" };
let vignette = null;
function ambientFor(key) {
  if (AMB.key === key) return; AMB.key = key; AMB.stars = [];
  try {
    const d = bg.getContext("2d").getImageData(0, 0, W, 210).data;
    for (let tries = 0; tries < 400 && AMB.stars.length < 18; tries++) {
      const x = Math.floor(Math.random() * W), y = Math.floor(8 + Math.random() * 190), i = (y * W + x) * 4;
      if (d[i] + d[i + 1] + d[i + 2] < 90) AMB.stars.push({ x, y, p: Math.random() * 6.28, sp: 0.6 + Math.random() * 1.6 });
    }
  } catch (e) {}
}
function drawAmbient(t) {
  AMB.stars.forEach(s => { const a = Math.max(0, Math.sin(t / 1000 * s.sp + s.p)); if (a < 0.05) return; ctx.fillStyle = `rgba(255,255,255,${0.75 * a})`; ctx.fillRect(s.x, s.y, 2, 2); if (a > 0.85) { ctx.fillRect(s.x - 2, s.y, 6, 2); ctx.fillRect(s.x, s.y - 2, 2, 6); } });
  if (AMB.plane) { const p = AMB.plane, on = Math.floor(t / 400) % 2; ctx.fillStyle = "rgba(20,24,40,.9)"; ctx.fillRect(p.x - 8, p.y, 16, 3); ctx.fillRect(p.x - 2, p.y - 3, 4, 9); ctx.fillStyle = on ? "#ff4040" : "#ffffff"; ctx.fillRect(p.x + 8, p.y, 2, 2); ctx.fillStyle = on ? "#ffffff" : "#40ff70"; ctx.fillRect(p.x - 10, p.y, 2, 2); }
  const gl = ctx.createRadialGradient(404, GROUND + 6, 10, 404, GROUND + 6, 240);
  gl.addColorStop(0, "rgba(255,226,170,.16)"); gl.addColorStop(1, "rgba(255,226,170,0)");
  ctx.fillStyle = gl; ctx.fillRect(160, GROUND - 120, 490, 180);
  AMB.dust.forEach(d => { d.y -= d.v; d.x += Math.sin(t / 1300 + d.p) * 0.15; if (d.y < 30) { d.y = GROUND - 4; d.x = Math.random() * W; } ctx.fillStyle = `rgba(255,240,210,${0.12 + 0.12 * Math.sin(t / 700 + d.p)})`; ctx.fillRect(d.x, d.y, d.s, d.s); });
}
/* 반짝이는 바닥에 비친 그림자 */
function reflect(fn) {
  if (reduceMotion) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, GROUND, W, H - GROUND); ctx.clip();
  ctx.translate(0, GROUND * 2); ctx.scale(1, -1); ctx.globalAlpha *= 0.17; fn(); ctx.restore();
}
function drawPuffs() {
  puffs.forEach(p => { ctx.globalAlpha = Math.max(0, p.life) * 0.55; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
  ctx.globalAlpha = 1;
}
function drawAnger(t) {
  if (!mon || mon.kind < 1 || mon.dying || mon.hp / mon.max >= 0.35) return;
  const { w: mw, h: mh } = monSize(), eo = enterOffset();
  const x = MON_X + mw * 0.32 + mon.kb * 26, y = GROUND - mh - 8 + eo.dy, s = 1 + 0.18 * Math.sin(t / 110);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#ff3b3b";
  [[-8, -8], [3, -8], [-8, 3], [3, 3]].forEach(([a, b], i) => { ctx.fillRect(a, b, 5, 2); ctx.fillRect(a + (i % 2 ? 3 : 0), b, 2, 5); });
  ctx.restore();
}
function drawCoins() {
  coins.forEach(c => {
    if (c.t < 0) return;
    const w = Math.max(1, Math.abs(Math.cos(c.spin)) * 7);
    ctx.fillStyle = "#b8860b"; ctx.fillRect(c.x - w / 2 - 1, c.y - 8, w + 2, 16);
    ctx.fillStyle = "#ffd54a"; ctx.fillRect(c.x - w / 2, c.y - 7, w, 14);
    if (w > 4) { ctx.fillStyle = "#fff7c2"; ctx.fillRect(c.x - w / 2 + 1, c.y - 5, 2, 5); }
  });
}
function drawCritLines(cx, cy) {
  if (critLines <= 0 || reduceMotion) return;
  ctx.save(); ctx.globalAlpha = critLines;
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + Math.random() * 0.12, r0 = 170 + Math.random() * 90, r1 = 520, wdt = 0.012 + Math.random() * 0.02;
    ctx.fillStyle = i % 3 ? "rgba(255,255,255,.55)" : "rgba(255,70,70,.6)";
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a - wdt) * r1, cy + Math.sin(a - wdt) * r1); ctx.lineTo(cx + Math.cos(a + wdt) * r1, cy + Math.sin(a + wdt) * r1); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function drawVignette() {
  if (!vignette) {
    vignette = document.createElement("canvas"); vignette.width = W; vignette.height = H;
    const g = vignette.getContext("2d"); if (g) { const gr = g.createRadialGradient(W / 2, H * 0.55, 150, W / 2, H * 0.55, 420); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.5)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  }
  ctx.drawImage(vignette, 0, 0);
}
function drawDanger(t) {
  if (mode !== "tower" || !mon || mon.dying || !TIME_LIMIT[mon.kind] || introBlocking()) return;
  const r = bossTime / bossTimeOf(mon.kind); if (r >= 0.3) return;
  const a = (0.3 - r) / 0.3 * (0.5 + 0.5 * Math.sin(t / 140));
  const gr = ctx.createRadialGradient(W / 2, H / 2, 140, W / 2, H / 2, 380);
  gr.addColorStop(0, "rgba(255,30,30,0)"); gr.addColorStop(1, `rgba(255,30,30,${0.55 * a})`);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.6 + 0.4 * a; ctx.font = '22px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = 5; ctx.strokeStyle = "#2a0606"; const tx = `퇴근까지 ${Math.ceil(bossTime)}초!`; ctx.strokeText(tx, W / 2, 46); ctx.fillStyle = "#ff6b6b"; ctx.fillText(tx, W / 2, 46); ctx.restore();
}
function drawFever(t) {
  if (combo >= 50 && !reduceMotion) { ctx.strokeStyle = `rgba(255,213,74,${0.25 + 0.2 * Math.sin(t / 120)})`; ctx.lineWidth = 6; ctx.strokeRect(3, 3, W - 6, H - 6); }
  if (fever.t <= 0) return;
  const k = 1 - fever.t, a = Math.min(1, fever.t * 3), sc = k < 0.12 ? 2.2 - (k / 0.12) * 1.2 : 1;
  ctx.save(); ctx.translate(W / 2, 140); ctx.rotate(-0.08); ctx.scale(sc, sc); ctx.globalAlpha = a;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = '44px "Do Hyeon", sans-serif';
  const txt = `${fever.n}연타!`;
  ctx.lineWidth = 12; ctx.strokeStyle = "#1b1206"; ctx.strokeText(txt, 0, 0);
  const gr = ctx.createLinearGradient(0, -22, 0, 22); gr.addColorStop(0, "#fff7c2"); gr.addColorStop(0.5, "#ffd54a"); gr.addColorStop(1, "#ff8a3b");
  ctx.fillStyle = gr; ctx.fillText(txt, 0, 0);
  ctx.font = '16px "Do Hyeon", sans-serif'; ctx.lineWidth = 5; ctx.strokeText(fever.n >= 100 ? "야근 폭주 모드" : fever.n >= 50 ? "업무 몰입!" : "손이 안 보인다!", 0, 32); ctx.fillStyle = "#ffffff"; ctx.fillText(fever.n >= 100 ? "야근 폭주 모드" : fever.n >= 50 ? "업무 몰입!" : "손이 안 보인다!", 0, 32);
  ctx.restore();
}
function drawStamp() {
  if (!stampFx) return;
  const s = stampFx, big = s.kind >= 2, T0 = 120, T1 = 230, HOLD = big ? 1150 : 650, END = big ? 1500 : 950;
  if (s.t < T0) return;
  const k = Math.min(1, (s.t - T0) / (T1 - T0)), sc = 1 + (1 - k) * 1.9;
  const a = s.t > HOLD ? Math.max(0, 1 - (s.t - HOLD) / (END - HOLD)) : Math.min(1, k * 1.6);
  const x = big ? W / 2 : MON_X - 30, y = big ? 168 : 190, R = big ? 66 : 32;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.22); ctx.scale(sc, sc); ctx.globalAlpha = a * 0.92;
  ctx.strokeStyle = "#e0262c"; ctx.lineWidth = R * 0.11; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = R * 0.045; ctx.beginPath(); ctx.arc(0, 0, R * 0.8, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#e0262c"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `${Math.round(R * 0.66)}px "Do Hyeon", sans-serif`; ctx.fillText(s.text, 0, R * 0.04);
  if (big) { ctx.font = `${Math.round(R * 0.2)}px "Do Hyeon", sans-serif`; ctx.fillText(s.kind >= 3 ? "드래곤 퇴치" : "칼퇴 승인", 0, -R * 0.52); ctx.fillText("곽준영", 0, R * 0.55); }
  ctx.globalCompositeOperation = "destination-out"; ctx.globalAlpha = 0.5;
  for (let i = 0; i < 14; i++) { const ang = i * 2.4, rr = R * (0.3 + (i % 5) * 0.15); ctx.fillRect(Math.cos(ang) * rr, Math.sin(ang) * rr, 2 + (i % 3), 2); }
  ctx.restore();
}
function drawIntro(t) {
  if (!intro) return;
  const k = intro.t / intro.dur;
  if (intro.light) {
    const a = Math.min(1, k / 0.12, (1 - k) / 0.2), x = -(1 - Math.min(1, k / 0.18)) * 260;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, 0);
    ctx.fillStyle = "rgba(150,20,28,.9)"; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(236, 40); ctx.lineTo(216, 72); ctx.lineTo(0, 72); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffd54a"; ctx.fillRect(0, 40, 236, 3);
    ctx.font = '20px "Do Hyeon", sans-serif'; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffffff"; ctx.fillText("! 우두머리 등장", 14, 57);
    ctx.restore(); return;
  }
  const dragon = intro.kind >= 3, acc = dragon ? "#ff3b3b" : "#ffd54a";
  const aIn = Math.min(1, k / 0.08), aOut = Math.min(1, (1 - k) / 0.18), a = Math.min(aIn, aOut);
  const dim = k < 0.62 ? 0.55 : 0.55 * Math.max(0, 1 - (k - 0.62) / 0.2);
  ctx.fillStyle = `rgba(0,0,0,${dim * a})`; ctx.fillRect(0, 0, W, H);
  if (dragon && k < 0.62) { ctx.fillStyle = `rgba(255,20,20,${0.18 * (0.5 + 0.5 * Math.sin(t / 90)) * a})`; ctx.fillRect(0, 0, W, H); }
  const band = (y) => {
    ctx.fillStyle = hexA(acc, 0.95 * a); ctx.fillRect(0, y, W, 26);
    ctx.fillStyle = `rgba(15,10,10,${0.95 * a})`; const off = (t / 18) % 36;
    for (let x = -40 + off; x < W + 40; x += 36) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y); ctx.lineTo(x + 2, y + 26); ctx.lineTo(x - 14, y + 26); ctx.closePath(); ctx.fill(); }
  };
  const bandIn = Math.min(1, k / 0.12);
  ctx.save(); ctx.translate(-(1 - bandIn) * W, 0); band(34); ctx.restore();
  ctx.save(); ctx.translate((1 - bandIn) * W, 0); band(300); ctx.restore();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (k < 0.6) {
    const pop = k < 0.1 ? 1.8 - (k / 0.1) * 0.8 : 1, blink = Math.floor(intro.t / 160) % 2 ? 1 : 0.75;
    ctx.save(); ctx.translate(W / 2, 128); ctx.scale(pop, pop); ctx.globalAlpha = a * blink * Math.min(1, (0.6 - k) / 0.08);
    ctx.font = '18px "Do Hyeon", sans-serif'; ctx.fillStyle = acc; ctx.fillText("W A R N I N G", 0, -34);
    ctx.font = '50px "Do Hyeon", sans-serif'; ctx.lineWidth = 12; ctx.strokeStyle = dragon ? "#3a0505" : "#2a1d05"; const tt = dragon ? "드래곤 출현!!" : "임원 출현!"; ctx.strokeText(tt, 0, 6);
    ctx.fillStyle = "#ffffff"; ctx.fillText(tt, 0, 6);
    ctx.restore();
  }
  const pk = Math.min(1, Math.max(0, (k - 0.08) / 0.15)), px = W - (W * 0.62) * easeIO(pk);
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(10,12,22,.92)"; ctx.fillRect(px, 196, W * 0.62 + 20, 46);
  ctx.fillStyle = acc; ctx.fillRect(px, 196, 6, 46);
  ctx.textAlign = "left"; ctx.font = '13px "Do Hyeon", sans-serif'; ctx.fillStyle = acc; ctx.fillText(dragon ? "100층 지배자" : "10층 결재권자", px + 18, 208);
  ctx.font = '22px "Do Hyeon", sans-serif'; ctx.fillStyle = "#ffffff"; ctx.fillText(intro.name, px + 18, 229);
  ctx.restore();
}
function drawLift(t) {
  if (!lift) return;
  const lt = lift.t;
  let c = lt < L_DELAY ? 0 : lt < L_CLOSED ? easeIO((lt - L_DELAY) / (L_CLOSED - L_DELAY)) : lt < L_OPEN ? 1 : 1 - easeIO(Math.min(1, (lt - L_OPEN) / (L_END - L_OPEN)));
  if (c <= 0) return;
  const dw = (W / 2) * c;
  [0, 1].forEach(side => {
    const x0 = side ? W - dw : 0;
    const gr = ctx.createLinearGradient(x0, 0, x0 + Math.max(1, dw), 0);
    gr.addColorStop(0, side ? "#4a5268" : "#58617a"); gr.addColorStop(0.45, "#a3acc4"); gr.addColorStop(1, side ? "#58617a" : "#4a5268");
    ctx.fillStyle = gr; ctx.fillRect(x0, 0, dw, H);
    ctx.fillStyle = "rgba(255,255,255,.07)"; for (let y = 4; y < H; y += 7) ctx.fillRect(x0, y, dw, 1);
    ctx.strokeStyle = "rgba(25,30,44,.55)"; ctx.lineWidth = 2; if (dw > 40) ctx.strokeRect(x0 + 22, 54, dw - 44, H - 100);
    ctx.fillStyle = "#262c3e"; ctx.fillRect(side ? x0 : x0 + dw - 3, 0, 3, H);
  });
  ctx.fillStyle = "#151a28"; ctx.fillRect(0, 0, W, 12); ctx.fillRect(0, H - 8, W, 8);
  if (lt > L_CLOSED - 120 && lt < L_OPEN + 220) {
    const pa = Math.min(1, (lt - (L_CLOSED - 120)) / 120, (L_OPEN + 220 - lt) / 160);
    ctx.save(); ctx.globalAlpha = pa;
    ctx.fillStyle = "#0b0d14"; ctx.fillRect(W / 2 - 84, 22, 168, 70); ctx.strokeStyle = "#3a4058"; ctx.lineWidth = 3; ctx.strokeRect(W / 2 - 84, 22, 168, 70);
    const roll = Math.min(1, Math.max(0, (lt - L_CLOSED) / 180)), on = Math.floor(lt / 150) % 2;
    ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - 80, 26, 160, 62); ctx.clip();
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = '42px "Do Hyeon", sans-serif'; ctx.shadowColor = "#ff9a1f"; ctx.shadowBlur = 12; ctx.fillStyle = "#ffb13b";
    ctx.fillText(`${lift.from}F`, W / 2 + 14, 57 - roll * 60); ctx.fillText(`${lift.to}F`, W / 2 + 14, 117 - roll * 60);
    ctx.font = '26px "Do Hyeon", sans-serif'; ctx.fillStyle = on ? "#ffb13b" : "#6a4a1a"; ctx.fillText("▲", W / 2 - 54, 57);
    ctx.restore();
    if (lift.swapped) { ctx.font = '16px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.fillStyle = "#e9edf6"; ctx.fillText(`${cycleOf(lift.to)}${zoneOf(lift.to).n}`, W / 2, 112); }
    ctx.restore();
  }
}
