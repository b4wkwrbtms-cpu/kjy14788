// v42: 무기 7등급 42개 · 무기마다 재료 해금 · 돌파 자수정 · 체력 곡선 · 보물 값 · 곡괭이·부적 · 퍼센트 피해 · 회장 은괴 · 업무 재료 · 문서고 · 찌르기
run(600);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(300); }
const ok = [], bad = [];
const check = (name, cond, info) => { (cond ? ok : bad).push(name); out((cond ? "  ✓ " : "  ✗ ") + name + (info ? "  " + info : "")); };
// v42 시스템 회귀 (v43 무기 66개에 맞춤): 돌파 · 체력 곡선 · 보물 · 곡괭이·부적 · 퍼센트 피해 · 재료 · 문서고 · 찌르기
out("[4] 마지막 무기 돌파: 월급 + 자수정");
E(`S.wunl = LAST_W; S.wi = LAST_W; S.wl = 5; S.gold = 1e300; S.ame = 4; 0`);
check("자수정이 모자라면 돌파 안 됨", E(`weaponStepCost() === null && weaponStep() === 0`) === true);
E(`S.ame = 100; 0`);
check("자수정이 있으면 돌파 +6 · 자수정 5 빠짐", E(`weaponStep()`) === 1 && E(`S.wl`) === 6 && E(`S.ame`) === 95);
check("돌파는 10단계마다 자수정이 늘어남", E(`overAme(5) === 5 && overAme(15) === 10 && overAme(25) === 15`) === true);
E(`S.wi = 23; S.wl = 5; S.wunl = 25; S.gold = 0; 0`);

out("[5] 몬스터 체력: 350층까지 예전 그대로, 그 위는 더 가파름");
const hpOld = f => { let h = 100; const G = n => n <= 100 ? 1.15 : n <= 200 ? 1.10 : n <= 300 ? 1.08 : n <= 400 ? 1.07 : 1.05; for (let n = 1; n < f; n++) h *= G(n); return h; };
const r350 = E(`hpBase(350)`) / hpOld(350), r500 = E(`hpBase(500)`) / hpOld(500);
check("350층 체력 = 예전과 같음", Math.abs(r350 - 1) < 1e-9, r350.toFixed(6));
check("500층은 예전보다 단단함 (높이 갈수록 쉬워지던 것 고침)", r500 > 10, r500.toExponential(2));
check("층마다 체력이 늘 늘어남 (1~1200층)", E(`(() => { for (let f = 2; f <= 1200; f++) if (!(hpBase(f) > hpBase(f - 1))) return false; return true; })()`) === true);

out("[6] 보물: 궁극(200레벨) 넘어 50레벨마다 값 2배 · 인사고과표 효과 완만");
check("250레벨 값 = 200레벨 값 × 2", Math.abs(E(`treCost(TREASURES[0], 250) / treCost(TREASURES[0], 200)`) - 2) < 1e-9);
check("인사고과표 64레벨 효과는 예전과 같음 (지금 가진 것 그대로)", Math.abs(E(`treEff(TREASURES[2], 64)`) - (0.15 * 50 + 0.15 * 3 * 14)) < 1e-9);
check("인사고과표 150레벨 효과가 예전보다 작음 (도장이 도장을 낳는 고리)", E(`treEff(TREASURES[2], 150)`) < 0.15 * (50 + 150 + 500) - 1);
check("차수 관문(자수정) 없음 — 도장이 갈 곳을 잃지 않게", E(`treCost(TREASURES[0], 100)`) < 1e12);

out("[7] 곡괭이 최대 30 · 부적 값이 조금씩 오름");
check("곡괭이 최대 30", E(`BAL.pickMax`) === 30);
check("부적 값: 0개 200 → 100개 1449", E(`(() => { const k = S.charms.red; S.charms.red = 0; const a = charmPrice("red"); S.charms.red = 100; const b = charmPrice("red"); S.charms.red = k; return a + "," + b; })()`) === "200,1449");

out("[8] 사직서·선인장 퍼센트 피해는 보스 배율을 다시 곱하지 않음");
const pct = JSON.parse(E(`JSON.stringify((() => { mode = "tower"; spawn(); mon.kind = 2; mon.max = mon.hp = 1e9; const bb = stats().bossBonus; const hp0 = mon.hp; pctHit = true; try { hit(1e7, true, "skill"); } finally { pctHit = false; } const d1 = hp0 - mon.hp; const hp1 = mon.hp; hit(1e7, true, "skill"); const d2 = hp1 - mon.hp; return { d1, d2, bb }; })())`));
check("퍼센트 피해는 그대로, 보통 피해는 보스 배율", Math.abs(pct.d1 - 1e7 * E(`careerTaken()`)) < 1 && (pct.bb <= 1 || pct.d2 > pct.d1 * 1.01), JSON.stringify(pct));
E(`mon.kind = 0; mon.hp = 0; spawn(); 0`);

out("[9] 재료 얻는 곳 늘림");
check("'공부 25분' 업무 = 은괴 2 · '암송 5구절' = 자수정 1", E(`DAILY.find(d => d.id === "st25").rw.silver === 2 && DAILY.find(d => d.id === "mem5").rw.ame === 1`) === true);
check("플랜 하루 분량 보상에 자수정 1", E(`planDayRw().ame`) === 1);

out("[10] 지하 문서고");
check("서류함은 깊을수록 단단함 (10m마다)", E(`vaultChestHp(100) > vaultChestHp(50) && vaultChestHp(50) > vaultChestHp(0)`) === true);
check("이정표 500·2000·4500·8000m", E(`[500,2000,4500,8000].every(m => vaultMileK(m)) && !vaultMileK(1000) && vaultNextMile(600) === 2000`) === true);
E(`S.vault.best = 0; S.silver = 0; S.ame = 0; S.stamp = 0; 0`);
const run1 = { n: 0, gold: 0, st: 0, depth: 0 };
E(`window.__r = { n: 0, gold: 0, st: 0, depth: 0 }; for (let m = 10; m <= 5000; m += 10) vaultReach(m, window.__r); 0`);
const r1 = JSON.parse(E(`JSON.stringify({ r: window.__r, sv: S.silver, ame: S.ame, st: S.stamp, best: S.vault.best })`));
check("5000m 처음: 이정표 은괴 3 + 기록 은괴 2×5, 자수정(이정표 3번째 1 + 5000m 기록 3)", r1.sv === 3 + 10 && r1.ame === 1 + 3 && r1.best === 5000, JSON.stringify(r1));
E(`window.__r = { n: 0, gold: 0, st: 0, depth: 0 }; for (let m = 10; m <= 5000; m += 10) vaultReach(m, window.__r); 0`);
const r2 = JSON.parse(E(`JSON.stringify({ sv: S.silver, ame: S.ame })`));
check("같은 깊이 두 번째: 기록 보상 없이 이정표만", r2.sv - r1.sv === 3 && r2.ame - r1.ame === 1, JSON.stringify(r2));
const dry = JSON.parse(E(`JSON.stringify((() => { const g = S.gold, v = S.silver; const r = vaultSimRun(true); return { depth: r.depth, one: r.one, same: S.gold === g && S.silver === v }; })())`));
check("미리 계산(dry)은 재화를 바꾸지 않음", dry.same === true && dry.depth > 0, JSON.stringify(dry));
// 실제 판: 한 방이면 +1초 (최대 30초)
E(`rollDay(); S.day.vaultUsed = 0; startVault(); 0`);
run(300);
let secs = 0; for (let i = 0; i < 600 && E(`mode`) === "vault"; i++) { run(500); secs += 0.5; }
const vr = JSON.parse(E(`JSON.stringify({ d: vaultRun.depth, one: vaultRun.one, n: vaultRun.n })`));
check("한 방에 부수면 시간이 늘어 30초보다 오래 내려감", secs > 32 && vr.one > 10, `${secs}초 · 한 방 ${vr.one}`);
check("한 방이 이어져도 한 판이 너무 길지 않음 (2분 안에 끝남)", E(`mode`) === "tower" && secs <= 120, `${secs}초 · ${vr.d}m · 한 방 ${vr.one}`);

out("[11] 찌르기 고도화 (영업 마무리)");
E(`S.rank = 2; S.jobs = ["sales"]; S.job = "sales"; jskKey = null; renderJobSkills(); window.__k = {}; const _ja = jvAdd; jvAdd = function (k, o) { window.__k[k] = (window.__k[k] || 0) + 1; return _ja(k, o); }; 0`);
E(`window.__mv0 = fHero.mv; fHero.mv = "lunge"; warriorFx(MON_X - 10, GROUND - 60, false); 0`);
const k1 = JSON.parse(E(`JSON.stringify(window.__k)`));
check("관통 검기(v40) + 꽂힘·소닉붐·관통 뿜음·두 겹 초승달", k1.kpierce >= 1 && k1.tburst >= 1 && k1.tboom >= 1 && k1.texit >= 1 && k1.kwave >= 2, JSON.stringify(k1));
E(`window.__k = {}; fHero.mv = "jab"; warriorFx(MON_X - 10, GROUND - 60, false); 0`);
const k2 = JSON.parse(E(`JSON.stringify(window.__k)`));
check("터치 찌르기: 작은 꽂힘만 (소닉붐 없음)", k2.tburst >= 1 && !k2.tboom && !k2.texit, JSON.stringify(k2));
E(`fHero.mv = window.__mv0; 0`);   // 시험으로 바꾼 기술 이름을 되돌림 (빈 이름이면 다음 프레임 FEEL_MOVES[""] 오류)
run(1500);

out(`  통과 ${ok.length} · 실패 ${bad.length}` + (bad.length ? "  → " + bad.join(" / ") : ""));
out("errors", errors.length ? errors.slice(0, 4) : "none");
