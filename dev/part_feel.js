/* ===================== v35 손맛 다시 세우기 (기둥 8 · 게임 디자인 스킬 v1 기준) =====================
   장르: 주 action-combat, 보조 fighting(프레임 데이터). 코드: CP-01 고정 타임스텝 · CP-04 상태 기계 · CP-12 히트스톱·연출 레시피 · CP-13 프레임 데이터.
   수치마다 근거 ID를 붙임. (종합) = 스킬 기준 파일의 일반화, (튜닝) = 우리 화면·공속에 맞춘 시작값(근거 ID 없음, 플레이로 조정).
   흐름
     터치 입력 ─┐                         ┌→ 피해(입력 프레임, P-FEEL-10)
     공격 시계 ─┴→ [1/60초 고정 틱] 곽준영 상태 기계: 쉼 → 예비 → 판정 → 회복(포즈 홀드 → 제자리)
                    판정 프레임 = 접촉 → 피해 묶음 → 연출 레시피(히트스톱·피격 반응·흔들림·소리·숫자)
     렌더만: 몸 리그(어깨→팔꿈치→손이 무기를 쥠, 윗몸 기울기·무릎·발 내딛기) · 칼이 지나간 자리 궤적 · 트라우마 흔들림 · 땅 흔적
   v36: 몸 전체로 휘두르기 — 참고(중년기사 김봉식)처럼 칼을 든 꼿꼿한 예비 자세 → 한 번에 낮고 넓은 자세로 내려침(허리 숙임·앞발 내딛고 뒷발 뺌)
        → 친 자세를 다음 타격 직전까지 버팀(탄력 홀드 keep) · 큰 초승달 궤적이 시작 쪽부터 가늘게 사라짐 · 무기마다 이펙트 색
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
   예비동작은 큰 기술일수록 길게 (G-ACT-01): 올려 4 < 내려 5 < 돌진 6. 내려치기 2~3f (P-FEEL-18: 2f 펀치 > 5f 펀치).
   v36 참고 영상 계측(60fps): 예비 자세 ~5f → 한 번에 내려침 → 친 자세 ~16~22f 버팀(한 주기의 약 70%) → 일어서며 다시 예비.
     그래서 예비동작을 짧게 하고(v35 6~8f → 4~6f), 캔슬 뒤에도 다음 기술이 올 때까지 친 자세를 keep f까지 그대로 둠(탄력 홀드).
     공속이 느려 다음 타격이 멀면 keep 뒤 ret 동안 제자리로. 캔슬 창(cancel)은 그대로라 터치 버퍼(9f)는 v35와 같이 받음.
   터치 찌르기: 피해는 입력 프레임(P-FEEL-10), 칼끝은 1f 뒤 닿음(내려치기 1f). dir = 맞는 방향(불꽃·넉백·카메라 킥). */
var FEEL_MOVES = {
  // 전사 (영업 · 직무 없음): 몸으로 휘두르기 (v36)
  rise:  { startup: 6, strike: 2, active: 2, hold: 6, keep: 18, ret: 8, tier: "hit",      dir: [0.75, -0.65], kit: "melee", smear: 1 },
  chop:  { startup: 7, strike: 2, active: 2, hold: 6, keep: 18, ret: 8, tier: "hit",      dir: [0.55, 0.85],  kit: "melee", smear: 1 },
  lunge: { startup: 9, strike: 3, active: 3, hold: 7, keep: 18, ret: 9, tier: "finisher", dir: [1, 0],        kit: "melee", smear: 1 },
  jab:   { startup: 1, strike: 1, active: 2, hold: 3, keep: 12, ret: 7, tier: "tap",      dir: [1, 0],        kit: "melee", smear: 1, tap: 1 },
  // v37 거너 (기획): 겨눔 3f → 발사 1f(총구 섬광) → 반동 → 다시 겨눔(D)을 다음 발까지. 마무리 3연발 (G-SHT-02 사격 한 발 레이어)
  g_shot:  { startup: 4, strike: 1, smin: 1, active: 1, hold: 5, keep: 30, ret: 8, tier: "hit",      dir: [1, 0], kit: "gun", shot: 1 },
  g_shot2: { startup: 4, strike: 1, smin: 1, active: 1, hold: 5, keep: 30, ret: 8, tier: "hit",      dir: [1, 0], kit: "gun", shot: 1 },
  g_burst: { startup: 6, strike: 1, smin: 1, active: 3, hold: 6, keep: 30, ret: 8, tier: "finisher", dir: [1, 0], kit: "gun", shot: 3 },
  g_tap:   { startup: 1, strike: 1, active: 1, hold: 3, keep: 12, ret: 7, tier: "tap",      dir: [1, 0], kit: "gun", shot: 1, tap: 1 },
  // v37 마법사 (개발): 무기를 지팡이처럼 들어 끝에 코드 마법진 → 앞으로 뻗어 탄. 마무리는 번개 부르기
  m_cast:  { startup: 7, strike: 2, active: 2, hold: 6, keep: 24, ret: 8, tier: "hit",      dir: [1, 0],      kit: "magic", circle: 1 },
  m_cast2: { startup: 7, strike: 2, active: 2, hold: 6, keep: 24, ret: 8, tier: "hit",      dir: [1, 0],      kit: "magic", circle: 1 },
  m_storm: { startup: 9, strike: 2, active: 3, hold: 7, keep: 18, ret: 9, tier: "finisher", dir: [0.3, 0.95], kit: "magic", circle: 2 },
  m_tap:   { startup: 1, strike: 1, active: 2, hold: 3, keep: 12, ret: 7, tier: "tap",      dir: [1, 0],      kit: "magic", tap: 1 },
  // v37 소환사 (인사·총무): 무기는 등에, 앞무릎 들고 와인드업 → 숙이며 도장 투척. 마무리는 손 들어 결재판 소환
  s_toss:  { startup: 6, strike: 2, active: 2, hold: 6, keep: 18, ret: 8, tier: "hit",      dir: [0.8, 0.6], kit: "summon", stamp: 1 },
  s_toss2: { startup: 6, strike: 2, active: 2, hold: 6, keep: 18, ret: 8, tier: "hit",      dir: [0.8, 0.6], kit: "summon", stamp: 1 },
  s_call:  { startup: 8, strike: 2, active: 3, hold: 7, keep: 18, ret: 9, tier: "finisher", dir: [0, 1],     kit: "summon" },
  s_tap:   { startup: 1, strike: 1, active: 2, hold: 3, keep: 12, ret: 7, tier: "tap",      dir: [0.8, 0.6], kit: "summon", stamp: 1, tap: 1 },
  // v37 저격수 (감사): 무릎 꿇고 조준선(예고) → 한 방 · 큰 반동 → 다시 조준. 마무리는 더 길게 겨눠 관통 · 다음 발까지 무릎 꿇은 채 버팀(keep 44)
  n_aim:    { startup: 9,  strike: 1, smin: 1, active: 1, hold: 7, keep: 44, ret: 10, tier: "finisher", dir: [1, 0], kit: "snipe", shot: 1, sight: 1 },
  n_aim2:   { startup: 9,  strike: 1, smin: 1, active: 1, hold: 7, keep: 44, ret: 10, tier: "finisher", dir: [1, 0], kit: "snipe", shot: 1, sight: 1 },
  n_pierce: { startup: 11, strike: 1, smin: 1, active: 2, hold: 8, keep: 44, ret: 10, tier: "finisher", dir: [1, 0], kit: "snipe", shot: 1, sight: 2 },
  n_tap:    { startup: 1,  strike: 1, active: 1, hold: 4, keep: 12, ret: 7, tier: "tap",      dir: [1, 0], kit: "snipe", shot: 1, tap: 1 },
};
var FEEL_CHAIN = ["rise", "chop", "lunge"];        // 전사 3연타 (예전 이름, 이제는 FEEL_KITS가 정함)
/* v37 직무별 대표 동작: 대표 직무(S.job)가 몸 동작 한 벌을 정하고, 나머지 가진 직무는 겸직 속성으로 얹음(part_job37) */
/* stand: 서는 자리 [곽준영 x, 몬스터 x] 옮김(px). 검사(전사)만 몬스터에 붙고 원거리 직무는 떨어져서 쏨 (사용자: "검사만 몬스터랑 붙어있어야 한다") */
var FEEL_KITS = {
  melee:  { n: "전사",   chain: ["rise", "chop", "lunge"],        tap: "jab",   grip: "hand",  range: false, stand: [0, 0] },
  gun:    { n: "거너",   chain: ["g_shot", "g_shot2", "g_burst"], tap: "g_tap", grip: "gun",   range: true,  stand: [-56, 34] },
  magic:  { n: "마법사", chain: ["m_cast", "m_cast2", "m_storm"], tap: "m_tap", grip: "staff", range: true,  stand: [-62, 36] },
  summon: { n: "소환사", chain: ["s_toss", "s_toss2", "s_call"],  tap: "s_tap", grip: "back",  range: true,  stand: [-50, 34] },
  snipe:  { n: "저격수", chain: ["n_aim", "n_aim2", "n_pierce"],  tap: "n_tap", grip: "gun",   range: true,  stand: [-66, 40] },
};
var FEEL_KIT_OF = { sales: "melee", plan: "gun", dev: "magic", hr: "summon", audit: "snipe" };
function feelMainKitId() { const j = typeof curJob === "function" && typeof S !== "undefined" && S ? curJob() : null; return (j && FEEL_KIT_OF[j.id]) || "melee"; }
function feelKitId() { const pv = typeof jobPreviewId === "function" ? jobPreviewId() : ""; return (pv && FEEL_KIT_OF[pv]) || feelMainKitId(); }   // v38: '동작 미리 보기' 동안은 그 직무 동작
function feelKit() { return FEEL_KITS[feelKitId()]; }
/* v37 서는 자리: 대표 직무가 바뀌면 곽준영은 뒤로·몬스터는 앞으로 미끄러지듯(≈0.3초) 옮김. HERO_X·MON_X(let)를 매 프레임 여기서 정함 */
var feelStand = { h: 0, m: 0, on: false };
function feelStandStep(dt) {
  const st = feelKit().stand || [0, 0];
  if (!feelStand.on || reduceMotion) { feelStand.h = st[0]; feelStand.m = st[1]; feelStand.on = true; }
  else {
    const k = 1 - Math.exp(-Math.max(0, dt) / 90);
    feelStand.h += (st[0] - feelStand.h) * k; feelStand.m += (st[1] - feelStand.m) * k;
    if (Math.abs(st[0] - feelStand.h) < 0.25) feelStand.h = st[0];
    if (Math.abs(st[1] - feelStand.m) < 0.25) feelStand.m = st[1];
  }
  HERO_X = HERO_X0 + feelStand.h; MON_X = MON_X0 + feelStand.m;
}
/* 공속 단계: 공격 간격(ms)이 짧으면 같은 기술을 짧게 — 정수로 반올림, 최소 프레임 보장 (튜닝). 터치는 늘 같은 길이 */
var FEEL_SPEED = [[400, 1], [250, 0.85], [0, 0.7]];
var FEEL_FD = (function () {
  const out = {};
  for (const id in FEEL_MOVES) {
    const M = FEEL_MOVES[id];
    out[id] = FEEL_SPEED.map(([, k]) => {
      if (M.tap) k = 1;
      const r = (v, lo) => Math.max(lo, Math.round(v * k));
      const strike = M.tap ? M.strike : r(M.strike, M.smin || 2), wind = M.tap ? 0 : r(M.startup - M.strike, 2);
      const fd = { startup: wind + strike, strike, active: r(M.active, 1), hold: r(M.hold, 2), keep: r(M.keep, 0), ret: r(M.ret, 3) };
      fd.cancel = fd.startup + fd.active + fd.hold; fd.keepEnd = fd.cancel + fd.keep; fd.total = fd.keepEnd + fd.ret;
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
   팔·무기: sh 위팔 · fa 아래팔 · wa 무기 각도 (0 = 위, 시계 방향 +, 1.57 = 앞) · dx 몸 전체 앞으로(px) · lift 뜀(px, − 가 위)
   몸(v36, 칸 단위 — 그릴 때 반올림): bx 골반 앞 · hip 골반 내림 · lean 어깨가 골반보다 앞(숙임) · tq 몸통 한 줄 접기 · hx 머리 더 앞 · hy 머리 내림
     fF 앞발 · fB 뒷발(− = 뒤로 뺌) · kF·kB 무릎을 다리와 직각으로 내미는 칸
   A = 예비동작 끝(칼을 든 꼿꼿한 자세) · B = 맞는 순간(낮고 넓게) · C = 끝까지 휘두른 자세(포즈 홀드, 다음 기술까지 버팀)
   참고 영상의 친 자세: 키 ~15% 낮아짐 · 윗몸 앞으로 · 앞무릎 굽힘 · 뒷다리 뒤로 쭉 · 칼끝은 몬스터 발치 앞 바닥 쪽 (G-ACT-01 포즈 홀드, U-FEEL-12 실루엣)
   tq 는 0~3 (몸통 접는 줄 수) */
var RIG_L1 = 2.8, RIG_L2 = 2.3, FEEL_BLADE = 15.5 * 5;
var RIG_BODY_KEYS = ["bx", "hip", "lean", "tq", "hx", "hy", "fF", "fB", "kF", "kB", "hl"];
var FEEL_IDLE = { sh: 2.6, fa: 1.75, wa: 0.55, dx: 0, lift: 0, bx: 0, hip: 0, lean: 0, tq: 0, hx: 0, hy: 0, fF: 0, fB: 0, kF: 0, kB: 0, hl: 0 };
var FEEL_KEYS = (function () {
  const P = o => Object.assign({}, FEEL_IDLE, o);
  // 친 자세 (v36, 사용자 피드백 반영: "더 숙이고 뒷발은 더 빼되 다리를 찢지 말고, 뒤꿈치를 들어 역동적으로")
  //   윗몸: 어깨가 골반보다 5칸 앞 · 몸통 2줄 접음 · 머리 1칸 내리고 2칸 더 앞 → 키가 3칸(12%) 낮아지고 크게 숙임
  //   다리: 골반은 그대로(다리 길이 유지) · 앞발 4칸 내딛고 무릎 굽힘 · 뒷발 3칸 뒤로 빼고 뒤꿈치를 들어 발끝으로 밂
  const LOW = { bx: 1, hip: 0, lean: 5, tq: 2, hx: 2, hy: 1, fF: 4, fB: -3, kF: 1, kB: 0, hl: 1 };
  // 예비 자세: 몸을 뒤로 젖히지 않고(예전엔 젖히며 칼이 몸 뒤로 숨음) 꼿꼿이 서서 무기를 머리 위로 높이 — 무기가 늘 몸 앞에 보이게
  const UP = { bx: 0, hip: 0, lean: 1, tq: 0, hx: 0, hy: 0, fF: 2, fB: -2, kF: 0, kB: 0, hl: 0 };
  // v37 직무별 기본 자세 조각
  const AIM = { bx: 0, hip: 0, lean: 1, tq: 0, hx: 1, hy: 0, fF: 3, fB: -3, kF: 1, kB: 0, hl: 0, sh: 1.57, fa: 1.57, wa: 1.57 };   // 거너 겨눔: 팔·무기가 어깨 높이로 수평
  const AIM2 = Object.assign({}, AIM, { sh: 1.66, fa: 1.66, wa: 1.66 });
  const KICK = { bx: -1, lean: -1, hx: -1, sh: 1.32, fa: 1.18, wa: 1.25 };                                                        // 반동: 몸이 뒤로, 총구가 위로
  const STAFF = { bx: -1, hip: 0, lean: -1, tq: 0, hx: -1, hy: 0, fF: 2, fB: -2, sh: 0.6, fa: 0.2, wa: 0.1, dx: -2 };             // 마법사 모으기: 무기를 지팡이처럼 위로
  const CAST = { bx: 1, hip: 0, lean: 3, tq: 1, hx: 1, hy: 0, fF: 4, fB: -3, kF: 1, hl: 1, sh: 1.45, fa: 1.5, wa: 1.4, dx: 6 };   // 시전: 숙이며 앞으로 뻗음
  const WIND = { bx: -1, hip: 0, lean: -2, tq: 0, hx: -1, hy: 0, fF: 2, fB: -1, kF: 2, sh: -1.2, fa: -1.9, dx: -4 };             // 소환사 와인드업: 팔을 뒤로, 앞무릎 들기
  const THROW = { bx: 1, hip: 0, lean: 4, tq: 1, hx: 2, hy: 1, fF: 4, fB: -3, kF: 1, hl: 1, sh: 1.6, fa: 1.75, dx: 8 };          // 던지기: 크게 숙이며 놓음
  const KNEEL = { bx: 0, hip: 2, lean: 2, tq: 1, hx: 1, hy: 1, fF: 3, fB: -4, kF: 0, kB: 1, hl: 2, sh: 1.57, fa: 1.57, wa: 1.57, dx: -4 };   // 저격수: 한쪽 무릎 꿇고 조준
  const BIGKICK = { bx: -2, lean: 0, hx: 0, sh: 1.25, fa: 1.1, wa: 1.18 };
  return {
    rise:  { A: P({ sh: 2.4, fa: 2.6, wa: 2.0, dx: -3, bx: 1, hip: 1, lean: 3, tq: 2, hx: 1, hy: 1, fF: 3, fB: -3, kF: 1 }),     // 낮게 웅크려 칼끝을 앞 바닥에
             B: P(Object.assign({}, LOW, { sh: 1.0, fa: 0.5, wa: 0.9, dx: 14, lean: 4, tq: 1, hy: 0 })),                         // 숙인 채 앞에서 위로 올려벰
             C: P(Object.assign({}, LOW, { sh: 0.7, fa: 0.3, wa: 0.45, dx: 14, lean: 4, tq: 1, hy: 0 })) },
    chop:  { A: P(Object.assign({}, UP, { sh: -0.35, fa: -0.1, wa: 0.05, dx: -2, lift: -2 })),                                  // 무기를 머리 위로 곧게
             B: P(Object.assign({}, LOW, { sh: 1.75, fa: 1.95, wa: 1.7, dx: 16, lean: 6 })),                                    // 맞는 순간 한 칸 더 숙였다가
             C: P(Object.assign({}, LOW, { sh: 1.75, fa: 1.95, wa: 1.9, dx: 18 })) },                                           // 버팀 (칼끝은 몬스터 발치 바닥)
    lunge: { A: P({ sh: 3.6, fa: 1.6, wa: 1.5, dx: -4, bx: 0, hip: 1, lean: 2, tq: 1, fF: 2, fB: -3, kF: 1 }),                 // 웅크려 팔을 당겨 장전 (무기는 앞을 겨눔)
             B: P(Object.assign({}, LOW, { sh: 1.55, fa: 1.55, wa: 1.55, dx: 28, bx: 2, lean: 6, fF: 5, fB: -4, hl: 2 })),
             C: P(Object.assign({}, LOW, { sh: 1.6, fa: 1.6, wa: 1.6, dx: 30, bx: 2, lean: 6, fF: 5, fB: -4, hl: 2 })) },
    jab:   { A: P({ sh: 3.6, fa: 1.6, wa: 1.5, dx: -2, lean: 1, fF: 1, fB: -1 }),
             B: P(Object.assign({}, LOW, { sh: 1.55, fa: 1.55, wa: 1.55, dx: 18, lean: 4, tq: 1 })),
             C: P(Object.assign({}, LOW, { sh: 1.6, fa: 1.6, wa: 1.6, dx: 20, lean: 4, tq: 1 })) },
    // ---- v37 거너 (기획): 팔을 어깨 높이로 곧게 뻗어 무기를 총처럼 겨눔 → 쏘면 반동으로 몸·총구가 튐 → 다시 겨눔(D) ----
    g_shot:  { A: P(Object.assign({}, AIM, { dx: 0 })), B: P(Object.assign({}, AIM, { dx: 1 })), C: P(Object.assign({}, AIM, KICK, { dx: -5 })), D: P(Object.assign({}, AIM, { dx: 0 })) },
    g_shot2: { A: P(Object.assign({}, AIM2, { dx: 0 })), B: P(Object.assign({}, AIM2, { dx: 1 })), C: P(Object.assign({}, AIM2, KICK, { sh: 1.4, fa: 1.3, wa: 1.38, dx: -5 })), D: P(Object.assign({}, AIM2, { dx: 0 })) },
    g_burst: { A: P(Object.assign({}, AIM, { hip: 1, lean: 2, tq: 1, dx: -2 })), B: P(Object.assign({}, AIM, { hip: 1, lean: 2, tq: 1, dx: -1 })),
               C: P(Object.assign({}, AIM, KICK, { hip: 1, tq: 1, sh: 1.2, fa: 1.05, wa: 1.12, dx: -10 })), D: P(Object.assign({}, AIM, { hip: 1, lean: 2, tq: 1, dx: -3 })) },
    g_tap:   { A: P(AIM), B: P(AIM), C: P(Object.assign({}, AIM, KICK, { lean: 0, hx: 0, sh: 1.42, fa: 1.32, wa: 1.38, dx: -3 })), D: P(AIM) },
    // ---- v37 마법사 (개발): 지팡이처럼 들어 올려 끝에 코드 마법진 → 숙이며 앞으로 뻗어 탄 · 마무리는 머리 위로 번개 부르기 ----
    m_cast:  { A: P(STAFF), B: P(CAST), C: P(Object.assign({}, CAST, { wa: 1.48, dx: 7 })) },
    m_cast2: { A: P(Object.assign({}, STAFF, { sh: 0.3, fa: -0.1, wa: -0.15 })), B: P(Object.assign({}, CAST, { sh: 1.3, fa: 1.35, wa: 1.3 })), C: P(Object.assign({}, CAST, { sh: 1.32, fa: 1.4, wa: 1.36, dx: 7 })) },
    m_storm: { A: P({ bx: 0, lean: 0, fF: 2, fB: -2, sh: 0.1, fa: 0.0, wa: 0.0, lift: -3, dx: -2 }),
               B: P({ bx: 0, lean: -2, hx: -1, fF: 3, fB: -3, hl: 1, sh: 0.05, fa: -0.05, wa: -0.05, lift: -5, dx: -2 }),
               C: P({ bx: 0, lean: -1, hx: -1, fF: 3, fB: -3, hl: 1, sh: 0.08, fa: -0.02, wa: 0.0, lift: -2, dx: -2 }) },
    m_tap:   { A: P(CAST), B: P(CAST), C: P(Object.assign({}, CAST, { wa: 1.46 })) },
    // ---- v37 소환사 (인사·총무): 무기는 등에 메고, 앞무릎 들며 팔을 뒤로 → 크게 숙이며 도장 투척 · 마무리는 손 들어 결재판 ----
    s_toss:  { A: P(WIND), B: P(THROW), C: P(Object.assign({}, THROW, { sh: 1.95, fa: 2.15, dx: 9 })) },
    s_toss2: { A: P(Object.assign({}, WIND, { sh: 3.8, fa: 3.2, lean: -1 })), B: P(Object.assign({}, THROW, { sh: 1.35, fa: 1.25 })), C: P(Object.assign({}, THROW, { sh: 1.6, fa: 1.7, dx: 9 })) },
    s_call:  { A: P({ bx: 0, lean: 0, fF: 2, fB: -2, sh: 0.0, fa: -0.2, lift: -2 }), B: P({ bx: 0, lean: -1, hx: -1, fF: 3, fB: -2, hl: 1, sh: -0.1, fa: -0.3, lift: -4 }),
               C: P({ bx: 0, lean: -1, hx: -1, fF: 3, fB: -2, hl: 1, sh: -0.05, fa: -0.25, lift: -2 }) },
    s_tap:   { A: P(Object.assign({}, THROW, { sh: 0.9, fa: 0.5, dx: 4 })), B: P(THROW), C: P(Object.assign({}, THROW, { sh: 1.8, fa: 2.0 })) },
    // ---- v37 저격수 (감사): 무릎 꿇고 조준 → 한 방에 크게 밀림 → 다시 조준(D) · 마무리는 더 숙여 길게 겨눔 ----
    n_aim:    { A: P(KNEEL), B: P(KNEEL), C: P(Object.assign({}, KNEEL, BIGKICK, { dx: -11 })), D: P(KNEEL) },
    n_aim2:   { A: P(Object.assign({}, KNEEL, { sh: 1.62, fa: 1.62, wa: 1.62 })), B: P(Object.assign({}, KNEEL, { sh: 1.62, fa: 1.62, wa: 1.62 })),
                C: P(Object.assign({}, KNEEL, BIGKICK, { dx: -11 })), D: P(Object.assign({}, KNEEL, { sh: 1.62, fa: 1.62, wa: 1.62 })) },
    n_pierce: { A: P(Object.assign({}, KNEEL, { lean: 3, hx: 2 })), B: P(Object.assign({}, KNEEL, { lean: 3, hx: 2 })), C: P(Object.assign({}, KNEEL, BIGKICK, { dx: -15, wa: 1.1 })), D: P(KNEEL) },
    n_tap:    { A: P(AIM), B: P(AIM), C: P(Object.assign({}, AIM, KICK, { dx: -4 })), D: P(AIM) },
  };
})();

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
  handle(h, b) { return b === "TAP" ? feelBegin(h, feelKit().tap) : null; },
  update(h) { return feelAutoNext(h); },
};
var FH_WIND = {                                   // 예비동작 + 내려치기 (판정 전)
  id: "windup",
  handle(h, b) { return b === "TAP" ? feelBegin(h, feelKit().tap) : null; },   // 터치가 우선 — 판정 전이라 바로 취소
  update(h) {
    const W = h.fd.startup - h.fd.strike;
    if (h.auto && h.f === W && !feelStrikeReady(h)) {                       // 예비동작 끝에서 칼을 든 채 기다림 (포즈 홀드)
      if (++h.held > FEEL_HOLD_MAX) return FH_IDLE;
      return null;
    }
    if (h.f === W && h.auto && FEEL_MOVES[h.mv].smear) { sfx("swing"); feelStepDust(h.mv); }   // 휘두르는 소리는 내려치기 시작에 · 뒷발이 땅을 밀어내는 먼지 (원거리는 쏠 때 소리)
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
  handle(h, b) { if (b !== "TAP") return null; if (h.f >= h.fd.cancel) return feelBegin(h, feelKit().tap); h.buf = FEEL_BUF; return null; },
  update(h) {
    h.f++;
    if (h.f >= h.fd.cancel) {
      if (h.buf > 0) { h.buf = 0; return feelBegin(h, feelKit().tap); }   // 버퍼 소비 (P-FEEL-03)
      const nx = feelAutoNext(h); if (nx) return nx;
    }
    return h.f >= h.fd.total ? FH_IDLE : null;
  },
};
var fHeroM = new FeelMachine(fHero, FH_IDLE);

/* 기술 시작: 지금 자세에서 이어서 */
function feelBegin(h, mv) {
  h.p0 = feelPoseRaw();
  const K = FEEL_KEYS[mv], T = K && (FEEL_MOVES[mv].tap ? K.B : K.A);
  if (T) ["sh", "fa", "wa"].forEach(k => { const d = h.p0[k] - T[k]; h.p0[k] -= Math.round(d / (2 * Math.PI)) * 2 * Math.PI; });   // 각도는 가까운 쪽으로 (한 바퀴 돌지 않게)
  h.mv = mv; h.fd = feelFD(mv, feelSt || stats()); h.f = 0; h.held = 0; h.auto = !FEEL_MOVES[mv].tap;
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
  const st = feelSt || stats(), ch = feelKit().chain, mv = ch[h.chain % ch.length], fd = feelFD(mv, st);
  if ((h.pend > 0 && feelLive()) || feelDueIn(st) <= fd.startup * FEEL_DT) return feelBegin(h, mv);
  return null;
}
/* 내려치기를 시작해도 되나: 몬스터가 칼끝 닿는 곳에 있고, 타격이 쌓였거나 내려치는 동안 돌아옴 */
function feelStrikeReady(h) {
  if (!feelLive() || !feelInReach(h.mv)) return false;
  return h.pend > 0 || (feelSt || stats()).interval - atkTimer <= h.fd.strike * FEEL_DT;
}
/* 내려치는 순간 뒷발을 뒤로 빼며 땅을 밀어냄 → 뒷발 자리에 작은 먼지 (v36) */
function feelStepDust(mv) {
  if (feelBodyK() <= 0) return;
  const B = (FEEL_KEYS[mv] || FEEL_KEYS.chop).B;
  addDust(HERO_X + B.dx + (RIG_LEG.B.c + 0.5 + B.fB) * 3.5, GROUND - 3, mv === "lunge" ? 3 : 2, -1, false);
}
/* 판정 프레임: 쌓인 자동 타격을 한 번에 (숫자는 합계 하나 + ×n) */
function feelContact(h) {
  if (!h.auto || !feelLive()) return;                                      // 터치는 입력 프레임에 이미 처리
  const st = feelSt || stats();
  let n = h.pend; h.pend = 0;
  if (n <= 0) { n = 1; atkTimer -= st.interval; }                          // 내려치는 1~3f만큼 미리 — 그만큼 다음 타격이 늦게 옴(초당 타격 수 그대로)
  feelStrikes(st, n, h.mv);
  feelRelease(h);
  if (typeof jobSubProc === "function" && feelKit().chain[2] === h.mv) jobSubProc(st);   // v37 3연타 마무리: 겸직 속성 발동
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
  feelB = { mv: feelKit().tap, n: 0, dmg: 0, crit: false, kill: false, boss: false, clone: 0, max: mon ? mon.max : 1, x: null, y: null };
  let k = 0;
  for (; k < n && feelLive(); k++) heroStrike(st);
  feelCarry(n - k);
  if (feelLive()) hit(st.tap * (crit ? st.critMul : 1), crit, "tap", ix, iy);
  const b = feelB; feelB = null;
  if (b.n || b.clone) feelImpact(b);
  if (fHero.mv && FEEL_MOVES[fHero.mv].tap) feelRelease(fHero);
  if (typeof jobTapFx === "function") jobTapFx(ix, iy);                       // v37 원거리 직무 터치: 총구·지팡이에서 탄이 날아가 보이게
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
  else if (feelBodyK() > 0) { if (V.kbF > 0) { V.kbx += 3; V.kbF--; } else if (V.kbx > 0) V.kbx = Math.max(0, V.kbx - 1.5); }   // 넉백 3 px/f (P-FEEL-17), 돌아오기 1.5 px/f (튜닝)
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
  if (feelBodyK() > 0) {                                                     // v38: 맞고 밀리기·찌그러짐은 몸 동작 설정을 따름 (휴대폰 동작 줄이기와 따로)
    V.kbF = Math.max(V.kbF, R.kb);
    mon.squash = Math.max(mon.squash, b.mv === "chop" ? (big ? 1.2 : 0.85) : b.mv === "lunge" ? 0.75 : 0.5);
    mon.tilt = Math.max(mon.tilt, b.mv === "rise" ? (big ? 1 : 0.7) : 0.3);
  }
  const [ix, iy] = b.x != null ? [b.x, b.y] : feelHitPoint(b.mv);
  {                                                                         // 불꽃·먼지는 늘 (화면이 흔들리는 게 아니라서)
    const FP = feelFxPal(performance.now());                                // v36: 불꽃도 무기 이펙트 색
    for (let i = 0; i < R.sparks; i++) { const sp = 3 + Math.random() * (big ? 10 : 7); sparks.push({ x: ix, y: iy, vx: dir[0] * sp + (Math.random() - .5) * 3, vy: dir[1] * sp + (Math.random() - .5) * 3 - 1, life: 1, c: i % 3 ? FP[2] : i % 2 ? FP[1] : "#ffffff", line: true }); }
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
    { const col = monColor(); for (let i = 0; i < 5; i++) debris.push({ x: ix + (Math.random() - .5) * 20, y: iy, vx: dir[0] * (2 + Math.random() * 5), vy: -3 - Math.random() * 5, life: 1, c: col, s: 4 + Math.random() * 4 }); }
    const stl = slashStyle(); if (fancy && (stl === "holy" || stl === "gold")) addSkyStrike(MON_X, true);
    sfx("crit");
  }
  hitSound(R.snd * (b.kill ? 1.2 : 1)); feelMonVoice(R.snd);
  const { h: mh } = monSize();
  addFloat(ix + 4, iy - mh * 0.25 - 8, fmt(b.dmg), b.crit ? "#ff5d5d" : "#ffffff", big ? 32 : b.crit ? 28 : 26, true, big ? "crit" : "hit");
  if (b.crit && !big) { const fl = floats[floats.length - 1]; if (fl) { fl.look = "critlite"; } }
  const f = floats[floats.length - 1]; if (f && b.n > 1) f.mult = b.n;
  if (b.clone > 0) addFloat(ix - 26, iy - mh * 0.25 - 30, fmt(b.clone), "#c9a6ff", 17, false, "pet");
  if (typeof jobAttrFx === "function") jobAttrFx(ix, iy);                    // v37 겸직 속성 색 불꽃
  feelCapFloats();
}
/* 처치 (kill() 안): 예전 전역 멈춤 95/170 ms·흔들림 10/18 대신 */
function feelKill(boss) {
  const K = boss ? FEEL_RECIPE.bossKill : FEEL_RECIPE.kill;
  feelFreeze(K.f, true, K.vs);
  feelTrauma(K.trauma, boss ? 1 : FEEL_SHAKE.killCap); feelKick([1, -0.2], K.kick);
  feelMark(MON_X - 6, boss ? 76 : 46, "kill");
  if (boss) triggerImpactFrame(MON_X - 10, GROUND - monSize().h * 0.5);
  { const { w: mw, h: mh } = monSize(), col = monColor(); for (let i = 0; i < (boss ? 10 : 6); i++) debris.push({ x: MON_X + (Math.random() - .5) * mw * 0.5, y: GROUND - mh * (0.3 + Math.random() * 0.5), vx: 2 + Math.random() * 6, vy: -4 - Math.random() * 6, life: 1, c: col, s: 4 + Math.random() * 5 }); }
}
/* 맞는 자리 = 맞는 순간 칼끝 (이펙트 = 판정, AP-FEEL-11), 몬스터 몸 안으로 맞춤 */
function feelBox() {
  const { w: mw, h: mh } = monSize(), eo = typeof enterOffset === "function" ? enterOffset() : { dx: 0, dy: 0 }, cx = MON_X + monOX() + mon.kb * 26 + feelV.kbx + eo.dx;
  return { x0: cx - mw / 2, x1: cx + mw / 2, y0: GROUND + eo.dy - mh, y1: GROUND + eo.dy };
}
function feelTip(P) {
  const look = heroLook(), R = rigBody(look, rigQ(P)), arm = rigArm(R, P), hs = 3.5;
  const x0 = HERO_X + P.dx - R.P * hs, y0 = GROUND - 24 * hs + P.lift - R.top * hs, gx = x0 + arm.hx * hs, gy = y0 + arm.hy * hs;
  return [gx + Math.sin(P.wa) * FEEL_BLADE, gy - Math.cos(P.wa) * FEEL_BLADE];
}
function feelHitPoint(mv) {
  const M = FEEL_MOVES[mv];
  if (M && M.kit && M.kit !== "melee" && mon) { const B = feelBox(); return [B.x0 + (B.x1 - B.x0) * 0.32, B.y0 + (B.y1 - B.y0) * 0.5]; }   // 원거리: 몸 가운데
  const K = FEEL_KEYS[mv] || FEEL_KEYS.jab, B = feelBox(), [tx, ty] = feelTip(K.B);
  return [Math.max(B.x0 + 8, Math.min((B.x0 + B.x1) / 2, tx)), Math.max(B.y0 + 10, Math.min(B.y1 - 10, ty))];
}
/* 칼끝이 몬스터에 닿나 (걸어 들어오는 중이면 기다림) */
function feelInReach(mv) {
  if (!mon) return false;
  if (FEEL_MOVES[mv] && FEEL_MOVES[mv].kit !== "melee") return true;          // 원거리 직무는 걸어 들어오는 중에도 쏨
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
/* v38 곽준영 몸 동작 크기: 설정 › 화면 '곽준영 몸 동작' (1 기본 · 0.5 약하게 · 0 끄기 = 팔·무기만).
   휴대폰 '동작 줄이기'는 화면 흔들림·카메라만 줄이고 몸 동작은 안 건드림 (사용자 아이폰에서 몸이 안 움직이던 원인) */
function feelBodyK() { const f = typeof fxSet === "function" && typeof S !== "undefined" && S ? fxSet() : null, v = f ? +f.body : 1; return f && f.body != null && v >= 0 && v <= 1 ? v : 1; }
function feelIdle() {
  const o = Object.assign({}, FEEL_IDLE);
  if (feelBodyK() > 0) { const now = performance.now(); o.hip = Math.floor(now / 620) % 2; o.wa = FEEL_IDLE.wa + Math.sin(now / 700) * 0.05; }   // 숨쉬기: 골반 1칸(무릎은 곧게)
  return o;
}
/* 프레임 fr(소수 = 틱 사이 보간, CP-01 alpha)의 자세 */
function feelPoseAt(mv, fd, p0, fr) {
  const K = FEEL_KEYS[mv], W = fd.startup - fd.strike, S = fd.startup, A = S + fd.active, E = fd.keepEnd != null ? fd.keepEnd : fd.cancel;
  if (fr < W) return feelLerp(p0, K.A, feelEaseOut(fr / W));                                  // 예비동작: 빠르게 들고 멈추듯 (안티시페이션)
  if (fr < S) return feelLerp(W > 0 ? K.A : p0, K.B, feelEaseIn((fr - W) / fd.strike));        // 내려치기: 점점 빠르게
  if (fr < A) return feelLerp(K.B, K.C, feelEaseOut((fr - S) / fd.active));                     // 맞는 구간: 끝까지 밀어붙임 (총은 반동)
  const H = K.D || K.C;                                                                         // D: 반동 뒤 다시 겨누는 자세 (거너·저격수)
  if (fr < fd.cancel) return K.D ? feelLerp(K.C, K.D, feelEaseIO((fr - A) / Math.max(1, fd.hold))) : Object.assign({}, K.C);
  if (fr < E) return Object.assign({}, H);                                                      // 포즈 홀드 (캔슬 뒤 keep까지 — 다음 기술이 오면 여기서 바로 이어짐)
  if (fr < fd.total) return feelLerp(H, feelIdle(), feelEaseIO((fr - E) / fd.ret));             // 다음 타격이 멀면 제자리로
  return feelIdle();
}
function feelFrame() { const h = fHero; return h.f + (h.frz > 0 || fHeroM.cur === FH_WIND && h.held > 0 ? 0 : Math.min(0.999, feelClock.alpha)); }
function feelPoseRaw() { const h = fHero; return h.mv && h.fd ? feelPoseAt(h.mv, h.fd, h.p0 || FEEL_IDLE, feelFrame()) : feelIdle(); }
function feelPoseNow() {
  const P = feelPoseRaw();
  const bk = feelBodyK();
  if (bk < 1) { P.dx *= bk; P.lift *= bk; RIG_BODY_KEYS.forEach(k => { P[k] *= bk; }); }      // 설정 '곽준영 몸 동작': 약하게 = 반만 · 끄기 = 팔·무기만
  P.dx += feelShakeOff(fHero.frz, fHero.frzMax, fHero.vs);                                     // 공격자는 완전히 멈추지 않음 (P-FEEL-15 ⑦, 동작 줄이기면 0)
  P.ang = P.wa;
  return P;
}
function feelPivot() { return fHero.sh.x ? { x: fHero.sh.x, y: fHero.sh.y } : { x: HERO_X + 10 + 15.5 * 3.5, y: GROUND - 84 + 1 + 16 * 3.5 }; }

/* ---------- v36 몸 리그: 머리 · 몸통 · 허리 · 두 다리를 도트 칸 단위로 다시 짜 맞춤 ----------
   기본 그림 18×24 칸: 머리 0~11줄 · 몸통 12~18 · 허리띠 19 · 다리 20~22 · 신발 23 / 뒷다리 5~7칸 · 앞다리 10~12칸.
   회전 대신 줄 밀기(시어)와 통째 옮기기만 써서 도트가 깨지지 않게 함 (얼굴·안경 줄은 그대로).
   q = 정수 자세(칸)
     bx 골반을 앞으로 · hip 골반 내림(무릎이 굽음) · lean 어깨가 골반보다 앞(몸통 줄마다 비례로 밀어 숙임) · tq 몸통 접기 0~3줄(더 숙임: 15 → 14 → 16줄 순서로 뺌)
     hx 머리를 어깨보다 더 앞 · hy 머리 내림(목 움츠림) · fF 앞발 · fB 뒷발(− = 뒤로 뺌) · kF·kB 무릎을 다리와 직각으로 내미는 칸(+ = 앞·아래, − = 뒤·위, 0 = 곧은 다리)
     hl 뒷발 뒤꿈치 들기 0~2줄 (발끝으로 땅을 밀어냄 — 다리를 찢지 않고도 역동적으로)
   장비: 몸통·머리에 붙은 것은 같이 움직이고, 발밑 왼쪽(19~23줄 0~3칸, 가방·도장 같은 소품)은 땅에 그대로 둠 */
var RIG_PADX = 9;                                              // 좌우 여백 칸 — 뒷발을 뒤로 빼고 머리를 앞으로 내밀 자리
var RIG_LEG = { B: { c: 6, s0: 4, s1: 8 }, F: { c: 11, s0: 9, s1: 15 } };   // 다리 가운데 칸 · 신발 줄 범위
var RIG_LEGLEN = 3;                                            // 다리 길이(칸, 20~22줄)
var RIG_HAIR = { h: 1, e: 1 };
var rigBodyCache;
function rigQ(P) {
  return { bx: Math.round(P.bx || 0), hip: Math.max(0, Math.round(P.hip || 0)), lean: Math.round(P.lean || 0), tq: Math.max(0, Math.min(3, Math.round(P.tq || 0))),
    hx: Math.round(P.hx || 0), hy: P.hy > 0.5 ? 1 : 0, fF: Math.round(P.fF || 0), fB: Math.round(P.fB || 0), kF: Math.round(P.kF || 0), kB: Math.round(P.kB || 0), hl: Math.max(0, Math.min(2, Math.round(P.hl || 0))) };
}
function rigBody(look, q) {
  rigBodyCache = rigBodyCache || new WeakMap();
  let byKey = rigBodyCache.get(look.map); if (!byKey) { byKey = new Map(); rigBodyCache.set(look.map, byKey); }
  const key = q.bx + "|" + q.hip + "|" + q.lean + "|" + q.tq + "|" + q.hx + "|" + q.hy + "|" + q.fF + "|" + q.fB + "|" + q.kF + "|" + q.kB + "|" + q.hl;
  const hit = byKey.get(key); if (hit) return hit;
  const top = look.top || 0, src = look.map, P = RIG_PADX, W = 18 + 2 * P, H = top + 24;
  const at = (r, c) => { const row = src[top + r]; return row && c >= 0 && c < row.length ? row[c] : "."; };
  // 앞팔은 따로 그림(rigArm) → 14줄 14칸, 15줄 13~16칸(13칸은 몸통 색으로 메움), 16줄 14~16칸을 지움
  const sleeve = at(15, 14) !== "." ? at(15, 14) : "a", cuff = at(16, 14) !== "." ? at(16, 14) : sleeve, skin = at(15, 15) !== "." ? at(15, 15) : "s";
  const fill13 = at(15, 12) !== "." ? at(15, 12) : "j";
  const S = (r, c) => {
    if (r === 14 && c === 14) return ".";
    if (r === 15) { if (c === 13) return fill13; if (c >= 14 && c <= 16) return "."; }
    if (r === 16 && c >= 14 && c <= 16) return ".";
    return at(r, c);
  };
  const g = []; for (let i = 0; i < H; i++) g.push(new Array(W).fill("."));
  const put = (r, c, ch) => { if (ch === "." || ch == null) return; const i = r + top, j = c + P; if (i >= 0 && i < H && j >= 0 && j < W) g[i][j] = ch; };
  const FOLD = [15, 14, 16].slice(0, q.tq), FL = FOLD.length, tH = 7 - FL;   // 몸통 접기: 뺄 줄과 남는 몸통 높이(허리띠 위)
  const below = r => FOLD.filter(x => x > r).length;                           // r보다 아래에서 빠진 줄 수 → 그만큼 내려 그림
  const ts = y => q.bx + Math.round(q.lean * Math.max(0, Math.min(1, (19 + q.hip - y) / tH)));   // 그려지는 줄 y의 밀림 (허리띠 = bx, 어깨 = bx + lean)
  const headDY = q.hip + FL + q.hy, headDX = q.bx + q.lean + q.hx;
  const isHair = (r, c, ch) => r <= 13 && c <= 6 && RIG_HAIR[ch];
  // 1) 땅에 둔 소품 (19~23줄, 0~3칸)
  for (let r = 19; r <= 23; r++) for (let c = 0; c <= 3; c++) put(r, c, S(r, c));
  // 2) 다리: 엉덩이 관절 → (무릎) → 발목. 칸마다 다리 길이 방향 t·폭 방향 u를 구해 원래 다리 줄·칸에서 색을 가져옴
  const leg = (L, f, kp, hl) => {
    const jx = L.c + 0.5 + q.bx, jy = 20 + q.hip, ax = L.c + 0.5 + f, ay = 23 - hl;           // 뒤꿈치를 들면 발목도 그만큼 올라감
    const dx = ax - jx, dy = ay - jy, d = Math.hypot(dx, dy) || 1;
    let kx = (jx + ax) / 2, ky = (jy + ay) / 2;
    if (kp) { kx += dy / d * kp; ky += -dx / d * kp; }                     // 무릎을 다리와 직각, 앞쪽으로
    const segs = [[jx, jy, kx, ky], [kx, ky, ax, ay]].map(([x0, y0, x1, y1]) => { const l = Math.hypot(x1 - x0, y1 - y0) || 1e-6; return { x0, y0, ex: (x1 - x0) / l, ey: (y1 - y0) / l, l }; });
    const tot = segs[0].l + segs[1].l;
    const c0 = Math.floor(Math.min(jx, kx, ax) - 2), c1 = Math.ceil(Math.max(jx, kx, ax) + 2), r0 = Math.floor(Math.min(jy, ky) - 1);
    for (let r = r0; r <= 22; r++) for (let c = c0; c <= c1; c++) {
      const px = c + 0.5, py = r + 0.5;
      let best = null;
      segs.forEach((s, i) => {
        const wx = px - s.x0, wy = py - s.y0, al = wx * s.ex + wy * s.ey, pe = wx * s.ey - wy * s.ex;
        const ac = Math.max(0, Math.min(s.l, al)), dd = Math.hypot(wx - s.ex * ac, wy - s.ey * ac);
        if (!best || dd < best.dd - 1e-9) best = { dd, t: ((i ? segs[0].l : 0) + al) / tot, u: pe };
      });
      if (best.dd >= 1.5 || best.t < -0.05) continue;
      const sr = 20 + Math.max(0, Math.min(2, Math.floor(best.t * 3))), sc = L.c + Math.max(-1, Math.min(1, Math.round(best.u)));
      const ch = S(sr, sc); put(r, c, ch !== "." ? ch : "p");
    }
    let heel = -1, toe = -1; for (let c = L.s0; c <= L.s1; c++) if (S(23, c) !== "." && c > 3) { if (heel < 0) heel = c; toe = c; }
    for (let c = L.s0; c <= L.s1; c++) {                                                        // 신발은 발목을 따라감. 뒤꿈치를 들면 앞꿈치만 땅에 (발끝 → 뒤꿈치로 비스듬히)
      const ch = S(23, c); if (ch === "." || c <= 3) continue;
      const up = hl ? Math.round(hl * (toe - c) / Math.max(1, toe - heel)) : 0;
      put(23 - up, c + f, ch);
    }
    return { kx, ky };
  };
  const kb = leg(RIG_LEG.B, q.fB, q.kB, q.hl), kf = leg(RIG_LEG.F, q.fF, q.kF, 0);
  // 3) 몸통 (12~18줄, 줄마다 밀어 숙임) · 허리띠 (19줄) · 허리 아래 옷자락(20~22줄, 다리 칸이 아닌 것)
  for (let r = 12; r <= 18; r++) { if (FOLD.indexOf(r) >= 0) continue; const y = r + q.hip + below(r), dx = ts(y); for (let c = 0; c < 18; c++) { const ch = S(r, c); if (ch !== "." && !isHair(r, c, ch)) put(y, c + dx, ch); } }
  for (let c = 4; c < 18; c++) put(19 + q.hip, c + q.bx, S(19, c));
  for (let r = 20; r <= 22; r++) for (let c = 4; c < 18; c++) { if (Math.abs(c - RIG_LEG.B.c) <= 1 || Math.abs(c - RIG_LEG.F.c) <= 1) continue; put(r + q.hip, c + q.bx, S(r, c)); }
  // 4) 머리 (11줄까지 + 모자 줄 + 긴 머리카락) — 통째로 옮김
  for (let r = -top; r <= 13; r++) for (let c = 0; c < 18; c++) { const ch = S(r, c); if (ch === ".") continue; if (r <= 11 || isHair(r, c, ch)) put(r + headDY, c + headDX, ch); }
  const R = { map: g.map(row => row.join("")), top, P, sx: P + 13.3 + q.bx + q.lean * (6.2 - FL) / tH, sy: top + 12.8 + q.hip + FL, sleeve, cuff, skin, q, knB: kb, knF: kf };
  if (byKey.size > 160) byKey.clear();
  byKey.set(key, R); return R;
}
/* ---------- 앞팔: 어깨 → 팔꿈치 → 손을 도트 칸으로 (각도는 10도 단위로 모아 지도를 다시 씀) ---------- */
var rigArmCache = new Map();
function rigArm(R, pose) {
  const qa = v => Math.round(v / 0.1745) * 0.1745, sh = qa(pose.sh), fa = qa(pose.fa);
  const Sx = R.sx, Sy = R.sy;
  const Ex = Sx + RIG_L1 * Math.sin(sh), Ey = Sy - RIG_L1 * Math.cos(sh), Hx = Ex + RIG_L2 * Math.sin(fa), Hy = Ey - RIG_L2 * Math.cos(fa);
  const key = [sh.toFixed(2), fa.toFixed(2), Sx.toFixed(1), Sy.toFixed(1)].join("|");
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

/* ---------- 곽준영 그리기: 반사·그림자 → (등 뒤 무기) → 몸 → 궤적·무기 → 앞팔. 휘두르는 동안(포즈 홀드 포함) 무기·팔은 몬스터보다 앞에 ----------
   v37 쥐는 법(대표 직무 동작): hand 칼처럼 · gun 총처럼 어깨 높이 · staff 지팡이처럼 · back 등에 메고 손으로 도장 투척 */
var heroTip = { x: 0, y: 0, on: false };   // 지금 그린 무기 끝 (총구) — 기획 레이저 포인터가 반동을 따라가게
function drawHeroRig(t, look, pose, hx, hy, hs) {
  const q = rigQ(pose), R = rigBody(look, q), x0 = hx - R.P * hs, y0 = hy - R.top * hs;
  const h = fHero, M = h.mv ? FEEL_MOVES[h.mv] : null, kitId = M ? M.kit : feelKitId(), slung = FEEL_KITS[kitId] && FEEL_KITS[kitId].grip === "back";
  reflect(() => drawSprite(ctx, R.map, look.pal, x0, y0, hs, { pretty: true }));
  const sl = Math.min(1.7, 3 + q.fB), sr = Math.max(18.9, 16 + q.fF);                    // 그림자: 벌린 발 사이를 덮음 (서 있으면 v35와 같은 폭)
  ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(hx + sl * hs, GROUND - 3, (sr - sl) * hs, 6);
  const arm = rigArm(R, pose), apal = rigArmPal(look, R), WS = 5;
  const gx = x0 + arm.hx * hs, gy = y0 + arm.hy * hs, back = !h.mv && !slung && Math.sin(pose.wa) < -0.25;   // 휘두르는 동안 무기는 늘 몸 앞 (몸 뒤로 숨지 않게)
  fHero.sh.x = x0 + arm.sx * hs; fHero.sh.y = y0 + arm.sy * hs; heroHand.x = gx; heroHand.y = gy;
  heroTip.x = gx + Math.sin(pose.wa) * FEEL_BLADE * 0.96; heroTip.y = gy - Math.cos(pose.wa) * FEEL_BLADE * 0.96; heroTip.on = !slung;
  if (slung) {                                                                                // 소환사: 무기는 등에 비스듬히 멤
    const ax = x0 + (R.P + 6.5 + q.bx + q.lean * 0.45) * hs, ay = y0 + (R.top + 17 + q.hip + q.tq) * hs;
    drawHeldWeapon(ctx, ax, ay, -0.42 - q.lean * 0.05, WS * 0.78, t, true, 1);
  } else if (back) drawHeldWeapon(ctx, gx, gy, pose.wa, WS, t, false, 1.8);
  drawSprite(ctx, R.map, look.pal, x0, y0, hs, { pretty: true });
  const front = () => {
    feelSmear(look, hx - pose.dx, hy - pose.lift, hs, t);
    if (!back && !slung) drawHeldWeapon(ctx, gx, gy, pose.wa, WS, t, false, 1.8);
    if (slung && M && M.stamp && feelFrame() < h.fd.startup) feelStampInHand(gx, gy);        // 던지기 전엔 손에 도장
    drawSprite(ctx, arm.map, apal, x0 + arm.bx * hs, y0 + arm.by * hs, hs, { pretty: true });
    feelKitFx(gx, gy, pose, t);
  };
  const fr = feelFrame();
  if (h.mv && h.fd && fr >= h.fd.startup - h.fd.strike - 1 && fr <= h.fd.total) fHero.front = front; else front();
}
/* ---------- v37 원거리 직무: 탄·빔이 나가는 자리 (맞는 순간 B 자세의 총구·지팡이 끝·손, 월드 좌표) ---------- */
function feelMuzzle(mv) {
  mv = mv || fHero.mv; const K = mv && FEEL_KEYS[mv], M = mv && FEEL_MOVES[mv];
  if (!K || !M || M.kit === "melee") return { x: heroHand.x + 8, y: heroHand.y - 6 };
  const look = heroLook(), P = K.B, R = rigBody(look, rigQ(P)), arm = rigArm(R, P), hs = 3.5;
  const x0 = HERO_X + P.dx - R.P * hs, y0 = GROUND - 24 * hs + P.lift - R.top * hs, gx = x0 + arm.hx * hs, gy = y0 + arm.hy * hs;
  if (M.kit === "summon") return { x: gx, y: gy - 4 };
  return { x: gx + Math.sin(P.wa) * FEEL_BLADE * 0.96, y: gy - Math.cos(P.wa) * FEEL_BLADE * 0.96 };
}
/* 쏘는 순간(판정 첫 틱): 반동 카메라 킥 + 종이 탄피 (G-SHT-02: 섬광·킥·반동·탄피) */
function feelRelease(h) {
  const M = h && h.mv && FEEL_MOVES[h.mv]; if (!M || !M.shot) return;
  feelKick([-1, -0.15], M.kit === "snipe" ? 5 : 2.5);
  if (typeof jobParts !== "undefined") for (let i = 0; i < (M.shot > 1 ? 3 : 1); i++)
    jobParts.push({ kind: "paper", x: heroHand.x - 6, y: heroHand.y - 4, vx: -1.2 - Math.random() * 1.6, vy: -3 - Math.random() * 2.2, g: 0.32, life: 1, dur: 650 + Math.random() * 200, c: "#f4f1e6", s: 4 });
}
/* 그림 이펙트 (렌더만, 게임 상태는 안 바꿈): 총구 섬광 · 저격 조준선(예고) · 코드 마법진 · 결재판 */
function feelKitFx(gx, gy, pose, t) {
  const fk = typeof flashK === "function" ? flashK() : 1, h = fHero, M = h.mv && FEEL_MOVES[h.mv]; if (!M || M.kit === "melee" || !h.fd) return;
  const fd = h.fd, fr = feelFrame(), W = fd.startup - fd.strike, S = fd.startup, A = S + fd.active;
  const pal = feelFxPal(t), tx = gx + Math.sin(pose.wa) * FEEL_BLADE, ty = gy - Math.cos(pose.wa) * FEEL_BLADE;
  ctx.save();
  if (M.shot) {
    const n = M.shot, gap = n > 1 ? fd.active / n : 1;
    for (let i = 0; i < n; i++) { const k = (fr - (S + i * gap)) / 2.2; if (k >= 0 && k < 1 && fk > 0) feelFlash(tx, ty, pose.wa, (M.kit === "snipe" ? 2.3 : 1.5) * (1 - 0.4 * k) * (0.6 + 0.4 * fk), pal, (1 - k) * fk); }
  }
  if (M.sight && fr < S && fr > W * 0.25 && mon) {
    const [ax, ay] = feelHitPoint(h.mv), k = Math.min(1, (fr - W * 0.25) / Math.max(1, S - W * 0.25));
    ctx.globalAlpha = 0.25 + 0.6 * k; ctx.strokeStyle = pal[1]; ctx.lineWidth = M.sight > 1 ? 2.4 : 1.5;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ax, ay); ctx.stroke();
    const r = 8 + 12 * (1 - k); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ax, ay, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax - r - 4, ay); ctx.lineTo(ax - r + 4, ay); ctx.moveTo(ax + r - 4, ay); ctx.lineTo(ax + r + 4, ay); ctx.moveTo(ax, ay - r - 4); ctx.lineTo(ax, ay - r + 4); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = pal[2]; ctx.fillRect(ax - 1.5, ay - 1.5, 3, 3);
    if (M.sight > 1 && Math.floor(fr) % 4 < 2) { ctx.fillStyle = "#ffffff"; ctx.fillRect(gx - 2, gy - 9, 4, 4); }   // 돋보기 조준경 반짝
  }
  if (M.circle && fr < A + 2) {
    const k = Math.min(1, fr / Math.max(1, W)), fade = fr < S ? 1 : Math.max(0, 1 - (fr - S) / (fd.active + 2));
    feelRing(tx, ty, (M.circle > 1 ? 20 : 12) * (0.4 + 0.6 * k) * (fr < S ? 1 : 1 + (fr - S) * 0.25), t / 180, pal, 0.9 * fade, 1);
    if (M.circle > 1 && mon) feelRing(MON_X - 12, GROUND - 2, 34 * k, -t / 240, pal, 0.65 * fade, 0.26);   // 번개가 떨어질 자리 (예고)
  }
  if (h.mv === "s_call" && fr < A + 4) {
    const k = Math.min(1, fr / Math.max(1, S)), fade = fr < A ? 1 : Math.max(0, 1 - (fr - A) / 4);
    feelRing(gx, gy - 20, 14 * k + 5, t / 200, ["#2f8a4a", "#7fe3a0", "#eaffd8"], 0.95 * fade, 1);
  }
  ctx.restore();
}
function feelFlash(x, y, ang, s, pal, a) {
  ctx.globalAlpha = Math.max(0, Math.min(1, a)); ctx.save(); ctx.translate(x, y); ctx.rotate(ang - Math.PI / 2);
  ctx.fillStyle = pal[1];
  ctx.beginPath(); ctx.moveTo(0, -5 * s); ctx.lineTo(22 * s, 0); ctx.lineTo(0, 5 * s); ctx.closePath(); ctx.fill();   // 앞으로 뻗는 불꽃
  [[-0.9, 9], [0.9, 9], [-2.2, 6], [2.2, 6]].forEach(([an, L]) => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * L * s, Math.sin(an) * L * s); ctx.lineWidth = 2.5 * s; ctx.strokeStyle = pal[1]; ctx.stroke(); });
  ctx.fillStyle = pal[2]; ctx.beginPath(); ctx.arc(0, 0, 5.5 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(0, 0, 3 * s, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function feelRing(x, y, R, rot, pal, a, flat) {
  if (!(R > 1) || a <= 0.02) return;
  ctx.globalAlpha = a; ctx.save(); ctx.translate(x, y); ctx.scale(1, flat || 1);
  ctx.strokeStyle = pal[1]; ctx.lineWidth = flat && flat < 1 ? 3 : 2.4; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.4; ctx.strokeStyle = pal[2]; ctx.beginPath(); ctx.arc(0, 0, R * 0.62, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = pal[2];
  for (let i = 0; i < 6; i++) { const an = rot + i * Math.PI / 3; ctx.fillRect(Math.cos(an) * R - 2, Math.sin(an) * R - 2, 4, 4); }
  ctx.restore();
}
function feelStampInHand(x, y) {
  ctx.save(); ctx.translate(x, y - 4); ctx.rotate(-0.25);
  ctx.fillStyle = "#8a5a3a"; ctx.fillRect(-3, -12, 6, 9); ctx.fillStyle = "#c98a5a"; ctx.fillRect(-5, -15, 10, 4);
  ctx.fillStyle = "#e0403d"; ctx.fillRect(-7, -3, 14, 6); ctx.fillStyle = "#a8202a"; ctx.fillRect(-7, 2, 14, 2);
  ctx.restore();
}
function feelFront() { const f = fHero.front; fHero.front = null; if (f) f(); }
/* 칼 위치: [칼 30% 지점 x, y, 칼끝 x, y] */
function feelBlade(look, hx0, hy0, hs, p) {
  const R = rigBody(look, rigQ(p)), arm = rigArm(R, p);
  const x0 = hx0 + p.dx - R.P * hs, y0 = hy0 + p.lift - R.top * hs, gx = x0 + arm.hx * hs, gy = y0 + arm.hy * hs, sx = Math.sin(p.wa), sy = -Math.cos(p.wa);
  return [gx + sx * FEEL_BLADE * 0.3, gy + sy * FEEL_BLADE * 0.3, gx + sx * FEEL_BLADE, gy + sy * FEEL_BLADE];
}
/* 궤적 (v36, 참고 영상 계측): 예비 자세 끝 → 맞는 순간까지 칼이 실제로 지나간 자리를 큰 초승달로(가운데 두껍고 양끝 뾰족).
   친 자세를 버티는 동안 시작 쪽부터 줄어들며 가늘어지고 FEEL_SMEAR_LIFE f에 사라짐 — 참고: 두꺼운 초승달 → ~10f에 걸쳐 실선·점으로.
   히트스톱 동안은 기술 프레임이 멈추므로 궤적도 멈춤(프리즈 프레임). 찌르기·돌진은 짧은 직선만. 색은 무기 이펙트 색(feelFxPal) */
var FEEL_SMEAR_LIFE = 12;
function feelSmear(look, hx0, hy0, hs, t) {
  const h = fHero; if (feelBodyK() <= 0 || !h.mv || !h.fd || !FEEL_MOVES[h.mv].smear) return;
  const fd = h.fd, W = fd.startup - fd.strike, A = fd.startup + fd.active, fr = feelFrame(), thrust = h.mv === "jab" || h.mv === "lunge";
  const life = thrust ? 3 : FEEL_SMEAR_LIFE;
  if (fr <= W || fr > A + life) return;
  const a1 = Math.min(fr, A), b0 = thrust ? Math.max(W, a1 - 1.5) : W;
  const k = fr <= A ? 0 : (fr - A) / life;                                                  // 0 = 막 그음 → 1 = 사라짐
  const a0 = b0 + (a1 - b0) * Math.min(0.88, k * 0.95);                                     // 시작 쪽부터 줄어듦
  if (a1 - a0 < 0.05) return;
  const N = 14, pts = [];
  for (let i = 0; i <= N; i++) pts.push(feelBlade(look, hx0, hy0, hs, feelPoseAt(h.mv, fd, h.p0 || FEEL_IDLE, a0 + (a1 - a0) * i / N)));
  const pal = feelFxPal(t), fade = 1 - k * k, thin = 1 - 0.7 * k;
  const prof = i => { const u = i / N; return thrust ? 1 : Math.max(0.1, Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + u * 0.88)), 0.6)); };   // 초승달 두께 (시작 뾰족 → 끝 쪽 두껍게)
  const ribbon = (inner, col, alpha) => {
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p[2], p[3]) : ctx.moveTo(p[2], p[3]));
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i], w = inner * prof(i); ctx.lineTo(p[2] + (p[0] - p[2]) * w, p[3] + (p[1] - p[3]) * w); }
    ctx.closePath(); ctx.globalAlpha = alpha * fade; ctx.fillStyle = col; ctx.fill();
  };
  ctx.save();
  ribbon(0.78 * thin, pal[0], 0.3); ribbon(0.5 * thin, pal[1], 0.55); ribbon(0.24 * thin, pal[2], 0.92);
  if (!thrust && k > 0.12) {                                                                // 사라지는 시작 쪽 뒤에 남는 점 두 개
    const p = pts[0], q = pts[1], dx = p[2] - q[2], dy = p[3] - q[3], L = Math.hypot(dx, dy) || 1, s = 2.6;
    ctx.globalAlpha = 0.85 * fade; ctx.fillStyle = pal[2];
    for (let j = 1; j <= 2; j++) ctx.fillRect(p[2] + dx / L * 9 * j - s, p[3] + dy / L * 9 * j - s, s * 2, s * 2);
  }
  ctx.restore();
}
/* 무기 이펙트 색 [진한, 가운데, 밝은] — 옷장 '무기 이펙트'를 끼면 그 색, 아니면 들고 있는 무기 색 */
function feelFxPal(t) { return slashPal(slashStyle(), false, t); }

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
