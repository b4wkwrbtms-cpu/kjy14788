/* ===================== 결제 대체 장치 (v31 · 고도화 4단계) =====================
   돈으로 사는 과금 장치 일곱 가지를 말씀·암송·공부 시간으로 바꿈 (기준서 기둥 6·11, 과금 장치 대체표).
   1) 첫걸음 꾸러미 (스타터 팩): 첫 말씀 1장 + 첫 집중 25분 → 한 번 큰 선물 + 칭호 '첫걸음'. 기한 없음.
   2) 절기 순례 (시즌 패스): 추수감사·대림·주현·사순·부활·성령강림. 순례 XP = 그날 말씀·공부·암송·묵상·보스(하루 상한)
      + 이번 주 목표(주간 일괄 미션, 주간 목표와 같음). 무료 길은 누구나, 헌신 길은 7일 안에 말씀 5일(안식 빼고 비율)이면 소급 개방.
      스킵 없음, 보상 영구, 끝날 때 못 받은 보상 자동 지급, 남은 토큰은 광석으로. 절기 상점(옷·칭호·재료), 한정 옷은 이듬해 다시.
   3) 시간의 두루마리 (시간 스킵): 집중 25분마다 1장, 펼치면 지금 층에서 2시간 일한 월급(하루 3장). 층·신기록·보스 첫 처치는 그대로.
   4) 묵상 2배 (광고 2배): 정산서·오늘 업무 모두 완료 보상 뒤 말씀 1장·암송 5구절·묵상 한 줄 중 하나 → 같은 보상 한 번 더. 하루 3번, 기한 없음.
   5) 달란트 항아리 (저금통): 보스 월급의 12%가 따로 모이고, 암송 10구절 통과마다 열기. 퇴사해도 그대로.
   6) 첫 완독·첫 암송 2배 (첫 결제 2배): 권마다 첫 완독 선물 2배, 새 구절 첫 통과 보상 2배.
   7) 성경 66권 도감: 권마다 처음 끝낸 날, 구약·신약 완성률, 묶음 완독 칭호(옷장).
   merge·freshState 에서 부르므로 함수 선언과 var 만 씀 */
var FEST_DEF = {
  thanks: { n: "추수감사 순례", col: "#ffb35a", set: "harvest", title: "t_thanks", when: "해마다 10~11월 (추수감사주일까지 6주)",
    wk: [["심음", "눈물을 흘리며 씨를 뿌리는 자는 기쁨으로 거두리로다", "시 126:5"], ["자람", "오직 하나님은 자라나게 하셨나니", "고전 3:6"],
      ["기다림", "농부가 땅에서 나는 귀한 열매를 바라고 길이 참아 이른 비와 늦은 비를 기다리나니", "약 5:7"], ["열매", "오직 성령의 열매는 사랑과 희락과 화평과 오래 참음과 자비와 양선과 충성과", "갈 5:22"],
      ["나눔", "하나님은 즐겨 내는 자를 사랑하시느니라", "고후 9:7"], ["감사", "여호와께 감사하라 그는 선하시며 그 인자하심이 영원함이로다", "시 136:1"]] },
  advent: { n: "대림·성탄 순례", col: "#a07bff", set: "advent", title: "t_advent", when: "해마다 대림절 첫 주일부터 4주",
    wk: [["소망", "흑암에 행하던 백성이 큰 빛을 보고 사망의 그늘진 땅에 거하던 자에게 빛이 비취도다", "사 9:2"], ["평화", "평강의 왕이라 할것임이라", "사 9:6"],
      ["기쁨", "무서워 말라 보라 내가 온 백성에게 미칠 큰 기쁨의 좋은 소식을 너희에게 전하노라", "눅 2:10"], ["사랑", "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니", "요 3:16"]] },
  epiphany: { n: "주현 순례", col: "#ffd54a", set: "", title: "t_epiphany", when: "해마다 1월 6일부터 4주",
    wk: [["별", "저희가 별을 보고 가장 크게 기뻐하고 기뻐하더라", "마 2:10"], ["빛", "빛이 어두움에 비취되 어두움이 깨닫지 못하더라", "요 1:5"],
      ["일어남", "일어나라 빛을 발하라", "사 60:1"], ["세상의 빛", "너희는 세상의 빛이라", "마 5:14"]] },
  lent: { n: "사순 순례", col: "#c08aff", set: "", title: "t_lent", when: "해마다 재의 수요일부터 부활절 전날까지",
    wk: [["광야", "사람이 떡으로만 살것이 아니요 하나님의 입으로 나오는 모든 말씀으로 살 것이라", "마 4:4"], ["정한 마음", "하나님이여 내 속에 정한 마음을 창조하시고", "시 51:10"],
      ["자기 부인", "자기를 부인하고 자기 십자가를 지고 나를 좇을 것이니라", "마 16:24"], ["섬김", "인자의 온 것은 섬김을 받으려 함이 아니라 도리어 섬기려 하고", "막 10:45"],
      ["한 알의 밀", "한 알의 밀이 땅에 떨어져 죽지 아니하면 한 알 그대로 있고", "요 12:24"], ["낮아지심", "자기를 낮추시고 죽기까지 복종하셨으니", "빌 2:8"],
      ["채찍에 맞으심", "그가 채찍에 맞음으로 우리가 나음을 입었도다", "사 53:5"]] },
  easter: { n: "부활 순례", col: "#7fe3a0", set: "", title: "t_easter", when: "해마다 부활절부터 6주",
    wk: [["첫 열매", "잠자는 자들의 첫 열매가 되셨도다", "고전 15:20"], ["부활과 생명", "나는 부활이요 생명이니", "요 11:25"],
      ["엠마오", "우리에게 성경을 풀어 주실 때에 우리 속에서 마음이 뜨겁지 아니하더냐", "눅 24:32"], ["보지 못하고 믿음", "보지못하고 믿는 자들은 복되도다", "요 20:29"],
      ["새 생명", "우리로 또한 새 생명 가운데서 행하게 하려 함이니라", "롬 6:4"], ["증인", "땅끝까지 이르러 내 증인이 되리라", "행 1:8"]] },
  pentecost: { n: "성령강림 순례", col: "#ff8a5a", set: "", title: "t_pentecost", when: "해마다 성령강림절부터 4주",
    wk: [["충만", "저희가 다 성령의 충만함을 받고", "행 2:4"], ["가르치심", "그가 너희에게 모든 것을 가르치시고", "요 14:26"],
      ["도우심", "이와 같이 성령도 우리 연약함을 도우시나니", "롬 8:26"], ["성령으로 행함", "만일 우리가 성령으로 살면 또한 성령으로 행할찌니", "갈 5:25"]] },
};
var FEST_SET_ORDER = ["head", "top", "prop", "tie", "arm", "shoes"];
var FEST_XP_LV = 100, FEST_CAP = { c: 100, s: 60, m: 60, n: 10, b: 30 }, FEST_DAY_MAX = 260;
var FEST_WEEK_XP = 60, FEST_WEEK_TOK = 4, FEST_DEV_TOK = 3, FEST_OV_TOK = 2, FEST_TOK_ORE = 25;
var FEST_PIECE_TOK = 25, FEST_TITLE_TOK = 40, FEST_DUP_PIECE = 10, FEST_DUP_TITLE = 20;
var FEST_SHOP_RES = [
  { id: "ore", n: "광석 300", rw: { ore: 300 }, tok: 10 },
  { id: "silver", n: "은괴 2", rw: { silver: 2 }, tok: 10 },
  { id: "ame", n: "자수정 1", rw: { ame: 1 }, tok: 15 },
  { id: "scroll", n: "시간의 두루마리 1장", rw: { scroll: 1 }, tok: 8 },
];
var START_RW = { manna: 200, ore: 500, silver: 3, ame: 1, haste: 2, gold2: 2, rage: 1 };
var SCROLL_SEC = 7200, SCROLL_DAY = 3, DBL_DAY = 3, DBL_KEEP = 9, JAR_RATE = 0.12, JAR_MEM = 10;
var BK_GROUPS = { torah: ["모세오경", 0, 5], gospel: ["복음서", 39, 43], paul: ["바울서신", 44, 57], ot: ["구약", 0, 39], nt: ["신약", 39, 66] };
var BK_TITLE = { torah: "t_torah", gospel: "t_gospel", paul: "t_paul", ot: "t_ot", nt: "t_nt" };
var BK_SHORT = ["창", "출", "레", "민", "신", "수", "삿", "룻", "삼상", "삼하", "왕상", "왕하", "대상", "대하", "스", "느", "에", "욥", "시", "잠", "전", "아", "사", "렘", "애", "겔", "단", "호", "욜", "암", "옵", "욘", "미", "나", "합", "습", "학", "슥", "말",
  "마", "막", "눅", "요", "행", "롬", "고전", "고후", "갈", "엡", "빌", "골", "살전", "살후", "딤전", "딤후", "딛", "몬", "히", "약", "벧전", "벧후", "요일", "요이", "요삼", "유", "계"];
var FEST_GUIDE = [
  ["첫걸음 꾸러미", "첫 말씀 1장과 첫 집중 25분을 마치면 업무 탭 맨 위에서 한 번 여는 큰 선물이에요(만나·광석·은괴·자수정·버프 + 칭호 '첫걸음'). 기한은 없어요."],
  ["절기 순례", "교회력 절기(추수감사·대림·주현·사순·부활·성령강림)마다 4~7주 순례가 열려요. 그날 읽은 말씀·공부·암송·묵상·보스로 순례 XP가 쌓이고(하루 최대 260, 다 채우면 '오늘은 충분합니다'), 이번 주 목표를 채울 때마다 XP 60과 토큰 4를 더 받아요. 헌신 길은 7일 안에 말씀 5일이면 열리고, 열리면 지난 레벨 보상까지 모두 받아요. 레벨을 건너뛰는 방법은 없어요. 보상은 영구, 끝나는 날 못 받은 보상은 자동으로 받고 남은 토큰은 광석으로 바꿔 드려요. 절기 옷은 이듬해 같은 절기에 다시 나와요."],
  ["시간의 두루마리", "공부 탭 집중 25분마다 1장. 펼치면 지금 층에서 2시간 일한 월급을 바로 받아요(하루 3장, 잠깐 버프는 빼고 계산). 층·신기록·보스 첫 처치는 그대로라 건너뛸 수 없어요."],
  ["묵상 2배", "정산서나 '오늘 업무 모두 완료' 보상을 받은 뒤 말씀 1장 · 암송 5구절 · 묵상 한 줄 가운데 하나를 하면 같은 보상을 한 번 더 받아요. 기본 보상은 그대로, 기한 없음, 하루 3번."],
  ["달란트 항아리", "보스 월급의 12%가 항아리에 따로 모이고, 암송 10구절을 통과할 때마다 열 수 있어요. 퇴사해도 항아리는 그대로예요."],
  ["첫 완독·첫 암송 2배", "권마다 처음 끝까지 읽으면 완독 선물이 2배, 새 구절을 처음 통과하면 그 보상이 2배예요. 다시 읽어 끝낸 권도 완독 선물을 받아요."],
  ["성경 66권 도감", "말씀 탭에서 권마다 처음 끝낸 권과 구약·신약 완성률을 봐요. 모세오경·복음서·바울서신·구약·신약을 모두 처음 끝내면 옷장 칭호가 열려요."],
];
var festYC = {}, festCC = { t: "", v: null }, festMemo = { k: "", c: null }, festUI = { shop: false, k: {}, sl: "", quiet: false, note: "" }, scrMemo = { t: 0, v: 0, k: "" };
var PAY_DAY = /^\d{4}-\d\d-\d\d$/;

/* ---------- 아이콘: 절기 토큰 · 두루마리 · 항아리 · 등불 ---------- */
UIICON.tok = { m: ["....oooo....", "..ooYYYYoo..", ".oYYYYYYYYo.", ".oYYYwYYYYo.", "oYYYwwwYYYYo", "oYYwwWwwYYYo", "oYYYwwwYYYYo", "oYYYYwYYYYYo", ".oYYYYYYYYo.", ".oyYYYYYYyo.", "..ooyyyyoo..", "....oooo...."], p: { o: "#8a5212", Y: "#ffb53a", y: "#d9851c", w: "#fff3c2", W: "#ffffff" } };
UIICON.scroll = { m: ["............", ".hRRRRRRRRh.", "..pppppppp..", "..pllllllp..", "..pppppppp..", "..pllllllp..", "..pppppppp..", "..plllllpp..", "..pppppppp..", "..pppppppp..", ".hRRRRRRRRh.", "............"], p: { R: "#a8643a", h: "#ffd54a", p: "#f4e3b5", l: "#9a8466" } };
UIICON.jar = { m: ["....yYYy....", "...yYwwYy...", "....yYYy....", "...BBBBBB...", "....bbbb....", "..BbbbbbbB..", ".BbbbbbbbbB.", ".BbdbbbbbbB.", ".BbdbbbbbbB.", ".BbbbbbbbbB.", "..BbbbbbbB..", "...BBBBBB..."], p: { y: "#ffd54a", Y: "#fff3b0", w: "#ffffff", B: "#7a3e1e", b: "#b8673a", d: "#e8a070" } };
UIICON.lamp = { m: [".....FF.....", "....FffF....", ".....FF.....", "....LLLL....", "...LyYYyL...", "...LYwwYL...", "...LYwwYL...", "...LyYYyL...", "....LLLL....", ".....DD.....", "....DDDD....", "............"], p: { F: "#ff9b3d", f: "#ffe14a", L: "#3a3f52", y: "#ffb53a", Y: "#ffd54a", w: "#fff6cf", D: "#8a5a2e" } };
RW_NAME.tok = "절기 토큰"; RW_NAME.scroll = "시간의 두루마리"; RW_ICON.tok = "tok"; RW_ICON.scroll = "scroll";
(function festIconCss() {
  try {
    if (!document.head || !document.createElement("canvas").toDataURL) return;
    const css = ["tok", "scroll", "jar", "lamp"].map(n => `.ri-${n},span.ri-${n},i.ri-${n}{background-image:url(${pixIcon(n, 16).toDataURL("image/png")})}`).join("");
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  } catch (e) {}
})();

/* ---------- 저장값 ---------- */
function festNew() { return { sid: "", dev: 0, lv: 0, cf: 0, cd: 0, tok: 0, ov: 0, b: {}, wk: {}, hist: [] }; }
function jarNew() { return { g: 0, n: 0, open: 0, tot: 0 }; }
function scrollNew() { return { n: 0, d: "", u: 0, got: 0, used: 0 }; }
function dblNew() { return { d: "", n: 0, p: [], got: 0, st: { reg: 0, fast: 0, slow: 0 } }; }
function firstsNew() { return { start: 0, sd: "", bk: {}, br: {}, bc: {}, mem: 0, mig: 0 }; }
function payInt(v, max) { const n = Math.floor(+v || 0); return n > 0 && isFinite(n) ? Math.min(max, n) : 0; }
function payAmt(v) { const n = +v || 0; return n > 0 && isFinite(n) ? n : 0; }
function payRw(r) { const o = {}; if (r && typeof r === "object") for (const k in r) if (RW_NAME[k] && k !== "tok" && k !== "scroll") { const v = payInt(r[k], 1e6); if (v) o[k] = v; } return o; }
function payMerge(s, d) {
  d = d || {};
  const f = d.fest, F = festNew();
  if (f && typeof f === "object") {
    F.sid = typeof f.sid === "string" && /^[a-z]+-\d{4}$/.test(f.sid) ? f.sid : "";
    F.dev = f.dev ? 1 : 0; F.lv = payInt(f.lv, 99); F.cf = Math.min(F.lv, payInt(f.cf, 99)); F.cd = Math.min(F.lv, payInt(f.cd, 99));
    F.tok = payInt(f.tok, 1e6); F.ov = payInt(f.ov, 9999);
    if (f.b && typeof f.b === "object") for (const k in f.b) { const v = payInt(f.b[k], 1e6); if (PAY_DAY.test(k) && v) F.b[k] = v; }
    if (f.wk && typeof f.wk === "object") for (const k in f.wk) { const v = payInt(f.wk[k], 7) & 7; if (PAY_DAY.test(k) && v) F.wk[k] = v; }
    F.hist = Array.isArray(f.hist) ? f.hist.filter(h => h && typeof h.k === "string" && /^[a-z]+-\d{4}$/.test(h.k)).map(h => ({ k: h.k, L: payInt(h.L, 99), max: payInt(h.max, 99), dev: h.dev ? 1 : 0 })).slice(-12) : [];
  }
  s.fest = F;
  const j = d.jar, J = jarNew();
  if (j && typeof j === "object") { J.g = payAmt(j.g); J.n = payInt(j.n, 9999); J.open = payInt(j.open, 1e9); J.tot = payAmt(j.tot); }
  s.jar = J;
  const c = d.scroll, C = scrollNew();
  if (c && typeof c === "object") { C.n = payInt(c.n, 9999); C.d = typeof c.d === "string" && PAY_DAY.test(c.d) ? c.d : ""; C.u = payInt(c.u, SCROLL_DAY); C.got = payInt(c.got, 1e9); C.used = payInt(c.used, 1e9); }
  s.scroll = C;
  const b = d.dbl, D = dblNew();
  if (b && typeof b === "object") {
    D.d = typeof b.d === "string" && PAY_DAY.test(b.d) ? b.d : ""; D.n = payInt(b.n, DBL_DAY); D.got = payInt(b.got, 1e9);
    D.p = Array.isArray(b.p) ? b.p.filter(p => p && typeof p === "object").map(p => ({ s: p.s === "daily" ? "daily" : "back", g: payAmt(p.g), rw: payRw(p.rw), c0: payInt(p.c0, 1e9), m0: payInt(p.m0, 1e9), d: typeof p.d === "string" && PAY_DAY.test(p.d) ? p.d : "", nd: p.nd ? 1 : 0, t: payInt(p.t, 1e15) })).filter(p => p.g > 0 || Object.keys(p.rw).length).slice(-DBL_KEEP) : [];
  }
  if (b && b.st && typeof b.st === "object") D.st = { reg: payInt(b.st.reg, 1e6), fast: payInt(b.st.fast, 1e6), slow: payInt(b.st.slow, 1e6) };
  s.dbl = D;
  const x = d.firsts, X = firstsNew();
  if (x && typeof x === "object") {
    X.start = x.start ? 1 : 0; X.sd = typeof x.sd === "string" ? x.sd.slice(0, 10) : ""; X.mem = payInt(x.mem, 1e6); X.mig = x.mig ? 1 : 0;
    for (let i = 0; i < 66; i++) {
      const k = x.bk && x.bk[i]; if (typeof k === "string" && (k === "-" || PAY_DAY.test(k))) X.bk[i] = k;
      const r = x.br && Math.floor(+x.br[i]); if (x.br && x.br[i] != null && isFinite(r) && r >= -1) X.br[i] = Math.min(999, r);
      const n = x.bc && payInt(x.bc[i], 999); if (n) X.bc[i] = n;
    }
  }
  s.firsts = X;
}
function festState() { if (!S.fest || typeof S.fest !== "object" || !S.fest.b || !S.fest.wk || !Array.isArray(S.fest.hist)) S.fest = festNew(); return S.fest; }
function jarState() { if (!S.jar || typeof S.jar !== "object") S.jar = jarNew(); return S.jar; }
function scrollState() { if (!S.scroll || typeof S.scroll !== "object") S.scroll = scrollNew(); return S.scroll; }
function dblState() { if (!S.dbl || typeof S.dbl !== "object" || !Array.isArray(S.dbl.p)) S.dbl = dblNew(); if (!S.dbl.st) S.dbl.st = { reg: 0, fast: 0, slow: 0 }; return S.dbl; }
function firstsState() { if (!S.firsts || typeof S.firsts !== "object" || !S.firsts.bk || !S.firsts.br || !S.firsts.bc) S.firsts = firstsNew(); return S.firsts; }

/* ---------- 보상 주기 (토큰·두루마리·옷 포함) ---------- */
function wardGive(id) {
  const it = WIT[id], W = wardState(); if (!it || W.own[id] != null) return false;
  W.own[id] = 0; W.ops++;
  if (W.seen) { if (W.seen.indexOf(id) < 0) W.seen.push(id); W.nv.push(id); }
  if (!W.eq[it.slot]) W.eq[it.slot] = id;
  wardDirty++; wardCollTick(true);
  return true;
}
function payGive(rw) {
  const F = festState(), o = {};
  for (const k in rw) {
    const v = rw[k]; if (!(v > 0)) continue;
    if (k === "tok") F.tok += v; else if (k === "scroll") scrollState().n += v; else if (RW_NAME[k]) o[k] = v;
  }
  grant(o);
}
function payNote(msg) { if (rd || memSess || backOn) festUI.note = msg; else toast(msg); }
function payNoteFlush() { if (festUI.note && !rd && !memSess && !backOn) { const m = festUI.note; festUI.note = ""; toast(m); } }

/* ---------- 교회력 ---------- */
function festEaster(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mo = Math.floor((h + l - 7 * m + 114) / 31), da = (h + l - 7 * m + 114) % 31 + 1;
  return y + "-" + pad2(mo) + "-" + pad2(da);
}
/* 추수감사주일 = 11월 셋째 주일, 대림절 첫 주일 = 12월 3일이나 그 전 주일 */
function festThxSun(y) { const w = keyDate(y + "-11-01").getDay(); return y + "-11-" + pad2(1 + (7 - w) % 7 + 14); }
function festAdvSun(y) { const k = y + "-12-03"; return addDays(k, -keyDate(k).getDay()); }
function festYear(y) {
  if (festYC[y]) return festYC[y];
  const E = festEaster(y), thx = festThxSun(y), adv = festAdvSun(y), ep = y + "-01-06";
  const L = [["epiphany", ep, addDays(ep, 27)], ["lent", addDays(E, -46), addDays(E, -1)], ["easter", E, addDays(E, 41)], ["pentecost", addDays(E, 49), addDays(E, 76)], ["thanks", addDays(thx, -41), thx], ["advent", adv, addDays(adv, 27)]];
  return (festYC[y] = L.map(([id, start, end]) => { const days = dayDiff(start, end) + 1, weeks = Math.ceil(days / 7); return { id, key: id + "-" + y, y, start, end, days, weeks, maxL: 5 * weeks }; }));
}
function festCur(t) {
  t = t || dayKey(); if (festCC.t === t) return festCC.v;
  let v = null; festYear(+t.slice(0, 4)).forEach(s => { if (s.start <= t && t <= s.end) v = s; });
  festCC = { t, v }; return v;
}
function festNextSe(t) { t = t || dayKey(); const y = +t.slice(0, 4); return festYear(y).concat(festYear(y + 1)).filter(s => s.start > t).sort((a, b) => a.start < b.start ? -1 : 1)[0] || null; }
function festByKey(k) { const m = /^([a-z]+)-(\d{4})$/.exec(k || ""); return m ? festYear(+m[2]).find(s => s.id === m[1]) || null : null; }
function festMD(k) { const d = keyDate(k); return `${d.getMonth() + 1}월 ${d.getDate()}일`; }
function festWeekIdx(se, t) { return Math.max(0, Math.min(se.weeks - 1, Math.floor(dayDiff(se.start, t || dayKey()) / 7))); }
function festMon(d) { return addDays(d, -((keyDate(d).getDay() + 6) % 7)); }
function festBits(m) { return (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1); }

/* ---------- 순례 XP ---------- */
function festReadDay(d) { const h = habitRaw(d); return h.c !== 0 || !!((habitState().td[d] || 0) & 1); }
function festDayXP(d, F, notes) {
  const h = habitRaw(d), t = dayKey();
  const c = h.c === -1 ? 1 : +h.c || 0, s = h.s === -1 ? 25 : +h.s || 0, m = h.m === -1 ? 5 : +h.m || 0;
  const b = d === t ? Math.max(F.b[d] || 0, (S.day && S.day.key === t && S.day.boss) || 0) : (F.b[d] || 0);
  const o = { c: Math.min(FEST_CAP.c, 10 * c), s: Math.min(FEST_CAP.s, 10 * Math.floor(s / 25 + 1e-6)), m: Math.min(FEST_CAP.m, 3 * m), n: notes[d] ? FEST_CAP.n : 0, b: Math.min(FEST_CAP.b, b) };
  o.tot = o.c + o.s + o.m + o.n + o.b; return o;
}
/* 이번 주 목표(월요일 시작)를 순례 기간 안의 날만으로, 안식한 날을 뺀 비율로 */
function festWeekEval(se, wk) {
  const H = habitState(), t = dayKey(), from = wk < se.start ? se.start : wk, end = addDays(wk, 6), to = end > se.end ? se.end : end;
  if (from > to || from > t) return null;
  let span = 0, rest = 0, bd = 0, st = 0, mm = 0;
  for (let d = from, g = 0; d <= to && g < 7; d = addDays(d, 1), g++) {
    span++; if (restOn(d)) rest++;
    if (d > t) continue;
    const h = habitRaw(d);
    if (h.c !== 0 || ((H.td[d] || 0) & 1)) bd++;
    st += h.s === -1 ? 25 : +h.s || 0; mm += h.m === -1 ? 5 : +h.m || 0;
  }
  const act = span - rest; if (act <= 0) return { wk, items: [] };
  const f = act / 7;
  return { wk, items: [
    { n: "말씀", v: bd, g: Math.max(1, Math.ceil(Math.max(3, Math.min(7, H.wgoal || 4)) * f)), u: "일" },
    { n: "공부", v: Math.floor(st), g: Math.max(1, Math.ceil(300 * f)), u: "분" },
    { n: "암송", v: mm, g: Math.max(1, Math.ceil(40 * f)), u: "구절" },
  ] };
}
/* 헌신 길: 순례 안의 아무 7일 동안 말씀 5일 (안식한 날은 빼고 비율) */
function festDevEval(se) {
  const t = dayKey(), last = t < se.end ? t : se.end, lastX = se.days > 7 ? addDays(se.end, -6) : se.start, rd7 = {};
  const readOn = d => (d in rd7) ? rd7[d] : (rd7[d] = d <= t && festReadDay(d));
  const win = x => { let n = 0, r = 0; for (let i = 0; i < 7; i++) { const d = addDays(x, i); if (d > se.end) break; if (restOn(d)) r++; if (readOn(d)) n++; } return { n, need: r >= 7 ? 99 : Math.max(1, Math.ceil(5 * (7 - r) / 7)), from: x }; };
  let ok = false;
  for (let x = se.start, g = 0; x <= lastX && x <= last && g < 80 && !ok; x = addDays(x, 1), g++) { const w = win(x); if (w.n >= w.need) ok = true; }
  const x0 = addDays(last, -6), cur = win(x0 < se.start ? se.start : x0 > lastX ? lastX : x0);
  return { ok, cur };
}
function festCalc(se) {
  const F = festState(), t = dayKey(), last = t < se.end ? t : se.end, notes = {};
  (S.bible.notes || []).forEach(n => { if (n && n.d) notes[n.d] = 1; });
  let day = 0, today = null;
  for (let d = se.start, g = 0; d <= last && g < 80; d = addDays(d, 1), g++) { const x = festDayXP(d, F, notes); day += x.tot; if (d === t) today = x; }
  const weeks = [];
  for (let wk = festMon(se.start), g = 0; wk <= last && g < 12; wk = addDays(wk, 7), g++) { const w = festWeekEval(se, wk); if (w) weeks.push(w); }
  return { day, today: today || { c: 0, s: 0, m: 0, n: 0, b: 0, tot: 0 }, weeks, dv: festDevEval(se) };
}
/* 계산 + 주간 목표 비트(한 번 채우면 그대로) + 토큰 */
function festGet(se, force) {
  const F = festState(), D = S.day || {}, H = habitState(), nt = S.bible.notes || [];
  const k = [se.key, dayKey(), D.chap, Math.floor(D.study || 0), D.mem, Math.min(FEST_CAP.b, Math.max(D.boss || 0, F.b[dayKey()] || 0)), nt.length, nt.length ? nt[nt.length - 1].d : "", attVer, H.wgoal, JSON.stringify(H.rest), (H.restLog || []).length, JSON.stringify(F.wk)].join("|");
  if (!force && festMemo.k === k && festMemo.c && festMemo.c.key === se.key) return festMemo.c;
  const c = festCalc(se); c.key = se.key;
  let fresh = 0;
  c.weeks.forEach(w => { let m = 0; w.items.forEach((it, i) => { if (it.v >= it.g) m |= 1 << i; }); const old = F.wk[w.wk] || 0, add = m & ~old; if (add) { F.wk[w.wk] = old | m; fresh += festBits(add); } });
  if (fresh) { F.tok += fresh * FEST_WEEK_TOK; if (!festUI.quiet) payNote(`이번 주 목표 달성 · 순례 XP +${fresh * FEST_WEEK_XP} · 절기 토큰 +${fresh * FEST_WEEK_TOK}`); }
  let wb = 0; for (const wk in F.wk) wb += festBits(F.wk[wk]);
  c.wb = wb; c.xp = c.day + wb * FEST_WEEK_XP;
  c.L = Math.min(se.maxL, Math.floor(c.xp / FEST_XP_LV));
  c.ov = c.L >= se.maxL ? Math.max(0, Math.floor((c.xp - se.maxL * FEST_XP_LV) / FEST_XP_LV)) : 0;
  festMemo = { k: k.replace(/\|[^|]*$/, "|" + JSON.stringify(F.wk)), c };
  return c;
}

/* ---------- 보상표 ---------- */
function festFreeRw(i) { if (i % 5 === 0) return { ore: 300, silver: 2 }; return [null, { gold2: 1 }, { ore: 120 }, { haste: 1 }, { rage: 1, stamp: 3 }][i % 5]; }
function festDevRw(se, i) {
  const D = FEST_DEF[se.id], o = { tok: FEST_DEV_TOK };
  if (i % 5 === 0) {
    const set = D.set && WSETX[D.set], slot = FEST_SET_ORDER[i / 5 - 1], pc = set && slot ? wardSetPieces(set).find(it => it.slot === slot) : null;
    if (pc) o.wid = pc.id; else { o.silver = 2; o.ame = 1; }
  }
  if (i === se.maxL && D.title && WIT[D.title]) o.title = D.title;
  return o;
}
function festDevGive(se, i, items) {
  const rw = festDevRw(se, i), out = { tok: rw.tok || 0 };
  if (rw.wid) { if (wardGive(rw.wid)) items.push(rw.wid); else out.tok += FEST_DUP_PIECE; }
  if (rw.title) { if (wardGive(rw.title)) items.push(rw.title); else out.tok += FEST_DUP_TITLE; }
  if (rw.silver) out.silver = rw.silver; if (rw.ame) out.ame = rw.ame;
  payGive(out); return out;
}
function festClaim(se, c) {
  const F = festState(); c = c || festGet(se);
  const L = Math.max(F.lv, c.L), tot = {}, items = []; let n = 0; F.lv = L;
  const add = rw => { for (const k in rw) if (typeof rw[k] === "number" && rw[k] > 0) tot[k] = (tot[k] || 0) + rw[k]; };
  for (let i = F.cf + 1; i <= L; i++) { const rw = festFreeRw(i); payGive(rw); add(rw); n++; }
  F.cf = Math.max(F.cf, L);
  if (F.dev) {
    for (let i = F.cd + 1; i <= L; i++) { add(festDevGive(se, i, items)); n++; }
    F.cd = Math.max(F.cd, L);
    if (c.ov > F.ov) { const k = (c.ov - F.ov) * FEST_OV_TOK; F.tok += k; tot.tok = (tot.tok || 0) + k; F.ov = c.ov; n++; }
  }
  return { n, tot, items };
}
function festClaimable() { const se = festCur(); if (!se) return 0; const F = festState(); return Math.max(0, F.lv - F.cf) + (F.dev ? Math.max(0, F.lv - F.cd) : 0); }
function festClaimNow() {
  const se = festCur(); if (!se) return;
  if (roffOn()) { toast("보상 끄기 주간이에요 · 순례 XP는 그대로 쌓이고, 보상은 주가 끝나면 받아요"); return; }
  const r = festClaim(se); if (!r.n) return;
  const its = r.items.map(id => WIT[id] ? WIT[id].n : "").filter(Boolean).join(" · ");
  celebrate({ wid: r.items[0], ic: "lamp", title: `순례 보상 ${r.n}개!`, sub: (its ? `${escapeHtml(its)}<br>` : "") + `<span class="rws">${rwHTML(r.tot)}</span>`, tone: r.items.length ? "rare" : "gold", sound: "pass", ms: 3000 });
  updateUI(true); save();
}

/* ---------- 순례 바뀜: 끝난 순례 마무리 · 새 순례 시작 ---------- */
function festClose(k) {
  const F = festState(), se = festByKey(k); if (!se || !FEST_DEF[se.id]) return;
  festUI.quiet = true; const c = festGet(se, true); festUI.quiet = false;
  if (!F.dev && c.dv.ok) F.dev = 1;
  const got = festClaim(se, c), left = F.tok, ore = left * FEST_TOK_ORE;
  if (left > 0) { S.ore += ore; F.tok = 0; }
  F.hist.push({ k, L: F.lv, max: se.maxL, dev: F.dev }); if (F.hist.length > 12) F.hist = F.hist.slice(-12);
  const D = FEST_DEF[se.id];
  const its = got.items.map(id => WIT[id] ? WIT[id].n : "").filter(Boolean);
  celebrateLater({ wid: got.items[0], ic: "lamp", title: `${hbJosa(D.n, "을", "를")} 마쳤어요`, sub: `Lv ${F.lv}/${se.maxL}${F.dev ? " · 헌신 길" : ""}` + (got.n ? `<br>못 받은 보상 ${got.n}개를 받아 두었어요` : "") + (its.length ? `<br>${escapeHtml(its.slice(0, 4).join(" · "))}${its.length > 4 ? ` 외 ${its.length - 4}` : ""}` : "") + (Object.keys(got.tot).length ? `<br><span class="rws">${rwHTML(got.tot)}</span>` : "") + (left ? `<br>남은 토큰 ${left}개 → 광석 ${fmtR(ore)}` : "") + `<br><span class="muted">${D.when} 다시 열려요</span>`, tone: "rare", sound: "pass", ms: 4200, keep: 1 });
}
function festSwitch(key) {
  const F = festState();
  if (F.sid) festClose(F.sid);
  const hist = F.hist.slice(-12);
  S.fest = festNew(); const N = S.fest; N.hist = hist; N.sid = key; festMemo = { k: "", c: null }; festUI.k = {};
  if (!key) return;
  const se = festByKey(key); if (!se) { N.sid = ""; return; }
  festUI.quiet = true; const c = festGet(se, true); festUI.quiet = false;
  N.lv = c.L; if (c.dv.ok) N.dev = 1;
  const D = FEST_DEF[se.id];
  if ((+S.bible.total || 0) > 0 || (S.bestFloor || 1) >= 10) celebrateLater({ ic: "lamp", title: `${hbJosa(D.n, "이", "가")} 열렸어요`, sub: `${festMD(se.start)} ~ ${festMD(se.end)} · ${se.weeks}주 · 최대 Lv ${se.maxL}` + (c.L ? `<br>이번 순례 기록으로 Lv ${c.L}부터 시작해요` : "") + (N.dev ? " · 헌신 길 열림" : "") + `<br><span class="muted">업무 탭 '절기 순례' · 보상은 영구</span>`, tone: "rare", sound: "pass", ms: 3600, keep: 1 });
}
function festTick() {
  if (!S || !S.day || !S.bible) return;
  firstsMigrate();
  const t = dayKey(), se = festCur(t), key = se ? se.key : "";
  if (festState().sid !== key) festSwitch(key);
  const F = festState();
  if (se) {
    const db = (S.day.key === t && S.day.boss) || 0; if (db > (F.b[t] || 0)) F.b[t] = db;
    const lim = addDays(se.start, -1); for (const k in F.b) if (k < lim) delete F.b[k];
    const c = festGet(se), D = FEST_DEF[se.id];
    if (c.L > F.lv) { F.lv = c.L; payNote(`${D.n} Lv ${c.L}! · 업무 탭에서 보상을 받아요`); }
    if (!F.dev && c.dv.ok) { F.dev = 1; celebrateLater({ ic: "lamp", title: "헌신 길이 열렸어요!", sub: `7일 안에 말씀 5일 · 지난 레벨 보상까지 모두 받을 수 있어요<br><span class="muted">업무 탭 '${D.n}'</span>`, tone: "rare", sound: "pass", ms: 3200 }); }
  }
  dblCheck(); payNoteFlush();
}

/* ---------- 절기 상점 ---------- */
function festShopItems(se) {
  const D = FEST_DEF[se.id], W = wardState(), out = [];
  if (D.set && WSETX[D.set]) wardSetPieces(WSETX[D.set]).forEach(it => out.push({ k: "piece", id: it.id, n: it.n, d: `${WSETX[D.set].n} · ${WGRADE[it.g].n}`, tok: FEST_PIECE_TOK, own: W.own[it.id] != null, img: it }));
  if (D.title && WIT[D.title]) out.push({ k: "title", id: D.title, n: `칭호 '${WIT[D.title].n}'`, d: wardFxText(WIT[D.title].perk || {}), tok: FEST_TITLE_TOK, own: W.own[D.title] != null, img: WIT[D.title] });
  FEST_SHOP_RES.forEach(r => out.push({ k: "res", id: r.id, n: r.n, d: "", tok: r.tok, own: false, rw: r.rw }));
  return out;
}
function festBuy(kind, id) {
  const se = festCur(); if (!se) return;
  const F = festState(), it = festShopItems(se).find(x => x.k === kind && x.id === id); if (!it || it.own) return;
  if (F.tok < it.tok) { toast(`절기 토큰이 ${it.tok - F.tok}개 모자라요 · 헌신 길 레벨이나 이번 주 목표로 모여요`); return; }
  F.tok -= it.tok;
  if (it.k === "res") { payGive(it.rw); sfx("buy"); toast(`${it.n} 샀어요 · 토큰 −${it.tok}`); }
  else { wardGive(it.id); celebrate({ wid: it.id, title: it.k === "title" ? "칭호를 샀어요!" : "절기 옷을 샀어요!", sub: `${escapeHtml(WIT[it.id].n)} · 토큰 ${it.tok}<br><span class="muted">옷장에서 입어 보세요 · 가지고만 있어도 모든 피해 +</span>`, tone: "rare", sound: "pass" }); }
  festUI.k = {}; updateUI(true); save();
}

/* ---------- 1) 첫걸음 꾸러미 ---------- */
function startProg() { return { c: Math.min(1, Math.floor(+S.bible.total || 0)), s: Math.min(25, Math.floor(+S.study.total || 0)) }; }
function startReady() { return !firstsState().start && (+S.bible.total || 0) >= 1 && (+S.study.total || 0) >= 25; }
function startOpen() {
  if (!startReady()) return;
  const F = firstsState(); F.start = 1; F.sd = dayKey();
  payGive(START_RW); wardCV = null;
  celebrate({ ic: "gift", title: "첫걸음 꾸러미!", sub: `첫 말씀과 첫 집중을 마쳤어요<br><span class="rws">${rwHTML(START_RW)}</span><br><span class="muted">칭호 '첫걸음'도 옷장에 들어가요</span>`, tone: "rare", sound: "cheer", ms: 3400 });
  updateUI(true); save();
}

/* ---------- 3) 시간의 두루마리 ---------- */
function scrollDay() { const C = scrollState(), t = dayKey(); if (C.d !== t) { C.d = t; C.u = 0; } return C; }
function scrollEarn(n) { n = Math.floor(n); if (!(n > 0) || roffOn()) return; const C = scrollState(); C.n += n; C.got += n; payNote(`집중 25분 · 시간의 두루마리 +${n} (공부 탭)`); }
/* 지금 층에서 2시간 일한 월급: 일반 4마리 + 작은 보스 1마리를 되풀이 (다음 몹이 나오는 시간 포함).
   쾌속·분노·더블월급·스킬 같은 잠깐 효과는 빼고, 위층 보스(신기록·첫 처치)는 넣지 않음 */
function farmRate() {
  const st = stats(), dps = st.dps; if (!(dps > 0) || !isFinite(dps)) return 0;
  const f = Math.max(1, Math.floor(S.floor || 1)), hp = hpBase(f);
  const t = 4 * (hp / dps + 0.43) + (hp * HP_MUL[1] / st.bossBonus / dps + 0.65);
  return goldBase(f) * GOLD_MUL[1] * goldMult() / t;
}
function scrollGold() {
  const keepA = Object.assign({}, S.active), keepI = idolBuff.t, keepS = S.sneakerUntil, keepK = Object.assign({}, skillUntil);
  try {
    S.active.haste = 0; S.active.gold2 = 0; S.active.rage = 0; idolBuff.t = 0; S.sneakerUntil = 0; for (const k in skillUntil) skillUntil[k] = 0;
    const g = farmRate() * SCROLL_SEC; return g > 0 && isFinite(g) ? g : 0;
  } catch (e) { return 0; }
  finally { Object.assign(S.active, keepA); idolBuff.t = keepI; S.sneakerUntil = keepS; Object.assign(skillUntil, keepK); }
}
function scrollGoldMemo() { const now = Date.now(), k = [S.floor, S.wi, S.wl, S.coffee, wardDirty, S.promo].join("|"); if (scrMemo.k !== k || now - scrMemo.t > 3000) scrMemo = { t: now, k, v: scrollGold() }; return scrMemo.v; }
function scrollUse() {
  rollDay();
  const C = scrollDay(); if (C.n <= 0 || C.u >= SCROLL_DAY) return;
  const g = scrollGold(); if (!(g > 0)) { toast("지금 힘으로는 월급을 계산할 수 없어요 · 무기를 키워 보세요"); return; }
  C.n--; C.u++; C.used++; S.gold += g; scrMemo.t = 0;
  walletPop(`+${fmt(g)}원`);
  celebrate({ ic: "scroll", title: "시간의 두루마리", sub: `지금 층에서 2시간 일한 월급 +${fmt(g)}원<br><span class="muted">층과 신기록은 그대로예요 · 오늘 ${C.u}/${SCROLL_DAY}장${C.u >= SCROLL_DAY ? " · 오늘은 충분합니다" : ""}</span>`, tone: "gold", sound: "coin", ms: 2600 });
  updateUI(true); save();
}

/* ---------- 4) 묵상 2배 ---------- */
function dblDay() { const D = dblState(), t = dayKey(); if (D.d !== t) { D.d = t; D.n = 0; } return D; }
function dblAdd(src, gold, rw) {
  const D = dblDay(), g = payAmt(gold), r = payRw(rw);
  if (!(g > 0) && !Object.keys(r).length) return false;
  if (D.n >= DBL_DAY || D.p.length >= DBL_KEEP) return false;
  if (roffOn()) return false;
  D.n++; D.st.reg++; D.p.push({ s: src === "daily" ? "daily" : "back", g, rw: r, c0: Math.floor(+S.bible.total || 0), m0: Math.floor(+S.mem.total || 0), d: dayKey(), nd: S.bible.noteDay === dayKey() ? 1 : 0, t: Date.now() });
  return true;
}
function dblGold() { return dblState().p.reduce((a, p) => a + (p.g || 0), 0); }
function dblCheck() {
  const D = dblState(); if (!D.p.length || roffOn()) return;
  const c = +S.bible.total || 0, m = +S.mem.total || 0, nd = S.bible.noteDay || "";
  const done = D.p.filter(p => c >= p.c0 + 1 || m >= p.m0 + 5 || (nd && (nd > p.d || (nd === p.d && !p.nd))));
  if (!done.length) return;
  D.p = D.p.filter(p => done.indexOf(p) < 0); D.got += done.length;
  done.forEach(p => { if (p.t) { if (Date.now() - p.t <= 864e5) D.st.fast++; else D.st.slow++; } });
  let g = 0; const rw = {};
  done.forEach(p => { g += p.g || 0; for (const k in p.rw || {}) rw[k] = (rw[k] || 0) + p.rw[k]; });
  if (g > 0) S.gold += g; grant(rw);
  celebrateLater({ ic: "bible", title: "묵상 2배!", sub: "말씀 덕분에 한 번 더 받았어요" + (g > 0 ? `<br>월급 +${fmt(g)}원` : "") + (Object.keys(rw).length ? `<br><span class="rws">${rwHTML(rw)}</span>` : ""), tone: "manna", sound: "pass", ms: 2800 });
}

/* ---------- 5) 달란트 항아리 ---------- */
function jarAdd(g) { if (!(g > 0) || !isFinite(g)) return; jarState().g += g * JAR_RATE; }
function jarOnMem() { const J = jarState(); J.n = Math.min(9999, J.n + 1); if (J.n === JAR_MEM && J.g >= 1) payNote("달란트 항아리를 열 수 있어요 · 암송 탭"); }
function jarReady() { const J = jarState(); return J.n >= JAR_MEM && J.g >= 1 && !roffOn(); }
function jarOpen() {
  if (!jarReady()) return;
  const J = jarState(), g = J.g; S.gold += g; J.g = 0; J.n = Math.max(0, J.n - JAR_MEM); J.open++; J.tot += g;
  walletPop(`+${fmt(g)}원`);
  celebrate({ ic: "jar", title: "달란트 항아리를 열었어요", sub: `모아 둔 월급 +${fmt(g)}원<br><span class="muted">${J.open}번째 · 다음 항아리는 암송 ${JAR_MEM}구절 뒤에</span>`, tone: "gold", sound: "coin", ms: 2800 });
  updateUI(true); save();
}

/* ---------- 6·7) 첫 완독 · 66권 도감 ---------- */
function bookRw(b) { const ch = BOOKS[b][1]; return { manna: Math.max(20, Math.min(300, 5 * ch)), stamp: Math.max(1, Math.ceil(ch / 10)) }; }
function bookFull(b) { const s = S.bible.read[b]; return typeof s === "string" && s.length === BOOKS[b][1] && s.indexOf("0") < 0; }
function bkGroupProg(g) { const G = BK_GROUPS[g]; if (!G) return { n: 0, size: 1, name: String(g) }; const F = firstsState(); let n = 0; for (let b = G[1]; b < G[2]; b++) if (F.bk[b]) n++; return { n, size: G[2] - G[1], name: G[0] }; }
function bookGroupOf(b) { return b <= 4 ? "torah" : b >= 39 && b <= 42 ? "gospel" : b >= 44 && b <= 56 ? "paul" : b < 39 ? "ot" : "nt"; }
function bookGroupLine(b) {
  const out = [];
  [bookGroupOf(b), b < 39 ? "ot" : "nt"].filter((g, i, a) => a.indexOf(g) === i).forEach(g => { const p = bkGroupProg(g); out.push(p.n >= p.size ? `${p.name} 모두 끝! 칭호 '${WIT[BK_TITLE[g]].n}'` : `${p.name} ${p.n}/${p.size}권`); });
  return `<br><span class="muted">${out.join(" · ")}</span>`;
}
function bookDone(b, announce) {
  const B = S.bible, F = firstsState(), first = !F.bk[b];
  F.br[b] = +B.rounds || 0; F.bc[b] = (F.bc[b] || 0) + 1; if (first) F.bk[b] = dayKey();
  const base = bookRw(b), rw = first ? { manna: base.manna * 2, stamp: base.stamp * 2 } : base;
  const off = roffOn(); if (off) roffEsc(rw); else grant(rw); wardCV = null;
  if (announce) celebrateLater({ ic: "bible", title: `${BOOKS[b][0]} ${first ? "첫 완독!" : "완독!"}`, sub: (first ? "처음 끝까지 읽었어요 · 첫 완독 선물 2배<br>" : `${F.bc[b]}번째 완독<br>`) + `<span class="rws">${rwHTML(rw)}</span>` + (off ? `<br><span class="muted">보상 끄기 주간이라 주가 끝나면 드려요</span>` : "") + bookGroupLine(b), tone: first ? "rare" : "manna", sound: "pass", ms: 3000 });
  return rw;
}
/* 읽은 시간으로 확인된 장이 그 권의 마지막 남은 장이면 완독 */
function bookCheck(b) {
  const B = S.bible, F = firstsState();
  if (!(b >= 0 && b < BOOKS.length) || F.br[b] === (+B.rounds || 0) || !bookFull(b) || B.today.some(e => e.b === b && !e.pf)) return null;
  return bookDone(b, true);
}
/* 1독이 끝나 읽음 표시가 지워지기 직전: 이번 독에서 아직 완독으로 안 센 권 */
function bookRoundSweep() { const F = firstsState(), r = +S.bible.rounds || 0; for (let b = 0; b < BOOKS.length; b++) if (F.br[b] !== r) bookDone(b, true); }
/* 예전 저장: 이미 끝까지 읽은 권은 도감에 (지난 통독이 있으면 모든 권을 처음 끝낸 것으로) */
function firstsMigrate() {
  const F = firstsState(); if (F.mig) return; F.mig = 1;
  const B = S.bible; if (!B || !B.read) return;
  const r = +B.rounds || 0;
  if (r >= 1) for (let b = 0; b < BOOKS.length; b++) { if (!F.bk[b]) F.bk[b] = "-"; F.bc[b] = Math.max(F.bc[b] || 0, r); }
  const tot = {}; let n = 0;
  for (let b = 0; b < BOOKS.length; b++) if (bookFull(b) && F.br[b] !== r) { const rw = bookDone(b, false); n++; for (const k in rw) tot[k] = (tot[k] || 0) + rw[k]; }
  if (n) celebrateLater({ ic: "bible", title: "성경 66권 도감", sub: `이미 끝까지 읽은 ${n}권을 도감에 올렸어요<br><span class="rws">${rwHTML(tot)}</span>`, tone: "rare", sound: "pass", ms: 3200 });
}
/* 새 구절 첫 통과 2배 */
function memFirstX2(r, rw) { if (!r || r.n) return false; rw.manna *= 2; rw.stamp *= 2; rw.gold *= 2; firstsState().mem++; return true; }
function dexNext() {
  const F = firstsState(); let best = null;
  for (let b = 0; b < BOOKS.length; b++) {
    if (F.br[b] === (+S.bible.rounds || 0)) continue;
    const s = S.bible.read[b] || "", n = (s.match(/1/g) || []).length, left = BOOKS[b][1] - n;
    if (n > 0 && left > 0 && (!best || left < best.left)) best = { b, left };
  }
  if (!best) { try { const nx = nextUnread(); best = { b: nx.b, left: BOOKS[nx.b][1] - ((S.bible.read[nx.b] || "").match(/1/g) || []).length }; } catch (e) { return null; } }
  const first = !F.bk[best.b], base = bookRw(best.b);
  return Object.assign(best, { first, rw: first ? { manna: base.manna * 2, stamp: base.stamp * 2 } : base });
}

/* ---------- 다음 목표 사다리 ---------- */
function festLadder(rows) {
  try {
    const D = dblState();
    if (D.p.length) { const g = dblGold(); rows.unshift({ k: "오늘", t: "묵상 2배", v: g > 0 ? `+${fmt(g)}원` : "2배", p: 0, s: "말씀 1장 · 암송 5구절 · 묵상 한 줄이면 받은 보상을 한 번 더", go: "bible", hot: true }); }
    const X = firstsState();
    if (!X.start) {
      if (startReady()) rows.unshift({ k: "오늘", t: "첫걸음 꾸러미 열기", v: "선물", p: 1, s: "업무 탭 맨 위에서 한 번 열어요", go: "daily", hot: true });
      else { const p = startProg(); rows.push({ k: "오늘", t: "첫걸음 꾸러미", v: `${p.c + (p.s >= 25 ? 1 : 0)}/2`, p: (p.c + p.s / 25) / 2, s: `첫 말씀 1장${p.c ? " ✓" : ""} · 첫 집중 25분 (${p.s}/25분)`, go: p.c && tabOpen("study") ? "study" : "bible" }); }
    }
    const se = festCur();
    if (se) {
      const F = festState(), c = festGet(se), cl = festClaimable();
      rows.push({ k: "시즌", t: FEST_DEF[se.id].n, v: `Lv ${F.lv}/${se.maxL}`, p: F.lv / se.maxL, s: cl ? `받을 보상 ${cl}개 · 업무 탭` : F.lv >= se.maxL ? "최고 레벨 · 넘친 XP는 토큰으로" : `다음 레벨까지 ${FEST_XP_LV - c.xp % FEST_XP_LV} XP · 오늘 +${c.today.tot}`, go: "daily" });
    }
  } catch (e) {}
}

/* ---------- 업무 탭: 첫걸음 꾸러미 ---------- */
function buildStartCard() {
  const card = el("div", "card stp"); card.hidden = true;
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="stpIc"></span><div><b>첫걸음 꾸러미</b><small>한 번만 여는 큰 선물 · 기한 없음</small></div></div>
    <div class="stp-q" id="stpQ"></div>
    <div class="stp-rw"><span class="rws">${rwHTML(START_RW)}</span><span class="stp-t">+ 칭호 '첫걸음'</span></div>
    <button type="button" class="buy num stp-go" id="stpGo"></button>`;
  panels.daily.appendChild(card);
  const ic = $("stpIc"); if (ic) ic.appendChild(pixIcon("gift", 34));
  card.addEventListener("click", e => { const b = hbBtn(e, card); if (b && b.id === "stpGo") { sfx("tick"); startOpen(); } });
  updaters.daily.push({ ready: () => startReady(), update() {
    const X = firstsState(); card.hidden = !!X.start; if (X.start) return;
    const p = startProg(), ok = startReady(), h = `<span class="${p.c ? "ok" : ""}">${p.c ? "✓" : "·"} 첫 말씀 1장</span><span class="${p.s >= 25 ? "ok" : ""}">${p.s >= 25 ? "✓" : "·"} 첫 집중 25분${p.s >= 25 ? "" : ` (${p.s}/25분)`}</span>`;
    const q = $("stpQ"); if (q && q._h !== h) { q._h = h; q.innerHTML = h; }
    const go = $("stpGo"); if (go) { go.disabled = !ok; const t = `<span class="act">${ok ? "꾸러미 열기" : "말씀 1장 + 집중 25분"}</span>`; if (go._h !== t) { go._h = t; go.innerHTML = t; } }
  } });
}
/* ---------- 업무 탭: 묵상 2배 대기 ---------- */
function buildDblCard() {
  const card = el("div", "card dbl"); card.hidden = true;
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="dblIc"></span><div><b id="dblT">묵상 2배</b><small>말씀 1장 · 암송 5구절 · 묵상 한 줄 가운데 하나면 받은 보상을 한 번 더 · 기한 없음</small></div></div>
    <div class="dbl-l" id="dblL"></div>
    <div class="row-btns"><button type="button" class="btn manna" data-go="bible">말씀 · 묵상</button><button type="button" class="btn" data-go="mem">암송하기</button></div>`;
  panels.daily.appendChild(card);
  const ic = $("dblIc"); if (ic) ic.appendChild(pixIcon("bible", 30));
  card.addEventListener("click", e => { const b = hbBtn(e, card); if (b && b.dataset && b.dataset.go && tabOpen(b.dataset.go)) { sfx("tick"); selectTab(b.dataset.go, true); } });
  updaters.daily.push({ ready: () => false, update() {
    const D = dblDay(); card.hidden = !D.p.length; if (!D.p.length) return;
    const k = JSON.stringify(D.p) + "|" + D.n; if (card._k === k) return; card._k = k;
    $("dblT").textContent = `묵상 2배 대기 ${D.p.length}개`;
    $("dblL").innerHTML = D.p.map(p => `<div class="dbl-r"><span>${p.s === "back" ? "정산서" : "오늘 업무 모두 완료"}</span><span class="rws">${p.g > 0 ? `<span class="rw">${ri("coin")}${fmt(p.g)}</span>` : ""}${rwHTML(p.rw || {})}</span></div>`).join("")
      + `<small class="muted">오늘 ${D.n}/${DBL_DAY}번${D.n >= DBL_DAY ? " · 오늘은 충분합니다" : ""}</small>`;
  } });
}
/* ---------- 업무 탭: 절기 순례 ---------- */
function buildFestCard() {
  secTitle("daily", "절기 순례", "교회력 절기마다 · 보상은 영구");
  const card = el("div", "card fs");
  card.innerHTML = `<div id="fsHead"></div><div class="fs-trk" id="fsTrk"></div><div id="fsInfo"></div><div id="fsShop"></div>`;
  panels.daily.appendChild(card);
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset) return;
    const a = b.dataset.act;
    if (a === "claim") { sfx("tick"); festClaimNow(); }
    else if (a === "shop") { festUI.shop = !festUI.shop; festUI.k = {}; sfx("tick"); festRender(true); }
    else if (a === "buy") festBuy(b.dataset.k, b.dataset.id);
  });
  updaters.daily.push({ ready: () => !roffOn() && festClaimable() > 0, update: force => festRender(force) });
}
function festPart(id, key, html, force) { const box = $(id); if (!box) return null; if (!force && festUI.k[id] === key) return null; festUI.k[id] = key; box.innerHTML = typeof html === "function" ? html() : html; return box; }
function festRender(force) {
  const se = festCur(), F = festState();
  if (!se) {
    festPart("fsHead", "gap|" + dayKey() + "|" + F.hist.length, () => festGapHTML(), force);
    festPart("fsTrk", "gap", "", force); festPart("fsInfo", "gap", "", force); festPart("fsShop", "gap", "", force);
    const tr = $("fsTrk"); if (tr) tr.hidden = true;
    return;
  }
  const c = festGet(se), D = FEST_DEF[se.id], wi = festWeekIdx(se), th = D.wk[Math.min(wi, D.wk.length - 1)];
  const tr = $("fsTrk"); if (tr) tr.hidden = false;
  const hb = festPart("fsHead", JSON.stringify([se.key, wi, c.xp, F.lv, c.today]), () => {
    const into = c.xp - F.lv * FEST_XP_LV, pct = F.lv >= se.maxL ? 100 : Math.max(0, Math.min(100, into / FEST_XP_LV * 100)), T = c.today;
    const chip = (n, v, cap) => `<span class="${v >= cap ? "full" : ""}">${n} ${v}${v >= cap ? " 가득" : ""}</span>`;
    return `<div class="fs-h" style="--fc:${D.col}"><span class="pay-ic" id="fsIc"></span><div><b>${D.n}</b><small>${festMD(se.start)} ~ ${festMD(se.end)} · ${wi + 1}주차 「${th[0]}」</small></div><span class="fs-lv num">Lv <b>${F.lv}</b>/${se.maxL}</span></div>
      <p class="fs-vs">${th[1]} <small>(${th[2]})</small></p>
      <div class="fs-xp"><div class="prog"><i style="width:${pct}%"></i></div><small class="num">${F.lv >= se.maxL ? `최고 레벨 · 넘친 XP 100마다 토큰 ${FEST_OV_TOK}` : `다음 레벨까지 ${Math.max(0, FEST_XP_LV - into)} XP`} · 순례 XP ${c.xp}</small></div>
      <div class="fs-day"><b class="num">오늘 +${T.tot} XP</b>${chip("말씀", T.c, FEST_CAP.c)}${chip("공부", T.s, FEST_CAP.s)}${chip("암송", T.m, FEST_CAP.m)}${chip("묵상", T.n, FEST_CAP.n)}${chip("보스", T.b, FEST_CAP.b)}${T.tot >= FEST_DAY_MAX ? `<em>오늘은 충분합니다</em>` : ""}</div>`;
  }, force);
  if (hb) { const ic = $("fsIc"); if (ic) ic.appendChild(pixIcon("lamp", 32)); }
  const tb = festPart("fsTrk", JSON.stringify([se.key, F.lv, F.cf, F.cd, F.dev, wardCount()]), () => festTrackHTML(se), force);
  if (tb) { try { tb.scrollLeft = Math.max(0, (Math.min(F.cf, F.dev ? F.cd : F.cf) - 1) * 62); } catch (e) {} }   // 받을 차례 한 칸 앞부터
  const wk = c.weeks.length ? c.weeks[c.weeks.length - 1] : null, cl = festClaimable(), off = roffOn();
  festPart("fsInfo", JSON.stringify([se.key, F.dev, c.dv.cur, wk, F.wk, cl, F.tok, festUI.shop, off]), () => {
    const dev = F.dev ? `<div class="fs-dev on">헌신 길이 열려 있어요 · 레벨마다 토큰 ${FEST_DEV_TOK}, 5레벨마다 ${D.set ? "절기 옷 한 벌" : "은괴·자수정"}, 마지막 레벨에 칭호 '${WIT[D.title] ? WIT[D.title].n : ""}'</div>`
      : `<div class="fs-dev">${ri("lock")}<span>헌신 길: 7일 안에 말씀 5일이면 열려요 · 최근 7일 <b class="num">${c.dv.cur.n}/${c.dv.cur.need}일</b><br><small>열리면 지난 레벨 보상까지 모두 받아요 · 안식한 날은 빼고 셈해요</small></span></div>`;
    const wkb = wk ? F.wk[wk.wk] || 0 : 0, items = wk && wk.items.length ? wk.items.map((it, i) => { const ok = (wkb >> i) & 1; const v = it.u === "분" ? `${(Math.min(it.v, it.g) / 60).toFixed(1)}/${(it.g / 60).toFixed(1)}시간` : `${Math.min(it.v, it.g)}/${it.g}${it.u}`; return `<span class="${ok ? "ok" : ""}">${ok ? "✓ " : ""}${it.n} ${v}</span>`; }).join("") : `<span>이번 주는 쉬어 가요</span>`;
    return dev + `<div class="fs-wk"><b>이번 주 목표</b><small>채울 때마다 XP ${FEST_WEEK_XP} · 토큰 ${FEST_WEEK_TOK}</small><div>${items}</div></div>
      <div class="row-btns fs-btns"><button type="button" class="buy num${cl && !off ? "" : " ghost"}" data-act="claim"${cl && !off ? "" : " disabled"}><span class="act">${off ? "보상 끄기 주간" : cl ? `보상 ${cl}개 받기` : "받을 보상 없음"}</span>${off && cl ? `<small>끝나면 ${cl}개</small>` : ""}</button><button type="button" class="buy num ghost fs-shopbtn" data-act="shop"><span class="act">${festUI.shop ? "상점 닫기" : "절기 상점"}</span><small>${ri("tok")}${F.tok}</small></button></div>
      <p class="muted fs-foot">레벨을 건너뛰는 방법은 없어요 · 보상은 영구, 끝나는 날 못 받은 보상은 자동으로 받고 남은 토큰은 광석으로 바꿔 드려요 · ${D.when} 다시 열려요</p>`;
  }, force);
  festPart("fsShop", JSON.stringify([se.key, festUI.shop, F.tok, wardCount()]), () => festUI.shop ? festShopHTML(se) : "", force);
}
function festRwCell(rw) { return Object.keys(rw).map(k => `<span class="rw">${ri(RW_ICON[k] || "star")}${rw[k]}</span>`).join(""); }
function festTrackHTML(se) {
  const F = festState(), cols = [];
  for (let i = 1; i <= se.maxL; i++) {
    const fr = festFreeRw(i), dv = festDevRw(se, i), got = i <= F.lv, dr = { tok: dv.tok };
    if (dv.silver) dr.silver = dv.silver; if (dv.ame) dr.ame = dv.ame;
    const dvh = (dv.wid ? `<img class="pix" alt="${escapeHtml(WIT[dv.wid].n)}" src="${wardIconURL(WIT[dv.wid])}">` : "") + (dv.title ? `<span class="rw">${ri("trophy")}칭호</span>` : "") + festRwCell(dr);
    cols.push(`<div class="fs-c${got ? " got" : ""}${i === F.lv ? " now" : ""}${i % 5 === 0 ? " big" : ""}"><b class="num">${i}</b><span class="fs-f${i <= F.cf ? " done" : got ? " ready" : ""}">${festRwCell(fr)}</span><span class="fs-d${!F.dev ? " lock" : i <= F.cd ? " done" : got ? " ready" : ""}">${dvh}</span></div>`);
  }
  return `<div class="fs-rh"><b>Lv</b><span>무료</span><span>헌신${F.dev ? "" : ` ${ri("lock")}`}</span></div>` + cols.join("");
}
function festShopHTML(se) {
  const F = festState(), items = festShopItems(se);
  return `<div class="fs-shop"><div class="fs-shop-h"><b>절기 상점</b><small>토큰은 헌신 길 레벨마다 ${FEST_DEV_TOK}개 · 이번 주 목표 하나에 ${FEST_WEEK_TOK}개</small></div>`
    + items.map(it => `<div class="fs-it${it.own ? " own" : ""}"><span class="fs-it-ic">${it.img ? `<img class="pix" alt="" src="${wardIconURL(it.img)}">` : ri(RW_ICON[Object.keys(it.rw)[0]] || "star")}</span><div><b>${escapeHtml(it.n)}</b>${it.d ? `<small>${escapeHtml(it.d)}</small>` : ""}</div>${it.own ? `<span class="fs-own">가짐</span>` : `<button type="button" class="buy num tok" data-act="buy" data-k="${it.k}" data-id="${it.id}"${F.tok >= it.tok ? "" : " disabled"}><small>사기</small><span class="cost">${ri("tok")}${it.tok}</span></button>`}</div>`).join("")
    + `<p class="muted">절기 옷은 이 순례 동안만 상점에 나오고, 이듬해 같은 절기에 다시 나와요 · 헌신 길 5레벨마다 한 벌씩도 받아요</p></div>`;
}
function festGapHTML() {
  const F = festState(), nx = festNextSe(), D = nx ? FEST_DEF[nx.id] : null;
  const hist = F.hist.slice(-4).reverse().map(h => { const se = festByKey(h.k); return se ? `<span>${FEST_DEF[se.id].n} ${se.y} · Lv ${h.L}/${h.max}${h.dev ? " · 헌신" : ""}</span>` : ""; }).join("");
  return (D ? `<div class="fs-h" style="--fc:${D.col}"><span class="pay-ic">${ri("lamp")}</span><div><b>다음 순례: ${D.n}</b><small>${festMD(nx.start)} (${WD[keyDate(nx.start).getDay()]}) 시작 · ${nx.weeks}주 · 최대 Lv ${nx.maxL}</small></div></div>` : "")
    + `<p class="muted">지금은 순례 사이 쉬는 기간이에요. 말씀·공부·암송 기록은 그대로 쌓이고, 순례가 시작되면 그날부터 순례 XP가 쌓여요.</p>`
    + (hist ? `<div class="fs-hist"><b>지난 순례</b>${hist}</div>` : "");
}
/* ---------- 공부 탭: 시간의 두루마리 ---------- */
function buildScrollCard() {
  const card = el("div", "card scr");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="scrIc"></span><div><b>시간의 두루마리 <span class="num" id="scrN"></span></b><small>집중 25분마다 1장 · 펼치면 지금 층에서 2시간 일한 월급</small></div><button type="button" class="buy num" id="scrGo"></button></div><div class="muted num" id="scrSub"></div>`;
  addCustom("study", card, () => {
    const C = scrollDay(), St = S.study, live = (St.today || 0) + (St.running ? Math.min(Date.now() - St.lastConfirm, CONFIRM_MS) / 60000 : 0);
    const n = $("scrN"); if (n) n.textContent = `${C.n}장`;
    const full = C.u >= SCROLL_DAY, g = !full && C.n > 0 ? scrollGoldMemo() : 0, go = $("scrGo");
    if (go) { const b = full ? { label: "오늘은 충분합니다", ok: false } : C.n <= 0 ? { label: "두루마리 없음", ok: false } : g > 0 ? { label: `${fmt(g)}원`, sub: "펼치기", ok: true } : { label: "계산 중", ok: false }; go.disabled = !b.ok; go.className = "buy num" + (b.ok ? "" : " ghost"); const h = btnInner(b); if (go._h !== h) { go._h = h; go.innerHTML = h; } }
    const sub = $("scrSub"); if (sub) sub.textContent = `오늘 ${C.u}/${SCROLL_DAY}장 펼침 · 다음 장까지 집중 ${Math.max(1, 25 - Math.floor(live % 25))}분 · 층·신기록·보스 첫 처치는 그대로예요`;
  });
  const ic = $("scrIc"); if (ic) ic.appendChild(pixIcon("scroll", 32));
  card.addEventListener("click", e => { const b = hbBtn(e, card); if (b && b.id === "scrGo") { sfx("tick"); scrollUse(); } });
}
/* ---------- 암송 탭: 달란트 항아리 ---------- */
function buildJarCard() {
  const card = el("div", "card jar");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="jarIc"></span><div><b>달란트 항아리</b><small>보스 월급의 ${Math.round(JAR_RATE * 100)}%가 따로 모여요 · 암송 ${JAR_MEM}구절 통과마다 열기</small></div><b class="jar-g num" id="jarG"></b></div>
    <div class="prog"><i id="jarBar"></i></div>
    <div class="jar-row"><span class="muted num" id="jarN"></span><button type="button" class="buy num" id="jarGo"></button></div>
    <p class="jar-v">잘 하였도다 착하고 충성된 종아 네가 작은 일에 충성하였으매 내가 많은 것으로 네게 맡기리니 <small>(마 25:21)</small></p>`;
  addCustom("mem", card, () => {
    card.hidden = !!memSess; if (memSess) return;
    const J = jarState(), ok = jarReady(), n = Math.min(J.n, JAR_MEM);
    $("jarG").textContent = `${fmt(J.g)}원`; $("jarBar").style.width = n / JAR_MEM * 100 + "%";
    $("jarN").textContent = ok ? "열 수 있어요!" : J.n >= JAR_MEM ? "월급이 모이면 열 수 있어요" : `암송 통과 ${n}/${JAR_MEM}`;
    const go = $("jarGo"); if (go) { go.disabled = !ok; const h = `<span class="act">${ok ? "항아리 열기" : "모으는 중"}</span>`; if (go._h !== h) { go._h = h; go.innerHTML = h; } }
  });
  const ic = $("jarIc"); if (ic) ic.appendChild(pixIcon("jar", 34));
  card.addEventListener("click", e => { const b = hbBtn(e, card); if (b && b.id === "jarGo") { sfx("tick"); jarOpen(); } });
}
/* ---------- 말씀 탭: 성경 66권 도감 ---------- */
function buildDexCard() {
  const card = el("div", "card bdex");
  card.innerHTML = `<div class="pay-h"><span class="pay-ic" id="dexIc"></span><div><b>성경 66권 도감</b><small id="dexSub"></small></div></div><div id="dexBody"></div>`;
  addCustom("bible", card, () => dexRender());
  const ic = $("dexIc"); if (ic) ic.appendChild(pixIcon("bible", 30));
  card.addEventListener("click", e => {
    const b = hbBtn(e, card); if (!b || !b.dataset || b.dataset.b == null) return;
    const n = +b.dataset.b; if (!(n >= 0 && n < BOOKS.length)) return;
    sfx("tick"); bibleBook = n; bibleTest = n < 39 ? "old" : "new";
    try { const list = $("bookList"), bc = list && list.parentElement; if (bc && bc.querySelectorAll) bc.querySelectorAll(".seg button").forEach(o => o.setAttribute("aria-pressed", o.dataset.t === bibleTest)); if (bc && bc.scrollIntoView) bc.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); } catch (er) {}
    updateUI(true);
  });
}
function dexRender() {
  const box = $("dexBody"); if (!box) return;
  const F = firstsState(), B = S.bible, k = JSON.stringify([F.bk, F.bc, F.br, B.rounds, B.read, wardCount()]);
  if (box._k === k) return; box._k = k;
  let ot = 0, nt = 0; for (let b = 0; b < BOOKS.length; b++) if (F.bk[b]) { if (b < 39) ot++; else nt++; }
  const sub = $("dexSub"); if (sub) sub.textContent = `처음 끝까지 읽은 권 ${ot + nt}/66 · 첫 완독은 선물 2배`;
  const r = +B.rounds || 0;
  const cell = b => {
    const ch = BOOKS[b][1], s = B.read[b] || "", n = (s.match(/1/g) || []).length, done = !!F.bk[b], cnt = F.bc[b] || 0, thisRound = F.br[b] === r;
    const p = thisRound ? 100 : Math.round(n / ch * 100);
    return `<button type="button" class="bdx-c${done ? " done" : ""}${thisRound ? " now" : ""}" data-b="${b}" style="--p:${p}%" aria-label="${BOOKS[b][0]} ${done ? "완독" : `${n}/${ch}장`}">${BK_SHORT[b]}${cnt > 1 ? `<i class="num">${cnt}</i>` : ""}</button>`;
  };
  const bar = (name, v, all) => `<div class="bdx-t"><span>${name}</span><i class="bdx-bar"><b style="width:${v / all * 100}%"></b></i><span class="num">${v}/${all}권</span></div>`;
  let h = bar("구약", ot, 39) + `<div class="bdx-g">`; for (let b = 0; b < 39; b++) h += cell(b);
  h += `</div>` + bar("신약", nt, 27) + `<div class="bdx-g">`; for (let b = 39; b < 66; b++) h += cell(b); h += `</div>`;
  const nb = dexNext();
  if (nb) h += `<div class="bdx-nx">다음 완독: <b>${BOOKS[nb.b][0]}</b> ${nb.left}장 남음 · 완독 선물 <span class="rws">${rwHTML(nb.rw)}</span>${nb.first ? " <em>첫 완독 2배</em>" : ""}</div>`;
  h += `<div class="bdx-grp">${["torah", "gospel", "paul", "ot", "nt"].map(g => { const p = bkGroupProg(g), own = wardState().own[BK_TITLE[g]] != null; return `<span class="${own ? "on" : ""}">${p.name} ${p.n}/${p.size}${own ? " ✓" : ""}</span>`; }).join("")}</div><p class="muted">묶음을 모두 처음 끝내면 옷장 칭호가 열려요 · 칸을 누르면 그 권으로 가요 · 금테는 처음 끝낸 권, 숫자는 완독 횟수</p>`;
  box.innerHTML = h;
}
