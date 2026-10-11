/* ===================== v42 체계적 밸런스 =====================
   사용자(2026-10-11 12:44 · 13:22): "무기 변환이 너무 초반부터 어렵다, 점차 어려워져야지 · 전설 신화 초월까지 · 체계적 밸런스 패치 ·
     지하 문서고는 한 방에 부수면 시간이 늘어 계속 깊이 · 미터마다 보상 · 꾸준히 5개월(매일 말씀 몇 장 + 공부 30분)이면 중간 콘텐츠 섭렵 ·
     자수정이나 은괴 수급을 늘려 주든지 · 게임 디자인 연구를 토대로 시뮬레이션 돌려 보고 완료"
   기준(game-design 스킬): 마일스톤 시간표를 시뮬로 먼저(G-IDLE-14, U-SYS-17·18) · 모든 재화에 지수 싱크(G-IDLE-15, U-SYS-15) ·
     타이트하게 시작해 점차 느슨하게(D4-21) · 작은 보상을 자주, 병행 활동 2개 이상(G-IDLE-12) · 난이도는 적 쪽 수치로(U-SYS-13) ·
     톱니형 난이도(U-SYS-12) · 방치 경로가 영구히 막히지 않게(G-IDLE-11) · 프레스티지는 준선형(G-IDLE-06)
   수치는 모두 BAL 한 곳에. 시뮬레이터(sim_bot.js)가 같은 BAL을 바꿔 가며 시간표를 맞춤. */
var BAL = {
  // 몬스터 체력: 층마다 곱하는 배율 [이 층까지, 배율]. 예전 1.15 → 1.10 → 1.08 → 1.07 → 1.05 (높이 갈수록 쉬워졌음)
  // 350층까지는 예전과 같고(지금 기록 그대로), 그 위는 시뮬레이션으로 맞춘 기울기
  grow: [[100, 1.15], [200, 1.10], [300, 1.08], [350, 1.07], [600, 1.08], [750, 1.065], [1e9, 1.055]],
  // 무기 해금 재료 (무기마다 한 번, 퇴사해도 열린 채): 일반 6개는 그냥, 그다음부터 조금씩 오르고 등급 첫 무기(관문)는 조금 더.
  // 에픽→전설에서 값이 확 뛰지 않게(예전 표는 15 → 400) 무기마다 이어지게 맞춤. 은괴 = 흔한 재료, 자수정 = 귀한 재료
  wtab: [{}, {}, {}, {}, {}, {},
    { ore: 120 }, { ore: 60 }, { ore: 70 }, { ore: 80 }, { ore: 90 }, { ore: 100 },                                                     // 고급
    { ore: 300, silver: 4 }, { ore: 160, silver: 3 }, { ore: 180, silver: 3 }, { ore: 200, silver: 4 }, { ore: 220, silver: 4 }, { ore: 240, silver: 5 },   // 희귀
    { silver: 12, ame: 2 }, { silver: 10, ame: 2 }, { silver: 12, ame: 3 }, { silver: 15, ame: 3 }, { silver: 18, ame: 4 }, { silver: 22, ame: 5 },      // 에픽
    { silver: 150, ame: 45 }, { silver: 110, ame: 35 }, { silver: 140, ame: 45 }, { silver: 175, ame: 55 }, { silver: 215, ame: 70 }, { silver: 265, ame: 85 },   // 전설
    { silver: 700, ame: 260 }, { silver: 450, ame: 165 }, { silver: 480, ame: 175 }, { silver: 510, ame: 185 }, { silver: 545, ame: 200 }, { silver: 580, ame: 215 },   // 신화
    { silver: 1200, ame: 450 }, { silver: 850, ame: 320 }, { silver: 900, ame: 340 }, { silver: 960, ame: 360 }, { silver: 1020, ame: 385 }, { silver: 1100, ame: 410 }],   // 초월
  pickMax: 30,                                           // 곡괭이 최대 레벨 (예전엔 끝이 없어 광석 ×12까지)
  charmGrow: 1.02,                                       // 부적 값: 200 × 1.02^가진 수 (예전: 늘 200 → 광석이 끝없이 피해로)
  treGrow: 2,                                            // 보물 궁극(200레벨) 넘어 50레벨마다 값 ×2 (예전: 같은 값이 되풀이돼 도장이 도장을 낳음 · ×5는 도장이 갈 곳을 잃음)
  treAme: [0, 0, 0, 0, 0, 0, 0, 0, 0],                   // 보물 차수 열기 자수정 (0이면 관문 없음) — 시뮬: 자수정이 무기 해금에 몰려 도장이 갈 곳을 잃어 뺌
  reviewMul: [1, 3, 5, 8, 12],                           // 인사고과표 차수 효과 — 예전 [1,3,10,30,100]은 도장이 도장을 낳아 폭주 (지금 가진 100레벨 아래는 그대로)
  chairOre: 2000, legEnhK: 1,                            // 회장님 세트 값 · 전설 옷 강화 광석 배수
  chairSilver: 1,                                        // 회장 보스(100층마다) 처치 은괴
  overAme: 5,                                            // 마지막 무기 5강 뒤 '돌파' 한 단계마다 자수정 (10단계마다 +5)
  st25Silver: 2, st60Ame: 1, mem5Ame: 1, planAme: 1,     // 일일 업무 '공부 25분'·'공부 60분'·'암송 5구절'과 플랜 하루 분량에 재료 추가
  // 지하 문서고: 30초로 시작, 한 방에 부수면 +1초(최대 30초). 서류함 하나 = 10m, n번째 서류함 체력 = (n+1)층 몬스터 × hp
  // 100m마다 월급, 이정표(500·2000·4500·8000… = 500×k²m)마다 은괴 1 · 광석, 이정표 3개마다 자수정 1, 처음 닿는 1000m마다 도장·은괴, 5000m마다 자수정
  vault: { t0: 30, cap: 30, one: 1.0, m: 10, hp: 0.5, gold: 0.3, step: 100, mile: 500, mileOre: 30, ameMile: 3, recEvery: 1000, recSt: 5, recSv: 2, recAmeEvery: 5000, recAme: 3, wait: 0.35, waitMin: 0.12, skipEvery: 5, skipMax: 4 },
};

/* ---------- 몬스터 체력 곡선 ---------- */
var hpC42 = [0, 100];
function growAt(f) { const G = BAL.grow; for (let i = 0; i < G.length; i++) if (f <= G[i][0]) return G[i][1]; return G[G.length - 1][1]; }
hpBase = function (f) { f = Math.max(1, Math.min(30000, Math.floor(f) || 1)); while (hpC42.length <= f) { const n = hpC42.length; hpC42.push(hpC42[n - 1] * growAt(n - 1)); } return hpC42[f]; };
function hpReset() { hpC42.length = 2; }

/* ---------- 무기 7등급 (6개씩 42개) ---------- */
var WGRADES = [
  { n: "일반", c: "#b9c1d6" }, { n: "고급", c: "#7fe3a0" }, { n: "희귀", c: "#6fd3ff" }, { n: "에픽", c: "#c9a6ff" },
  { n: "전설", c: "#ffb13b" }, { n: "신화", c: "#ff6b6b" }, { n: "초월", c: "#fff09a" },
];
var WG_SIZE = 6;
function gradeOf(i) { return Math.max(0, Math.min(WGRADES.length - 1, Math.floor(i / WG_SIZE))); }
function gradeFirst(g) { return g * WG_SIZE; }
WEAPONS.forEach((w, i) => { w.leg = gradeOf(i) >= 3; w.grade = gradeOf(i); });
function wUnlockCost(i) {                                                   // 무기 i를 여는 데 드는 재료 (한 번만, 퇴사해도 열린 채)
  return Object.assign({}, (BAL.wtab && BAL.wtab[i]) || {});
}
function wUnl() { return Math.max(WG_SIZE - 1, +S.wunl || 0); }
function wLocked(i) { return i > wUnl() && i < WEAPONS.length; }
function wUnlockInfo(i) {
  const req = wUnlockCost(i), keys = Object.keys(req), prev = i <= wUnl() + 1;
  const ok = prev && keys.every(k => (+S[k] || 0) >= req[k]);
  const need = keys.map(k => `${ECO_NAME[k] || k} ${fmtR(req[k])}`).join(" · ");
  const lack = keys.filter(k => (+S[k] || 0) < req[k]).map(k => `${ECO_NAME[k] || k} ${fmtR(req[k] - (+S[k] || 0))}`).join(" · ");
  return { i, req, ok, prev, need, lack, entry: i % WG_SIZE === 0, short: !prev ? "앞 무기부터" : ok ? `${need}로 열기` : `${lack} 더 필요` };
}
function weaponUnlockTry(i, quiet) {
  if (!wLocked(i)) return true;
  const lk = wUnlockInfo(i);
  if (!lk.ok) { if (!quiet) toast(!lk.prev ? "앞 무기부터 차례로 열어요" : `${WEAPONS[i].n}: ${lk.lack} 더 필요해요 · 공부 탭 광산과 지하 문서고에서 모여요`); return false; }
  Object.keys(lk.req).forEach(k => { S[k] -= lk.req[k]; });
  S.wunl = i;
  if (!quiet) {
    const g = gradeOf(i);
    sfx(lk.entry ? "bigup" : "upgrade");
    celebrate(lk.entry
      ? { icon: weaponBig(i, 1), title: `${WGRADES[g].n} 등급 열림!`, sub: `${WEAPONS[i].n} · 이제 월급으로 살 수 있어요<br><span class="muted">${lk.need} 사용 · 퇴사해도 열린 채로 남아요</span>`, tone: "rare", ms: 3000 }
      : { icon: weaponBig(i, 1), title: "무기 해금!", sub: `${WGRADES[g].n} · ${WEAPONS[i].n}<br><span class="muted">${lk.need} 사용 · 퇴사해도 열린 채로 남아요</span>`, tone: "gold" });
  }
  return true;
}
function wGradeTag(i) { const g = WGRADES[gradeOf(i)]; return `<span class="wgr" style="color:${g.c};border-color:${g.c}">${g.n}</span>`; }

/* ---------- 보물: 궁극 넘어서도 값이 오르고, 차수는 자수정으로 엶 ---------- */
function treTierOf(lv) { return Math.floor(lv / 50); }
treEff = function (t, lv) {
  if (t.flat) return t.per * lv;
  const M = t.id === "review" ? BAL.reviewMul : TIER_MUL; let s = 0;
  for (let j = 0; j < lv; j++) s += t.per * M[Math.min(M.length - 1, Math.floor(j / 50))];
  return s;
};
function overAme(lv) { return BAL.overAme * (1 + Math.floor(Math.max(0, lv - 5) / 10)); }   // 돌파 +6으로 올릴 때 lv=5
weaponStep = function () {
  const c = weaponStepCost(); if (c == null || S.gold < c) return 0;
  const over = S.wi === LAST_W && S.wl >= 5, a = over ? overAme(S.wl) : 0;
  if (a && (S.ame || 0) < a) return 0;
  S.gold -= c; if (a) S.ame -= a;
  if (S.wl < 5 || S.wi === LAST_W) { S.wl++; return 1; }
  S.wi++; S.wl = 1; S.skin = -1; return 2;
};
function treTierCostMul(tier) { return tier <= 4 ? TIER_COST[tier] : TIER_COST[4] * Math.pow(BAL.treGrow, tier - 4); }
function treTierAme(tier) { const A = BAL.treAme; return tier < A.length ? A[tier] : A[A.length - 1] * Math.pow(2, tier - A.length + 1); }
function treTierOpen(id, tier) { if (tier <= 0) return true; const o = (S.treTier && S.treTier[id]) || 0; return o >= tier; }
function treGateAt(t) { const lv = S.tre[t.id] || 0; if (t.flat || lv === 0 || lv % 50 !== 0) return 0; const tier = treTierOf(lv); return treTierOpen(t.id, tier) || !(treTierAme(tier) > 0) ? 0 : tier; }
treCost = function (t, lv) {
  if (t.flat) return Math.ceil(3 * Math.pow(1.25, lv));
  const tier = treTierOf(lv);
  if (lv > 0 && lv % 50 === 0 && !treTierOpen(t.id, tier) && treTierAme(tier) > 0) return Infinity;      // 새 차수 첫 레벨은 자수정으로 차수를 연 뒤 (값이 있을 때만)
  return Math.ceil((2 + 0.6 * Math.pow(lv % 50, 1.7)) * treTierCostMul(tier));
};
function treTierTry(t, quiet) {
  const tier = treGateAt(t); if (!tier) return false;
  const need = treTierAme(tier);
  if ((S.ame || 0) < need) { if (!quiet) toast(`자수정 ${fmtR(need - (S.ame || 0))} 더 있으면 ${TIER_NAME[Math.min(4, tier)] || "다음 "}차수를 열 수 있어요`); return false; }
  S.ame -= need; if (!S.treTier) S.treTier = {}; S.treTier[t.id] = tier;
  if (!quiet) celebrate({ ic: "treasure", title: "보물 차수 열림!", sub: `${t.n} ${tier + 1}차수 · 자수정 ${need} 사용<br><span class="muted">이제 도장으로 계속 올릴 수 있어요</span>`, tone: "stamp" });
  return true;
}

/* ---------- 부적 값: 가진 수만큼 조금씩 오름 ---------- */
function charmPrice(id) { return Math.ceil(CHARM_PRICE * Math.pow(BAL.charmGrow, (S.charms && S.charms[id]) || 0)); }

/* ---------- 회장님 세트 값 · 전설 옷 강화 ---------- */
(function () {
  WITEMS.forEach(it => { if (it.set === "chair" && it.cost) it.cost.ore = BAL.chairOre; });
  const ec0 = wardEnhCost;
  wardEnhCost = function (it, e) {
    const c = ec0(it, e);
    if (it.g === 4 && c && c.ore) { c.ore = Math.ceil(c.ore * BAL.legEnhK); }
    return c;
  };
})();

/* ---------- 퍼센트 피해(사직서·선인장)는 보스 피해 배율을 다시 곱하지 않음 (예전: 최대 체력 5% × 보스 배율 → 보스를 한 방에) ---------- */
var pctHit = false;

/* ---------- 지하 문서고: 한 방에 부수면 시간 +1초 · 깊이마다 단단해짐 · 100m마다 보상 ---------- */
var vaultBest = 0;
function vaultChestHp(n) { return hpBase(1 + n) * BAL.vault.hp; }            // n번째 서류함 (0부터) = 깊이 n×10m, 층으로 치면 n+1층
function vaultDepthOf(n) { return n * BAL.vault.m; }
function vaultStepN(combo) { return 1 + Math.min(BAL.vault.skipMax, Math.floor((combo || 0) / BAL.vault.skipEvery)); }   // 한 방 5연속마다 한 번에 서류함 하나 더 (최대 5칸)
function vaultWait(combo) { return combo > 0 ? Math.max(BAL.vault.waitMin, BAL.vault.wait - 0.02 * combo) : BAL.vault.wait; }
function vaultMileK(m) { const k = Math.round(Math.sqrt(m / BAL.vault.mile)); return k >= 1 && BAL.vault.mile * k * k === m ? k : 0; }   // 이정표면 몇 번째인지
function vaultNextMile(m) { const k = Math.floor(Math.sqrt(m / BAL.vault.mile)) + 1; return BAL.vault.mile * k * k; }
function vaultStepReward(m) {                                              // 깊이 m에 닿을 때 (100m마다) 받는 것
  const V = BAL.vault, r = { gold: goldBase(Math.max(1, S.floor)) * V.gold * goldMult() }, k = vaultMileK(m);
  if (k) { r.silver = 1; r.ore = V.mileOre * k; if (k % V.ameMile === 0) r.ame = 1; }
  return r;
}
function vaultRecReward(m) {                                               // 처음 닿는 깊이 (기록 갱신, 500m마다)
  const V = BAL.vault, r = { stamp: V.recSt + Math.floor(m / 1000) * 2, silver: V.recSv };
  if (m % V.recAmeEvery === 0) r.ame = V.recAme;
  return r;
}
function vaultGrant(r, run) {
  if (r.gold) { S.gold += r.gold; run.gold += r.gold; }
  ["stamp", "ore", "silver", "ame"].forEach(k => { if (r[k]) { S[k] = (+S[k] || 0) + r[k]; run[k] = (run[k] || 0) + r[k]; } });
}
function vaultBestGet() { return Math.max(+(S.vault && S.vault.best) || 0, 0); }
function vaultReach(m, run, fx) {                                          // 깊이 m에 닿았을 때 (10m마다 부름)
  const V = BAL.vault; let msg = "";
  if (m % V.step === 0) { const r = vaultStepReward(m); vaultGrant(r, run); msg = `${m}m` + (r.silver ? " 은괴 +1" : "") + (r.ame ? " 자수정 +1" : "") + (r.ore ? ` 광석 +${r.ore}` : ""); }
  if (m > vaultBestGet() && m % V.recEvery === 0) {
    const r = vaultRecReward(m); vaultGrant(r, run); run.rec = m;
    msg = `${m}m 첫 도달! 도장 +${r.stamp} 은괴 +${r.silver}` + (r.ame ? ` 자수정 +${r.ame}` : "");
  }
  if (m > vaultBestGet()) { S.vault = S.vault || {}; S.vault.best = m; }
  return msg;
}
/* 시뮬레이터·미리보기용: 지금 힘으로 한 판 (실제 판과 같은 규칙: 한 방이면 +1초(최대 30초), 서류함마다 대기 0.35초) */
function vaultSimRun(dry) {
  rollDay();
  if (!dry) { if (S.day.vaultUsed >= vaultTickets()) return null; S.day.vaultUsed++; }
  const V = BAL.vault, st = stats(), hitD = st.atk, dps = st.dps; let t = V.t0, n = 0, one = 0;
  const run = { n: 0, gold: 0, st: 0, depth: 0 };
  const keep = dry ? JSON.stringify({ g: S.gold, s: S.stamp, o: S.ore, v: S.silver, a: S.ame, b: S.vault && S.vault.best }) : null;
  let combo = 0;
  while (t > 0 && n < 20000) {
    const hp = vaultChestHp(n);
    const p1 = hitD >= hp ? 1 : hitD * st.critMul >= hp ? st.crit : 0;      // 한 방에 부술 확률
    const from = vaultDepthOf(n);
    if (Math.random() < p1) { combo++; t = Math.min(V.cap, t - vaultWait(combo) + V.one); one++; }
    else { combo = 0; const need = hp / Math.max(1e-9, dps) + V.wait; if (need > t) break; t -= need; }
    n += vaultStepN(combo); run.n = n; run.depth = vaultDepthOf(n); run.sec = (run.sec || 0);
    for (let m = from + V.m; m <= run.depth; m += V.m) vaultReach(m, run);
  }
  if (!dry) { S.day.depth = Math.max(S.day.depth || 0, run.depth); }
  else { const o = JSON.parse(keep); S.gold = o.g; S.stamp = o.s; S.ore = o.o; S.silver = o.v; S.ame = o.a; if (S.vault) S.vault.best = o.b; }
  run.one = one;
  return run;
}

/* ---------- 일일 업무 보상에 재료 ---------- */
(function () {
  const d25 = DAILY.find(d => d.id === "st25"), d60 = DAILY.find(d => d.id === "st60");
  if (d25 && BAL.st25Silver) d25.rw.silver = BAL.st25Silver;
  if (d60 && BAL.st60Ame) d60.rw.ame = BAL.st60Ame;
  const m5 = DAILY.find(d => d.id === "mem5"); if (m5 && BAL.mem5Ame) m5.rw.ame = BAL.mem5Ame;
  const pd0 = planDayRw;
  planDayRw = function () { const r = pd0(); if (BAL.planAme) r.ame = BAL.planAme; return r; };
})();

/* ---------- 저장: 등급 관문 · 보물 차수 · 문서고 기록 (예전 저장 옮기기) ---------- */
(function () {
  const fs0 = freshState;
  freshState = function () { const s = fs0(); s.wunl = WG_SIZE - 1; s.treTier = {}; s.vault = Object.assign({ tickets: 3, best: 0 }, s.vault || {}); return s; };
  const mg0 = merge;
  merge = function (d) {
    const s = mg0(d);
    let u = Math.max(WG_SIZE - 1, Math.floor(+d.wunl || 0), Math.min(WEAPONS.length - 1, Math.floor(+d.wi || 0)));   // 지금 무기까지는 열림
    (Array.isArray(d.legUnlock) ? d.legUnlock : []).forEach((v, k) => { if (v) u = Math.max(u, LEG_START + k); });          // 예전 전설 해금
    s.wunl = Math.min(WEAPONS.length - 1, u);
    const tt = {}; TREASURES.forEach(t => { const lv = (s.tre && s.tre[t.id]) || 0, have = (d.treTier && +d.treTier[t.id]) || 0; tt[t.id] = Math.max(have, lv > 0 ? treTierOf(lv - 1) : 0); });
    s.treTier = tt;                                                          // 이미 오른 차수는 열린 것으로
    s.vault = Object.assign({ tickets: 3, best: 0 }, s.vault || {}, { best: Math.max(0, +(d.vault && d.vault.best) || 0) });
    return s;
  };
})();

/* ---------- 화면 도우미: 등급 이름표 · 무기 장착 제목 · 재료 · 등급 사다리 ---------- */
function wEquipTitle(i) { const g = gradeOf(i); return g >= 3 ? `${WGRADES[g].n} 무기 장착!` : "새 무기 장착!"; }
function matHave(req) { return Object.keys(req || {}).map(k => `${ECO_NAME[k] || k} ${fmtR(+S[k] || 0)}`).join(" · "); }
function wGradeLadderHTML() {
  const u = wUnl(), cur = gradeOf(S.wi);
  const rows = WGRADES.map((G, g) => {
    const a = g * WG_SIZE, b = a + WG_SIZE - 1, open = Math.max(0, Math.min(WG_SIZE, u - a + 1));
    const nx = u + 1 >= a && u + 1 <= b ? u + 1 : -1, lk = nx >= 0 ? wUnlockInfo(nx) : null;
    const st = open >= WG_SIZE ? `<b class="ok">모두 열림</b>` : open > 0 ? `${open}/${WG_SIZE} 열림` : `잠김`;
    const nxt = lk ? `<div class="wgl-n">다음 ${WEAPONS[nx].n} · ${lk.need}${lk.entry ? " (등급 관문)" : ""}</div>` : "";
    return `<div class="wgl-r${g === cur ? " cur" : ""}${open || lk ? "" : " off"}"><span class="wgr" style="color:${G.c};border-color:${G.c}">${G.n}</span><div class="wgl-t">${WEAPONS[a].n} ~ ${WEAPONS[b].n}</div><span class="wgl-s">${st}</span>${nxt}</div>`;
  }).join("");
  return `${rows}<p class="muted wgl-f">무기는 재료로 한 번 열면 퇴사해도 열린 채예요. 일반 6개는 그냥, 그다음부터 조금씩 오르고 등급 첫 무기(관문)는 조금 더 들어요.<br>지금 ${matHave({ ore: 1, silver: 1, ame: 1 })} · 은괴는 공부 광산·지하 문서고 이정표·'공부 25분' 업무, 자수정은 광산·문서고·'암송 5구절' 업무·플랜 하루 분량에서 나와요.</p>`;
}

/* ---------- 찌르기 고도화 (영업 3연타 마무리 '관통 검기' · 터치 찌르기) ----------
   사용자(13:22): "찌르기할 때 앞으로 에너지 나가는 게 좀 더 타격감 있고 간지 나게 · 지금도 이쁘긴 해"
   사용자 설정이 흔들림 0 · 번쩍임 0이라 화면 흔들림·하얀 번쩍임 없이 그림만으로 손맛을 냄 (U-FEEL: 예고 → 순간 → 여운):
   ① 모으기: 찌르기 전 칼끝으로 빛 알갱이가 빨려 들고 작은 구가 부풂 ② 발사: 굵은 창 모양 검기가 60ms 만에 몬스터에 꽂히고 소닉붐 고리 3겹 + 속도선
   ③ 꽂힘: 날카로운 가시 폭발 · 십자 플레어 · 고리 ④ 관통: 몬스터 뒤로 빛줄기가 뿜어져 나가고 검기가 화면 끝까지 ⑤ 여운: 길을 따라 잔불 · 꼬리부터 사라짐
   색은 들고 있는 무기 이펙트 색(feelFxPal) — v40 '무기 색 = 스킬 색' 그대로 */
function salesOn() { const pv = typeof jobPreviewId === "function" ? jobPreviewId() : "", j = (pv && jobById(pv)) || curJob(); return !!(j && j.id === "sales"); }
var TP_EASE = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
(function () {
  const wf0 = warriorFx;
  warriorFx = function (x, y, crit) {
    const mv = fHero.mv;
    wf0(x, y, crit);                                                 // v40 관통 검기·초승달 검기는 그대로 두고 (사용자: 지금도 예쁨) 그 위에 겹겹이 더함
    if (mv !== "lunge" && mv !== "jab") return;
    const pal = feelFxPal(performance.now()).slice(), { w: mw, h: mh } = msz(), big = crit ? 1.25 : 1, L = mv === "lunge";
    const yy = L ? GROUND - mh * 0.45 : y, xm = MON_X - mw * 0.12, xe = MON_X + mw * 0.45;
    jvAdd("tburst", { x: xm, y: yy, pal, big, L, crit, dur: L ? 460 : 260, noTint: true });                  // ③ 꽂힘
    jSparks(xm, yy, pal[2], L ? 16 : 6, L ? 17 : 10); jSparks(xm, yy, pal[1], L ? 10 : 4, 12);
    if (!L) return;
    jvAdd("tboom", { x: xm - 10, y: yy, pal, big, dur: 420, noTint: true });                                   // ② 소닉붐 고리 + 속도선
    jvAdd("kwave", { x: x + 6, y: yy, vx: 640, vy: 0, r: 70 * big, ang: 0, th: 9 * big, span: 1.45, dur: 300, pal, t: -45 });   // 두 겹째 초승달 (조금 늦게, 더 크고 가늘게)
    const ex = jvAdd("texit", { x: xe, y: yy, pal, big, L, dur: 420, noTint: true, t: -35 });                    // ④ 관통: 몬스터 뒤로 뿜어짐
    for (let i = 0; i < 7; i++) jobParts.push({ kind: "ember", x: xm + 10 + i * 26 + Math.random() * 10, y: yy + (Math.random() - .5) * 14, vx: 1.2 + Math.random() * 1.6, vy: -0.6 - Math.random() * 1.2, g: -0.02, life: 1, dur: 520 + Math.random() * 300, c: i % 2 ? pal[1] : pal[2], s: 3 + Math.random() * 2, noTint: true });   // ⑤ 잔불
    feelFreeze(crit ? 5 : 3, true, 3);
  };
  JFX_DRAW.tboom = function (f) {                                   // 칼끝 앞에서 퍼지며 나아가는 세로 고리 3겹 + 앞질러 가는 속도선
    const t = f.t, P = f.pal, b = f.big || 1;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const k = (t - i * 45) / 320; if (k <= 0 || k >= 1) continue;
      const cx = f.x + 34 + (50 + i * 44) * TP_EASE(k) + i * 16, rx = (4 + 8 * k) * b, ry = (12 + 30 * k) * b * (1 - i * 0.15);
      ctx.globalAlpha = (1 - k) * 0.62; ctx.strokeStyle = i === 0 ? P[2] : P[1]; ctx.lineWidth = (2.6 - i * 0.6) * b * (1 - k * 0.4) + 0.5;
      ctx.beginPath(); ctx.ellipse(cx, f.y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    }
    const k2 = t / f.dur;
    for (let i = 0; i < 9; i++) {
      const s = ((f.seed * 13 + i * 37) % 100) / 100, off = (i % 2 ? -1 : 1) * (14 + s * 34 * b), len = 50 + s * 90;
      const px = f.x - 30 + 360 * Math.min(1, TP_EASE(k2 * (1.2 + s * 0.6)));
      ctx.globalAlpha = 0.8 * (1 - k2) * (1 - s * 0.3); ctx.strokeStyle = s > 0.5 ? P[2] : P[1]; ctx.lineWidth = s > 0.7 ? 2.4 : 1.4;
      ctx.beginPath(); ctx.moveTo(px - len, f.y + off); ctx.lineTo(px, f.y + off); ctx.stroke();
    }
    ctx.restore();
  };
  JFX_DRAW.tburst = function (f) {                                   // 꽂히는 순간: 가시 폭발 · 십자 플레어 · 고리
    const k = f.t / f.dur, P = f.pal, b = f.big || 1, L = f.L, a = Math.max(0, 1 - k), e = TP_EASE(Math.min(1, k * 2.2));
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const n = L ? 14 : 7, R = (L ? 58 : 30) * b;
    for (let i = 0; i < n; i++) {                                    // 가시: 앞쪽(오른쪽)으로 더 길게
      const an = (i / n) * Math.PI * 2 + f.seed, fw = 0.65 + 0.35 * Math.cos(an), len = R * (0.45 + 0.55 * ((i * 7 + f.seed) % 5) / 4) * fw * e, w = (L ? 4 : 2.6) * b * a;
      const ex = f.x + Math.cos(an) * len, ey = f.y + Math.sin(an) * len * 0.8;
      ctx.globalAlpha = a * 0.95; ctx.fillStyle = i % 3 ? P[1] : P[2];
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(f.x - Math.sin(an) * w, f.y + Math.cos(an) * w); ctx.lineTo(f.x + Math.sin(an) * w, f.y - Math.cos(an) * w); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = a * 0.8; ctx.strokeStyle = P[2]; ctx.lineWidth = (L ? 3 : 2) * b * a + 0.5;   // 고리
    ctx.beginPath(); ctx.ellipse(f.x, f.y, R * (0.25 + 0.9 * e), R * (0.25 + 0.9 * e) * 0.75, 0, 0, Math.PI * 2); ctx.stroke();
    if (L) { ctx.globalAlpha = a * 0.6; ctx.strokeStyle = P[1]; ctx.lineWidth = 2 * b * a; ctx.beginPath(); ctx.ellipse(f.x, f.y, R * (0.15 + 1.35 * e), R * (0.15 + 1.35 * e) * 0.6, 0, 0, Math.PI * 2); ctx.stroke(); }
    const fl = (L ? 130 : 60) * b * (0.4 + 0.6 * e), fh = (L ? 3.4 : 2) * b * a + 0.5;   // 십자 플레어 (가로로 길게: 꿰뚫는 방향) — 흰빛은 가는 심만
    ctx.globalAlpha = a * 0.85; ctx.fillStyle = P[2]; ctx.fillRect(f.x - fl * 0.3, f.y - fh / 2, fl, fh); ctx.fillRect(f.x - fh / 2, f.y - fl * 0.25, fh, fl * 0.5);
    ctx.globalAlpha = a; ctx.fillStyle = "#ffffff"; ctx.fillRect(f.x - fl * 0.18, f.y - fh * 0.2, fl * 0.6, fh * 0.4);
    ctx.restore();
    jvStar(f.x, f.y, (L ? 16 : 9) * b * (k < 0.12 ? k / 0.12 : 1 - (k - 0.12) * 0.9), P[2], a, 1.2, f.seed * 0.1);
  };
  JFX_DRAW.texit = function (f) {                                    // 관통: 몬스터 뒤로 뿜어져 나가는 빛줄기
    const k = f.t / f.dur, P = f.pal, b = f.big || 1, a = Math.max(0, 1 - k), e = TP_EASE(Math.min(1, k * 1.8));
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
    const n = f.L ? 11 : 5;
    for (let i = 0; i < n; i++) {
      const an = (i - (n - 1) / 2) * (f.L ? 0.12 : 0.16) + Math.sin(f.seed + i) * 0.03, len = (f.L ? 170 : 60) * b * (0.6 + 0.4 * ((i * 5 + f.seed) % 4) / 3) * e;
      const sx = f.x + Math.cos(an) * len * 0.25, sy = f.y + Math.sin(an) * len * 0.25, ex = f.x + Math.cos(an) * len, ey = f.y + Math.sin(an) * len;
      ctx.globalAlpha = a * (i === (n - 1) / 2 ? 1 : 0.75); ctx.strokeStyle = i % 2 ? P[1] : P[2]; ctx.lineWidth = (i === (n - 1) / 2 ? 5 : 2.2) * b * a + 0.4;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    }
    ctx.restore();
    if (f.L) jvHalo(f.x + 6, f.y, 10 + 46 * e, (10 + 46 * e) * 1.15, P[1], a * 0.8, 0);
  };
  if (typeof TINT_SKIP === "object") { TINT_SKIP.tburst = 1; TINT_SKIP.texit = 1; TINT_SKIP.tboom = 1; }
  // ① 모으기: 찌르기 전 칼끝으로 빛이 빨려 듦 (영업 마무리 찌르기만)
  const kf0 = feelKitFx;
  feelKitFx = function (gx, gy, pose, t) {
    kf0(gx, gy, pose, t);
    const h = fHero; if (h.mv !== "lunge" || !h.fd || !salesOn()) return;
    const fd = h.fd, fr = feelFrame(), S0 = fd.startup; if (fr >= S0 + 1) return;
    const k = Math.max(0, Math.min(1, fr / Math.max(1, S0))), P = feelFxPal(t), tx = gx + Math.sin(pose.wa) * FEEL_BLADE, ty = gy - Math.cos(pose.wa) * FEEL_BLADE;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {                                    // 빨려 드는 빛 알갱이
      const an = i * 0.7 + t / 260, d = (1 - ((k + i / 9) % 1)) * 46;
      ctx.globalAlpha = 0.25 + 0.6 * k; ctx.fillStyle = i % 2 ? P[1] : P[2];
      ctx.fillRect(tx + Math.cos(an) * d - 1.5, ty + Math.sin(an) * d * 0.8 - 1.5, 3, 3);
    }
    const r = 3 + 9 * k;
    const g = ctx.createRadialGradient(tx, ty, 0, tx, ty, r * 2.2); g.addColorStop(0, hexA(P[2], 0.9 * k)); g.addColorStop(0.45, hexA(P[1], 0.6 * k)); g.addColorStop(1, hexA(P[1], 0));
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(tx, ty, r * 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
})();
