/* ===================== 측정 (v32 · 고도화 5단계) =====================
   기준서 기둥 12(측정·검증·운영)와 '측정·점검 루틴'을 게임 안으로.
   1) 하루 측정 기록 S.met.d[날짜]: g 게임 화면 초 · ms 암송 화면 초 · rs 읽은 초 · t1 첫 확인 시각(분) · fF/fP 25분 집중 완주/중단 ·
      tg/up 체크한 장/기록만 남은 장 · mv 그날 처음 본 구절. 암송 유지 S.met.mr[월] = { w: [통과, 시험] 7일 넘어 다시 본 구절, m: 30일 }.
      고임 경보(ho)·퇴사 게이지(rt)·옷 해금 날짜(wu)·버전 도입일(v).
   2) 말씀 상태판(정보 탭): 북극성 8주 그래프, 지표 9개(목표·판정), v28~v31 수용 기준 자동 판정, 주간 한 줄(주일), 패치 메모(RITE 3일).
   3) 월간 청지기 점검: 자동성 4문항(SRBAI)·동기 4문항(상대적 자율성)·후회한 기능·다음 달 한 가지. 보상 없이 기록만.
   4) 보상 끄기 주간: 월요일부터 7일, 말씀·암송·공부에 붙은 보상을 끔(한 번뿐인 보상은 보관했다가 주가 끝나면). 결과는 평소 4주 대비 %,
      80% 넘으면 '외적 보상 비중'(100·80·60%)을 고를 수 있음.
   5) 실행 의도: 언제·무엇 다음에·어디서 읽을지, 맥락 일치율(계획한 시각 ±60분). 웹 푸시(수파베이스 kjy-noti 함수, 5분마다):
      아직 안 읽은 날만, 하루 2번까지, 알림 온 날을 세 번 이어서 그냥 넘기면 쉼, 문구 24개를 돌려 씀.
   merge·freshState 에서 부르므로 함수 선언과 var 만 씀 */
var GAME_V = 32;
var PATCH_DAYS = { 28: "2026-10-09", 29: "2026-10-10", 30: "2026-10-10", 31: "2026-10-10" };
var MEAS_KEEP = 150;
var SRBAI_Q = ["나도 모르게 저절로 하게 된다", "일부러 기억하지 않아도 하게 된다", "깊이 생각하지 않고도 하게 된다", "하고 있다는 걸 알아차리기 전에 이미 시작한다"];
var MOTIV_Q = [["내적", "말씀을 읽는 시간 자체가 좋아서"], ["동일시", "말씀이 내 삶에 중요하다고 믿어서"], ["내사", "읽지 않으면 마음이 불편하고 찔려서"], ["외적", "게임 보상(만나·도장·순례)을 받으려고"]];
var REGRET = [["battle", "전투 구경"], ["weapon", "무기·강화"], ["suit", "옷장 꾸미기"], ["pet", "동료"], ["retire", "퇴사"], ["fest", "절기 순례"], ["treasure", "보물"], ["noti", "알림"], ["none", "없음"]];
var RITE_Q = ["무슨 문제가 있었나", "왜 그런지 설명되나", "바로 고칠 수 있나"];
var II_DAYS = ["월", "화", "수", "목", "금", "토", "일"];
var WARD_GRP = { chap: "c", rstreak: "c", round: "c", planfin: "c", bk: "c", study: "s", sstreak: "s", mem: "m", memp: "m" };
var NOTI_FN = "kjy-noti";
var ROFF_KEYS = ["manna", "stamp", "gold", "ore", "silver", "ame", "haste", "gold2", "rage"];
var ROFF_STAT = { chap: 1, med: 1, study: 1, mem: 1 };
var ROFF_ACH = { chap: 1, study: 1, rstreak: 1, sstreak: 1, memm: 1, planf: 1 };
var MEAS_GUIDE = [
  ["말씀 상태판", "정보 탭 위쪽(프로필 아래). 최근 8주 말씀일수 그래프와 꾸준함·공백 회복·확인된 공부·암송 유지·계획한 시간에 읽기·자동성·노력÷게임 화면·기록만 남은 장, 그리고 지난 패치들이 목표를 이뤘는지 자동으로 판정해 보여 줘요. 판정은 도입 14일 뒤부터예요."],
  ["주간 한 줄 · 패치 메모", "주일과 월요일에는 '이번 주 말씀이 내게 한 일'을 한 줄 남길 수 있어요. 새 버전이 나온 뒤 3일 동안은 '무슨 문제가 있었나·설명되나·바로 고칠 수 있나' 메모 칸이 열려요."],
  ["월간 청지기 점검", "한 달에 한 번, 말씀 읽기가 얼마나 몸에 붙었는지(자동성 4문항)와 왜 읽는지(동기 4문항), 후회한 게임 기능, 다음 달 한 가지를 기록해요. 보상은 없어요."],
  ["보상 끄기 주간", "분기에 한 주, 월요일부터 7일 동안 말씀·암송·공부에 붙은 게임 보상을 꺼요. 기록·연속·순례 XP는 그대로이고, 첫 완독 같은 한 번뿐인 보상은 보관했다가 주가 끝나면 드려요. 평소의 80%를 넘기면 외적 보상 비중을 낮출 수 있어요."],
  ["읽을 때와 곳 · 알림", "말씀 탭에서 언제·무엇 다음에·어디서 읽을지 정해요. 아이디로 로그인한 설치 앱에서는 그 시각에 알림을 받을 수 있어요(아직 안 읽은 날만, 하루 2번까지, 알림 온 날을 세 번 이어서 그냥 넘기면 알림이 쉬어요)."],
];
var measUI = { k: {}, hoT: 0, wuT: 0, first: null, stew: false, sv: null, iiEdit: false, iiDraft: null, iiMsg: "", nst: null, nstT: 0, busy: false, roffAsk: 0 };

/* ---------- 아이콘: 상태판 · 종 ---------- */
UIICON.board = { m: ["............", "..........Y.", ".........YY.", "......G..YY.", "......G..YY.", "...B..G..YY.", "...B..G..YY.", "...B..G..YY.", "...B..G..YY.", "WWWWWWWWWWWW", "............", "............"], p: { Y: "#ffd54a", G: "#7fe3a0", B: "#6fd3ff", W: "#c9d2e6" } };
UIICON.bell = { m: [".....yy.....", "....yYYy....", "...yYYYYy...", "...yYYYYy...", "...yYYYYy...", "..yYYYYYYy..", "..yYYYYYYy..", ".yYYYYYYYYy.", ".yyyyyyyyyy.", ".....bb.....", "............", "............"], p: { y: "#d9a21c", Y: "#ffd54a", b: "#c9a26b" } };
(function measIconCss() {
  try {
    if (!document.head || !document.createElement("canvas").toDataURL) return;
    const css = ["board", "bell"].map(n => `.ri-${n},span.ri-${n},i.ri-${n}{background-image:url(${pixIcon(n, 16).toDataURL("image/png")})}`).join("");
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  } catch (e) {}
})();

/* ---------- 저장값 ---------- */
function metNew() { return { d: {}, mr: {}, ho: [], rt: [], wu: {}, wpre: null, v: {}, at: 0 }; }
function stewNew() { return { m: {}, w: {}, rite: {} }; }
function roffNew() { return { on: null, hist: [], esc: {}, wgt: 100, unl: 0 }; }
function iiNew() { return { on: 0, t: "07:00", t2: "", where: "", cue: "", days: 127, push: 0, tz: 540, since: "" }; }
function measTxt(v, n) { return typeof v === "string" ? v.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, n) : ""; }
function measHM(v) { const m = /^(\d\d):(\d\d)$/.exec(String(v || "")); return m && +m[1] < 24 && +m[2] < 60 ? m[0] : ""; }
function measPair(x) { const n = Array.isArray(x) ? payInt(x[1], 1e6) : 0, p = Array.isArray(x) ? payInt(x[0], 1e6) : 0; return [Math.min(p, n), n]; }
function measScore(a, n) { return Array.isArray(a) ? a.slice(0, n).map(v => Math.max(1, Math.min(7, Math.round(+v) || 4))) : []; }
function measMerge(s, d) {
  d = d || {};
  const m = d.met, M = metNew();
  if (m && typeof m === "object") {
    if (m.d && typeof m.d === "object") Object.keys(m.d).filter(k => PAY_DAY.test(k)).sort().slice(-MEAS_KEEP).forEach(k => {
      const x = m.d[k]; if (!x || typeof x !== "object") return; const o = {};
      ["g", "ms", "rs"].forEach(f => { const v = +x[f]; if (v > 0 && isFinite(v)) o[f] = Math.min(86400, v); });
      ["fF", "fP", "up", "tg"].forEach(f => { const v = payInt(x[f], 9999); if (v) o[f] = v; });
      if (x.t1 != null && +x.t1 >= 0 && +x.t1 < 1440) o.t1 = Math.floor(+x.t1);
      if (x.mv && typeof x.mv === "object") { o.mv = {}; Object.keys(x.mv).slice(0, 300).forEach(n => { if (/^\w{1,8}$/.test(n)) o.mv[n] = 1; }); }
      M.d[k] = o;
    });
    if (m.mr && typeof m.mr === "object") for (const k in m.mr) if (/^\d{4}-\d\d$/.test(k)) M.mr[k] = { w: measPair(m.mr[k] && m.mr[k].w), m: measPair(m.mr[k] && m.mr[k].m) };
    M.ho = Array.isArray(m.ho) ? m.ho.filter(h => h && ECO_KEYS.indexOf(h.k) >= 0 && PAY_DAY.test(h.d)).map(h => ({ k: h.k, d: h.d, ok: h.ok === 1 ? 1 : h.ok === -1 ? -1 : 0 })).slice(-30) : [];
    M.rt = Array.isArray(m.rt) ? m.rt.filter(r => r && PAY_DAY.test(r.d) && isFinite(+r.r)).map(r => ({ d: r.d, r: Math.max(0, Math.min(9999, Math.round(+r.r))) })).slice(-30) : [];
    if (m.wu && typeof m.wu === "object") for (const k in m.wu) if (WIT[k] && PAY_DAY.test(m.wu[k])) M.wu[k] = m.wu[k];
    M.wpre = Array.isArray(m.wpre) ? m.wpre.filter(x => typeof x === "string" && WIT[x]).slice(0, 400) : null;
    if (m.v && typeof m.v === "object") for (const k in m.v) if (/^\d{2,3}$/.test(k) && PAY_DAY.test(m.v[k])) M.v[k] = m.v[k];
  }
  s.met = M;
  const w = d.stew, W = stewNew();
  if (w && typeof w === "object") {
    if (w.m && typeof w.m === "object") for (const k in w.m) {
      const x = w.m[k]; if (!/^\d{4}-\d\d$/.test(k) || !x || typeof x !== "object") continue;
      W.m[k] = { d: PAY_DAY.test(x.d) ? x.d : "", a: measScore(x.a, 4), mo: measScore(x.mo, 4), rg: Array.isArray(x.rg) ? x.rg.filter(r => REGRET.some(q => q[0] === r)).slice(0, 9) : [], rgt: measTxt(x.rgt, 80), nx: measTxt(x.nx, 80) };
    }
    if (w.w && typeof w.w === "object") Object.keys(w.w).filter(k => PAY_DAY.test(k)).sort().slice(-60).forEach(k => { const t = measTxt(w.w[k], 120); if (t) W.w[k] = t; });
    if (w.rite && typeof w.rite === "object") for (const k in w.rite) if (/^\d{2,3}$/.test(k) && Array.isArray(w.rite[k])) W.rite[k] = w.rite[k].filter(r => r && PAY_DAY.test(r.d)).map(r => ({ d: r.d, a: measTxt(r.a, 160), b: measTxt(r.b, 160), c: measTxt(r.c, 160) })).slice(-10);
  }
  s.stew = W;
  const r = d.roff, R = roffNew();
  if (r && typeof r === "object") {
    const base = b => b && typeof b === "object" ? { c: Math.max(0, +b.c || 0), s: Math.max(0, +b.s || 0), m: Math.max(0, +b.m || 0) } : null;
    if (r.on && PAY_DAY.test(r.on.from) && PAY_DAY.test(r.on.to)) R.on = { from: r.on.from, to: r.on.to, base: base(r.on.base) };
    R.hist = Array.isArray(r.hist) ? r.hist.filter(h => h && PAY_DAY.test(h.from)).map(h => ({ from: h.from, to: PAY_DAY.test(h.to) ? h.to : h.from, base: base(h.base), got: base(h.got), pct: h.pct == null ? null : Math.max(0, Math.min(999, Math.round(+h.pct) || 0)), early: h.early ? 1 : 0 })).slice(-12) : [];
    if (r.esc && typeof r.esc === "object") ROFF_KEYS.forEach(k => { const v = payAmt(r.esc[k]); if (v) R.esc[k] = v; });
    R.wgt = [100, 80, 60].indexOf(+r.wgt) >= 0 ? +r.wgt : 100; R.unl = r.unl ? 1 : 0;
  }
  s.roff = R;
  const ii = d.ii, I = iiNew();
  if (ii && typeof ii === "object") {
    I.on = ii.on ? 1 : 0; I.t = measHM(ii.t) || "07:00"; I.t2 = measHM(ii.t2); I.where = measTxt(ii.where, 20); I.cue = measTxt(ii.cue, 20);
    I.days = Math.max(1, Math.min(127, payInt(ii.days, 127) || 127)); I.push = ii.push ? 1 : 0;
    I.tz = isFinite(+ii.tz) && Math.abs(+ii.tz) <= 840 ? Math.round(+ii.tz) : 540; I.since = PAY_DAY.test(ii.since) ? ii.since : "";
  }
  s.ii = I;
}
function metState() { if (!S.met || typeof S.met !== "object" || !S.met.d || !S.met.mr) S.met = metNew(); return S.met; }
function stewState() { if (!S.stew || typeof S.stew !== "object" || !S.stew.m || !S.stew.w) S.stew = stewNew(); if (!S.stew.rite) S.stew.rite = {}; return S.stew; }
function roffState() { if (!S.roff || typeof S.roff !== "object" || !Array.isArray(S.roff.hist)) S.roff = roffNew(); if (!S.roff.esc) S.roff.esc = {}; return S.roff; }
function iiState() { if (!S.ii || typeof S.ii !== "object") S.ii = iiNew(); return S.ii; }
function metDay(k) { const M = metState(); return M.d[k] || (M.d[k] = {}); }

/* ---------- 기록하기 ---------- */
function measRead(ts) { const D = metDay(dayKey()); if (D.t1 != null) return; let n = ts ? new Date(ts) : new Date(); if (dayKey(n) !== dayKey()) n = new Date(); D.t1 = n.getHours() * 60 + n.getMinutes(); }
function measFocus(ms, stop) { const D = metDay(dayKey()); if (ms >= CONFIRM_MS - 5000) D.fF = (D.fF || 0) + 1; else if (stop && ms >= 60000) D.fP = (D.fP || 0) + 1; }
function measMem(no, r, pass) {
  if (!r || !r.last) return;
  const t = dayKey(), D = metDay(t); D.mv = D.mv || {}; if (D.mv[no]) return; D.mv[no] = 1;
  const gap = dayDiff(r.last, t); if (!(gap >= 7)) return;
  const M = metState(), mk = t.slice(0, 7), o = M.mr[mk] || (M.mr[mk] = { w: [0, 0], m: [0, 0] });
  o.w[1]++; if (pass) o.w[0]++;
  if (gap >= 30) { o.m[1]++; if (pass) o.m[0]++; }
}
function measRetire() { const M = metState(); try { M.rt.push({ d: dayKey(), r: Math.round(retireRatio() * 100) }); if (M.rt.length > 30) M.rt = M.rt.slice(-30); } catch (e) {} }
function measArchive(day) {
  if (!day || !day.key || !S.bible) return;
  const D = metDay(day.key), B = S.bible, td = Array.isArray(B.today) ? B.today : [];
  const rs = Math.round(+B.rsec || 0); if (rs > 0) D.rs = Math.min(86400, rs);
  if (td.length) { D.tg = td.length; const up = td.filter(e => !e.pf).length; if (up) D.up = up; }
  delete D.mv;
}
function measTick() {
  if (!S || !S.day) return;
  const M = metState(), now = Date.now(), t = dayKey();
  let dt = M.at ? (now - M.at) / 1000 : 0; M.at = now;
  if (dt > 0 && dt <= 2 && (typeof document === "undefined" || !document.hidden)) {
    const D = metDay(t);
    if (rd) {} else if (memSess) D.ms = (D.ms || 0) + dt; else if (!(S.study && S.study.running)) D.g = (D.g || 0) + dt;
  }
  if (!M.v[GAME_V]) M.v[GAME_V] = t;
  if (now - measUI.wuT > 5000) {
    measUI.wuT = now;
    const W = wardState();
    if (!M.wpre) { M.wpre = Object.keys(W.own).filter(id => WIT[id]); }
    else for (const id in W.own) if (WIT[id] && !M.wu[id] && M.wpre.indexOf(id) < 0) M.wu[id] = t;
    const keys = Object.keys(M.d); if (keys.length > MEAS_KEEP) keys.sort().slice(0, keys.length - MEAS_KEEP).forEach(k => delete M.d[k]);
  }
  if (now - measUI.hoT > 10000) { measUI.hoT = now; measHoardTick(); }
  roffTick();
}
/* 고임 경보: 처음 뜬 날을 적고, 7일 안에 그 재화를 썼는지 */
function measHoardTick() {
  try {
    const M = metState(), t = dayKey(), E = ecoState(), hs = ecoHoards();
    hs.forEach(h => { if (!M.ho.some(x => x.k === h.k && x.ok === 0)) M.ho.push({ k: h.k, d: t, ok: 0 }); });
    M.ho.forEach(x => {
      if (x.ok) return; const i = ECO_KEYS.indexOf(x.k);
      for (let d = x.d, g = 0; d <= t && g < 8; d = addDays(d, 1), g++) { const D = E.days[d]; if (D && D.o && D.o[i] > 0) { x.ok = 1; return; } }
      if (dayDiff(x.d, t) > 7) x.ok = -1;
    });
    if (M.ho.length > 30) M.ho = M.ho.slice(-30);
  } catch (e) {}
}

/* ---------- 지표 ---------- */
function measFirst() {
  const t = dayKey(); if (measUI.first && measUI.first.t === t && measUI.first.v2 === attVer) return measUI.first.v;
  let f = t; const L = attLog(), H = habitState();
  for (const k in L) if (PAY_DAY.test(k) && k < f) f = k;
  for (const k in H.td) if (PAY_DAY.test(k) && k < f) f = k;
  (S.bible.notes || []).forEach(n => { if (n && PAY_DAY.test(n.d) && n.d < f) f = n.d; });
  measUI.first = { t, v: f, v2: attVer }; return f;
}
function measActive(k) { const h = habitRaw(k); return h.c !== 0 || h.s !== 0 || h.m !== 0 || !!habitState().td[k]; }
function measWeeks(n) {
  const t = dayKey(), first = measFirst(), cur = festMon(t), out = [];
  let wk = cur;
  for (let i = 0; i < n; i++) {
    const end = addDays(wk, 6); let c = 0, s = 0, m = 0, act = 0, span = 0;
    for (let d = wk, g = 0; g < 7; d = addDays(d, 1), g++) {
      if (d > t || d < first) continue; span++;
      if (festReadDay(d)) c++;
      const h = habitRaw(d); s += h.s === -1 ? 25 : (+h.s || 0); m += h.m === -1 ? 5 : (+h.m || 0); if (measActive(d)) act++;
    }
    out.unshift({ wk, c, s: Math.round(s), m, act, span, cur: wk === cur, pre: end < first });
    wk = addDays(wk, -7);
  }
  return out;
}
function measRoll7() { const t = dayKey(); let n = 0; for (let i = 0; i < 7; i++) if (festReadDay(addDays(t, -i))) n++; return n; }
function measCurr() {
  const t = dayKey(), first = measFirst(); let A = 0, B = 0, n = 0;
  for (let i = 28; i >= 2; i--) { const d = addDays(t, -i); if (d < first) continue; n++; if (measActive(d)) { A++; if (measActive(addDays(d, 1))) B++; } }
  return { v: A ? B / A : null, n };
}
function measMedian(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; }
function measGaps() {
  const t = dayKey(), first = measFirst(), lim = addDays(t, -120), from = first > lim ? first : lim, gaps = [];
  let run = 0, seen = false;
  for (let d = from, g = 0; d < t && g < 130; d = addDays(d, 1), g++) {
    if (measActive(d)) { if (seen && run > 0) gaps.push(run); run = 0; seen = true; } else if (seen) run++;
  }
  return { med: measMedian(gaps), long: gaps.filter(x => x > 7).length, n: gaps.length, cur: run };
}
function measSum(days, f) { const M = metState(), t = dayKey(); let s = 0; for (let i = 0; i < days; i++) { const D = M.d[addDays(t, -i)]; if (D) s += +f(D) || 0; } return s; }
function measFocusRate() { const F = measSum(28, D => D.fF), P = measSum(28, D => D.fP); return F + P ? { v: F / (F + P), n: F + P } : { v: null, n: 0 }; }
function measMemKeep() {
  const M = metState(), t = dayKey(), ms = [t.slice(0, 7), ymAdd(t.slice(0, 7), -1), ymAdd(t.slice(0, 7), -2)];
  let wp = 0, wn = 0, mp = 0, mn = 0; ms.forEach(k => { const o = M.mr[k]; if (o) { wp += o.w[0]; wn += o.w[1]; mp += o.m[0]; mn += o.m[1]; } });
  return { w: wn ? wp / wn : null, wn, m: mn ? mp / mn : null, mn };
}
function measContext() {
  const I = iiState(); if (!I.on || !I.since) return { v: null, n: 0 };
  const t = dayKey(), M = metState(), tm = +I.t.slice(0, 2) * 60 + +I.t.slice(3); let ok = 0, n = 0;
  for (let i = 0; i < 14; i++) {
    const d = addDays(t, -i); if (d < I.since) break;
    if (!(I.days & (1 << ((keyDate(d).getDay() + 6) % 7)))) continue;
    const D = M.d[d]; if (!D || D.t1 == null) continue;
    n++; if (Math.abs(D.t1 - tm) <= 60) ok++;
  }
  return { v: n ? ok / n : null, n, ok };
}
function measEffort() {
  const t = dayKey(), M = metState(); let ef = 0, sc = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(t, -i), D = M.d[d] || {}, h = habitRaw(d);
    ef += (d === t ? readSecToday() : +D.rs || 0) + 60 * (h.s === -1 ? 25 : (+h.s || 0)) + (+D.ms || 0); sc += +D.g || 0;
  }
  return { v: sc >= 120 ? ef / sc : null, ef, sc };
}
function measIntegrity() {
  const M = metState(), t = dayKey(), td = S.bible.today || []; let tg = td.length, up = td.filter(e => !e.pf).length;
  for (let i = 1; i < 28; i++) { const D = M.d[addDays(t, -i)]; if (D) { tg += D.tg || 0; up += D.up || 0; } }
  return { v: tg ? up / tg : null, n: tg };
}
function measAuto() {
  const W = stewState(), ks = Object.keys(W.m).sort(), k = ks[ks.length - 1]; if (!k) return null;
  const e = W.m[k], avg = e.a.length ? e.a.reduce((x, y) => x + y, 0) / e.a.length : null, mo = e.mo;
  return { k, a: avg, rai: mo.length === 4 ? 2 * mo[0] + mo[1] - mo[2] - 2 * mo[3] : null };
}
/* 기준선 = 처음 기록한 2주 (패치 전 기록이 사흘뿐이라 대신 씀) */
function measBase(wk) { const full = wk.filter(w => !w.pre && w.span >= 5 && !w.cur); return full.length >= 3 ? (full[0].c + full[1].c) / 2 : null; }
function measAvg4(wk) { const full = wk.filter(w => !w.pre && w.span >= 5 && !w.cur).slice(-4); return full.length ? full.reduce((a, w) => a + w.c, 0) / full.length : null; }

/* ---------- 패치 수용 기준 자동 판정 ---------- */
function measChecks() {
  const t = dayKey(), wk = measWeeks(12), base = measBase(wk), avg4 = measAvg4(wk), w7 = measRoll7(), g = measGaps(), it = measIntegrity(), M = metState();
  const baseItem = () => ({ n: "주간 말씀일수 기준선 +1일", val: base == null ? "기준선 모으는 중 (처음 2주 뒤 한 주 더)" : `기준선 ${base.toFixed(1)}일 → 최근 ${avg4 == null ? "-" : avg4.toFixed(1)}일`, st: base == null || avg4 == null ? "wait" : avg4 >= base + 1 ? "ok" : "low" });
  const ho = M.ho.filter(h => h.ok), hoOk = ho.filter(h => h.ok === 1).length, rt = M.rt.map(r => r.r), rtMed = measMedian(rt);
  const W = wardState(), grp = { c: 0, s: 0, m: 0 }; WITEMS.forEach(x => { if (x.cond && !x.old && W.own[x.id] != null && WARD_GRP[x.cond[0]]) grp[WARD_GRP[x.cond[0]]]++; });
  const F = festState(), thx = F.sid === "thanks-2026" ? !!F.dev : F.hist.some(h => h.k === "thanks-2026" && h.dev);
  const D = dblState(), dst = D.st || { reg: 0, fast: 0, slow: 0 }, dn = dst.fast + dst.slow;
  const J = jarState(), jw = Math.max(1, Math.ceil((dayDiff(PATCH_DAYS[31], t) + 1) / 7));
  let capD = 0, actD = 0; const se = festByKey("thanks-2026");
  if (se) { const notes = {}; (S.bible.notes || []).forEach(n => { if (n && n.d) notes[n.d] = 1; }); const last = t < se.end ? t : se.end; for (let d = se.start, i = 0; d <= last && i < 60; d = addDays(d, 1), i++) { const x = festDayXP(d, festState(), notes); if (x.tot > 0) { actD++; if (x.tot >= FEST_DAY_MAX) capD++; } } }
  return [
    { v: 28, n: "연속 지키기·읽은 시간 확인", items: [
      { n: "주간 말씀일수 4일 이상", val: `최근 7일 ${w7}일`, st: w7 >= 4 ? "ok" : "low" },
      { n: "공백 회복 중앙값 1일 이하", val: g.n ? `중앙값 ${g.med}일 · 공백 ${g.n}번` : "아직 공백 없음", st: g.med <= 1 ? "ok" : "low" },
      { n: "짧은 체류에서 나온 보상 5% 미만", val: `0% (확인된 장만 보상)${it.v == null ? "" : ` · 기록만 남은 장 ${Math.round(it.v * 100)}%`}`, st: "ok" },
    ] },
    { v: 29, n: "다음 목표·경제 리포트", items: [
      baseItem(),
      { n: "고임 경보 뒤 7일 안에 그 재화 쓰기 (70%)", val: ho.length ? `${hoOk}/${ho.length}번` : "경보 기록 없음", st: ho.length ? (hoOk / ho.length >= 0.7 ? "ok" : "low") : "wait" },
      { n: "퇴사 때 게이지 중앙값 +50% 이상", val: rt.length ? `중앙값 +${Math.round(rtMed)}% (${rt.length}번)` : "퇴사 기록 없음 (v32부터 셈)", st: rt.length ? (rtMed >= 50 ? "ok" : "low") : "wait" },
    ] },
    { v: 30, n: "옷장 개편", items: [
      { n: "기록으로 연 옷 3벌 (말씀·공부·암송 각 1벌 이상)", val: `말씀 ${grp.c} · 공부 ${grp.s} · 암송 ${grp.m}`, st: grp.c && grp.s && grp.m && grp.c + grp.s + grp.m >= 3 ? "ok" : "low" },
      { n: "옷장 사기·강화 5번 이상", val: `${W.ops || 0}번`, st: (W.ops || 0) >= 5 ? "ok" : "low" },
      { n: "예전 저장 능력치 줄어든 것 0", val: "예전 저장 4종 시험 통과", st: "ok" },
    ] },
    { v: 31, n: "결제 대체 장치", items: [
      { n: "추수감사 순례 헌신 길 열림", val: thx ? "열림" : "아직 (7일 안에 말씀 5일)", st: thx ? "ok" : t > "2026-11-15" ? "low" : "wait" },
      baseItem(),
      { n: "묵상 2배 70% 이상 24시간 안에", val: dn ? `${dst.fast}/${dn}번` : "기록 없음 (v32부터 셈)", st: dn ? (dst.fast / dn >= 0.7 ? "ok" : "low") : "wait" },
      { n: "달란트 항아리 주 1회 이상", val: `${J.open || 0}번 / ${jw}주`, st: (J.open || 0) >= jw ? "ok" : "low" },
      { n: "순례 XP 상한(260) 닿은 날 30% 이하", val: actD ? `${capD}/${actD}일` : "기록 없음", st: actD ? (capD / actD <= 0.3 ? "ok" : "low") : "wait" },
    ] },
  ];
}

/* ---------- 보상 끄기 주간 ---------- */
function roffOn() { const R = S && S.roff; if (!R || !R.on) return false; const t = dayKey(); return R.on.from <= t && t <= R.on.to; }
function devWgt() { return roffOn() ? 0 : ((S && S.roff && S.roff.wgt) || 100) / 100; }
function roffEsc(rw) { const E = roffState().esc; ROFF_KEYS.forEach(k => { const v = +(rw && rw[k]) || 0; if (v > 0 && isFinite(v)) E[k] = (E[k] || 0) + v; }); }
function roffDaily(d) { return !!(d && ROFF_STAT[d.stat]) && roffOn(); }
function roffAch(a) { return !!(a && ROFF_ACH[a.id]) && roffOn(); }
function roffEscRw(E) { const rw = {}; ROFF_KEYS.forEach(k => { if (k !== "gold" && +E[k] > 0) rw[k] = Math.round(+E[k]); }); return rw; }
function roffNextMon() { const t = dayKey(), dow = (keyDate(t).getDay() + 6) % 7; return dow === 0 ? t : addDays(t, 7 - dow); }
function roffBase(from) {
  const first = measFirst(), out = { c: 0, s: 0, m: 0 }; let n = 0;
  for (let i = 1; i <= 4; i++) {
    const wk = addDays(from, -7 * i); if (wk < first) break; n++;
    for (let d = wk, g = 0; g < 7; d = addDays(d, 1), g++) { if (festReadDay(d)) out.c++; const h = habitRaw(d); out.s += h.s === -1 ? 25 : (+h.s || 0); out.m += h.m === -1 ? 5 : (+h.m || 0); }
  }
  return n >= 2 ? { c: out.c / n, s: out.s / n, m: out.m / n } : null;
}
function roffGot(from, to) {
  const t = dayKey(), out = { c: 0, s: 0, m: 0 };
  for (let d = from, g = 0; d <= to && d <= t && g < 7; d = addDays(d, 1), g++) { if (festReadDay(d)) out.c++; const h = habitRaw(d); out.s += h.s === -1 ? 25 : (+h.s || 0); out.m += h.m === -1 ? 5 : (+h.m || 0); }
  out.s = Math.round(out.s); return out;
}
function roffPct(base, got) {
  if (!base) return null; const p = [];
  if (base.c > 0) p.push(got.c / base.c); if (base.s >= 10) p.push(got.s / base.s); if (base.m > 0) p.push(got.m / base.m);
  return p.length ? Math.round(p.reduce((a, b) => a + b, 0) / p.length * 100) : null;
}
function roffStart() {
  const R = roffState(); if (R.on) return;
  const from = roffNextMon(); R.on = { from, to: addDays(from, 6), base: roffBase(from) };
  toast(from === dayKey() ? "보상 끄기 주간을 오늘부터 7일 동안 해요" : `보상 끄기 주간은 ${festMD(from)} 월요일부터 7일이에요`);
  updateUI(true); save();
}
function roffCancel() {
  const R = roffState(); if (!R.on) return;
  if (dayKey() < R.on.from) { R.on = null; toast("보상 끄기 주간을 취소했어요"); }
  else roffFinalize(true);
  updateUI(true); save();
}
function roffTick() { const R = S && S.roff; if (R && R.on && dayKey() > R.on.to) roffFinalize(false); }
function roffFinalize(early) {
  const R = roffState(), on = R.on; if (!on) return;
  const to = early ? addDays(dayKey(), -1) : on.to, got = roffGot(on.from, to < on.from ? on.from : to), pct = early ? null : roffPct(on.base, got);
  R.hist.push({ from: on.from, to: on.to, base: on.base, got, pct, early: early ? 1 : 0 }); if (R.hist.length > 12) R.hist = R.hist.slice(-12);
  R.on = null;
  const E = R.esc, gold = +E.gold || 0, rw = roffEscRw(E);
  if (gold > 0) S.gold += gold; grant(rw); R.esc = {};
  if (!early && pct != null && pct >= 80) R.unl = 1;
  const esc = Object.keys(rw).length || gold > 0 ? `<br>보관했던 보상: <span class="rws">${rwHTML(rw)}</span>${gold > 0 ? ` 월급 +${fmt(gold)}원` : ""}` : "";
  const line = `말씀 ${got.c}일 · 공부 ${studyText(got.s)} · 암송 ${got.m}구절`;
  celebrateLater({ ic: "board", title: early ? "보상 끄기 주간을 마쳤어요" : "보상 끄기 주간 결과", sub: (pct == null ? line + (early ? "<br>중간에 마쳐서 비교는 하지 않았어요" : "<br>평소 기록이 2주 넘게 쌓이면 비교해 드려요") : `평소의 ${pct}% · ${line}<br>${pct >= 80 ? "보상이 없어도 꾸준했어요 · 상태판에서 외적 보상 비중을 낮출 수 있어요" : "보상이 아직 큰 힘이 되고 있어요 · 다음 분기에 다시 해 봐요"}`) + esc, tone: "manna", sound: "pass", ms: 4200, keep: 1 });
}

/* ---------- 실행 의도 ---------- */
function iiDaysText(m) { if (m === 127) return "매일"; if (m === 31) return "평일"; if (m === 96) return "주말"; return II_DAYS.filter((d, i) => m & (1 << i)).join("·"); }
function iiTimeText(hm) { const h = +hm.slice(0, 2), mi = hm.slice(3); return `${h < 12 ? "오전" : "오후"} ${h % 12 === 0 ? 12 : h % 12}:${mi}`; }
function iiWhere(w) { w = String(w || "").replace(/에서$/, ""); return w ? `${w}에서 ` : ""; }
function iiSentence(I) { I = I || iiState(); return `${iiDaysText(I.days)} ${iiTimeText(I.t)}${I.cue ? `, ${I.cue}` : ""} ${iiWhere(I.where)}말씀을 펼쳐요`; }
function iiToday() { const I = iiState(); return !!I.on && !!(I.days & (1 << ((new Date().getDay() + 6) % 7))); }
function iiNear() { if (!iiToday() || festReadDay(dayKey())) return false; const I = iiState(), n = new Date(), m = n.getHours() * 60 + n.getMinutes(), tm = +I.t.slice(0, 2) * 60 + +I.t.slice(3); return m >= tm - 30 && m <= tm + 90; }

/* ---------- 알림 (웹 푸시) ---------- */
function notiIOS() { try { return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); } catch (e) { return false; } }
function notiStandalone() { try { return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; } catch (e) { return false; } }
function notiSupported() { try { return typeof navigator !== "undefined" && "serviceWorker" in navigator && typeof window !== "undefined" && "PushManager" in window && "Notification" in window; } catch (e) { return false; } }
function notiB64(s) { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
async function notiCall(body) {
  const r = await fetch(`${CLOUD.url}/functions/v1/${NOTI_FN}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}
function notiMsg(m) { measUI.iiMsg = m; measUI.iiMsgAt = Date.now(); measUI.k.ii = ""; }
async function notiOn() {
  const a = acctGet(), I = iiState();
  if (!I.on) { notiMsg("먼저 읽을 때와 곳을 정해 주세요"); return; }
  if (!a || !cloudOn()) { notiMsg("알림은 아이디로 로그인한 설치 앱에서 켤 수 있어요 (정보 탭 · 아이디 로그인)"); return; }
  if (!notiSupported()) { notiMsg(notiIOS() && !notiStandalone() ? "아이폰은 Safari 공유 → '홈 화면에 추가'한 앱에서 알림을 켤 수 있어요" : "이 브라우저는 알림을 지원하지 않아요"); return; }
  let perm = Notification.permission;
  if (perm === "default") perm = await Notification.requestPermission();
  if (perm !== "granted") { notiMsg("알림이 허용되지 않았어요 · 설정 → 알림에서 바꿀 수 있어요"); return; }
  measUI.busy = true; notiMsg("알림을 켜는 중…");
  try {
    const k = await notiCall({ mode: "key" }); if (!k || !k.ok || !k.key) throw new Error("key");
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (sub) { try { const cur = sub.options && sub.options.applicationServerKey ? new Uint8Array(sub.options.applicationServerKey) : null, want = notiB64(k.key); if (cur && (cur.length !== want.length || cur.some((v, i) => v !== want[i]))) { await sub.unsubscribe(); sub = null; } } catch (e) {} }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: notiB64(k.key) });
    const r = await cloudRpc("kjy_noti_sub", { p_id: a.id, p_token: a.token, p_sub: sub.toJSON(), p_ua: String(navigator.userAgent || "").slice(0, 150) });
    if (!r || !r.ok) throw new Error((r && r.err) || "sub");
    I.push = 1; I.tz = -new Date().getTimezoneOffset(); save(); cloudPush(true);
    measUI.nstT = 0; notiMsg(`알림을 켰어요 · ${iiTimeText(I.t)}에, 아직 안 읽은 날만 와요`);
  } catch (e) { notiMsg("알림을 켜지 못했어요 · 인터넷을 확인하고 다시 해 주세요"); }
  measUI.busy = false; updateUI(true);
}
async function notiOff(silent) {
  const a = acctGet(), I = iiState(); let ep = null;
  try { if (notiSupported()) { const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(); if (sub) { ep = sub.endpoint; await sub.unsubscribe(); } } } catch (e) {}
  try { if (a && cloudOn()) await cloudRpc("kjy_noti_unsub", { p_id: a.id, p_token: a.token, p_endpoint: ep }); } catch (e) {}
  I.push = 0; save(); if (a && cloudOn()) cloudPush(true);
  if (!silent) { notiMsg("알림을 껐어요"); updateUI(true); }
}
async function notiTest() {
  const a = acctGet(); if (!a || !cloudOn()) { notiMsg("로그인한 설치 앱에서 시험할 수 있어요"); return; }
  measUI.busy = true; notiMsg("시험 알림을 보내는 중…");
  try { const r = await notiCall({ mode: "test", id: a.id, token: a.token }); notiMsg(r && r.ok ? "시험 알림을 보냈어요 · 몇 초 안에 와요" : r && r.err === "wait" ? "30초 뒤에 다시 해 주세요" : r && r.err === "nosub" ? "이 계정에 켜진 알림이 없어요 · 알림 켜기를 먼저 눌러 주세요" : "보내지 못했어요 · 잠시 뒤 다시 해 주세요"); }
  catch (e) { notiMsg("보내지 못했어요 · 인터넷을 확인해 주세요"); }
  measUI.busy = false; updateUI(true);
}
async function notiResume() {
  const a = acctGet(); if (!a || !cloudOn()) return;
  try { await cloudRpc("kjy_noti_resume", { p_id: a.id, p_token: a.token }); measUI.nstT = 0; notiMsg("알림을 다시 켰어요"); } catch (e) { notiMsg("다시 켜지 못했어요"); }
  updateUI(true);
}
function notiStatus() {
  const a = acctGet(), I = iiState(); if (!a || !cloudOn() || !I.push || measUI.busy) return;
  if (Date.now() - measUI.nstT < 60000) return; measUI.nstT = Date.now();
  cloudRpc("kjy_noti_status", { p_id: a.id, p_token: a.token }).then(r => { if (r && r.ok) { measUI.nst = r; measUI.k.ii = ""; } }).catch(() => {});
}
/* 알림을 눌러 열면 ?go=bible → 말씀 탭 */
function notiGo() {
  try {
    if (!measUI.msg && typeof navigator !== "undefined" && navigator.serviceWorker && navigator.serviceWorker.addEventListener) {
      measUI.msg = 1;
      navigator.serviceWorker.addEventListener("message", e => { const g = e && e.data && e.data.go; if (g && panels[g] && tabOpen(g)) { selectTab(g, true); updateUI(true); } });
    }
  } catch (e) {}
  try {
    if (typeof location === "undefined" || !location.search) return;
    const g = new URLSearchParams(location.search).get("go");
    if (g && panels[g] && tabOpen(g)) selectTab(g, true);
    if (g && history && history.replaceState) history.replaceState(null, "", location.pathname);
  } catch (e) {}
}

/* ---------- 다음 목표 사다리 ---------- */
function measLadder(rows) {
  try {
    const I = iiState();
    if (iiNear()) rows.unshift({ k: "오늘", t: "약속한 시간이에요", v: iiTimeText(I.t), p: 0, s: `${I.cue ? I.cue + " " : ""}${iiWhere(I.where)}말씀 한 장`, go: "bible", hot: true });
    if (roffOn()) { const R = roffState(); rows.push({ k: "이번 주", t: "보상 끄기 주간", v: `${dayDiff(R.on.from, dayKey()) + 1}일째`, p: (dayDiff(R.on.from, dayKey()) + 1) / 7, s: "보상 없이 기록만 · 연속과 순례 XP는 그대로", go: "info" }); }
    const t = dayKey(), dow = new Date().getDay(), wk = dow === 1 ? festMon(addDays(t, -1)) : festMon(t);
    if ((dow === 0 || dow === 1) && !stewState().w[wk] && measFirst() <= addDays(t, -3)) rows.push({ k: "이번 주", t: "주간 한 줄", v: "", p: 0, s: "이번 주 말씀이 내게 한 일 (정보 탭 · 말씀 상태판)", go: "info" });
    if (new Date().getDate() <= 7 && !stewState().m[t.slice(0, 7)]) rows.push({ k: "시즌", t: "월간 청지기 점검", v: "", p: 0, s: "자동성·동기 8문항과 다음 달 한 가지 (보상 없이 기록만)", go: "info" });
  } catch (e) {}
}

/* ---------- 정보 탭: 말씀 상태판 ---------- */
function measPart(id, key, html, force) { const box = $(id); if (!box) return null; if (!force && measUI.k[id] === key) return null; measUI.k[id] = key; box.innerHTML = typeof html === "function" ? html() : html; return box; }
function buildMeasCards() {
  secTitle("info", "말씀 상태판", "측정 · 점검 · 실험");
  const card = el("div", "card mst");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="mstIc"></span><div><b>말씀 지표</b><small id="mstSub"></small></div></div><div id="mstChart"></div><div id="mstTbl"></div><div id="mstChk"></div><div id="mstWeek"></div><div id="mstRite"></div>`;
  panels.info.appendChild(card);
  const ic = $("mstIc"); if (ic) ic.appendChild(pixIcon("board", 30));
  updaters.info.push({ ready: () => false, update: force => measRender(force) });
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset) return; const a = b.dataset.act;
    if (a === "wsave") { const i = $("mstWIn"), v = measTxt(i && i.value, 120); if (v.length < 2) { toast("두 글자 이상 적어 주세요"); return; } stewState().w[b.dataset.wk] = v; measUI.k = {}; toast("이번 주 한 줄을 남겼어요"); updateUI(true); save(); }
    else if (a === "rsave") { const v = RITE_Q.map((q, i) => measTxt(($("mstR" + i) || {}).value, 160)); if (!v.some(Boolean)) { toast("한 칸이라도 적어 주세요"); return; } const W = stewState(), k = String(GAME_V); W.rite[k] = (W.rite[k] || []).concat([{ d: dayKey(), a: v[0], b: v[1], c: v[2] }]).slice(-10); measUI.k = {}; toast("패치 메모를 남겼어요"); updateUI(true); save(); }
  });
  /* 월간 청지기 점검 */
  const sc = el("div", "card stw");
  sc.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stwIc"></span><div><b>월간 청지기 점검</b><small>한 달에 한 번 · 보상 없이 기록만</small></div></div><div id="stwBody"></div>`;
  panels.info.appendChild(sc);
  const ic2 = $("stwIc"); if (ic2) ic2.appendChild(pixIcon("cal", 30));
  updaters.info.push({ ready: () => false, update: force => stewRender(force) });
  sc.addEventListener("click", e => {
    const b = hbBtn(e, sc); if (!b || !b.dataset) return; const a = b.dataset.act;
    if (a === "open") { measUI.stew = true; measUI.sv = { a: [0, 0, 0, 0], mo: [0, 0, 0, 0], rg: [] }; stewRender(true); }
    else if (a === "close") { measUI.stew = false; stewRender(true); }
    else if (a === "pick") { const q = b.dataset.q, i = +b.dataset.i, v = +b.dataset.v; if (measUI.sv && measUI.sv[q]) { measUI.sv[q][i] = v; stewPaint(); } }
    else if (a === "rg") { const id = b.dataset.id, sv = measUI.sv; if (!sv) return; if (id === "none") sv.rg = sv.rg.indexOf("none") >= 0 ? [] : ["none"]; else { sv.rg = sv.rg.filter(x => x !== "none"); const j = sv.rg.indexOf(id); if (j >= 0) sv.rg.splice(j, 1); else sv.rg.push(id); } stewPaint(); }
    else if (a === "plan") { if (tabOpen("bible")) { selectTab("bible", true); setTimeout(() => { try { const c = document.querySelector(".plan"); if (c && c.scrollIntoView) c.scrollIntoView({ block: "start" }); } catch (er) {} }, 50); } }
    else if (a === "save") stewSave();
  });
  /* 보상 끄기 주간 */
  const rc = el("div", "card rof");
  rc.innerHTML = `<div class="pay-h"><span class="pay-ic" id="rofIc"></span><div><b>보상 끄기 주간</b><small>분기에 한 주 · 보상 없이도 하는지 살펴봐요</small></div></div><div id="rofBody"></div>`;
  panels.info.appendChild(rc);
  const ic3 = $("rofIc"); if (ic3) ic3.appendChild(pixIcon("moon", 30));
  updaters.info.push({ ready: () => false, update: force => roffRender(force) });
  rc.addEventListener("click", e => {
    const b = hbBtn(e, rc); if (!b || !b.dataset) return; const a = b.dataset.act;
    if (a === "start") { sfx("tick"); roffStart(); }
    else if (a === "stop") { const R = roffState(); if (R.on && dayKey() < R.on.from) { measUI.roffAsk = 0; roffCancel(); return; } if (measUI.roffAsk > Date.now()) { measUI.roffAsk = 0; roffCancel(); } else { measUI.roffAsk = Date.now() + 3000; measUI.k.rofBody = ""; roffRender(true); setTimeout(() => { measUI.k.rofBody = ""; }, 3100); } }
    else if (a === "wgt") { const R = roffState(), v = +b.dataset.v; if (!R.unl || [100, 80, 60].indexOf(v) < 0) return; R.wgt = v; measUI.k.rofBody = ""; toast(`외적 보상 비중 ${v}% · 말씀·묵상·암송의 만나와 공부 광석에 적용돼요`); updateUI(true); save(); }
  });
}
function measChartSVG(wk) {
  const W = 320, H = 132, pl = 24, pr = 6, pt = 14, pb = 20, n = wk.length, bw = (W - pl - pr) / n, y = v => pt + (H - pt - pb) * (1 - v / 7);
  let s = `<svg class="mst-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="최근 ${n}주 말씀 읽은 날">`;
  s += `<rect x="${pl}" y="${y(7)}" width="${W - pl - pr}" height="${y(5) - y(7)}" class="mst-band"/>`;
  [0, 4, 7].forEach(v => { s += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" class="mst-grid${v === 4 ? " q" : ""}"/><text x="${pl - 5}" y="${y(v) + 4}" class="mst-ax" text-anchor="end">${v}</text>`; });
  s += `<text x="${W - pr - 2}" y="${y(7) + 11}" class="mst-ax tg" text-anchor="end">목표 5~7일</text>`;
  wk.forEach((w, i) => {
    const x = pl + i * bw + bw * 0.18, bwid = bw * 0.64, d = keyDate(w.wk), lab = `${d.getMonth() + 1}/${d.getDate()}`;
    if (!w.pre) { const h = Math.max(1.5, (H - pt - pb) * w.c / 7), cls = w.cur ? "cur" : w.c >= 5 ? "ok" : w.c >= 4 ? "mid" : "low"; s += `<rect x="${x}" y="${y(0) - h}" width="${bwid}" height="${h}" rx="2" class="mst-bar ${cls}"/><text x="${x + bwid / 2}" y="${y(0) - h - 3}" class="mst-val" text-anchor="middle">${w.c}</text>`; }
    else s += `<text x="${x + bwid / 2}" y="${y(0) - 4}" class="mst-ax" text-anchor="middle">·</text>`;
    s += `<text x="${x + bwid / 2}" y="${H - 6}" class="mst-ax${w.cur ? " now" : ""}" text-anchor="middle">${w.cur ? "이번 주" : lab}</text>`;
  });
  return s + `</svg>`;
}
function measRows() {
  const days = dayDiff(measFirst(), dayKey()) + 1, w7 = measRoll7(), cu = measCurr(), g = measGaps(), wk = measWeeks(2), fr = measFocusRate(), mk = measMemKeep(), cx = measContext(), au = measAuto(), ef = measEffort(), it = measIntegrity(), I = iiState();
  const pc = v => `${Math.round(v * 100)}%`, st = (ok, mid) => ok ? "ok" : mid ? "mid" : "low", cur = wk[wk.length - 1];
  return [
    ["주간 말씀일수 (북극성)", days < 7 ? `기록 ${days}일 중 ${w7}일` : `최근 7일 ${w7}일`, "5~7일", days < 7 ? (w7 >= 5 ? "ok" : "wait") : st(w7 >= 5, w7 >= 4)],
    ["꾸준함 (다음 날도 한 비율)", cu.v == null ? "모으는 중" : `${cu.v.toFixed(2)} · ${cu.n}일`, "0.80 이상", cu.v == null ? "wait" : st(cu.v >= 0.8, cu.v >= 0.6)],
    ["공백 회복", g.n ? `중앙값 ${g.med}일 · 7일 넘는 공백 ${g.long}번` : "아직 공백 없음", "1일 이하 · 0번", st(g.med <= 1 && !g.long, g.med <= 2)],
    ["확인된 공부", `이번 주 ${studyText(cur ? cur.s : 0)}${fr.v == null ? "" : ` · 25분 완주 ${pc(fr.v)}`}`, "완주 80% 이상", fr.v == null ? "wait" : st(fr.v >= 0.8, fr.v >= 0.6)],
    ["암송 유지 (보지 않고 쓰기)", mk.w == null ? "모으는 중 (7일 넘어 다시 볼 때)" : `7일 뒤 ${pc(mk.w)}${mk.m == null ? "" : ` · 30일 뒤 ${pc(mk.m)}`}`, "90% · 80%", mk.w == null ? "wait" : st(mk.w >= 0.9 && (mk.m == null || mk.m >= 0.8), mk.w >= 0.75)],
    ["계획한 시간에 읽기", !I.on ? "말씀 탭에서 읽을 때를 정하면 재요" : cx.v == null ? "모으는 중" : `${cx.ok}/${cx.n}일 (${pc(cx.v)})`, "±1시간 안 70%", !I.on || cx.v == null ? "wait" : st(cx.v >= 0.7, cx.v >= 0.5)],
    ["자동성 (월간 점검)", au && au.a != null ? `${au.a.toFixed(1)}/7${au.rai == null ? "" : ` · 자율성 ${au.rai > 0 ? "+" : ""}${au.rai}`}` : "점검하면 보여요", "66일 무렵 5 이상", au && au.a != null ? (days < 66 ? (au.a >= 5 ? "ok" : "mid") : st(au.a >= 5, au.a >= 3.5)) : "wait"],
    ["노력 ÷ 게임 화면", ef.v == null ? "모으는 중" : `${ef.v.toFixed(1)}배 · 최근 7일`, "3배 이상", ef.v == null ? "wait" : st(ef.v >= 3, ef.v >= 1.5)],
    ["기록만 남은 장", it.v == null ? "체크한 장 없음" : `${pc(it.v)} · ${it.n}장 중`, "5% 미만", it.v == null ? "wait" : st(it.v < 0.05, it.v < 0.15)],
  ];
}
var MST_MARK = { ok: "✓", mid: "△", low: "!", wait: "…" };
function measRender(force) {
  if (!force && Date.now() - (measUI.rT || 0) < 2000) return; measUI.rT = Date.now();
  const t = dayKey(), wk = measWeeks(8), first = measFirst(), days = dayDiff(first, t) + 1;
  const sub = $("mstSub"), sv = `기록 ${days}일째 · ${days < 66 ? `몸에 붙었는지는 66일쯤부터 봐요 (${66 - days}일 남음)` : "이제 습관이 몸에 붙었는지 볼 때예요"}`; if (sub && sub.textContent !== sv) sub.textContent = sv;
  measPart("mstChart", JSON.stringify(wk), () => measChartSVG(wk), force);
  const rows = measRows();
  measPart("mstTbl", JSON.stringify(rows), () => `<div class="mst-tbl">${rows.map(r => `<div class="mst-r ${r[3]}"><span class="mst-n">${r[0]}</span><b class="num">${escapeHtml(r[1])}</b><small>목표 ${r[2]}</small><i>${MST_MARK[r[3]]}</i></div>`).join("")}</div>`, force);
  const ch = measChecks();
  measPart("mstChk", JSON.stringify([ch, t]), () => `<details class="mst-chk"><summary>지난 패치 판정 <small>v28~v31 · 도입 14일 뒤부터 판정</small></summary>${ch.map(c => { const jd = addDays(PATCH_DAYS[c.v], 14), done = t >= jd; return `<div class="mst-v"><b>v${c.v} · ${c.n}</b><small>${festMD(PATCH_DAYS[c.v])} 도입 · ${done ? "판정 중" : `${festMD(jd)}부터 판정`}</small>${c.items.map(x => { const s2 = x.st === "low" && !done ? "mid" : x.st; return `<div class="mst-i ${s2}"><i>${MST_MARK[s2]}</i><span>${escapeHtml(x.n)}</span><b>${escapeHtml(x.val)}</b></div>`; }).join("")}</div>`; }).join("")}<p class="muted">패치 전 기록이 사흘뿐이라 '기준선'은 처음 기록한 2주로 대신해요. 보상 끄기 주간이 '끄고 다시 켜서 비교(A-B-A)'를 맡아요.</p></details>`, force);
  const dow = new Date().getDay(), wkKey = dow === 1 ? festMon(addDays(t, -1)) : festMon(t), W = stewState(), open = (dow === 0 || dow === 1) && !W.w[wkKey];
  const past = Object.keys(W.w).sort().slice(-3).reverse();
  measPart("mstWeek", JSON.stringify([open, wkKey, past.map(k => W.w[k])]), () => `<div class="mst-week"><b>주간 한 줄</b><small>주일·월요일에 · 이번 주 말씀이 내게 한 일</small>${open ? `<div class="mst-in"><input type="text" id="mstWIn" maxlength="120" placeholder="한 줄로 남겨요"><button type="button" class="btn manna" data-act="wsave" data-wk="${wkKey}">남기기</button></div>` : ""}${past.length ? `<ul>${past.map(k => `<li><small>${festMD(k)} 주</small> ${escapeHtml(W.w[k])}</li>`).join("")}</ul>` : open ? "" : `<p class="muted">주일에 다시 열려요</p>`}</div>`, force);
  const M = metState(), vd = M.v[GAME_V] || t, riteOpen = dayDiff(vd, t) <= 2, notes = (W.rite[String(GAME_V)] || []).slice(-3).reverse();
  measPart("mstRite", JSON.stringify([riteOpen, notes, GAME_V]), () => `<details class="mst-rite"${riteOpen ? " open" : ""}><summary>패치 메모 · v${GAME_V} <small>${riteOpen ? "새 버전 3일 동안 · " : ""}불편했던 점을 적어 두면 다음 패치에 고쳐요</small></summary><div class="mst-rq">${RITE_Q.map((q, i) => `<label><span>${q}</span><input type="text" id="mstR${i}" maxlength="160"></label>`).join("")}<button type="button" class="btn" data-act="rsave">메모 남기기</button></div>${notes.length ? `<ul>${notes.map(r => `<li><small>${festMD(r.d)}</small> ${escapeHtml([r.a, r.b, r.c].filter(Boolean).join(" / "))}</li>`).join("")}</ul>` : ""}</details>`, force);
}
function stewRender(force) {
  const W = stewState(), t = dayKey(), mk = t.slice(0, 7), done = W.m[mk], ks = Object.keys(W.m).sort();
  if (measUI.stew) { if (measPart("stwBody", "form", () => stewFormHTML(!ks.length), force)) stewPaint(); return; }
  measPart("stwBody", JSON.stringify([mk, done, ks.length, W.m]), () => {
    const hist = ks.slice(-4).reverse().map(k => { const e = W.m[k], a = e.a.length ? (e.a.reduce((x, y) => x + y, 0) / e.a.length).toFixed(1) : "-", mo = e.mo, rai = mo.length === 4 ? 2 * mo[0] + mo[1] - mo[2] - 2 * mo[3] : null; return `<li><b>${+k.slice(5)}월</b> 자동성 ${a}/7${rai == null ? "" : ` · 자율성 ${rai > 0 ? "+" : ""}${rai}`}${e.rg.length && e.rg[0] !== "none" ? ` · 후회: ${e.rg.map(r => (REGRET.find(q => q[0] === r) || ["", r])[1]).join("·")}` : ""}${e.nx ? `<br><small>다음 달: ${escapeHtml(e.nx)}</small>` : ""}</li>`; }).join("");
    return (done ? `<p class="stw-ok">${+mk.slice(5)}월 점검을 마쳤어요 · 다음 점검은 다음 달 1일부터</p>` : `<p class="muted">${ks.length ? `${+mk.slice(5)}월 점검이 열려 있어요 · 지난 한 달을 돌아봐요` : "아직 점검 기록이 없어요 · 첫 점검이 기준선이 돼요"}</p><button type="button" class="buy num stw-go" data-act="open"><span class="act">${ks.length ? `${+mk.slice(5)}월 점검하기` : "첫 점검하기 (기준선)"}</span><small>8문항 · 2분</small></button>`)
      + (hist ? `<ul class="stw-h">${hist}</ul>` : "") + `<p class="muted">자율성 = 2×내적 + 동일시 − 내사 − 2×외적 (−18~+18) · 높을수록 스스로 원해서 읽어요</p>`;
  }, force);
}
function stewFormHTML(first) {
  const scale = (q, i) => `<div class="stw-sc">${[1, 2, 3, 4, 5, 6, 7].map(v => `<button type="button" data-act="pick" data-q="${q}" data-i="${i}" data-v="${v}" aria-label="${v}점">${v}</button>`).join("")}</div>`;
  return `<div class="stw-f"><p class="muted">${first ? "첫 점검은 기준선이에요. " : ""}1 = 전혀 아니다 · 4 = 보통 · 7 = 아주 그렇다</p>
    <b class="stw-t">말씀 읽기는…</b>${SRBAI_Q.map((q, i) => `<div class="stw-q"><span>${q}</span>${scale("a", i)}</div>`).join("")}
    <b class="stw-t">말씀을 읽는 이유는…</b>${MOTIV_Q.map((q, i) => `<div class="stw-q"><span>${q[1]} <small>${q[0]}</small></span>${scale("mo", i)}</div>`).join("")}
    <b class="stw-t">지난 한 달, 시간을 쓰고 후회한 게임 기능</b><div class="stw-rg">${REGRET.map(r => `<button type="button" data-act="rg" data-id="${r[0]}">${r[1]}</button>`).join("")}</div>
    <input type="text" id="stwRgt" maxlength="80" placeholder="한 줄로 더 (선택)">
    <b class="stw-t">다음 달에 바꿔 볼 한 가지</b><input type="text" id="stwNx" maxlength="80" placeholder="예: 출근길 지하철에서 한 장">
    <div class="row-btns"><button type="button" class="btn" data-act="plan">읽기 플랜 보기</button><button type="button" class="btn" data-act="close">닫기</button><button type="button" class="buy num" data-act="save"><span class="act">기록하기</span></button></div></div>`;
}
function stewPaint() {
  const sv = measUI.sv, box = $("stwBody"); if (!sv || !box) return;
  box.querySelectorAll(".stw-sc button").forEach(b => { const on = sv[b.dataset.q] && sv[b.dataset.q][+b.dataset.i] === +b.dataset.v; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
  box.querySelectorAll(".stw-rg button").forEach(b => { const on = sv.rg.indexOf(b.dataset.id) >= 0; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
}
function stewSave() {
  const sv = measUI.sv; if (!sv) return;
  if (sv.a.some(v => !v) || sv.mo.some(v => !v)) { toast("8문항에 모두 점수를 골라 주세요"); return; }
  const W = stewState(), mk = dayKey().slice(0, 7);
  W.m[mk] = { d: dayKey(), a: sv.a.slice(), mo: sv.mo.slice(), rg: sv.rg.slice(), rgt: measTxt(($("stwRgt") || {}).value, 80), nx: measTxt(($("stwNx") || {}).value, 80) };
  measUI.stew = false; measUI.sv = null; measUI.k = {};
  const a = (sv.a.reduce((x, y) => x + y, 0) / 4).toFixed(1), mo = sv.mo, rai = 2 * mo[0] + mo[1] - mo[2] - 2 * mo[3];
  toast(`${+mk.slice(5)}월 점검을 기록했어요 · 자동성 ${a}/7 · 자율성 ${rai > 0 ? "+" : ""}${rai}`);
  updateUI(true); save();
}
function roffRender(force) {
  const R = roffState(), t = dayKey(), on = R.on, last = R.hist[R.hist.length - 1], first = measFirst(), ask = measUI.roffAsk > Date.now();
  measPart("rofBody", JSON.stringify([on, R.hist.length, last, R.wgt, R.unl, ask, t, R.esc]), () => {
    const esc = R.esc || {}, erw = roffEscRw(esc), escTxt = (Object.keys(erw).length || esc.gold > 0) ? `<br>보관 중: <span class="rws">${rwHTML(erw)}</span>${esc.gold > 0 ? ` 월급 ${fmt(esc.gold)}원` : ""}` : "";
    let h = "";
    if (on && t >= on.from) h += `<div class="rof-on"><b>${dayDiff(on.from, t) + 1}일째 · ${festMD(on.from)} ~ ${festMD(on.to)}</b><small>말씀·묵상·암송·공부에 붙은 보상이 꺼져 있어요 · 기록·연속·순례 XP는 그대로 · 첫 완독 같은 한 번뿐인 보상은 보관했다가 주가 끝나면 드려요${escTxt}</small></div><button type="button" class="btn${ask ? " warn" : ""}" data-act="stop">${ask ? "한 번 더 누르면 지금 마쳐요" : "지금 마치기"}</button>`;
    else if (on) h += `<div class="rof-on"><b>${festMD(on.from)} 월요일부터 7일</b><small>${on.base ? `비교할 평소: 말씀 ${on.base.c.toFixed(1)}일 · 공부 ${studyText(on.base.s)} · 암송 ${Math.round(on.base.m)}구절 (지난 주들 평균)` : "평소 기록이 2주 넘지 않아 결과는 기록만 보여 드려요"}</small></div><button type="button" class="btn" data-act="stop">취소</button>`;
    else {
      const due = !last || dayDiff(last.from, t) >= 84, enough = dayDiff(first, t) >= 14;
      h += `<p class="muted">월요일부터 7일 동안 게임 보상을 끄고 말씀·암송·공부를 해 봐요. 평소의 80%를 넘기면 보상이 없어도 이어 가는 힘이 있다는 뜻이에요.${enough ? "" : " 평소 기록이 2주 쌓이면 결과를 비교할 수 있어요."}</p>`;
      h += `<button type="button" class="buy num${due ? "" : " ghost"}" data-act="start"><span class="act">${roffNextMon() === t ? "오늘부터 시작" : `${festMD(roffNextMon())} 월요일부터`}</span>${due ? "<small>이번 분기 아직</small>" : `<small>다음 권장: ${festMD(addDays(last.from, 84))}쯤</small>`}</button>`;
    }
    if (R.hist.length) h += `<ul class="rof-h">${R.hist.slice(-3).reverse().map(x => `<li><b>${festMD(x.from)} 주</b> ${x.early ? "중간에 마침" : x.pct == null ? "비교 없음" : `평소의 ${x.pct}%`}${x.got ? ` · 말씀 ${x.got.c}일 · 암송 ${Math.round(x.got.m)}구절` : ""}</li>`).join("")}</ul>`;
    if (R.unl) h += `<div class="rof-w"><b>외적 보상 비중</b><small>말씀·묵상·암송의 만나와 공부 광석에 적용 · 도장·순례는 그대로</small><div class="seg">${[100, 80, 60].map(v => `<button type="button" data-act="wgt" data-v="${v}" aria-pressed="${R.wgt === v}">${v}%</button>`).join("")}</div></div>`;
    return h;
  }, force);
}

/* ---------- 말씀 탭: 읽을 때와 곳 (실행 의도) ---------- */
function buildIICard() {
  const card = el("div", "card iip");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="iiIc"></span><div><b>읽을 때와 곳</b><small>언제·무엇 다음에·어디서 읽을지 정해 두면 실제로 읽게 될 가능성이 커져요</small></div></div><div id="iiBody"></div>`;
  addCustom("bible", card, () => iiRender(false));
  card.addEventListener("input", () => { if (measUI.iiEdit) iiPaint(); });
  card.addEventListener("change", () => { if (measUI.iiEdit) iiPaint(); });
  const ic = $("iiIc"); if (ic) ic.appendChild(pixIcon("bell", 30));
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset) return; const a = b.dataset.act, I = iiState();
    if (a === "edit") { measUI.iiEdit = true; measUI.iiDraft = Object.assign({}, I, { on: 1 }); measUI.k.ii = ""; iiRender(true); }
    else if (a === "cancel") { measUI.iiEdit = false; measUI.k.ii = ""; iiRender(true); }
    else if (a === "day") { const d = measUI.iiDraft; if (!d) return; const bit = 1 << +b.dataset.i; d.days = d.days ^ bit; if (!d.days) d.days = bit; iiPaint(); }
    else if (a === "save") iiSave();
    else if (a === "off") { I.on = 0; measUI.iiEdit = false; measUI.k.ii = ""; if (I.push) notiOff(true); toast("읽을 때와 곳을 지웠어요"); updateUI(true); save(); }
    else if (a === "non") notiOn();
    else if (a === "noff") notiOff(false);
    else if (a === "ntest") notiTest();
    else if (a === "nres") notiResume();
  });
}
function iiRender(force) {
  const I = iiState(), box = $("iiBody"); if (!box) return;
  if (measUI.iiEdit) {
    if (measPart("iiBody", "edit", () => iiFormHTML(), force || measUI.k.iiBody !== "edit")) iiPaint();
    return;
  }
  notiStatus();
  if (measUI.iiMsg && !measUI.busy && Date.now() - (measUI.iiMsgAt || 0) > 12000) measUI.iiMsg = "";
  const cx = measContext(), ns = measUI.nst, a = acctGet();
  const key = JSON.stringify([I, cx, ns, measUI.iiMsg, !!a, measUI.busy, dayKey()]);
  if (!force && measUI.k.ii === key) return; measUI.k.ii = key; measUI.k.iiBody = "view";
  let h = "";
  if (!I.on) h = `<p class="muted">예: 평일 오전 7:30, 아침 먹고 나서 식탁에서 말씀을 펼쳐요</p><button type="button" class="buy num" data-act="edit"><span class="act">정하기</span></button>`;
  else {
    h = `<p class="iip-s">${escapeHtml(iiSentence(I))}${I.t2 ? `<small>두 번째 알림 ${iiTimeText(I.t2)}</small>` : ""}</p>`;
    h += `<div class="iip-m">${cx.v == null ? "계획한 시간 ±1시간 안에 읽은 날을 세고 있어요" : `최근 14일 계획한 시간 ±1시간 안에 읽은 날 <b class="num">${cx.ok}/${cx.n}</b>`}</div>`;
    const paused = I.push && ns && ns.paused, lost = I.push && ns && ns.ok && ns.subs === 0;
    h += `<div class="iip-n${I.push && !lost ? " on" : ""}">${ri("bell")}<span>${!I.push ? "알림 꺼짐" : lost ? "이 계정에 연결된 기기가 없어요 · 알림 켜기를 다시 눌러 주세요" : paused ? "알림이 쉬는 중이에요 · 알림 온 날을 세 번 그냥 넘겨서 잠시 멈췄어요" : `알림 켜짐 · ${iiTimeText(I.t)}${I.t2 ? `·${iiTimeText(I.t2)}` : ""} · 아직 안 읽은 날만 · 세 번 그냥 넘기면 쉬어요`}</span></div>`;
    h += `<div class="row-btns iip-b"><button type="button" class="btn" data-act="edit">고치기</button>${!I.push || lost ? `<button type="button" class="btn manna" data-act="non"${measUI.busy ? " disabled" : ""}>알림 켜기</button>${lost ? `<button type="button" class="btn" data-act="noff">끄기</button>` : ""}` : paused ? `<button type="button" class="btn manna" data-act="nres">다시 켜기</button><button type="button" class="btn" data-act="noff">끄기</button>` : `<button type="button" class="btn" data-act="ntest"${measUI.busy ? " disabled" : ""}>시험 알림</button><button type="button" class="btn" data-act="noff">알림 끄기</button>`}</div>`;
  }
  if (measUI.iiMsg) h += `<p class="iip-msg">${escapeHtml(measUI.iiMsg)}</p>`;
  box.innerHTML = h;
}
function iiFormHTML() {
  const d = measUI.iiDraft || iiNew();
  return `<div class="iip-f"><label><span>언제</span><input type="time" id="iiT" value="${d.t}"></label>
    <label><span>무엇 다음에 <small>선택</small></span><input type="text" id="iiCue" maxlength="20" placeholder="아침 먹고 나서" value="${escapeHtml(d.cue)}"></label>
    <label><span>어디서 <small>선택</small></span><input type="text" id="iiWhere" maxlength="20" placeholder="식탁" value="${escapeHtml(d.where)}"></label>
    <div class="iip-days">${II_DAYS.map((x, i) => `<button type="button" data-act="day" data-i="${i}">${x}</button>`).join("")}</div>
    <label><span>두 번째 알림 <small>선택 · 아직 안 읽었으면</small></span><input type="time" id="iiT2" value="${d.t2 || ""}"></label>
    <p class="iip-pv" id="iiPv"></p>
    <div class="row-btns"><button type="button" class="btn" data-act="cancel">닫기</button>${iiState().on ? `<button type="button" class="btn" data-act="off">지우기</button>` : ""}<button type="button" class="buy num" data-act="save"><span class="act">정하기</span></button></div></div>`;
}
function iiDraftRead() { const d = measUI.iiDraft; if (!d) return null; d.t = measHM(($("iiT") || {}).value) || d.t; d.t2 = measHM(($("iiT2") || {}).value); d.cue = measTxt(($("iiCue") || {}).value, 20); d.where = measTxt(($("iiWhere") || {}).value, 20); if (d.t2 === d.t) d.t2 = ""; return d; }
function iiPaint() {
  const d = iiDraftRead(), box = $("iiBody"); if (!d || !box) return;
  box.querySelectorAll(".iip-days button").forEach(b => { const on = !!(d.days & (1 << +b.dataset.i)); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
  const pv = $("iiPv"); if (pv) pv.textContent = iiSentence(d);
}
function iiSave() {
  const d = iiDraftRead(); if (!d) return;
  if (d.t2 && d.t2 < d.t) { toast("두 번째 알림은 첫 시각보다 늦게 정해 주세요"); return; }
  const I = iiState(), was = I.on;
  Object.assign(I, { on: 1, t: d.t, t2: d.t2, cue: d.cue, where: d.where, days: d.days, tz: -new Date().getTimezoneOffset() });
  if (!was || !I.since) I.since = dayKey();
  measUI.iiEdit = false; measUI.iiDraft = null; measUI.k.ii = "";
  toast(`정했어요 · ${iiSentence(I)}`);
  updateUI(true); save(); if (I.push && acctGet() && cloudOn()) cloudPush(true);
}
