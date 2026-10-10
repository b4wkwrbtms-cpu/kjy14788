/* ===================== 성장 길잡이 (v29 · 고도화 2단계) =====================
   1) 목표 사다리: 오늘 · 이번 주 · 시즌(다음 승진 · 통독 플랜 · 암송 과정)과 예상 일수.
      예상 일수는 최근 14일 속도로 계산하고, 30일을 넘으면 중간 이정표를 함께 보여 줌.
      메인 화면에는 '다음 목표' 한 줄, 업무 탭 맨 위에 사다리 카드.
   2) 퇴사 권장 게이지: 지금 받을 도장 ÷ (가진 도장 + 보물에 쓴 도장). +50% 초록, +200% 강조.
      빠른 출근: 퇴사하면 이번 회사 최고층의 40%까지 출근 버스로 바로 (보스 월급을 받으며 막히면 무기·커피를 싼 것부터 강화).
   3) 자리 비운 동안 12시간까지 정산(OFF_CAP), 정산서에 표시.
   4) 탭 차례로 열기: 공부 3층 · 암송 5층(말씀 1장이면 바로) · 동료 10층 · 정장 15층 · 보물 25층 · 퇴사 40층.
      열릴 때 한 줄 안내, 정보 탭 '안내 다시 보기'에서 모든 안내를 다시 봄.
   5) 이번 주 경제: 재화마다 번 것 · 쓴 것 · 지금 · 용도, 7일치 넘게 고이면 쓸 곳, 다음 강화까지 필요한 실제 활동량.
   rollDay·merge·load 에서 부르므로 함수 선언과 var 만 씀 */
var QC_FRAC = 0.4, QC_MIN = 60;
var TAB_UNLOCK = {
  study: { f: 3, any: st => (st.bible && st.bible.total > 0) || (st.study && st.study.total > 0), d: "3층에 열려요 · 말씀 1장을 읽어도 열려요" },
  mem: { f: 5, any: st => (st.bible && st.bible.total > 0) || (st.mem && st.mem.total > 0), d: "5층에 열려요 · 말씀 1장을 읽어도 열려요" },
  pet: { f: 10, d: "10층에 열려요" },
  suit: { f: 15, any: st => (st.ore || 0) >= 150 || !!(st.ward && st.ward.own && Object.keys(st.ward.own).length), d: "15층에 열려요 · 말씀 5장을 읽거나 공부로 광석 150을 캐도 열려요" },
  treasure: { f: 25, any: st => (st.stamp || 0) >= 10, d: "25층에 열려요 · 결재도장 10개를 모아도 열려요" },
  retire: { f: 40, any: st => (st.retires || 0) > 0, d: "40층에 열려요" },
};
var TAB_INTRO = {
  weapon: "보스를 잡아 받은 월급으로 무기와 커피를 강화해요. 자동 강화를 켜 두면 알아서 사요.",
  bible: "개역한글 본문을 읽고 묵상 한 줄을 남겨요. 읽은 장마다 만나와 도장이 쌓이고, 읽은 시간으로 확인돼요.",
  mem: "200구절을 간격 반복으로 외워요. 통과할수록 다음 복습이 1·2·4·7·15·30·60일 뒤로 미뤄져요.",
  study: "공부 타이머를 켜면 공부한 시간만큼 광산을 파서 광석·은괴·자수정을 캐요. 25분마다 집중 확인.",
  pet: "만나로 동료를 들이면 같이 싸우고 월급을 늘려 줘요.",
  suit: "말씀·공부·암송 기록으로 옷을 모으고 입어요. 입은 옷은 부위 효과, 가진 옷은 모두 보유 효과. 세트·무기 이펙트·오라·칭호까지 모두 능력치가 있고 퇴사해도 남아요.",
  treasure: "결재도장으로 보물을 강화하면 퇴사해도 남는 힘이 돼요.",
  daily: "다음 목표, 출근부, 연속 지키기, 일일 업무, 주간 목표, 업적이 모여 있어요.",
  info: "인사 기록과 내 기록, 이번 주 경제, 도감, 화면 설정, 백업이 있어요.",
  retire: "50층부터 사표를 내면 결재도장을 받고 더 강해져서 다시 시작해요. 이번 회사 최고층의 40%까지는 출근 버스로 바로 올라가요.",
};
var GR_GUIDE = [
  ["연속 지키기", "말씀 1장 · 공부 10분 · 암송 5구절이면 그날 연속이 이어져요. 다 쉬어 간 날은 보호권(월요일마다 1개, 최대 2개)이 지켜 주고, 보호권이 없으면 이틀 안에 말씀 2장 · 공부 50분 · 암송 10구절로 다시 이어져요."],
  ["안식 모드", "시험·수련회·아플 때 업무 탭에서 켜요. 최대 14일, 그동안 연속과 주간 목표가 그대로예요."],
  ["말씀 확인", "읽은 시간(본문 화면 + 읽기 타이머)이 장마다 최소 시간(글자 수 ÷ 내 읽기 속도 × 1.5)만큼 쌓이면 확인돼요. 너무 빨리 넘긴 장은 기록만 남고, 시간이 쌓이면 저절로 확인돼요."],
  ["다음 목표", "오늘 · 이번 주 · 시즌 목표와 예상 일수를 보여 줘요. 예상 일수는 최근 14일 기록으로 계산하고, 30일이 넘으면 중간 이정표를 함께 보여 줘요."],
  ["퇴사와 빠른 출근", "퇴사 탭 게이지가 +50%를 넘으면 초록, +200%를 넘으면 크게 이득이에요. 퇴사하면 이번 회사 최고층의 40%까지 출근 버스로 바로 올라가요."],
  ["자리 비운 동안", "앱을 닫아 두어도 12시간까지 전투와 월급이 계산돼요."],
  ["이번 주 경제", "정보 탭에서 재화마다 이번 주에 번 것·쓴 것과 용도를 볼 수 있어요. 일주일치보다 많이 고이면 쓸 곳을 알려 줘요."],
  ["옷장", "입은 옷은 부위마다 다른 능력치(착용 효과), 가진 옷은 모두 모든 피해 +(보유 효과). 같은 세트를 2·4·6벌 입으면 세트 효과, 회장님 세트는 가지고만 있어도 쌓여요. 겉모습은 덧입기로 따로 고르고, 잠긴 옷도 눌러서 미리 입어 볼 수 있어요. 강화는 공부로 캔 광석, 말씀의 전신갑주는 말씀으로 받은 만나로 해요."],
];
var ECO_KEYS = ["manna", "stamp", "ore", "silver", "ame"];
var ECO_NAME = { manna: "만나", stamp: "도장", ore: "광석", silver: "은괴", ame: "자수정" };
var ECO_USE = {
  manna: "말씀·암송·출근으로 얻어 동료를 들이고 키워요",
  stamp: "말씀 한 장마다·출근·퇴사로 얻어 보물을 강화해요",
  ore: "공부한 시간만큼 캐서 정장과 부적을 사요",
  silver: "공부 7층마다 · 전설 무기와 전설 정장에 써요",
  ame: "공부 21층마다 · 전설 무기를 여는 데 써요",
};
var ECO_SINK = { manna: ["pet", "동료"], stamp: ["treasure", "보물"], ore: ["suit", "옷장"], silver: ["weapon", "무기"], ame: ["weapon", "무기"] };
var grUI = { strip: "", ladder: "", t: 0 }, treMemo = { k: "", v: 0 }, tabCols = 0;

/* ---------- 저장값 ---------- */
function ecoNew() { return { last: null, days: {}, pf: {}, pd: "" }; }
function ecoMerge(e) {
  const o = ecoNew(); if (!e || typeof e !== "object") return o;
  const lim = addDays(dayKey(), -45);
  if (e.days && typeof e.days === "object") for (const k in e.days) { const D = e.days[k]; if (k >= lim && D && Array.isArray(D.i) && Array.isArray(D.o)) o.days[k] = { i: ECO_KEYS.map((_, i) => Math.max(0, +D.i[i] || 0)), o: ECO_KEYS.map((_, i) => Math.max(0, +D.o[i] || 0)) }; }
  if (e.pf && typeof e.pf === "object") for (const k in e.pf) { const v = e.pf[k]; if (k >= lim && Array.isArray(v) && v.length === 2) o.pf[k] = [Math.max(1, +v[0] || 1), Math.max(0, +v[1] || 0)]; }
  if (Array.isArray(e.last) && e.last.length === ECO_KEYS.length) o.last = e.last.map(x => +x || 0);
  return o;
}
function ecoState() { if (!S.eco || typeof S.eco !== "object" || !S.eco.days || !S.eco.pf) S.eco = ecoMerge(S.eco); return S.eco; }
/* 예전 저장(이미 40층 넘었거나 퇴사한 적 있음)은 모든 탭이 열린 채로 */
function tabSeenMerge(t, st) {
  const o = {};
  if (t && typeof t === "object") { for (const k in TAB_UNLOCK) if (t[k]) o[k] = 1; CHIP_GATE.forEach(k => { if (t["$" + k]) o["$" + k] = 1; }); return o; }
  const old = (st.bestFloor || 1) >= 40 || (st.retires || 0) > 0;
  for (const k in TAB_UNLOCK) if (old || tabCond(k, st)) o[k] = 1;
  CHIP_GATE.forEach(k => { if (old || (+st[k] || 0) > 0) o["$" + k] = 1; });
  return o;
}
/* 화폐 칩: 처음 한 번 생기기 전까지는 숨김 (만나는 늘 보임) */
var CHIP_GATE = ["stamp", "ore", "silver", "ame"];
function chipGate() {
  CHIP_GATE.forEach(k => {
    const e = $(k + "Chip"), c = e && (e.parentElement || e.parent); if (!c) return;
    const key = "$" + k; if (!S.tabSeen[key] && (+S[k] || 0) > 0) S.tabSeen[key] = 1;
    const show = !!S.tabSeen[key]; if (c.hidden !== !show) c.hidden = !show;
  });
}
function tabCond(id, st) { const u = TAB_UNLOCK[id]; if (!u) return true; st = st || S; try { return (st.bestFloor || 1) >= u.f || !!(u.any && u.any(st)); } catch (e) { return false; } }
function tabOpen(id) { return !TAB_UNLOCK[id] || !!(S.tabSeen && S.tabSeen[id]) || tabCond(id); }

/* ---------- 속도와 예상 일수 ---------- */
function progSnap() { const E = ecoState(), t = dayKey(), v = [S.bestFloor || 1, S.retires || 0], o = E.pf[t]; if (!o || o[0] !== v[0] || o[1] !== v[1]) E.pf[t] = v; }
function growPace() {
  const L = attLog(), E = ecoState(), t = dayKey(), pf = E.pf;
  let first = t; for (const k in L) if (k < first) first = k; for (const k in pf) if (k < first) first = k;
  const W = Math.max(0, Math.min(13, dayDiff(first, t)));
  let c = 0, s = 0, m = 0;
  for (let i = 1; i <= W; i++) { const r = L[addDays(t, -i)]; if (r) { c += r.c === -1 ? 1 : (r.c || 0); s += r.s === -1 ? 25 : (r.s || 0); m += r.m === -1 ? 1 : (r.m || 0); } }
  c += (S.day && S.day.chap) || 0; s += (S.study && S.study.today) || 0; m += (S.day && S.day.mem) || 0;
  let base = null, bd = 0;
  for (let i = 14; i >= 1; i--) { const v = pf[addDays(t, -i)]; if (v) { base = v; bd = i; break; } }
  return { chap: c / (W + 1), study: s / 60 / (W + 1), mem: m / (W + 1), floor: base ? Math.max(0, ((S.bestFloor || 1) - base[0]) / bd) : 0, retire: base ? Math.max(0, ((S.retires || 0) - base[1]) / bd) : 0, known: !!base };
}
function daysFor(left, pace) { return left <= 0 ? 0 : pace > 0 ? Math.ceil(left / pace) : Infinity; }
function daysTxt(d) { return d === 0 ? "지금" : !isFinite(d) ? "" : d <= 1 ? "약 1일" : d < 60 ? `약 ${d}일` : `약 ${Math.round(d / 30)}달`; }
function promoPlan() {
  const r = rankIdx(); if (r >= RANKS.length - 1) return null;
  const R = RANKS[r + 1], v = reqVals(), p = growPace();
  const items = REQ_INFO.filter(q => R.req[q[0]] != null).map(([k, n, f]) => {
    const need = R.req[k], have = v[k], left = Math.max(0, need - have);
    return { k, n, f, need, have, left, days: daysFor(left, p[k]) };
  });
  const open = items.filter(i => i.left > 0);
  return { name: R.n, items, open, days: open.length ? Math.max(...open.map(i => i.days)) : 0, known: p.known };
}
/* 지금 힘으로 그 층 보스까지: 몇 분 (막히는 보스가 있으면 그 층) */
function climbEta(target) {
  const st = stats(), dps = st.dps; if (!(dps > 0)) return null;
  let f = S.floor, k = S.k, t = 0, g = 0;
  while (f <= target && g++ < 6000) {
    const kind = bossKind(f, k), hp = hpBase(f) * HP_MUL[kind] / (kind ? st.bossBonus : 1), tt = hp / dps;
    if (TIME_LIMIT[kind] && tt > bossTimeOf(kind)) return { wall: f };
    t += tt + 0.9; k++; if (k > 5) { k = 1; f++; }
  }
  return { sec: t };
}

/* ---------- 목표 사다리 ---------- */
var LADDER_TODAY = ["read1", "read3", "med", "mem5", "st25"];
var LADDER_TAB = { chap: "bible", med: "bible", mem: "mem", study: "study" };
function ladderRows() {
  const rows = [], D = S.day || {}, t = dayKey();
  // 오늘: 말씀·암송·공부 먼저
  if (restOn(t)) rows.push({ k: "오늘", t: "안식 중이에요", v: "쉼", p: 1, s: "오늘은 쉬어도 연속과 주간 목표가 그대로예요", go: "daily", done: true });
  else {
    const left = planTodayLeft();
    if (left > 0) { const st = planStats(), tot = st && st.today ? st.today.length : left; rows.push({ k: "오늘", t: `오늘 플랜 ${left}장 남음`, v: `${tot - left}/${tot}장`, p: tot ? (tot - left) / tot : 0, s: `${planDef(S.plan.id).n} · 다 읽으면 오늘 말씀 완료`, go: "bible" }); }
    else {
      const dt = DAILY.filter(d => LADDER_TODAY.indexOf(d.id) >= 0).find(d => (D[d.stat] || 0) < d.goal && tabOpen(LADDER_TAB[d.stat] || "daily"));
      if (dt) { const v = Math.min(dt.goal, Math.floor(D[dt.stat] || 0)), nt = dt.stat === "chap" && !(D.chap > 0) ? hbNote("bible") : null; rows.push({ k: "오늘", t: dt.n, v: `${v}/${dt.goal}`, p: v / dt.goal, s: nt && !nt.rest ? nt.h.replace(/<[^>]+>/g, "") : dt.stat === "chap" && !(D.chap > 0) ? `읽으면 말씀 연속 ${readStreak() + 1}일째예요` : "", go: LADDER_TAB[dt.stat] || "daily" }); }
      else rows.push({ k: "오늘", t: "오늘 할 일 끝", v: "✓", p: 1, s: "남은 시간은 곽준영이 알아서 일해요", go: "daily", done: true });
    }
  }
  // 오늘: 다음 큰 보스
  if (mode === "tower") {
    const nb = S.floor % 10 === 0 ? S.floor : (Math.floor(S.floor / 10) + 1) * 10, ce = climbEta(nb);
    const s = !ce ? "" : ce.wall ? `${ce.wall}층 보스가 아직 버거워요 · 무기를 키우면 넘을 수 있어요` : ce.sec < 90 ? "지금 힘으로 1분 안" : `지금 힘으로 약 ${Math.ceil(ce.sec / 60)}분`;
    rows.push({ k: "오늘", t: `${nb}층 ${nb % 100 === 0 ? "회장급" : "임원"} 보스`, v: `${Math.max(0, nb - S.floor)}층`, p: ((S.floor - 1) % 10 + (S.k - 1) / 5) / 10, s, go: "weapon", game: true });
  }
  // 이번 주
  const g = wGoal(), n = weekBibleN(), wl = 7 - (new Date().getDay() + 6) % 7;
  rows.push({ k: "이번 주", t: g ? `말씀 ${g}일 읽기` : "안식 주간", v: g ? `${Math.min(n, g)}/${g}일` : "-", p: g ? Math.min(1, n / g) : 1, s: g && n < g ? `${g - n}일 더 · 오늘 포함 ${wl}일 남음` : g ? "이번 주 목표를 채웠어요" : "이번 주는 쉬어 가요", go: "bible", done: !g || n >= g });
  // 시즌: 다음 승진
  const pp = promoPlan();
  if (pp) {
    let s, eta = "";
    if (!pp.open.length) { s = "지금 승진할 수 있어요 · 정보 탭 맨 위"; eta = "지금"; }
    else {
      const need = pp.open.map(i => `${i.n} ${i.f(i.left)}`).join(" · ");
      if (!isFinite(pp.days)) s = `${need} 남음` + (!pp.known && pp.open.some(i => i.k === "floor" || i.k === "retire") ? " · 예상 일수는 기록이 쌓이면 나와요" : "");
      else if (pp.days > 30) {
        const slow = pp.open.reduce((a, b) => b.days > a.days ? b : a), per = slow.left / slow.days, mid = slow.have + Math.max(per * 30, slow.left / 4);
        s = `${need} 남음 · 30일 이정표: ${slow.n} ${slow.f(Math.min(slow.need, mid))}`; eta = daysTxt(pp.days);
      } else { s = `${need} 남음`; eta = daysTxt(pp.days); }
    }
    const tot = pp.items.reduce((a, i) => a + Math.min(1, i.have / i.need), 0) / Math.max(1, pp.items.length);
    rows.push({ k: "시즌", t: `${pp.name} 승진`, v: eta || `${Math.floor(tot * 100)}%`, p: tot, s, go: "info", done: !pp.open.length, hot: !pp.open.length });
  }
  // 시즌: 통독 플랜 (30일 넘게 남으면 다음 이정표)
  const P = S.plan, st = P && !P.fin ? planStats() : null;
  if (st && st.total) {
    const pct = st.done / st.total, mile = PLAN_MILES.find(m => pct + 1e-9 < m[0]), perDay = st.total / Math.max(1, st.sc.D);
    const toMile = mile ? Math.max(0, Math.ceil(mile[0] * st.total) - st.done) : 0, md = Math.ceil(toMile / perDay), endIn = Math.max(0, st.sc.D - st.d);
    const s = mile && endIn > 30 ? `다음 이정표 ${Math.round(mile[0] * 100)}%까지 ${toMile}장 (${daysTxt(md)}) · 완주까지 ${endIn}일` : `완주까지 ${st.total - st.done}장 · ${endIn}일`;
    rows.push({ k: "시즌", t: st.sc.def.n, v: `${Math.floor(pct * 100)}%`, p: pct, s, go: "bible" });
  } else if (!P || P.fin) rows.push({ k: "시즌", t: "통독 플랜 고르기", v: "", p: 0, s: "말씀 탭에서 플랜을 고르면 날마다 읽을 분량과 완주 날짜가 나와요", go: "bible" });
  // 시즌: 암송 과정
  if (tabOpen("mem")) {
    if (S.mem.sets < MEM_DAYS) rows.push({ k: "시즌", t: "200구절 암송 과정", v: `${S.mem.sets}/${MEM_DAYS}일차`, p: S.mem.sets / MEM_DAYS, s: `새 구절이 날마다 열리면 ${daysTxt(MEM_DAYS - S.mem.sets)} · 외운 구절 ${memMastered()}개`, go: "mem" });
    else rows.push({ k: "시즌", t: "외운 구절", v: `${memMastered()}/${VERSES.length}`, p: memMastered() / VERSES.length, s: "다섯 번 통과한 구절이 외운 구절이 돼요", go: "mem" });
  }
  return rows;
}
/* 메인 화면 한 줄: 승진 가능 → 오늘 말씀·암송·공부 → 이번 주 말씀 → 시즌 승진 → 보스 */
function ladderPick(rows) {
  const hot = rows.find(r => r.hot); if (hot) return hot;
  const td = rows.find(r => r.k === "오늘" && !r.game && !r.done); if (td) return td;
  const wk = rows.find(r => r.k === "이번 주" && !r.done); if (wk) return wk;
  const se = rows.find(r => r.k === "시즌" && !r.done); if (se) return se;
  return rows.find(r => r.game) || rows[0];
}
function buildLadderCard() {
  secTitle("daily", "다음 목표", "오늘 · 이번 주 · 시즌");
  const card = el("div", "card gl");
  card.innerHTML = `<div class="gl-rows" id="glRows"></div><p class="muted gl-foot" id="glFoot"></p>`;
  addCustom("daily", card, () => renderLadder(true));
  card.addEventListener("click", e => { const b = hbBtn(e, card); if (b && b.dataset && b.dataset.go && b.dataset.go !== curTab) { sfx("tick"); selectTab(b.dataset.go, true); } });
}
function ladderHTML(r) {
  return `<button type="button" class="gl-row${r.done ? " done" : ""}${r.hot ? " hot" : ""}" data-go="${r.go}"><span class="gl-k">${r.k}</span><span class="gl-t"><b>${escapeHtml(r.t)}</b>${r.s ? `<small>${escapeHtml(r.s)}</small>` : ""}</span><span class="gl-v num">${escapeHtml(r.v || "")}</span><i class="gl-bar"><b style="width:${Math.round(Math.max(0, Math.min(1, r.p || 0)) * 100)}%"></b></i></button>`;
}
function renderLadder(force) {
  const now = Date.now(); if (!force && now - grUI.t < 1500) return; grUI.t = now;
  const rows = ladderRows(), pick = ladderPick(rows);
  // 메인 화면 한 줄
  const gs = $("goalStrip");
  if (gs && pick) {
    const k = [pick.k, pick.t, pick.v, pick.s, pick.go].join("|");
    if (grUI.strip !== k) {
      grUI.strip = k; gs.dataset.go = pick.go; if (gs.setAttribute) gs.setAttribute("data-go", pick.go);
      $("gsK").textContent = pick.k; $("gsT").textContent = pick.t + (pick.s ? ` · ${pick.s}` : ""); $("gsV").textContent = pick.v || "";
      gs.classList.toggle("hot", !!pick.hot);
    }
  }
  const box = $("glRows"); if (!box) return;
  const h = rows.map(ladderHTML).join("");
  if (grUI.ladder !== h) { grUI.ladder = h; box.innerHTML = h; }
  const f = $("glFoot"), ft = `예상 일수는 최근 14일 속도로 계산해요 · 자리 비운 동안은 ${OFF_CAP / 3600}시간까지 일해요`;
  if (f && f.textContent !== ft) f.textContent = ft;
}
function buildGoalStrip() {
  const gs = $("goalStrip"); if (!gs) return;
  gs.addEventListener("click", () => {
    const go = gs.dataset.go || "daily"; sfx("tick"); selectTab(go, true);
    if (go === "daily") { try { const c = document.querySelector(".gl"); if (c && c.scrollIntoView) c.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); } catch (e) {} }
  });
}

/* ---------- 퇴사 권장 게이지 · 빠른 출근 ---------- */
function stampInvested() {
  const k = JSON.stringify(S.tre || {}); if (treMemo.k === k) return treMemo.v;
  let s = 0; TREASURES.forEach(t => { const lv = Math.min(3000, (S.tre && S.tre[t.id]) || 0); for (let j = 0; j < lv; j++) s += treCost(t, j); });
  treMemo = { k, v: s }; return s;
}
function retireRatio() { const g = retireGain(); return g > 0 ? g / Math.max(30, (S.stamp || 0) + stampInvested()) : 0; }
function fastTarget(m) { m = m || S.maxFloor || 1; return m >= QC_MIN ? Math.floor(m * QC_FRAC) : 0; }
/* 퇴사 직후 출근 버스: 보스 월급을 받으며 올라가고, 막히면 무기·커피를 싼 것부터 강화 (자동 강화와 같은 규칙) */
function quickCommute(prevMax) {
  const target = fastTarget(prevMax); if (!target || target <= S.floor + 2) return null;
  const f0 = S.floor, w0 = [S.wi, S.wl]; let f = S.floor, bosses = 0, gold = 0, guard = 0, st = stats(), buys = 0;
  const gm = goldMult();
  const buy = () => {
    S.gold += gold; gold = 0;
    for (let n = 0; n < 500; n++) {
      const wc = weaponStepCost(), cc = S.coffee < 30 ? coffeeCost(S.coffee) : Infinity, useW = wc != null && wc <= cc, c = useW ? wc : cc;
      if (!isFinite(c) || S.gold < c) break;
      if (useW) weaponStep(); else { S.gold -= c; S.coffee++; } buys++;
    }
    st = stats();
  };
  outer: while (f < target && guard++ < 3000) {
    for (let k = 1; k <= 5; k++) {
      const kind = bossKind(f, k); if (!kind) continue;
      const hp = hpBase(f) * HP_MUL[kind] / st.bossBonus;
      if (TIME_LIMIT[kind] && hp / st.dps > bossTimeOf(kind)) { buy(); if (hp / st.dps > bossTimeOf(kind)) break outer; }
      gold += goldBase(f) * GOLD_MUL[kind] * gm; bosses++;
    }
    f++; if (f % 10 === 1) buy();
  }
  buy();
  if (f <= f0 + 1) return null;
  S.floor = f; S.k = 1; S.maxFloor = Math.max(S.maxFloor, f); S.bestFloor = Math.max(S.bestFloor, f);
  S.bossKills = (S.bossKills || 0) + bosses; S.totalKills = (S.totalKills || 0) + (f - f0) * 5;
  return { f, from: f0, bosses, buys, w: [S.wi, S.wl], w0 };
}
function retireGaugeHTML() {
  const g = retireGain();
  if (g <= 0) return `<div class="rg low"><div class="rg-top"><b>퇴사 게이지</b><span>50층부터</span></div><div class="rg-bar"><i style="width:${Math.min(100, (S.maxFloor || 1) / 50 * 100).toFixed(1)}%"></i></div><small>이번 회사 최고 ${S.maxFloor}층 · 50층에 오르면 사표를 낼 수 있어요</small></div>`;
  const r = retireRatio(), pct = Math.round(r * 100), w = Math.min(100, r / 3 * 100), lv = r >= 2 ? "hot" : r >= 0.5 ? "ok" : "low";
  const msg = r >= 2 ? "지금 퇴사하면 크게 늘어요!" : r >= 0.5 ? "퇴사하기 좋은 때예요" : "조금 더 올라가면 더 많이 받아요";
  const nx = Math.floor(Math.pow((S.maxFloor + 10) / 10, 1.6) * stampMult()), ft = fastTarget();
  return `<div class="rg ${lv}"><div class="rg-top"><b>${msg}</b><span class="rg-pct num">+${pct}%</span></div>
    <div class="rg-bar"><i style="width:${w.toFixed(1)}%"></i><em class="m50"></em><em class="m200"></em></div>
    <div class="rg-lbl"><span>0</span><span class="l50">+50%</span><span class="l200">+200%</span></div>
    <small>지금 퇴사하면 도장 ${fmtR(g)}개 · 가진 도장 ${fmtR(S.stamp || 0)} + 보물에 쓴 도장 ${fmtR(stampInvested())}에 견줘요 · 10층 더 오르면 ${fmtR(nx)}개${ft ? `<br>빠른 출근: 다음 회사는 ${ft}층까지 출근 버스로 바로 올라가요` : ""}</small></div>`;
}

/* ---------- 탭 차례로 열기 ---------- */
function tabGate() {
  if (!S.tabSeen || typeof S.tabSeen !== "object") S.tabSeen = tabSeenMerge(null, S);
  let n = 0;
  TABS.forEach(([id, label]) => {
    const open = tabOpen(id); if (open) n++;
    const b = tabBtns[id]; if (b && b.hidden !== !open) b.hidden = !open;
    if (open && TAB_UNLOCK[id] && !S.tabSeen[id]) {
      S.tabSeen[id] = 1;
      if (b && b.classList) { b.classList.add("fresh"); setTimeout(() => { if (b.classList) b.classList.remove("fresh"); }, 4000); }
      celebrateLater({ ic: id, title: `새 메뉴가 열렸어요 · ${label}`, sub: TAB_INTRO[id] || "", tone: "gold", sound: "pass", ms: 2800 });
    }
  });
  if (n !== tabCols) { tabCols = n; const tb = $("tabs"); if (tb && tb.style) tb.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`; }
  if (!tabOpen(curTab)) selectTab("weapon");
}
function buildGuideCard() {
  secTitle("info", "안내 다시 보기", "메뉴와 새 기능");
  const card = el("div", "card mg");
  card.innerHTML = `<div id="mgTabs"></div><div class="mg-sys">${GR_GUIDE.map(([n, d]) => `<details class="gd"><summary>${n}</summary><p>${d}</p></details>`).join("")}</div>`;
  addCustom("info", card, () => {
    const box = $("mgTabs"), key = TABS.map(([id]) => tabOpen(id) ? 1 : 0).join("");
    if (!box || box._k === key) return; box._k = key;
    box.innerHTML = TABS.map(([id, label]) => { const open = tabOpen(id); return `<div class="mg-row${open ? "" : " lock"}"><span class="mg-ic" data-ic="${open ? id : "lock"}"></span><div><b>${label}</b><small>${open ? TAB_INTRO[id] || "" : TAB_UNLOCK[id].d}</small></div></div>`; }).join("");
    box.querySelectorAll(".mg-ic").forEach(s => { s.innerHTML = ""; s.appendChild(pixIcon(s.dataset.ic, 26)); });
  });
}

/* ---------- 이번 주 경제 ---------- */
function ecoTick() {
  const E = ecoState(), t = dayKey(), cur = ECO_KEYS.map(k => Math.floor(+S[k] || 0));
  if (!Array.isArray(E.last) || E.last.length !== cur.length) { E.last = cur; return; }
  let D = null;
  cur.forEach((v, i) => { const d = v - E.last[i]; if (!d) return; D = D || E.days[t] || (E.days[t] = { i: [0, 0, 0, 0, 0], o: [0, 0, 0, 0, 0] }); if (d > 0) D.i[i] += d; else D.o[i] -= d; });
  E.last = cur;
  if (E.pd !== t) { E.pd = t; const lim = addDays(t, -45); for (const k in E.days) if (k < lim) delete E.days[k]; for (const k in E.pf) if (k < lim) delete E.pf[k]; }
}
function ecoSum(from, to) { const E = ecoState(), inc = [0, 0, 0, 0, 0], out = [0, 0, 0, 0, 0]; for (let d = from, g = 0; d <= to && g < 60; d = addDays(d, 1), g++) { const D = E.days[d]; if (D) for (let i = 0; i < 5; i++) { inc[i] += D.i[i] || 0; out[i] += D.o[i] || 0; } } return { inc, out }; }
function ecoSpan() { const E = ecoState(), t = dayKey(); let first = t; for (const k in E.days) if (k < first) first = k; return Math.max(1, Math.min(7, dayDiff(first, t) + 1)); }
/* 일주일치(최근 7일 하루 평균 × 7)보다 많이 고인 재화 */
function ecoHoards() {
  const t = dayKey(), n = ecoSpan(), w = ecoSum(addDays(t, -(n - 1)), t), out = [];
  if (n < 3) return out;
  ECO_KEYS.forEach((k, i) => { const have = Math.floor(+S[k] || 0), per = w.inc[i] / n; if (per > 0 && have > per * 7 && have >= 20 && tabOpen(ECO_SINK[k][0])) out.push({ k, days: Math.floor(have / per) }); });
  return out.sort((a, b) => b.days - a.days);
}
/* 다음 핵심 강화까지 필요한 실제 활동 (말씀 n장 · 공부 n분) */
function ecoNext() {
  const out = [];
  if (tabOpen("pet")) {
    const pc = PETS.filter(p => (S.bestFloor || 1) >= p.floor).map(p => { const lv = petLv(p.id); return { c: lv ? petUp(p, lv) : p.price, n: p.n, j: !lv }; }).sort((a, b) => a.c - b.c)[0];
    if (pc) { const need = Math.max(0, pc.c - S.manna), per = Math.max(1, Math.round(10 * readMult())); out.push(need ? `${pc.n} ${pc.j ? "들이기" : "강화"}까지 만나 ${fmtR(need)} · 말씀 약 ${Math.ceil(need / per)}장` : `${pc.n} ${pc.j ? "들이기" : "강화"} 바로 할 수 있어요`); }
  }
  if (tabOpen("treasure")) {
    const tr = TREASURES.filter(t => !(t.max && S.tre[t.id] >= t.max)).map(t => ({ c: treCost(t, S.tre[t.id] || 0), n: treName(t, S.tre[t.id] || 0) })).sort((a, b) => a.c - b.c)[0];
    if (tr) { const need = Math.max(0, tr.c - S.stamp); out.push(need ? `${tr.n} 강화까지 도장 ${fmtR(need)} · 말씀 약 ${need}장 (장마다 1)` : `${tr.n} 강화 바로 할 수 있어요`); }
  }
  if (tabOpen("suit")) {
    const wk = ecoSum(weekKey(), dayKey()), sm = Math.max(0, (S.week && S.week.study) || 0), opm = sm >= 10 && wk.inc[2] > 0 ? wk.inc[2] / sm : 0;
    const W = wardState(), opts = [{ c: CHARM_PRICE, t: "부적 한 장" }];
    WITEMS.forEach(it => { if (W.own[it.id] == null && it.cost) opts.push({ c: it.cost.ore, t: `${it.n} 사기` }); });
    WSLOT.forEach(sl => { const id = W.eq[sl.id]; if (!id || sl.id === "title" || W.own[id] == null || W.own[id] >= WENH_MAX) return; const c = wardEnhCost(WIT[id], W.own[id]); if (c.ore && !c.silver) opts.push({ c: c.ore, t: `${WIT[id].n} +${W.own[id] + 1} 강화` }); });
    const o = opts.sort((a, b) => a.c - b.c)[0], need = Math.max(0, o.c - S.ore);
    out.push(need ? `${o.t}까지 광석 ${fmtR(need)}` + (opm ? ` · 공부 약 ${Math.ceil(need / opm)}분` : "") : `${o.t} 바로 할 수 있어요 (광석 ${fmtR(o.c)})`);
  }
  return out;
}
function buildEcoCard() {
  secTitle("info", "이번 주 경제", "월요일부터 오늘까지");
  const card = el("div", "card eco");
  card.innerHTML = `<div class="eco-tb" id="ecoTb"></div><div class="eco-al" id="ecoAl"></div><div class="eco-nx" id="ecoNx"></div><p class="muted">번 것·쓴 것은 게임이 켜져 있는 동안 센 값이에요. 일주일치보다 많이 고이면 쓸 곳을 알려 드려요.</p>`;
  addCustom("info", card, () => {
    const t = dayKey(), wk = weekKey(), w = ecoSum(wk, t), lw = ecoSum(addDays(wk, -7), addDays(wk, -1)), hs = ecoHoards(), nx = ecoNext();
    const key = JSON.stringify([w, lw, hs, nx, ECO_KEYS.map(k => Math.floor(+S[k] || 0))]);
    if (card._k === key) return; card._k = key;
    $("ecoTb").innerHTML = `<div class="eco-h"><span></span><span>번 것</span><span>쓴 것</span><span>지금</span></div>` + ECO_KEYS.map((k, i) =>
      `<div class="eco-r"><span class="eco-n">${ri(k)}${ECO_NAME[k]}</span><b class="eco-i num">+${fmtR(w.inc[i])}</b><b class="eco-o num">−${fmtR(w.out[i])}</b><b class="num">${fmtR(Math.floor(+S[k] || 0))}</b><small>${ECO_USE[k]}${lw.inc[i] ? ` · 지난주 +${fmtR(lw.inc[i])}` : ""}</small></div>`).join("");
    $("ecoAl").innerHTML = hs.slice(0, 2).map(h => `<button type="button" class="eco-go" data-go="${ECO_SINK[h.k][0]}">${ri(h.k)}<span>${hbJosa(ECO_NAME[h.k], "이", "가")} ${h.days}일치 모였어요 · ${ECO_SINK[h.k][1]} 탭에서 쓸 수 있어요</span><b>가 보기 ›</b></button>`).join("");
    $("ecoNx").innerHTML = nx.length ? `<b>다음 강화까지</b>` + nx.map(s => `<div>${escapeHtml(s)}</div>`).join("") : "";
  });
  card.addEventListener("click", e => { const b = hbBtn(e, card); if (b && b.dataset && b.dataset.go && tabOpen(b.dataset.go)) { sfx("tick"); selectTab(b.dataset.go, true); } });
}

/* ---------- 화면 갱신 때마다 ---------- */
function growTick() {
  if (!S) return;
  progSnap(); ecoTick(); tabGate(); chipGate(); renderLadder(false);
}
