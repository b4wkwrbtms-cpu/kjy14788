/* ===================== 말씀 읽기 플랜 =====================
   통독 일정표를 고르면 날마다 읽을 장이 정해진다. 장마다 글자 수로 나눠 하루 읽는 시간이 비슷하다.
   말씀 탭 맨 위 카드에서 오늘 분량을 바로 열어 읽고, 출근부 달력에서 날짜별 계획과 완료(보라 책갈피)를 본다.
   플랜 진도는 통독 체크와 따로 남는다 (같은 장을 두 번 읽어도 한 번). rollDay·merge 에서 부르므로 함수 선언과 var 만 씀. */
var CHW_STR = "1s1c1n1l101913151h191b190y1f16151n242h1a1w1l194d1r27341h212q3t22161y1o27291x1g1a322n2g281u1u271o1z1o121j1x221k1r1l2a2a260r341m281t2i151u1p1f1z1u21121q1t152f2o1z0z2j1o2f1s201f1m241o110z10201i1u26211e1h2f0l3m361v27151l231y1b1z2n193a311v2o1m2p2l201r4k1p1l1x2g0y1k2w293a0v2i1j1z292u211n123f1d1n24172o2k22192110382k283s291n261f2e1i272h1g1j1o1j1k1j1h1i1q1y1l1m1f1l1k4s251q2e38210p1h1u191k18212c2l213c1o1421192e0m1l1q2a0q2c371f2t2c1r231u23382c2g42173216201s1m2s0y2d2f3b1w1p1u1c1l1y2x1g1r0z1q1b1a2d2316231n442m1t41231u38191x251n3j260y2013260v1s2831121n1n23140z1f1z2e2s2o2r1u2c2t3n251y2d29233q3s231t1c233b571y1x392l2p2c272e1m3h1u3m283t1m24213b2i2i1x2d2z2x1i1k1u242f1f322y2p1m1p1k391d201v2d13281m3n251d2d0x2j2k0y0x1r2720111i0n2a1j1j1f1f1t1x1w2c171k101a113i1s18221h1c151m161911142o0z2x1i151p252b1m0j212m261q2o1r2r271r0u28151s1b1r212i1m2a0x1o2a1o1i1h2n1l3f1p212m2j1j1r161612140w1f26071k10190x161a130w1i150v1217101i100p0u18181f180q18080j0z12131e1w101f1o0r1f141l1b0x1b150a0i0d0f0n0g0r0e0y0z0c0e0c0f0a0k0t2d0o0g0l1h0b0g0x0h0v0k0i0m1b0m0u0x1i0l1n0w0r130o0r0d1a0v0j0e0k0v110x0h0f0c150n0o0k0y0l0d0m0j0i0p0y0c1v1s0a190x13140h0j0v360r0v0r0c0r0m0k0v0b0w2c0t0q0n09100j0m0i0g0i090g170y1j1s201n0m1c0d0g0g0c0b0q0q031775080b0c070c090a0a090c0b060s05040u120h0h140p0k0e0p0t0w0g0s0i0d081h0t1g13101h101i0r1c1e19141l1g1j1b131e1d1d191i1i1919181b181m1a0x1s1b0z1b0s1j171f0y0n0v0t0x0n0x130t0q0y22191f0h2a0y1l1h1j27150e1c240l12120k1s0i111m191f0y1e0z261u2m0v151p170q1t2s1j0n24251q1y2c240y181p2a0z1y17151b100x1k1d1l1q0z0y1h0x23261a2w27292b272h1u211p1x1d1v1x1t1q201r1a1k1827390u2o1y1u1b2l1t3b3d231v1m2i1h2f171n1f1x122w0g200j31343l4i241y22291f0v1q0o1z101d141x1g0z1d1p1x1v1x0i4d1u2c0s422723361v191o261x1n1r1l2p2r2b102y241r273a1k16222d1x1w1p2c1f3s2k3c2j2e28212m1j3n0y0v1o0d19110n140z1c140x0u140p1b2d1f13140z191p1017121b1q1a0m0n0v15120w1712181g120y1c151i191c161m151q1m0t0q0y0s0x0v1o1c0z19130q1l1h1o1k0h191e101d2o271l1w242c1q2t301o201o1m1y1s1t2s26262j2k473f12281s1o2129301z2230301w2o21402a153m2g2b2h2c2y343c3n2i373h25201r1z1w2d2g2f1v3h2s2k2s1b202u2o3s2s3k2a262z2w2a211o231x2j2o1w1v1o2m1m212c0w3i222g2m1m1h321j2a2a271p2f272h1v271l1u212d1v231n1o1h1j1h1n2c201b2813101f231j1x131c1e0w192m0u1u1t1w1m0s2c3b161p1312161f121f1g12181y1s0z1b1m1u1q1a0z1c1b151p1j191r1o1b1c1u1d1b120q1f0v12160v11101b0s0x0t1c1e171h0z16130t0y190x1912140v151p0z1q232j1u1i1h1j0z12171p1l1i170w1c1k190p211l1g1c0t0v1v1b201o0v0y15170u1b0s1e17171l0m1b1b1w1j121s1e";   // 장마다 글자 수 ÷ 25 (36진수 두 자리)
var CHW = null, BOOK_OFF = null;
var PLANS = [
  { id: "y1", n: "1년 1독", sub: "창세기부터 차례대로", days: 365, tracks: [[0, 66]] },
  { id: "y1x", n: "1년 1독 · 구약+신약", sub: "날마다 구약과 신약을 함께", days: 365, tracks: [[0, 39], [39, 66]] },
  { id: "h6", n: "6개월 1독", sub: "조금 빠르게 차례대로", days: 183, tracks: [[0, 66]] },
  { id: "nt90", n: "신약 90일", sub: "마태복음부터 요한계시록까지", days: 90, tracks: [[39, 66]] },
  { id: "y2", n: "2년 1독", sub: "하루 조금씩 천천히", days: 730, tracks: [[0, 66]] },
  /* 진짜 도전: 보상도 몇 배 */
  { id: "m3", n: "3달 1독", sub: "석 달 만에 성경 한 번", days: 90, tracks: [[0, 66]], hard: 2 },
  { id: "m2", n: "2달 1독", sub: "두 달 만에 성경 한 번", days: 60, tracks: [[0, 66]], hard: 3 },
  { id: "m1", n: "1달 1독", sub: "한 달 만에 성경 한 번 · 가장 어려움", days: 30, tracks: [[0, 66]], hard: 5 },
];
var PLAN_MILES = [[0.1, { stamp: 10, haste: 1 }], [0.25, { ore: 500, gold2: 1 }], [0.5, { silver: 5, rage: 1 }], [0.75, { ame: 3, stamp: 30 }], [1, { ame: 10, stamp: 100, manna: 1000 }]];
var PLAN_DAY_RW = { manna: 20, stamp: 2 };
function planHard() { const d = S.plan && planDef(S.plan.id); return (d && d.hard) || 1; }
function planDayRw() { const m = planHard(); return { manna: PLAN_DAY_RW.manna * m, stamp: PLAN_DAY_RW.stamp * m }; }
function minText(m) { m = Math.round(m); return m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ""}` : `${m}분`; }
var READ_CPM = 450;   // 1분에 읽는 글자 수 (어림)
var planCache = { k: "" }, planMemo = { k: "" }, planVer = 0;
var planUI = { pick: "y1", pre: null, quit: 0 };

function chw() {
  if (!CHW) {
    CHW = []; for (let i = 0; i < TOTAL_CH; i++) CHW.push(parseInt(CHW_STR.substr(i * 2, 2), 36) || 1);
    BOOK_OFF = []; let o = 0; for (let b = 0; b < 66; b++) { BOOK_OFF.push(o); o += BOOKS[b][1]; }
  }
  return CHW;
}
function gIdx(b, c) { chw(); return BOOK_OFF[b] + c; }
function gBC(g) { chw(); let b = 65; while (b > 0 && BOOK_OFF[b] > g) b--; return [b, g - BOOK_OFF[b]]; }
/* 1189장 켜짐/꺼짐을 16진수 글자 하나에 4장씩 */
function hexNew() { return "0".repeat(Math.ceil(TOTAL_CH / 4)); }
function hexGet(h, i) { return (parseInt((h || "")[i >> 2] || "0", 16) >> (i & 3)) & 1; }
function hexSet(h, i, v) { const k = i >> 2, n0 = parseInt(h[k] || "0", 16), n = v ? n0 | (1 << (i & 3)) : n0 & ~(1 << (i & 3)); return h.slice(0, k) + n.toString(16) + h.slice(k + 1); }
function planDef(id) { return PLANS.find(p => p.id === id) || null; }
function planMerge(p) {
  if (!p || typeof p !== "object" || !planDef(p.id) || typeof p.start !== "string" || !/^\d{4}-\d\d-\d\d$/.test(p.start)) return null;
  const L = Math.ceil(TOTAL_CH / 4), fix = h => (typeof h === "string" && /^[0-9a-f]*$/.test(h)) ? h.padEnd(L, "0").slice(0, L) : "0".repeat(L);
  return { id: p.id, start: p.start, pre: fix(p.pre), done: fix(p.done), got: +p.got || 0, streak: +p.streak || 0, best: +p.best || 0, last: p.last || "", fin: p.fin || "", sPrev: Array.isArray(p.sPrev) ? p.sPrev : null };
}
function mdShort(k, withYear) { const d = keyDate(k), y = d.getFullYear(); return `${withYear && y !== new Date().getFullYear() ? y + "년 " : ""}${d.getMonth() + 1}월 ${d.getDate()}일`; }
/* 일정: 한 갈래(구약·신약 등)씩 글자 수 누적이 날짜 몫을 넘지 않게 앞에서부터 채움 */
function planSched() {
  const P = S.plan; if (!P) return null;
  const def = planDef(P.id); if (!def) return null;
  const key = P.id + "|" + P.pre;
  if (planCache.k === key) return planCache;
  const W = chw(), D = def.days, days = [], load = []; for (let d = 0; d < D; d++) { days.push([]); load.push(0); }
  let all = 0; def.tracks.forEach(([b0, b1]) => { for (let g = BOOK_OFF[b0], e = b1 < 66 ? BOOK_OFF[b1] : TOTAL_CH; g < e; g++) if (!hexGet(P.pre, g)) all += W[g]; });
  def.tracks.forEach(([b0, b1], ti) => {
    const gs = []; for (let g = BOOK_OFF[b0], e = b1 < 66 ? BOOK_OFF[b1] : TOTAL_CH; g < e; g++) if (!hexGet(P.pre, g)) gs.push(g);
    const N = gs.length; if (!N) return;
    let tot = 0; gs.forEach(g => tot += W[g]);
    if (ti > 0) {
      /* 두 번째 갈래(신약 등): 제자리 앞뒤 이틀 안에서 그날 분량이 가벼운 날로 (순서는 그대로) */
      let prev = 0, acc2 = 0; const avg = all / D;
      gs.forEach(g => {
        const w = W[g], ideal = Math.min(D - 1, Math.floor((acc2 + w / 2) / tot * D)), lo = Math.max(prev, ideal - 2), hi = Math.max(lo, Math.min(D - 1, ideal + 2));
        let best = lo, bc = Infinity;
        for (let d = lo; d <= hi; d++) { const c = Math.abs(load[d] + w - avg) + Math.abs(d - ideal) * avg * 0.12; if (c < bc) { bc = c; best = d; } }
        days[best].push(g); load[best] += w; prev = best; acc2 += w;
      });
      return;
    }
    let i = 0, acc = 0;
    for (let d = 0; d < D && i < N; d++) {
      const T = (d + 1) * tot / D; let took = 0;
      while (i < N) {
        const w = W[gs[i]];
        if (took) { if (N >= D && N - i <= D - d - 1) break; if (acc + w / 2 > T) break; }
        else if (N < D && acc + w / 2 > T) break;
        days[d].push(gs[i]); load[d] += w; acc += w; i++; took++;
      }
    }
    while (i < N) { days[D - 1].push(gs[i]); load[D - 1] += W[gs[i]]; i++; }
  });
  const dayOf = new Int16Array(TOTAL_CH).fill(-1), order = [];
  days.forEach((list, d) => list.forEach(g => { dayOf[g] = d; order.push(g); }));
  planCache = { k: key, def, D, days, dayOf, order, total: order.length };
  return planCache;
}
function planStats() {
  const P = S.plan; if (!P) return null;
  const sc = planSched(); if (!sc) return null;
  const today = dayKey(), key = sc.k + "|" + P.start + "|" + P.done + "|" + today;
  if (planMemo.k === key) return planMemo.v;
  const d = Math.max(0, dayDiff(P.start, today));
  let done = 0, behind = 0, ahead = 0, tLeft = 0, firstBehind = -1, firstToday = -1, firstAhead = -1;
  for (let dd = 0; dd < sc.D; dd++) sc.days[dd].forEach(g => {
    if (hexGet(P.done, g)) { done++; if (dd > d) ahead++; }
    else if (dd < d) { behind++; if (firstBehind < 0) firstBehind = g; }
    else if (dd === d) { tLeft++; if (firstToday < 0) firstToday = g; }
    else if (firstAhead < 0) firstAhead = g;
  });
  const v = { sc, d, done, total: sc.total, behind, ahead, tLeft, today: d < sc.D ? sc.days[d] : [], firstBehind, firstToday, firstAhead, over: d >= sc.D };
  planMemo = { k: key, v }; return v;
}
function planScale(rw, total, m) { const f = Math.min(1, total / TOTAL_CH) * (m || 1), o = {}; Object.keys(rw).forEach(k => { o[k] = ["haste", "gold2", "rage"].indexOf(k) >= 0 ? rw[k] : Math.max(1, Math.round(rw[k] * f)); }); return o; }
function planMin(list) { const W = chw(); return Math.max(1, Math.round(list.reduce((a, g) => a + W[g], 0) * 25 / READ_CPM)); }
/* [창세기 34, 35, 36] → "창세기 34–36장" */
function planRangeText(list) {
  const parts = []; let cur = null;
  (list || []).forEach(g => { const [b, c] = gBC(g); if (cur && cur.b === b && cur.c1 === c - 1) cur.c1 = c; else { cur = { b, c0: c, c1: c }; parts.push(cur); } });
  return parts.map(p => `${BOOKS[p.b][0]} ${p.c0 === p.c1 ? p.c0 + 1 : `${p.c0 + 1}–${p.c1 + 1}`}장`).join(", ");
}
function readHex() { let h = hexNew(); for (let b = 0; b < 66; b++) { const s = bits(b); for (let c = 0; c < s.length; c++) if (s[c] === "1") h = hexSet(h, gIdx(b, c), 1); } return h; }
function planPreview(def, preHex) {
  const W = chw(); let total = 0, w = 0;
  def.tracks.forEach(([b0, b1]) => { for (let g = BOOK_OFF[b0], e = b1 < 66 ? BOOK_OFF[b1] : TOTAL_CH; g < e; g++) if (!preHex || !hexGet(preHex, g)) { total++; w += W[g]; } });
  return { total, min: Math.max(1, Math.round(w * 25 / READ_CPM / def.days)) };
}
/* 읽고 체크할 때 (통독 체크와 따로 플랜에 남김) */
function planOnRead(b, c, entry) {
  const P = S.plan; if (!P || P.fin) return;
  const sc = planSched(); if (!sc) return;
  const g = gIdx(b, c); if (sc.dayOf[g] < 0 || hexGet(P.done, g)) return;
  P.done = hexSet(P.done, g, 1); if (entry) entry.plan = 1; planVer++;
  planAfterChange("read");
}
function planOnUndo(b, c) {
  const P = S.plan; if (!P || P.fin) return;
  const sc = planSched(); if (!sc) return;
  const g = gIdx(b, c); if (sc.dayOf[g] < 0) return;
  P.done = hexSet(P.done, g, 0); planVer++;
  const st = planStats();
  if (S.day && S.day.plan && st && st.tLeft > 0) {
    const drw = planDayRw(); S.day.plan = 0; S.manna = Math.max(0, S.manna - drw.manna); S.stamp = Math.max(0, S.stamp - drw.stamp);
    if (P.sPrev) { P.last = P.sPrev[0]; P.streak = P.sPrev[1]; }
  }
}
/* 오늘 분량 다 읽었는지, 이정표, 완주 */
function planAfterChange(why) {
  const P = S.plan; if (!P || P.fin) return;
  const st = planStats(); if (!st || !st.total) return;
  if (!st.over && st.today.length && !st.tLeft && S.day && !S.day.plan) {
    const drw = planDayRw(); S.day.plan = 1; grant(drw);
    P.sPrev = [P.last || "", P.streak || 0];
    P.streak = (P.last === yesterdayKey() ? P.streak || 0 : 0) + 1; P.last = dayKey(); P.best = Math.max(P.best || 0, P.streak);
    if (why === "read") celebrate({ ic: "bible", title: "오늘 말씀 완료!", sub: `${st.sc.def.n} ${st.d + 1}일차 · 플랜 연속 ${P.streak}일<br><span class="rws">${rwHTML(drw)}</span>`, tone: "manna", sound: "pass" });
    else toast(`오늘 말씀은 이미 읽어 두었어요 · ${rwText(drw).replace(/ (\d+)/g, " +$1")}`);
  }
  const pct = st.done / st.total;
  PLAN_MILES.forEach(([t, rw], i) => {
    if (pct + 1e-9 < t || (P.got & (1 << i))) return;
    P.got |= 1 << i; const r = planScale(rw, st.total, planHard()); grant(r);
    if (t < 1) celebrate({ ic: "trophy", title: `플랜 ${Math.round(t * 100)}% 읽음!`, sub: `${st.sc.def.n} · ${st.done}/${st.total}장<br><span class="rws">${rwHTML(r)}</span>`, tone: "gold", sound: "pass" });
  });
  if (st.done >= st.total && !P.fin) {
    P.fin = dayKey(); S.planFin = (S.planFin || 0) + 1; planVer++;
    S.planHist = (Array.isArray(S.planHist) ? S.planHist : []).concat([{ id: P.id, start: P.start, fin: P.fin, n: st.total }]).slice(-12);
    celebrate({ ic: "bible", title: "통독 완주!", sub: `${st.sc.def.n} · ${dayDiff(P.start, P.fin) + 1}일 동안 ${st.total}장<br><span class="rws">${rwHTML(planScale(PLAN_MILES[4][1], st.total, planHard()))}</span>`, tone: "rare", sound: "pass", ms: 3600 });
  }
}
/* 하루가 시작될 때 이미 미리 읽어 둔 분량이면 바로 완료 처리 */
function planDailyCheck() { const P = S.plan; if (!P || P.fin || !S.day || S.day.plan) return; const st = planStats(); if (st && !st.over && st.today.length && !st.tLeft) planAfterChange("check"); }
function planTodayLeft() { const st = S.plan && !S.plan.fin ? planStats() : null; return st && !st.over ? st.tLeft : 0; }
function planStart(id, pre) {
  const def = planDef(id); if (!def) return;
  S.plan = { id, start: dayKey(), pre: pre ? readHex() : hexNew(), done: hexNew(), got: 0, streak: 0, best: 0, last: "", fin: "", sPrev: null };
  planCache.k = ""; planVer++;
  const P = S.plan, sc = planSched();
  if (!sc || !sc.total) { S.plan = null; planCache.k = ""; toast("나눌 장이 없어요"); renderPlanCard(); return; }
  (S.bible.today || []).forEach(e => { const g = gIdx(e.b, e.c); if (sc.dayOf[g] >= 0 && !hexGet(P.done, g)) { P.done = hexSet(P.done, g, 1); e.plan = 1; } });
  planVer++; planUI.quit = 0;
  celebrate({ ic: "bible", title: "읽기 플랜 시작!", sub: `${def.n} · ${def.days}일 · 하루 약 ${minText(planPreview(def, P.pre).min)}<br>오늘: ${planRangeText(sc.days[0]) || "쉬어 가는 날"}`, tone: "manna", sound: "pass" });
  planAfterChange("start");
  renderPlanCard(); updateUI(true); save();
}
/* 리더 '다음 장': 플랜 순서대로 */
function planStep(b, c, dir) {
  const P = S.plan, sc = planSched(); if (!P || P.fin || !sc) return null;
  const i = sc.order.indexOf(gIdx(b, c)); if (i < 0) return null;
  const j = i + dir; return j >= 0 && j < sc.order.length ? gBC(sc.order[j]) : null;
}
function planReaderTag(b, c) {
  const P = S.plan, sc = planSched(); if (!P || P.fin || !sc) return "";
  const d = sc.dayOf[gIdx(b, c)]; if (d < 0) return "";
  const t = Math.max(0, dayDiff(P.start, dayKey()));
  return d === t ? ` · 플랜 ${d + 1}일차` : d < t ? ` · 밀린 분량 ${d + 1}일차` : ` · 미리 읽기 ${d + 1}일차`;
}
/* 출근부 달력: 그날 계획 / 출근 카드: 오늘 말씀 */
function planDayInfo(k) {
  const P = S.plan, sc = planSched(); if (!P || !sc) return "";
  const d = dayDiff(P.start, k); if (d < 0 || d >= sc.D) return "";
  const list = sc.days[d]; if (!list.length) return `<span class="hb pl"><i class="h-p"></i>계획 ${d + 1}일차 · 쉬어 가는 날</span>`;
  const left = list.filter(g => !hexGet(P.done, g)).length;
  return `<span class="hb pl"><i class="h-p"></i>계획 ${d + 1}일차 · ${planRangeText(list)}${!left ? " ✓" : k <= dayKey() ? ` · ${left}장 남음` : ""}</span>`;
}
function planTodayRow() {
  const P = S.plan; if (!P || P.fin) return "";
  const st = planStats(); if (!st || st.over || !st.today.length) return "";
  return `<div class="ba-pl"><span>오늘 말씀</span><b>${planRangeText(st.today)}${st.tLeft ? "" : " ✓"}</b><span class="pl-min">약 ${minText(planMin(st.today))}</span></div>`;
}
function planShort() { const P = S.plan; if (!P) return "없음"; const st = planStats(); if (!st) return "없음"; return P.fin ? `${st.sc.def.n} 완주` : `${st.sc.def.n} ${Math.floor(st.done / st.total * 100)}%`; }

/* ---------- 말씀 탭 맨 위 카드 ---------- */
function planGoBtn(g, label, ghost) { const [b, c] = gBC(g); return `<button type="button" class="buy ${ghost ? "ghost" : "manna"}" id="plGo" data-g="${g}"><span class="act">${label}</span><small>${BOOKS[b][0]} ${c + 1}장부터</small></button>`; }
function planChips(list, nextG) {
  let h = "", lastB = -1;
  list.forEach(g => {
    const [b, c] = gBC(g), chip = `<button type="button" class="pl-ch${hexGet(S.plan.done, g) ? " done" : g === nextG ? " next" : ""}" data-g="${g}" aria-label="${BOOKS[b][0]} ${c + 1}장">${c + 1}</button>`;
    if (b !== lastB) { h += `<span class="pl-nw"><span class="pl-bk">${BOOKS[b][0]}</span>${chip}</span>`; lastB = b; } else h += chip;   // 책 이름은 첫 장과 붙여서 줄바꿈
  });
  return h;
}
/* 하루 분량이 많을 때(도전 플랜): 책마다 한 줄, 누르면 그 책의 안 읽은 첫 장부터 */
function planBooksHTML(list) {
  const rows = []; let cur = null;
  list.forEach(g => { const [b, c] = gBC(g), dn = hexGet(S.plan.done, g); if (!cur || cur.b !== b) { cur = { b, c0: c, c1: c, n: 0, done: 0, first: -1, g0: g }; rows.push(cur); } cur.c1 = c; cur.n++; if (dn) cur.done++; else if (cur.first < 0) cur.first = g; });
  return `<div class="pl-books">${rows.map(x => `<button type="button" class="pl-brow${x.done === x.n ? " done" : ""}" data-g="${x.first >= 0 ? x.first : x.g0}"><b>${BOOKS[x.b][0]} ${x.c0 === x.c1 ? x.c0 + 1 : `${x.c0 + 1}–${x.c1 + 1}`}장</b><span class="pl-bbar"><i style="width:${(x.done / x.n * 100).toFixed(1)}%"></i></span><span class="num">${x.done}/${x.n}</span></button>`).join("")}</div>`;
}
function planMileNext(st) {
  const P = S.plan, i = PLAN_MILES.findIndex((m, j) => !(P.got & (1 << j))); if (i < 0) return "";
  const [t, rw] = PLAN_MILES[i], need = Math.max(1, Math.ceil(t * st.total - st.done));
  return `${t < 1 ? Math.round(t * 100) + "%" : "완주"}까지 ${need}장 <span class="rws">${rwHTML(planScale(rw, st.total, planHard()))}</span>`;
}
function planPickHTML() {
  const rc = roundCount(), pre = planUI.pre == null ? rc > 0 : planUI.pre, preHex = pre && rc ? readHex() : null;
  if (!planDef(planUI.pick)) planUI.pick = "y1";
  const opt = p => { const info = planPreview(p, preHex); return `<button type="button" class="pl-opt${p.hard ? " hard" : ""}${planUI.pick === p.id ? " on" : ""}" data-pick="${p.id}"${info.total ? "" : " disabled"}><b>${p.hard ? `<i class="pl-hard">도전</i>` : ""}${p.n}</b><small>${p.sub} · ${p.days}일</small><span class="pl-m">${info.total ? `하루 약 ${minText(info.min)}` : "읽을 장 없음"}</span></button>`; };
  const opts = PLANS.filter(p => !p.hard).map(opt).join("") + `<div class="pl-grp">진짜 도전 <small>보상 2~5배</small></div>` + PLANS.filter(p => p.hard).map(opt).join("");
  const sel = planDef(planUI.pick), info = planPreview(sel, preHex), end = addDays(dayKey(), sel.days - 1);
  return `<div class="pl-hd"><span class="pl-ic"></span><div><b>말씀 읽기 플랜</b><small>통독 일정을 고르면 날마다 읽을 장을 정해 드려요. 글자 수로 나눠서 하루 읽는 시간이 비슷해요.</small></div></div>`
    + `<div class="pl-opts">${opts}</div>`
    + (rc ? `<button type="button" class="pl-pre${pre ? " on" : ""}" id="plPre"><i class="ck"></i><span>이번 통독에서 이미 읽은 ${rc}장은 빼고 나누기</span></button>` : "")
    + `<div class="row-btns"><button type="button" class="buy manna" id="plStart"${info.total ? "" : " disabled"}><span class="act">오늘부터 시작</span><small>${mdShort(dayKey())} ~ ${mdShort(end, true)} · ${info.total}장</small></button></div>`;
}
function planActiveHTML(st) {
  const P = S.plan, def = st.sc.def, pct = st.done / st.total, today = dayKey();
  const dayLbl = st.over ? `<span class="pl-day">기간 끝<br><b>${st.total - st.done}</b>장 남음</span>` : `<span class="pl-day"><b>${st.d + 1}</b>/${st.sc.D}일</span>`;
  const ticks = PLAN_MILES.slice(0, 4).map(([t], i) => `<i class="pl-tick${(P.got & (1 << i)) ? " on" : ""}" style="left:${t * 100}%"></i>`).join("");
  const side = [];
  if ((P.streak || 0) > 0 && (P.last === today || P.last === yesterdayKey())) side.push(`연속 <b>${P.streak}</b>일`);
  if (st.behind) side.push(`<span class="warn">밀린 ${st.behind}장</span>`); else if (st.ahead) side.push(`<span class="good">앞서 읽은 ${st.ahead}장</span>`);
  const tdone = !st.over && st.today.length > 0 && !st.tLeft;
  let body;
  if (st.over) body = `<div class="pl-rest">일정 기간이 끝났어요. 남은 장을 마저 읽으면 완주예요.</div>`;
  else if (!st.today.length) body = `<div class="pl-rest">오늘은 쉬어 가는 날이에요.</div>`;
  else body = st.today.length > 14 ? planBooksHTML(st.today) : `<div class="pl-chips">${planChips(st.today, st.firstToday)}</div>`;
  const head = `<div class="pl-th"><b>${st.over ? "남은 말씀" : tdone ? "오늘 말씀 완료 ✓" : "오늘 읽을 말씀"}</b><span>${st.today.length ? `약 ${minText(planMin(st.today))}` : ""}</span></div>`;
  let go = "", second = "";
  if (st.over || (tdone && st.behind)) { if (st.firstBehind >= 0) go = planGoBtn(st.firstBehind, `밀린 ${st.behind}장 읽기`); }
  else if (!tdone) { go = planGoBtn(st.firstToday, st.tLeft === st.today.length ? "오늘 말씀 읽기" : "이어서 읽기"); if (st.behind && st.firstBehind >= 0) second = `<button type="button" class="buy ghost" id="plBehind" data-g="${st.firstBehind}"><span class="act">밀린 ${st.behind}장</span><small>먼저 읽기</small></button>`; }
  else if (st.firstAhead >= 0) go = planGoBtn(st.firstAhead, "내일 것 미리 읽기", true);
  const quitArmed = planUI.quit > Date.now();
  return `<div class="pl-hd"><span class="pl-ic"></span><div><b>${def.hard ? `<i class="pl-hard">도전</i>` : ""}${def.n}</b><small>${def.sub} · ${mdShort(P.start, true)} 시작</small></div>${dayLbl}</div>`
    + `<div class="pl-prog"><div class="pl-bar"><div class="prog"><i style="width:${(pct * 100).toFixed(2)}%"></i></div>${ticks}</div><div class="pl-pinfo"><span><b>${(pct * 100).toFixed(1)}%</b> · ${st.done}/${st.total}장</span><span>${side.join(" · ")}</span></div></div>`
    + `<div class="pl-today${tdone ? " done" : ""}">${head}${body}</div>`
    + (go || second ? `<div class="row-btns">${go}${second}</div>` : "")
    + `<div class="pl-foot"><span class="pl-next">${planMileNext(st)}</span><button type="button" class="pl-link${quitArmed ? " armed" : ""}" id="plQuit">${quitArmed ? "한 번 더 누르면 그만둬요" : "플랜 그만두기"}</button></div>`;
}
function planFinHTML(st) {
  const P = S.plan, def = st.sc.def, n = dayDiff(P.start, P.fin) + 1;
  return `<div class="pl-hd"><span class="pl-ic"></span><div><b>${def.n} 완주!</b><small>${mdShort(P.start, true)} ~ ${mdShort(P.fin, true)} · ${n}일 동안 ${st.total}장</small></div></div>`
    + `<div class="pl-fin">끝까지 읽었어요. 수고 많았어요! 다음 플랜도 이어서 해 볼까요?</div>`
    + `<div class="row-btns"><button type="button" class="buy manna" id="plNew"><span class="act">새 플랜 고르기</span><small>지금까지 완주 ${S.planFin || 1}번</small></button></div>`;
}
function renderPlanCard() {
  const box = $("plBody"); if (!box) return;
  let P = S.plan, st = P ? planStats() : null; if (P && !st) { S.plan = null; P = null; }
  const key = P ? [P.id, P.start, P.fin, planVer, dayKey(), planUI.quit > Date.now() ? 1 : 0, S.day && S.day.plan].join("|") : ["pick", planUI.pick, planUI.pre, roundCount(), dayKey()].join("|");
  if (box._k === key) return; box._k = key;
  box.innerHTML = P ? (P.fin ? planFinHTML(st) : planActiveHTML(st)) : planPickHTML();
  const ic = box.querySelector(".pl-ic"); if (ic && ic.appendChild) ic.appendChild(pixIcon(P && P.fin ? "trophy" : "bible", 30));
}
function buildPlanCard() {
  const card = el("div", "card plancard"); card.innerHTML = `<div class="pl-body" id="plBody"></div>`;
  addCustom("bible", card, () => renderPlanCard());
  card.addEventListener("click", e => {
    const t = e.target, b = t && t.closest ? (t.closest("button") || (t.tagName === "BUTTON" ? t : null)) : (t && t.tagName === "BUTTON" ? t : null);
    if (!b || b.disabled) return;
    const ds = b.dataset || {};
    if (ds.pick) { planUI.pick = ds.pick; sfx("tick"); renderPlanCard(); return; }
    if (b.id === "plPre") { planUI.pre = !(planUI.pre == null ? roundCount() > 0 : planUI.pre); sfx("tick"); renderPlanCard(); return; }
    if (b.id === "plStart") { planStart(planUI.pick, planUI.pre == null ? roundCount() > 0 : planUI.pre); return; }
    if (b.id === "plNew") { S.plan = null; planCache.k = ""; planVer++; renderPlanCard(); updateUI(true); save(); return; }
    if (b.id === "plQuit") {
      if (planUI.quit > Date.now()) { planUI.quit = 0; S.plan = null; planCache.k = ""; planVer++; toast("읽기 플랜을 그만뒀어요"); renderPlanCard(); updateUI(true); save(); }
      else { planUI.quit = Date.now() + 3000; sfx("tick"); renderPlanCard(); setTimeout(() => { if (planUI.quit && Date.now() >= planUI.quit) { planUI.quit = 0; renderPlanCard(); } }, 3100); }
      return;
    }
    if (ds.g != null && ds.g !== "") { const bc = gBC(+ds.g); openReader(bc[0], bc[1], true); }
  });
}
