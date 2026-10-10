/* ===================== 전투 ===================== */
let mode = "tower", vaultTime = 0, vaultRun = { n: 0, gold: 0, st: 0, depth: 0 };
let mon = null, bossTime = 0, atkTimer = 0, catTimer = 0, cactusTimer = 0, floats = [], sparks = [], bolts = [], spawnWait = 0, petT = 0, hitCount = 0, laser = 0;
let anim = { a: 1, dur: 200, pending: false };          // 최대리 공격 동작 (0 치켜듦 → 0.4 내리찍음 → 1 복귀)
let hitStop = 0, shakeAmt = 0, screenFlash = 0, streaks = [], rings = [], debris = [];
let zoneBanner = { text: "", sub: "", t: 0 }, lastZoneNo = -1;
const HERO_X = 282, MON_X = 474;

function monSize(m = mon) { const map = SPR[m.sprite]; return { w: map[0].length * m.scale, h: map.length * m.scale }; }
function monColor(m = mon) { const p = m.pal; return p.g || p.s || p.b || p.d || p.p || p.w || p.h || "#ffffff"; }

function spawn() {
  const base = { shake: 0, flash: 0, red: 0, kb: 0, squash: 0, tilt: 0, dying: 0, born: 0, fx: 0, fy: 0, vx: 0, vy: 0, rot: 0, crown: false };
  if (mode === "vault") {
    const hp = hpBase(Math.max(1, S.maxFloor)) * 1.5;
    mon = Object.assign(base, { name: `잠긴 서류함 · 지하 ${vaultRun.depth}m`, sprite: "chest", pal: PAL.chest, scale: 7, kind: 0, hp, max: hp });
    renderTop(true); return;
  }
  const f = S.floor, k = S.k, kind = bossKind(f, k), z = zoneOf(f), pre = cycleOf(f);
  let name, sprite, pal, scale, crown = false;
  if (kind === 3) {
    const i = f / 100 - 1;
    name = pre + DRAGONS[i % DRAGONS.length] + (i >= DRAGONS.length ? " " + (Math.floor(i / DRAGONS.length) + 1) + "세" : "");
    sprite = "dragon"; pal = DRAGON_PAL[i % DRAGON_PAL.length]; scale = 7;
  } else if (kind === 2 && f % 50 === 0) {
    const m = z.mons[0];
    name = `구역장 ${z.execs[4]}`; sprite = m[0]; pal = m[1]; scale = 9; crown = true;
  } else if (kind === 2) {
    name = pre + z.execs[(f % 50) / 10 - 1]; sprite = "boss"; pal = z.bossPal; scale = 7;
  } else {
    const m = z.mons[(f + k) % 4];
    name = pre + (kind === 1 ? "우두머리 " : "") + m[2]; sprite = m[0]; pal = m[1]; scale = kind === 1 ? 7.5 : 6; crown = kind === 1 && false;
  }
  const hp = hpBase(f) * HP_MUL[kind];
  mon = Object.assign(base, { name, sprite, pal, scale, kind, hp, max: hp, crown });
  bossTime = bossTimeOf(kind);
  const dl = petLv("ddeok");
  if (dl) { const cut = Math.random() * Math.min(0.3, 0.1 + 0.02 * dl); if (cut > 0.02) { mon.hp -= mon.max * cut; addFloat(MON_X, 110, `떡볶이 -${Math.round(cut * 100)}%`, "#ff6b3b", 20); } }
  const zn = zoneNo(f);
  if (zn !== lastZoneNo) {
    if (lastZoneNo !== -1) { zoneBanner = { text: `${pre}${z.n}`, sub: `${zn * ZONE_LEN + 1}~${zn * ZONE_LEN + ZONE_LEN}층 · 새 구역`, t: 2.8 }; say(`여긴 ${z.n}이네. 처음 보는 녀석들이다!`, 3); }
    lastZoneNo = zn;
  }
  renderTop(true);
}

/* 말풍선 (최대리의 혼잣말) */
const LINES = [
  "월요병엔 약이 없대. 금요일이 약이래.", "내 통장은 다이어트 중. 월급날만 살쪄.", "야근은 셀프가 아니라 세트 메뉴야.",
  "커피는 내 연료, 결재는 내 숙명!", "부장님 눈빛에 체력이 1 깎였다.", "회의 10분 전, 다들 어디 갔지?",
  "엑셀 수식이 나보다 일을 잘해.", "점심 메뉴 고르기가 보스보다 어려워.", "퇴근길 지하철이 진짜 던전이지.",
  "내 연차는 어디로 사라졌을까?", "오타 하나에 결재가 세 번 돌아왔다.", "프린터야, 오늘만은 제발 버텨줘.",
  "스테이플러 심이 떨어졌다. 비상이다!", "좋아하는 건 정시퇴근!", "사직서는 늘 품 안에. 꺼낸 적은 없지.",
  "월급은 통장을 스쳐 지나갈 뿐.", "보고서는 내일의 내가 쓰겠지?", "칼퇴는 기술이 아니라 예술이야.",
];
let bubble = { text: "", t: 0 }, bubbleCd = 6;
function say(text, sec = 4) { bubble = { text, t: sec }; bubbleCd = 14 + Math.random() * 8; }
function idleLine() {
  if (typeof memQueue === "function" && memQueue().length && Math.random() < 0.3) return `오늘 암송 ${memQueue().length}구절 남았어. 통과하면 월급 보너스!`;
  if (S.bible.today.length === 0 && Math.random() < 0.3) return "오늘 말씀 한 장 어때? 만나도 주잖아.";
  if (S.study.today < 25 && !S.study.running && Math.random() < 0.3) return "공부 25분이면 갱도 절반은 캔대!";
  if (S.study.running && Math.random() < 0.5) return "광산에서 형광펜 곡괭이 휘두르는 중!";
  return LINES[Math.floor(Math.random() * LINES.length)];
}
function wrapText(c, text, maxW) {
  const words = text.split(" "), out = []; let line = "";
  words.forEach(w => { const t = line ? line + " " + w : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
  if (line) out.push(line); return out;
}
function drawBubble(x, y, text) {
  ctx.font = '17px "Do Hyeon", sans-serif';
  const lines = wrapText(ctx, text, 230), lh = 21;
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 20, h = lines.length * lh + 14;
  const bx = Math.max(6, Math.min(W - w - 6, x - 20)), by = Math.max(4, y - h - 12);
  ctx.fillStyle = "rgba(244,246,251,.95)";
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, w, h, 8) : ctx.rect(bx, by, w, h); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 6, by + h); ctx.lineTo(x + 18, by + h); ctx.lineTo(x + 8, by + h + 10); ctx.fill();
  ctx.fillStyle = "#1b1f2a"; ctx.textAlign = "left"; ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, bx + 10, by + 8 + i * lh));
}
function missionLines() {
  const out = [];
  DAILY.forEach(d => { if (!S.day.claimed[d.id] && (S.day[d.stat] || 0) < d.goal && out.length < 3) out.push(d.n); });
  const ready = DAILY.filter(d => !S.day.claimed[d.id] && (S.day[d.stat] || 0) >= d.goal).length;
  if (ready) out.unshift(`업무 보상 ${ready}개 받기`);
  if (S.wl < 5 || S.wi === LAST_W ? S.gold >= wUp(S.wi, S.wl) : (S.gold >= wBuy(S.wi + 1) && (!WEAPONS[S.wi + 1].leg || S.legUnlock[S.wi + 1 - LEG_START]))) out.unshift("무기 강화하기");
  return out.slice(0, 4);
}
function drawMissions() {
  const lines = missionLines(); if (!lines.length) return;
  ctx.font = '15px "Do Hyeon", sans-serif'; ctx.textAlign = "right"; ctx.textBaseline = "top";
  lines.forEach((l, i) => {
    const y = 14 + i * 20;
    ctx.lineWidth = 4; ctx.strokeStyle = "rgba(14,19,33,.85)"; ctx.strokeText(l, W - 12, y);
    ctx.fillStyle = i === 0 && (l.startsWith("무기") || l.startsWith("업무")) ? "#ffd54a" : "#e9edf6"; ctx.fillText(l, W - 12, y);
  });
}
function addFloat(x, y, text, color, size = 26, pop = false) {
  floats.push({ x: x + (Math.random() - .5) * 16, y, text, color, size, life: 1, age: 0, pop, vy: pop ? 3.2 : 1.4 });
  if (floats.length > 36) floats.shift();
}

/* 타격음: 짧은 잡음 + 낮은 쿵 */
let audioCtx = null, noiseBuf = null, lastSound = 0;
function ensureAudio() {
  try { if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); const n = audioCtx.sampleRate * 0.12; noiseBuf = audioCtx.createBuffer(1, n, audioCtx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); } if (audioCtx.state === "suspended") audioCtx.resume(); } catch (e) {}
}
function hitSound(strength) {
  if (!S.sound || !audioCtx || document.hidden) return;
  const now = performance.now(); if (now - lastSound < 55) return; lastSound = now;
  try {
    const t = audioCtx.currentTime;
    const src = audioCtx.createBufferSource(); src.buffer = noiseBuf;
    const lp = audioCtx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400 + strength * 900;
    const g = audioCtx.createGain(); g.gain.setValueAtTime(0.18 + strength * 0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    src.connect(lp); lp.connect(g); g.connect(audioCtx.destination); src.start(t);
    const o = audioCtx.createOscillator(), og = audioCtx.createGain();
    o.frequency.setValueAtTime(170 - strength * 40, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    og.gain.setValueAtTime(0.28 + strength * 0.15, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(og); og.connect(audioCtx.destination); o.start(t); o.stop(t + 0.15);
  } catch (e) {}
}

/* 맞을 때 반응: 빨갛게, 밀려남, 찌그러짐, 젖혀짐, 파편 */
function hit(amount, crit, src, px, py) {
  if (!mon || mon.dying) return;
  if (mon.kind > 0 && mode === "tower") amount *= stats().bossBonus;
  mon.hp -= amount;
  const heavy = src === "hero" || src === "tap";
  const { w: mw, h: mh } = monSize();
  const cx = MON_X - mw * 0.25, cy = GROUND - mh * 0.55;
  mon.red = 1; mon.flash = heavy ? 1 : 0.6;
  if (!reduceMotion) {
    mon.kb = Math.min(1.8, mon.kb + (heavy ? (crit ? 1.5 : 1) : 0.4));
    mon.squash = Math.max(mon.squash, heavy ? (crit ? 1.25 : 1) : 0.45);
    mon.tilt = Math.max(mon.tilt, heavy ? (crit ? 1 : 0.7) : 0.3);
  }
  if (heavy) {
    const st = stats();
    hitStop = Math.max(hitStop, src === "tap" ? (crit ? 80 : 50) : Math.min(crit ? 80 : 50, st.interval * (crit ? 0.22 : 0.14)));
    if (!reduceMotion) shakeAmt = Math.max(shakeAmt, crit ? 12 : 6);
    rings.push({ x: px ?? cx, y: py ?? cy, life: 1, crit });
    streaks.push({ life: 1, crit, x: MON_X, y: GROUND - mh * 0.5, h: mh });
    const col = monColor();
    for (let i = 0; i < (crit ? 16 : 9); i++) sparks.push({ x: px ?? cx, y: py ?? cy, vx: 4 + Math.random() * 11, vy: (Math.random() - 0.65) * 12, life: 1, c: i % 3 ? "#fff7c2" : "#ffffff", line: true });
    for (let i = 0; i < (crit ? 8 : 4); i++) debris.push({ x: MON_X + (Math.random() - .5) * mw * 0.5, y: GROUND - mh * (0.3 + Math.random() * 0.5), vx: 2 + Math.random() * 6, vy: -4 - Math.random() * 6, life: 1, c: col, s: 4 + Math.random() * 5 });
    if (crit) screenFlash = Math.max(screenFlash, 0.32);
    hitSound(crit ? 1 : 0.4);
  }
  const fcol = src === "pet" ? "#6fd3ff" : src === "clone" ? "#c9a6ff" : crit ? "#ff5d5d" : "#ffffff";
  addFloat(px ?? MON_X - 10, (py ?? GROUND - mh) - 6, (crit ? "치명! " : "") + fmt(amount), fcol, crit ? 40 : heavy ? 30 : 20, heavy);
  if (mon.hp <= 0) kill();
}

function kill() {
  const { h: mh } = monSize();
  mon.dying = 0.0001; S.totalKills++;
  mon.vx = 7 + Math.random() * 5; mon.vy = -9 - Math.random() * 4;
  const boss = mon.kind >= 2;
  spawnWait = boss ? 650 : 430;
  hitStop = Math.max(hitStop, boss ? 170 : 95);
  if (!reduceMotion) shakeAmt = Math.max(shakeAmt, boss ? 18 : 10);
  if (boss) screenFlash = Math.max(screenFlash, 0.45);
  rings.push({ x: MON_X, y: GROUND - mh * 0.5, life: 1, crit: true, big: true });
  for (let i = 0; i < (boss ? 26 : 14); i++) { const a = Math.random() * Math.PI * 2; sparks.push({ x: MON_X, y: GROUND - mh * 0.5, vx: Math.cos(a) * (4 + Math.random() * 9), vy: Math.sin(a) * (4 + Math.random() * 9) - 2, life: 1, c: i % 2 ? "#ffd54a" : monColor(), line: true }); }
  hitSound(1.2);
  if (mode === "vault") {
    const g = goldBase(Math.max(1, S.maxFloor)) * 0.6 * goldMult(), st = Math.random() < 0.3 ? 1 : 0;
    vaultRun.n++; vaultRun.depth += 40; vaultRun.gold += g; vaultRun.st += st;
    S.gold += g; S.stamp += st;
    if (vaultRun.depth % 1000 === 0) { S.stamp += 2; vaultRun.st += 2; addFloat(MON_X, 100, `${vaultRun.depth}m 돌파! 도장 +2`, "#ff7a6b", 24); }
    S.day.depth = Math.max(S.day.depth, vaultRun.depth);
    addFloat(MON_X, 140, `+${fmt(g)}원` + (st ? " 도장 +1" : ""), "#ffd54a", 26, true);
    return;
  }
  const f = S.floor, kind = mon.kind;
  if (kind > 0) {
    const reward = goldBase(f) * GOLD_MUL[kind] * goldMult();
    S.gold += reward; S.bossKills++; S.day.boss++;
    addFloat(MON_X, 130, "+" + fmt(reward) + "원", "#ffd54a", 34, true);
    const sq = petLv("squirrel");
    if (sq && Math.random() * 100 < 2 + 0.5 * sq) { S.stamp++; addFloat(MON_X, 96, "다람쥐가 도장 +1", "#ff7a6b", 22); }
    if (kind === 3) { const st = 3 + Math.floor(f / 100) * 2; S.stamp += st; toast(`${mon.name} 격파! 월급 ${fmt(reward)}원, 결재도장 ${st}개`); say("드래곤도 퇴근시켰다! 오늘은 회식이다!"); }
    else if (kind === 2) { toast(`${mon.name} 칼퇴시킴! 월급 ${fmt(reward)}원`); say(["월급 들어왔다! 오늘은 치킨이다!", `${mon.name}님, 오늘은 일찍 들어가세요!`, "결재 완료! 다음 층으로!"][Math.floor(Math.random() * 3)], 3); }
  }
  S.k++;
  if (S.k > 5) { S.k = 1; if (S.auto) S.floor++; }
  S.maxFloor = Math.max(S.maxFloor, S.floor);
  if (S.floor > S.bestFloor) {
    const prev = S.bestFloor; S.bestFloor = S.floor;
    PETS.forEach(p => { if (prev < p.floor && S.bestFloor >= p.floor) toast(`${p.n}을(를) 들일 수 있어요 (동료 탭)`); });
    CHARS.forEach(c => { if (c.req && c.req.k === "floor" && prev < c.req.v && S.bestFloor >= c.req.v) toast(`새 캐릭터 ${c.n} 해금! (정보 탭)`); });
  }
}
function failBoss() { toast("시간 초과! 아래층에서 무기를 키우고 다시 도전하세요"); say("다음엔 꼭 칼퇴시키고 만다...", 3); S.floor = Math.max(1, S.floor - 1); S.k = 1; S.auto = false; spawn(); }

function startVault() {
  rollDay();
  if (S.day.vaultUsed >= vaultTickets() || mode === "vault") return;
  S.day.vaultUsed++; mode = "vault"; vaultTime = 30; vaultRun = { n: 0, gold: 0, st: 0, depth: 0 };
  floats = []; spawnWait = 0; spawn(); save();
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}
function endVault() {
  mode = "tower";
  toast(`지하 ${vaultRun.depth}m까지 내려감! 서류함 ${vaultRun.n}개, ${fmt(vaultRun.gold)}원, 도장 ${vaultRun.st}개`);
  floats = []; spawnWait = 0; S.k = 1; spawn(); save();
}

/* 최대리 공격 동작: 뒤로 치켜들었다가 돌진해서 한 번에 내리찍기 */
function startSwing(tap) {
  const st = stats();
  anim = { a: tap ? 0.4 : 0, dur: Math.max(110, Math.min(260, st.interval * 0.85)), pending: !tap };
}
function heroStrike(st) {
  const crit = Math.random() < st.crit;
  hit(st.atk * (crit ? st.critMul : 1), crit, "hero");
  if (WEAPONS[skinIdx()].fx === "laser") laser = 1;
  hitCount++;
  const il = petLv("idol");
  if (il && hitCount % 10 === 0) { idolBuff = { type: ["haste", "rage", "crit"][Math.floor(Math.random() * 3)], t: 3 + 0.5 * il }; addFloat(120, 120, { haste: "응원: 공속 2배!", rage: "응원: 피해 3배!", crit: "응원: 치명 100%!" }[idolBuff.type], "#ff8fc8", 20); }
  if (st.clone > 0 && mon && !mon.dying && spawnWait <= 0) hit(st.clone / st.aps, false, "clone");
}
function heroPose() {
  const a = anim.a;
  if (a >= 1) return { dx: 0, ang: 0.4, lift: 0 };
  if (a < 0.4) { const k = a / 0.4, e = 1 - (1 - k) * (1 - k); return { dx: -14 * e, ang: 0.4 + (-2.2 - 0.4) * e, lift: -5 * e }; }
  if (a < 0.58) return { dx: 70, ang: 1.75, lift: 7 };
  const k = (a - 0.58) / 0.42, e = k * k * (3 - 2 * k);
  return { dx: 70 * (1 - e), ang: 1.75 + (0.4 - 1.75) * e, lift: 7 * (1 - e) };
}

cv.addEventListener("pointerdown", e => {
  ensureAudio();
  const r = cv.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H;
  if (!mon || mon.dying || spawnWait > 0) return;
  const st = stats(), crit = Math.random() < st.crit;
  startSwing(true);
  const { w: mw, h: mh } = monSize();
  const ix = Math.max(MON_X - mw / 2, Math.min(MON_X + mw / 2, px)), iy = Math.max(GROUND - mh, Math.min(GROUND - 6, py));
  hit(st.tap * (crit ? st.critMul : 1), crit, "tap", ix, iy);
  $("hint").style.opacity = 0;
});
$("retry").addEventListener("click", () => { S.auto = true; S.k = 1; S.floor++; S.maxFloor = Math.max(S.maxFloor, S.floor); spawn(); });

/* ===================== 루프 ===================== */
let last = performance.now();
function frame(now) {
  const dt = Math.min(100, now - last); last = now;
  if (hitStop > 0) { hitStop -= dt; shakeAmt = Math.max(0, shakeAmt - dt * 0.02); draw(now); requestAnimationFrame(frame); return; }
  step(dt); draw(now); requestAnimationFrame(frame);
}
function step(dt) {
  const sec = dt / 1000;
  ["haste", "gold2", "rage"].forEach(b => { if (S.active[b] > 0) S.active[b] = Math.max(0, S.active[b] - sec); });
  if (idolBuff.t > 0) idolBuff.t -= sec;
  if (bubble.t > 0) bubble.t -= sec; else { bubbleCd -= sec; if (bubbleCd <= 0) say(idleLine()); }
  if (zoneBanner.t > 0) zoneBanner.t -= sec;
  const st = stats();
  // 공격 동작 진행: 내리찍는 순간(0.4)에 피해가 들어감
  if (anim.a < 1) {
    const prev = anim.a; anim.a = Math.min(1, anim.a + dt / anim.dur);
    if (anim.pending && prev < 0.4 && anim.a >= 0.4) { anim.pending = false; if (mon && !mon.dying && spawnWait <= 0) heroStrike(st); }
  }
  if (spawnWait > 0) {
    spawnWait -= dt;
    if (mon) { mon.dying = Math.min(1, mon.dying + dt / 420); mon.fx += mon.vx * dt / 16; mon.fy += mon.vy * dt / 16; mon.vy += 0.9 * dt / 16; mon.rot += 0.22 * dt / 16; }
    if (spawnWait <= 0) spawn();
  } else if (mon) {
    mon.born = Math.min(1, mon.born + dt / 220);
    atkTimer += dt;
    if (atkTimer >= st.interval) {
      atkTimer = Math.min(atkTimer - st.interval, st.interval);
      if (anim.a >= 0.58) startSwing(false);
      else if (!anim.pending) heroStrike(st);
      else { heroStrike(st); }
    }
    const cl = petLv("cat");
    if (cl && mon && !mon.dying) {
      catTimer += dt;
      if (catTimer >= 2500) { catTimer -= 2500; petT = 1; const big = Math.random() < 0.1; bolts.push({ life: 1, big }); if (big) { shakeAmt = Math.max(shakeAmt, 9); screenFlash = Math.max(screenFlash, 0.25); } hit(st.atk * (1.5 + 0.5 * cl) * (big ? 5 : 1), false, "pet"); }
    }
    const ca = petLv("cactus");
    if (ca && mon && !mon.dying) { cactusTimer += dt; if (cactusTimer >= 2000) { cactusTimer -= 2000; hit(mon.hp * (1 + 0.1 * ca) / 100 / (mon.kind ? 5 : 1), false, "pet"); } }
    if (mode === "tower" && mon && TIME_LIMIT[mon.kind] && !mon.dying && spawnWait <= 0) { bossTime -= sec; if (bossTime <= 0) failBoss(); }
  }
  if (mode === "vault") { vaultTime -= sec; if (vaultTime <= 0) endVault(); }
  petT = Math.max(0, petT - dt / 260);
  laser = Math.max(0, laser - dt / 120);
  shakeAmt = Math.max(0, shakeAmt - dt * 0.05);
  screenFlash = Math.max(0, screenFlash - dt / 260);
  if (mon) {
    mon.flash = Math.max(0, mon.flash - dt / 70);
    mon.red = Math.max(0, mon.red - dt / 260);
    mon.kb = Math.max(0, mon.kb - dt / 150);
    mon.squash = Math.max(0, mon.squash - dt / 130);
    mon.tilt = Math.max(0, mon.tilt - dt / 200);
  }
  floats.forEach(f => { f.age += dt; f.life -= dt / 950; f.y -= f.vy * dt / 16; f.vy = Math.max(0.3, f.vy * Math.pow(0.9, dt / 16)); }); floats = floats.filter(f => f.life > 0);
  sparks.forEach(s => { s.px = s.x; s.py = s.y; s.x += s.vx * dt / 16; s.y += s.vy * dt / 16; s.vy += 0.45 * dt / 16; s.vx *= Math.pow(0.94, dt / 16); s.life -= dt / 380; }); sparks = sparks.filter(s => s.life > 0);
  debris.forEach(d => { d.x += d.vx * dt / 16; d.y += d.vy * dt / 16; d.vy += 0.6 * dt / 16; if (d.y > GROUND - 2) { d.y = GROUND - 2; d.vy *= -0.35; d.vx *= 0.6; } d.life -= dt / 700; }); debris = debris.filter(d => d.life > 0);
  bolts.forEach(b => b.life -= dt / 250); bolts = bolts.filter(b => b.life > 0);
  streaks.forEach(s => s.life -= dt / 120); streaks = streaks.filter(s => s.life > 0);
  rings.forEach(r => r.life -= dt / (r.big ? 360 : 220)); rings = rings.filter(r => r.life > 0);
  if (sparks.length > 80) sparks.splice(0, sparks.length - 80);
}
function draw(t) {
  const key = mode === "vault" ? "vault" : "f" + S.floor;
  if (bgKey !== key) { bg = buildBg(S.floor, mode === "vault"); bgKey = key; }
  ctx.save();
  ctx.fillStyle = "#05070d"; ctx.fillRect(0, 0, W, H);
  if (shakeAmt > 0.3) ctx.translate((Math.random() - .5) * shakeAmt * 2, (Math.random() - .5) * shakeAmt * 1.4);
  ctx.drawImage(bg, 0, 0);
  const look = heroLook(), pose = heroPose();
  // 동료
  if (petLv("robot")) drawSprite(ctx, SPR.robot, PAL.robot, 20 + Math.sin(t / 1400) * 40, GROUND - 30, 3);
  if (petLv("intern")) drawSprite(ctx, HERO, PAL.intern, 8, GROUND - 42, 3);
  if (petLv("idol")) drawSprite(ctx, HERO, PAL.idol, 40, GROUND - 42 - Math.abs(Math.sin(t / 200)) * 6, 3);
  if (petLv("legend")) drawSprite(ctx, HERO, PAL.legend, 72, GROUND - 42, 3);
  if (petLv("ddeok")) drawSprite(ctx, SPR.ddeok, PAL.ddeok, 110, GROUND - 36, 3);
  if (petLv("squirrel")) drawSprite(ctx, SPR.squirrel, PAL.squirrel, 144, GROUND - 36, 3);
  if (petLv("cactus")) drawSprite(ctx, SPR.plant, PAL.cactus, 178, GROUND - 36, 3);
  if (petLv("cat")) drawSprite(ctx, SPR.cat, PAL.cat, 210, GROUND - 36 + Math.sin(petT * Math.PI) * -8, 3);
  const hs = 6, hx = HERO_X + pose.dx, hy = GROUND - 14 * hs + pose.lift;
  // 분신
  const cl = petLv("clone");
  if (cl) for (let c = 0; c < (cl >= 10 ? 2 : 1); c++) {
    ctx.save(); ctx.globalAlpha = 0.4;
    drawSprite(ctx, look.map, Object.assign({}, look.pal, { s: "#c9a6ff", h: "#7c5cff", w: "#b9a6ff", p: "#5a4a9a", b: "#3a2a6a", t: "#ffffff", a: "#b9a6ff" }), HERO_X - 64 - c * 44 + pose.dx * 0.6, GROUND - 84, 6);
    ctx.restore();
  }
  // 최대리
  if (look.aura) {
    const a = 0.22 + Math.sin(t / 250) * 0.06;
    const gr = ctx.createRadialGradient(hx + 36, hy + 44, 8, hx + 36, hy + 44, 74);
    gr.addColorStop(0, hexA(look.aura, a)); gr.addColorStop(1, hexA(look.aura, 0));
    ctx.fillStyle = gr; ctx.fillRect(hx - 44, hy - 34, 160, 160);
  }
  ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(hx + 6, GROUND - 3, 60, 6);
  if (anim.a >= 0.4 && anim.a < 0.58 && !reduceMotion) { // 돌진 잔상
    ctx.save(); ctx.globalAlpha = 0.25; drawSprite(ctx, look.map, look.pal, hx - 34, hy, hs); ctx.globalAlpha = 0.12; drawSprite(ctx, look.map, look.pal, hx - 62, hy, hs); ctx.restore();
  }
  drawSprite(ctx, look.map, look.pal, hx, hy, hs);
  const wi = skinIdx(), wlv = wi === S.wi ? S.wl : 5;
  drawWeapon(ctx, wi, wlv, hx + 9.5 * hs, hy + 8.4 * hs, reduceMotion ? 0.4 + (pose.ang - 0.4) * 0.3 : pose.ang, 4, t, false);
  if (laser > 0) { ctx.strokeStyle = hexA("#ff3b3b", laser); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hx + 120, hy + 50); ctx.lineTo(MON_X, GROUND - 60); ctx.stroke(); }
  // 적
  if (mon) {
    const map = SPR[mon.sprite], sc = mon.scale;
    const w = map[0].length * sc, h = map.length * sc;
    const breathe = mon.dying ? 0 : Math.sin(t / 260) * 0.025;
    const sx = 1 + mon.squash * 0.22, sy = 1 - mon.squash * 0.18 + breathe;
    ctx.save();
    ctx.globalAlpha = 1 - mon.dying * 0.85;
    ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(MON_X - w / 2 + 8 + mon.kb * 24, GROUND - 3, w - 16, 6);
    const drop = (1 - mon.born) * -50;
    ctx.translate(MON_X + mon.kb * 26 + mon.fx + (Math.random() - .5) * 4 * mon.red, GROUND + drop + mon.fy);
    ctx.rotate(mon.tilt * 0.22 + mon.rot);
    ctx.scale(sx, sy);
    drawSprite(ctx, map, mon.pal, -w / 2, -h, sc, { flip: true });
    if (mon.red > 0) { ctx.globalAlpha = (1 - mon.dying * 0.85) * mon.red * 0.6; drawSprite(ctx, map, mon.pal, -w / 2, -h, sc, { flip: true, solid: "#ff2a2a" }); }
    if (mon.flash > 0) { ctx.globalAlpha = (1 - mon.dying * 0.85) * mon.flash * 0.85; drawSprite(ctx, map, mon.pal, -w / 2, -h, sc, { flip: true, white: true }); }
    if (mon.crown) { ctx.globalAlpha = 1 - mon.dying * 0.85; drawSprite(ctx, SPR.crown, { y: "#ffd54a", r: "#ff5d5d" }, -9, -h - 15, 4); }
    ctx.restore();
  }
  // 타격 이펙트
  streaks.forEach(s => {
    const a = s.life, len = s.h * 0.75 + 40;
    ctx.save(); ctx.translate(s.x - 12, s.y); ctx.rotate(-0.85);
    ctx.fillStyle = hexA(s.crit ? "#ff6b3b" : fxColor(WEAPONS[wi]), a * 0.55); ctx.fillRect(-len / 2, -(s.crit ? 14 : 10) * a, len, (s.crit ? 28 : 20) * a);
    ctx.fillStyle = hexA("#ffffff", a); ctx.fillRect(-len / 2, -3 * a - 1, len, 6 * a + 2);
    ctx.restore();
  });
  rings.forEach(r => {
    const k = 1 - r.life, rad = (r.big ? 26 : 12) + k * (r.big ? 110 : (r.crit ? 70 : 48));
    ctx.strokeStyle = hexA(r.crit ? "#ffb13b" : "#ffffff", r.life * 0.9); ctx.lineWidth = (r.big ? 10 : 6) * r.life + 1;
    ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, Math.PI * 2); ctx.stroke();
    if (r.life > 0.6) { ctx.fillStyle = hexA("#ffffff", (r.life - 0.6) * 2); ctx.beginPath(); ctx.arc(r.x, r.y, 10 + k * 22, 0, Math.PI * 2); ctx.fill(); }
  });
  bolts.forEach(b => {
    ctx.strokeStyle = hexA(b.big ? "#fff7c2" : "#ffd54a", b.life); ctx.lineWidth = b.big ? 8 : 3;
    ctx.beginPath(); ctx.moveTo(b.big ? MON_X : 230, b.big ? 0 : 268);
    for (let s = 1; s <= 5; s++) ctx.lineTo((b.big ? MON_X : 230 + s * 48) + (Math.random() - .5) * 26, (b.big ? s * 52 : 268 - s * 14));
    ctx.stroke();
  });
  debris.forEach(d => { ctx.globalAlpha = Math.max(0, Math.min(1, d.life * 1.5)); ctx.fillStyle = d.c; ctx.fillRect(d.x, d.y, d.s, d.s); ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(d.x, d.y + d.s - 2, d.s, 2); });
  sparks.forEach(s => {
    ctx.globalAlpha = Math.max(0, s.life);
    if (s.line && s.px != null) { ctx.strokeStyle = s.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s.px - s.vx * 1.4, s.py - s.vy * 1.4); ctx.lineTo(s.x, s.y); ctx.stroke(); }
    else { ctx.fillStyle = s.c; ctx.fillRect(s.x, s.y, 5, 5); }
  });
  ctx.globalAlpha = 1;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  floats.forEach(f => {
    const pop = f.pop ? 1 + 0.9 * Math.max(0, 1 - f.age / 110) : 1;
    ctx.globalAlpha = Math.min(1, f.life * 2.2);
    ctx.font = `${Math.round(f.size * pop)}px "Do Hyeon", sans-serif`;
    ctx.lineWidth = 6; ctx.strokeStyle = "#0e1321"; ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
  });
  ctx.globalAlpha = 1;
  ctx.restore();
  if (screenFlash > 0) { ctx.fillStyle = hexA("#ffffff", screenFlash); ctx.fillRect(0, 0, W, H); }
  if (zoneBanner.t > 0) {
    const a = Math.min(1, zoneBanner.t / 0.4, (2.8 - zoneBanner.t) / 0.3);
    ctx.fillStyle = `rgba(8,10,20,${0.72 * a})`; ctx.fillRect(0, 96, W, 70);
    ctx.fillStyle = hexA("#ffd54a", a); ctx.fillRect(0, 96, W, 3); ctx.fillRect(0, 163, W, 3);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = '34px "Do Hyeon", sans-serif'; ctx.fillStyle = hexA("#ffffff", a); ctx.fillText(zoneBanner.text, W / 2, 124);
    ctx.font = '16px "Do Hyeon", sans-serif'; ctx.fillStyle = hexA("#ffd54a", a); ctx.fillText(zoneBanner.sub, W / 2, 150);
  }
  if (mode === "tower" && zoneBanner.t <= 0) drawMissions();
  if (bubble.t > 0) drawBubble(hx + 30, hy - 4, bubble.text);
  renderTop(false);
}
