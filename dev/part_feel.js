/* ===================== v35 손맛 다시 세우기 (기둥 8 · 게임 디자인 스킬 v1 기준) =====================
   장르: 주 action-combat, 보조 fighting(프레임 데이터). 코드: CP-01 고정 타임스텝 · CP-04 상태 기계 · CP-12 히트스톱·연출 레시피 · CP-13 프레임 데이터.
   수치마다 근거 ID를 붙임. (종합) = 스킬 기준 파일의 일반화, (튜닝) = 우리 화면·공속에 맞춘 시작값(근거 ID 없음, 플레이로 조정).
   흐름
     터치 입력 ─┐                         ┌→ 피해(입력 프레임, P-FEEL-10)
     공격 시계 ─┴→ [1/60초 고정 틱] 곽준영 상태 기계: 쉼 → 예비 → 판정 → 회복(포즈 홀드 → 제자리)
                    판정 프레임 = 접촉 → 피해 묶음 → 연출 레시피(히트스톱·피격 반응·흔들림·소리·숫자)
     렌더만: 몸 리그(어깨→팔꿈치→손이 무기를 쥠, 윗몸 기울기·무릎·발 내딛기) · 칼이 지나간 자리 궤적 · 트라우마 흔들림 · 땅 흔적
   draw·step·hit 에서 부르므로 var 와 function 선언만 씀 */

/* ---------- 시간 (CP-01) ---------- */
var FEEL_DT = 1000 / 60;          // ms. 손맛 시뮬 1틱 = 1/60 s (P-CODE-02 기본값)
var FEEL_MAX_FRAME = 250;         // ms. 한 프레임에 받는 시간 상한 — 탭 복귀 폭주 방지 (P-CODE-03)
var FEEL_MAX_STEPS = 4;           // 렌더 프레임당 틱 상한 — 넘치면 느려질 뿐 폭주하지 않음 (P-CODE-03 예: 4)
/* ---------- 입력 버퍼 명세 (U-FEEL-05 · AP-FEEL-04) ----------
   창: 9f (P-FEEL-02, Ultimate 9f). 우선순위: 터치(플레이어) > 자동 공격 (P-FEEL-03의 '높은 쪽 먼저' 규칙을 우리 입력 2종에 적용).
   소비: 캔슬 창이 열리는 첫 틱에 실행하고 즉시 지움, 창 안 여러 터치는 동작은 첫 번째만 (P-FEEL-03) — 피해는 터치마다 그 프레임에 (U-FEEL-02).
   히트스톱 동안은 버퍼 시간이 흐르지 않음 (프리즈가 곧 입력 창, CP-12).
   예외: 몬스터가 없거나 등장 연출 중이면 터치를 받지 않음(예전과 같음). 자동 기술의 예비동작은 터치가 바로 취소함(판정 전이라 잃는 피해 없음 — 쌓인 자동 타격은 터치 접촉에 같이 넣음). */
var FEEL_BUF = 9;
var FEEL_RAPID = 12;              // f. 직전 접촉에서 12f(0.2 s) 안이면 연사 → 평타 히트스톱 1f (CONF-15 (종합): 연사되는 매 히트는 1 f 안팎)
var FEEL_FLASH_GAP = 20;          // f. 흰 번쩍임 사이 최소 간격 → 초당 3회 이하 (CP-12 광과민: XAG 118 초당 3회·화면 20%)
var FEEL_HOLD_MAX = 40;           // f. 예비동작 끝에서 몬스터를 기다리는 최대 시간 (튜닝)
var FEEL_BIGCRIT = 36;            // f. 큰 치명 연출(X 베기·집중선·큰 숫자·'치명타!')은 0.6 s에 한 번 — 치명 확률이 높으면 치명이 평범해지므로
                                  //    나머지 치명은 '작은 치명'으로 (U-FEEL-07 위계 · AP-FEEL-06 · U-FEEL-12 가독성)

/* ---------- 기술 프레임 데이터 (CP-13 MoveData · action-combat §5) — 정수 프레임@60 ----------
   startup: 첫 판정 프레임(그 틱에 피해). 그중 마지막 strike 프레임이 실제로 내려치는 구간, 앞부분이 예비동작.
   active: 판정 유지 · hold: 끝 자세 유지(포즈 홀드로 읽히게, G-ACT-01) · ret: 제자리로.
   cancel = startup + active + hold → 팔로우스루를 자르지 않고 다음 기술을 받음 (G-ACT-02).
   예비동작은 큰 기술일수록 길게 (G-ACT-01): 올려 6 < 내려 7 < 돌진 8. 내려치기 2~3f (P-FEEL-18: 2f 펀치 > 5f 펀치).
   터치 찌르기: 피해는 입력 프레임(P-FEEL-10), 칼끝은 1f 뒤 닿음(내려치기 1f). dir = 맞는 방향(불꽃·넉백·카메라 킥). */
var FEEL_MOVES = {
  rise:  { startup: 8,  strike: 2, active: 2, hold: 6, ret: 8,  tier: "hit",      dir: [0.75, -0.65] },
  chop:  { startup: 9,  strike: 2, active: 2, hold: 7, ret: 9,  tier: "hit",      dir: [0.55, 0.85] },
  lunge: { startup: 11, strike: 3, active: 3, hold: 8, ret: 10, tier: "finisher", dir: [1, 0] },
  jab:   { startup: 1,  strike: 1, active: 2, hold: 3, ret: 7,  tier: "tap",      dir: [1, 0] },
};
var FEEL_CHAIN = ["rise", "chop", "lunge"];        // 자동 3연타: 올려베기 → 내려베기 → 돌진 찌르기(마무리)
/* 공속 단계: 공격 간격(ms)이 짧으면 같은 기술을 짧게 — 정수로 반올림, 최소 프레임 보장 (튜닝). 터치는 늘 같은 길이 */
var FEEL_SPEED = [[400, 1], [250, 0.85], [0, 0.7]];
var FEEL_FD = (function () {
  const out = {};
  for (const id in FEEL_MOVES) {
    const M = FEEL_MOVES[id];
    out[id] = FEEL_SPEED.map(([, k]) => {
      if (id === "jab") k = 1;
      const r = (v, lo) => Math.max(lo, Math.round(v * k));
      const strike = id === "jab" ? M.strike : r(M.strike, 2), wind = id === "jab" ? 0 : r(M.startup - M.strike, 2);
      const fd = { startup: wind + strike, strike, active: r(M.active, 1), hold: r(M.hold, 2), ret: r(M.ret, 3) };
      fd.cancel = fd.startup + fd.active + fd.hold; fd.total = fd.cancel + fd.ret;
      return fd;
    });
  }
  return out;
})();
function feelFD(mv, st) {
  const iv = st ? st.interval : 500, i = FEEL_SPEED.findIndex(([lo]) => iv >= lo);
  return FEEL_FD[mv][i < 0 ? FEEL_SPEED.length - 1 : i];
}

/* ---------- 연출 레시피 (CP-12 FeelRecipe를 데이터로, CP-09) ----------
   히트스톱 = ⌊(d×0.65 + 6) × h⌋ f, d = 이번 접촉이 깎은 최대 체력 %(Smash의 대미지 % 자리) — Smash Ultimate 형태 (P-GEN-ACT-02, CP-12 ultimateHitlagFrames)
   h·min·cap 은 등급별 (튜닝): 평타 1~3f(P-FEEL-13 10~20 ms ≈ 1f) · 마무리 2~5f · 치명 3~8f(P-FEEL-14 0.05 s = 3f부터)
   처치 6f(P-FEEL-14 폭발 0.1 s) · 큰 보스 처치 12f(상한 Melee 20f 안, P-GEN-FGT-01). 여러 개가 겹치면 합산 대신 큰 값(CP-12 TimeController).
   kb = 넉백 프레임 × 3 px/f (P-FEEL-17) · kick = 카메라 킥 px (P-FEEL-17: 6 px — 치명에만 그대로) · trauma = 이벤트당 트라우마
   (P-FEEL-16 +0.4가 기준, 자주 나는 사건일수록 작게 — U-FEEL-07 영향력 비례) · vs = 피격자 흔들림 px(공격자는 0.3배, CP-12) · sparks = 불꽃 수 · snd = 타격음 세기 */
var FEEL_RECIPE = {
  hit:      { h: 0.12, min: 1, cap: 3, kb: 2, kick: 2, trauma: 0,    vs: 3, sparks: 4,  snd: 0.42 },
  finisher: { h: 0.2,  min: 2, cap: 5, kb: 3, kick: 3, trauma: 0.1,  vs: 4, sparks: 6,  snd: 0.6 },
  tap:      { h: 0.12, min: 1, cap: 2, kb: 1, kick: 1, trauma: 0,    vs: 2, sparks: 3,  snd: 0.4 },
  proj:     { h: 0.1,  min: 1, cap: 2, kb: 1, kick: 0, trauma: 0,    vs: 2, sparks: 0,  snd: 0.36 },
  crit:     { h: 0.3,  min: 3, cap: 8, kb: 4, kick: 6, trauma: 0.25, vs: 6, sparks: 10, snd: 1 },
  critLite: { h: 0.2,  min: 2, cap: 3, kb: 3, kick: 3, trauma: 0,    vs: 4, sparks: 6,  snd: 0.75 },
  kill:     { f: 6,  trauma: 0.15, kick: 4, vs: 5 },
  bossKill: { f: 12, trauma: 0.7,  kick: 8, vs: 8 },
};
function feelHitlag(d, R) { return Math.max(R.min, Math.min(R.cap, Math.floor((d * 0.65 + 6) * R.h))); }
/* 트라우마 흔들림 (CP-11 · P-FEEL-16, Bevy 예제 상수): +트라우마/사건, 초당 0.5 선형 감쇠, 흔들림 = 트라우마², 최대 20 px·10°, 노이즈 속도 20.
   회전은 도트가 깨져 보여 10°의 0.2배만 씀 (U-FEEL-06 검증: 가독성과 부딪치는 효과는 줄인다, CF-12) */
var FEEL_SHAKE = { decay: 0.5, px: 20, rollDeg: 10, rollK: 0.2, speed: 20, hitCap: 0.35, killCap: 0.45 };
/* hitCap·killCap: 자주 나는 타격·처치가 쌓아 올릴 수 있는 트라우마 상한 (흔들림 2.5 px·4 px). 큰 보스 처치·스킬은 상한 없음 (튜닝, U-FEEL-07) */

/* ---------- 몸 리그 자세 ----------
   sh 위팔 · fa 아래팔 · wa 무기 각도 (0 = 위, 시계 방향 +, 1.57 = 앞) · lean 윗몸 기울기(칸) · crouch 무릎(칸) · dx 발 내딛기(px) · lift 뜀(px, − 가 위)
   A = 예비동작 끝 · B = 맞는 순간 · C = 끝까지 휘두른 자세(포즈 홀드) */
var RIG_PAD = 2, RIG_L1 = 2.8, RIG_L2 = 2.3, FEEL_BLADE = 15.5 * 5;
var FEEL_IDLE = { sh: 2.6, fa: 1.75, wa: 0.55, lean: 0, crouch: 0, dx: 0, lift: 0 };
var FEEL_KEYS = {
  rise:  { A: { sh: 3.3, fa: 3.7, wa: 4.5, lean: -1, crouch: 1, dx: -3, lift: 0 }, B: { sh: 1.2, fa: 0.7, wa: 1.35, lean: 1, crouch: 0, dx: 14, lift: -4 }, C: { sh: 0.6, fa: 0.1, wa: 0.25, lean: 0, crouch: 0, dx: 12, lift: -2 } },
  chop:  { A: { sh: -0.2, fa: -0.7, wa: -0.75, lean: -1, crouch: 1, dx: -4, lift: 0 }, B: { sh: 1.55, fa: 1.9, wa: 1.75, lean: 2, crouch: 0, dx: 16, lift: 0 }, C: { sh: 2.2, fa: 2.5, wa: 2.4, lean: 2, crouch: 1, dx: 18, lift: 0 } },
  lunge: { A: { sh: 3.6, fa: 1.6, wa: 1.5, lean: -1, crouch: 1, dx: -6, lift: 0 }, B: { sh: 1.55, fa: 1.55, wa: 1.55, lean: 2, crouch: 0, dx: 28, lift: 0 }, C: { sh: 1.6, fa: 1.6, wa: 1.6, lean: 2, crouch: 1, dx: 30, lift: 0 } },
  jab:   { A: { sh: 3.6, fa: 1.6, wa: 1.5, lean: -1, crouch: 1, dx: -2, lift: 0 }, B: { sh: 1.55, fa: 1.55, wa: 1.55, lean: 1, crouch: 0, dx: 18, lift: 0 }, C: { sh: 1.6, fa: 1.6, wa: 1.6, lean: 1, crouch: 0, dx: 20, lift: 0 } },
};

/* ---------- 상태 ---------- */
var fHero = { mv: null, fd: null, f: 0, p0: null, auto: false, pend: 0, buf: 0, chain: 0, held: 0, frz: 0, frzMax: 0, vs: 0, lastHit: -99, bigCrit: -999, front: null, sh: { x: 0, y: 0 } };
var feelV = { m: null, frz: 0, frzMax: 0, vs: 0, kbF: 0, kbx: 0, whiteUntil: -1, whiteNew: false, lastWhite: -99 };
var feelClock = { acc: 0, tick: 0, alpha: 0 };
var feelCam = { trauma: 0, t: 0, last: 0, kx: 0, ky: 0, roll: 0 };
var feelB = null, feelSt = null, feelMarks = [], feelVoiceT = 0;

/* ---------- 상태 기계 (CP-04): 전이는 새 상태를 '돌려줌', 데이터는 주인(fHero)에 두고 상태 객체는 공유 ---------- */
function FeelMachine(o, s) { this.o = o; this.cur = s; if (s.enter) s.enter(o); }
FeelMachine.prototype.swap = function (n) { if (!n) return; if (this.cur.exit) this.cur.exit(this.o); this.cur = n; if (n.enter) n.enter(this.o); };
FeelMachine.prototype.handle = function (b) { this.swap(this.cur.handle(this.o, b)); };
FeelMachine.prototype.update = function () { this.swap(this.cur.update(this.o)); };
var FH_IDLE = {
  id: "idle",
  enter(h) { h.mv = null; h.fd = null; },
  handle(h, b) { return b === "TAP" ? feelBegin(h, "jab") : null; },
  update(h) { return feelAutoNext(h); },
};
var FH_WIND = {                                   // 예비동작 + 내려치기 (판정 전)
  id: "windup",
  handle(h, b) { return b === "TAP" ? feelBegin(h, "jab") : null; },        // 터치가 우선 — 판정 전이라 바로 취소
  update(h) {
    const W = h.fd.startup - h.fd.strike;
    if (h.auto && h.f === W && !feelStrikeReady(h)) {                       // 예비동작 끝에서 칼을 든 채 기다림 (포즈 홀드)
      if (++h.held > FEEL_HOLD_MAX) return FH_IDLE;
      return null;
    }
    if (h.f === W && h.auto) sfx("swing");                                  // 휘두르는 소리는 내려치기 시작에
    h.f++;
    return h.f >= h.fd.startup ? FH_ACT : null;
  },
};
var FH_ACT = {                                    // 판정 구간: 들어올 때 접촉(피해)
  id: "active",
  enter(h) { feelContact(h); },
  handle(h, b) { if (b === "TAP") h.buf = FEEL_BUF; return null; },
  update(h) { h.f++; return h.f >= h.fd.startup + h.fd.active ? FH_REC : null; },
};
var FH_REC = {                                    // 포즈 홀드 → 제자리. 캔슬 창부터 다음 기술
  id: "recover",
  handle(h, b) { if (b !== "TAP") return null; if (h.f >= h.fd.cancel) return feelBegin(h, "jab"); h.buf = FEEL_BUF; return null; },
  update(h) {
    h.f++;
    if (h.f >= h.fd.cancel) {
      if (h.buf > 0) { h.buf = 0; return feelBegin(h, "jab"); }           // 버퍼 소비 (P-FEEL-03)
      const nx = feelAutoNext(h); if (nx) return nx;
    }
    return h.f >= h.fd.total ? FH_IDLE : null;
  },
};
var fHeroM = new FeelMachine(fHero, FH_IDLE);

/* 기술 시작: 지금 자세에서 이어서 */
function feelBegin(h, mv) {
  h.p0 = feelPoseRaw();
  h.mv = mv; h.fd = feelFD(mv, feelSt || stats()); h.f = 0; h.held = 0; h.auto = mv !== "jab";
  if (h.auto) h.chain++;
  anim = { a: 0.5, dur: 200, pending: false, type: mv };                    // 예전 코드 호환
  return h.fd.startup > 0 ? FH_WIND : FH_ACT;
}
function feelLive() { return !!(mon && !mon.dying && spawnWait <= 0 && !introBlocking()); }
/* 다음 자동 타격까지 남은 시간(ms): 몬스터 교체 중이면 남은 대기도 더함. 엘리베이터·등장 연출 중엔 모름 */
function feelDueIn(st) {
  const left = st.interval - atkTimer;
  if (feelLive()) return left;
  if (mon && mon.dying && spawnWait > 0 && !lift && !intro) return spawnWait + left;
  return Infinity;
}
/* 자동 기술은 판정 프레임이 다음 타격 시각에 오도록 미리 시작 */
function feelAutoNext(h) {
  const st = feelSt || stats(), mv = FEEL_CHAIN[h.chain % FEEL_CHAIN.length], fd = feelFD(mv, st);
  if ((h.pend > 0 && feelLive()) || feelDueIn(st) <= fd.startup * FEEL_DT) return feelBegin(h, mv);
  return null;
}
/* 내려치기를 시작해도 되나: 몬스터가 칼끝 닿는 곳에 있고, 타격이 쌓였거나 내려치는 동안 돌아옴 */
function feelStrikeReady(h) {
  if (!feelLive() || !feelInReach(h.mv)) return false;
  return h.pend > 0 || (feelSt || stats()).interval - atkTimer <= h.fd.strike * FEEL_DT;
}
/* 판정 프레임: 쌓인 자동 타격을 한 번에 (숫자는 합계 하나 + ×n) */
function feelContact(h) {
  if (!h.auto || !feelLive()) return;                                      // 터치는 입력 프레임에 이미 처리
  const st = feelSt || stats();
  let n = h.pend; h.pend = 0;
  if (n <= 0) { n = 1; atkTimer -= st.interval; }                          // 내려치는 1~3f만큼 미리 — 그만큼 다음 타격이 늦게 옴(초당 타격 수 그대로)
  feelStrikes(st, n, h.mv);
}
function feelStrikes(st, n, mv) {
  feelB = { mv, n: 0, dmg: 0, crit: false, kill: false, boss: false, clone: 0, max: mon ? mon.max : 1, x: null, y: null };
  let k = 0;
  for (; k < n && feelLive(); k++) heroStrike(st);
  feelCarry(n - k);
  const b = feelB; feelB = null;
  if (b.n || b.clone) feelImpact(b);
}
/* 처치 뒤 남은 타격: 다음 몬스터로 1번까지만 넘김 — 예전처럼 공격 시계를 한 칸까지만 모아 둠 (예전: atkTimer ≤ 간격) → 처치 속도가 예전과 같음 */
function feelCarry(left) { if (left > 0) fHero.pend = Math.min(fHero.pend + left, 1); }
/* 터치 (pointerdown): 입력 프레임에 피해, 동작은 상태 기계가 판단 */
function feelTap(ix, iy) {
  const st = stats(), crit = Math.random() < st.crit;
  feelSt = st;
  fHeroM.handle("TAP");
  sfx("swing");
  const n = fHero.pend; fHero.pend = 0;
  feelB = { mv: "jab", n: 0, dmg: 0, crit: false, kill: false, boss: false, clone: 0, max: mon ? mon.max : 1, x: null, y: null };
  let k = 0;
  for (; k < n && feelLive(); k++) heroStrike(st);
  feelCarry(n - k);
  if (feelLive()) hit(st.tap * (crit ? st.critMul : 1), crit, "tap", ix, iy);
  const b = feelB; feelB = null;
  if (b.n || b.clone) feelImpact(b);
}
/* hit() 안 (mon.hp를 깎은 뒤): 곽준영 타격은 여기서 처리하고 true. 동료 타격은 예전 길로 */
function feelHit(amount, crit, src, px, py) {
  const heavy = src === "hero" || src === "tap" || src === "jhero";
  if (!heavy && !(src === "clone" && feelB)) return false;
  const b = feelB;
  if (heavy) {
    combo++; comboT = 1.4; comboPop = 1;
    if ([10, 25, 50, 100, 200, 300, 500, 1000].includes(combo)) comboMilestone(combo);
    if (b) { b.n++; b.dmg += amount; if (crit) b.crit = true; if (src === "tap" || src === "jhero") { b.x = px; b.y = py; } }
  } else b.clone += amount;
  if (mon.hp <= 0) { if (b) { b.kill = true; b.boss = mon.kind >= 2; } kill(); }
  if (!b) feelImpact({ mv: "proj", n: 1, dmg: amount, crit, kill: !!mon.dying, boss: mon.kind >= 2, clone: 0, max: mon.max, x: px, y: py });
  return true;
}

/* ---------- 고정 틱 (CP-01) — step()이 게임 시간 dt(ms, 슬로모션 반영)로 부름 ---------- */
function feelRun(dt, st) {
  feelSt = st;
  feelClock.acc += Math.min(Math.max(0, dt), FEEL_MAX_FRAME);
  let n = 0;
  while (feelClock.acc >= FEEL_DT && n < FEEL_MAX_STEPS) { feelTick(st); feelClock.acc -= FEEL_DT; feelClock.tick++; n++; }
  if (feelClock.acc >= FEEL_DT) feelClock.acc %= FEEL_DT;                 // 상한에 걸리면 밀린 시간은 버림 → 느려질 뿐 (CP-01)
  feelClock.alpha = feelClock.acc / FEEL_DT;
}
function feelTick(st) {
  const h = fHero, V = feelVictim();
  if (feelLive()) { atkTimer += FEEL_DT; while (atkTimer >= st.interval) { atkTimer -= st.interval; h.pend++; } }
  if (h.frz > 0) h.frz--;                                                  // 히트스톱 중엔 프레임·판정·버퍼 시간이 멈춤 (CP-13 advanceMove)
  else { if (h.buf > 0) h.buf--; fHeroM.update(); }
  if (V.frz > 0) V.frz--;
  else if (!reduceMotion) { if (V.kbF > 0) { V.kbx += 3; V.kbF--; } else if (V.kbx > 0) V.kbx = Math.max(0, V.kbx - 1.5); }   // 넉백 3 px/f (P-FEEL-17), 돌아오기 1.5 px/f (튜닝)
}
function feelVictim() { if (feelV.m !== mon) { feelV.m = mon; feelV.frz = 0; feelV.kbF = 0; feelV.kbx = 0; feelV.whiteUntil = -1; feelV.whiteNew = false; } return feelV; }
function feelMonFrozen() { return !!(mon && feelV.m === mon && feelV.frz > 0); }
/* 히트스톱 (CP-12 TimeController): 공격자·피격자 동시 프리즈, 합산 대신 큰 값 */
function feelFreeze(fr, attacker, vs) {
  if (!(fr > 0)) return;
  const V = feelVictim();
  if (fr >= V.frz) { V.frz = fr; V.frzMax = fr; V.vs = vs; }
  if (attacker && fr >= fHero.frz) { fHero.frz = fr; fHero.frzMax = fr; fHero.vs = vs * 0.3; }
}
/* 프리즈 중 흔들림(렌더만): 지상은 수평, 틱마다 좌우 번갈아, 점점 줄어듦 (P-FEEL-15 ③④, 판정 좌표는 그대로 ②) */
function feelShakeOff(frz, max, amp) {
  if (!(frz > 0) || reduceMotion || !amp) return 0;
  return (feelClock.tick % 2 ? 1 : -1) * amp * (frz / Math.max(1, max)) * (shakeK() > 0 ? 1 : 0.5);
}
function feelMonDX() { return mon && feelV.m === mon ? feelV.kbx + feelShakeOff(feelV.frz, feelV.frzMax, feelV.vs) : 0; }
/* 흰색 1f: 다음 틱까지 보이고, 프레임이 느려도 한 번은 그려지게 */
function feelWhite() {
  if (!mon || feelV.m !== mon) return false;
  const on = feelV.whiteNew || feelClock.tick <= feelV.whiteUntil; feelV.whiteNew = false; return on;
}

/* ---------- 접촉 연출 (CP-12 onHit: 프리즈 → 흔들림 → 트라우마 → 카메라 킥 → 번쩍임 → 불꽃 → 소리, 연출은 게임 상태를 바꾸지 않음) ---------- */
function feelImpact(b) {
  if (!mon) return;
  const M = FEEL_MOVES[b.mv], melee = b.mv !== "proj", now0 = feelClock.tick;
  const big = b.crit && (b.kill || now0 - fHero.bigCrit >= FEEL_BIGCRIT); if (big) fHero.bigCrit = now0;
  const R = b.crit ? (big ? FEEL_RECIPE.crit : FEEL_RECIPE.critLite) : FEEL_RECIPE[melee ? M.tier : "proj"];
  const d = 100 * b.dmg / Math.max(1e-9, b.max);
  let hs = feelHitlag(d, R);
  if (melee && !big && now0 - fHero.lastHit < FEEL_RAPID) hs = Math.min(hs, b.crit ? 2 : 1);
  if (melee) fHero.lastHit = feelClock.tick;
  feelFreeze(hs, melee, R.vs);
  // 피격 반응 (G-ACT-04): 흰색 1f → 반응 포즈 2f → 넉백 3 px/f
  const V = feelVictim(), now = feelClock.tick;
  if (flashK() > 0 && now - V.lastWhite >= FEEL_FLASH_GAP) { V.whiteUntil = now + 1; V.whiteNew = true; V.lastWhite = now; }
  mon.red = Math.max(mon.red, 0.7);
  const dir = M ? M.dir : [1, 0];
  if (!reduceMotion) {
    V.kbF = Math.max(V.kbF, R.kb);
    mon.squash = Math.max(mon.squash, b.mv === "chop" ? (big ? 1.2 : 0.85) : b.mv === "lunge" ? 0.75 : 0.5);
    mon.tilt = Math.max(mon.tilt, b.mv === "rise" ? (big ? 1 : 0.7) : 0.3);
  }
  const [ix, iy] = b.x != null ? [b.x, b.y] : feelHitPoint(b.mv);
  if (!reduceMotion) {
    for (let i = 0; i < R.sparks; i++) { const sp = 3 + Math.random() * (big ? 10 : 7); sparks.push({ x: ix, y: iy, vx: dir[0] * sp + (Math.random() - .5) * 3, vy: dir[1] * sp + (Math.random() - .5) * 3 - 1, life: 1, c: i % 3 ? "#fff7c2" : "#ffffff", line: true }); }
    if (melee) addBurst(ix, iy, big);
    if (b.mv === "chop") { addDust(MON_X - 10, GROUND - 3, big ? 4 : 2, 1, false); feelMark(MON_X - 14, 30, "cut"); }
    if (b.mv === "lunge") addDust(HERO_X + 30, GROUND - 3, 3, -1, false);
  }
  feelTrauma(R.trauma * Math.min(1, 0.4 + d / 25), FEEL_SHAKE.hitCap); feelKick(dir, R.kick);   // 트라우마도 깎은 체력에 비례
  if (big) {
    const fancy = !(b.kill && mon.kind === 0);                              // 일반 몬스터 처치는 처치 연출이 주인공 — 치명 장식은 빼서 겹치지 않게
    if (melee && fancy) addSlash(b.mv === "rise" ? "rise" : b.mv === "chop" ? "chop" : "thrust", true);
    if (mon.kind >= 1 && d >= 8) triggerImpactFrame(ix, iy);                // 만화식 임팩트 프레임은 보스급에 큰 한 방일 때만
    cam.kick = Math.max(cam.kick, 0.6);
    if (fancy && performance.now() - critFxT > 420) { critFxT = performance.now(); critLines = 1; }
    if (!reduceMotion) { const col = monColor(); for (let i = 0; i < 5; i++) debris.push({ x: ix + (Math.random() - .5) * 20, y: iy, vx: dir[0] * (2 + Math.random() * 5), vy: -3 - Math.random() * 5, life: 1, c: col, s: 4 + Math.random() * 4 }); }
    const stl = slashStyle(); if (fancy && (stl === "holy" || stl === "gold")) addSkyStrike(MON_X, true);
    sfx("crit");
  }
  hitSound(R.snd * (b.kill ? 1.2 : 1)); feelMonVoice(R.snd);
  const { h: mh } = monSize();
  addFloat(ix + 4, iy - mh * 0.25 - 8, fmt(b.dmg), b.crit ? "#ff5d5d" : "#ffffff", big ? 32 : b.crit ? 28 : 26, true, big ? "crit" : "hit");
  if (b.crit && !big) { const fl = floats[floats.length - 1]; if (fl) { fl.look = "critlite"; } }
  const f = floats[floats.length - 1]; if (f && b.n > 1) f.mult = b.n;
  if (b.clone > 0) addFloat(ix - 26, iy - mh * 0.25 - 30, fmt(b.clone), "#c9a6ff", 17, false, "pet");
  feelCapFloats();
}
/* 처치 (kill() 안): 예전 전역 멈춤 95/170 ms·흔들림 10/18 대신 */
function feelKill(boss) {
  const K = boss ? FEEL_RECIPE.bossKill : FEEL_RECIPE.kill;
  feelFreeze(K.f, true, K.vs);
  feelTrauma(K.trauma, boss ? 1 : FEEL_SHAKE.killCap); feelKick([1, -0.2], K.kick);
  feelMark(MON_X - 6, boss ? 76 : 46, "kill");
  if (boss) triggerImpactFrame(MON_X - 10, GROUND - monSize().h * 0.5);
  if (!reduceMotion) { const { w: mw, h: mh } = monSize(), col = monColor(); for (let i = 0; i < (boss ? 10 : 6); i++) debris.push({ x: MON_X + (Math.random() - .5) * mw * 0.5, y: GROUND - mh * (0.3 + Math.random() * 0.5), vx: 2 + Math.random() * 6, vy: -4 - Math.random() * 6, life: 1, c: col, s: 4 + Math.random() * 5 }); }
}
/* 맞는 자리 = 맞는 순간 칼끝 (이펙트 = 판정, AP-FEEL-11), 몬스터 몸 안으로 맞춤 */
function feelBox() {
  const { w: mw, h: mh } = monSize(), eo = typeof enterOffset === "function" ? enterOffset() : { dx: 0, dy: 0 }, cx = MON_X + monOX() + mon.kb * 26 + feelV.kbx + eo.dx;
  return { x0: cx - mw / 2, x1: cx + mw / 2, y0: GROUND + eo.dy - mh, y1: GROUND + eo.dy };
}
function feelTip(P) {
  const look = heroLook(), R = rigBody(look, Math.round(P.lean), P.crouch > 0.5 ? 1 : 0), arm = rigArm(R, P), hs = 3.5;
  const x0 = HERO_X + P.dx - RIG_PAD * hs, y0 = GROUND - 24 * hs + P.lift - R.top * hs, gx = x0 + arm.hx * hs, gy = y0 + arm.hy * hs;
  return [gx + Math.sin(P.wa) * FEEL_BLADE, gy - Math.cos(P.wa) * FEEL_BLADE];
}
function feelHitPoint(mv) {
  const K = FEEL_KEYS[mv] || FEEL_KEYS.jab, B = feelBox(), [tx, ty] = feelTip(K.B);
  return [Math.max(B.x0 + 8, Math.min((B.x0 + B.x1) / 2, tx)), Math.max(B.y0 + 10, Math.min(B.y1 - 10, ty))];
}
/* 칼끝이 몬스터에 닿나 (걸어 들어오는 중이면 기다림) */
function feelInReach(mv) {
  if (!mon) return false;
  const K = FEEL_KEYS[mv] || FEEL_KEYS.jab, [tx] = feelTip(K.B), B = feelBox();
  return tx >= B.x0 - 10 || B.x0 <= MON_X + monOX() - monSize().w / 2 + 12;
}

/* ---------- 트라우마 흔들림 · 카메라 킥 (CP-11): 렌더 트랜스폼에만, 게임 좌표는 그대로 (U-FEEL-08) ---------- */
var FEEL_GRAD = (function () { const g = []; let s = 20261011; for (let i = 0; i < 256; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; g.push((s >> 8) / 8388608 * 2 - 1); } return g; })();
function feelNoise(x) {                                                     // 1차원 펄린 노이즈 (−1~1)
  const i = Math.floor(x), f = x - i, g0 = FEEL_GRAD[i & 255], g1 = FEEL_GRAD[(i + 1) & 255], u = f * f * f * (f * (f * 6 - 15) + 10);
  return Math.max(-1, Math.min(1, (g0 * f + (g1 * (f - 1) - g0 * f) * u) * 2));
}
function feelTrauma(a, cap) { if (a > 0) feelCam.trauma = Math.max(feelCam.trauma, Math.min(cap || 1, feelCam.trauma + a)); }
function feelKick(dir, px) { if (!(px > 0)) return; feelCam.kx += dir[0] * px; feelCam.ky += dir[1] * px; const L = Math.hypot(feelCam.kx, feelCam.ky); if (L > 10) { feelCam.kx *= 10 / L; feelCam.ky *= 10 / L; } }
/* draw()에서 한 번: 실제 시간으로 감쇠. 예전 흔들림 요청(shakeAmt, 스킬·보스 등장)도 트라우마로 바꿔 받음 */
function feelView(now) {
  const dt = feelCam.last ? Math.min(0.1, Math.max(0, (now - feelCam.last) / 1000)) : 0; feelCam.last = now;
  if (shakeAmt > 0) { feelCam.trauma = Math.max(feelCam.trauma, Math.min(1, Math.sqrt(Math.min(1, shakeAmt / 20)) * 0.85)); shakeAmt = 0; }
  feelCam.trauma = Math.max(0, feelCam.trauma - FEEL_SHAKE.decay * dt); feelCam.t += dt;
  const kd = Math.pow(0.0005, dt / 0.12); feelCam.kx *= kd; feelCam.ky *= kd;   // 킥은 0.12 s 안에 거의 사라짐 (튜닝)
  const k = shakeK(), s = feelCam.trauma * feelCam.trauma * k, n = feelCam.t * FEEL_SHAKE.speed;
  bgShx = feelNoise(n + 100) * s * FEEL_SHAKE.px + feelCam.kx * k;
  bgShy = feelNoise(n + 200) * s * FEEL_SHAKE.px + feelCam.ky * k;
  feelCam.roll = feelNoise(n) * s * FEEL_SHAKE.rollDeg * FEEL_SHAKE.rollK * Math.PI / 180;
  feelMarks.forEach(m => m.t += dt * 1000); feelMarks = feelMarks.filter(m => m.t < m.dur);
}
/* 월드 층 변환에 화면 회전(roll)을 더함: 화면 가운데 기준 */
function feelSetT(s, tx, ty) {
  const r = feelCam.roll;
  if (!r) { ctx.setTransform(s, 0, 0, s, tx, ty); return; }
  const c = Math.cos(r), n = Math.sin(r), cx = CSW / 2, cy = CSH / 2;
  ctx.setTransform(s * c, s * n, -s * n, s * c, c * tx - n * ty + cx - c * cx + n * cy, n * tx + c * ty + cy - n * cx - c * cy);
}

/* ---------- 땅 흔적 (U-FEEL-09 · AP-FEEL-13): 내려벤 자리·처치 자리, 8개까지 (CP-07: 가득 차면 오래된 것부터) ---------- */
function feelMark(x, w, kind) { if (feelMarks.length >= 8) feelMarks.shift(); feelMarks.push({ x: x + (Math.random() - .5) * 10, w, kind, t: 0, dur: kind === "kill" ? 5000 : 3200, seed: Math.random() * 10 }); }
function drawFeelMarks() {
  if (!feelMarks.length) return;
  ctx.save();
  feelMarks.forEach(m => {
    const a = Math.min(1, (1 - m.t / m.dur) * 2.5) * (m.kind === "kill" ? 0.5 : 0.38);
    ctx.globalAlpha = a; ctx.fillStyle = "#120d0a";
    ctx.beginPath(); ctx.ellipse(m.x, GROUND - 0.5, m.w / 2, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = m.kind === "kill" ? "#3a2416" : "#2a2420";
    for (let i = 0; i < 3; i++) { const x = m.x + (((m.seed * (i + 3) * 7.3) % 1) - 0.5) * m.w * 0.8; ctx.fillRect(x - 5, GROUND - 1.5 - i % 2, 10, 1.5); }
  });
  ctx.restore();
}

/* ---------- 곽준영 자세 ---------- */
function feelEaseOut(k) { return 1 - Math.pow(1 - k, 3); }
function feelEaseIn(k) { return k * k; }
function feelEaseIO(k) { return 0.5 - 0.5 * Math.cos(Math.PI * k); }
function feelLerp(P, Q, k) { const o = {}; for (const key in FEEL_IDLE) o[key] = P[key] + (Q[key] - P[key]) * k; return o; }
function feelIdle() {
  const o = Object.assign({}, FEEL_IDLE);
  if (!reduceMotion) { const now = performance.now(); o.crouch = Math.floor(now / 620) % 2; o.wa = FEEL_IDLE.wa + Math.sin(now / 700) * 0.05; }
  return o;
}
/* 프레임 fr(소수 = 틱 사이 보간, CP-01 alpha)의 자세 */
function feelPoseAt(mv, fd, p0, fr) {
  const K = FEEL_KEYS[mv], W = fd.startup - fd.strike, S = fd.startup, A = S + fd.active;
  if (fr < W) return feelLerp(p0, K.A, feelEaseOut(fr / W));                                  // 예비동작: 빠르게 들고 멈추듯 (안티시페이션)
  if (fr < S) return feelLerp(W > 0 ? K.A : p0, K.B, feelEaseIn((fr - W) / fd.strike));        // 내려치기: 점점 빠르게
  if (fr < A) return feelLerp(K.B, K.C, feelEaseOut((fr - S) / fd.active));                     // 맞는 구간: 끝까지 밀어붙임
  if (fr < fd.cancel) return Object.assign({}, K.C);                                            // 포즈 홀드
  if (fr < fd.total) return feelLerp(K.C, feelIdle(), feelEaseIO((fr - fd.cancel) / fd.ret));   // 제자리로
  return feelIdle();
}
function feelFrame() { const h = fHero; return h.f + (h.frz > 0 || fHeroM.cur === FH_WIND && h.held > 0 ? 0 : Math.min(0.999, feelClock.alpha)); }
function feelPoseRaw() { const h = fHero; return h.mv && h.fd ? feelPoseAt(h.mv, h.fd, h.p0 || FEEL_IDLE, feelFrame()) : feelIdle(); }
function feelPoseNow() {
  const P = feelPoseRaw();
  if (reduceMotion) { P.dx = 0; P.lean = 0; P.lift = 0; P.crouch = 0; }
  else P.dx += feelShakeOff(fHero.frz, fHero.frzMax, fHero.vs);                               // 공격자는 완전히 멈추지 않음 (P-FEEL-15 ⑦)
  P.ang = P.wa;
  return P;
}
function feelPivot() { return fHero.sh.x ? { x: fHero.sh.x, y: fHero.sh.y } : { x: HERO_X + 10 + 15.5 * 3.5, y: GROUND - 84 + 1 + 16 * 3.5 }; }

/* ---------- 몸 그림: 앞팔 지우고, 윗몸 기울이고, 무릎 굽힌 지도 (모양마다 한 번만 만듦) ---------- */
var rigBodyCache;
function rigBody(look, lean, crouch) {
  rigBodyCache = rigBodyCache || new WeakMap();
  let byKey = rigBodyCache.get(look.map); if (!byKey) { byKey = new Map(); rigBodyCache.set(look.map, byKey); }
  const key = lean + "|" + crouch; if (byKey.has(key)) return byKey.get(key);
  const top = look.top || 0, src = look.map, W = Math.max(...src.map(r => r.length)), pad = ".".repeat(RIG_PAD);
  const at = (r, c) => (src[top + r] || "")[c] || ".";
  // 앞팔 지우기: 14줄 14칸, 15줄 13~16칸(13칸은 몸통 색으로 메움), 16줄 14~16칸
  const sleeve = at(15, 14) !== "." ? at(15, 14) : "a", cuff = at(16, 14) !== "." ? at(16, 14) : sleeve, skin = at(15, 15) !== "." ? at(15, 15) : "s";
  let rows = src.map((row, i) => {
    let s = row.padEnd(W, "."); const r = i - top;
    if (r === 14) s = setCh(s, 14, ".");
    if (r === 15) { s = setCh(s, 13, at(15, 12) !== "." ? at(15, 12) : "j"); for (let c = 14; c <= 16; c++) s = setCh(s, c, "."); }
    if (r === 16) for (let c = 14; c <= 16; c++) s = setCh(s, c, ".");
    return s;
  });
  // 윗몸 기울이기: 머리(0~11줄)는 lean 칸, 몸통(12~18줄)은 절반
  const shift = (s, k) => k > 0 ? ".".repeat(k) + s.slice(0, s.length - k) : k < 0 ? s.slice(-k) + ".".repeat(-k) : s;
  const tl = lean > 0 ? Math.floor(lean / 2) : lean < 0 ? -Math.floor(-lean / 2) : 0;
  rows = rows.map((s, i) => { const r = i - top; return pad + shift(s, r <= 11 ? lean : r <= 18 ? tl : 0) + pad; });
  // 무릎 굽히기: 다리 한 줄(21줄)을 빼고 맨 위에 빈 줄
  if (crouch > 0 && rows[top + 21]) { rows.splice(top + 21, 1); rows.unshift(".".repeat(rows[0].length)); }
  const o = { map: rows, top, tl, sleeve, cuff, skin };
  byKey.set(key, o); return o;
}
/* ---------- 앞팔: 어깨 → 팔꿈치 → 손을 도트 칸으로 (각도는 10도 단위로 모아 지도를 다시 씀) ---------- */
var rigArmCache = new Map();
function rigArm(R, pose) {
  const q = v => Math.round(v / 0.1745) * 0.1745, sh = q(pose.sh), fa = q(pose.fa), cr = pose.crouch > 0.5 ? 1 : 0;
  const Sx = RIG_PAD + 13.3 + R.tl, Sy = R.top + 12.8 + cr;
  const Ex = Sx + RIG_L1 * Math.sin(sh), Ey = Sy - RIG_L1 * Math.cos(sh), Hx = Ex + RIG_L2 * Math.sin(fa), Hy = Ey - RIG_L2 * Math.cos(fa);
  const key = [sh.toFixed(2), fa.toFixed(2), R.tl, cr, R.top].join("|");
  let A = rigArmCache.get(key);
  if (!A) {
    const seg = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy || 1, k = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / L)), dx = ax + vx * k - px, dy = ay + vy * k - py; return [Math.hypot(dx, dy), k]; };
    const x0 = Math.floor(Math.min(Sx, Ex, Hx) - 2), y0 = Math.floor(Math.min(Sy, Ey, Hy) - 2), x1 = Math.ceil(Math.max(Sx, Ex, Hx) + 2), y1 = Math.ceil(Math.max(Sy, Ey, Hy) + 2);
    const rows = [];
    for (let y = y0; y < y1; y++) {
      let s = "";
      for (let x = x0; x < x1; x++) {
        const cx = x + 0.5, cy = y + 0.5, dh = Math.hypot(cx - Hx, cy - Hy), [d1] = seg(cx, cy, Sx, Sy, Ex, Ey), [d2, k2] = seg(cx, cy, Ex, Ey, Hx, Hy);
        s += dh <= 1.0 ? "S" : d2 <= 0.78 ? (k2 > 0.72 ? "X" : "A") : d1 <= 0.86 ? "A" : ".";
      }
      rows.push(s);
    }
    A = { map: rows, bx: x0, by: y0 };
    if (rigArmCache.size > 400) rigArmCache.clear();
    rigArmCache.set(key, A);
  }
  return { map: A.map, bx: A.bx, by: A.by, hx: Hx, hy: Hy, sx: Sx, sy: Sy };
}
function rigArmPal(look, R) {
  const p = look.pal, sl = p[R.sleeve] || "#1c1c26";
  return { A: /^#[0-9a-f]{6}$/i.test(sl) ? shade(sl, 0.16) : sl, X: p[R.cuff] || sl, S: p[R.skin] || "#f2c9a0" };   // 앞팔은 몸통과 같은 색이면 묻혀서 한 단계 밝게
}

/* ---------- 곽준영 그리기: 반사·그림자 → (등 뒤 무기) → 몸 → 궤적·무기 → 앞팔. 휘두르는 동안 무기·팔은 몬스터보다 앞에 ---------- */
function drawHeroRig(t, look, pose, hx, hy, hs) {
  const R = rigBody(look, Math.round(pose.lean), pose.crouch > 0.5 ? 1 : 0), x0 = hx - RIG_PAD * hs, y0 = hy - R.top * hs;
  reflect(() => drawSprite(ctx, R.map, look.pal, x0, y0, hs, { pretty: true }));
  ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(hx + 6, GROUND - 3, 60, 6);
  const arm = rigArm(R, pose), apal = rigArmPal(look, R), WS = 5;
  const gx = x0 + arm.hx * hs, gy = y0 + arm.hy * hs, back = Math.sin(pose.wa) < -0.25;
  fHero.sh.x = x0 + arm.sx * hs; fHero.sh.y = y0 + arm.sy * hs; heroHand.x = gx; heroHand.y = gy;
  if (back) drawHeldWeapon(ctx, gx, gy, pose.wa, WS, t, false, 1.8);
  drawSprite(ctx, R.map, look.pal, x0, y0, hs, { pretty: true });
  const front = () => {
    feelSmear(look, hx - pose.dx, hy - pose.lift, hs, t);
    if (!back) drawHeldWeapon(ctx, gx, gy, pose.wa, WS, t, false, 1.8);
    drawSprite(ctx, arm.map, apal, x0 + arm.bx * hs, y0 + arm.by * hs, hs, { pretty: true });
  };
  const h = fHero, fr = feelFrame();
  if (h.mv && h.fd && fr >= h.fd.startup - h.fd.strike - 1 && fr <= h.fd.cancel + 1) fHero.front = front; else front();
}
function feelFront() { const f = fHero.front; fHero.front = null; if (f) f(); }
/* 궤적: 내려치기~판정 동안 칼이 실제로 지나간 자리(칼 30%~끝)를 칠함 — 예전처럼 무기를 여러 장 겹치지 않음 */
function feelBlade(look, hx0, hy0, hs, p) {
  const R = rigBody(look, Math.round(p.lean), p.crouch > 0.5 ? 1 : 0), arm = rigArm(R, p);
  const x0 = hx0 + p.dx - RIG_PAD * hs, y0 = hy0 + p.lift - R.top * hs, gx = x0 + arm.hx * hs, gy = y0 + arm.hy * hs, sx = Math.sin(p.wa), sy = -Math.cos(p.wa);
  return [gx + sx * FEEL_BLADE * 0.3, gy + sy * FEEL_BLADE * 0.3, gx + sx * FEEL_BLADE, gy + sy * FEEL_BLADE];
}
function feelSmear(look, hx0, hy0, hs, t) {
  const h = fHero; if (reduceMotion || !h.mv || !h.fd) return;
  const fd = h.fd, W = fd.startup - fd.strike, A = fd.startup + fd.active, fr = feelFrame();
  if (fr <= W || fr > A + 2) return;
  const a1 = Math.min(fr, A), a0 = Math.max(W, a1 - (h.mv === "jab" ? 1.5 : 2.6)); if (a1 - a0 < 0.05) return;
  const N = 7, pts = [];
  for (let i = 0; i <= N; i++) pts.push(feelBlade(look, hx0, hy0, hs, feelPoseAt(h.mv, fd, h.p0 || FEEL_IDLE, a0 + (a1 - a0) * i / N)));
  const pal = slashPal(slashStyle(), false, t), fade = fr <= A ? 1 : Math.max(0, 1 - (fr - A) / 2);
  const ribbon = (inner, col, alpha) => {
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p[2], p[3]) : ctx.moveTo(p[2], p[3]));
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; ctx.lineTo(p[2] + (p[0] - p[2]) * inner, p[3] + (p[1] - p[3]) * inner); }
    ctx.closePath(); ctx.globalAlpha = alpha * fade; ctx.fillStyle = col; ctx.fill();
  };
  ctx.save(); ribbon(1, pal[0], 0.24); ribbon(0.62, pal[1], 0.44); ribbon(0.26, pal[2], 0.72); ctx.restore();
}

/* ---------- 소리: 무기 재질음(hitSound) + 몬스터 고유음 (P-FEEL-17 재질 + 적 고유 사운드, U-FEEL-13) ---------- */
function feelHash(s) { let h = 0; s = String(s || ""); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function feelMonVoice(s) {
  if (!sfxOn() || !audioCtx || !masterGain || document.hidden || !mon) return;
  const now = performance.now(); if (now - feelVoiceT < 70) return; feelVoiceT = now;
  try {
    const t = audioCtx.currentTime, out = hitOut(), sz = mon.kind >= 2 ? 2 : mon.kind >= 1 ? 1 : 0, f0 = [190, 130, 78][sz] * (0.88 + (feelHash(mon.sprite) % 25) / 100);
    const o = audioCtx.createOscillator(), g = audioCtx.createGain(), lp = audioCtx.createBiquadFilter();
    o.type = "sawtooth"; lp.type = "lowpass"; lp.frequency.value = f0 * 4;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.62, t + 0.1);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05 + 0.06 * Math.min(1, s), t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + 0.14);
  } catch (e) {}
}

/* ---------- 데미지 숫자: 같은 등급은 늘 같은 모양(무기 효과가 있으면 그 색), 화면에 6개까지, 묶음은 ×n ---------- */
function feelDmgLook(crit) {
  if (crit) return "clean";
  const themed = { flame: "fire", ember: "fire", frost: "ice", cosmic: "neon", spark: "neon", gold: "gold", holy: "gold", laser: "neon", rgb: "neon" }[curFx()];
  return themed || "classic";
}
function feelCapFloats() {
  let n = 0; for (let i = floats.length - 1; i >= 0; i--) { const s = floats[i].style; if (s === "hit" || s === "crit" || s === "pet") { n++; if (n > 6) floats.splice(i, 1); } }
}
function feelMult(c, f, w, s) {
  if (!(f.mult > 1)) return;
  c.font = '18px "Do Hyeon", sans-serif'; c.textAlign = "left";
  outlined(c, "×" + f.mult, w / 2 + 6, -s * 0.28, "#bfe6ff", "#0e1321", null, 5);
  c.textAlign = "center";
}
/* 시험용: 지금 표와 상태 */
function feelDebug() {
  return { fd: FEEL_FD, recipe: FEEL_RECIPE, state: fHeroM.cur.id, mv: fHero.mv, f: fHero.f, pend: fHero.pend, buf: fHero.buf, frz: fHero.frz, vfrz: feelV.frz, trauma: +feelCam.trauma.toFixed(3), tick: feelClock.tick };
}
