/* ===================== 복귀 정산 · 출근부 =====================
   1) 오래 비웠다 돌아오면 (다시 켜거나 다른 앱에 갔다 오면) 야근 정산서: 올라간 층·잡은 보스·월급, 하루 넘게 비웠으면 복귀 선물
   2) 출근부: 매일 출근 도장 (연속일수록 만나 더, 7일마다 도장), 이번 달 5·10·15·20·25일 상자와 개근상
   3) 달력 칸마다 그날 말씀·공부·암송 기록 점. 이번 달 빈 날은 만나로 '지각' 도장을 찍어 메움 (한 달 3번)
   (rollDay·merge·load 에서 부르므로 함수 선언과 var 만 씀) */
var OFF_CAP = 8 * 3600, BACK_MIN = 300;
var WD = ["일", "월", "화", "수", "목", "금", "토"];
var ATT_MILES = [
  { n: 5, rw: { manna: 50, haste: 1 } },
  { n: 10, rw: { stamp: 10, gold2: 1 } },
  { n: 15, rw: { ore: 500, rage: 1 } },
  { n: 20, rw: { silver: 3, haste: 1, gold2: 1, rage: 1 } },
  { n: 25, rw: { ame: 2, stamp: 20 } },
];
var ATT_FULL = { ame: 3, stamp: 30, manna: 300 };
var ATT_MK_MAX = 3;
var STREAK_CEL = [7, 14, 30, 50, 100, 200, 365];
var ATT_SAY = ["출근 완료! 오늘도 달려 보자!", "출근 도장 쾅! 오늘도 화이팅!", "좋아, 오늘 업무 시작!", "오늘도 말씀 한 장, 공부 한 판!"];
var BACK_SAY = ["정산 완료! 다시 달려 보자!", "쉬고 왔더니 힘이 난다!", "자리 비운 사이에도 열일했지!"];
var attVer = 0, attMemo = { k: "" }, attWatch = "", backReady = false, backOn = false, backBusy = false, hiddenAt = 0, backToast = "", backWant = false;
var calView = { ym: "", sel: "", month: null, ms: -1, mk: "", mkT: 0 };

/* ---------- 날짜 ---------- */
function pad2(n) { return String(n).padStart(2, "0"); }
function keyDate(k) { const p = String(k).split("-").map(Number); return new Date(p[0], p[1] - 1, p[2], 12); }
function addDays(k, n) { const d = keyDate(k); d.setDate(d.getDate() + n); return dayKey(d); }
function dayDiff(a, b) { return Math.round((keyDate(b) - keyDate(a)) / 864e5); }
function ymOf(k) { return String(k).slice(0, 7); }
function ymAdd(ym, n) { const p = ym.split("-").map(Number), d = new Date(p[0], p[1] - 1 + n, 1, 12); return d.getFullYear() + "-" + pad2(d.getMonth() + 1); }
function daysIn(ym) { const p = ym.split("-").map(Number); return new Date(p[0], p[1], 0, 12).getDate(); }
function mdText(k) { const d = keyDate(k); return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WD[d.getDay()]})`; }
function awayText(sec) { const m = Math.floor(sec / 60), h = Math.floor(m / 60), d = Math.floor(h / 24); return d >= 1 ? `${d}일 ${h % 24}시간` : h >= 1 ? `${h}시간 ${m % 60}분` : `${Math.max(1, m)}분`; }
function studyText(min) { min = Math.round(min); return min >= 60 ? `${Math.floor(min / 60)}시간${min % 60 ? ` ${min % 60}분` : ""}` : `${min}분`; }

/* ---------- 출근 기록 ---------- */
function attLog() { if (!S.att || typeof S.att !== "object") S.att = { log: {}, best: 0, mk: {}, ms: {} }; if (!S.att.log) S.att.log = {}; return S.att.log; }
function attRec(k) { return attLog()[k]; }
function attOn(k) { const r = attRec(k); return !!(r && r.a); }
function attMemoGet() {
  const key = dayKey() + "|" + attVer, L = attLog();
  if (attMemo.k !== key || attMemo.ref !== L) {
    let st = 0, k = dayKey(); if (!(L[k] && L[k].a)) k = addDays(k, -1);
    while (st < 4000 && L[k] && L[k].a) { st++; k = addDays(k, -1); }
    let tot = 0; for (const x in L) if (L[x] && L[x].a) tot++;
    attMemo = { k: key, ref: L, st, tot, mon: {} };
  }
  return attMemo;
}
function attStreak() { return attMemoGet().st; }
function attTotal() { return attMemoGet().tot; }
function attMonthN(ym) { const m = attMemoGet(); if (m.mon[ym] == null) { let n = 0; const L = attLog(); for (const x in L) if (L[x] && L[x].a && x.slice(0, 7) === ym) n++; m.mon[ym] = n; } return m.mon[ym]; }
/* 오늘 출근 보상: 만나 10 + 연속 하루마다 2 (최대 +20), 7일마다 도장 5 */
function attRw(st) { const r = { manna: 10 + Math.min(20, 2 * Math.max(0, st - 1)) }; if (st > 0 && st % 7 === 0) r.stamp = 5; return r; }
function attMkCost(used) { return 50 * (used + 1); }
/* 그날 말씀(장)·공부(분)·암송(구절). -1 = 연속 기록으로 채운 날 (양은 모름) */
function habitRaw(k) {
  if (k === dayKey() && S.day && S.day.key === k) return { c: S.day.chap || 0, s: S.day.study || 0, m: S.day.mem || 0 };
  const r = attRec(k) || {}; return { c: r.c || 0, s: r.s || 0, m: r.m || 0 };
}
function habitLv(k) { const h = habitRaw(k), lv = (v, full) => v === -1 || v >= full ? 2 : v > 0 ? 1 : 0; return { c: lv(h.c, 3), s: lv(h.s, 25), m: lv(h.m, 5) }; }
/* 하루가 넘어갈 때 어제 기록을 달력에 남김 */
function attArchive(day) {
  if (!day || !day.key) return;
  const c = day.chap || 0, s = Math.round(day.study || 0), m = day.mem || 0;
  if (!c && !s && !m) return;
  const L = attLog(), r = L[day.key] || (L[day.key] = {});
  r.c = c; r.s = s; r.m = m; attVer = (attVer || 0) + 1;
}
/* 처음 출근부를 열 때: 말씀·공부·암송 연속 기록으로 지난 날 점을 채움 */
function attBackfill(st) {
  const L = st.att.log, today = dayKey();
  const fill = (last, n, f) => { if (!last || !(n > 0)) return; let k = last; for (let i = 0; i < Math.min(n, 400); i++) { if (k < today) { const r = L[k] || (L[k] = {}); if (!r[f]) r[f] = -1; } k = addDays(k, -1); } };
  try { fill(st.bible && st.bible.last, st.bible && st.bible.streak, "c"); fill(st.study && st.study.last, st.study && st.study.streak, "s"); fill(st.mem && st.mem.last, st.mem && st.mem.streak, "m"); } catch (e) {}
}
function attMerge(a) {
  const o = { log: {}, best: 0, mk: {}, ms: {} };
  if (a && typeof a === "object") { o.log = Object.assign({}, a.log || {}); o.best = +a.best || 0; o.mk = Object.assign({}, a.mk || {}); o.ms = Object.assign({}, a.ms || {}); }
  return o;
}
/* 이번 달 출근 수로 상자 열기 (새로 연 것만 돌려줌) */
function attMiles(ym) {
  attLog(); const A = S.att; A.ms = A.ms || {};
  const n = attMonthN(ym), full = daysIn(ym); let mask = A.ms[ym] || 0; const got = [];
  ATT_MILES.forEach((m, i) => { if (n >= m.n && !(mask & (1 << i))) { mask |= 1 << i; grant(m.rw); got.push({ n: m.n, rw: m.rw }); } });
  if (n >= full && !(mask & 32)) { mask |= 32; grant(ATT_FULL); got.push({ n: full, rw: ATT_FULL, full: true }); }
  A.ms[ym] = mask; return got;
}
function attStamp() {
  rollDay();
  const k = dayKey(); if (attOn(k)) return null;
  const L = attLog(), r = L[k] || (L[k] = {}); r.a = 1; attVer++;
  const st = attStreak(); S.att.best = Math.max(S.att.best || 0, st);
  const rw = attRw(st); grant(rw);
  return { rw, st, got: attMiles(ymOf(k)) };
}
function attMakeup(k) {
  const today = dayKey(), ym = ymOf(k); if (ym !== ymOf(today) || !(k < today) || attOn(k)) return null;
  const L = attLog(), A = S.att; A.mk = A.mk || {};
  const used = A.mk[ym] || 0; if (used >= ATT_MK_MAX) return null;
  const cost = attMkCost(used); if (S.manna < cost) return null;
  S.manna -= cost; A.mk[ym] = used + 1;
  const r = L[k] || (L[k] = {}); r.a = 2; attVer++;
  A.best = Math.max(A.best || 0, attStreak());
  return { cost, got: attMiles(ym) };
}

/* ---------- 자리 비운 동안 ---------- */
function giftOf(miss) {
  if (!(miss >= 1)) return null;
  const m = Math.min(7, miss), g = { manna: 30 * m };
  if (m >= 2) g.stamp = 5 * (m - 1);
  if (m >= 3) g.ore = 150 * (m - 2);
  if (m >= 7) g.silver = 3;
  g.haste = m >= 7 ? 2 : 1;
  if (m >= 2) g.gold2 = m >= 7 ? 2 : 1;
  if (m >= 3) g.rage = m >= 7 ? 2 : 1;
  return g;
}
function addAway(r, sim, real, f0, miss) {
  const a = (S.away && typeof S.away === "object") ? S.away : (S.away = { sec: 0, sim: 0, f0, f1: f0, floors: 0, bosses: 0, gold: 0, wall: 0, cap: 0, miss: 0 });
  a.sec += real || 0; a.sim += sim || 0;
  if (r) { a.floors += r.floors || 0; a.bosses += r.bosses || 0; a.gold += r.gold || 0; if (r.wall) a.wall = 1; }
  if (real > OFF_CAP) a.cap = 1;
  a.f1 = S.floor; a.miss = Math.max(a.miss || 0, miss || 0);
}
/* t0 부터 지금까지: 전투를 계산해 층·월급을 정산. 5분이 안 되면 바로 받고 알림만, 넘으면 정산서로 */
function awaySettle(t0, simOK) {
  const real = Math.max(0, (Date.now() - t0) / 1000), sec = Math.min(real, OFF_CAP);
  const miss = Math.max(0, dayDiff(dayKey(new Date(t0)), dayKey()) - 1);
  let r = null; const f0 = S.floor;
  if (simOK !== false && sec > 60) {
    r = simulateOffline(sec);
    if (r.gold > 0 || r.floors > 0) {
      if (r.f) { S.floor = r.f; S.k = r.k; } S.maxFloor = Math.max(S.maxFloor, S.floor); S.bestFloor = Math.max(S.bestFloor, S.floor);
      if (real < BACK_MIN && !miss && !S.away) {
        S.gold += r.gold; const g = r.gold, fl = r.floors, bs = r.bosses, mn = Math.max(1, Math.floor(real / 60));
        setTimeout(() => toast(`자리 비운 ${mn}분 동안 ${fl}층 올라가고 보스 ${bs}마리, ${fmt(g)}원`), 500);
        r = null;
      }
    } else r = null;
  }
  if (r || miss) addAway(r, r ? sec : 0, real, f0, miss);
  return !!r;
}
/* 다른 앱에 갔다가 돌아왔을 때 (화면이 꺼져 있던 동안은 전투가 멈춰 있으므로 그만큼 계산) */
function onResume() {
  const t0 = hiddenAt; hiddenAt = 0;
  if (!t0 || !S) return;
  if (Date.now() - t0 >= 60000) {
    const tower = mode === "tower";
    if (tower && TIME_LIMIT[bossKind(S.floor, S.k)]) S.k = 1;
    awaySettle(t0, tower);
    if (tower) { floats = []; spawnWait = 0; lift = null; intro = null; spawn(); }
    save();
  }
  backMaybeOpen();
}

/* ---------- 정산서 · 출근 카드 (팝업) ---------- */
function heroBust(css) {
  const d = uiDpr(), s = Math.round(css * d), c = document.createElement("canvas"); c.width = c.height = s; c.className = "pix";
  if (c.style) c.style.width = c.style.height = css + "px";
  const g = c.getContext && c.getContext("2d"); if (!g) return c;
  try { const lk = heroLook(), rows = 17 + (lk.top || 0), u = Math.max(1, Math.floor(s / rows)); g.imageSmoothingEnabled = false; drawSprite(g, lk.map, lk.pal, Math.round((s - 18 * u) / 2), Math.round(u * 1.3), u, { pretty: true }); } catch (e) {}
  return c;
}
function countUp(elm, to) {
  if (!elm) return;
  if (reduceMotion || !(to > 0)) { elm.textContent = fmt(to); return; }
  let i = 0; const N = 22;
  const tick = () => { i++; const p = i / N, e = 1 - Math.pow(1 - p, 3); elm.textContent = fmt(to * e); if (i < N) setTimeout(tick, 34); };
  elm.textContent = "0"; setTimeout(tick, 180);
}
function wdHTML() { return WD.map((w, i) => `<span class="cal-wd${i === 0 ? " sun" : i === 6 ? " sat" : ""}">${w}</span>`).join(""); }
function weekKeys(k) { const s = addDays(k, -keyDate(k).getDay()), out = []; for (let i = 0; i < 7; i++) out.push(addDays(s, i)); return out; }
function calCell(k, o) {
  const today = dayKey(), r = attRec(k) || {}, d = keyDate(k), wd = d.getDay(), fut = k > today, isT = k === today, hl = habitLv(k);
  const cls = "cal-d" + (wd === 0 ? " sun" : wd === 6 ? " sat" : "") + (fut ? " fut" : "") + (isT ? " today" : "") + (isT && !r.a ? " todo" : "") + (o.sel === k && !isT ? " sel" : "") + (o.dim ? " oth" : "");
  const seal = r.a ? `<i class="seal${r.a === 2 ? " mk" : ""}">${r.a === 2 ? "지각" : "출근"}</i>` : "";
  const dots = (hl.c || hl.s || hl.m) ? `<span class="cal-h">${hl.c ? `<i class="h-c${hl.c > 1 ? " f" : ""}"></i>` : ""}${hl.s ? `<i class="h-s${hl.s > 1 ? " f" : ""}"></i>` : ""}${hl.m ? `<i class="h-m${hl.m > 1 ? " f" : ""}"></i>` : ""}</span>` : "";
  const inner = `<span class="cal-n">${d.getDate()}</span>${seal}${dots}`;
  return o.btn ? `<button type="button" class="${cls}" data-k="${k}"${fut ? " disabled" : ""} aria-label="${mdText(k)}${r.a === 1 ? " 출근" : r.a === 2 ? " 지각" : ""}">${inner}</button>` : `<div class="${cls}">${inner}</div>`;
}
function slipHTML(a) {
  const now = new Date(), up = a.f1 - a.f0, run = a.gold > 0 || a.floors > 0, gift = giftOf(a.miss || 0), seal = `<i class="seal big" id="slipSeal" hidden>지급</i>`;
  const fl = up > 0 ? `${a.f0}층 → ${a.f1}층 <em>+${up}</em>` : `${a.f1}층에서 반복 전투`;
  return `<div class="slip-h"><b>야근 정산서</b><span>${now.getMonth() + 1}.${pad2(now.getDate())} ${WD[now.getDay()]} · ${awayText(a.sec)}</span></div>`
    + (run ? `<div class="slip-r"><span>올라간 층</span><b>${fl}</b></div><div class="slip-r"><span>잡은 보스</span><b>${fmtR(a.bosses)}마리</b></div>`
      + `<div class="slip-r tot"><span>지급액</span><b>${ri("coin")}<span class="amt"><span id="backGold">0</span>원</span></b>${seal}</div>` : "")
    + (gift ? `<div class="slip-gift"><span>복귀 선물<small>${a.miss + 1}일 만</small></span><span class="rws">${rwHTML(gift)}</span>${run ? "" : seal}</div>` : "")
    + (run && a.wall ? `<p class="slip-note">${a.f1 + 1}층 보스에게 막혀 ${a.f1}층에서 월급을 모았어요. 무기를 키워 보세요</p>` : run && a.cap ? `<p class="slip-note">전투는 자리 비운 뒤 8시간까지만 계산돼요</p>` : "");
}
function backAttHTML(k) {
  const st = attStreak() + 1, ym = ymOf(k), n = attMonthN(ym) + 1, full = daysIn(ym), rw = attRw(st);
  const nx = ATT_MILES.find(m => m.n >= n);
  const nextTxt = nx ? (nx.n === n ? `오늘 ${n}일 상자!` : `${nx.n}일 상자까지 ${nx.n - n}일`) : n >= full ? "오늘 개근상!" : `개근까지 ${full - n}일`;
  return `<div class="ba-h"><b>${+ym.slice(5)}월 출근부</b><span>연속 <b>${st}</b>일째 · 이번 달 <b>${n}</b>일</span></div>`
    + `<div class="cal-grid wk">${wdHTML()}${weekKeys(k).map(x => calCell(x, { dim: ymOf(x) !== ym })).join("")}</div>`
    + `<div class="ba-rw"><span>오늘 보상</span><span class="rws">${rwHTML(rw)}</span><span class="ba-nx">${nextTxt}</span></div>`;
}
/* 성경 읽는 중이거나 글자를 치는 중이면 끝날 때까지 기다렸다가 띄움 */
function backCanPop() { const rd = $("reader"); return !(rd && !rd.hidden) && !(document.body && document.body.classList && document.body.classList.contains("typing")); }
function backMaybeOpen() {
  if (!backReady || backBusy || !S) return;
  const box = $("back"); if (!box) return;
  const need = !attOn(dayKey()), a = S.away;
  if (!a && !need) { if (backOn) backHide(); return; }
  if (!backOn && !backCanPop()) { backWant = true; return; }
  const first = !backOn; backOn = true;
  backRender(first);
  if (first) {
    box.hidden = false; box.classList.remove("out"); box.classList.remove("go"); void box.offsetWidth; box.classList.add("go");
    if (document.body && document.body.classList) document.body.classList.add("modal");
  }
}
function backHide() {
  const box = $("back"); if (box) { box.hidden = true; box.classList.remove("go"); box.classList.remove("out"); }
  backOn = false; if (document.body && document.body.classList) document.body.classList.remove("modal");
}
function backRender(first) {
  const a = S.away, k = dayKey(), need = !attOn(k), d = keyDate(k);
  let T, sub;
  if (a && a.miss >= 1) { T = "오랜만이에요!"; sub = `${a.miss + 1}일 만의 출근이에요`; }
  else if (a) { T = a.sec >= 3600 ? "다시 오셨군요!" : "어서 오세요!"; sub = `자리 비운 시간 ${awayText(a.sec)}`; }
  else if (attTotal() === 0) { const fresh = (S.totalKills || 0) < 50; T = fresh ? "첫 출근을 환영해요!" : "출근부가 생겼어요!"; sub = fresh ? "곽준영의 회사 생활, 오늘부터 출근부에 남겨요" : "오늘부터 매일 출근 도장을 찍고 상자를 받아요"; }
  else { const h = new Date().getHours(); T = h < 5 ? "새벽 출근이네요!" : h < 11 ? "좋은 아침이에요!" : h < 17 ? "오늘도 힘내요!" : "좋은 저녁이에요!"; sub = `${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}요일 · 오늘도 출근 도장 쾅!`; }
  $("backT").textContent = T; $("backS").textContent = sub;
  const pf = $("backPf"); if (pf && (first || !pf.firstChild)) { pf.innerHTML = ""; pf.appendChild(heroBust(54)); }
  const slip = $("backSlip");
  if (slip) { if (a) { slip.hidden = false; slip.innerHTML = slipHTML(a); countUp($("backGold"), a.gold || 0); } else slip.hidden = true; }
  const att = $("backAtt");
  if (att) { if (need) { att.hidden = false; att.innerHTML = backAttHTML(k); } else att.hidden = true; }
  const b = $("backGo");
  if (b) { b.disabled = false; b.className = "buy back-go" + (need ? " stamp" : ""); b.innerHTML = `<span class="act">${need && a ? "출근 도장 찍고 받기" : need ? "출근 도장 찍기" : "정산금 받기"}</span>`; }
}
function backBurst(tone) {
  const fx = $("backFx"), btn = $("backGo"); if (!fx || reduceMotion || !fx.appendChild) return;
  fx.innerHTML = "";
  try { const r = btn.getBoundingClientRect(); fx.style.left = (r.left + r.width / 2) + "px"; fx.style.top = (r.top + 4) + "px"; } catch (e) {}
  const cols = CELEB_COL[tone] || CELEB_COL.gold;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement("i"); p.style.background = cols[i % cols.length];
    if (i % 3 === 0) { p.style.width = "6px"; p.style.height = "6px"; p.style.borderRadius = "50%"; }
    fx.appendChild(p); if (!p.animate) continue;
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 110 + Math.random() * 160, dx = Math.cos(ang) * v, dy = Math.sin(ang) * v;
    p.animate([
      { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) rotate(${(Math.random() - .5) * 360}deg)`, opacity: 1, offset: 0.35 },
      { opacity: 1, offset: 0.7 },
      { transform: `translate(${dx * 1.3}px,${dy + 220 + Math.random() * 120}px) rotate(${(Math.random() - .5) * 720}deg)`, opacity: 0 },
    ], { duration: 1300 + Math.random() * 500, delay: Math.random() * 100, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" });
  }
}
function backClaim() {
  if (!backOn || backBusy) return;
  backBusy = true;
  const a = S.away, k = dayKey(), wantAtt = !attOn(k);
  let gold = 0, gift = null, res = null;
  if (a) { gold = a.gold || 0; S.gold += gold; gift = giftOf(a.miss || 0); if (gift) grant(gift); S.away = null; }
  if (wantAtt) res = attStamp();
  save(); updateUI(true);
  const btn = $("backGo"); if (btn) { btn.disabled = true; btn.innerHTML = `<span class="act">${res ? "출근 완료!" : "받았어요!"}</span>`; }
  const att = $("backAtt"), cell = att && att.querySelector(".cal-d.today");
  if (cell && res) { cell.classList.remove("todo"); const s = document.createElement("i"); s.className = "seal slam"; s.textContent = "출근"; cell.appendChild(s); }
  const ge = $("backGold"); if (ge && gold > 0) ge.textContent = fmt(gold);
  sfx("stamp");
  const ss = $("slipSeal"); if (a && ss) setTimeout(() => { ss.hidden = false; ss.classList.add("slam"); sfx("stamp"); }, reduceMotion ? 0 : 280);
  backBurst(res ? "stamp" : "gold");
  setTimeout(() => sfx(gold > 0 ? "coin" : "sparkle"), 420);
  setTimeout(() => {
    const box = $("back"); if (box) box.classList.add("out");
    setTimeout(() => { backHide(); backBusy = false; afterClaim(gold, gift, res); backMaybeOpen(); if (backToast && !backOn) { const m = backToast; backToast = ""; setTimeout(() => toast(m), 3000); } }, reduceMotion ? 0 : 260);
  }, reduceMotion ? 350 : 1250);
}
function walletPop(text) {
  const g = $("gold"), box = g && g.parentElement && g.parentElement.parentElement; if (!box || !box.appendChild) return;
  const e = document.createElement("span"); e.className = "goldfx"; e.textContent = text; box.appendChild(e);
  setTimeout(() => { if (e.remove) e.remove(); }, 1700);
}
function milestoneCelebs(got) {
  (got || []).forEach(m => celebrate(m.full
    ? { ic: "trophy", title: "개근상!", sub: `한 달 내내 출근했어요<br><span class="rws">${rwHTML(m.rw)}</span>`, tone: "rare", sound: "pass", ms: 3000 }
    : { ic: "treasure", title: `이번 달 ${m.n}일 출근!`, sub: `출근 상자를 열었어요<br><span class="rws">${rwHTML(m.rw)}</span>`, tone: "gold", sound: "pass" }));
}
function afterClaim(gold, gift, res) {
  const parts = [];
  if (gold > 0) { parts.push(`월급 +${fmt(gold)}원`); walletPop(`+${fmt(gold)}원`); }
  if (res) parts.push(rwText(res.rw).replace(/ (\d+)/g, " +$1"));
  if (parts.length) toast((res ? "출근 완료! " : "정산 완료! ") + parts.join(" · "));
  if (res) {
    if (!reduceMotion) stampFx = { t: 0, kind: 2, hit: false, text: "출근", top: `연속 ${res.st}일째`, nocam: true };
    say(ATT_SAY[Math.floor(Math.random() * ATT_SAY.length)], 3);
    milestoneCelebs(res.got);
    if (STREAK_CEL.indexOf(res.st) >= 0) celebrate({ ic: "cal", title: `연속 출근 ${res.st}일!`, sub: res.rw.stamp ? `7일마다 보너스<br><span class="rws">${rwHTML({ stamp: res.rw.stamp })}</span>` : "내일도 출근하면 보상이 커져요", tone: "stamp", sound: "pass" });
  } else if (gold > 0) say(BACK_SAY[Math.floor(Math.random() * BACK_SAY.length)], 3);
}
(() => { const go = $("backGo"); if (go && go.addEventListener) go.addEventListener("click", backClaim); })();

/* ---------- 업무 탭: 출근부 카드 ---------- */
function calMonthOn() { return calView.month == null ? !!S.calMonth : calView.month; }
function calBounds() { const cur = ymOf(dayKey()); let min = cur; for (const k in attLog()) { const y = k.slice(0, 7); if (y < min) min = y; } const lim = ymAdd(cur, -24); return { min: min < lim ? lim : min, cur }; }
function monthSum(ym) {
  const today = dayKey(), full = daysIn(ym); let c = 0, cu = false, s = 0, su = false, m = 0, mu = false;
  for (let d = 1; d <= full; d++) { const k = `${ym}-${pad2(d)}`; if (k > today) break; const h = habitRaw(k); if (h.c === -1) cu = true; else c += h.c; if (h.s === -1) su = true; else s += h.s; if (h.m === -1) mu = true; else m += h.m; }
  return { n: attMonthN(ym), c, cu, s, su, m, mu };
}
function calInfoHTML(ym, sel) {
  const today = dayKey(), cur = ymOf(today), A = S.att || {};
  if (calView.ms >= 0) {
    const i = calView.ms, full = daysIn(ym), t = i < 5 ? ATT_MILES[i].n : full, rw = i < 5 ? ATT_MILES[i].rw : ATT_FULL, n = attMonthN(ym), got = !!(((A.ms || {})[ym] || 0) & (1 << i));
    return `<b>${i < 5 ? `${t}일 출근 상자` : `개근상 (${full}일)`}</b><span class="rws">${rwHTML(rw)}</span><span class="ci-r">${got ? "받음" : ym !== cur ? "못 받음" : `${Math.max(0, t - n)}일 남음`}</span>`;
  }
  if (!sel) {
    const s = monthSum(ym), parts = [`<span class="hb">출근 ${s.n}일</span>`];
    if (s.c || s.cu) parts.push(`<span class="hb"><i class="h-c"></i>말씀 ${s.c}장${s.cu ? "+" : ""}</span>`);
    if (s.s || s.su) parts.push(`<span class="hb"><i class="h-s"></i>공부 ${studyText(s.s)}${s.su ? "+" : ""}</span>`);
    if (s.m || s.mu) parts.push(`<span class="hb"><i class="h-m"></i>암송 ${s.m}구절${s.mu ? "+" : ""}</span>`);
    return `<b>${+ym.slice(5)}월 합계</b>${parts.join("")}`;
  }
  const r = attRec(sel) || {}, h = habitRaw(sel), isT = sel === today;
  const st = r.a === 1 ? `<span class="ci-st on">출근</span>` : r.a === 2 ? `<span class="ci-st mk">지각</span>` : isT ? `<span class="ci-st todo">도장 전</span>` : `<span class="ci-st off">결근</span>`;
  const parts = [];
  if (h.c) parts.push(`<span class="hb"><i class="h-c"></i>말씀 ${h.c === -1 ? "읽음" : h.c + "장"}</span>`);
  if (h.s) parts.push(`<span class="hb"><i class="h-s"></i>공부 ${h.s === -1 ? "25분+" : studyText(h.s)}</span>`);
  if (h.m) parts.push(`<span class="hb"><i class="h-m"></i>암송 ${h.m === -1 ? "함" : h.m + "구절"}</span>`);
  let mk = "";
  if (!r.a && !isT && ymOf(sel) === cur && sel < today) {
    const used = (A.mk || {})[cur] || 0;
    if (used >= ATT_MK_MAX) mk = `<span class="ci-r">이번 달 메우기 끝</span>`;
    else { const c = attMkCost(used), armed = calView.mk === sel && Date.now() < calView.mkT; mk = `<button type="button" class="buy manna mkb${armed ? " armed" : ""}" id="calMk" data-mk="${sel}"${S.manna < c ? " disabled" : ""}>${btnInner({ label: `만나 ${c}`, sub: armed ? "한 번 더 누르면 메워요" : `지각 처리 · ${ATT_MK_MAX - used}번 남음` })}</button>`; }
  }
  return `<b>${isT ? "오늘 · " : ""}${mdText(sel)}</b>${st}${parts.join("") || `<span class="hb none">${isT ? "말씀·공부·암송을 하면 점이 찍혀요" : "기록 없음"}</span>`}${mk}`;
}
function trackHTML(ym) {
  const n = attMonthN(ym), full = daysIn(ym), mask = ((S.att && S.att.ms) || {})[ym] || 0, cur = ym === ymOf(dayKey());
  const T = ATT_MILES.map(x => x.n).concat(full);
  let u; if (n >= full) u = 5; else if (n < T[0]) u = -0.5 + 0.5 * n / T[0]; else { let i = 0; while (i < 4 && n >= T[i + 1]) i++; u = i + (n - T[i]) / (T[i + 1] - T[i]); }
  const fill = Math.max(0, Math.min(100, (2 * u + 1) / 11 * 100));
  const nextI = cur ? T.findIndex((t, i) => !(mask & (1 << i)) && n < t) : -1;
  let h = `<div class="att-line"><i style="width:${fill.toFixed(1)}%"></i></div>`;
  T.forEach((t, i) => {
    const got = !!(mask & (1 << i));
    h += `<button type="button" class="att-m${got ? " got" : ""}${i === nextI ? " next" : ""}${!got && i !== nextI ? " lock" : ""}${calView.ms === i ? " sel" : ""}${i === 5 ? " full" : ""}" data-m="${i}" aria-label="${i < 5 ? t + "일 출근 상자" : "개근상"}"><span class="bx"></span><b>${i < 5 ? t + "일" : "개근"}</b></button>`;
  });
  return h;
}
function calActHTML() {
  if (S.away) return `<button type="button" class="buy" id="calClaim"><span class="act">정산금 받기</span><small>자리 비운 동안 모은 월급</small></button>`;
  const st = attStreak();
  if (!attOn(dayKey())) return `<button type="button" class="buy stamp" id="calStamp"><span class="act">출근 도장 쾅!</span><small>오늘 보상 <span class="rws">${rwHTML(attRw(st + 1))}</span></small></button>`;
  return `<div class="cal-done">${ri("cal")}<span>오늘 출근 완료!<br>내일 보상 <span class="rws">${rwHTML(attRw(st + 1))}</span></span></div>`;
}
function renderAttCard() {
  const grid = $("calGrid"); if (!grid) return;
  const today = dayKey(), cur = ymOf(today), month = calMonthOn(), ym = month ? (calView.ym || cur) : cur;
  const sel = calView.sel || (month && ym !== cur ? "" : today);
  const A = S.att || {}, mkUsed = (A.mk && A.mk[cur]) || 0, dd = S.day || {};
  const key = [today, attVer, attStreak(), attTotal(), month, ym, sel, calView.ms, calView.mk, dd.chap, Math.floor(dd.study || 0), dd.mem, mkUsed, S.manna >= attMkCost(mkUsed), !!S.away].join("|");
  if (grid._k === key) return; grid._k = key;
  const y = +ym.slice(0, 4), m = +ym.slice(5), n = attMonthN(ym), full = daysIn(ym);
  $("calYm").textContent = month ? `${y}년 ${m}월` : `${m}월 · 이번 주`;
  const pv = $("calPrev"), nx = $("calNext");
  pv.hidden = nx.hidden = !month;
  if (month) { const b = calBounds(); pv.disabled = ymAdd(ym, -1) < b.min; nx.disabled = ym >= b.cur; }
  $("calChips").innerHTML = ym === cur ? `<span>연속 <b>${attStreak()}</b>일</span><span>이번 달 <b>${n}</b>/${full}</span>` : `<span><b>${n}</b>/${full}일 출근</span><span>최고 연속 <b>${A.best || 0}</b>일</span>`;
  grid.className = "cal-grid" + (month ? " mon" : " wk");
  if (month) {
    const off = new Date(y, m - 1, 1, 12).getDay(); let h = wdHTML();
    for (let i = 0; i < off; i++) h += `<span class="cal-x"></span>`;
    for (let d = 1; d <= full; d++) h += calCell(`${ym}-${pad2(d)}`, { btn: true, sel });
    grid.innerHTML = h;
  } else grid.innerHTML = wdHTML() + weekKeys(today).map(k => calCell(k, { btn: true, sel, dim: ymOf(k) !== cur })).join("");
  $("calInfo").innerHTML = calInfoHTML(ym, sel);
  const tr = $("calTrack"); tr.innerHTML = trackHTML(ym);
  tr.querySelectorAll(".bx").forEach((bx, i) => bx.appendChild(pixIcon(i < 5 ? "treasure" : "trophy", 24)));
  $("calAct").innerHTML = calActHTML();
  $("calTog").textContent = month ? "한 주 ▴" : "한 달 ▾";
}
function calNav(dir) {
  const b = calBounds(), ym = calView.ym || b.cur, nx = ymAdd(ym, dir);
  if (nx < b.min || nx > b.cur) return;
  calView.ym = nx; calView.sel = ""; calView.ms = -1; calView.mk = ""; sfx("tick"); renderAttCard();
}
function attStampCard() {
  if (S.away) { backMaybeOpen(); return; }
  if (attOn(dayKey())) return;
  const res = attStamp(); if (!res) return;
  calView.sel = ""; calView.ms = -1; calView.mk = "";
  save(); updateUI(true); renderAttCard();
  const grid = $("calGrid"), cell = grid && grid.querySelector(".cal-d.today"), seal = cell && cell.querySelector && cell.querySelector(".seal");
  if (seal && seal.classList) { seal.classList.add("slam"); cell.classList.add("thud"); }
  sfx("stamp");
  afterClaim(0, null, res);
}
function attMakeupUI(k) {
  if (!k) return;
  const now = Date.now();
  if (!(calView.mk === k && now < calView.mkT)) {
    calView.mk = k; calView.mkT = now + 3000; sfx("tick"); renderAttCard();
    setTimeout(() => { if (calView.mk === k && Date.now() >= calView.mkT) { calView.mk = ""; renderAttCard(); } }, 3100);
    return;
  }
  calView.mk = "";
  const res = attMakeup(k);
  if (!res) { const used = ((S.att.mk || {})[ymOf(k)]) || 0; toast(S.manna < attMkCost(used) ? "만나가 모자라요" : "이 날은 메울 수 없어요"); renderAttCard(); return; }
  save(); updateUI(true); renderAttCard();
  let cell = null; try { cell = $("calGrid").querySelector(`.cal-d[data-k="${k}"]`); } catch (e) {}
  const seal = cell && cell.querySelector && cell.querySelector(".seal");
  if (seal && seal.classList) { seal.classList.add("slam"); cell.classList.add("thud"); }
  sfx("stamp"); toast(`${mdText(k)} · 지각 도장으로 메웠어요 (만나 -${res.cost})`);
  milestoneCelebs(res.got);
}
function buildAttCard() {
  secTitle("daily", "출근부", "매일 도장 · 5일마다 상자");
  const card = el("div", "card attcard");
  card.innerHTML = `<div class="cal-hd"><button type="button" class="cal-nav" id="calPrev" data-nav="-1" aria-label="지난달">◀</button><b class="ym" id="calYm"></b><button type="button" class="cal-nav" id="calNext" data-nav="1" aria-label="다음 달">▶</button><div class="cal-chips num" id="calChips"></div></div>`
    + `<div class="cal-grid" id="calGrid"></div><div class="cal-info" id="calInfo"></div><div class="att-track" id="calTrack"></div>`
    + `<div class="cal-foot"><div class="cal-act" id="calAct"></div><button type="button" class="cal-tog" id="calTog"></button></div>`;
  panels.daily.appendChild(card);
  card.addEventListener("click", e => {
    const t = e.target, b = t && t.closest ? (t.closest("button") || (t.tagName === "BUTTON" ? t : null)) : (t && t.tagName === "BUTTON" ? t : null);
    if (!b || b.disabled) return;
    const ds = b.dataset || {};
    if (ds.nav) { calNav(+ds.nav); return; }
    if (ds.k) { calView.sel = (calView.sel === ds.k && ds.k !== dayKey()) ? "" : ds.k; calView.ms = -1; calView.mk = ""; sfx("tick"); renderAttCard(); return; }
    if (ds.m != null && ds.m !== "") { calView.ms = calView.ms === +ds.m ? -1 : +ds.m; sfx("tick"); renderAttCard(); return; }
    if (b.id === "calTog") { calView.month = !calMonthOn(); S.calMonth = calView.month; calView.ym = ""; calView.sel = ""; calView.ms = -1; calView.mk = ""; sfx("tick"); renderAttCard(); save(); return; }
    if (b.id === "calStamp") { attStampCard(); return; }
    if (b.id === "calClaim") { backMaybeOpen(); return; }
    if (b.id === "calMk") { attMakeupUI(ds.mk); return; }
  });
  updaters.daily.push({ ready: () => !!S.away || !attOn(dayKey()), update() { renderAttCard(); } });
}
