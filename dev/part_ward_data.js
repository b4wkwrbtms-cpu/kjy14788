/* ===================== 옷장 데이터 (v30): 세트 14종 · 무기 이펙트 13종 · 오라 10종 · 칭호 15종 = 122벌 =====================
   부위 9칸: 머리·상의·넥타이·팔토시·신발·소품(세트 부위) + 오라·무기 이펙트·칭호.
   모든 옷: 입으면 부위 효과(부위마다 다른 능력치) + 가지고만 있어도 보유 효과(모든 피해 +). 등급과 강화(+10)로 커짐.
   uq = 예전 정장·오라의 고유 효과(가지고만 있어도), perk = 입었을 때만 붙는 효과.
   그림: pal = 몸 색 바꾸기, hair = 머리 모양, f = 앞에 덧그림(덮어씀), b = 뒤에 덧그림(빈칸에만), c = 그 아이템 전용 색.
   덧그림 줄 번호 y는 주인공 그림 기준 (0 = 맨 윗줄, -3 까지 머리 위). 글자는 18칸.
   c에 없는 글자(s S g k r m j w t a x B p b h e W Y)는 지금 입은 몸 색을 따름. */
var WSLOT = [
  { id: "head", n: "머리", k: "crit", base: 2 },
  { id: "top", n: "상의", k: "dmg", base: 40 },
  { id: "tie", n: "넥타이", k: "critd", base: 60 },
  { id: "arm", n: "팔토시", k: "gold", base: 50 },
  { id: "shoes", n: "신발", k: "aps", base: 4 },
  { id: "prop", n: "소품", k: "boss", base: 40 },
  { id: "aura", n: "오라", k: "dmg", base: 30 },
  { id: "wfx", n: "무기 이펙트", k: "wpn", base: 40 },
  { id: "title", n: "칭호", k: "", base: 0 },
];
var WBODY = ["head", "top", "tie", "arm", "shoes", "prop"];
var WGRADE = [
  { n: "일반", c: "#b9c1d6", m: 0 },
  { n: "고급", c: "#7fe3a0", m: 1 },
  { n: "희귀", c: "#6fd3ff", m: 1.6 },
  { n: "영웅", c: "#c9a6ff", m: 2.5 },
  { n: "전설", c: "#ffb13b", m: 4 },
  { n: "신화", c: "#ff6b6b", m: 6.4 },
];
var WSTAT = {
  dmg: ["모든 피해", "%"], xdmg: ["모든 피해", "x"], crit: ["치명타 확률", "%"], critd: ["치명 피해", "%"],
  aps: ["공격 속도", "%"], gold: ["보스 월급", "%"], boss: ["보스 피해", "%"], wpn: ["무기 공격력", "%"],
  pet: ["동료 피해", "%"], ore: ["광석", "%"], manna: ["말씀 만나", "%"], mem: ["암송 보상", "%"],
  stamp: ["퇴사 도장", "%"], btime: ["보스 제한 시간", "초"], jobcd: ["직무 스킬 대기", "-%"],
  xstamp: ["퇴사 도장", "x"], xaps: ["공격 속도", "x"],
};
var WOWN_BASE = 2;       // 보유 효과: 모든 피해 +2% x 등급 배율 x 강화
var WENH_MAX = 10;
var WCOND = {
  floor: ["최고층", v => `${v}층`],
  chap: ["말씀 누적", v => `${v}장`],
  study: ["공부 누적", v => `${+(v / 60).toFixed(1)}시간`],
  sstreak: ["공부 연속 최고", v => `${v}일`],
  rstreak: ["말씀 연속 최고", v => `${v}일`],
  astreak: ["출근 연속 최고", v => `${v}일`],
  mem: ["암송 완료", v => `${v}구절`],
  memp: ["암송 통과", v => `${v}번`],
  round: ["성경 통독", v => `${v}독`],
  planfin: ["읽기 플랜 완주", v => `${v}번`],
  boss: ["보스 처치", v => `${v}마리`],
  retire: ["퇴사", v => `${v}회`],
  att: ["출근 누적", v => `${v}일`],
  rank: ["직급", v => ["사원", "주임", "대리", "과장", "차장", "부장", "이사", "상무", "전무", "사장"][v] || v],
  job: ["팀 배치", v => ({ sales: "영업팀", dev: "개발팀", plan: "기획팀", hr: "인사총무팀" })[v] || v],
};
/* 머리 모양 추가: 민머리(투구용)·영업 2:8 가르마 */
var WHAIR = {
  none: Array(24).fill(".................."),
  sales: ["..................", "......hhhhhhh.....", ".....hhhhheeeeh...", "....hhhhhhheeeeh..", "....hhhhhhhhhhhh..", "....hhhhhhhhhh....", "....hh.h..........", "....hh............"].concat(Array(16).fill("..................")),
};

/* ---------- 세트 ---------- */
/* own: 가지고만 있어도 세트 효과 (회장님 세트 = 예전 전설 정장 효과 그대로, 전설 오라까지 7벌) */
var WSETS = [
  { id: "rookie", n: "신입사원 세트", g: 1, d: "첫 출근 날의 마음가짐 · 공부로 캔 광석으로 사요", col: "#7fe3a0",
    bonus: { 2: { dmg: 50 }, 4: { gold: 100 }, 6: { xdmg: 1.5 } } },
  { id: "elite", n: "엘리트 정장 세트", g: 2, d: "다림질 칼주름, 일 잘하는 사람 · 광석으로 사요", col: "#6fd3ff",
    bonus: { 2: { critd: 100 }, 4: { boss: 100 }, 6: { xdmg: 2 } } },
  { id: "chair", n: "회장님 세트", g: 4, own: true, d: "회사의 주인이 입는 옷 · 가지고만 있어도 소장 효과 (전설의 철야 오라까지 7벌)", col: "#ffb13b",
    bonus: { 1: { gold: 500 }, 2: { critd: 350 }, 3: { xdmg: 4.5 }, 4: { xstamp: 1.5 }, 5: { xaps: 1.1 }, 6: { xdmg: 2 }, 7: { xdmg: 3 } } },
  { id: "sales", n: "영업팀 정장", g: 3, job: "sales", d: "계약은 옷차림에서 시작된다 · 영업팀에 배치되면 열려요", col: "#ffd54a",
    bonus: { 2: { crit: 10 }, 4: { gold: 200 }, 6: { xdmg: 2.5, jobcd: 20 } } },
  { id: "dev", n: "개발팀 후드", g: 3, job: "dev", d: "편한 옷이 버그를 잡는다 · 개발팀에 배치되면 열려요", col: "#6fd3ff",
    bonus: { 2: { aps: 15 }, 4: { critd: 200 }, 6: { xdmg: 2.5, jobcd: 20 } } },
  { id: "plan", n: "기획팀 셋업", g: 3, job: "plan", d: "로드맵은 블레이저 주머니에 · 기획팀에 배치되면 열려요", col: "#ff7a9a",
    bonus: { 2: { boss: 100 }, 4: { btime: 3 }, 6: { xdmg: 2.5, jobcd: 20 } } },
  { id: "hr", n: "인사총무팀 가디건", g: 3, job: "hr", d: "회사 살림은 우리가 챙긴다 · 인사총무팀에 배치되면 열려요", col: "#7fe3a0",
    bonus: { 2: { pet: 100 }, 4: { gold: 150 }, 6: { xdmg: 2.5, jobcd: 20 } } },
  { id: "devil", n: "악마 스트릿", g: 3, d: "높이 오를수록 하나씩 열려요", col: "#7dff9a",
    bonus: { 2: { crit: 8 }, 4: { critd: 250 }, 6: { xdmg: 2.5 } } },
  { id: "cat", n: "고양이 코트", g: 3, d: "말씀을 읽을수록 하나씩 열려요", col: "#ff9b3d",
    bonus: { 2: { gold: 150 }, 4: { aps: 12 }, 6: { xdmg: 2.5 } } },
  { id: "cyber", n: "사이버 후드", g: 3, d: "공부한 시간만큼 하나씩 열려요", col: "#6fd3ff",
    bonus: { 2: { wpn: 100 }, 4: { aps: 15 }, 6: { xdmg: 2.5 } } },
  { id: "ice", n: "서리 기사", g: 3, d: "공부를 며칠 이어 하면 열려요", col: "#bff0ff",
    bonus: { 2: { boss: 120 }, 4: { btime: 4 }, 6: { xdmg: 2.5 } } },
  { id: "mage", n: "별빛 마법사", g: 3, d: "암송할수록 하나씩 열려요", col: "#c9a6ff",
    bonus: { 2: { dmg: 150 }, 4: { mem: 30 }, 6: { xdmg: 2.5 } } },
  { id: "paladin", n: "황금 성기사", g: 3, d: "말씀을 며칠 이어 읽으면 열려요", col: "#ffe14a",
    bonus: { 2: { dmg: 150 }, 4: { boss: 200 }, 6: { xdmg: 2.5 } } },
  { id: "armor", n: "말씀의 전신갑주", g: 5, d: "그러므로 하나님의 전신갑주를 취하라 (엡 6:13) · 강화는 만나로", col: "#ffe9a0",
    bonus: { 2: { dmg: 300 }, 4: { boss: 300, btime: 5 }, 6: { xdmg: 5, manna: 30 }, 7: { xdmg: 1.5, crit: 10 } } },
];

/* ---------- 아이템 ---------- */
var WITEMS = [
  /* 신입사원 세트 (예전 정장 1단) */
  { id: "rk_head", set: "rookie", slot: "head", n: "단정한 가르마", cost: { ore: 150 }, old: ["hair", 0], uq: { d: "퇴사 도장 +50%", fx: { stamp: 50 } }, look: { keep: 1, hair: "neat", pal: { h: "#2a2a35" } } },
  { id: "rk_top", set: "rookie", slot: "top", n: "신입 셔츠", cost: { ore: 150 }, old: ["shirt", 0], uq: { d: "곽준영·동료 피해 +75%", fx: { dmg: 75 } }, look: { pal: { w: "#eef1f7" } } },
  { id: "rk_tie", set: "rookie", slot: "tie", n: "넥타이핀 넥타이", cost: { ore: 150 }, old: ["tie", 0], uq: { d: "치명타 확률 +25%", fx: { crit: 25 } }, look: { pal: { t: "#3b7bd6" }, f: { 14: ".........QQ......." }, c: { Q: "#e9edf6" } } },
  { id: "rk_arm", set: "rookie", slot: "arm", n: "사무용 팔토시", cost: { ore: 150 }, old: ["arm", 0], uq: { d: "보스 월급 +100%", fx: { gold: 100 } }, look: { pal: { a: "#5b6274" } } },
  { id: "rk_shoes", set: "rookie", slot: "shoes", n: "운동화", cost: { ore: 150 }, old: ["shoes", 0], uq: { d: "퇴사 직후 3분 동안 공격 속도 3배", fx: { sneaker: 1 } }, look: { pal: { b: "#eef1f7" } } },
  { id: "rk_prop", set: "rookie", slot: "prop", n: "손목시계", cost: { ore: 150 }, old: ["acc", 0], uq: { d: "지하 문서고 하루 입장 +1회", fx: { vault: 1 } }, look: { pal: { x: "#c9ced8" } } },
  /* 엘리트 정장 세트 (예전 정장 2단) */
  { id: "el_head", set: "elite", slot: "head", n: "올백 포마드", cost: { ore: 600 }, old: ["hair", 1], uq: { d: "보물 사원증 효과 2배", fx: { badge2: 1 } }, look: { hair: "slick", pal: { h: "#141418", e: "#8d97b6" } } },
  { id: "el_top", set: "elite", slot: "top", n: "다림질 정장", cost: { ore: 600 }, old: ["shirt", 1], uq: { d: "모든 피해 +100%", fx: { dmg: 100 } }, look: { pal: { w: "#eef1f7", j: "#3b4566", a: "#3b4566" } } },
  { id: "el_tie", set: "elite", slot: "tie", n: "실크 넥타이", cost: { ore: 600 }, old: ["tie", 1], uq: { d: "보스 피해 +100%", fx: { boss: 100 } }, look: { pal: { t: "#7c5cff" } } },
  { id: "el_arm", set: "elite", slot: "arm", n: "강철 팔토시", cost: { ore: 600 }, old: ["arm", 1], uq: { d: "5층마다 모든 피해 +1%", fx: { floor5: 1 } }, look: { pal: { a: "#c9ced8" } } },
  { id: "el_shoes", set: "elite", slot: "shoes", n: "광낸 구두", cost: { ore: 600 }, old: ["shoes", 1], uq: { d: "모든 피해 +100%", fx: { dmg: 100 } }, look: { pal: { b: "#3a2414" } } },
  { id: "el_prop", set: "elite", slot: "prop", n: "커프스 단추", cost: { ore: 600 }, old: ["acc", 1], uq: { d: "무기 공격력 +50%", fx: { wpn: 50 } }, look: { pal: { x: "#ffd54a" } } },
  /* 회장님 세트 (예전 전설 정장) — 고유 효과는 강화할수록 커짐 (+4에서 최대, 예전 5강) */
  { id: "ch_head", set: "chair", slot: "head", n: "전설의 광채 대머리", cost: { ore: 2000 }, old: ["hair", 2], uq: { lv: 1, d: lv => `모든 피해 x${1 + 5 * lv}`, fx: lv => ({ xdmg: 1 + 5 * lv }) }, look: { hair: "bald", pal: { e: "#ffd54a" } } },
  { id: "ch_top", set: "chair", slot: "top", n: "전설의 회장 수트", cost: { ore: 2000 }, old: ["shirt", 2], uq: { lv: 1, d: lv => `모든 피해 x${1 + lv}`, fx: lv => ({ xdmg: 1 + lv }) }, look: { pal: { w: "#f4f1e6", j: "#1b1b1b", a: "#1b1b1b", B: "#ffd54a" }, f: { 13: "............Y....." } } },
  { id: "ch_tie", set: "chair", slot: "tie", n: "전설의 금빛 넥타이", cost: { ore: 2000 }, old: ["tie", 2], uq: { lv: 1, d: lv => `치명 피해 +${300 * lv}%`, fx: lv => ({ critd: 300 * lv }) }, look: { pal: { t: "#ffd54a" } } },
  { id: "ch_arm", set: "chair", slot: "arm", n: "전설의 팔토시", cost: { ore: 2000 }, old: ["arm", 2], uq: { lv: 1, d: lv => `보스 월급 +${1000 * lv}%`, fx: lv => ({ gold: 1000 * lv }) }, look: { pal: { a: "#ffd54a" } } },
  { id: "ch_shoes", set: "chair", slot: "shoes", n: "전설의 금장 구두", cost: { ore: 2000 }, old: ["shoes", 2], uq: { lv: 1, d: lv => `공격 속도 +${10 * lv}%`, fx: lv => ({ aps: 10 * lv }) }, look: { pal: { b: "#ffd54a" } } },
  { id: "ch_prop", set: "chair", slot: "prop", n: "전설의 회장 반지", cost: { ore: 2000 }, old: ["acc", 2], uq: { lv: 1, d: lv => `만나·광석·암송 보상 +${10 * lv}%`, fx: lv => ({ manna: 10 * lv, ore: 10 * lv, mem: 10 * lv }) }, look: { pal: { x: "#ff6bd6" } } },

  /* 영업팀 정장: 네이비 핀스트라이프 + 금빛 포인트 + 서류가방 */
  { id: "sa_head", set: "sales", slot: "head", n: "자신감 2:8 가르마", cond: ["job", "sales"],
    look: { hair: "sales", pal: { h: "#16161e", e: "#5b6684" }, f: { 8: ".....Q............" }, c: { Q: "#e9edf6" } } },
  { id: "sa_top", set: "sales", slot: "top", n: "네이비 핀스트라이프 정장", cond: ["job", "sales"],
    look: { pal: { j: "#1f2a4f", a: "#1f2a4f", w: "#f4f6fb", p: "#1f2a4f", B: "#121420" },
      f: { 13: "....L.......Y.....", 15: "....L.....L.......", 17: "......L.....L....." }, c: { L: "#34436f", Y: "#ffd54a" } } },
  { id: "sa_tie", set: "sales", slot: "tie", n: "골드 실크 넥타이", cond: ["job", "sales"],
    look: { pal: { t: "#ffd54a" }, f: { 15: ".........TT......." }, c: { T: "#b8861c" } } },
  { id: "sa_arm", set: "sales", slot: "arm", n: "금장 커프스", cond: ["job", "sales"], look: { pal: { a: "#1f2a4f", x: "#ffd54a" } } },
  { id: "sa_shoes", set: "sales", slot: "shoes", n: "브라운 옥스퍼드", cond: ["job", "sales"], look: { pal: { b: "#7a4220" } } },
  { id: "sa_prop", set: "sales", slot: "prop", n: "계약서 서류가방", cond: ["job", "sales"],
    look: { f: { 19: "..KK..............", 20: "CCCC..............", 21: "CYCC..............", 22: "CCCC..............", 23: "DDDD.............." },
      c: { K: "#3a2414", C: "#8a5a2e", D: "#5a3618", Y: "#ffd54a" } } },

  /* 개발팀 후드: 헤드셋 + 차콜 후드티 + 노트북 */
  { id: "dv_head", set: "dev", slot: "head", n: "노이즈 캔슬링 헤드셋", cond: ["job", "dev"],
    look: { f: { 0: ".......DDDD.......", 1: "......D...........", 2: ".....D............", 3: ".....D............", 4: ".....D............", 5: ".....D............", 6: "....EEE...........", 7: "....EcE...........", 8: "....EEE...........", 9: "......D...........", 10: ".......Dc........." },
      c: { D: "#9aa3b8", E: "#2a2e38", c: "#6fd3ff" } } },
  { id: "dv_top", set: "dev", slot: "top", n: "차콜 후드티", cond: ["job", "dev"],
    look: { pal: { j: "#3a4152", a: "#3a4152", w: "#161a26", p: "#2c3a55", B: "#1b1f2a" },
      f: { 10: "....H.............", 11: "...HHHH...........", 12: "...H..............", 15: "...........cc....." }, c: { H: "#4d566c", c: "#6fd3ff" } } },
  { id: "dv_tie", set: "dev", slot: "tie", n: "네온 후드 끈", cond: ["job", "dev"],
    look: { pal: { t: "#6fd3ff" }, f: { 12: ".........ww.......", 13: "........tjjt......", 14: "........tjjt......", 15: "........tjjt......", 16: "........tjjt......", 17: "........T..T......" }, c: { T: "#e6fbff" } } },
  { id: "dv_arm", set: "dev", slot: "arm", n: "스마트워치", cond: ["job", "dev"], look: { pal: { a: "#3a4152", x: "#6fd3ff" } } },
  { id: "dv_shoes", set: "dev", slot: "shoes", n: "화이트 스니커즈", cond: ["job", "dev"],
    look: { pal: { b: "#eef1f7" }, f: { 23: ".....c......c....." }, c: { c: "#6fd3ff" } } },
  { id: "dv_prop", set: "dev", slot: "prop", n: "코딩 노트북", cond: ["job", "dev"],
    look: { f: { 13: "LLLL..............", 14: "LkcL..............", 15: "LckL..............", 16: "LcLL..............", 17: "LLLL..............", 18: "lll..............." },
      c: { L: "#c9ced8", l: "#8d97b6", k: "#0e1a2a", c: "#6fd3ff" } } },

  /* 기획팀 셋업: 안경 + 카멜 블레이저·검정 터틀넥 + 태블릿 */
  { id: "pl_head", set: "plan", slot: "head", n: "로즈골드 안경", cond: ["job", "plan"], look: { hair: "side", pal: { h: "#3a2a22", e: "#7a5a46", g: "#ff8fa8" } } },
  { id: "pl_top", set: "plan", slot: "top", n: "카멜 블레이저 & 터틀넥", cond: ["job", "plan"],
    look: { pal: { j: "#c9a06b", a: "#c9a06b", w: "#1b1b22", p: "#2a2a33", B: "#1b1b22" }, f: { 14: "...........N......" }, c: { N: "#9a7444" } } },
  { id: "pl_tie", set: "plan", slot: "tie", n: "실버 펜던트", cond: ["job", "plan"],
    look: { pal: { t: "#1b1b22" }, f: { 13: ".........P........", 15: ".........PP......." }, c: { P: "#e9edf6" } } },
  { id: "pl_arm", set: "plan", slot: "arm", n: "핑크 스마트밴드", cond: ["job", "plan"], look: { pal: { a: "#c9a06b", x: "#ff7a9a" } } },
  { id: "pl_shoes", set: "plan", slot: "shoes", n: "블랙 로퍼", cond: ["job", "plan"], look: { pal: { b: "#1b1b22" }, f: { 23: ".......Y......Y..." }, c: { Y: "#d6a24a" } } },
  { id: "pl_prop", set: "plan", slot: "prop", n: "기획서 태블릿", cond: ["job", "plan"],
    look: { f: { 13: "TTTT..............", 14: "TVuT..............", 15: "TpuT..............", 16: "TpuT..............", 17: "TTTT.............." },
      c: { T: "#2a2e38", V: "#f4f6fb", p: "#ff7a9a", u: "#7c5cff" } } },

  /* 인사총무팀 가디건: 연필 + 초록 가디건·사원증 + 결재 도장 */
  { id: "hr_head", set: "hr", slot: "head", n: "귀에 꽂은 연필", cond: ["job", "hr"],
    look: { hair: "neat", pal: { h: "#2a2420" }, f: { 6: ".RYYYy............" }, c: { R: "#ff8fa3", Y: "#ffd54a", y: "#f2c9a0" } } },
  { id: "hr_top", set: "hr", slot: "top", n: "그린 니트 가디건", cond: ["job", "hr"],
    look: { pal: { j: "#3f7a5a", a: "#3f7a5a", w: "#f4f6fb", p: "#8a7a5a", B: "#4a3a2a" }, f: { 14: "............O.....", 16: "............O....." }, c: { O: "#efe6c9" } } },
  { id: "hr_tie", set: "hr", slot: "tie", n: "사원증 목걸이", cond: ["job", "hr"],
    look: { pal: { t: "#7fe3a0" }, f: { 16: ".........II.......", 17: ".........iI......." }, c: { I: "#f4f6fb", i: "#6fd3ff" } } },
  { id: "hr_arm", set: "hr", slot: "arm", n: "검정 팔토시", cond: ["job", "hr"], look: { pal: { a: "#2a2e38", x: "#7fe3a0" } } },
  { id: "hr_shoes", set: "hr", slot: "shoes", n: "편한 단화", cond: ["job", "hr"], look: { pal: { b: "#4a4f5e" } } },
  { id: "hr_prop", set: "hr", slot: "prop", n: "결재 도장", cond: ["job", "hr"],
    look: { f: { 16: "..H...............", 17: "..h...............", 19: ".RRR..............", 20: ".YYY..............", 21: ".RRR..............", 22: ".rrr.............." },
      c: { H: "#c98a5a", h: "#8a5a3a", R: "#c8322e", Y: "#ffd54a", r: "#ff5a4a" } } },

  /* 악마 스트릿 (최고층) */
  { id: "dl_head", set: "devil", slot: "head", n: "악마 뿔 & 민트 머리", cond: ["floor", 150],
    look: { pal: { h: "#8fe8bd", e: "#d2ffe8" }, f: { "-3": "...H..........H...", "-2": "...HH........HH...", "-1": "....HHH....HHH....", 0: ".....HH....HH....." }, c: { H: "#2fbf6e" } } },
  { id: "dl_top", set: "devil", slot: "top", n: "오버핏 악마 재킷", cond: ["floor", 200],
    look: { pal: { j: "#1c1c26", a: "#1c1c26", w: "#2c2c3a", p: "#17171e", B: "#ff5fa2" }, f: { 18: "...jjjjjjjjjjj...." } } },
  { id: "dl_tie", set: "devil", slot: "tie", n: "민트 독 넥타이", cond: ["floor", 250], look: { pal: { t: "#7dff9a" } } },
  { id: "dl_arm", set: "devil", slot: "arm", n: "가시 장갑", cond: ["floor", 300],
    look: { pal: { a: "#24242f", x: "#ff5fa2" }, f: { 13: "..a...............", 14: "..aO..............", 15: "..a..............." }, c: { O: "#7dff9a" } } },
  { id: "dl_shoes", set: "devil", slot: "shoes", n: "핑크 밑창 부츠", cond: ["floor", 400], look: { pal: { b: "#3a1830" }, f: { 23: "....PPPP..PPPPP..." }, c: { P: "#ff5fa2" } } },
  { id: "dl_prop", set: "devil", slot: "prop", n: "악마 꼬리", cond: ["floor", 500],
    look: { b: { 17: "..L...............", 18: ".L................", 19: ".L................", 20: "L.................", 21: "L.l...............", 22: ".lll..............", 23: "..l..............." }, c: { L: "#2fbf6e", l: "#ff5fa2" } } },

  /* 고양이 코트 (말씀 누적) */
  { id: "ct_head", set: "cat", slot: "head", n: "고양이 귀 머리띠", cond: ["chap", 5],
    look: { pal: { h: "#f2d27a", e: "#fff2b8" }, f: { "-2": ".....N......N.....", "-1": "....NnN....NnN....", 0: "....NnnN..NnnN...." }, c: { N: "#1d1d2c", n: "#ff9b3d" } } },
  { id: "ct_top", set: "cat", slot: "top", n: "주황 포인트 코트", cond: ["chap", 15],
    look: { pal: { j: "#1d1d2c", a: "#1d1d2c", w: "#f6ead2", p: "#f6ead2", B: "#ff9b3d" }, f: { 19: "...jjjj...........", 20: "...jjj............" } } },
  { id: "ct_tie", set: "cat", slot: "tie", n: "방울 넥타이", cond: ["chap", 30], look: { pal: { t: "#ff9b3d" }, f: { 17: ".........Y........" }, c: { Y: "#ffe14a" } } },
  { id: "ct_arm", set: "cat", slot: "arm", n: "고양이 손토시", cond: ["chap", 50], look: { pal: { a: "#ff9b3d", x: "#ffb3c1" } } },
  { id: "ct_shoes", set: "cat", slot: "shoes", n: "흰 양말 부츠", cond: ["chap", 80], look: { pal: { b: "#f6ead2" } } },
  { id: "ct_prop", set: "cat", slot: "prop", n: "줄무늬 꼬리", cond: ["chap", 120],
    look: { b: { 12: ".V................", 13: ".n................", 14: "nN................", 15: "n.................", 16: "N.................", 17: "n.................", 18: ".N................", 19: "..nn.............." }, c: { n: "#ff9b3d", N: "#c9701c", V: "#fff4e0" } } },

  /* 사이버 후드 (공부 누적) */
  { id: "cy_head", set: "cyber", slot: "head", n: "안테나 바이저 후드", cond: ["study", 180],
    look: { pal: { g: "#6fd3ff", k: "#e6fbff" }, f: { "-2": ".....Q............", "-1": ".....Q............", 0: ".....qqqqqqq......", 1: "....qqqqqqqqqq....", 2: "...qqqqqqqqqqqq...", 3: "...qqqQQQQQQQQq...", 4: "...qqqQ...........", 5: "...qqqQ...........", 6: "...qqq............", 7: "...qqq............", 8: "....qq............", 9: "....qq............", 10: ".....q............" },
      c: { q: "#2f3550", Q: "#6fd3ff" } } },
  { id: "cy_top", set: "cyber", slot: "top", n: "사이버 슈트", cond: ["study", 360],
    look: { pal: { j: "#262b40", a: "#262b40", w: "#11141f", p: "#1a1d2b", B: "#6fd3ff" }, f: { 16: "...Q..............", 21: "......Q.....Q....." }, c: { Q: "#6fd3ff" } } },
  { id: "cy_tie", set: "cyber", slot: "tie", n: "네온 케이블 타이", cond: ["study", 600], look: { pal: { t: "#6fd3ff" } } },
  { id: "cy_arm", set: "cyber", slot: "arm", n: "빛나는 손목 단말", cond: ["study", 900], look: { pal: { a: "#262b40", x: "#6fd3ff" } } },
  { id: "cy_shoes", set: "cyber", slot: "shoes", n: "LED 부츠", cond: ["study", 1320], look: { pal: { b: "#11141f" }, f: { 23: ".......Q......Q..." }, c: { Q: "#6fd3ff" } } },
  { id: "cy_prop", set: "cyber", slot: "prop", n: "홀로 드론", cond: ["study", 1800],
    look: { b: { 0: "z.z...............", 1: "qqq...............", 2: ".Q................", 3: ".o................" }, c: { z: "#c9d2e6", q: "#2f3550", Q: "#6fd3ff", o: "#2b8fb8" } } },

  /* 서리 기사 (공부 연속) */
  { id: "ic_head", set: "ice", slot: "head", n: "얼음 왕관", cond: ["sstreak", 2],
    look: { f: { "-2": ".......R...R......", "-1": ".......R.R.R......", 0: "......RRRRRRR....." }, c: { R: "#bff0ff" } } },
  { id: "ic_top", set: "ice", slot: "top", n: "서리 갑옷", cond: ["sstreak", 4],
    look: { pal: { j: "#cfe8ff", a: "#cfe8ff", w: "#ffffff", p: "#6d8fb8", B: "#ffd54a" }, f: { 12: "..cc........cc....", 13: "..cc.............." }, c: { c: "#e6f6ff" } } },
  { id: "ic_tie", set: "ice", slot: "tie", n: "푸른 기사 넥타이", cond: ["sstreak", 7], look: { pal: { t: "#3b7bd6" } } },
  { id: "ic_arm", set: "ice", slot: "arm", n: "서리 건틀릿", cond: ["sstreak", 10], look: { pal: { a: "#9fd2f5", x: "#ffd54a" } } },
  { id: "ic_shoes", set: "ice", slot: "shoes", n: "빙하 부츠", cond: ["sstreak", 14], look: { pal: { b: "#3b4566" }, f: { 22: ".....c......c....." }, c: { c: "#bff0ff" } } },
  { id: "ic_prop", set: "ice", slot: "prop", n: "푸른 망토", cond: ["sstreak", 21],
    look: { b: { 12: "..CC..............", 13: "..CC..............", 14: "..CC..............", 15: "..CC..............", 16: "..CC..............", 17: ".CCC..............", 18: ".CCC..............", 19: ".CCCC.............", 20: "CCCCC.............", 21: "CCCC..............", 22: "CCC..............." }, c: { C: "#2b5ea8" } } },

  /* 별빛 마법사 (암송: 앞의 둘은 통과 횟수, 나머지는 암송 완료 구절) */
  { id: "mg_head", set: "mage", slot: "head", n: "별 고깔모자", cond: ["memp", 10],
    look: { f: { "-3": "......CC..........", "-2": ".......CCC........", "-1": ".......CCCC.......", 0: "......CCCCCz......", 1: "......CCCCCCC.....", 2: ".....zzzzzzzzz....", 3: "..cCCCCCCCCCCCCc.." }, c: { C: "#4a3aa8", c: "#6a5ad6", z: "#ffe14a" } } },
  { id: "mg_top", set: "mage", slot: "top", n: "남색 별 로브", cond: ["memp", 30],
    look: { pal: { j: "#3a2c8f", a: "#3a2c8f", w: "#2a2070", p: "#3a2c8f", B: "#ffd54a" }, f: { 14: "......z...........", 15: "...........z......", 19: ".....jjjjjjj......", 20: ".....jjjjjjjj.....", 21: "....jjjjjjjjjj...." }, c: { z: "#ffe14a" } } },
  { id: "mg_tie", set: "mage", slot: "tie", n: "금빛 별 넥타이", cond: ["mem", 5], look: { pal: { t: "#ffd54a" } } },
  { id: "mg_arm", set: "mage", slot: "arm", n: "마법사 소매", cond: ["mem", 15], look: { pal: { a: "#4a3aa8", x: "#ffe14a" } } },
  { id: "mg_shoes", set: "mage", slot: "shoes", n: "밤하늘 신발", cond: ["mem", 30], look: { pal: { b: "#1d1640" } } },
  { id: "mg_prop", set: "mage", slot: "prop", n: "떠다니는 마법서", cond: ["mem", 45],
    look: { b: { 8: "...z..............", 9: "CCC...............", 10: "CzC...............", 11: "CCC...............", 12: "vvv..............." }, c: { C: "#4a3aa8", z: "#ffe14a", v: "#f4f1e6" } } },

  /* 황금 성기사 (말씀 연속) */
  { id: "pd_head", set: "paladin", slot: "head", n: "금빛 후광", cond: ["rstreak", 3],
    look: { f: { "-3": ".......RRRRR......", "-2": "......R.....R.....", "-1": ".......RRRRR......" }, c: { R: "#ffe14a" } } },
  { id: "pd_top", set: "paladin", slot: "top", n: "백금 성의", cond: ["rstreak", 7], look: { pal: { j: "#f4f1e6", a: "#f4f1e6", w: "#ffffff", p: "#e8e2cc", B: "#ffd54a" } } },
  { id: "pd_tie", set: "paladin", slot: "tie", n: "황금 넥타이", cond: ["rstreak", 10], look: { pal: { t: "#ffd54a" } } },
  { id: "pd_arm", set: "paladin", slot: "arm", n: "황금 건틀릿", cond: ["rstreak", 14], look: { pal: { a: "#ffd54a", x: "#fff2b8" } } },
  { id: "pd_shoes", set: "paladin", slot: "shoes", n: "황금 장화", cond: ["rstreak", 21], look: { pal: { b: "#c9962a" } } },
  { id: "pd_prop", set: "paladin", slot: "prop", n: "흰 날개", cond: ["rstreak", 30],
    look: { b: { 9: "...V..............", 10: "..VV..............", 11: ".VVV..............", 12: "VVVV..............", 13: "VVVv..............", 14: ".VVv..............", 15: "..vv.............." }, c: { V: "#ffffff", v: "#dfe6f3" } } },

  /* 말씀의 전신갑주 (신화, 엡 6:13-18 개역한글) — 강화는 만나로 */
  { id: "ar_head", set: "armor", slot: "head", n: "구원의 투구", cond: ["round", 1], vs: "구원의 투구와 성령의 검 곧 하나님의 말씀을 가지라 (엡 6:17)",
    look: { hair: "none", f: { "-2": "........GG........", "-1": ".......GGGG.......", 0: "......MMGGMM......", 1: ".....MMMMMMMM.....", 2: "....MMmmMMMMMM....", 3: "....MMMMMMMMMMMM..", 4: "....MMMMMMMMMMMM..", 5: "....GGGGGGGUGGGG..", 6: "....MM............", 7: "....MM............", 8: "....MM............" },
      c: { M: "#dfe6f3", m: "#ffffff", G: "#ffd54a", U: "#6fd3ff" } } },
  { id: "ar_top", set: "armor", slot: "top", n: "의의 흉배", cond: ["chap", 300], vs: "의의 흉배를 붙이고 (엡 6:14)",
    look: { pal: { j: "#c9d2e6", a: "#c9d2e6", w: "#f4f1e6", p: "#8a7a5a", B: "#6b4a2e" },
      f: { 12: "..MM........MM....", 13: "..MM..G...........", 14: ".....GGG..........", 15: "......G...........", 16: "......G..........." }, c: { M: "#eef2fa", G: "#ffd54a" } } },
  { id: "ar_tie", set: "armor", slot: "tie", n: "진리의 허리띠", cond: ["chap", 100], vs: "진리로 너희 허리 띠를 띠고 (엡 6:14)",
    look: { pal: { t: "#e8edf7", B: "#ffd54a" }, f: { 19: ".........U........" }, c: { U: "#6fd3ff" } } },
  { id: "ar_arm", set: "armor", slot: "arm", n: "기도의 손토시", cond: ["rstreak", 40], vs: "모든 기도와 간구로 하되 무시로 성령 안에서 기도하고 (엡 6:18)", look: { pal: { a: "#c9d2e6", x: "#ffd54a" } } },
  { id: "ar_shoes", set: "armor", slot: "shoes", n: "평안의 복음의 신", cond: ["att", 100], vs: "평안의 복음의 예비한 것으로 신을 신고 (엡 6:15)",
    look: { pal: { b: "#a8743a" }, f: { 21: ".....K.K..K.K.....", 23: "...V......V......." }, c: { K: "#6b4a2e", V: "#ffffff" } } },
  { id: "ar_prop", set: "armor", slot: "prop", n: "믿음의 방패", cond: ["mem", 50], vs: "모든 것 위에 믿음의 방패를 가지고 (엡 6:16)",
    look: { f: { 12: ".GGG..............", 13: "GMgMG.............", 14: "GgggG.............", 15: "GMgMG.............", 16: "GMgMG.............", 17: "GMMMG.............", 18: ".GMG..............", 19: "..G..............." }, c: { G: "#ffd54a", M: "#3b5fae", g: "#fff2b8" } } },
  { id: "w_spirit", set: "armor", slot: "wfx", n: "성령의 검", g: 5, cond: ["mem", 100], vs: "성령의 검 곧 하나님의 말씀을 가지라 (엡 6:17)", fx: "spirit", perk: { xdmg: 2 }, d: "흰 불꽃과 금빛 빛줄기가 칼날을 감쌈" },

  /* 무기 이펙트: 무기 모양은 그대로, 둘레에만 효과 */
  { id: "w_flame", slot: "wfx", n: "화염", g: 1, cond: ["floor", 100], fx: "flame", perk: { critd: 50 }, d: "날을 따라 불꽃이 타오름" },
  { id: "w_volt", slot: "wfx", n: "번개", g: 1, cond: ["boss", 200], fx: "volt", perk: { aps: 5 }, d: "칼날 위로 전기가 튐" },
  { id: "w_venom", slot: "wfx", n: "맹독", g: 1, cond: ["retire", 1], fx: "venom", perk: { boss: 30 }, d: "초록 독이 뚝뚝 떨어짐" },
  { id: "w_frost", slot: "wfx", n: "서리", g: 2, cond: ["study", 300], fx: "frost", perk: { btime: 2 }, d: "얼음 조각이 칼날을 감쌈" },
  { id: "w_crystal", slot: "wfx", n: "수정", g: 2, cond: ["chap", 50], fx: "crystal", perk: { ore: 10 }, d: "무지갯빛으로 반짝이는 수정 가루" },
  { id: "w_sakura", slot: "wfx", n: "벚꽃", g: 2, cond: ["memp", 20], fx: "sakura", perk: { mem: 20 }, d: "휘두를 때마다 꽃잎이 흩날림" },
  { id: "w_blizzard", slot: "wfx", n: "눈보라", g: 2, cond: ["sstreak", 7], fx: "blizzard", perk: { aps: 6 }, d: "눈송이가 칼날 둘레를 맴돎" },
  { id: "w_gold", slot: "wfx", n: "황금", g: 3, cond: ["rstreak", 14], fx: "gold", perk: { gold: 100 }, d: "금빛 광택이 칼날을 훑고 지나감" },
  { id: "w_moon", slot: "wfx", n: "달빛", g: 3, cond: ["floor", 300], fx: "moon", perk: { crit: 5 }, d: "초승달 두 개가 칼날을 돎" },
  { id: "w_dragon", slot: "wfx", n: "용염", g: 4, cond: ["floor", 500], fx: "dragon", perk: { xdmg: 1.5 }, d: "검붉은 용의 불꽃" },
  { id: "w_star", slot: "wfx", n: "별빛", g: 4, cond: ["mem", 50], fx: "star", perk: { manna: 20 }, d: "작은 별들이 무기를 따라 돎" },
  { id: "w_holy", slot: "wfx", n: "성광", g: 4, cond: ["round", 1], fx: "holy", perk: { xdmg: 1.5, boss: 100 }, d: "칼날에서 빛줄기가 뻗어 나옴" },

  /* 오라 */
  { id: "a_yellow", slot: "aura", n: "노란 야근 오라", g: 1, cost: { ore: 150 }, old: ["aura", 0], uq: { d: "보스 월급 +50%", fx: { gold: 50 } }, aura: { k: "flame", c1: "#ffd54a", c2: "#fff3b0" } },
  { id: "a_blue", slot: "aura", n: "파란 새벽 오라", g: 2, cost: { ore: 600 }, old: ["aura", 1], uq: { d: "모든 피해 +100%", fx: { dmg: 100 } }, aura: { k: "flame", c1: "#3b9bff", c2: "#bfe9ff" } },
  { id: "a_night", slot: "aura", n: "전설의 철야 오라", g: 4, set: "chair", cost: { ore: 2000 }, old: ["aura", 2], uq: { lv: 1, d: lv => `모든 피해 x${1 + 2 * lv}`, fx: lv => ({ xdmg: 1 + 2 * lv }) }, aura: { k: "flame", c1: "#9a5cff", c2: "#ffb3f0", ember: 1 } },
  { id: "a_word", slot: "aura", n: "말씀 빛 오라", g: 3, cond: ["chap", 100], perk: { manna: 15 }, aura: { k: "pillar", c1: "#ffe27a", c2: "#ffffff" }, d: "발밑에서 금빛 기둥이 솟음" },
  { id: "a_study", slot: "aura", n: "집중 불꽃 오라", g: 3, cond: ["study", 1200], perk: { ore: 15 }, aura: { k: "flame", c1: "#2fd6ff", c2: "#e6fbff" }, d: "푸른 불꽃이 몸을 감쌈" },
  { id: "a_mem", slot: "aura", n: "암송 별무리 오라", g: 3, cond: ["mem", 30], perk: { mem: 20 }, aura: { k: "orbit", c1: "#c9a6ff", c2: "#ffe14a" }, d: "별무리가 허리를 따라 돎" },
  { id: "a_dawn", slot: "aura", n: "새벽 기도 오라", g: 4, cond: ["rstreak", 30], perk: { xdmg: 1.5 }, aura: { k: "rays", c1: "#ffb36b", c2: "#ffe9c9" }, d: "등 뒤로 새벽빛이 퍼짐" },
  { id: "a_boss", slot: "aura", n: "보스 사냥꾼 오라", g: 2, cond: ["boss", 2000], perk: { boss: 50 }, aura: { k: "embers", c1: "#ff4a3a", c2: "#ffb36b" }, d: "붉은 불티가 피어오름" },
  { id: "a_wind", slot: "aura", n: "퇴사 바람 오라", g: 2, cond: ["retire", 15], perk: { stamp: 20 }, aura: { k: "wind", c1: "#cfe8ff", c2: "#ffffff" }, d: "사표 바람이 몸을 휘감음" },
  { id: "a_att", slot: "aura", n: "개근 오라", g: 2, cond: ["att", 60], perk: { gold: 80 }, aura: { k: "sparkle", c1: "#7fe3a0", c2: "#e6ffe9" }, d: "초록 반짝이가 톡톡 튐" },

  /* 칭호 (강화 없음) — 문구는 측정형·서술형, 일부는 성경 인물 */
  { id: "t_seed", slot: "title", n: "말씀 새싹", g: 1, cond: ["chap", 10], perk: { manna: 10 }, d: "말씀 10장을 읽었습니다" },
  { id: "t_plan", slot: "title", n: "플랜 완주자", g: 2, cond: ["planfin", 1], perk: { manna: 20, dmg: 30 }, d: "읽기 플랜을 끝까지 마쳤습니다" },
  { id: "t_word", slot: "title", n: "말씀의 사람", g: 3, cond: ["chap", 500], perk: { manna: 30, dmg: 80 }, d: "말씀 500장을 읽었습니다" },
  { id: "t_round", slot: "title", n: "성경 통독자", g: 4, cond: ["round", 1], perk: { dmg: 200, manna: 30 }, d: "성경 66권 1189장을 모두 읽었습니다" },
  { id: "t_study1", slot: "title", n: "공부 새내기", g: 1, cond: ["study", 300], perk: { ore: 10 }, d: "공부 5시간을 채웠습니다" },
  { id: "t_study2", slot: "title", n: "집중의 달인", g: 2, cond: ["sstreak", 14], perk: { ore: 20, aps: 5 }, d: "14일 동안 하루도 빠짐없이 공부했습니다" },
  { id: "t_study3", slot: "title", n: "에스라의 학자", g: 3, cond: ["study", 6000], perk: { ore: 30, dmg: 80 }, d: "여호와의 율법을 연구하여 준행하며 … 가르치기로 결심하였었더라 (스 7:10) · 공부 100시간" },
  { id: "t_mem1", slot: "title", n: "암송 꿈나무", g: 1, cond: ["memp", 10], perk: { mem: 20 }, d: "암송 시험을 10번 통과했습니다" },
  { id: "t_mem2", slot: "title", n: "말씀을 마음에 둔 사람", g: 3, cond: ["mem", 100], perk: { mem: 30, critd: 150 }, d: "주의 말씀을 내 마음에 두었나이다 (시 119:11) · 암송 완료 100구절" },
  { id: "t_att", slot: "title", n: "개근상", g: 2, cond: ["astreak", 14], perk: { gold: 80 }, d: "14일 동안 하루도 빠짐없이 출근했습니다" },
  { id: "t_streak", slot: "title", n: "베뢰아 사람", g: 3, cond: ["rstreak", 30], perk: { dmg: 100 }, d: "날마다 성경을 상고하므로 (행 17:11) · 말씀 30일 연속" },
  { id: "t_boss", slot: "title", n: "보스 킬러", g: 2, cond: ["boss", 1000], perk: { boss: 80 }, d: "보스 1000마리를 쓰러뜨렸습니다" },
  { id: "t_floor", slot: "title", n: "고층 정복자", g: 3, cond: ["floor", 500], perk: { dmg: 100 }, d: "500층에 올랐습니다" },
  { id: "t_retire", slot: "title", n: "프로 퇴사러", g: 2, cond: ["retire", 10], perk: { stamp: 20 }, d: "사표를 10번 냈습니다" },
  { id: "t_ceo", slot: "title", n: "사장님", g: 4, cond: ["rank", 9], perk: { gold: 300, dmg: 100 }, d: "평사원에서 사장이 되었습니다" },
];
/* 옷장 도감: 모은 개수 단계마다 영구 효과 + 한 번 받는 선물 */
var WCOLL = [
  { n: 5, fx: { dmg: 20 }, rw: { ore: 200 } },
  { n: 10, fx: { gold: 50 }, rw: { ore: 400, silver: 1 } },
  { n: 20, fx: { critd: 50 }, rw: { ore: 600, silver: 2 } },
  { n: 30, fx: { aps: 3 }, rw: { ore: 800, silver: 3 } },
  { n: 45, fx: { dmg: 50 }, rw: { ore: 1000, silver: 4 } },
  { n: 60, fx: { boss: 80 }, rw: { ore: 1500, silver: 5 } },
  { n: 80, fx: { critd: 100 }, rw: { ore: 2000, silver: 6, ame: 2 } },
  { n: 100, fx: { dmg: 100 }, rw: { ore: 3000, silver: 8, ame: 3 } },
  { n: 122, fx: { xdmg: 2 }, rw: { ore: 5000, silver: 10, ame: 5 } },
];
/* 예전 무기 스킨 → 무기 이펙트, 예전 의상 → 세트 */
var WOLD_SKIN = { frost: "w_frost", flame: "w_flame", crystal: "w_crystal", sakura: "w_sakura", volt: "w_volt", venom: "w_venom", halberd: "w_gold", scythe: "w_moon", hammer: "w_blizzard", fang: "w_dragon", star: "w_star", holy: "w_holy" };
var WOLD_OUTFIT = { devil: "devil", cat: "cat", cyber: "cyber", ice: "ice", mage: "mage", paladin: "paladin" };
var WOLD_SLOT = { hair: "head", shirt: "top", tie: "tie", arm: "arm", shoes: "shoes", acc: "prop", aura: "aura" };
