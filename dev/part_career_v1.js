/* ===================== 승진 · 직무 =====================
   직급 10단계는 퇴사해도 남는 경력. 최고층·말씀 누적·공부 누적(과장부터 퇴사 횟수) 조건을 채우고 '승진 심사'를 누르면 승진식.
   대리·과장·부장에서 직무를 하나씩 고르고, 사장이 되면 넷째 직무가 열리며 네 직무의 특징(패시브)이 한꺼번에 적용된다.
   직무마다 기본 공격 모양·패시브·직무 스킬 2개가 다르다. 직무 스킬 버튼은 전투 화면 왼쪽 위(자동 스킬도 씀).
   merge·stats 에서 부를 수 있게 함수 선언과 var 만 씀. */
var RANKS = [
  { n: "사원" },
  { n: "주임", req: { floor: 50, chap: 5, study: 1 } },
  { n: "대리", req: { floor: 150, chap: 20, study: 3 }, job: true },
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
  deal: { id: "j_deal", key: "deal", job: "sales", n: "계약 성사", cd: 70, dur: 8, ic: "jsk_deal", d: "금화 비 + 8초 동안 모든 공격이 치명타" },
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
var heroHand = { x: 388, y: 276 };
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
  c.className = "pix"; c.width = Wc * d; c.height = Hc * d; if (c.style) { c.style.width = Wc + "px"; c.style.height = Hc + "px"; }
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

/* ---------- 기본 공격: 직무마다 다른 모양 ---------- */
function jSparks(x, y, col, n, spd) { if (reduceMotion) n = Math.ceil(n / 2); spd = spd || 10; for (let i = 0; i < n; i++) sparks.push({ x, y, vx: (Math.random() - .45) * spd, vy: (Math.random() - .65) * spd, life: 1, c: col, line: true }); }
function jGold(x, y, n) { for (let i = 0; i < n; i++) jobParts.push({ kind: "coin", x: x + (Math.random() - .5) * 20, y, vx: (Math.random() - .25) * 7, vy: -3 - Math.random() * 6, g: 0.42, life: 1, dur: 950, vr: 0.3 + Math.random() * 0.3, rot: Math.random() * 6, bounce: 1 }); jSparks(x, y, "#ffd54a", Math.ceil(n * 0.8)); }
function monHitPoint(fy) { const { h: mh } = msz(); return [MON_X - 14 + (Math.random() - .5) * 18, GROUND - mh * (fy == null ? 0.3 + Math.random() * 0.45 : fy)]; }
function jobStrike(st, crit) {
  const j = curJob(); if (!j || !mon || mon.dying) return false;
  jobHitN++;
  const dmg = st.atk * (crit ? st.critMul : 1);
  if (j.id === "sales") {
    const [x, y] = monHitPoint(0.5);
    jobFx.push({ kind: "garc", t: 0, dur: 210, x, y, crit, flip: jobHitN % 2 });
    if (crit) { jGold(x, y - 10, 6); addFloat(x - 40, y - 46, "계약!", "#ffd54a", 22, true); sfx("coin"); }
    return false;   // 원래 근접 타격 그대로
  }
  if (j.id === "dev") {
    const [tx, ty] = monHitPoint();
    jobProj.push({ kind: "code", x0: heroHand.x + 8, y0: heroHand.y - 6, tx, ty, t: 0, dur: 105, dmg, crit, chain: jobHitN % 4 === 0, atk: st.atk, g: CODE_GLYPHS[jobHitN % CODE_GLYPHS.length], m: mon });
    sfx("pew"); return true;
  }
  if (j.id === "plan") {
    const snipe = jobHitN % 5 === 0, [tx, ty] = monHitPoint(snipe ? 0.62 : null);
    jobFx.push({ kind: "pointer", t: 0, dur: snipe ? 300 : 130, x0: heroHand.x + 6, y0: heroHand.y - 4, x1: tx, y1: ty, snipe });
    hit(dmg * (snipe ? 3 : 1), crit || snipe, "jhero", tx, ty);
    if (snipe) { addFloat(tx - 6, ty - 34, "약점!", "#ff7a9a", 24, true); triggerImpactFrame(tx, ty); sfx("zap"); }
    else sfx("pew");
    return true;
  }
  if (j.id === "hr") {
    const [tx, ty] = monHitPoint();
    jobProj.push({ kind: "stamp", x0: heroHand.x, y0: heroHand.y - 10, tx, ty, t: 0, dur: 165, dmg, crit, m: mon, rot: Math.random() * 6 });
    sfx("toss"); return true;
  }
  return false;
}
function projLand(p) {
  if (!mon || mon !== p.m || mon.dying || spawnWait > 0) return;
  if (p.kind === "code") {
    jSparks(p.tx, p.ty, p.crit ? "#ffffff" : "#6fd3ff", p.crit ? 12 : 7);
    jobFx.push({ kind: "neon", t: 0, dur: 230, x: p.tx, y: p.ty, crit: p.crit });
    hit(p.dmg, p.crit, "jhero", p.tx, p.ty);
    if (p.chain && mon && !mon.dying) devChain(p.atk, p.tx, p.ty);
  } else if (p.kind === "stamp") {
    jobFx.push({ kind: "splat", t: 0, dur: 300, x: p.tx, y: p.ty, seed: Math.random() * 6 });
    jSparks(p.tx, p.ty, "#ff5d5d", 6);
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
  for (let i = 0; i < 3; i++) { const nx = MON_X - 50 + Math.random() * 90, ny = GROUND - mh * (0.12 + Math.random() * 0.8); segs.push(jBoltPts(px, py, nx, ny, 5, 18)); px = nx; py = ny; }
  jobFx.push({ kind: "chain", t: 0, dur: 260, segs });
  hit(atk * 4, false, "skill", px, py);
  addFloat(x - 24, y - 40, "연쇄 번개!", "#6fd3ff", 20, true); sfx("zap");
  if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 6);
}

/* ---------- 직무 스킬 8개 ---------- */
var JSK_CAST = {
  dash(st) {
    const f = { kind: "dash", t: 0, dur: 1000, ev: [], hits: [] };
    for (let i = 0; i < 5; i++) f.ev.push({ at: 80 + i * 125, fn: () => dashHit(f, i, st) });
    jobFx.push(f); sfx("whoosh"); say("이번 분기 실적, 내가 찢는다!", 2);
  },
  deal(st) {
    jobFx.push({ kind: "contract", t: 0, dur: 1300, ev: [{ at: 420, fn: () => {
      stampFx = { t: 0, kind: 2, hit: false, text: "계약", top: "계약 성사", nocam: true };
      screenFlash = Math.max(screenFlash, 0.3); flashCol = "#ffd54a"; if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 14);
      const { h: mh } = msz(); jGold(MON_X - 10, GROUND - mh * 0.6, 22); sfx("coin");
      addFloat(MON_X - 30, GROUND - mh - 30, "8초 동안 전부 치명타!", "#ffd54a", 22, true);
    } }] });
    jobFx.push({ kind: "coinrain", t: 0, dur: 8000, acc: 0 });
    say("사인만 하시면 됩니다. 쾅!", 2);
  },
  hotfix(st) {
    const f = { kind: "hotfix", t: 0, dur: 1600, blocks: [], ev: [] };
    for (let i = 0; i < 12; i++) {
      const [tx, ty] = monHitPoint(0.35 + Math.random() * 0.4);
      const b = { at: 100 + i * 80, x: tx + (Math.random() - .5) * 20, ty, g: CODE_GLYPHS[(i * 5) % CODE_GLYPHS.length], col: i % 3 === 2 ? "#ff6bd6" : "#6fd3ff", rot: (Math.random() - .5) * 0.5 };
      f.blocks.push(b); f.ev.push({ at: b.at + 250, fn: () => hotfixHit(b, st, i === 11) });
    }
    jobFx.push(f); say("배포 들어갑니다! 롤백은 없다!", 2);
  },
  loop(st) {
    const f = { kind: "loop", t: 0, dur: 6100, ev: [] };
    for (let k = 0; k < 24; k++) f.ev.push({ at: 200 + k * 245, fn: () => loopBolt(k) });
    jobFx.push(f); jobGlitch = 6000; say("while (true) { 때린다(); }", 2);
  },
  ppt(st) {
    const f = { kind: "ppt", t: 0, dur: 2600, slides: [], ev: [] };
    for (let i = 0; i < 20; i++) {
      const [tx, ty] = monHitPoint(0.15 + Math.random() * 0.75);
      const s = { at: i * 42, tx: tx + (Math.random() - .5) * 26, ty, arc: 40 + Math.random() * 70, spin: 6 + Math.random() * 8, chart: i % 3, tilt: (Math.random() - .5) * 0.9 };
      f.slides.push(s); f.ev.push({ at: s.at + 230, fn: () => pptHit(s, st) });
    }
    jobFx.push(f); jobFx.push({ kind: "reticle", t: 0, dur: 10000 });
    say("결론부터 말씀드리겠습니다.", 2);
  },
  beam(st) {
    const f = { kind: "beam", t: 0, dur: 2750, ev: [] };
    for (let k = 0; k < 20; k++) f.ev.push({ at: 520 + k * 100, fn: () => beamTick(st, k) });
    f.ev.push({ at: 2520, fn: () => { const [x, y] = monHitPoint(0.5); addExplosion(x, y, true); screenFlash = Math.max(screenFlash, 0.35); flashCol = "#ff7a9a"; if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 16); hitSound(1.4); } });
    jobFx.push(f); sfx("sizzle"); say("로드맵 나갑니다. 1분기부터 4분기까지!", 2);
  },
  meeting(st) {
    const f = { kind: "meeting", t: 0, dur: 8700, crew: [] };
    for (let i = 0; i < 8; i++) f.crew.push({ x: -40 - i * 22, tx: MON_X - 128 + (i % 4) * 24, row: i < 4 ? 0 : 1, pal: crewPals[Math.floor(Math.random() * crewPals.length)], cd: 500 + Math.random() * 600, hop: 0, bub: 0, say: "" });
    jobFx.push(f); sfx("cheer"); say("전원 3분 안에 회의실로 집합!", 2);
  },
  order(st) {
    const dest = ORDER_DEST[Math.floor(Math.random() * ORDER_DEST.length)];
    jobFx.push({ kind: "order", t: 0, dur: 8000, dest, ev: [{ at: 430, fn: () => {
      const { h: mh } = msz();
      rings.push({ x: MON_X - 6, y: GROUND - mh * 0.55, life: 1, crit: true, big: true }); addGroundFlash(MON_X, "#ff5d5d");
      screenFlash = Math.max(screenFlash, 0.3); flashCol = "#ff2a2a"; if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 15);
      hitSound(1.2); sfx("stamp"); addFloat(MON_X - 24, GROUND - mh - 36, `발령: ${dest}`, "#ff7a6b", 24, true);
    } }] });
    say("인사 발령 났습니다. 짐 싸세요!", 2);
  },
};
function dashHit(f, i, st) {
  if (!mon || mon.dying) return;
  const last = i === 4, [x, y] = monHitPoint(0.3 + 0.12 * (i % 3));
  const crit = Math.random() < st.crit;
  f.hits.push({ t: f.t, i, y });
  jobFx.push({ kind: "dslash", t: 0, dur: last ? 340 : 240, x, y, ang: i % 2 ? 0.55 : -0.5, big: last });
  if (!reduceMotion) { shakeAmt = Math.max(shakeAmt, last ? 18 : 9); cam.kick = 1; }
  hitStop = Math.max(hitStop, last ? 110 : 40);
  rings.push({ x, y, life: 1, crit: true, big: last });
  jGold(x, y, last ? 14 : 5); hitSound(last ? 1.4 : 0.8); sfx("swing");
  if (last) { screenFlash = Math.max(screenFlash, 0.35); flashCol = "#ffd54a"; slowMo = Math.max(slowMo, 240); triggerImpactFrame(x, y, true); addFloat(x - 20, y - 56, "실적 달성!", "#ffd54a", 30, true); }
  hit(st.dps * 4 * (crit ? 1.5 : 1), true, "skill", x, y);
}
function hotfixHit(b, st, last) {
  if (!mon || mon.dying) return;
  addExplosion(b.x, b.ty, last); rings.push({ x: b.x, y: b.ty, life: 1, crit: false, big: last });
  jSparks(b.x, b.ty, b.col, last ? 16 : 8);
  for (let i = 0; i < 3; i++) jobParts.push({ kind: "digit", s: Math.random() < 0.5 ? "0" : "1", c: b.col, x: b.x, y: b.ty, vx: (Math.random() - .5) * 5, vy: -2 - Math.random() * 3, g: 0.2, life: 1, dur: 700 });
  if (!reduceMotion) shakeAmt = Math.max(shakeAmt, last ? 14 : 6);
  hitSound(last ? 1.2 : 0.6); sfx("zap");
  if (last) { screenFlash = Math.max(screenFlash, 0.3); flashCol = "#6fd3ff"; addFloat(MON_X - 30, b.ty - 60, "배포 완료 ✓", "#7fe3a0", 28, true); }
  hit(st.dps * 1.8, true, "skill", b.x, b.ty);
}
function loopBolt(k) {
  if (!mon || mon.dying) return;
  const st = stats(), [x, y] = monHitPoint();
  jobFx.push({ kind: "bolt", t: 0, dur: 200, pts: jBoltPts(x + (Math.random() - .5) * 60, -20, x, y, 9, 34), col: k % 2 ? "#6fd3ff" : "#c9a6ff", x, y });
  const crit = Math.random() < st.crit;
  jSparks(x, y, "#e6f6ff", 7);
  if (!reduceMotion) shakeAmt = Math.max(shakeAmt, 5);
  sfx("zap");
  hit(st.atk * 3 * (crit ? st.critMul : 1), crit, "skill", x, y);
}
function pptHit(s, st) {
  if (!mon || mon.dying) return;
  jSparks(s.tx, s.ty, "#ff9bb0", 3); sfx("toss");
  hit(st.dps * 0.6, false, "skill", s.tx, s.ty);
}
function beamTick(st, k) {
  if (!mon || mon.dying) return;
  const [x, y] = monHitPoint(0.5);
  jSparks(x - 10, y, k % 2 ? "#ffffff" : "#ff9bb0", 5, 14);
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
    else if (f.kind === "coinrain") {
      f.acc += dt;
      while (f.acc >= 70 && f.t < f.dur - 400) { f.acc -= 70; jobParts.push({ kind: "coin", x: MON_X - 110 + Math.random() * 170, y: -10, vx: (Math.random() - .5) * 1.2, vy: 2 + Math.random() * 2, g: 0.32, life: 1, dur: 1500, vr: 0.25 + Math.random() * 0.3, rot: Math.random() * 6, bounce: 1 }); }
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
  if (jobCut) { jobCut.t += dt; if (jobCut.t >= jobCut.dur) jobCut = null; }
  if (jobGlitch > 0) jobGlitch = Math.max(0, jobGlitch - dt);
  if (jobMarks.m && jobMarks.m !== mon) { jobMarks.m = null; jobMarks.n = 0; jobMarks.pos = []; }
  // 주인공 둘레에 직무 색 입자가 가끔 피어오름
  const j = curJob();
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
    if (f.t < 750) { c.x += (c.tx - c.x) * Math.min(1, dt / 170); c.run = true; return; }
    if (f.t > f.dur - 700) { c.x -= dt * 0.55; c.run = true; c.back = true; return; }
    c.run = false; c.cd -= dt;
    if (c.cd <= 0 && mon && !mon.dying && spawnWait <= 0) {
      c.cd = 650 + Math.random() * 450; c.hop = 1;
      const [x, y] = monHitPoint();
      hit(st.atk * 0.9, false, "pet", x, y);
      if (Math.random() < 0.16) { c.bub = 900; c.say = CREW_TALK[Math.floor(Math.random() * CREW_TALK.length)]; }
    }
  });
}

/* ---------- 그리기 (전투 화면 · 월드 좌표) ---------- */
function msz() { return mon ? monSize() : { w: 60, h: 80 }; }
function jPath(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); }
function jBolt(pts, col, a, w) {
  ctx.globalAlpha = a; ctx.lineJoin = "miter"; jPath(pts);
  ctx.strokeStyle = hexA(col, 0.4); ctx.lineWidth = w * 2.6; ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = Math.max(1.2, w * 0.36); ctx.stroke();
  ctx.globalAlpha = 1;
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
  garc(f) {
    const k = f.t / f.dur; ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = f.crit ? "#fff3b0" : "#ffd54a"; ctx.lineWidth = (f.crit ? 11 : 6) * (1 - k) + 1.5;
    ctx.beginPath(); if (f.flip) ctx.arc(f.x + 6, f.y, 30 + k * 34, 2.0, 4.6); else ctx.arc(f.x + 6, f.y, 30 + k * 34, -2.3, 0.6); ctx.stroke();
    ctx.globalAlpha = 1;
  },
  neon(f) {
    const k = f.t / f.dur, s = 10 + k * (f.crit ? 52 : 34);
    ctx.globalAlpha = 1 - k; ctx.lineWidth = 4 * (1 - k) + 1.2;
    ctx.strokeStyle = "#6fd3ff"; ctx.strokeRect(f.x - s / 2, f.y - s / 2, s, s);
    ctx.strokeStyle = "#ff6bd6"; ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(0.785); ctx.strokeRect(-s * 0.32, -s * 0.32, s * 0.64, s * 0.64); ctx.restore();
    ctx.globalAlpha = 1;
  },
  chain(f) { const a = 1 - f.t / f.dur; f.segs.forEach(s => jBolt(s, "#6fd3ff", a, 4)); },
  bolt(f) {
    const a = 1 - f.t / f.dur; jBolt(f.pts, f.col, a, 6);
    const gr = ctx.createRadialGradient(f.x, f.y, 2, f.x, f.y, 34); gr.addColorStop(0, hexA("#ffffff", 0.8 * a)); gr.addColorStop(1, hexA(f.col, 0));
    ctx.fillStyle = gr; ctx.fillRect(f.x - 34, f.y - 34, 68, 68);
  },
  pointer(f) {
    const k = f.t / f.dur, a = 1 - k;
    ctx.globalAlpha = a; ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,59,90,.4)"; ctx.lineWidth = f.snipe ? 10 : 6; ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.lineTo(f.x1, f.y1); ctx.stroke();
    ctx.strokeStyle = "#ff3b5a"; ctx.lineWidth = f.snipe ? 3.5 : 2; ctx.stroke();
    ctx.strokeStyle = "#ffe0e6"; ctx.lineWidth = 1; ctx.stroke();
    const gr = ctx.createRadialGradient(f.x1, f.y1, 1, f.x1, f.y1, f.snipe ? 26 : 14); gr.addColorStop(0, "rgba(255,240,244,.95)"); gr.addColorStop(0.35, "rgba(255,59,90,.8)"); gr.addColorStop(1, "rgba(255,59,90,0)");
    ctx.fillStyle = gr; ctx.fillRect(f.x1 - 26, f.y1 - 26, 52, 52);
    if (f.snipe) {
      const R = 34 - 22 * Math.min(1, k / 0.5);
      ctx.strokeStyle = "#ff3b5a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x1, f.y1, R, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(f.x1 - R - 8, f.y1); ctx.lineTo(f.x1 - R + 6, f.y1); ctx.moveTo(f.x1 + R - 6, f.y1); ctx.lineTo(f.x1 + R + 8, f.y1); ctx.moveTo(f.x1, f.y1 - R - 8); ctx.lineTo(f.x1, f.y1 - R + 6); ctx.moveTo(f.x1, f.y1 + R - 6); ctx.lineTo(f.x1, f.y1 + R + 8); ctx.stroke();
    }
    ctx.lineCap = "butt"; ctx.globalAlpha = 1;
  },
  splat(f) {
    const k = f.t / f.dur, a = 1 - k;
    ctx.globalAlpha = a; ctx.fillStyle = "#e0262c";
    ctx.beginPath(); ctx.arc(f.x, f.y, 6 + k * 10, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 7; i++) { const an = f.seed + i * 0.9, d = 10 + k * 26; ctx.beginPath(); ctx.arc(f.x + Math.cos(an) * d, f.y + Math.sin(an) * d * 0.8, 2.6 * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  },
  dash(f) {
    const look = heroLook(), hs = 3.5;
    f.hits.forEach(h => {
      const k = (f.t - h.t) / 320; if (k < 0 || k >= 1) return;
      const left = h.i % 2 === 0, gx = left ? MON_X - 150 + k * 40 : MON_X + 40 - k * 40, gy = GROUND - 24 * hs;
      ctx.globalAlpha = 0.55 * (1 - k);
      drawSprite(ctx, look.map, look.pal, gx, gy, hs, { pretty: true, solid: "#ffd54a", flip: !left });
      ctx.globalAlpha = 0.35 * (1 - k); ctx.fillStyle = "#fff3b0";
      ctx.fillRect(Math.min(gx, MON_X - 60), h.y - 2, 210, 4);
    });
    ctx.globalAlpha = 1;
  },
  dslash(f) {
    const k = f.t / f.dur, L = f.big ? 250 : 180, w = (f.big ? 30 : 18) * (1 - k * 0.75);
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.ang); ctx.globalAlpha = 1 - k * k;
    ctx.fillStyle = "#ff9b3d"; ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.quadraticCurveTo(0, -w, L / 2, 0); ctx.quadraticCurveTo(0, w * 0.3, -L / 2, 0); ctx.fill();
    ctx.fillStyle = "#ffd54a"; ctx.beginPath(); ctx.moveTo(-L * 0.45, 0); ctx.quadraticCurveTo(0, -w * 0.62, L * 0.45, 0); ctx.quadraticCurveTo(0, w * 0.15, -L * 0.45, 0); ctx.fill();
    ctx.fillStyle = "#fffbe6"; ctx.beginPath(); ctx.moveTo(-L * 0.36, 0); ctx.quadraticCurveTo(0, -w * 0.28, L * 0.36, 0); ctx.closePath(); ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
  },
  contract(f) {
    const { h: mh } = msz(), k = Math.min(1, f.t / 400), e = 1 - Math.pow(1 - k, 3);
    const x = MON_X - 40, y = -110 + (GROUND - mh * 0.62 - 50 + 110) * e, a = f.t > 950 ? Math.max(0, 1 - (f.t - 950) / 350) : 1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08 + (1 - e) * 0.5); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(10,12,22,.55)"; ctx.fillRect(4, 6, 80, 98);
    ctx.fillStyle = "#fbf8ef"; ctx.fillRect(0, 0, 80, 98);
    ctx.fillStyle = "#1b1f2a"; ctx.font = '14px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("계 약 서", 40, 13);
    ctx.fillStyle = "#b9c1d6"; for (let i = 0; i < 6; i++) ctx.fillRect(10, 28 + i * 9, i === 5 ? 34 : 60, 2.5);
    ctx.strokeStyle = "#2b3655"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(12, 88); ctx.bezierCurveTo(20, 78, 26, 96, 34, 84); ctx.bezierCurveTo(40, 78, 44, 92, 52, 86); ctx.stroke();
    if (f.t > 420) { const p = Math.min(1, (f.t - 420) / 110); ctx.save(); ctx.translate(62, 80); ctx.scale(1.8 - 0.8 * p, 1.8 - 0.8 * p); jSeal(0, 0, 13, -0.2, a, "계약"); ctx.restore(); }
    ctx.restore(); ctx.globalAlpha = 1;
  },
  coinrain(f) {
    const a = Math.min(1, f.t / 300, (f.dur - f.t) / 500) * 0.16;
    const gr = ctx.createLinearGradient(0, 0, 0, GROUND); gr.addColorStop(0, `rgba(255,213,74,${a})`); gr.addColorStop(1, "rgba(255,213,74,0)");
    ctx.fillStyle = gr; ctx.fillRect(MON_X - 130, 0, 220, GROUND);
  },
  hotfix(f) {
    f.blocks.forEach(b => {
      const k = (f.t - b.at) / 250; if (k < 0 || k > 1) return;
      const e = k * k, y = -50 + (b.ty + 50) * e, x = b.x;
      ctx.globalAlpha = 0.45; ctx.fillStyle = b.col; ctx.fillRect(x - 3, y - 70, 6, 60);
      ctx.globalAlpha = 1; ctx.save(); ctx.translate(x, y); ctx.rotate(b.rot);
      ctx.fillStyle = "rgba(4,10,20,.85)"; ctx.fillRect(-21, -12, 42, 24);
      ctx.strokeStyle = b.col; ctx.lineWidth = 2.5; ctx.strokeRect(-21, -12, 42, 24);
      ctx.fillStyle = "#e6f6ff"; ctx.font = '13px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(b.g, 0, 1);
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  },
  loop(f) {
    if (!mon) return;
    const { h: mh } = msz(), a = Math.min(1, f.t / 300, (f.dur - f.t) / 400), cx = MON_X - 6, cy = GROUND - mh * 0.5;
    ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = 0.65 * a; ctx.strokeStyle = "#c9a6ff"; ctx.lineWidth = 3;
    const R = mh * 0.62 + 6 * Math.sin(f.t / 90);
    ctx.setLineDash && ctx.setLineDash([10, 8]); ctx.lineDashOffset = -f.t / 20;
    ctx.beginPath(); ctx.ellipse ? ctx.ellipse(0, 0, R * 0.8, R, 0, 0, Math.PI * 2) : ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash && ctx.setLineDash([]); ctx.restore(); ctx.globalAlpha = 1;
  },
  ppt(f) {
    const ox = mon ? mon.kb * 26 : 0;
    f.slides.forEach(s => {
      const k = (f.t - s.at) / 230; if (k < 0) return;
      const fade = f.t > f.dur - 500 ? Math.max(0, (f.dur - f.t) / 500) : 1;
      if (k < 1) { const x0 = heroHand.x, y0 = heroHand.y - 14, x = x0 + (s.tx - x0) * k, y = y0 + (s.ty - y0) * k - Math.sin(k * Math.PI) * s.arc; jSlide(x, y, k * s.spin, s.chart, 1); }
      else jSlide(s.tx + ox, s.ty, s.tilt, s.chart, fade);
    });
    ctx.globalAlpha = 1;
  },
  reticle(f) {
    if (!mon || mon.dying) return;
    const { h: mh } = msz(), cx = MON_X - 6 + mon.kb * 26, cy = GROUND - mh * 0.5, a = Math.min(1, f.t / 250, (f.dur - f.t) / 500);
    const R = Math.max(30, mh * 0.55) + 4 * Math.sin(f.t / 120);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(f.t / 900); ctx.globalAlpha = 0.8 * a; ctx.strokeStyle = "#ff3b5a"; ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, R, i * Math.PI / 2 + 0.25, i * Math.PI / 2 + 1.3); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = a; ctx.font = '14px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const txt = `약점 노출 +50% · ${Math.ceil((f.dur - f.t) / 1000)}초`; ctx.lineWidth = 4; ctx.strokeStyle = "#1b0a10"; ctx.strokeText(txt, cx, cy - R - 12); ctx.fillStyle = "#ff9bb0"; ctx.fillText(txt, cx, cy - R - 12);
    ctx.restore();
  },
  beam(f) {
    const x0 = heroHand.x + 10, y0 = heroHand.y - 8;
    const { h: mh } = msz(), tx = MON_X - 10, ty = GROUND - mh * 0.5;
    if (f.t < 520) {   // 모으기
      const k = f.t / 520, R = 4 + 16 * k;
      const gr = ctx.createRadialGradient(x0, y0, 1, x0, y0, R * 2.2); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.4, "rgba(255,77,109,.8)"); gr.addColorStop(1, "rgba(255,77,109,0)");
      ctx.fillStyle = gr; ctx.fillRect(x0 - R * 2.2, y0 - R * 2.2, R * 4.4, R * 4.4);
      ctx.fillStyle = "#ff9bb0";
      for (let i = 0; i < 10; i++) { const an = i * 0.63 + f.t / 140, d = 60 * (1 - ((f.t / 520 + i * 0.1) % 1)); ctx.fillRect(x0 + Math.cos(an) * d - 1.5, y0 + Math.sin(an) * d - 1.5, 3, 3); }
      return;
    }
    const bt = f.t - 520, end = f.t > 2520 ? Math.max(0, 1 - (f.t - 2520) / 230) : 1, w = (16 + 5 * Math.sin(bt / 45)) * end;
    const ang = Math.atan2(ty - y0, tx - x0), len = 640;
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang);
    ctx.globalAlpha = 0.35 * end; ctx.fillStyle = "#ff4d6d"; ctx.fillRect(0, -w * 1.25, len, w * 2.5);
    ctx.globalAlpha = 0.9 * end; ctx.fillStyle = "#ff7a9a"; ctx.fillRect(0, -w * 0.6, len, w * 1.2);
    ctx.globalAlpha = end; ctx.fillStyle = "#ffffff"; ctx.fillRect(0, -w * 0.22, len, w * 0.44);
    const dist = Math.hypot(tx - x0, ty - y0);
    ctx.font = '11px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let q = 0; q < 4; q++) {
      const p = ((bt / 700 + q / 4) % 1) * dist;
      ctx.fillStyle = "#1b0a10"; ctx.beginPath(); ctx.moveTo(p - 7, -w - 10); ctx.lineTo(p + 7, -w - 4); ctx.lineTo(p - 7, -w + 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ffd1dc"; ctx.fillText(`Q${q + 1}`, p - 1, -w - 18);
    }
    ctx.restore();
    const gr = ctx.createRadialGradient(tx, ty, 2, tx, ty, 46 * end + 6); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.5, "rgba(255,122,154,.6)"); gr.addColorStop(1, "rgba(255,122,154,0)");
    ctx.fillStyle = gr; ctx.fillRect(tx - 60, ty - 60, 120, 120);
    ctx.globalAlpha = 1;
  },
  meeting(f) {
    f.crew.forEach((c, i) => {
      const fr = c.run ? Math.floor((f.t + i * 40) / 90) % 2 : c.hop > 0 ? 1 : 0;
      const sc = 2.4, y = GROUND - 12 * sc - c.row * 7 - (c.hop > 0 ? Math.sin(c.hop * Math.PI) * 16 : 0);
      const x = c.x + (c.hop > 0 ? Math.sin(c.hop * Math.PI) * 10 : 0);
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
    if (f.t > 420 && mon && !mon.dying) {   // 발령 받은 적: 붉은 테두리
      const a = (0.45 + 0.25 * Math.sin(f.t / 110)) * fade, R = mh * 0.62;
      const gr = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.25); gr.addColorStop(0, "rgba(255,42,42,0)"); gr.addColorStop(0.75, `rgba(255,60,60,${a * 0.5})`); gr.addColorStop(1, "rgba(255,60,60,0)");
      ctx.fillStyle = gr; ctx.fillRect(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6);
      ctx.save(); ctx.font = '14px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = fade;
      const txt = `받는 피해 ×3 · ${Math.ceil((f.dur - f.t) / 1000)}초`; ctx.lineWidth = 4; ctx.strokeStyle = "#1b0606"; ctx.strokeText(txt, cx, cy - mh * 0.62 - 14); ctx.fillStyle = "#ff7a6b"; ctx.fillText(txt, cx, cy - mh * 0.62 - 14);
      ctx.restore();
    }
    const k = Math.min(1, f.t / 400), e = 1 - Math.pow(1 - k, 3);
    const x = heroHand.x - 60 + (cx - 30 - heroHand.x + 60) * e, y = 20 + (cy - 30 - 20) * e - Math.sin(e * Math.PI) * 50;
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
  // 인주 자국 (적 몸에 남음)
  if (jobMarks.m && jobMarks.m === mon && !mon.dying && jobMarks.n) {
    const { w: mw, h: mh } = msz(), ox = MON_X + mon.kb * 26;
    jobMarks.pos.forEach(p => jSeal(ox + p[0] * mw, GROUND - p[1] * mh, 8, p[2], 0.82, "인"));
  }
  for (const f of jobFx) { const d = JFX_DRAW[f.kind]; if (d) d(f, t); }
  for (const p of jobProj) {
    const k = Math.min(1, p.t / p.dur);
    if (p.kind === "code") {
      const x = p.x0 + (p.tx - p.x0) * k, y = p.y0 + (p.ty - p.y0) * k - Math.sin(k * Math.PI) * 8;
      ctx.globalAlpha = 0.5; ctx.strokeStyle = "#6fd3ff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - (p.tx - p.x0) * 0.25, y - (p.ty - p.y0) * 0.25); ctx.lineTo(x, y); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = "rgba(4,10,20,.85)"; ctx.fillRect(x - 15, y - 9, 30, 18);
      ctx.strokeStyle = p.crit ? "#ffffff" : "#6fd3ff"; ctx.lineWidth = 2; ctx.strokeRect(x - 15, y - 9, 30, 18);
      ctx.fillStyle = p.chain ? "#ff6bd6" : "#e6f6ff"; ctx.font = '11px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(p.g, x, y + 1);
    } else if (p.kind === "stamp") {
      const x = p.x0 + (p.tx - p.x0) * k, y = p.y0 + (p.ty - p.y0) * k - Math.sin(k * Math.PI) * 46;
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
      for (let i = 0; i < 3; i++) if (Math.random() < 0.6) { const y = Math.floor(Math.random() * CSH * 0.92), h = Math.ceil(CSH * (0.012 + Math.random() * 0.035)), dx = Math.round((Math.random() - .5) * CSW * 0.05); ctx.drawImage(cv, 0, y, CSW, h, dx, y, CSW, h); }
    } catch (e) {}
    uiApply();
    ctx.globalAlpha = 0.08; ctx.fillStyle = "#000000"; for (let y = 0; y < UH; y += 4) ctx.fillRect(0, y, UW, 1.4);
    for (let i = 0; i < 2; i++) if (Math.random() < 0.5) { ctx.globalAlpha = 0.14; ctx.fillStyle = i ? "#ff2a6b" : "#2ad4ff"; ctx.fillRect(0, Math.random() * UH, UW, 2 + Math.random() * 6); }
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t / 50); ctx.font = '15px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const txt = `while (true) { 번개(); }  ${Math.ceil(jobGlitch / 1000)}`; ctx.lineWidth = 4; ctx.strokeStyle = "#0a0614"; ctx.strokeText(txt, UW / 2, UH - 22); ctx.fillStyle = "#c9a6ff"; ctx.fillText(txt, UW / 2, UH - 22);
    ctx.restore();
  }
  if (jobCut) {
    const c = jobCut, k = c.t / c.dur, inK = Math.min(1, k / 0.16), outK = k > 0.8 ? (k - 0.8) / 0.2 : 0;
    const x = (1 - (1 - Math.pow(1 - inK, 3))) * UW * 0.9 - outK * UW * 1.1, y = UH * 0.26, h = 42;
    ctx.save(); ctx.translate(x, 0); ctx.globalAlpha = 1 - outK * 0.5;
    ctx.fillStyle = "rgba(8,10,20,.84)"; ctx.beginPath(); ctx.moveTo(-10, y - h / 2); ctx.lineTo(UW + 30, y - h / 2); ctx.lineTo(UW + 10, y + h / 2); ctx.lineTo(-30, y + h / 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.col; ctx.fillRect(-10, y - h / 2, UW + 40, 2.5); ctx.fillRect(-30, y + h / 2 - 2.5, UW + 40, 2.5);
    ctx.globalAlpha *= 0.35; for (let i = 0; i < 6; i++) { const lx = ((t * 0.7 + i * 131) % (UW + 160)) - 80; ctx.fillRect(UW - lx, y - h / 2 + 7 + i * 5.5, 30 + i * 8, 1.4); }
    ctx.globalAlpha = 1 - outK * 0.5;
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
