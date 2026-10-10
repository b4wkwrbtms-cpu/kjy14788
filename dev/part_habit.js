/* ===================== 습관 지키기 (v28 · 고도화 1단계) =====================
   1) 연속 지키기: 하루 최소 행동(말씀 1장 · 공부 10분 · 암송 5구절)이면 그날 연속이 이어짐.
      다 쉬어 간 날은 보호권(월요일마다 1개, 최대 2개)이 자동으로 그날을 지킴.
      보호권이 없으면 이틀 안에 말씀 2장 · 공부 50분 · 암송 10구절로 다시 이음(48시간 회복).
      안식 모드(최대 14일) 동안은 연속·주간 목표가 그대로. 주일엔 공부 연속이 쉬어 감.
   2) 이번 주 말씀 n일(북극성): 기본 4일, 3~7일에서 고름. 안식한 날만큼 목표가 줄어듦.
   3) 말씀 확인: 오늘 읽은 시간(읽기 타이머 + 본문 화면) ≥ 확인한 장들의 최소 시간 합.
      장마다 최소 시간 = 글자 수 ÷ (내 읽기 속도 × 1.5), 처음엔 분당 1,000자로 가정.
      너무 빨리 넘긴 장은 기록만 남고, 읽은 시간이 쌓이면 저절로 확인되어 선물이 옴.
   4) 예고 없는 선물(하루 2번까지), 묵상 노트, 화면 설정(흔들림·번쩍임), 번쩍임 안전 규칙.
   rollDay·merge·load 에서 부르므로 함수 선언과 var 만 씀 */
var HB_KINDS = ["bible", "study", "mem"];
var HB_NAME = { bible: "말씀", study: "공부", mem: "암송" };
var HB_UNIT = { bible: "장", study: "분", mem: "구절" };
var HB_BIT = { bible: 1, study: 2, mem: 4 };
var HB_MIN = { bible: 1, study: 10, mem: 5 };
var HB_REC_NEED = { bible: 2, study: 50, mem: 10 };
var HB_SH_MAX = 2;
var HB_GIFT_P = { bible: 0.2, study: 0.3, mem: 0.3, med: 0.5 }, HB_GIFT_MAX = 2;
var HB_GIFTS = {
  bible: [{ manna: 25 }, { stamp: 2 }, { haste: 1 }, { gold2: 1 }],
  study: [{ ore: 250 }, { silver: 2 }, { rage: 1 }, { ore: 150, haste: 1 }],
  mem: [{ manna: 30 }, { stamp: 3 }, { ame: 1 }, { gold2: 1 }],
  med: [{ stamp: 3 }, { manna: 40 }, { ame: 1 }],
};
var HB_GIFT_WHY = { bible: "말씀을 읽다가 받은 선물이에요", study: "공부하다가 받은 선물이에요", mem: "암송하다가 받은 선물이에요", med: "묵상을 남기다가 받은 선물이에요" };
var HB_WHY = ["시험", "수련회·여행", "아픔", "그냥 쉼"];
var RD_CPM0 = 1000;
var hkUI = { open: false, days: 3, why: "" };
var flashHist = [], flashPrev = 0;

/* ---------- 아이콘: 믿음의 방패 · 안식의 달 · 선물 ---------- */
UIICON.shield = { m: ["..............", "..BBBBBBBBBB..", ".BwwwwwwwwwwB.", ".BwwwwggwwwwB.", ".BwwwwggwwwwB.", ".BwwggggggwwB.", ".BwwggggggwwB.", ".BwwwwggwwwwB.", "..BwwwggwwwB..", "..BwwwwwwwwB..", "...BwwwwwwB...", "....BwwwwB....", ".....BBBB.....", ".............."], p: { B: "#2f6fd0", w: "#cfe3ff", g: "#ffd54a" } };
UIICON.moon = { m: ["..............", ".....yyyy.....", "...yyyY.......", "..yyyY........", "..yyY.........", ".yyyY.....s...", ".yyyY....sss..", ".yyyY.....s...", ".yyyyY........", "..yyyyY.......", "..yyyyyYY..YY.", "...yyyyyyyyy..", ".....yyyyy....", ".............."], p: { y: "#ffe08a", Y: "#d9b45a", s: "#ffffff" } };
UIICON.gift = { m: ["..............", "...rr....rr...", "..r..r..r..r..", "...rrrrrrrr...", ".GGGGGrrGGGGG.", ".GgggGrrGgggG.", ".GGGGGrrGGGGG.", "..bbbbrrbbbb..", "..bbbbrrbbbb..", "..bbbbrrbbbb..", "..bbbbrrbbbb..", "..bbbbrrbbbb..", "..BBBBrrBBBB..", ".............."], p: { r: "#ffd54a", G: "#2f6fd0", g: "#6fd3ff", b: "#4aa3e0", B: "#2a5ea8" } };
(function hbIconCss() {
  try {
    if (!document.head || !document.createElement("canvas").toDataURL) return;
    const css = ["shield", "moon", "gift"].map(n => `.ri-${n},span.ri-${n},i.ri-${n}{background-image:url(${pixIcon(n, 16).toDataURL("image/png")})}`).join("");
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  } catch (e) {}
})();

/* ---------- 저장값 ---------- */
function hbWeekOf(d) { return addDays(d, -((keyDate(d).getDay() + 6) % 7)); }
function habitNew(st) {
  st = st || S; const today = dayKey();
  const H = { v: 1, sh: HB_SH_MAX, shW: hbWeekOf(today), cover: {}, td: {}, rest: null, restLog: [], sunRest: true, wgoal: 4, wcel: "", news: [], cq: [], gift: { d: "", n: 0 }, from: addDays(today, -2), intro: 0 };
  try {
    const L = (st && st.att && st.att.log) || {}, lim = addDays(today, -21);
    for (const k in L) {
      if (k < lim || k > today) continue;
      const r = L[k] || {}; let m = 0;
      if (r.c) m |= 1; if (r.s === -1 || r.s >= HB_MIN.study) m |= 2; if (r.m) m |= 4;
      if (m) H.td[k] = m;
    }
    const D = st && st.day && st.day.key === today ? st.day : null;
    if (D) { let m = H.td[today] || 0; if (D.chap > 0) m |= 1; if ((D.study || 0) >= HB_MIN.study) m |= 2; if (D.mem > 0) m |= 4; if (m) H.td[today] = m; }
    HB_KINDS.forEach(k => { const X = st && st[k]; if (X && X.last && X.last >= lim && X.last <= today && (X.streak || 0) > 0) H.td[X.last] = (H.td[X.last] || 0) | HB_BIT[k]; });
  } catch (e) {}
  return H;
}
function habitMerge(h, st) {
  const o = habitNew(st);
  if (!h || typeof h !== "object") return o;
  o.sh = Math.max(0, Math.min(HB_SH_MAX, Math.floor(+h.sh || 0)));
  if (typeof h.shW === "string" && h.shW) o.shW = h.shW;
  o.cover = h.cover && typeof h.cover === "object" ? Object.assign({}, h.cover) : {};
  if (h.td && typeof h.td === "object") o.td = Object.assign({}, h.td);
  o.rest = h.rest && h.rest.from && h.rest.to ? { from: String(h.rest.from), to: String(h.rest.to), why: String(h.rest.why || "") } : null;
  o.restLog = Array.isArray(h.restLog) ? h.restLog.filter(r => r && r.from && r.to).map(r => ({ from: String(r.from), to: String(r.to), why: String(r.why || "") })).slice(-20) : [];
  o.sunRest = h.sunRest !== false;
  o.wgoal = Math.max(3, Math.min(7, Math.floor(+h.wgoal || 4)));
  o.wcel = typeof h.wcel === "string" ? h.wcel : "";
  o.news = Array.isArray(h.news) ? h.news.filter(n => n && n.t).slice(-12) : [];
  o.cq = Array.isArray(h.cq) ? h.cq.filter(c => c && c.title).slice(-4) : [];
  o.gift = h.gift && typeof h.gift === "object" ? { d: String(h.gift.d || ""), n: Math.max(0, +h.gift.n || 0) } : { d: "", n: 0 };
  if (typeof h.from === "string" && h.from) o.from = h.from;
  o.intro = +h.intro || 0;
  return o;
}
function habitState() { if (!S.habit || typeof S.habit !== "object" || !S.habit.td) S.habit = habitNew(S); return S.habit; }
/* 예전 저장: 오늘 이미 체크한 장은 확인된 것으로 */
function hbMigrateBible(B) {
  if (!B) return;
  (Array.isArray(B.today) ? B.today : []).forEach(e => { if (e && e.pf === undefined) { e.pf = 1; e.need = 0; } });
  if (!Array.isArray(B.notes)) B.notes = [];
  if (!(+B.cpm >= 300 && +B.cpm <= 1500)) B.cpm = RD_CPM0;
}
function fxMerge(f) {
  const o = { shake: 1, flash: 1 };
  if (f && typeof f === "object") { if ([0, 0.5, 1].indexOf(+f.shake) >= 0) o.shake = +f.shake; if ([0, 0.5, 1].indexOf(+f.flash) >= 0) o.flash = +f.flash; }
  return o;
}

/* ---------- 말씀 확인 (읽은 시간) ---------- */
function chChars(b, c) { try { const W = chw(); return (W[gIdx(b, c)] || 1) * 25; } catch (e) { return 1500; } }
function rdCpm() { const v = +S.bible.cpm; return v >= 300 && v <= 1500 ? v : RD_CPM0; }
function needSec(b, c) { return Math.max(10, Math.min(480, Math.round(chChars(b, c) / (rdCpm() * 1.5) * 60))); }
function readSecToday() { const B = S.bible; return (+B.rsec || 0) + (B.timer ? Math.max(0, Math.min(6 * 3600, (Date.now() - B.timer) / 1000)) : 0); }
function proofAvail() { return readSecToday() - (+S.bible.pused || 0); }
function todayEntry(b, c) { return S.bible.today.find(e => e.b === b && e.c === c) || null; }
function pendSum() { let n = 0; S.bible.today.forEach(x => { if (!x.pf) n += x.need || 0; }); return n; }
function pendLeft(e) { let n = 0; for (const x of S.bible.today) { if (x.pf) continue; n += x.need || 0; if (x === e) break; } return n - proofAvail(); }
/* 지금 본문을 다음 장으로 넘기면 체크되기까지 남은 초 */
function rdLeft() { return rd ? needSec(rd.b, rd.c) + pendSum() - proofAvail() : 0; }
function rdPf(b, c) { const e = todayEntry(b, c); return !e || !!e.pf; }
function rdPendTxt() { const e = rd && todayEntry(rd.b, rd.c); if (!e || e.pf) return "오늘 읽음 ✓"; return `기록됨 · ${hbSecTxt(pendLeft(e))} 더 읽으면 ✓`; }
/* 끝까지 읽고 넘길 때 그 장을 읽은 속도로 내 읽기 속도를 조금씩 맞춤 */
function rdSpeedNote() {
  if (!rd || !rd.bottom || !rd.verses || !rd.verses.length) return;
  const B = S.bible, sec = (Date.now() - rd.t0) / 1000, need = needSec(rd.b, rd.c), cpm = rdCpm();
  if (sec < need || sec > 1800) return;
  const obs = Math.max(cpm * 0.5, Math.min(cpm * 1.5, chChars(rd.b, rd.c) / (sec / 60)));
  B.cpm = Math.round(Math.max(300, Math.min(1500, 0.8 * cpm + 0.2 * obs)));
}
function chapProof(e) {
  const B = S.bible; e.pf = 1; B.pused = (+B.pused || 0) + (e.need || 0);
  B.total++; S.day.chap++; if (S.week) S.week.chap++;
  let msg = `${BOOKS[e.b][0]} ${e.c + 1}장 읽음`;
  if (B.rewarded < READ_CAP) { const m = Math.round(10 * readMult()); e.rw = { manna: m, stamp: 1 }; S.manna += m; S.stamp += 1; B.rewarded++; msg += ` · 만나 +${m}, 도장 +1`; }
  else msg += " · 오늘 선물은 다 받았고, 기록은 계속 쌓여요";
  toast(msg);
  habitTouch("bible"); habitRecAdd("bible", 1);
  planOnRead(e.b, e.c, e);
  graceGift("bible");
}
function chapUnproof(e) {
  const B = S.bible;
  B.total = Math.max(0, B.total - 1); S.day.chap = Math.max(0, S.day.chap - 1); if (S.week) S.week.chap = Math.max(0, S.week.chap - 1);
  B.pused = Math.max(0, (+B.pused || 0) - (e.need || 0));
  if (e.rw) { S.manna = Math.max(0, S.manna - e.rw.manna); S.stamp = Math.max(0, S.stamp - e.rw.stamp); B.rewarded = Math.max(0, B.rewarded - 1); }
  habitRecAdd("bible", -1);
  if (S.day.chap <= 0) habitUntouch("bible");
}
/* 기록만 남은 장: 읽은 시간이 쌓이면 먼저 남긴 장부터 확인 */
function proofSweep() {
  const B = S.bible; if (!B || !B.today || !B.today.length) return false;
  let any = false;
  for (const e of B.today) { if (e.pf) continue; if (proofAvail() >= (e.need || 0)) { chapProof(e); any = true; } else break; }
  if (any && rd) renderReader();
  return any;
}
function planProofOK() { return S.bible.today.every(e => !e.plan || e.pf); }
function noteLog(text) {
  const B = S.bible, t = dayKey(); if (!Array.isArray(B.notes)) B.notes = [];
  const last = B.notes[B.notes.length - 1];
  if (last && last.d === t) last.t = text; else B.notes.push({ d: t, t: text });
  if (B.notes.length > 400) B.notes = B.notes.slice(-400);
}

/* ---------- 연속 ---------- */
function hbObj(k) { return k === "bible" ? S.bible : k === "study" ? S.study : S.mem; }
function hbAlive(k, d) { const X = hbObj(k); return (X.streak || 0) > 0 && X.last === addDays(d, -1); }
function hbSun(d) { return keyDate(d).getDay() === 0; }
function restOn(d) {
  const H = habitState();
  if (H.rest && H.rest.from <= d && d <= H.rest.to) return H.rest.why || "쉼";
  for (const r of H.restLog || []) if (r.from <= d && d <= r.to) return r.why || "쉼";
  return "";
}
function hbStreakNow(k) { return k === "bible" ? readStreak() : k === "study" ? studyStreak() : memStreak(); }
/* 최소 행동을 채운 순간 그날 연속을 이음 (true = 오늘 처음) */
function habitTouch(k) {
  const X = hbObj(k), t = dayKey(), H = habitState();
  H.td[t] = (H.td[t] || 0) | HB_BIT[k];
  if (X.last === t) return false;
  X.sPrev = [X.last || "", X.streak || 0, X.best || 0, t];
  X.streak = (X.last === addDays(t, -1) ? X.streak || 0 : 0) + 1; X.last = t; X.best = Math.max(X.best || 0, X.streak);
  if (X.rec) X.rec.after = (X.rec.after || 0) + 1;
  if (k === "bible") weekGoalCheck();
  return true;
}
/* 오늘 한 것을 취소해서 최소 행동 아래로 내려가면 되돌림 */
function habitUntouch(k) {
  const X = hbObj(k), t = dayKey(), H = habitState();
  if (H.td[t]) { H.td[t] &= ~HB_BIT[k]; if (!H.td[t]) delete H.td[t]; }
  if (X.last !== t || !X.sPrev || X.sPrev[3] !== t) return;
  X.last = X.sPrev[0]; X.streak = X.sPrev[1]; X.best = X.sPrev[2]; X.sPrev = null;
  if (X.rec) X.rec.after = Math.max(0, (X.rec.after || 0) - 1);
}
function habitRecAdd(k, v) {
  const X = hbObj(k), t = dayKey();
  if (!X.rec || !(t > X.rec.d) || t > recUntil(X.rec)) return;
  X.rec.got = Math.max(0, (X.rec.got || 0) + v);
  if (X.rec.got >= X.rec.need) {
    X.rec = null;
    celebrateLater({ ic: k, title: `${HB_NAME[k]} 연속이 다시 이어졌어요!`, sub: `쉬어 간 날을 메우고 연속 ${X.streak || 0}일 그대로예요`, tone: "manna", sound: "pass" });
  }
}
/* 회복 기한: 쉬어 간 날 다음 이틀, 그 사이 안식한 날만큼 늦춰짐 */
function recUntil(rec) { let u = rec.until; for (let d = addDays(rec.d, 1), g = 0; d <= u && g < 60; d = addDays(d, 1), g++) if (restOn(d)) u = addDays(u, 1); return u; }
function hbSecTxt(sec) { sec = Math.max(1, Math.ceil(sec)); return sec < 90 ? `${sec}초` : `약 ${Math.ceil(sec / 60)}분`; }
function hbGrant(d) { const H = habitState(), wk = hbWeekOf(d); if (H.shW !== wk) { if ((H.sh || 0) < HB_SH_MAX) H.sh = (H.sh || 0) + 1; H.shW = wk; } }
function attLenBefore(d) { const L = attLog(); let n = 0, k = addDays(d, -1); while (n < 4000 && L[k] && L[k].a) { n++; k = addDays(k, -1); } return n; }
/* 하루가 바뀔 때(그리고 켤 때) 지난날을 살펴 연속을 지킴 */
function habitGuard() {
  if (!S || !S.bible || !S.study || !S.mem) return;
  const H = habitState(), today = dayKey(), y = addDays(today, -1), news = [];
  HB_KINDS.forEach(k => {
    const X = hbObj(k);
    if (X.rec && today > recUntil(X.rec)) { const was = X.streak || 0, keep = X.rec.after || 0; X.rec = null; X.streak = keep; news.push({ t: "fresh", k, was, now: keep, best: X.best || 0 }); }
  });
  let start = today;
  HB_KINDS.forEach(k => { const X = hbObj(k); if ((X.streak || 0) > 0 && X.last && X.last < y) { const s = addDays(X.last, 1); if (s < start) start = s; } });
  const L = attLog();
  { let k = y, n = 0; while (n < 60 && !(L[k] && L[k].a)) { k = addDays(k, -1); n++; } if (n > 0 && n < 60) { const s = addDays(k, 1); if (s < start) start = s; } }
  if (H.from && start < H.from) start = H.from;
  for (let d = start, g = 0; d < today && g < 400; d = addDays(d, 1), g++) {
    hbGrant(d);
    const risk = HB_KINDS.filter(k => hbAlive(k, d) && !((H.td[d] || 0) & HB_BIT[k]));
    if (H.sunRest && hbSun(d) && risk.indexOf("study") >= 0) { risk.splice(risk.indexOf("study"), 1); S.study.last = d; }
    const attN = (L[d] && L[d].a) ? 0 : attLenBefore(d);
    if (!risk.length && !attN) continue;
    let cover = H.cover[d] || (restOn(d) ? "r" : "");
    if (!cover && !H.td[d] && (H.sh || 0) > 0 && (risk.some(k => (hbObj(k).streak || 0) >= 2) || attN >= 2)) {
      H.sh--; cover = "s"; news.push({ t: "shield", d, ks: risk.slice(), att: attN });
    }
    if (cover) {
      H.cover[d] = cover;
      risk.forEach(k => { hbObj(k).last = d; });
      if (attN) { const r = L[d] || (L[d] = {}); r.a = cover === "s" ? 3 : 4; attVer = (attVer || 0) + 1; }
      continue;
    }
    risk.forEach(k => {
      const X = hbObj(k);
      if (X.rec) { news.push({ t: "fresh", k, was: X.streak || 0, now: 0, best: X.best || 0 }); X.rec = null; X.streak = 0; return; }
      if (dayDiff(d, today) <= 2) { X.rec = { d, until: addDays(d, 2), need: HB_REC_NEED[k], got: 0, after: 0 }; X.last = d; news.push({ t: "rec", k, d, n: X.streak || 0 }); }
      else { news.push({ t: "fresh", k, was: X.streak || 0, now: 0, best: X.best || 0 }); X.streak = 0; }
    });
  }
  hbGrant(today);
  if (H.rest && H.rest.to < today) { H.restLog = (H.restLog || []).concat([H.rest]).slice(-20); H.rest = null; }
  hbPrune(H);
  if (news.length) H.news = (H.news || []).concat(news.map(n => Object.assign(n, { on: today }))).slice(-12);
  if (!H.intro) {
    H.intro = 1;
    if ((S.totalKills || 0) > 40 || (S.bible.total || 0) > 0) celebrateLater({ ic: "shield", title: "연속 지키기가 생겼어요", sub: "하루 쉬어도 연속이 지켜져요 · 보호권 2개를 드려요<br>업무 탭 '연속 지키기'에서 자세히 볼 수 있어요", tone: "rare", sound: "pass", ms: 3600 });
  }
}
function hbPrune(H) {
  const lim = addDays(dayKey(), -400);
  ["cover", "td"].forEach(f => { for (const k in H[f]) if (k < lim) delete H[f][k]; });
  H.restLog = (H.restLog || []).filter(r => r.to >= lim);
  const old = addDays(dayKey(), -2); H.news = (H.news || []).filter(n => !n.on || n.on >= old);
}

/* ---------- 이번 주 말씀 ---------- */
function weekDaysOf(wk) { const out = []; for (let i = 0; i < 7; i++) out.push(addDays(wk, i)); return out; }
function weekBibleN() { const H = habitState(); return weekDaysOf(weekKey()).filter(d => (H.td[d] || 0) & 1).length; }
function weekRestN() { return weekDaysOf(weekKey()).filter(d => restOn(d)).length; }
function wkScale(g) { const r = weekRestN(); return r >= 7 ? 0 : Math.max(1, Math.ceil(g * (7 - r) / 7)); }
function wkHours() { return +(wkScale(300) / 60).toFixed(1); }
function wGoal() { const H = habitState(); return wkScale(Math.max(3, Math.min(7, H.wgoal || 4))); }
function weekGoalCheck() {
  const H = habitState(), wk = weekKey(), g = wGoal(); if (!g || H.wcel === wk) return;
  if (weekBibleN() >= g) { H.wcel = wk; celebrateLater({ ic: "bible", title: `이번 주 말씀 ${g}일!`, sub: "이번 주 목표를 채웠어요 · 업무 탭에서 주간 선물을 받을 수 있어요", tone: "rare", sound: "pass", ms: 2800 }); }
}

/* ---------- 안식 모드 ---------- */
function restStart(days, why) {
  const H = habitState(), t = dayKey();
  if (H.rest) restEnd(true);
  days = Math.max(1, Math.min(14, Math.floor(days) || 1));
  H.rest = { from: t, to: addDays(t, days - 1), why: why || "" };
  toast(`안식 모드 · ${mdText(H.rest.to)}까지 연속과 주간 목표가 그대로예요`);
}
function restEnd(silent) {
  const H = habitState(); if (!H.rest) return;
  const y = addDays(dayKey(), -1);
  if (H.rest.from <= y) H.restLog = (H.restLog || []).concat([{ from: H.rest.from, to: H.rest.to < y ? H.rest.to : y, why: H.rest.why }]).slice(-20);
  H.rest = null; if (!silent) toast("안식 모드를 마쳤어요 · 오늘부터 다시 함께해요");
}
function restDays60() { const H = habitState(), t = dayKey(), lim = addDays(t, -59); let n = 0; for (let d = lim; d <= t; d = addDays(d, 1)) if (restOn(d)) n++; return n; }

/* ---------- 예고 없는 선물 · 미뤄 둔 축하 ---------- */
function graceGift(k) {
  const H = habitState(), t = dayKey();
  if (!H.gift || H.gift.d !== t) H.gift = { d: t, n: 0 };
  if (H.gift.n >= HB_GIFT_MAX || Math.random() >= (HB_GIFT_P[k] || 0)) return null;
  H.gift.n++;
  const tb = HB_GIFTS[k] || HB_GIFTS.bible, rw = Object.assign({}, tb[Math.floor(Math.random() * tb.length)]);
  grant(rw);
  celebrateLater({ ic: "gift", title: "뜻밖의 선물", sub: `${HB_GIFT_WHY[k] || ""}<br><span class="rws">${rwHTML(rw)}</span>`, tone: "manna", sound: "pass", ms: 2200 });
  return rw;
}
/* 말씀·암송 화면에는 게임 연출을 띄우지 않고, 닫은 뒤에 보여 줌 */
function celebrateLater(o) { const H = habitState(); H.cq = (H.cq || []).concat([o]).slice(-4); celebFlush(); }
function celebFlush() {
  const H = S && S.habit; if (!H || !H.cq || !H.cq.length) return;
  if (rd || memSess || backOn || !backReady || S.away || !attOn(dayKey())) return;
  const q = H.cq; H.cq = []; q.forEach(o => celebrate(o));
}

/* ---------- 글귀 ---------- */
/* 받침에 따라 은/는, 과/와 */
function hbJosa(w, a, b) {
  const s = String(w), ch = s.trim().slice(-1), c = ch.charCodeAt(0);
  if (c >= 0xAC00 && c <= 0xD7A3) return s + ((c - 0xAC00) % 28 ? a : b);
  if (/[0-9]/.test(ch)) return s + ("013678".indexOf(ch) >= 0 ? a : b);
  return s + b;
}
function dayWord(d) { const t = dayKey(); return d === addDays(t, -1) ? "어제" : d === addDays(t, -2) ? "그저께" : d === t ? "오늘" : mdText(d).replace(/ \(.\)$/, ""); }
function untilWord(u) { const t = dayKey(); return u === t ? "오늘" : u === addDays(t, 1) ? "내일" : mdText(u); }
function recProg(k, X) { const got = X.rec.got || 0; return k === "study" ? `${Math.floor(got)}/${X.rec.need}분` : `${got}/${X.rec.need}${HB_UNIT[k]}`; }
function hbNote(k) {
  const X = hbObj(k), t = dayKey();
  if (restOn(t)) return { rest: true, h: `${ri("moon")}안식 중이에요 · 쉬는 동안 연속과 주간 목표가 그대로 지켜져요` };
  if (X.rec && t <= recUntil(X.rec)) {
    const left = Math.max(0, X.rec.need - (X.rec.got || 0)), amt = k === "study" ? `${Math.ceil(left)}분` : `${left}${HB_UNIT[k]}`;
    return { rest: false, h: `${ri("moon")}${hbJosa(dayWord(X.rec.d), "은", "는")} 쉬어 갔어요 · ${untilWord(recUntil(X.rec))}까지 ${HB_NAME[k]} ${amt} 더 하면 연속 ${X.streak || 0}일이 그대로 이어져요 <b class="num">${recProg(k, X)}</b>` };
  }
  return null;
}
function hbNewsHTML() {
  const H = habitState(), out = [];
  (H.news || []).forEach(n => {
    if (n.t === "shield") out.push(`<div>${ri("shield")}<span>${hbJosa(dayWord(n.d), "은", "는")} 보호권이 지켜 줬어요${n.ks && n.ks.length ? ` · ${n.ks.map(k => HB_NAME[k]).join("·")} 연속 그대로` : n.att ? " · 출근 연속 그대로" : ""}</span></div>`);
    else if (n.t === "rec") { const X = hbObj(n.k); if (X.rec && X.rec.d === n.d) out.push(`<div>${ri("moon")}<span>${hbJosa(dayWord(n.d), "은", "는")} 쉬어 갔어요 · ${untilWord(recUntil(X.rec))}까지 ${HB_NAME[n.k]} ${HB_REC_NEED[n.k]}${HB_UNIT[n.k]}이면 연속 <b>${n.n}</b>일이 이어져요</span></div>`); }
    else if (n.t === "fresh" && n.was > 0) { const tot = n.k === "bible" ? `누적 ${S.bible.total}장` : n.k === "study" ? `누적 ${(S.study.total / 60).toFixed(1)}시간` : `외운 구절 ${memMastered()}개`; out.push(`<div>${ri(n.k)}<span>${HB_NAME[n.k]} 연속은 오늘부터 새로 쌓아요 · ${hbJosa(tot, "과", "와")} 최고 ${n.best}일은 그대로예요</span></div>`); }
  });
  return out.join("");
}

/* ---------- 말씀 탭: 이번 주 말씀 ---------- */
function hbBtn(e, root) { let t = e.target; while (t && t !== root && t.tagName !== "BUTTON") t = t.parentElement || t.parent; return t && t.tagName === "BUTTON" && !t.disabled ? t : null; }
function buildHabitWeek() {
  const card = el("div", "card hbw");
  card.innerHTML = `<div class="hbw-top"><b>이번 주 말씀</b><span class="hbw-n num" id="hbwN"></span></div>
    <div class="hbw-days" id="hbwDays"></div>
    <div class="hbw-sub num" id="hbwSub"></div>
    <div class="hbw-note" id="hbwNote" hidden></div>
    <div class="hbw-goal"><span>주간 목표</span><div class="seg sm" id="hbwGoal" role="group" aria-label="주간 말씀 목표">${[3, 4, 5, 6, 7].map(n => `<button type="button" data-g="${n}" aria-pressed="false">${n}일</button>`).join("")}</div></div>`;
  addCustom("bible", card, () => renderHabitWeek());
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset || !b.dataset.g) return;
    habitState().wgoal = +b.dataset.g; sfx("tick"); weekGoalCheck(); updateUI(true); save();
  });
}
function renderHabitWeek() {
  const box = $("hbwDays"); if (!box) return;
  const H = habitState(), wk = weekKey(), t = dayKey(), days = weekDaysOf(wk), n = weekBibleN(), g = wGoal(), nt = hbNote("bible");
  const key = [wk, t, n, g, H.wgoal, days.map(d => (H.td[d] || 0) + (H.cover[d] || "") + (restOn(d) ? "r" : "")).join(""), readStreak(), S.bible.total, H.sh, nt ? nt.h : ""].join("|");
  if (box._k === key) return; box._k = key;
  $("hbwN").innerHTML = g ? `<b>${n}</b> / ${g}일` : "안식 주간";
  box.innerHTML = days.map((d, i) => {
    const on = (H.td[d] || 0) & 1, cv = on ? "" : H.cover[d] || (restOn(d) ? "r" : ""), fut = d > t;
    const cls = "hbw-d" + (on ? " on" : cv === "s" ? " sh" : cv === "r" ? " rs" : "") + (d === t ? " today" : "") + (fut ? " fut" : "");
    return `<div class="${cls}"><span>${WD[(i + 1) % 7]}</span><i>${on ? "✓" : cv === "s" ? ri("shield") : cv === "r" ? ri("moon") : ""}</i></div>`;
  }).join("");
  $("hbwSub").innerHTML = `<span>누적 <b>${S.bible.total}</b>장</span><span>말씀 연속 <b>${readStreak()}</b>일</span><span>${ri("shield")}보호권 <b>${H.sh}</b></span>`;
  const note = $("hbwNote"); note.hidden = !nt; if (nt) { note.innerHTML = nt.h; note.className = "hbw-note" + (nt.rest ? " rest" : ""); }
  $("hbwGoal").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.g === (H.wgoal || 4))));
}

/* ---------- 업무 탭: 연속 지키기 ---------- */
function buildHabitCard() {
  secTitle("daily", "연속 지키기", "하루 쉬어도 괜찮아요");
  const card = el("div", "card hk");
  card.innerHTML = `<div class="hk-today num" id="hkToday"></div>
    <div class="hk-rows" id="hkRows"></div>
    <div class="hk-sh" id="hkSh"></div>
    <div class="hk-rest" id="hkRest"></div>
    <details class="hk-how"><summary>어떻게 지켜지나요?</summary><ul>
      <li>말씀 1장 · 공부 10분 · 암송 5구절(볼 구절이 적으면 다 보기)만 해도 그날 연속이 이어져요. 더 하는 건 하루 목표예요.</li>
      <li>말씀·공부·암송을 모두 쉬어 간 날은 보호권이 그날을 지켜 줘요. 보호권은 월요일마다 1개씩, 2개까지 모여요.</li>
      <li>보호권이 없을 땐 이틀 안에 말씀 2장 · 공부 50분 · 암송 10구절이면 연속이 그대로 이어져요.</li>
      <li>시험·수련회·아플 때는 안식 모드를 켜 두면 그동안 연속과 주간 목표가 그대로예요.</li>
      <li>주일에는 공부 연속이 쉬어 가요. 말씀은 읽은 시간으로 확인돼요(너무 빨리 넘긴 장은 기록만 남고, 읽은 시간이 쌓이면 확인돼요).</li>
    </ul></details>`;
  addCustom("daily", card, () => renderHabitCard());
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b) return;
    const ds = b.dataset || {};
    if (b.id === "hkOpen") { hkUI.open = !hkUI.open; sfx("tick"); renderHabitCard(true); return; }
    if (ds.days) { hkUI.days = +ds.days; sfx("tick"); renderHabitCard(true); return; }
    if (ds.why != null && ds.why !== "") { hkUI.why = hkUI.why === ds.why ? "" : ds.why; sfx("tick"); renderHabitCard(true); return; }
    if (b.id === "hkGo") { restStart(hkUI.days, hkUI.why); hkUI.open = false; sfx("pass"); updateUI(true); save(); renderHabitCard(true); return; }
    if (b.id === "hkEnd") { restEnd(false); updateUI(true); save(); renderHabitCard(true); return; }
    if (b.id === "hkSun") { const H = habitState(); H.sunRest = !H.sunRest; sfx("tick"); toast(H.sunRest ? "주일엔 공부 연속이 쉬어 가요" : "주일에도 공부 연속을 세요"); save(); renderHabitCard(true); return; }
  });
}
function hkRowHTML(k) {
  const X = hbObj(k), t = dayKey(), n = hbStreakNow(k), H = habitState(), nt = hbNote(k);
  const done = !!((H.td[t] || 0) & HB_BIT[k]);
  let st, cls;
  if (done) { st = "오늘 ✓"; cls = "ok"; }
  else if (nt && nt.rest) { st = "안식 중"; cls = "rest"; }
  else if (X.rec && t <= recUntil(X.rec)) { st = `회복 ${recProg(k, X)}`; cls = "rec"; }
  else if (k === "study" && H.sunRest && hbSun(t)) { st = "주일 쉼"; cls = "rest"; }
  else { st = k === "bible" ? "1장이면 ✓" : k === "study" ? "10분이면 ✓" : "5구절이면 ✓"; cls = "todo"; }
  const sub = k === "bible" ? `누적 ${S.bible.total}장 · 최고 ${X.best || 0}일` : k === "study" ? `누적 ${(S.study.total / 60).toFixed(1)}시간 · 최고 ${X.best || 0}일` : `외운 구절 ${memMastered()}/${VERSES.length} · 최고 ${X.best || 0}일`;
  return `<div class="hk-row"><span class="hk-ic" data-ic="${k}"></span><div><b>${HB_NAME[k]} 연속 <em>${n}</em>일</b><small>${sub}</small></div><span class="hk-st ${cls}">${st}</span></div>`
    + (nt && !nt.rest && !done ? `<div class="hk-note">${nt.h}</div>` : "");
}
function renderHabitCard(force) {
  const rows = $("hkRows"); if (!rows) return;
  const H = habitState(), t = dayKey(), D = S.day || {}, rest = restOn(t);
  const key = [t, H.td[t] || 0, D.chap, Math.floor(S.study.today || 0), D.mem, D.med, D.claimed && D.claimed.all, S.bible.today.length, H.sh, H.sunRest, JSON.stringify(H.rest), hkUI.open, hkUI.days, hkUI.why,
    HB_KINDS.map(k => { const X = hbObj(k); return hbStreakNow(k) + ":" + (X.best || 0) + ":" + (X.rec ? X.rec.d + X.rec.got : ""); }).join(","), S.bible.total, Math.floor(S.study.total || 0), restDays60()].join("|");
  if (!force && rows._k === key) return; rows._k = key;
  const pend = S.bible.today.filter(e => !e.pf).length;
  const today = `<span class="lbl">오늘</span><span>말씀 <b>${D.chap || 0}</b>장${pend ? ` (+${pend} 기록)` : ""}</span><span>공부 <b>${Math.floor(S.study.today || 0)}</b>분</span><span>암송 <b>${D.mem || 0}</b>구절</span><span>묵상 <b>${D.med ? "✓" : "-"}</b></span>`;
  $("hkToday").innerHTML = (D.claimed && D.claimed.all) ? `<div class="hk-done"><i class="moon"></i><div><b>오늘은 여기까지</b><small>오늘 할 일을 다 했어요. 남은 시간은 곽준영이 알아서 일해요 · 내일 또 만나요</small></div></div>`
    : rest ? `<div class="hk-done"><i class="moon"></i><div><b>안식 중이에요</b><small>오늘은 마음 편히 쉬어요. 연속과 주간 목표는 그대로 지켜져요</small></div></div>` : today;
  rows.innerHTML = HB_KINDS.map(hkRowHTML).join("");
  rows.querySelectorAll(".hk-ic").forEach(s => { s.innerHTML = ""; s.appendChild(pixIcon(s.dataset.ic, 28)); });
  const shs = [0, 1].map(i => ri("shield", i < H.sh ? "" : "off")).join("");
  const nextMon = addDays(hbWeekOf(t), 7);
  $("hkSh").innerHTML = `<span class="hk-shs">${shs}</span><span>보호권 <b>${H.sh}</b>/${HB_SH_MAX}<small>${H.sh >= HB_SH_MAX ? "가득 찼어요 · 쉬어 간 날에 자동으로 쓰여요" : `${mdText(nextMon)}에 1개 더 와요`}</small></span>`;
  let rh;
  if (H.rest) {
    const left = dayDiff(t, H.rest.to) + 1;
    rh = `<div class="hk-note rest">${ri("moon")}안식 중 · ${mdText(H.rest.to)}까지 (${left}일)${H.rest.why ? ` · ${escapeHtml(H.rest.why)}` : ""}<br>쉬는 동안 연속과 주간 목표가 그대로예요.</div>
      <div class="hk-restbar"><button type="button" class="btn" id="hkEnd">오늘부터 다시 시작</button></div>`;
  } else {
    rh = `<div class="hk-restbar"><button type="button" class="btn" id="hkOpen">${ri("moon")} 안식 모드${hkUI.open ? " 닫기" : ""}</button><button type="button" class="btn" id="hkSun" aria-pressed="${H.sunRest}">주일 공부 쉼 · ${H.sunRest ? "켬" : "끔"}</button></div>`;
    if (hkUI.open) rh += `<div class="hk-pick"><span>얼마나 쉴까요? (오늘부터)</span><div class="hk-chips">${[1, 3, 7, 14].map(n => `<button type="button" data-days="${n}" aria-pressed="${hkUI.days === n}">${n}일</button>`).join("")}</div>
      <span>이유 (골라도 되고 안 골라도 돼요)</span><div class="hk-chips">${HB_WHY.map(w => `<button type="button" data-why="${w}" aria-pressed="${hkUI.why === w}">${w}</button>`).join("")}</div>
      <button type="button" class="buy manna" id="hkGo"><span class="act">안식 모드 시작 · ${hkUI.days}일</span><small>${mdText(addDays(t, hkUI.days - 1))}까지 · 최근 60일 안식 ${restDays60()}일</small></button></div>`;
  }
  $("hkRest").innerHTML = rh;
}

/* ---------- 복귀 카드에 붙는 소식 ---------- */
function backHabRender() {
  const box = $("backHab"); if (!box) return;
  const h = hbNewsHTML(); box.hidden = !h; box.innerHTML = h;
}

/* ---------- 작은 도우미 ---------- */
function hbNoteInto(id, k) {
  const m = $(id); if (!m) return;
  const nt = hbNote(k), h = nt ? nt.h : "";
  if (m._h === h) return; m._h = h; m.hidden = !h; m.innerHTML = h; m.className = "hk-note" + (nt && nt.rest ? " rest" : "");
}
function renderNoteHist() {
  const ul = $("noteList"); if (!ul) return;
  const N = Array.isArray(S.bible.notes) ? S.bible.notes : [], key = N.length + ":" + (N.length ? N[N.length - 1].d + N[N.length - 1].t : "");
  if (ul._k === key) return; ul._k = key;
  const det = $("noteHist"); if (det) det.hidden = !N.length;
  ul.innerHTML = N.slice(-14).reverse().map(n => `<li><small>${mdText(n.d)}</small>${escapeHtml(n.t)}</li>`).join("");
}

/* ---------- 정보 탭: 화면 설정 ---------- */
function fxSet() { if (!S.fx || typeof S.fx !== "object") S.fx = { shake: 1, flash: 1 }; return S.fx; }
function shakeK() { if (reduceMotion) return 0; const v = +fxSet().shake; return v >= 0 && v <= 1 ? v : 1; }
function flashK() { const v = +fxSet().flash; return v >= 0 && v <= 1 ? v : 1; }
function buildFxCard() {
  secTitle("info", "화면 설정", "흔들림·번쩍임");
  const card = el("div", "card fxset");
  const seg = (id, lbl) => `<div class="fx-row"><span>${lbl}</span><div class="seg" role="group" aria-label="${lbl}">${[[1, "기본"], [0.5, "약하게"], [0, "끄기"]].map(([v, n]) => `<button type="button" data-fx="${id}" data-v="${v}" aria-pressed="false">${n}</button>`).join("")}</div></div>`;
  card.innerHTML = seg("shake", "화면 흔들림") + seg("flash", "번쩍임")
    + `<p class="muted" id="fxNote"></p>`;
  addCustom("info", card, () => {
    const f = fxSet();
    card.querySelectorAll("button").forEach(b => { const ds = b.dataset || {}; b.setAttribute("aria-pressed", String(+ds.v === +f[ds.fx])); });
    const n = $("fxNote"), txt = (reduceMotion ? "휴대폰의 '동작 줄이기'가 켜져 있어 흔들림은 꺼져 있어요. " : "휴대폰의 '동작 줄이기'를 켜면 흔들림이 저절로 꺼져요. ") + "번쩍임은 1초에 3번까지, 화면 가운데 일부에만 나오고 빨간 화면 전체 번쩍임은 쓰지 않아요.";
    if (n && n.textContent !== txt) n.textContent = txt;
  });
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset || !b.dataset.fx) return;
    fxSet()[b.dataset.fx] = +b.dataset.v; sfx("tick"); updateUI(true); save();
  });
}

/* ---------- 번쩍임 안전: 1초 3번까지, 몬스터 둘레만, 빨강은 따뜻한 흰빛으로 ---------- */
function hbRedish(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex)); if (!m) return false;
  const n = parseInt(m[1], 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx !== r || mx - mn < 0.35) return false;
  let h = 60 * (((g - b) / (mx - mn)) % 6); if (h < 0) h += 360;
  return h < 25 || h > 330;
}
function hbDrawFlash() {
  if (screenFlash <= 0) { flashPrev = 0; return; }
  const t = performance.now();
  if (screenFlash > flashPrev + 0.001) {
    flashHist = flashHist.filter(x => t - x < 1000);
    if (flashK() <= 0 || flashHist.length >= 3) { screenFlash = 0; flashPrev = 0; return; }
    flashHist.push(t);
  }
  flashPrev = screenFlash;
  const col = hbRedish(flashCol) ? "#fff1dc" : flashCol, R = 110, a = Math.min(0.42, screenFlash * 0.95) * flashK();
  let mx = UW / 2, my = UH / 2; try { const p = w2u(MON_X, GROUND - 70); mx = p[0]; my = p[1]; } catch (e) {}
  const gr = ctx.createRadialGradient(mx, my, 6, mx, my, R); gr.addColorStop(0, hexA(col, a)); gr.addColorStop(1, hexA(col, 0));
  ctx.fillStyle = gr; ctx.fillRect(mx - R, my - R, R * 2, R * 2);
}
