// 꾸준한 플레이어 시뮬레이션 — 실제 게임 코드(보상·구매·퇴사·승진 함수)를 그대로 부르고, 전투만 계산식으로 빨리 감음
// 사용: TZ=Asia/Seoul DAYS=150 ./hrun.sh sim_bot.js yageun-knight.html [save.json]
// 환경: CH(하루 장 수) STUDY(하루 공부 분) MEM(하루 암송 통과) ACT(접속마다 켜 둔 분) SESS(접속 시각들) OUT(결과 json)
const P = {
  DAYS: +(process.env.DAYS || 150), CH: +(process.env.CH || 3.3), STUDY: +(process.env.STUDY || 30), MEM: +(process.env.MEM || 8),
  ACT: +(process.env.ACT || 6), SESS: (process.env.SESS || "8,12.5,21").split(",").map(Number), NOTE: +(process.env.NOTE || 1),
  VAULT: +(process.env.VAULT || 1), PLAN: process.env.PLAN || "y1", OUT: process.env.OUT || "", ONMUL: +(process.env.ONMUL || 1.15),
  RET: +(process.env.RET || 1.0), RF: +(process.env.RF || 0.03), QUIET: +(process.env.QUIET || 0), JOBS: (process.env.JOBS || "sales,plan,dev,hr,audit").split(","),
};
run(800);
for (let i = 0; i < 8; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); if ($("back") && !$("back").hidden && $("backGo")) $("backGo").click(); run(200); }
E(`window.__P = ${JSON.stringify(P)}; 0`);
if (process.env.BAL) { E(`(() => { const o = ${process.env.BAL}; for (const k in o) BAL[k] = (o[k] && typeof o[k] === "object" && !Array.isArray(o[k])) ? Object.assign({}, BAL[k], o[k]) : o[k]; if (typeof hpReset === "function") hpReset(); WITEMS.forEach(it => { if (it.set === "chair" && it.cost) it.cost.ore = BAL.chairOre; }); if (typeof wtabBuild === "function") wtabBuild(); if (typeof ward43Costs === "function") ward43Costs(); })(); 0`); }
E(String.raw`
window.__bot = {};
(function (B) {
  const P = window.__P;
  B.led = {};                                                   // 재화 원장: 들어온 것
  const LED = ["gold", "stamp", "manna", "ore", "silver", "ame"];
  B.snap = () => LED.reduce((o, k) => (o[k] = +S[k] || 0, o), {});
  B.addLed = (src, a, b) => { const L = B.led[src] || (B.led[src] = {}); LED.forEach(k => { const d = (+b[k] || 0) - (+a[k] || 0); if (d > 0 && k !== "gold") L[k] = (L[k] || 0) + d; }); };
  B.track = (src, fn) => { const a = B.snap(); let r; try { r = fn(); } catch (e) { B.err = (B.err || 0) + 1; B.lastErr = String(e && e.stack || e).slice(0, 300); } B.addLed(src, a, B.snap()); return r; };
  // 온라인 전투 근사: simulateOffline과 같은 규칙 + 처치 대기·층 이동·보스 등장 시간 + 회장 보스 도장 + 황금 몹
  B.simOn = function (sec) {
    const st = stats(), dps = st.dps * P.ONMUL; if (!(dps > 0) || !isFinite(dps)) return null;
    const gm = goldMult(); let gold = 0, bosses = 0, stamps = 0, f = S.floor, k = S.k, guard = 0, wall = false, kills = 0, normals = 0;
    while (sec > 0 && guard++ < 400000) {
      const kind = bossKind(f, k), hp = hpBase(f) * HP_MUL[kind] / (kind ? st.bossBonus : 1), t = hp / dps;
      if (TIME_LIMIT[kind] && t > bossTimeOf(kind)) {
        const g = f - 1; if (g < 1) break;
        const cyc = (4 * hpBase(g) + 2 * hpBase(g) / st.bossBonus) / dps + 5 * 0.45 + 1.5;
        const n = Math.floor(sec / cyc); gold += n * goldBase(g) * gm; bosses += n; normals += 4 * n; kills += 5 * n;
        f = g; k = 1; S.auto = false; wall = true; sec = 0; break;
      }
      const cost = t + (kind >= 2 ? 0.65 + (kind === 3 ? 1.84 : 1.36) : 0.45) + (k === 5 ? 1.5 : 0);
      if (cost > sec) break;
      sec -= cost; kills++; if (!kind) normals++;
      if (kind) { gold += goldBase(f) * GOLD_MUL[kind] * gm; bosses++; if (kind === 3) stamps += 3 + Math.floor(f / 100) * 2; }
      k++; if (k > 5) { k = 1; f++; }
    }
    const gk = S.bestFloor >= 20 ? normals * 0.015 : 0;          // 황금 몹: 일반 몹의 1.5% · 도장 1 + 보스 월급 10배
    gold += gk * goldBase(Math.max(1, f)) * gm * 10; stamps += Math.floor(gk + Math.random());
    if (petLv("squirrel")) stamps += Math.floor(bosses * (2 + 0.5 * petLv("squirrel")) / 100 + Math.random());
    gold *= 1;
    S.gold += gold; jarAdd(gold); S.floor = f; S.k = k; S.maxFloor = Math.max(S.maxFloor, f); S.bestFloor = Math.max(S.bestFloor, f);
    S.stamp += stamps; rollDay(); S.day.boss = (S.day.boss || 0) + bosses; S.bossKills = (S.bossKills || 0) + bosses; S.totalKills = (S.totalKills || 0) + kills;
    return { gold, bosses, f, wall, stamps };
  };
  // 무기·커피 자동 강화 (autoUpgradeTick과 같은 규칙) + 막힌 관문은 재료로 열기
  B.buy = function () {
    let n = 0;
    for (let guard = 0; guard < 4000; guard++) {
      let wc = weaponStepCost();
      if (wc == null) { if (!B.gate()) break; wc = weaponStepCost(); if (wc == null) break; }
      const cc = S.coffee < 30 ? coffeeCost(S.coffee) : Infinity, useW = wc <= cc, c = useW ? wc : cc;
      if (!isFinite(c) || S.gold < c) break;
      if (useW) weaponStep(); else { S.gold -= c; S.coffee++; }
      n++;
    }
    return n;
  };
  B.gate = function () {                                         // 다음 무기가 잠겼으면 재료로 열어 봄 (예전: 전설 해금 · 새: 등급 관문)
    try {
      if (typeof weaponUnlockTry === "function") { let ok = false; for (let i = 0; i < 3; i++) { const nx = wUnl() + 1; if (nx >= WEAPONS.length || nx > S.wi + 2) break; if (!B.track("gate", () => weaponUnlockTry(nx, true))) break; ok = true; } return ok || !wLocked(S.wi + 1); }
      if (typeof legUnlockTry === "function") { const k = S.wi + 1 - LEG_START; if (k < 0 || k >= 10) return false; const q = legReq(k); if (S.silver < q.silver || S.ame < q.ame) return false; S.silver -= q.silver; S.ame -= q.ame; S.legUnlock[k] = true; B.led.gate_spend = B.led.gate_spend || {}; B.led.gate_spend.silver = (B.led.gate_spend.silver || 0) + q.silver; B.led.gate_spend.ame = (B.led.gate_spend.ame || 0) + q.ame; return true; }
    } catch (e) { B.err = (B.err || 0) + 1; B.lastErr = String(e).slice(0, 200); }
    return false;
  };
  B.pick = function (budget) { let n = 0; const mx = typeof BAL !== "undefined" ? BAL.pickMax : 1e9; while (n < 200 && S.pick < mx && pickCost(S.pick) <= budget && S.gold >= pickCost(S.pick)) { budget -= pickCost(S.pick); S.gold -= pickCost(S.pick); S.pick++; n++; } return n; };
  // 광석·은괴·만나 옷장 탐욕 구매: 점수 = ln(피해) + 0.7 ln(월급) + 0.3 ln(도장 배율) 오름 ÷ 비용(광석 환산)
  B.score = function () { const st = stats(); return Math.log(Math.max(1e-9, st.dps)) + 0.7 * Math.log(Math.max(1e-9, goldMult())) + 0.3 * Math.log(Math.max(1e-9, stampMult())) + 0.2 * Math.log(Math.max(1e-9, oreMult())); };
  B.reserve = function () {                                       // 다음 무기 등급 관문에 쓸 재료는 남겨 둠
    if (typeof wUnlockCost !== "function") return {};
    const nx = wUnl() + 1; if (nx >= WEAPONS.length) return {};
    return Object.assign({}, wUnlockCost(nx));
  };
  B.wardSpend = function () {
    const W = wardState(); let n = 0; const RS = B.reserve();
    const free = k => (+S[k] || 0) - (+RS[k] || 0);
    for (let guard = 0; guard < 300; guard++) {
      const base = B.score(), keep = JSON.stringify({ w: S.ward, ore: S.ore, silver: S.silver, manna: S.manna, ame: S.ame, ch: S.charms });
      const restore = () => { const o = JSON.parse(keep); S.ward = o.w; S.ore = o.ore; S.silver = o.silver; S.manna = o.manna; S.ame = o.ame; S.charms = o.ch; wardDirty++; };
      let best = null, bestV = 0;
      const tryOp = (label, costOre, fn) => {
        if (!(costOre > 0)) return; let ok = false; try { ok = fn(); } catch (e) { ok = false; }
        if (ok) { wardDirty++; const v = (B.score() - base) / costOre; if (v > bestV) { bestV = v; best = { label, fn }; } }
        restore();
      };
      WITEMS.forEach(it => {
        const own = S.ward.own[it.id];
        if (own == null && it.cost && Object.keys(it.cost).every(k => free(k) >= it.cost[k])) {
          let oreEq = 0; for (const k in it.cost) oreEq += it.cost[k] * ({ ore: 1, silver: 40, manna: 3, ame: 400 }[k] || 1);
          tryOp("buy " + it.id, oreEq || 1, () => { const W2 = wardState(); for (const k in it.cost) S[k] -= it.cost[k]; W2.own[it.id] = 0; W2.eq[it.slot] = it.id; return true; });
        }
        else if (own != null && it.slot !== "title" && own < WENH_MAX) {
          const c = wardEnhCost(it, own); let afford = true, oreEq = 0;
          for (const k in c) { if (free(k) < c[k]) afford = false; oreEq += c[k] * ({ ore: 1, silver: 40, manna: 3, ame: 400 }[k] || 1); }
          if (afford) tryOp("enh " + it.id, oreEq, () => { const W2 = wardState(); for (const k in c) S[k] -= c[k]; W2.own[it.id] = own + 1; return true; });
        }
      });
      // 같은 부위에서 더 좋은 옷으로 갈아입기
      CHARMS.forEach(c => { const pr = typeof charmPrice === "function" ? charmPrice(c.id) : CHARM_PRICE; if (free("ore") >= pr) tryOp("charm " + c.id, pr, () => { S.ore -= pr; S.charms[c.id]++; return true; }); });
      if (!best || bestV <= 0) break;
      best.fn(); wardDirty++; n++;
      B.equipBest();
    }
    return n;
  };
  B.equipBest = function () {                                    // 부위마다 점수가 가장 높은 옷을 입힘
    const W = wardState();
    WSLOT.forEach(sl => {
      const ids = Object.keys(W.own).filter(id => WIT[id] && WIT[id].slot === sl.id); if (ids.length < 2) return;
      let best = W.eq[sl.id], bv = -Infinity;
      ids.forEach(id => { W.eq[sl.id] = id; wardDirty++; const v = B.score(); if (v > bv) { bv = v; best = id; } });
      W.eq[sl.id] = best; wardDirty++;
    });
  };
  // 하루 습관
  B.read = function (nch) {                                     // 플랜 순서대로 n장 · 읽은 시간도 함께 (장마다 필요한 시간)
    rollDay();
    let sec = 0; const todo = [];
    for (let i = 0; i < nch; i++) {
      let b, c; try { const st = planStats(); const g = st && (st.firstToday >= 0 ? st.firstToday : st.firstBehind >= 0 ? st.firstBehind : st.firstAhead); if (g != null && g >= 0) { const bc = gBC(g); b = bc[0]; c = bc[1]; } } catch (e) {}
      if (b == null) { const n = nextUnread(); b = n.b; c = n.c; }
      if (todo.some(x => x[0] === b && x[1] === c) || isToday(b, c)) { const n = nextUnread(); b = n.b; c = n.c; }
      sec += needSec(b, c) + 5; S.bible.timer = Date.now() - sec * 1000;
      toggleChapter(b, c); todo.push([b, c]); S.bible.pos = { b, c };
    }
    if (S.bible.timer) readTimerToggle();
    try { planDailyCheck(); } catch (e) {}
  };
  B.study = function (min) { rollDay(); const St = S.study; St.running = true; St.lastConfirm = Date.now() - min * 60000; studyConfirm(); studyStop(); };
  B.mem = function (n) { rollDay(); try { memTryUnlock(); } catch (e) {} let k = 0; for (const v of memQueue()) { if (k >= n) break; memPass(v); k++; } return k; };
  B.claims = function () {
    rollDay();
    DAILY.forEach(d => { if (!S.day.claimed[d.id] && (S.day[d.stat] || 0) >= d.goal) { S.day.claimed[d.id] = 1; grant(d.rw); } });
    if (!S.day.claimed.all && DAILY.every(d => S.day.claimed[d.id])) { S.day.claimed.all = 1; grant({ haste: 1, gold2: 1, rage: 1, manna: 20 }); }
    const val = a => a.id === "planf" ? (S.planFin || 0) : a.id === "att" ? attTotal() : a.id === "floor" ? S.bestFloor : a.id === "chap" ? S.bible.total : a.id === "study" ? S.study.total / 60 : a.id === "rstreak" ? S.bible.best : a.id === "sstreak" ? S.study.best : a.id === "memm" ? memMastered() : S.retires;
    ACH.forEach(a => { for (let g = 0; g < 10; g++) { const i = S.ach[a.id] || 0; if (i >= a.tiers.length || val(a) < a.tiers[i]) break; S.ach[a.id] = i + 1; grant(a.rw(i)); } });
    try { weekGoalCheck(); } catch (e) {}
    try { if (typeof festClaimable === "function" && festClaimable() > 0) festClaimNow(); } catch (e) {}
    try { dblCheck(); } catch (e) {}
    try { while (jarReady()) jarOpen(); } catch (e) {}
    try { for (let i = 0; i < 3 && scrollState().n > 0 && scrollDay().u < SCROLL_DAY; i++) scrollUse(); } catch (e) {}
    try { wardTick(false); wardCollTick(false); } catch (e) {}
    for (let i = 0; i < 3 && canPromote(); i++) { promote(); const R = RANKS[rankIdx()]; if (R.job && rankIdx() < RANKS.length - 1) { const nx = P.JOBS.find(j => S.jobs.indexOf(j) < 0 && JOBS.some(x => x.id === j)); if (nx) { S.jobs.push(nx); if (!S.job) S.job = nx; } } }
    if (rankIdx() === RANKS.length - 1) JOBS.forEach(j => { if (S.jobs.indexOf(j.id) < 0) S.jobs.push(j.id); });
  };
  B.vault = function () {                                         // 지하 문서고 하루 입장권만큼
    rollDay(); let runs = 0;
    for (let i = 0; i < 6 && S.day.vaultUsed < vaultTickets(); i++) {
      if (typeof vaultSimRun === "function") { B.track("vault", () => vaultSimRun()); }
      else B.track("vault", () => {                                // 예전 문서고: 30초, 서류함 hp = hpBase(maxFloor)×1.5, 처치마다 40m · 월급 · 30% 도장, 1000m마다 도장 2
        const st = stats(), f = Math.max(1, S.maxFloor), hp = hpBase(f) * 1.5, t = hp / (st.dps * P.ONMUL) + 0.45; let sec = 30, kills = 0, depth = 0, st0 = 0;
        while (sec >= t && kills < 400) { sec -= t; kills++; depth += 40; S.gold += goldBase(f) * 0.6 * goldMult(); if (Math.random() < 0.3) S.stamp++; if (depth % 1000 === 0) S.stamp += 2; }
        S.day.depth = Math.max(S.day.depth || 0, depth); S.day.vaultUsed++;
      });
      runs++;
    }
    return runs;
  };
  B.treTier = function () {
    if (typeof treTierTry !== "function") return 0; let n = 0;
    for (let g = 0; g < 20; g++) {
      const RS = B.reserve(), cand = TREASURES.filter(t => treGateAt(t)).sort((a, b) => treTierAme(treGateAt(a)) - treTierAme(treGateAt(b)))[0];
      if (!cand) break; const need = treTierAme(treGateAt(cand));
      if ((S.ame || 0) < need) break;
      if ((S.ame || 0) - (+RS.ame || 0) < need && need > 0.1 * (+RS.ame || 0)) break;     // 관문 몫을 남기되, 관문의 10% 이하인 싼 차수는 그냥 엶
      B.track("tre_tier", () => treTierTry(cand, true)); n++;
    }
    return n;
  };
  B.spend = function () {
    B.gate();
    B.treTier();
    B.track("spend_tre", () => spendAll("tre"));
    B.track("spend_pet", () => spendAll("pet"));
    B.wardSpend();
  };
  B.retireMaybe = function (stuck) {
    const g = retireGain(); if (g <= 0) return false;
    const r = retireRatio();
    B.stuckN = stuck ? (B.stuckN || 0) + 1 : 0;
    if (r >= 2 * P.RET || (stuck && r >= 0.5 * P.RET) || (B.stuckN >= 6 && r >= (P.RF || 0.03))) {
      B.stuckN = 0;
      const promo = S.manna >= 300 + 400 && r >= 0.5;          // 만나가 넉넉하면 영전 퇴사
      B.track("retire", () => doRetire(promo)); B.retires = (B.retires || 0) + 1; return true;
    }
    return false;
  };
  B.state = function () {
    let gname = ""; try { gname = typeof gradeOf === "function" ? WGRADES[gradeOf(S.wi)].n : (WEAPONS[S.wi].leg ? "전설" : "일반"); } catch (e) {}
    return { wgate: typeof wUnl === "function" ? gradeOf(wUnl()) : 0, wunl: typeof wUnl === "function" ? wUnl() : 0, vbest: (S.vault && S.vault.best) || 0, vday: S.day ? S.day.depth : 0, tt: Object.assign({}, S.treTier || {}), f: S.floor, mf: S.maxFloor, best: S.bestFloor, wi: S.wi, wl: S.wl, gname, rank: rankIdx(), ret: S.retires, stamp: Math.round(S.stamp), ore: Math.round(S.ore), silver: S.silver, ame: S.ame, manna: Math.round(S.manna),
      dps: +Math.log10(Math.max(1, stats().dps)).toFixed(2), gm: +Math.log10(Math.max(1, goldMult())).toFixed(2), sm: +stampMult().toFixed(2),
      tre: Object.assign({}, S.tre), pets: Object.assign({}, S.pets), ward: Object.keys(S.ward.own || {}).length, pick: S.pick, chap: S.bible.total, studyH: +(S.study.total / 60).toFixed(1), memm: memMastered(), jobs: S.jobs.slice() };
  };
})(window.__bot);
0`);
const DAY0 = (() => { const d = new Date(wall); d.setHours(0, 0, 0, 0); return d.getTime(); })();
let leaveT = wall;
const log = [];
E(`try { if (!S.plan && "${P.PLAN}") planStart("${P.PLAN}"); } catch (e) {} 0`);
for (let i = 0; i < 6; i++) { if ($("celeb") && !$("celeb").hidden) $("celeb").click(); run(100); }
let memDebt = 0, chDebt = 0;
for (let d = 0; d < P.DAYS; d++) {
  for (let si = 0; si < P.SESS.length; si++) {
    const t = DAY0 + d * 864e5 + P.SESS[si] * 3600e3;
    if (t <= wall) continue;
    const dt = t - wall; wall = t; now += dt;
    E(`(() => { rollDay(); const B = window.__bot; B.track("away", () => { awaySettle(${leaveT}, true); const a = S.away; if (a) { S.gold += a.gold || 0; const gift = giftOf(a.miss || 0); if (gift) grant(gift); S.away = null; } if (!attOn(dayKey())) attStamp(); }); S.auto = true; })(); 0`);
    // 하루 습관: 아침 = 암송, 점심 = 공부, 저녁 = 말씀·묵상·문서고
    if (si === 0) { memDebt += P.MEM; const n = Math.floor(memDebt); memDebt -= n; E(`window.__bot.track("mem", () => window.__bot.mem(${n})); 0`); }
    if (si === Math.min(1, P.SESS.length - 1) && P.STUDY > 0) E(`window.__bot.track("study", () => window.__bot.study(${P.STUDY})); 0`);
    if (si === P.SESS.length - 1) {
      chDebt += P.CH; const n = Math.floor(chDebt); chDebt -= n;
      if (n > 0) E(`window.__bot.track("bible", () => window.__bot.read(${n})); 0`);
      if (P.NOTE) E(`window.__bot.track("note", () => saveNote("오늘 말씀으로 하루를 돌아봅니다 ${d}")); 0`);
      if (P.VAULT) E(`window.__bot.vault(); 0`);
    }
    E(`window.__bot.track("claims", () => window.__bot.claims()); 0`);
    // 켜 둔 동안: 30초씩 싸우고 사기
    const f0 = E(`S.maxFloor`);
    for (let m = 0; m < P.ACT * 2; m++) {
      E(`(() => { const B = window.__bot; const g0 = S.gold; B.simOn(30); B.buy(); })(); 0`);
      if (m % 4 === 3) E(`(() => { const B = window.__bot; S.auto = true; })(); 0`);
    }
    E(`(() => { const B = window.__bot; const g = S.gold; B.pick(g * 0.05); B.spend(); B.buy(); S.auto = true; })(); 0`);
    const stuck = E(`S.maxFloor`) <= f0 + 1;
    E(`(() => { const B = window.__bot; if (B.retireMaybe(${stuck})) { B.buy(); B.spend(); B.buy(); } })(); 0`);
    E(`window.__bot.track("claims", () => window.__bot.claims()); 0`);
    leaveT = wall;
    wall += 60e3; now += 60e3;
  }
  const s = JSON.parse(E(`JSON.stringify(window.__bot.state())`));
  s.d = d + 1; log.push(s);
  if (!P.QUIET && ((d + 1) % 7 === 0 || d < 7 || d + 1 === P.DAYS)) out(`d${String(d + 1).padStart(3)} 층 ${String(s.best).padStart(4)} (이번 ${String(s.mf).padStart(4)}) 무기 ${String(s.wi).padStart(2)}+${s.wl} ${s.gname} 직급 ${s.rank} 퇴사 ${String(s.ret).padStart(3)} 도장 ${String(s.stamp).padStart(8)} 광석 ${String(s.ore).padStart(6)} 은 ${String(s.silver).padStart(4)} 자 ${String(s.ame).padStart(4)} 만나 ${String(s.manna).padStart(5)} dps 1e${s.dps} 장 ${s.chap} 공부 ${s.studyH}h 옷 ${s.ward} 곡 ${s.pick}`);
}
const led = JSON.parse(E(`JSON.stringify(window.__bot.led)`));
out("원장(들어온 양):", JSON.stringify(led));
out("bot errors", E(`window.__bot.err || 0`), E(`window.__bot.lastErr || ""`));
if (P.OUT) require("fs").writeFileSync(P.OUT, JSON.stringify({ P, log, led }));
out("errors", errors.length ? errors.slice(0, 4) : "none");
