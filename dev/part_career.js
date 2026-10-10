/* ===================== 승진 · 직무 =====================
   직급 10단계는 퇴사해도 남는 경력. 최고층·말씀 누적·공부 누적(과장부터 퇴사 횟수) 조건을 채우고 '승진 심사'를 누르면 승진식.
   대리·과장·부장에서 직무를 하나씩 고르고, 사장이 되면 넷째 직무가 열리며 네 직무의 특징(패시브)이 한꺼번에 적용된다.
   직무마다 기본 공격 모양·패시브·직무 스킬 2개가 다르다. 직무 스킬 버튼은 전투 화면 왼쪽 위(자동 스킬도 씀).
   merge·stats 에서 부를 수 있게 함수 선언과 var 만 씀. */
var RANKS = [
  { n: "사원" },
  { n: "주임", req: { floor: 50, chap: 5, study: 1 } },
  { n: "대리", req: { floor: 150, chap: 15, study: 2 }, job: true },
  { n: "과장", req: { floor: 250, chap: 50, study: 8, retire: 5 }, job: true },
  { n: "차장", req: { floor: 350, chap: 100, study: 15, retire: 7 } },
  { n: "부장", req: { floor: 450, chap: 200, study: 25, retire: 10 }, job: true },
  { n: "이사", req: { floor: 550, chap: 350, study: 40, retire: 13 } },
  { n: "상무", req: { floor: 700, chap: 550, study: 60, retire: 16 } },
  { n: "전무", req: { floor: 850, chap: 850, study: 80, retire: 20 } },
  { n: "사장", req: { floor: 1000, chap: 1189, study: 100, retire: 25 }, job: true },
];
var REQ_INFO = [
  ["floor", "최고층", v => `${Math.floor(v)}층`],
  ["chap", "말씀 누적", v => `${Math.floor(v)}장`],
  ["study", "공부 누적", v => `${Math.floor(v * 10) / 10}시간`],
  ["retire", "퇴사", v => `${Math.floor(v)}회`],
];
var PROMO_LINES = ["", "주임 됐다! 이제 후배도 생기려나?", "대리 달았다! 이제 진짜 내 일이다", "과장님이라고 불러 줘!", "차장... 어깨가 무거워진다", "부장 승진! 회의가 늘겠군", "이사님 소리가 아직 어색하네", "상무! 임원 엘리베이터 탄다", "전무까지 왔다. 한 칸 남았다!", "사장 취임! 오늘부터 이 회사는 내가 책임진다"];
var JOBS = [
  { id: "sales", n: "영업", team: "영업팀", type: "근접 치명타형", col: "#ffd54a", ic: "job_sales",
    pas: ["치명타 확률 +25%", "치명타 피해 2배", "월급 +30%"], atk: "금빛 베기 · 치명타마다 '계약!'과 동전", sk: ["dash", "deal"] },
  { id: "dev", n: "개발", team: "개발팀", type: "원거리 연쇄형", col: "#6fd3ff", ic: "job_dev",
    pas: ["공격 속도 +40%", "4번째 공격마다 연쇄 번개 (공격력 4배)"], atk: "손끝에서 코드 탄 발사", sk: ["hotfix", "loop"] },
  { id: "plan", n: "기획", team: "기획팀", type: "보스 저격형", col: "#ff7a9a", ic: "job_plan",
    pas: ["보스에게 주는 피해 2배", "보스 제한 시간 +5초", "5번째 공격마다 약점 저격 (3배)"], atk: "레이저 포인터 저격", sk: ["ppt", "beam"] },
  { id: "hr", n: "인사·총무", team: "인사총무팀", type: "소환·지원형", col: "#7fe3a0", ic: "job_hr",
    pas: ["동료 피해 2배", "자리 비운 동안 월급 +50%", "인주 자국 1개마다 받는 피해 +6% (5개까지)"], atk: "결재 도장 투척 · 맞은 자리에 인주 자국", sk: ["meeting", "order"] },
];
var JSK = {
  dash: { id: "j_dash", key: "dash", job: "sales", n: "실적 돌파", cd: 35, ic: "jsk_dash", d: "5번 연속 돌진 베기 (한 번에 초당 피해 4배)" },
  deal: { id: "j_deal", key: "deal", job: "sales", n: "계약 성사", cd: 70, dur: 8, ic: "jsk_deal", d: "황금 고리에서 빛의 창이 쏟아지고 8초 동안 모든 공격이 치명타" },
  hotfix: { id: "j_hotfix", key: "hotfix", job: "dev", n: "핫픽스 배포", cd: 40, ic: "jsk_hotfix", d: "코드 블록 12개 폭격 (하나에 초당 피해 1.8배)" },
  loop: { id: "j_loop", key: "loop", job: "dev", n: "무한 루프", cd: 75, dur: 6, ic: "jsk_loop", d: "6초 동안 0.25초마다 번개 (공격력 3배)" },
  ppt: { id: "j_ppt", key: "ppt", job: "plan", n: "PPT 폭격", cd: 45, dur: 10, ic: "jsk_ppt", d: "슬라이드 20장 + 10초 동안 적이 받는 피해 +50%" },
  beam: { id: "j_beam", key: "beam", job: "plan", n: "로드맵 레이저", cd: 60, ic: "jsk_beam", d: "굵은 빔 2초 (초당 피해 15배)" },
  meeting: { id: "j_meeting", key: "meeting", job: "hr", n: "전체 회의 소집", cd: 50, dur: 8, ic: "jsk_meeting", d: "신입 사원 8명이 8초 동안 돌격 (동료 피해)" },
  order: { id: "j_order", key: "order", job: "hr", n: "인사 발령", cd: 70, dur: 8, ic: "jsk_order", d: "8초 동안 적이 받는 피해 3배" },
};
var CODE_GLYPHS = ["</>", "{ }", "0101", "fix", "=>", "if", "git", ";;", "λ", "0x1F", "&&", "++"];
var ORDER_DEST = ["남극 지사", "무인도 지점", "지하 3층 창고", "화성 출장소", "옥상 정원 관리", "본사 정문 경비", "산꼭대기 연수원"];
var CREW_TALK = ["넵!", "네!", "확인!", "바로 하겠습니다!", "회의 끝!", "보고드립니다!"];

/* ---------- 도트 아이콘 (직무 표식 · 직무 스킬) ---------- */
Object.assign(UIICON, {
  job_sales: { m: ["..............", ".....kkkk.....", "....k....k....", ".kkkkkkkkkkkk.", ".kYYYYYYYYYYk.", ".kyyyyyyyyyyk.", ".kyyyyyyyyyyk.", ".kddddmmddddk.", ".kyyyymmyyyyk.", ".kyyyyyyyyyyk.", ".kyyyyyyyyyyk.", ".kddddddddddk.", ".kkkkkkkkkkkk.", ".............."], p: { k: "#5a3a0c", Y: "#fff3b0", y: "#ffd54a", d: "#c9971c", m: "#8a5a10" } },
  job_dev: { m: ["..............", "..kkkkkkkkkk..", "..kbbbbbbbbk..", "..kbcbbbbbbk..", "..kbbcbbppbk..", "..kbcbbbbbbk..", "..kbbbbccbbk..", "..kbbbbbbbbk..", "..kkkkkkkkkk..", ".ssssssssssss.", "sSSSSSSSSSSSSs", ".ssssssssssss.", "..............", ".............."], p: { k: "#9aa3b8", b: "#0e2a3a", c: "#6fd3ff", p: "#ff6bd6", s: "#c9ced8", S: "#eef1f7" } },
  job_plan: { m: ["......kk......", ".wwwwwwwwwwww.", ".wggggggggggw.", ".wgggggggggrw.", ".wggggggggrgw.", ".wggrgggrrggw.", ".wgrgrrrggggw.", ".wrgggggggggw.", ".wggbbgbbgbbw.", ".wwwwwwwwwwww.", "......kk......", ".....k..k.....", "....k....k....", ".............."], p: { w: "#f4f6fb", g: "#dfe6f3", r: "#ff4d6d", b: "#7c5cff", k: "#5b6274" } },
  job_hr: { m: ["..............", ".....hhhh.....", ".....hHHh.....", ".....hhhh.....", "......hh......", "......hh......", "...rrrrrrrr...", "..rRRRRRRRRr..", "..rRRRRRRRRr..", "...rrrrrrrr...", "..............", "..pp..pp..pp..", "..............", ".............."], p: { h: "#8a5a3a", H: "#c98a5a", r: "#a8202a", R: "#e0403d", p: "#ff6b6b" } },
  jsk_dash: { m: ["..............", "..........yy..", ".........yYy..", "...yyyyyyyYy..", "..yYYYYYYYYYy.", "...yyyyyyyYy..", ".........yYy..", "..........yy..", "..............", "..oooooo......", ".oOOOOOOo.....", "..oooooo......", "..............", ".............."], p: { y: "#ffb13b", Y: "#fff3b0", o: "#c9971c", O: "#ffd54a" } },
  jsk_deal: { m: ["..............", "..wwwwwwwww...", "..wllllllww...", "..wwwwwwwww...", "..wllllllww...", "..wwwwwwwww...", "..wllllwwww...", "..wwwwwwwrrr..", "..wllllwrRRRr.", "..wwwwwwrRRRr.", "........rrr...", "..............", "..yy..yy..yy..", ".............."], p: { w: "#f4f6fb", l: "#9aa3b8", r: "#a8202a", R: "#e0403d", y: "#ffd54a" } },
  jsk_hotfix: { m: ["...c..c..c....", "...c..c..c....", "..............", "..CCCCCCCCCC..", "..CbbbbbbbbC..", "..CbwbbbbwbC..", "..CwbbwwbbwC..", "..CbwbbbbwbC..", "..CbbbbbbbbC..", "..CCCCCCCCCC..", "..............", ".yy..yyyy..yy.", "..............", ".............."], p: { C: "#6fd3ff", b: "#0e2a3a", w: "#e6f6ff", c: "#2b8fb8", y: "#ff6bd6" } },
  jsk_loop: { m: ["..............", "..............", "..pppp..pppp..", ".pPPPPppPPPPp.", "pPp..pPPp..pPp", "pP....PP....Pp", "pPp..pPPp..pPp", ".pPPPPppPPPPp.", "..pppp..pppp..", "..............", "...c.c..c.c...", "..............", "..............", ".............."], p: { p: "#7c5cff", P: "#c9a6ff", c: "#6fd3ff" } },
  jsk_ppt: { m: ["..............", ".kkkkkkkkkkkk.", ".kRRRRRRRRRRk.", ".kwwwwwwwwwwk.", ".kwwwwwwwbwwk.", ".kwwwwwbwbwwk.", ".kwwbwwbwbwwk.", ".kwwbwwbwbwwk.", ".kwwwwwwwwwwk.", ".kkkkkkkkkkkk.", "..............", "...w..w..w....", "..............", ".............."], p: { k: "#5b6274", R: "#ff4d6d", w: "#f4f6fb", b: "#7c5cff" } },
  jsk_beam: { m: ["..............", "..............", "..............", "..pp..........", ".pWWp.........", "pWWWWPPPPPPPPP", "pWWWWWWWWWWWWW", "pWWWWPPPPPPPPP", ".pWWp.........", "..pp..........", "..............", "..............", "..............", ".............."], p: { p: "#ff4d6d", P: "#ff9bb0", W: "#ffffff" } },
  jsk_meeting: { m: ["..............", "......hh......", ".hh..hhhh..hh.", "hhhh.hssh.hhhh", "hssh..ss..hssh", ".ss..wttw..ss.", "xttx.wttw.zttz", "xttx.wwww.zttz", "xxxx.p..p.zzzz", "p..p.p..p.p..p", "p..p......p..p", "..............", "..............", ".............."], p: { h: "#3a2a1a", s: "#f2c9a0", t: "#e0403d", w: "#7fe3a0", x: "#6fd3ff", z: "#c9a6ff", p: "#2d3142" } },
  jsk_order: { m: ["..............", ".wwwwwwwwwwww.", ".wRRRRRRRRRRw.", ".wwwwwwwwwwww.", ".wllllllllllw.", ".wwwwwwwwwwww.", ".wllllllwwwww.", ".wwwwwwwwrrrw.", ".wllllwwrRRRr.", ".wwwwwwwrRRRr.", ".wwwwwwwwrrrw.", ".wwwwwwwwwwww.", "..............", ".............."], p: { w: "#f4f6fb", R: "#e0403d", l: "#9aa3b8", r: "#a8202a" } },
  corp: { m: ["......kk......", ".....kwwk.....", "....kwwwwk....", "....kwbwbk....", "....kwwwwk....", "....kwbwbk....", "...kwwwwwwk...", "...kwbwwbwk...", "...kwwwwwwk...", "...kwbwwbwk...", "..kwwwwwwwwk..", "..kwbwwwwbwk..", "..kwwwddwwwk..", ".kkkkkddkkkkk."], p: { k: "#3b4566", w: "#c9d2e6", b: "#6fd3ff", d: "#ffd54a" } },
});
/* 신입 사원 (전체 회의 소집) */
var CREW_MAP = [
  ["..hhh..", ".hhhhh.", ".hssks.", "..sss..", ".wwtww.", "wwwtwww", "wwwtwww", ".wwwww.", ".ppppp.", ".pp.pp.", ".pp.pp.", ".kk.kk."],
  ["..hhh..", ".hhhhh.", ".hssks.", "..sss..", ".wwtww.", "wwwtwww", "wwwtwww", ".wwwww.", ".ppppp.", "pp...pp", "p.....p", "kk...kk"],
];
var CREW_SHIRTS = ["#f4f6fb", "#6fd3ff", "#7fe3a0", "#ffd54a", "#c9a6ff", "#ff9b6b"], CREW_HAIR = ["#2a1d10", "#4a3020", "#1c1c22", "#7a4a2a"];
var crewPals = [];
CREW_SHIRTS.forEach(w => CREW_HAIR.forEach(h => crewPals.push({ h, s: "#f2c9a0", k: "#1b1f2a", w, t: "#e0403d", p: "#2d3142" })));

/* ---------- 상태 ---------- */
var heroHand = { x: 388, y: 276 }, jobFxErr = "", critFxT = 0, critFloatT = 0;
var jobFx = [], jobProj = [], jobParts = [], jobMarks = { m: null, n: 0, pos: [] }, jobCut = null, jobGlitch = 0, jobHitN = 0, jobAmbT = 0;
function rankIdx() { return Math.max(0, Math.min(RANKS.length - 1, Math.floor(+(S && S.rank) || 0))); }
function rankName(r) { return RANKS[r == null ? rankIdx() : r].n; }
function jobById(id) { for (const j of JOBS) if (j.id === id) return j; return null; }
function curJob() { return S && S.job && (S.jobs || []).indexOf(S.job) >= 0 ? jobById(S.job) : null; }
function isCEO() { return rankIdx() >= RANKS.length - 1; }
function jobOn(id) { const js = (S && S.jobs) || []; return js.indexOf(id) >= 0 && (S.job === id || isCEO()); }
function jobSlots(r) { let n = 0; const top = r == null ? rankIdx() : r; for (let i = 0; i <= top; i++) if (RANKS[i].job) n++; return Math.min(JOBS.length, n); }
function jobPending() { return ((S && S.jobs) || []).length < jobSlots(); }
function nextJobRank() { const have = ((S && S.jobs) || []).length; let n = 0; for (let i = 0; i < RANKS.length; i++) if (RANKS[i].job && ++n > have) return i; return -1; }
/* 받침에 따라 조사 고르기: 대리가/과장이, 대리로/과장으로 */
function hasBat(w) { const c = String(w).charCodeAt(String(w).length - 1); return c >= 0xAC00 && c <= 0xD7A3 ? (c - 0xAC00) % 28 : 0; }
function iga(w) { return w + (hasBat(w) ? "이" : "가"); }
function ro(w) { const b = hasBat(w); return w + (b && b !== 8 ? "으로" : "로"); }
function heroTitle() { return "곽준영 " + rankName(); }
function rankMul(r) { return 1 + 0.25 * (r == null ? rankIdx() : r); }
const mulTxt = v => v.toFixed(2).replace(/\.?0+$/, "");
/* 능력치 배율 (stats·goldMult·hit 에서 부름) */
function careerAtk() { return rankMul(); }
function careerGold() { return rankMul() * (jobOn("sales") ? 1.3 : 1); }
function careerAps() { return jobOn("dev") ? 1.4 : 1; }
function careerCrit() { return skillOn("j_deal") ? 1 : jobOn("sales") ? 0.25 : 0; }
function careerCritMul() { return jobOn("sales") ? 2 : 1; }
function careerBoss() { return jobOn("plan") ? 2 : 1; }
function careerBossTime() { return jobOn("plan") ? 5 : 0; }
function careerPet() { return jobOn("hr") ? 2 : 1; }
function careerAway() { return jobOn("hr") ? 1.5 : 1; }
function careerTaken() {
  let m = 1;
  if (skillOn("j_ppt")) m *= 1.5;
  if (skillOn("j_order")) m *= 3;
  if (jobMarks.m && jobMarks.m === mon) m *= 1 + 0.06 * jobMarks.n;
  return m;
}

/* ---------- 승진 ---------- */
function reqVals() { return { floor: S.bestFloor || 1, chap: (S.bible && S.bible.total) || 0, study: ((S.study && S.study.total) || 0) / 60, retire: S.retires || 0 }; }
function canPromote() {
  const r = rankIdx(); if (r >= RANKS.length - 1) return false;
  const q = RANKS[r + 1].req, v = reqVals();
  return Object.keys(q).every(k => v[k] >= q[k]);
}
function afterCeleb(fn, n) {
  n = n || 0;
  if (typeof celebOn !== "undefined" && celebOn && n < 60) { setTimeout(() => afterCeleb(fn, n + 1), 300); return; }
  fn();
}
function careerTick() {
  if (!S || typeof backReady === "undefined" || !backReady) return;
  if (canPromote() && (S.rankAsk || 0) < rankIdx() + 1) {
    S.rankAsk = rankIdx() + 1;
    const nx = rankName(rankIdx() + 1);
    setTimeout(() => { toast(`${nx} 승진 심사 대상이에요! 정보 탭 맨 위에서 승진하세요`); say(`${nx} 승진 심사래! 정보 탭에 가 보자`, 4); }, 400);
  }
}
function promote() {
  if (!canPromote()) return false;
  const r = rankIdx() + 1, R = RANKS[r];
  S.rank = r; S.rankAsk = r;
  sfx("bigup");
  stampFx = { t: 0, kind: 2, hit: false, text: "승진", top: `${R.n} 발령`, nocam: true };
  const extra = R.job ? (r === RANKS.length - 1 ? "<br>네 직무를 모두 겸직해요" : "<br>새 직무를 고를 수 있어요") : "";
  celebrate({ icon: bizIcon(r), title: `${R.n} 승진!`, sub: `곽준영 ${R.n} · 공격력·월급 ×${mulTxt(rankMul(r))}${extra}`, tone: "gold", ms: 2800 });
  say(PROMO_LINES[r] || "승진이다!", 3);
  if (R.job) afterCeleb(() => { if (r === RANKS.length - 1) ceoTake(); else openJobPick(); });
  crFocus = ""; renderTop(true); updateUI(true); save();
  return true;
}
function ceoTake() {
  JOBS.forEach(j => { if (S.jobs.indexOf(j.id) < 0) S.jobs.push(j.id); });
  if (!S.job) S.job = S.jobs[0] || "";
  celebrate({ icon: bizIcon(rankIdx()), title: "사장 취임!", sub: "네 직무를 모두 겸직해요<br>영업·개발·기획·인사총무 특징이 한꺼번에 적용돼요", tone: "rare", ms: 3200 });
  renderJobSkills(); updateUI(true); save();
}
/* 명함 그림 (승진식) */
function jRound(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function bizIcon(r, css) {
  css = css || 112;
  const d = uiDpr(), Wc = css, Hc = Math.round(css * 0.64), c = document.createElement("canvas");
  c.className = "pix biz"; c.width = Wc * d; c.height = Hc * d; if (c.style) { c.style.width = Wc + "px"; c.style.height = Hc + "px"; }
  const g = c.getContext && c.getContext("2d"); if (!g || !g.scale || !g.arcTo) return c;
  g.scale(d, d);
  const j = curJob(), col = j ? j.col : "#ffd54a";
  g.fillStyle = "rgba(0,0,0,.45)"; jRound(g, 3, 5, Wc - 5, Hc - 6, 8); g.fill();
  g.fillStyle = "#f6f7fb"; jRound(g, 1, 1, Wc - 5, Hc - 6, 8); g.fill();
  g.fillStyle = col; g.fillRect(1, 9, 6, Hc - 22);
  g.fillStyle = "#1b1f2a"; g.textBaseline = "alphabetic"; g.textAlign = "left";
  g.font = `${Math.round(css * 0.11)}px "Do Hyeon", sans-serif`; g.fillStyle = "#5b6274"; g.fillText(j ? `본사 타워 · ${j.team}` : "본사 타워", 14, Math.round(Hc * 0.27));
  g.font = `${Math.round(css * 0.15)}px "Do Hyeon", sans-serif`; g.fillStyle = "#1b1f2a"; g.fillText("곽준영", 14, Math.round(Hc * 0.55));
  const rn = rankName(r); g.font = `${Math.round(css * 0.2)}px "Do Hyeon", sans-serif`;
  const tw = g.measureText ? g.measureText(rn).width : 30; g.fillStyle = "#141826"; jRound(g, 13, Math.round(Hc * 0.62), tw + 12, Math.round(css * 0.2), 5); g.fill();
  g.fillStyle = col; g.fillText(rn, 19, Math.round(Hc * 0.62 + css * 0.165));
  g.strokeStyle = "#e0262c"; g.lineWidth = 2; g.beginPath(); g.arc(Wc - 24, Hc - 24, 12, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#e0262c"; g.font = `${Math.round(css * 0.085)}px "Do Hyeon", sans-serif`; g.textAlign = "center"; g.fillText("승진", Wc - 24, Hc - 20);
  return c;
}

/* ---------- 직무 고르기 팝업 ---------- */
var jpSel = "";
function openJobPick() {
  const box = $("jobPick"); if (!box || !jobPending()) return;
  const left = JOBS.filter(j => S.jobs.indexOf(j.id) < 0); if (!left.length) return;
  jpSel = "";
  $("jpT").textContent = S.jobs.length ? `${rankName()} 승진 · 직무를 하나 더 골라요` : "어느 팀으로 갈까요?";
  $("jpS").textContent = S.jobs.length ? `지금 직무: ${S.jobs.map(id => jobById(id).team).join(" · ")} · 가진 직무는 인사 기록에서 언제든 바꿔 쓸 수 있어요` : "고른 팀에 따라 공격 모양과 스킬이 달라져요. 과장·부장이 되면 직무를 더 얻어요.";
  const list = $("jpList"); list.innerHTML = "";
  left.forEach(j => {
    const b = el("button", "jp-opt"); b.type = "button"; b.setAttribute("data-job", j.id); if (b.dataset) b.dataset.job = j.id;
    if (b.style && b.style.setProperty) b.style.setProperty("--jc", j.col);
    const ic = el("span", "jp-ic"); ic.appendChild(pixIcon(j.ic, 34));
    const tx = el("span", "jp-tx", `<b>${j.team}</b><small>${j.type} · ${j.atk}</small><span class="jp-pas">${j.pas.map(p => `<i>${p}</i>`).join("")}</span><span class="jp-sk">${j.sk.map(k => `<em><u>${JSK[k].n}</u> ${JSK[k].d}</em>`).join("")}</span>`);
    b.appendChild(ic); b.appendChild(tx); b.addEventListener("click", () => { jpSel = j.id; jpRender(); });
    list.appendChild(b);
  });
  jpRender();
  box.hidden = false; box.classList.remove("go"); void box.offsetWidth; box.classList.add("go");
}
function jpRender() {
  const list = $("jpList"); if (!list) return;
  [...list.children].forEach(b => b.classList.toggle("on", (b.dataset ? b.dataset.job : b.getAttribute("data-job")) === jpSel));
  const j = jobById(jpSel), go = $("jpGo");
  go.disabled = !j;
  go.innerHTML = j ? btnInner({ label: `${j.team}으로 갈게요`, sub: `${JSK[j.sk[0]].n} · ${JSK[j.sk[1]].n}` }) : `<span class="act">팀을 하나 골라 주세요</span>`;
}
function closeJobPick() { const box = $("jobPick"); if (box) box.hidden = true; }
function jobPickConfirm() {
  const j = jobById(jpSel); if (!j || !jobPending() || S.jobs.indexOf(j.id) >= 0) return;
  S.jobs.push(j.id); S.job = j.id; crFocus = "";
  closeJobPick(); sfx("bigup");
  celebrate({ icon: pixIcon(j.ic, 76), title: `${j.team} 배치!`, sub: `${j.type} · 직무 스킬 '${JSK[j.sk[0]].n}' '${JSK[j.sk[1]].n}'이<br>전투 화면 왼쪽 위에 생겼어요`, tone: "gold", ms: 3000 });
  jobCut = { t: 0, dur: 1300, name: `${j.team} 배치`, team: heroTitle(), col: j.col };
  say(`오늘부터 ${j.team}! 잘 부탁드립니다`, 3);
  renderJobSkills(); updateUI(true); save();
}
(() => {
  const go = $("jpGo"); if (go && go.addEventListener) go.addEventListener("click", jobPickConfirm);
  const later = $("jpLater"); if (later && later.addEventListener) later.addEventListener("click", () => { closeJobPick(); toast("정보 탭 인사 기록에서 언제든 직무를 고를 수 있어요"); });
})();

/* ---------- 정보 탭: 인사 기록 카드 ---------- */
var crFocus = "", crKey = "", crTiles = {}, crReqs = [];
function buildCareerCard() {
  if (!panels.info) return;
  const card = el("div", "card career"); card.id = "crCard";
  card.innerHTML = `<div class="cr-biz" id="crBiz"><span class="cr-ic" id="crIc"></span><div class="cr-who"><small id="crTeam"></small><b><span>곽준영</span><span class="cr-rank" id="crRank"></span></b><em id="crBonus"></em></div></div>
    <div class="cr-next"><div class="cr-nh"><b id="crNextT"></b><span id="crNextS"></span></div><div class="cr-reqs" id="crReqs"></div>
      <button type="button" class="buy cr-go" id="crGo"></button><p class="cr-note" id="crNote" hidden></p></div>
    <div class="cr-jh"><b>직무</b><span id="crJobS"></span></div>
    <div class="cr-jobs" id="crJobs"></div>
    <div class="cr-det" id="crDet"></div>`;
  panels.info.appendChild(card);
  updaters.info.push({ update: renderCareer, ready: () => canPromote() || jobPending() });
  const reqs = $("crReqs");
  REQ_INFO.forEach(([k, label]) => {
    const row = el("div", "cr-req", `<span>${label}</span><i class="cr-bar"><i></i></i><b></b>`);
    reqs.appendChild(row); crReqs.push({ k, row, bar: row.querySelector ? row.querySelector(".cr-bar > i") : null, val: row.querySelector ? row.querySelector("b") : null });
  });
  const jobsEl = $("crJobs");
  JOBS.forEach(j => {
    const b = el("button", "cr-job"); b.type = "button"; if (b.style && b.style.setProperty) b.style.setProperty("--jc", j.col);
    b.appendChild(pixIcon(j.ic, 30));
    const nm = el("b"); nm.textContent = j.n; const st = el("small"); b.appendChild(nm); b.appendChild(st);
    b.addEventListener("click", () => { crFocus = j.id; crKey = ""; renderCareer(); });
    jobsEl.appendChild(b); crTiles[j.id] = { b, st };
  });
  $("crGo").addEventListener("click", () => { if (!promote()) toast("아직 승진 조건을 다 채우지 못했어요"); });
  $("crDet").addEventListener("click", e => {
    const t = e.target, b = t && t.closest ? t.closest("button") : (t && t.tagName === "BUTTON" ? t : null);
    if (!b) return;
    const act = b.dataset ? b.dataset.act : b.getAttribute("data-act"), id = b.dataset ? b.dataset.job : b.getAttribute("data-job");
    if (act === "use" && S.jobs.indexOf(id) >= 0 && S.job !== id) {
      const j = jobById(id); S.job = id; crKey = "";
      jobCut = { t: 0, dur: 1100, name: `${j.team}으로 이동`, team: heroTitle(), col: j.col }; sfx("buff");
      toast(`${j.team}으로 옮겼어요 · ${j.type}`); renderJobSkills(); updateUI(true); save();
    } else if (act === "pick") openJobPick();
  });
}
function renderCareer() {
  const card = $("crCard"); if (!card) return;
  const r = rankIdx(), j = curJob(), v = reqVals(), can = canPromote(), pend = jobPending();
  const focus = jobById(crFocus) || j || JOBS[0];
  const key = [r, (S.jobs || []).join(","), S.job, can, pend, focus.id, Math.floor(v.floor), Math.floor(v.chap), Math.floor(v.study * 10), v.retire].join("|");
  if (key === crKey) return; crKey = key;
  const col = j ? j.col : "#ffd54a";
  if (card.style && card.style.setProperty) card.style.setProperty("--jc", col);
  const ic = $("crIc"); ic.innerHTML = ""; ic.appendChild(pixIcon(j ? j.ic : "corp", 36));
  $("crTeam").textContent = j ? `본사 타워 · ${j.team} · ${j.type}` + (isCEO() ? " · 네 직무 겸직" : "") : "본사 타워 · 아직 직무 없음";
  $("crRank").textContent = rankName(r);
  $("crBonus").textContent = r ? `직급 보너스 · 공격력 ×${mulTxt(rankMul(r))} · 월급 ×${mulTxt(rankMul(r))}` : "승진할 때마다 공격력·월급이 25%씩 올라요";
  // 다음 승진
  const nx = r < RANKS.length - 1 ? RANKS[r + 1] : null, go = $("crGo"), note = $("crNote");
  if (nx) {
    const ks = Object.keys(nx.req), met = ks.filter(k => v[k] >= nx.req[k]).length;
    $("crNextT").textContent = `다음 직급 · ${nx.n}`; $("crNextS").textContent = `조건 ${met}/${ks.length}`;
    crReqs.forEach(q => {
      const need = nx.req[q.k]; q.row.hidden = need == null; if (need == null) return;
      const ok = v[q.k] >= need, f = REQ_INFO.find(x => x[0] === q.k)[2];
      q.row.classList.toggle("ok", ok);
      if (q.bar && q.bar.style) q.bar.style.width = Math.min(100, v[q.k] / need * 100).toFixed(1) + "%";
      if (q.val) q.val.textContent = `${f(Math.min(v[q.k], 99999))} / ${f(need)}`;
    });
    go.hidden = false; go.disabled = !can; go.className = "buy cr-go" + (can ? "" : " ghost");
    go.innerHTML = can ? btnInner({ label: "승진 심사 받기", sub: `${ro(nx.n)} 승진 · 공격력·월급 ×${mulTxt(rankMul(r + 1))}` }) : `<span class="act">조건을 다 채우면 승진 심사</span><small>말씀 읽기 · 공부 · 층 올리기</small>`;
    note.hidden = !nx.job; note.textContent = r + 1 === RANKS.length - 1 ? `${iga(nx.n)} 되면 넷째 직무가 열리고 네 직무 특징이 모두 적용돼요` : nx.job ? `${iga(nx.n)} 되면 새 직무를 하나 더 골라요` : "";
  } else {
    $("crNextT").textContent = "최고 직급 · 사장"; $("crNextS").textContent = "사장 특권";
    crReqs.forEach(q => { q.row.hidden = true; });
    go.hidden = true; note.hidden = false; note.textContent = "네 직무 특징이 모두 적용되고 있어요. 직무 스킬은 고른 직무 것을 써요.";
  }
  // 직무 칸
  const nxr = nextJobRank();
  $("crJobS").textContent = pend ? "새 직무를 고를 수 있어요!" : (S.jobs.length ? `가진 직무 ${S.jobs.length}/4` + (nxr > 0 ? ` · 다음 직무는 ${rankName(nxr)}` : "") : `${iga(rankName(nextJobRank()))} 되면 첫 직무`);
  JOBS.forEach(jj => {
    const t = crTiles[jj.id]; if (!t) return;
    const own = S.jobs.indexOf(jj.id) >= 0, on = S.job === jj.id && own;
    const state = on ? "on" : own ? "own" : pend ? "pick" : "lock";
    t.b.className = `cr-job ${state}` + (focus.id === jj.id ? " sel" : "");
    t.st.textContent = on ? (isCEO() ? "대표 직무" : "근무 중") : own ? (isCEO() ? "겸직 중" : "바꿀 수 있음") : pend ? "고를 수 있음" : "잠김";
  });
  // 고른 직무 설명
  const fOwn = S.jobs.indexOf(focus.id) >= 0, fOn = S.job === focus.id && fOwn;
  const det = $("crDet"); if (det.style && det.style.setProperty) det.style.setProperty("--jc", focus.col);
  let btn = "";
  if (fOwn && !fOn) btn = `<button type="button" class="buy cr-use" data-act="use" data-job="${focus.id}">${btnInner({ label: `${focus.team}으로 바꾸기`, sub: "스킬 버튼도 바뀌어요" })}</button>`;
  else if (!fOwn && pend) btn = `<button type="button" class="buy cr-use" data-act="pick" data-job="${focus.id}">${btnInner({ label: "직무 고르기", sub: "고를 수 있는 팀 보기" })}</button>`;
  det.innerHTML = `<h4>${focus.team} <small>${focus.type}${fOn ? " · 근무 중" : fOwn ? " · 가진 직무" : ""}</small></h4>
    <p class="cr-dl"><span>특징</span>${focus.pas.join(" · ")}</p>
    <p class="cr-dl"><span>기본 공격</span>${focus.atk}</p>
    ${focus.sk.map(k => `<p class="cr-dl"><span>${JSK[k].n}</span>${JSK[k].d} · ${JSK[k].cd}초마다</p>`).join("")}
    ${!fOwn && !pend ? `<p class="cr-lock">${nxr > 0 ? `${iga(rankName(nxr))} 되면 직무를 하나 더 고를 수 있어요` : "직무 칸이 다 찼어요"}</p>` : ""}${btn}`;
}

/* ---------- 전투 화면: 직무 스킬 버튼 ---------- */
var jskBtns = [], jskKey = null;
function renderJobSkills() {
  const box = $("jobSk"); if (!box) return;
  const j = curJob(), key = j ? j.id : "";
  if (key !== jskKey) {
    jskKey = key; box.innerHTML = ""; jskBtns = [];
    if (j) j.sk.forEach(k => {
      const sk = JSK[k], b = document.createElement("button"); b.type = "button"; b.className = "jsk"; b.setAttribute("aria-label", `${sk.n}: ${sk.d}`);
      if (b.style && b.style.setProperty) b.style.setProperty("--jc", j.col);
      b.appendChild(pixIcon(sk.ic, 26));
      const cd = document.createElement("i"); cd.className = "sk-cd"; b.appendChild(cd);
      const tx = document.createElement("span"); tx.className = "sk-t num"; b.appendChild(tx);
      const nm = document.createElement("em"); nm.className = "jsk-n"; nm.textContent = sk.n; b.appendChild(nm);
      b.addEventListener("click", () => castJob(sk, false));
      box.appendChild(b); jskBtns.push({ sk, b, cd, tx });
    });
    box.hidden = !j;
  }
  jskBtns.forEach(r => {
    const left = skillLeft(r.sk), on = skillOn(r.sk.id);
    r.b.classList.toggle("ready", left <= 0 && !on); r.b.classList.toggle("on", on);
    const p = left > 0 ? left / r.sk.cd : 0, bg = p > 0 ? `conic-gradient(rgba(6,9,18,.74) ${(p * 360).toFixed(1)}deg, rgba(0,0,0,0) 0)` : "none";
    if (r.cd._bg !== bg) { r.cd._bg = bg; r.cd.style.background = bg; }
    const t = on ? `${Math.ceil(((skillUntil[r.sk.id] || 0) - Date.now()) / 1000)}` : left > 0 ? `${Math.ceil(left)}` : "";
    if (r.tx.textContent !== t) r.tx.textContent = t;
  });
}
function castJob(sk, auto) {
  const j = curJob(); if (!j || sk.job !== j.id) return false;
  const left = skillLeft(sk);
  if (left > 0) { if (!auto) toast(`${sk.n}: ${Math.ceil(left)}초 뒤에 다시 쓸 수 있어요 · ${sk.d}`); return false; }
  if (!canFight()) { if (!auto) toast("적이 나타나면 쓸 수 있어요"); return false; }
  S.skillCd = S.skillCd || {}; S.skillCd[sk.id] = Date.now() + sk.cd * 1000;
  if (sk.dur) skillUntil[sk.id] = Date.now() + sk.dur * 1000;
  jobCut = { t: 0, dur: 950, name: sk.n + "!", team: `${j.team} · ${heroTitle()}`, col: j.col };
  sfx("buff");
  const st = stats();
  JSK_CAST[sk.key](st);
  renderJobSkills(); save(); return true;
}
function jobSkillAuto() {
  const j = curJob(); if (!j || !S.autoSkill || document.hidden || !canFight()) return;
  for (const k of j.sk) {
    const sk = JSK[k]; if (skillLeft(sk) > 0) continue;
    if (mon.kind === 0 && !mon.golden && mon.hp < stats().dps * 3) continue;   // 거의 쓰러진 잡몹에는 아낌
    if (castJob(sk, true)) return;
  }
}

/* ---------- 이펙트 붓: 셀 애니메이션 느낌 (번짐 + 색 + 흰 심을 더하기 합성) ----------
   참고 그림: 후광 고리에서 내리꽂는 빛의 창 + 땅 파편, 꼬리 긴 혜성 + 별 끝, 둥근 충격 구체, 마법진, 초승달 충격파 */
function msz() { return mon ? monSize() : { w: 60, h: 80 }; }
function jvRand(seed, i) { const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453; return v - Math.floor(v); }
function jvFillPts(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.fill(); }
function jvTaperPts(x0, y0, x1, y1, w, seed, jag, peak) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, N = 10, A = [], B = [];
  const p = Math.max(0.05, Math.min(0.95, peak == null ? 0.5 : peak));
  for (let i = 0; i <= N; i++) {
    const t = i / N, prof = t < p ? Math.pow(t / p, 0.55) : Math.pow((1 - t) / (1 - p), 0.85);
    const hw = w * prof * (1 + (jvRand(seed, i) - 0.5) * jag), off = (jvRand(seed + 3.3, i) - 0.5) * jag * w * 1.4 * prof;
    const cx = x0 + dx * t + nx * off, cy = y0 + dy * t + ny * off;
    A.push([cx + nx * hw, cy + ny * hw]); B.push([cx - nx * hw, cy - ny * hw]);
  }
  return A.concat(B.reverse());
}
function jvBlade(x0, y0, x1, y1, w, col, a, seed, jag, peak) {   // 빛 창 · 가시
  if (a <= 0.01) return;
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = col;
  ctx.globalAlpha = a * 0.28; jvFillPts(jvTaperPts(x0, y0, x1, y1, w * 2.3, seed, jag, peak));
  ctx.globalAlpha = a; jvFillPts(jvTaperPts(x0, y0, x1, y1, w, seed, jag, peak));
  ctx.fillStyle = "#ffffff"; jvFillPts(jvTaperPts(x0, y0, x1, y1, w * 0.4, seed, jag * 0.5, peak));
  ctx.restore();
}
function jvStarPath(rx, ry, w) { ctx.beginPath(); ctx.moveTo(0, -ry); ctx.quadraticCurveTo(w, -w, rx, 0); ctx.quadraticCurveTo(w, w, 0, ry); ctx.quadraticCurveTo(-w, w, -rx, 0); ctx.quadraticCurveTo(-w, -w, 0, -ry); ctx.closePath(); }
function jvStar(x, y, r, col, a, tall, rot) {   // 네 갈래 반짝이
  if (a <= 0.01 || r <= 0) return;
  const ry = r * (tall || 1.6), w = r * 0.2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = col;
  ctx.globalAlpha = a * 0.3; jvStarPath(r * 1.8, ry * 1.6, w * 2); ctx.fill();
  ctx.globalAlpha = a; jvStarPath(r, ry, w); ctx.fill();
  ctx.fillStyle = "#ffffff"; jvStarPath(r * 0.5, ry * 0.55, w * 0.5); ctx.fill();
  ctx.restore();
}
function jvHalo(x, y, rx, ry, col, a, spin) {   // 납작한 후광 고리
  if (a <= 0.01 || !ctx.ellipse) return;
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const E = (r1, r2, w, c, al, s0, s1) => { ctx.globalAlpha = a * al; ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.5, r1), Math.max(0.5, r2), 0, s0 == null ? 0 : s0, s1 == null ? Math.PI * 2 : s1); ctx.stroke(); };
  const s = spin || 0;
  E(rx, ry, ry * 1.2, col, 0.22);
  E(rx, ry, Math.max(2, ry * 0.45), col, 1);
  E(rx * 0.97, ry * 0.86, Math.max(1, ry * 0.16), "#ffffff", 0.95, 0.12 * Math.PI, 0.88 * Math.PI);
  E(rx * 1.32, ry * 1.5, 1.5, col, 0.75, 1.05 * Math.PI + s, 1.5 * Math.PI + s);
  E(rx * 1.2, ry * 1.3, 1.2, col, 0.6, 1.7 * Math.PI + s, 1.97 * Math.PI + s);
  ctx.restore();
}
function jvShards(x, gy, n, col, dark, k, seed, H, spread) {   // 땅에서 솟는 파편
  const grow = k < 0.2 ? 1 - Math.pow(1 - k / 0.2, 3) : 1, a = k < 0.55 ? 1 : 1 - (k - 0.55) / 0.45;
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < n; i++) {
    const r1 = jvRand(seed, i), r2 = jvRand(seed + 7, i), u = n > 1 ? i / (n - 1) - 0.5 : 0, ox = u * spread + (r1 - 0.5) * 10;
    const h = H * (0.45 + r2 * 0.7) * grow * Math.max(0.25, 1 - Math.abs(u) * 1.1), w = 4 + r1 * 8, tilt = u * 1.1 + (r2 - 0.5) * 0.35;
    const bx = x + ox, tx = bx + Math.sin(tilt) * h, ty = gy - Math.cos(tilt) * h;
    ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(bx - w, gy); ctx.lineTo(tx, ty); ctx.lineTo(bx + w * 0.7, gy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(bx - w * 0.45, gy); ctx.lineTo(tx, ty); ctx.lineTo(bx + w * 0.1, gy); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function jvCrackle(x, y, r, col, a, seed) {   // 작은 번개 잔불
  if (a <= 0.01) return;
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.lineJoin = "miter";
  for (let b = 0; b < 4; b++) { let px = x, py = y; const an = jvRand(seed, b) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(px, py); for (let s = 1; s <= 4; s++) { const aa = an + (jvRand(seed + s, b) - 0.5) * 1.8; px += Math.cos(aa) * r / 4; py += Math.sin(aa) * r / 4; ctx.lineTo(px, py); } ctx.stroke(); }
  ctx.restore();
}
function jvSphere(x, y, R, col, k, seed, dark) {   // 둥근 충격 구체 + 안쪽 방사 가시 + 짙은 연기
  const g0 = Math.min(1, k / 0.26), r = R * (0.3 + 0.7 * (1 - Math.pow(1 - g0, 3))), a = k < 0.45 ? 1 : Math.max(0, 1 - (k - 0.45) / 0.55);
  if (a <= 0.01) return;
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, hexA("#ffffff", 0.9 * a)); gr.addColorStop(0.3, hexA(col, 0.7 * a)); gr.addColorStop(0.8, hexA(col, 0.2 * a)); gr.addColorStop(1, hexA(col, 0));
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, R * 0.09 * (1 - k * 0.7)); ctx.beginPath(); ctx.arc(x, y, r * 0.96, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.globalAlpha = a * 0.8; ctx.lineWidth = Math.max(1, R * 0.03); ctx.beginPath(); ctx.arc(x, y, r * 0.9, -2.5, -0.8); ctx.stroke();
  ctx.restore();
  for (let i = 0, nb = R > 30 ? 8 : 5; i < nb; i++) { const an = jvRand(seed, i) * Math.PI * 2, l0 = r * 0.12, l1 = r * (0.5 + jvRand(seed + 2, i) * 0.42); jvBlade(x + Math.cos(an) * l0, y + Math.sin(an) * l0, x + Math.cos(an) * l1, y + Math.sin(an) * l1, Math.max(1.5, R * 0.07), col, a * 0.9, seed + i, 0.25, 0.3); }
  if (dark) { ctx.save(); ctx.globalAlpha = a * 0.5; ctx.fillStyle = dark; for (let i = 0; i < 5; i++) { const an = jvRand(seed + 9, i) * Math.PI * 2, d = r * (0.3 + jvRand(seed + 4, i) * 0.45); ctx.beginPath(); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, r * (0.07 + jvRand(seed + 5, i) * 0.09), 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
}
function jvComet(x, y, ang, len, w, col, a, seed) {   // 꼬리 긴 혜성 + 별 끝
  if (a <= 0.01) return;
  const tx = x - Math.cos(ang) * len, ty = y - Math.sin(ang) * len;
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const gr = ctx.createLinearGradient(tx, ty, x, y); gr.addColorStop(0, hexA(col, 0)); gr.addColorStop(0.6, hexA(col, 0.5 * a)); gr.addColorStop(1, hexA(col, 0.95 * a));
  ctx.fillStyle = gr; jvFillPts(jvTaperPts(tx, ty, x, y, w, seed, 0.3, 0.88));
  ctx.globalAlpha = 0.85 * a; ctx.fillStyle = "#ffffff"; jvFillPts(jvTaperPts(tx + (x - tx) * 0.5, ty + (y - ty) * 0.5, x, y, w * 0.32, seed, 0.1, 0.9));
  ctx.restore();
  jvStar(x, y, w * 1.5, col, a, 0.5, ang);
}
function jvCrescent(x, y, r, ang, col, a, th, span) {   // 초승달 (베기 · 충격파)
  if (a <= 0.01 || r <= 1) return;
  const sp = span || 1.2, t = th || r * 0.3;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalCompositeOperation = "lighter";
  const P = (rr, tt) => { ctx.beginPath(); ctx.arc(0, 0, rr, -sp, sp); ctx.arc(-tt, 0, rr * 0.97, sp * 0.95, -sp * 0.95, true); ctx.closePath(); };
  ctx.fillStyle = col; ctx.globalAlpha = a * 0.3; P(r * 1.07, t * 1.7); ctx.fill();
  ctx.globalAlpha = a; P(r, t); ctx.fill();
  ctx.fillStyle = "#ffffff"; P(r * 0.995, t * 0.42); ctx.fill();
  ctx.restore();
}
/* 마법진: 모양별로 한 번만 그려 두고(굽기) 돌리고 늘려서 씀 */
var jvCircCache = {};
function jvCircleBake(col, sides, runes) {
  const R = 72, Q = 2, pad = 14, size = (R + pad) * 2 * Q;
  const c = document.createElement("canvas"); c.width = size; c.height = size;
  const g = c.getContext && c.getContext("2d"); if (!g || !g.arc || !g.translate) return null;
  g.translate(size / 2, size / 2); g.scale(Q, Q);
  const ring = rr => { g.beginPath(); g.arc(0, 0, rr, 0, Math.PI * 2); g.stroke(); };
  g.strokeStyle = col; g.globalAlpha = 0.3; g.lineWidth = R * 0.16; ring(R);
  g.globalAlpha = 1; g.lineWidth = R * 0.05; ring(R); g.lineWidth = R * 0.03; ring(R * 0.8); ring(R * 0.6);
  for (let i = 0; i < 24; i++) { const an = i / 24 * Math.PI * 2, r2 = i % 3 ? 0.87 : 0.95; g.beginPath(); g.moveTo(Math.cos(an) * R * 0.81, Math.sin(an) * R * 0.81); g.lineTo(Math.cos(an) * R * r2, Math.sin(an) * R * r2); g.stroke(); }
  const n = sides || 5, step = n === 5 ? 2 : 1; g.lineWidth = R * 0.035; g.beginPath();
  for (let i = 0; i <= n; i++) { const an = (i * step) / n * Math.PI * 2 - Math.PI / 2, px = Math.cos(an) * R * 0.6, py = Math.sin(an) * R * 0.6; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
  g.stroke();
  if (runes && runes.length) { g.fillStyle = col; g.font = `${Math.round(R * 0.14)}px "Do Hyeon", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; runes.forEach((ch, i) => { g.save(); g.rotate(i / runes.length * Math.PI * 2); g.fillText(ch, 0, -R * 0.7); g.restore(); }); }
  c.__R = R; c.__Q = Q; return c;
}
function jvCircle(x, y, r, rot, col, a, sx, sy, sides, runes) {
  if (a <= 0.01 || r <= 2) return;
  const key = col + "|" + (sides || 5) + "|" + (runes ? runes.join(",") : "");
  if (!(key in jvCircCache)) jvCircCache[key] = jvCircleBake(col, sides, runes);
  const c = jvCircCache[key]; if (!c) return;
  const k = r / c.__R, s = c.width / c.__Q;
  ctx.save(); ctx.translate(x, y); ctx.scale((sx || 1) * k, (sy || 1) * k); ctx.rotate(rot || 0); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a;
  ctx.drawImage(c, -s / 2, -s / 2, s, s);
  ctx.restore();
}
function jvRibbon(x0, y0, x1, y1, amp, ph, col, a, w) {   // 빔을 감고 도는 띠
  if (a <= 0.01) return;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (let s = 0; s < 2; s++) {
    ctx.globalAlpha = a * (s ? 0.9 : 0.6); ctx.strokeStyle = s ? "#ffffff" : col; ctx.lineWidth = s ? w * 0.35 : w; ctx.beginPath();
    for (let i = 0; i <= 36; i++) { const t = i / 36, o = Math.sin(t * 11 + ph) * amp * Math.sin(Math.PI * Math.min(1, t * 1.6)); const px = x0 + dx * t + nx * o, py = y0 + dy * t + ny * o; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.stroke();
  }
  ctx.restore();
}
/* 이펙트 조각 하나 넣기 (t 를 음수로 주면 그만큼 늦게 시작) */
function jvAdd(kind, o) { o.kind = kind; if (o.t == null) o.t = 0; if (o.seed == null) o.seed = Math.random() * 100; jobFx.push(o); return o; }
/* 후광 → 빛의 창이 내리꽂힘 → 땅 파편 · 충격 구체 · 번개 잔불 (참고 영상) */
function jvStrike(x0, y0, x1, y1, col, w, delay, o) {
  o = o || {};
  const dur = o.dur || 760, hitAt = dur * 0.28;
  const f = jvAdd("lspear", { x0, y0, x1, y1, w, col, dur, rx: o.rx || 26, ry: o.ry || 6, halo: o.halo !== false, t: -(delay || 0) });
  f.ev = [{ at: hitAt, fn: () => {
    if (o.shards !== false) jvAdd("shards", { x: x1, gy: GROUND - 2, n: o.n || 6, col: o.sc || "#e3c08f", dark: o.sd || "#7a5232", h: o.sh || 46, spread: o.spread || 60, dur: 600 });
    jvAdd("sphere", { x: x1, y: o.sy == null ? y1 - 14 : o.sy, R: o.R || 26, col, dur: 380 });
    jvAdd("crackle", { x: x1, y: y1 - 6, r: 26, col: o.cc || "#bfefff", dur: 220 });
    if (!reduceMotion) shakeAmt = Math.max(shakeAmt, o.shake || 8);
    hitSound(o.hs || 0.8);
    if (o.onHit) o.onHit();
  } }];
  return f;
}

/* ---------- 기본 공격: 직무마다 다른 모양 ---------- */
function jSparks(x, y, col, n, spd) { if (reduceMotion) n = Math.ceil(n / 2); spd = spd || 10; for (let i = 0; i < n; i++) sparks.push({ x, y, vx: (Math.random() - .45) * spd, vy: (Math.random() - .65) * spd, life: 1, c: col, line: true }); }
function jGold(x, y, n) { for (let i = 0; i < n; i++) jobParts.push({ kind: "coin", x: x + (Math.random() - .5) * 20, y, vx: (Math.random() - .25) * 7, vy: -3 - Math.random() * 6, g: 0.42, life: 1, dur: 950, vr: 0.3 + Math.random() * 0.3, rot: Math.random() * 6, bounce: 1 }); jSparks(x, y, "#ffd54a", Math.ceil(n * 0.8)); }
function monHitPoint(fy) { const { h: mh } = msz(); return [MON_X - 14 + (Math.random() - .5) * 18, GROUND - mh * (fy == null ? 0.3 + Math.random() * 0.45 : fy)]; }
function jobStrike(st, crit) {
  const j = curJob(); if (!j || !mon || mon.dying) return false;
  jobHitN++;
  const dmg = st.atk * (crit ? st.critMul : 1);
  if (j.id === "sales") {   // 금빛 초승달 베기 · 치명타면 반짝이와 동전
    const [x, y] = monHitPoint(0.5), up = jobHitN % 2;
    jvAdd("slash", { x: x - 4, y, r: crit ? 48 : 34, ang: up ? -0.45 : 0.5, col: "#ffd54a", dur: crit ? 240 : 170, th: crit ? 15 : 9, span: 1.25, drift: 8 });
    if (crit) { jGold(x, y - 10, 5); jvAdd("star", { x: x + 20, y: y - 28, r: 7, col: "#ffd54a", dur: 420 }); jvAdd("star", { x: x - 24, y: y + 10, r: 5, col: "#fff3b0", dur: 360 }); addFloat(x - 40, y - 46, "계약!", "#ffd54a", 22, true); sfx("coin"); }
    return false;   // 피해는 원래 근접 타격 그대로
  }
  if (j.id === "dev") {   // 코드 혜성
    const [tx, ty] = monHitPoint();
    jobProj.push({ kind: "code", x0: heroHand.x + 8, y0: heroHand.y - 6, tx, ty, t: 0, dur: 110, dmg, crit, chain: jobHitN % 4 === 0, atk: st.atk, g: CODE_GLYPHS[jobHitN % CODE_GLYPHS.length], m: mon, seed: Math.random() * 100 });
    sfx("pew"); return true;
  }
  if (j.id === "plan") {   // 레이저 포인터 (5번째는 약점 저격)
    const snipe = jobHitN % 5 === 0, [tx, ty] = monHitPoint(snipe ? 0.62 : null);
    jvAdd("pointer", { dur: snipe ? 340 : 140, x0: heroHand.x + 6, y0: heroHand.y - 4, x1: tx, y1: ty, snipe });
    hit(dmg * (snipe ? 3 : 1), crit || snipe, "jhero", tx, ty);
    if (snipe) { jvAdd("sphere", { x: tx, y: ty, R: 32, col: "#ff7a9a", dark: "#3a0b18", dur: 440 }); addFloat(tx - 6, ty - 34, "약점!", "#ff7a9a", 24, true); triggerImpactFrame(tx, ty); sfx("zap"); }
    else sfx("pew");
    return true;
  }
  if (j.id === "hr") {   // 결재 도장 투척
    const [tx, ty] = monHitPoint();
    jobProj.push({ kind: "stamp", x0: heroHand.x, y0: heroHand.y - 10, tx, ty, t: 0, dur: 165, dmg, crit, m: mon, rot: Math.random() * 6, seed: Math.random() * 100 });
    sfx("toss"); return true;
  }
  return false;
}
function projLand(p) {
  if (!mon || mon !== p.m || mon.dying || spawnWait > 0) return;
  if (p.kind === "code") {
    jvAdd("sphere", { x: p.tx, y: p.ty, R: p.crit ? 30 : 18, col: "#6fd3ff", dur: p.crit ? 380 : 260 });
    jvAdd("crackle", { x: p.tx, y: p.ty, r: 22, col: "#bfefff", dur: 180 });
    jSparks(p.tx, p.ty, p.crit ? "#ffffff" : "#6fd3ff", p.crit ? 10 : 5);
    hit(p.dmg, p.crit, "jhero", p.tx, p.ty);
    if (p.chain && mon && !mon.dying) devChain(p.atk, p.tx, p.ty);
  } else if (p.kind === "stamp") {
    jvAdd("splat", { dur: 300, x: p.tx, y: p.ty });
    jvAdd("sphere", { x: p.tx, y: p.ty, R: p.crit ? 26 : 16, col: "#ff5d5d", dur: 240 });
    jSparks(p.tx, p.ty, "#ff5d5d", 5);
    hit(p.dmg, p.crit, "jhero", p.tx, p.ty);
    if (mon && !mon.dying) {
      if (jobMarks.m !== mon) { jobMarks.m = mon; jobMarks.n = 0; jobMarks.pos = []; }
      if (jobMarks.n < 5) { jobMarks.n++; const { w: mw, h: mh } = msz(); jobMarks.pos.push([(p.tx - MON_X) / mw, (GROUND - p.ty) / mh, (Math.random() - .5) * 0.8]); }
      sfx("stamp");
    }
  }
}
function jBoltPts(x0, y0, x1, y1, n, amp) { n = n || 7; amp = amp || 24; const pts = []; for (let i = 0; i <= n; i++) { const k = i / n, e = i === 0 || i === n ? 0 : 1; pts.push([x0 + (x1 - x0) * k + (Math.random() - .5) * amp * e, y0 + (y1 - y0) * k + (Math.random() - .5) * amp * 0.5 * e]); } return pts; }
function devChain(atk, x, y) {
  const { h: mh } = msz(), segs = [];
  let px = x, py = y;
  for (let i = 0; i < 3; i++) { const nx = MON_X - 50 + Math.random() * 90, ny = GROUND - mh * (0.12 + Math.random() * 0.8); segs.push(jBoltPts(px, py, nx, ny, 5, 18)); px = nx; py = ny; jvAdd("star", { x: nx, y: ny, r: 5, col: "#6fd3ff", dur: 300, rise: 4 }); }
  jvAdd("chain", { dur: 260, segs });
  hit(atk * 4, false, "skill", px, py);
  addFloat(x - 24, y - 40, "연쇄 번개!", "#6fd3ff", 20, true); sfx("zap");
  if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 6);
}

/* ---------- 직무 스킬 8개 ---------- */
var JSK_CAST = {
  dash(st) {
    const f = jvAdd("dash", { dur: 1080, ev: [], hits: [] });
    for (let i = 0; i < 5; i++) f.ev.push({ at: 80 + i * 125, fn: () => dashHit(f, i, st) });
    sfx("whoosh"); say("이번 분기 실적, 내가 찢는다!", 2);
  },
  deal(st) {
    [[-48, 46, 0], [6, 28, 140], [54, 56, 280]].forEach(([dx, hy, dl]) => {
      const x = MON_X - 8 + dx;
      jvStrike(x, hy, x, GROUND - 2, "#ffd54a", 8, dl, { rx: 32, ry: 7, R: 34, sh: 58, shake: 12, hs: 1.1, onHit: () => { if (mon && !mon.dying) hit(st.dps * 1.2, true, "skill", x, GROUND - 46); jGold(x, GROUND - 30, 4); } });
    });
    jvAdd("contract", { dur: 1500, ev: [{ at: 650, fn: () => {
      stampFx = { t: 0, kind: 2, hit: false, text: "계약", top: "계약 성사", nocam: true };
      screenFlash = Math.max(screenFlash, 0.3); flashCol = "#ffd54a"; if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 14);
      const { h: mh } = msz(); jGold(MON_X - 10, GROUND - mh * 0.6, 18); sfx("coin");
      addFloat(MON_X - 30, GROUND - mh - 30, "8초 동안 전부 치명타!", "#ffd54a", 22, true);
    } }] });
    jvAdd("goldrain", { dur: 8000, acc: -300 });
    say("사인만 하시면 됩니다. 쾅!", 2);
  },
  hotfix(st) {
    const f = jvAdd("hotfix", { dur: 1650, blocks: [], ev: [] });
    for (let i = 0; i < 12; i++) {
      const [tx, ty] = monHitPoint(0.35 + Math.random() * 0.45);
      const b = { at: 100 + i * 80, x: tx + (Math.random() - .5) * 22, ty, sx: tx + 120 + Math.random() * 60, sy: 12 + Math.random() * 40, g: CODE_GLYPHS[(i * 5) % CODE_GLYPHS.length], col: i % 3 === 2 ? "#ff6bd6" : "#6fd3ff", seed: Math.random() * 100 };
      f.blocks.push(b); f.ev.push({ at: b.at + 230, fn: () => hotfixHit(b, st, i === 11, i) });
    }
    say("배포 들어갑니다! 롤백은 없다!", 2);
  },
  loop(st) {
    const { h: mh } = msz();
    const f = jvAdd("loop", { dur: 6200, ev: [], cy: Math.max(36, GROUND - mh - 74) });
    for (let k = 0; k < 24; k++) f.ev.push({ at: 260 + k * 245, fn: () => loopBolt(f, k) });
    jobGlitch = 6000; say("while (true) { 때린다(); }", 2);
  },
  ppt(st) {
    const f = jvAdd("ppt", { dur: 2600, slides: [], ev: [] });
    for (let i = 0; i < 20; i++) {
      const [tx, ty] = monHitPoint(0.15 + Math.random() * 0.75);
      const s = { at: i * 42, tx: tx + (Math.random() - .5) * 26, ty, arc: 40 + Math.random() * 70, spin: 6 + Math.random() * 8, chart: i % 3, tilt: (Math.random() - .5) * 0.9 };
      f.slides.push(s); f.ev.push({ at: s.at + 230, fn: () => pptHit(s, st) });
    }
    jvAdd("reticle", { dur: 10000 });
    say("결론부터 말씀드리겠습니다.", 2);
  },
  beam(st) {
    const f = jvAdd("beam", { dur: 2780, ev: [] });
    for (let k = 0; k < 20; k++) f.ev.push({ at: 540 + k * 100, fn: () => beamTick(st, k) });
    f.ev.push({ at: 2540, fn: () => { const [x, y] = monHitPoint(0.5); jvAdd("sphere", { x, y, R: 78, col: "#ff7a9a", dark: "#3a0b18", dur: 620 }); jvAdd("gring", { x: MON_X - 6, gy: GROUND - 2, R: 130, col: "#ff7a9a", dur: 520 }); screenFlash = Math.max(screenFlash, 0.35); flashCol = "#ff7a9a"; if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 16); hitSound(1.4); } });
    sfx("sizzle"); say("로드맵 나갑니다. 1분기부터 4분기까지!", 2);
  },
  meeting(st) {
    const f = jvAdd("meeting", { dur: 8700, crew: [] });
    for (let i = 0; i < 8; i++) f.crew.push({ x: 70 - i * 6, tx: MON_X - 128 + (i % 4) * 24, row: i < 4 ? 0 : 1, pal: crewPals[Math.floor(Math.random() * crewPals.length)], cd: 500 + Math.random() * 600, hop: 0, bub: 0, say: "", wait: i * 70 });
    sfx("cheer"); say("전원 3분 안에 회의실로 집합!", 2);
  },
  order(st) {
    const dest = ORDER_DEST[Math.floor(Math.random() * ORDER_DEST.length)];
    jvAdd("order", { dur: 8000, dest, ev: [{ at: 430, fn: () => {
      const { h: mh } = msz(), cy = GROUND - mh * 0.55;
      jvAdd("sphere", { x: MON_X - 8, y: cy, R: 64, col: "#ff5d5d", dark: "#3a0606", dur: 560 });
      for (let i = 0; i < 6; i++) jvAdd("slash", { x: MON_X - 8 + Math.cos(i * 1.047) * 46, y: cy + Math.sin(i * 1.047) * 40, r: 30, ang: i * 1.047, col: "#ff7a6b", dur: 380, th: 9, span: 1.0, drift: 0 });
      jvAdd("shards", { x: MON_X - 8, gy: GROUND - 2, n: 9, col: "#ff8a7a", dark: "#7a1f1d", h: 64, spread: 120, dur: 620 });
      screenFlash = Math.max(screenFlash, 0.3); flashCol = "#ff2a2a"; if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 15);
      hitSound(1.2); sfx("stamp"); addFloat(MON_X - 24, GROUND - mh - 36, `발령: ${dest}`, "#ff7a6b", 24, true);
    } }] });
    say("인사 발령 났습니다. 짐 싸세요!", 2);
  },
};
function dashHit(f, i, st) {
  if (!mon || mon.dying) return;
  const last = i === 4, [x, y] = monHitPoint(0.32 + 0.12 * (i % 3)), crit = Math.random() < st.crit;
  f.hits.push({ t: f.t, i, y });
  jvAdd("slash", { x, y, r: last ? 80 : 58, ang: i % 2 ? Math.PI + 0.45 : -0.42, col: "#ffd54a", dur: last ? 380 : 250, th: last ? 24 : 15, span: 1.35, drift: i % 2 ? -10 : 10 });
  jvAdd("star", { x: x + (Math.random() - .5) * 50, y: y - 34, r: 7, col: "#fff3b0", dur: 420 });
  if (i % 2 === 0 || last) jvAdd("shards", { x: MON_X - 10, gy: GROUND - 2, n: last ? 9 : 6, col: "#f0cf87", dark: "#8a5a2a", h: last ? 78 : 44, spread: last ? 130 : 90, dur: 560 });
  if (!reduceMotion) { shakeAmt = Math.max(shakeAmt, last ? 18 : 9); cam.kick = 1; }
  hitStop = Math.max(hitStop, last ? 110 : 40);
  jGold(x, y, last ? 14 : 4); hitSound(last ? 1.4 : 0.8); sfx("swing");
  if (last) {
    jvAdd("sphere", { x, y, R: 74, col: "#ffd54a", dark: "#5a3a0c", dur: 560 }); jvAdd("gring", { x: MON_X - 6, gy: GROUND - 2, R: 130, col: "#ffd54a", dur: 480 });
    screenFlash = Math.max(screenFlash, 0.35); flashCol = "#ffd54a"; slowMo = Math.max(slowMo, 240); triggerImpactFrame(x, y, true); addFloat(x - 20, y - 56, "실적 달성!", "#ffd54a", 30, true);
  }
  hit(st.dps * 4 * (crit ? 1.5 : 1), last || crit, "skill", x, y);
}
function hotfixHit(b, st, last, i) {
  if (!mon || mon.dying) return;
  jvAdd("sphere", { x: b.x, y: b.ty, R: last ? 62 : 30, col: b.col, dark: "#06263a", dur: last ? 540 : 340 });
  if (i % 2 === 0 || last) jvAdd("shards", { x: b.x, gy: GROUND - 2, n: last ? 8 : 5, col: "#c9f2ff", dark: "#2b8fb8", h: last ? 60 : 34, spread: last ? 110 : 54, dur: 480 });
  jvAdd("star", { x: b.x + 14, y: b.ty - 22, r: 5, col: b.col, dur: 320 });
  for (let k = 0; k < 3; k++) jobParts.push({ kind: "digit", s: Math.random() < 0.5 ? "0" : "1", c: b.col, x: b.x, y: b.ty, vx: (Math.random() - .5) * 5, vy: -2 - Math.random() * 3, g: 0.2, life: 1, dur: 700 });
  if (!reduceMotion) shakeAmt = Math.max(shakeAmt, last ? 14 : 6);
  hitSound(last ? 1.2 : 0.6); sfx("zap");
  if (last) { jvAdd("gring", { x: MON_X - 6, gy: GROUND - 2, R: 120, col: "#6fd3ff", dur: 460 }); screenFlash = Math.max(screenFlash, 0.3); flashCol = "#6fd3ff"; addFloat(MON_X - 30, b.ty - 60, "배포 완료 ✓", "#7fe3a0", 28, true); }
  hit(st.dps * 1.8, last, "skill", b.x, b.ty);
}
function loopBolt(f, k) {
  if (!mon || mon.dying) return;
  const [x, y] = monHitPoint(), x0 = MON_X - 8 + (Math.random() - .5) * 100, col = k % 2 ? "#6fd3ff" : "#c9a6ff";
  jvStrike(x0, f.cy, x, y, col, 5, 0, { halo: false, shards: false, sy: y, R: 20, dur: 380, shake: 5, hs: 0.5, cc: "#e6f6ff", onHit: () => {
    if (!mon || mon.dying) return;
    const st = stats(), crit = Math.random() < st.crit;
    sfx("zap"); hit(st.atk * 3 * (crit ? st.critMul : 1), crit, "skill", x, y);
  } });
}
function pptHit(s, st) {
  if (!mon || mon.dying) return;
  jvAdd("star", { x: s.tx, y: s.ty - 6, r: 4, col: "#ff9bb0", dur: 260, rise: 6 }); sfx("toss");
  hit(st.dps * 0.6, false, "skill", s.tx, s.ty);
}
function beamTick(st, k) {
  if (!mon || mon.dying) return;
  const [x, y] = monHitPoint(0.5);
  jSparks(x - 10, y, k % 2 ? "#ffffff" : "#ff9bb0", 4, 14);
  if (k % 3 === 0) jvAdd("star", { x: x + (Math.random() - .5) * 50, y: y + (Math.random() - .5) * 50, r: 6, col: "#ff9bb0", dur: 300 });
  if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 4);
  if (k % 4 === 0) hitSound(0.7);
  hit(st.dps * 1.5, k % 5 === 4, "skill", x - 8, y + (Math.random() - .5) * 20);
}

/* ---------- 움직임 ---------- */
function jobPhys(dt) {
  for (const f of jobFx) {
    f.t += dt;
    if (f.ev) for (const e of f.ev) if (!e.done && f.t >= e.at) { e.done = true; try { e.fn(); } catch (err) {} }
    if (f.kind === "meeting") crewStep(f, dt);
    else if (f.kind === "goldrain") {   // 계약 성사 8초: 0.8초마다 황금 창
      f.acc += dt;
      if (f.acc >= 800 && f.t < f.dur - 300) {
        f.acc -= 800;
        if (mon && !mon.dying) {
          const x = MON_X - 54 + Math.random() * 90;
          jvStrike(x + (Math.random() - .5) * 36, 24 + Math.random() * 44, x, GROUND - 2, "#ffd54a", 5.5, 0, { rx: 22, ry: 5, R: 24, sh: 38, dur: 640, shake: 6, hs: 0.7, onHit: () => { if (!mon || mon.dying) return; const s2 = stats(); hit(s2.atk * 1.5 * s2.critMul, true, "skill", x, GROUND - 44); jGold(x, GROUND - 30, 3); } });
        }
      }
    }
  }
  jobFx = jobFx.filter(f => f.t < f.dur);
  for (const p of jobProj) { p.t += dt; if (!p.done && p.t >= p.dur) { p.done = true; projLand(p); } }
  jobProj = jobProj.filter(p => !p.done);
  const k = dt / 16;
  for (const q of jobParts) {
    q.x += q.vx * k; q.y += q.vy * k; q.vy += (q.g || 0) * k; q.rot = (q.rot || 0) + (q.vr || 0) * k;
    if (q.bounce && q.y > GROUND - 4) { q.y = GROUND - 4; q.vy *= -0.32; q.vx *= 0.6; q.bounce--; }
    q.life -= dt / (q.dur || 900);
  }
  jobParts = jobParts.filter(q => q.life > 0); if (jobParts.length > 110) jobParts.splice(0, jobParts.length - 110);
  if (jobFx.length > 160) jobFx.splice(0, jobFx.length - 160);
  if (jobCut) { jobCut.t += dt; if (jobCut.t >= jobCut.dur) jobCut = null; }
  if (jobGlitch > 0) jobGlitch = Math.max(0, jobGlitch - dt);
  if (jobMarks.m && jobMarks.m !== mon) { jobMarks.m = null; jobMarks.n = 0; jobMarks.pos = []; }
  const j = curJob();   // 주인공 둘레에 직무 색 입자가 가끔 피어오름
  if (j && !reduceMotion) {
    jobAmbT += dt;
    if (jobAmbT > 300) {
      jobAmbT = 0;
      const x = heroHand.x - 50 + Math.random() * 50, y = GROUND - 20 - Math.random() * 60;
      if (j.id === "dev") jobParts.push({ kind: "digit", s: Math.random() < 0.5 ? "0" : "1", c: "#6fd3ff", x, y, vx: 0, vy: -0.7, g: 0, life: 1, dur: 1200, amb: 1 });
      else jobParts.push({ kind: "dot", c: j.id === "sales" ? "#ffd54a" : j.id === "plan" ? "#ff9bb0" : "#a8f0c6", x, y, vx: (Math.random() - .5) * 0.3, vy: -0.6, g: 0, life: 1, dur: 1100, s: 3, amb: 1 });
    }
  }
}
function crewStep(f, dt) {
  const st = stats();
  f.crew.forEach(c => {
    c.hop = Math.max(0, c.hop - dt / 240);
    if (c.bub > 0) c.bub -= dt;
    if (f.t < c.wait) { c.hide = true; return; }
    c.hide = false;
    if (f.t < 850 + c.wait) { const was = Math.abs(c.tx - c.x) > 4; c.x += (c.tx - c.x) * Math.min(1, dt / 170); c.run = true; if (was && Math.abs(c.tx - c.x) <= 4) addDust(c.x + 8, GROUND - 3, 2, -1, false); return; }
    if (f.t > f.dur - 700) { c.x -= dt * 0.55; c.run = true; c.back = true; return; }
    c.run = false; c.cd -= dt;
    if (c.cd <= 0 && mon && !mon.dying && spawnWait <= 0) {
      c.cd = 650 + Math.random() * 450; c.hop = 1;
      const [x, y] = monHitPoint();
      hit(st.atk * 0.9, false, "pet", x, y);
      if (Math.random() < 0.3) jvAdd("star", { x, y, r: 4, col: "#a8f0c6", dur: 240, rise: 4 });
      if (Math.random() < 0.16) { c.bub = 900; c.say = CREW_TALK[Math.floor(Math.random() * CREW_TALK.length)]; }
    }
  });
}

/* ---------- 그리기 (전투 화면 · 월드 좌표) ---------- */
function jPath(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); }
function jBolt(pts, col, a, w) {
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a; ctx.lineJoin = "miter"; jPath(pts);
  ctx.strokeStyle = hexA(col, 0.4); ctx.lineWidth = w * 2.6; ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = Math.max(1.2, w * 0.36); ctx.stroke();
  ctx.restore();
}
function jSeal(x, y, r, rot, a, txt) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.globalAlpha = a;
  ctx.strokeStyle = "#e0262c"; ctx.lineWidth = Math.max(1.5, r * 0.18); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#e0262c"; ctx.font = `${Math.round(r * 1.05)}px "Do Hyeon", sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt || "인", 0, r * 0.08);
  ctx.restore();
}
function jSlide(x, y, rot, chart, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(10,12,22,.6)"; ctx.fillRect(-10, -6, 22, 16);
  ctx.fillStyle = "#f4f6fb"; ctx.fillRect(-11, -8, 22, 16);
  ctx.fillStyle = "#ff4d6d"; ctx.fillRect(-11, -8, 22, 3.5);
  if (chart === 0) { ctx.fillStyle = "#7c5cff"; ctx.fillRect(-7, 2, 3, 4); ctx.fillRect(-2, -1, 3, 7); ctx.fillRect(3, -3, 3, 9); }
  else if (chart === 1) { ctx.fillStyle = "#6fd3ff"; ctx.beginPath(); ctx.moveTo(0, 2); ctx.arc(0, 2, 5, -1.2, 2.6); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#ffd54a"; ctx.beginPath(); ctx.moveTo(0, 2); ctx.arc(0, 2, 5, 2.6, 5.1); ctx.closePath(); ctx.fill(); }
  else { ctx.strokeStyle = "#2f8a4a"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(-3, 1); ctx.lineTo(1, 3); ctx.lineTo(8, -4); ctx.stroke(); }
  ctx.restore();
}
var JFX_DRAW = {
  /* 범용 조각 */
  sphere(f) { jvSphere(f.x, f.y, f.R, f.col, f.t / f.dur, f.seed, f.dark); },
  shards(f) { jvShards(f.x, f.gy, f.n, f.col, f.dark, f.t / f.dur, f.seed, f.h, f.spread); },
  star(f) { const k = f.t / f.dur; jvStar(f.x, f.y - k * (f.rise == null ? 12 : f.rise), f.r * (1 - 0.35 * k) * (k < 0.15 ? k / 0.15 : 1), f.col, 1 - k * k, f.tall || 1.7, f.rot || 0); },
  slash(f) { const k = f.t / f.dur; jvCrescent(f.x + k * (f.drift || 0), f.y, f.r * (0.85 + 0.25 * k), f.ang, f.col, 1 - k * k, f.th, f.span); },
  crackle(f) { jvCrackle(f.x, f.y, f.r, f.col, 1 - f.t / f.dur, f.seed + Math.floor(f.t / 50)); },
  gring(f) { const k = f.t / f.dur; jvHalo(f.x, f.gy, f.R * (0.3 + 0.9 * k), f.R * 0.16 * (0.3 + 0.9 * k), f.col, 1 - k, 0); },
  lspear(f) {
    const k = f.t / f.dur, hk = Math.min(1, k / 0.16), ext = k < 0.16 ? 0 : Math.min(1, (k - 0.16) / 0.12), fade = k < 0.3 ? 1 : Math.max(0, 1 - (k - 0.3) / 0.7);
    if (f.halo) jvHalo(f.x0, f.y0, f.rx * (0.55 + 0.45 * hk), f.ry * (0.55 + 0.45 * hk), f.col, k < 0.7 ? hk : Math.max(0, 1 - (k - 0.7) / 0.3), f.t / 400);
    if (ext > 0) { const ex = f.x0 + (f.x1 - f.x0) * ext, ey = f.y0 + (f.y1 - f.y0) * ext; jvBlade(f.x0, f.y0, ex, ey, f.w * (0.45 + 0.55 * fade), f.col, fade, f.seed, 0.35, 0.62); }
    if (f.halo && k > 0.05 && k < 0.6) jvStar(f.x0 + 10, f.y0 - f.ry * 3 - 8, 4 + 2 * Math.sin(k * 9), f.col, (0.6 - k) * 1.6, 2.2);
  },
  chain(f) { const a = 1 - f.t / f.dur; f.segs.forEach(s => jBolt(s, "#6fd3ff", a, 4)); },
  pointer(f) {
    const k = f.t / f.dur, a = 1 - k, ang = Math.atan2(f.y1 - f.y0, f.x1 - f.x0);
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
    const line = () => { ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.lineTo(f.x1, f.y1); ctx.stroke(); };
    ctx.globalAlpha = a * 0.35; ctx.strokeStyle = "#ff3b5a"; ctx.lineWidth = f.snipe ? 13 : 7; line();
    ctx.globalAlpha = a; ctx.lineWidth = f.snipe ? 4.5 : 2.2; line();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = f.snipe ? 1.8 : 1; line();
    ctx.restore();
    jvCrescent(f.x0 + Math.cos(ang) * 9, f.y0 + Math.sin(ang) * 9, f.snipe ? 12 : 8, ang, "#ff7a9a", a, f.snipe ? 4 : 2.6, 1.1);
    if (f.snipe) { jvCrescent(f.x0 + Math.cos(ang) * 22, f.y0 + Math.sin(ang) * 22, 17, ang, "#ff7a9a", a * 0.8, 4, 1.1); jvCircle(f.x1, f.y1, 36 - 20 * Math.min(1, k / 0.5), k * 3, "#ff3b5a", a, 1, 1, 4, null); }
    jvStar(f.x1, f.y1, f.snipe ? 9 : 6, "#ff9bb0", a, 0.55, ang);
  },
  splat(f) {
    const k = f.t / f.dur, a = 1 - k;
    ctx.globalAlpha = a; ctx.fillStyle = "#e0262c";
    ctx.beginPath(); ctx.arc(f.x, f.y, 6 + k * 10, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 7; i++) { const an = f.seed + i * 0.9, d = 10 + k * 26; ctx.beginPath(); ctx.arc(f.x + Math.cos(an) * d, f.y + Math.sin(an) * d * 0.8, 2.6 * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  },
  /* 영업 */
  dash(f) {
    const look = heroLook(), hs = 3.5;
    f.hits.forEach(h => {
      const k = (f.t - h.t) / 320; if (k < 0 || k >= 1) return;
      const left = h.i % 2 === 0, gx = left ? MON_X - 150 + k * 40 : MON_X + 40 - k * 40, gy = GROUND - 24 * hs;
      ctx.globalAlpha = 0.5 * (1 - k);
      drawSprite(ctx, look.map, look.pal, gx, gy, hs, { pretty: true, solid: "#ffd54a", flip: !left });
      ctx.globalAlpha = 1;
      jvBlade(left ? MON_X - 170 : MON_X + 90, h.y, left ? MON_X + 80 : MON_X - 160, h.y + (left ? -8 : 8), 5, "#ffd54a", 0.8 * (1 - k), h.i * 7, 0.15, 0.7);
    });
  },
  contract(f) {
    const { h: mh } = msz(), k = Math.min(1, f.t / 420), e = 1 - Math.pow(1 - k, 3);
    const x = MON_X - 40, y = -110 + (GROUND - mh * 0.62 - 50 + 110) * e, a = f.t > 1150 ? Math.max(0, 1 - (f.t - 1150) / 350) : 1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08 + (1 - e) * 0.5); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(10,12,22,.55)"; ctx.fillRect(4, 6, 80, 98);
    ctx.fillStyle = "#fbf8ef"; ctx.fillRect(0, 0, 80, 98);
    ctx.fillStyle = "#1b1f2a"; ctx.font = '14px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("계 약 서", 40, 13);
    ctx.fillStyle = "#b9c1d6"; for (let i = 0; i < 6; i++) ctx.fillRect(10, 28 + i * 9, i === 5 ? 34 : 60, 2.5);
    ctx.strokeStyle = "#2b3655"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(12, 88); ctx.bezierCurveTo(20, 78, 26, 96, 34, 84); ctx.bezierCurveTo(40, 78, 44, 92, 52, 86); ctx.stroke();
    if (f.t > 650) { const p = Math.min(1, (f.t - 650) / 110); ctx.save(); ctx.translate(62, 80); ctx.scale(1.8 - 0.8 * p, 1.8 - 0.8 * p); jSeal(0, 0, 13, -0.2, a, "계약"); ctx.restore(); }
    ctx.restore(); ctx.globalAlpha = 1;
    if (f.t > 650 && f.t < 1100) jvStar(x + 70, y + 64, 10 * (1 - (f.t - 650) / 450), "#ffd54a", 1, 1.8);
  },
  goldrain(f) {
    const a = Math.min(1, f.t / 300, (f.dur - f.t) / 500) * 0.14;
    const gr = ctx.createLinearGradient(0, 0, 0, GROUND); gr.addColorStop(0, `rgba(255,213,74,${a})`); gr.addColorStop(1, "rgba(255,213,74,0)");
    ctx.fillStyle = gr; ctx.fillRect(MON_X - 130, 0, 220, GROUND);
  },
  /* 개발 */
  hotfix(f) {
    f.blocks.forEach(b => {
      const k = (f.t - b.at) / 230; if (k < 0 || k > 1) return;
      const e = k * k, x = b.sx + (b.x - b.sx) * e, y = b.sy + (b.ty - b.sy) * e, ang = Math.atan2(b.ty - b.sy, b.x - b.sx);
      jvComet(x, y, ang, 110, 12, b.col, 1, b.seed);
      ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = "rgba(4,10,20,.85)"; ctx.fillRect(x - 17, y - 26, 34, 16); ctx.strokeStyle = b.col; ctx.lineWidth = 1.6; ctx.strokeRect(x - 17, y - 26, 34, 16);
      ctx.fillStyle = "#e6f6ff"; ctx.font = '11px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(b.g, x, y - 17.5); ctx.restore();
    });
  },
  loop(f) {
    const a = Math.min(1, f.t / 300, (f.dur - f.t) / 400), cx = MON_X - 8;
    jvCircle(cx, f.cy, 68, f.t / 650, "#6fd3ff", a, 1, 0.32, 6, ["0", "1", "{", "}", "0", "1", "<", ">"]);
    jvCircle(cx, f.cy, 44, -f.t / 420, "#c9a6ff", a * 0.9, 1, 0.32, 5, null);
    if (mon) { const { h: mh } = msz(); ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.18 * a; ctx.fillStyle = "#6fd3ff"; ctx.beginPath(); ctx.moveTo(cx - 60, f.cy); ctx.lineTo(cx + 60, f.cy); ctx.lineTo(cx + 40, GROUND - 4); ctx.lineTo(cx - 40, GROUND - 4); ctx.closePath(); ctx.fill(); ctx.restore(); }
  },
  /* 기획 */
  ppt(f) {
    const ox = mon ? mon.kb * 26 : 0;
    f.slides.forEach(s => {
      const k = (f.t - s.at) / 230; if (k < 0) return;
      const fade = f.t > f.dur - 500 ? Math.max(0, (f.dur - f.t) / 500) : 1;
      if (k < 1) {
        const x0 = heroHand.x, y0 = heroHand.y - 14, x = x0 + (s.tx - x0) * k, y = y0 + (s.ty - y0) * k - Math.sin(k * Math.PI) * s.arc;
        const k2 = Math.max(0, k - 0.12), px = x0 + (s.tx - x0) * k2, py = y0 + (s.ty - y0) * k2 - Math.sin(k2 * Math.PI) * s.arc;
        jvComet(x, y, Math.atan2(y - py, x - px), 34, 4, "#ff7a9a", 0.8, s.at);
        jSlide(x, y, k * s.spin, s.chart, 1);
      } else jSlide(s.tx + ox, s.ty, s.tilt, s.chart, fade);
    });
    ctx.globalAlpha = 1;
  },
  reticle(f) {
    if (!mon || mon.dying) return;
    const { h: mh } = msz(), cx = MON_X - 6 + mon.kb * 26, cy = GROUND - mh * 0.5, a = Math.min(1, f.t / 250, (f.dur - f.t) / 500);
    const R = Math.max(40, mh * 0.62) + 3 * Math.sin(f.t / 120);
    jvCircle(cx, cy, R, f.t / 1400, "#ff3b5a", a * 0.85, 1, 1, 4, ["Q1", "Q2", "Q3", "Q4", "KPI", "ROI"]);
    ctx.save(); ctx.globalAlpha = a; ctx.font = '14px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const txt = `약점 노출 +50% · ${Math.ceil((f.dur - f.t) / 1000)}초`; ctx.lineWidth = 4; ctx.strokeStyle = "#1b0a10"; ctx.strokeText(txt, cx, cy - R - 12); ctx.fillStyle = "#ff9bb0"; ctx.fillText(txt, cx, cy - R - 12);
    ctx.restore();
  },
  beam(f) {
    const x0 = heroHand.x + 10, y0 = heroHand.y - 8, { h: mh } = msz(), tx = MON_X - 10, ty = GROUND - mh * 0.5, ang = Math.atan2(ty - y0, tx - x0);
    const ca = Math.cos(ang), sa = Math.sin(ang), gk = Math.min(1, f.t / 520), end = f.t > 2540 ? Math.max(0, 1 - (f.t - 2540) / 240) : 1;
    // 팔 앞에 겹겹이 선 마법 고리 (옆에서 본 원)
    [[14, 17], [32, 25], [54, 33]].forEach(([d, r], i) => jvCircle(x0 + ca * d, y0 + sa * d, r * gk, f.t / (300 + i * 90), i === 1 ? "#ffd1dc" : "#ff7a9a", end, 0.36, 1, 5, null));
    if (f.t < 540) {   // 모으기
      const R = 4 + 16 * gk;
      const gr = ctx.createRadialGradient(x0, y0, 1, x0, y0, R * 2.2); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.4, "rgba(255,77,109,.8)"); gr.addColorStop(1, "rgba(255,77,109,0)");
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = gr; ctx.fillRect(x0 - R * 2.2, y0 - R * 2.2, R * 4.4, R * 4.4); ctx.restore();
      for (let i = 0; i < 9; i++) { const an = i * 0.7 + f.t / 140, d = 70 * (1 - ((f.t / 540 + i * 0.11) % 1)); jvStar(x0 + Math.cos(an) * d, y0 + Math.sin(an) * d, 3, "#ff9bb0", 0.9, 1.4); }
      return;
    }
    const bt = f.t - 540, w = (24 + 6 * Math.sin(bt / 45)) * end, len = 660;
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang); ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.18 * end; ctx.fillStyle = "#ff4d6d"; ctx.fillRect(0, -w * 2, len, w * 4);
    ctx.globalAlpha = 0.3 * end; ctx.fillRect(0, -w * 1.3, len, w * 2.6);
    ctx.globalAlpha = 0.9 * end; ctx.fillStyle = "#ff7a9a"; ctx.fillRect(0, -w * 0.62, len, w * 1.24);
    ctx.globalAlpha = end; ctx.fillStyle = "#ffffff"; ctx.fillRect(0, -w * 0.22, len, w * 0.44);
    ctx.restore();
    const dist = Math.hypot(tx - x0, ty - y0);
    for (let q = 0; q < 3; q++) { const p = ((bt / 320 + q / 3) % 1), d = 24 + p * dist * 0.55; jvCrescent(x0 + ca * d, y0 + sa * d, 20 + 10 * p, ang, "#ff9bb0", end * (1 - p), 6, 1.15); }
    jvRibbon(x0, y0, tx, ty, w * 0.9, bt / 55, "#ffd1dc", end * 0.8, 3);
    jvSphere(tx, ty, 36 + 5 * Math.sin(bt / 60), "#ff7a9a", 0.3, f.seed, null);
    ctx.save(); ctx.globalAlpha = end; ctx.font = '11px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let q = 0; q < 4; q++) { const p = ((bt / 700 + q / 4) % 1) * dist, px = x0 + ca * p - sa * (w + 12), py = y0 + sa * p + ca * (w + 12) * -1; ctx.lineWidth = 3; ctx.strokeStyle = "#1b0a10"; ctx.strokeText(`Q${q + 1}`, px, py); ctx.fillStyle = "#ffd1dc"; ctx.fillText(`Q${q + 1}`, px, py); }
    ctx.restore();
  },
  /* 인사·총무 */
  meeting(f) {
    if (f.t < 1000) {   // 왼쪽 바닥에 초록 소집진
      const a = Math.min(1, f.t / 150, (1000 - f.t) / 250);
      jvCircle(80, GROUND - 4, 46, f.t / 260, "#7fe3a0", a, 1, 0.3, 6, ["회", "의", "소", "집"]);
      for (let i = 0; i < 3; i++) jvCrescent(80, GROUND - 26 - i * 10, 24 - i * 5, -Math.PI / 2 + f.t / 160 + i * 2, "#a8f0c6", a * 0.8, 5, 1.4);
    }
    f.crew.forEach((c, i) => {
      if (c.hide) return;
      const fr = c.run ? Math.floor((f.t + i * 40) / 90) % 2 : c.hop > 0 ? 1 : 0;
      const sc = 2.4, y = GROUND - 12 * sc - c.row * 7 - (c.hop > 0 ? Math.sin(c.hop * Math.PI) * 16 : 0);
      const x = c.x + (c.hop > 0 ? Math.sin(c.hop * Math.PI) * 10 : 0);
      if (c.run && !c.back) jvBlade(x - 34, y + 14, x, y + 14, 3, "#a8f0c6", 0.5, i, 0.1, 0.85);
      ctx.globalAlpha = 1;
      drawSprite(ctx, CREW_MAP[fr], c.pal, x, y, sc, { pretty: true, flip: !!c.back });
      if (c.bub > 0) {
        ctx.font = '11px "Do Hyeon", sans-serif'; const tw = (ctx.measureText ? ctx.measureText(c.say).width : 30) + 10;
        ctx.globalAlpha = Math.min(1, c.bub / 200); ctx.fillStyle = "#ffffff"; ctx.fillRect(x + 8 - tw / 2, y - 22, tw, 16);
        ctx.fillStyle = "#1b1f2a"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(c.say, x + 8, y - 14);
      }
    });
    ctx.globalAlpha = 1;
  },
  order(f) {
    const { h: mh } = msz(), kb = mon ? mon.kb * 26 : 0, cx = MON_X - 8 + kb, cy = GROUND - mh * 0.55;
    const fade = f.t > f.dur - 500 ? Math.max(0, (f.dur - f.t) / 500) : 1;
    jvCircle(MON_X - 8, GROUND - 4, 72 * Math.min(1, f.t / 300), f.t / 1500, "#ff5d5d", fade * 0.9, 1, 0.3, 5, ["인", "사", "발", "령", "인", "사", "발", "령"]);
    if (f.t > 420 && mon && !mon.dying) {
      const a = (0.45 + 0.25 * Math.sin(f.t / 110)) * fade, R = mh * 0.62;
      const gr = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.25); gr.addColorStop(0, "rgba(255,42,42,0)"); gr.addColorStop(0.75, `rgba(255,60,60,${a * 0.5})`); gr.addColorStop(1, "rgba(255,60,60,0)");
      ctx.fillStyle = gr; ctx.fillRect(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6);
      ctx.save(); ctx.font = '14px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = fade;
      const txt = `받는 피해 ×3 · ${Math.ceil((f.dur - f.t) / 1000)}초`; ctx.lineWidth = 4; ctx.strokeStyle = "#1b0606"; ctx.strokeText(txt, cx, cy - mh * 0.62 - 14); ctx.fillStyle = "#ff7a6b"; ctx.fillText(txt, cx, cy - mh * 0.62 - 14);
      ctx.restore();
    }
    const k = Math.min(1, f.t / 400), e = 1 - Math.pow(1 - k, 3);
    const x = heroHand.x - 60 + (cx - 30 - heroHand.x + 60) * e, y = 20 + (cy - 30 - 20) * e - Math.sin(e * Math.PI) * 50;
    if (k < 1) jvComet(x + 30, y + 22, Math.atan2(cy - 20, cx - heroHand.x) , 60, 6, "#ff7a6b", 0.8, f.seed);
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - e) * 6 - 0.12); ctx.globalAlpha = fade;
    ctx.fillStyle = "rgba(10,12,22,.55)"; ctx.fillRect(3, 4, 60, 44);
    ctx.fillStyle = "#fbf8ef"; ctx.fillRect(0, 0, 60, 44);
    ctx.fillStyle = "#e0403d"; ctx.fillRect(0, 0, 60, 11);
    ctx.fillStyle = "#ffffff"; ctx.font = '10px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("인 사 발 령", 30, 6);
    ctx.fillStyle = "#1b1f2a"; ctx.font = '8px "Do Hyeon", sans-serif'; ctx.fillText(f.dest, 26, 22);
    ctx.fillStyle = "#b9c1d6"; ctx.fillRect(6, 30, 34, 2); ctx.fillRect(6, 36, 26, 2);
    if (f.t > 430) { const p = Math.min(1, (f.t - 430) / 110); ctx.save(); ctx.translate(48, 34); ctx.scale(2 - p, 2 - p); jSeal(0, 0, 9, -0.25, fade, "발령"); ctx.restore(); }
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
function drawJobFx(t) {
  if (!jobFx.length && !jobProj.length && !jobParts.length && !(jobMarks.m && jobMarks.n)) return;
  ctx.save();
  if (jobMarks.m && jobMarks.m === mon && !mon.dying && jobMarks.n) {   // 인주 자국 (적 몸에 남음)
    const { w: mw, h: mh } = msz(), ox = MON_X + mon.kb * 26;
    jobMarks.pos.forEach(p => jSeal(ox + p[0] * mw, GROUND - p[1] * mh, 8, p[2], 0.82, "인"));
  }
  for (const f of jobFx) { if (f.t < 0) continue; const d = JFX_DRAW[f.kind]; if (d) { try { d(f, t); } catch (e) { jobFxErr = f.kind + ": " + e; } } }
  for (const p of jobProj) {
    const k = Math.min(1, p.t / p.dur);
    if (p.kind === "code") {
      const x = p.x0 + (p.tx - p.x0) * k, y = p.y0 + (p.ty - p.y0) * k - Math.sin(k * Math.PI) * 8, ang = Math.atan2(p.ty - p.y0, p.tx - p.x0);
      jvComet(x, y, ang, 54, p.crit ? 8 : 6, p.chain ? "#ff6bd6" : "#6fd3ff", 1, p.seed);
      ctx.globalAlpha = 1; ctx.fillStyle = "#e6f6ff"; ctx.font = '10px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(p.g, x - 18, y - 12);
    } else if (p.kind === "stamp") {
      const x = p.x0 + (p.tx - p.x0) * k, y = p.y0 + (p.ty - p.y0) * k - Math.sin(k * Math.PI) * 46;
      const k2 = Math.max(0, k - 0.15), px = p.x0 + (p.tx - p.x0) * k2, py = p.y0 + (p.ty - p.y0) * k2 - Math.sin(k2 * Math.PI) * 46;
      jvComet(x, y, Math.atan2(y - py, x - px), 32, 5, "#7fe3a0", 0.75, p.seed);
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot + k * 10);
      ctx.fillStyle = "#8a5a3a"; ctx.fillRect(-4, -14, 8, 12); ctx.fillStyle = "#c98a5a"; ctx.fillRect(-6, -18, 12, 6);
      ctx.fillStyle = "#e0403d"; ctx.fillRect(-9, -3, 18, 8); ctx.fillStyle = "#a8202a"; ctx.fillRect(-9, 3, 18, 2);
      ctx.restore();
    }
  }
  for (const q of jobParts) {
    const a = Math.max(0, Math.min(1, q.life * (q.amb ? 1.4 : 2.2)));
    if (q.kind === "coin") { const w = Math.max(1, Math.abs(Math.cos(q.rot)) * 7); ctx.globalAlpha = a; ctx.fillStyle = "#b8860b"; ctx.fillRect(q.x - w / 2 - 1, q.y - 8, w + 2, 16); ctx.fillStyle = "#ffd54a"; ctx.fillRect(q.x - w / 2, q.y - 7, w, 14); if (w > 4) { ctx.fillStyle = "#fff7c2"; ctx.fillRect(q.x - w / 2 + 1, q.y - 5, 2, 5); } }
    else if (q.kind === "digit") { ctx.globalAlpha = a * (q.amb ? 0.6 : 1); ctx.fillStyle = q.c; ctx.font = '12px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(q.s, q.x, q.y); }
    else { ctx.globalAlpha = a * (q.amb ? 0.7 : 1); ctx.fillStyle = q.c; ctx.fillRect(q.x - (q.s || 4) / 2, q.y - (q.s || 4) / 2, q.s || 4, q.s || 4); }
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
/* 주인공 뒤 직무 색 빛 (사장이면 네 색 점이 둘레를 돎) */
function drawJobAura(t, hx, hy) {
  const j = curJob(); if (!j) return;
  const cx = hx + 36, cy = hy + 46, R = 64, a = 0.14 + 0.05 * Math.sin(t / 320);
  const gr = ctx.createRadialGradient(cx, cy, 6, cx, cy, R); gr.addColorStop(0, hexA(j.col, a)); gr.addColorStop(1, hexA(j.col, 0));
  ctx.fillStyle = gr; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  if (isCEO()) JOBS.forEach((jj, i) => { const an = t / 800 + i * Math.PI / 2; ctx.fillStyle = hexA(jj.col, 0.85); ctx.fillRect(cx + Math.cos(an) * 42 - 2.5, cy - 24 + Math.sin(an) * 12 - 2.5, 5, 5); });
}
/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */
function drawJobUi(t) {
  if (jobGlitch > 0 && !reduceMotion) {
    ctx.save();
    try {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (Math.random() < 0.45) { const y = Math.floor(Math.random() * CSH * 0.92), h = Math.ceil(CSH * (0.012 + Math.random() * 0.03)), dx = Math.round((Math.random() - .5) * CSW * 0.05); ctx.drawImage(cv, 0, y, CSW, h, dx, y, CSW, h); }
    } catch (e) {}
    uiApply();
    ctx.globalAlpha = 0.08; ctx.fillStyle = "#000000"; for (let y = 0; y < UH; y += 6) ctx.fillRect(0, y, UW, 2);
    for (let i = 0; i < 2; i++) if (Math.random() < 0.5) { ctx.globalAlpha = 0.14; ctx.fillStyle = i ? "#ff2a6b" : "#2ad4ff"; ctx.fillRect(0, Math.random() * UH, UW, 2 + Math.random() * 6); }
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t / 50); ctx.font = '15px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const txt = `while (true) { 번개(); }  ${Math.ceil(jobGlitch / 1000)}`; ctx.lineWidth = 4; ctx.strokeStyle = "#0a0614"; ctx.strokeText(txt, UW / 2, UH - 22); ctx.fillStyle = "#c9a6ff"; ctx.fillText(txt, UW / 2, UH - 22);
    ctx.restore();
  }
  if (jobCut) {
    const c = jobCut, k = c.t / c.dur, inK = Math.min(1, k / 0.16), outK = k > 0.8 ? (k - 0.8) / 0.2 : 0;
    const x = Math.pow(1 - inK, 3) * UW * 0.9 - outK * UW * 1.1, y = UH * 0.26, h = 42;
    ctx.save(); ctx.translate(x, 0); ctx.globalAlpha = 1 - outK * 0.5;
    ctx.fillStyle = "rgba(8,10,20,.84)"; ctx.beginPath(); ctx.moveTo(-10, y - h / 2); ctx.lineTo(UW + 30, y - h / 2); ctx.lineTo(UW + 10, y + h / 2); ctx.lineTo(-30, y + h / 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.col; ctx.fillRect(-10, y - h / 2, UW + 40, 2.5); ctx.fillRect(-30, y + h / 2 - 2.5, UW + 40, 2.5);
    ctx.globalAlpha *= 0.35; for (let i = 0; i < 6; i++) { const lx = ((t * 0.7 + i * 131) % (UW + 160)) - 80; ctx.fillRect(UW - lx, y - h / 2 + 7 + i * 5.5, 30 + i * 8, 1.4); }
    ctx.globalAlpha = 1 - outK * 0.5;
    jvCircle(42, y, 17, t / 300, c.col, 1 - outK, 1, 1, 5, null);
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.font = '11px "Do Hyeon", sans-serif'; ctx.fillStyle = c.col; ctx.fillText(c.team, 70, y - 11);
    ctx.font = '23px "Do Hyeon", sans-serif'; ctx.lineWidth = 5; ctx.strokeStyle = "#05070d"; ctx.strokeText(c.name, 70, y + 7); ctx.fillStyle = "#ffffff"; ctx.fillText(c.name, 70, y + 7);
    ctx.restore();
  }
}

/* ---------- 전설 무기: 그 자리에서 해금 ---------- */
function legLockInfo(k) {
  const req = legReq(k), prev = k === 0 || !!S.legUnlock[k - 1];
  const ns = Math.max(0, req.silver - S.silver), na = Math.max(0, req.ame - S.ame), ok = prev && !ns && !na;
  const short = !prev ? "앞 전설 먼저" : ok ? "해금 가능" : [ns ? `은괴 ${ns}` : "", na ? `자수정 ${na}` : ""].filter(Boolean).join(" · ") + " 부족";
  const why = !prev ? `앞 전설 무기(${WEAPONS[LEG_START + k - 1].n})를 먼저 해금해요` : `은괴 ${req.silver} · 자수정 ${req.ame} 필요 (지금 ${S.silver} · ${S.ame}) · 공부 탭에서 캐요`;
  return { req, ok, prev, short, why };
}
function legUnlockTry(k) {
  if (S.legUnlock[k]) return true;
  const lk = legLockInfo(k), i = LEG_START + k, w = WEAPONS[i];
  if (!lk.ok) { toast(lk.prev ? `${w.n}: ${lk.short} · 공부 탭 타이머로 광산을 파면 7m마다 은괴, 21m마다 자수정이 나와요` : `${w.n}: ${lk.why}`); return false; }
  S.silver -= lk.req.silver; S.ame -= lk.req.ame; S.legUnlock[k] = true;
  sfx("bigup"); celebrate({ icon: weaponBig(i, 5), title: "전설 무기 해금!", sub: `${w.n} · 이제 월급으로 살 수 있어요`, tone: "rare" });
  return true;
}
