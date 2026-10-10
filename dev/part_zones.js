/* ===================== 구역과 몬스터 (50층마다 새 구역) ===================== */
const BP = o => Object.assign({ h: "#1c1c22", s: "#efc19a", k: "#111111", m: "#8a3a2a", j: "#2d3142", w: "#f0f0f0", t: "#c43b3b", p: "#1d2030" }, o);
const ZONES = [
  { n: "로비", bg: "lobby", bossPal: BP({ j: "#2a3a5a", t: "#6fd3ff" }), execs: ["안내데스크 실장", "보안팀장", "시설과장", "총무팀장", "로비 지배인"], mons: [
    ["box", { b: "#c9a26b", t: "#e8d39a", k: "#1b1f2a", m: "#3a1f12", w: "#ffffff" }, "택배 상자 미믹"],
    ["bat", { w: "#6fd3ff", b: "#2a5a8a", k: "#ffffff", m: "#ff6b6b" }, "출입증 박쥐"],
    ["guard", { a: "#c9ced8", r: "#5b6274", k: "#ff5d5d", m: "#2a2e38", l: "#3b4566" }, "경비 로봇"],
    ["slime", { s: "#7fe3a0", h: "#d6ffe6", k: "#1b1f2a", m: "#2a6a4a" }, "화분 슬라임"]] },
  { n: "사무동", bg: "office", bossPal: BP({}), execs: ["김팀장", "박차장", "이부장", "최상무", "정전무"], mons: [
    ["paper", { p: "#f4f1e6", l: "#9aa3b8", k: "#1b1f2a" }, "결재서류 슬라임"],
    ["ghost", { g: "#c8d6ff", k: "#22284a", m: "#5a66a8" }, "회의록 유령"],
    ["golem", { d: "#8c94a8", b: "#f4f6fb", k: "#ff5d5d", m: "#3a4052" }, "고장난 프린터"],
    ["bat", { w: "#7c5cff", b: "#4a35b8", k: "#ffd54a", m: "#ff6b8a" }, "메신저 박쥐"]] },
  { n: "탕비실", bg: "pantry", bossPal: BP({ h: "#6b4a2e", j: "#6b3f1f", t: "#ffd54a" }), execs: ["커피머신 반장", "간식 담당 과장", "냉장고 관리 부장", "믹스커피 차장", "탕비실 이사"], mons: [
    ["mug", { w: "#eef1f7", c: "#6b3f1f", k: "#1b1f2a", m: "#d6403d" }, "식은 커피 슬라임"],
    ["ghost", { g: "#fff3d6", k: "#3a2a14", m: "#c9a26b" }, "컵라면 김 유령"],
    ["golem", { d: "#6fa8d6", b: "#e6f4ff", k: "#ffffff", m: "#2a4a6a" }, "정수기 골렘"],
    ["bat", { w: "#ff9a3b", b: "#d6403d", k: "#ffffff", m: "#7a1f1d" }, "과자봉지 박쥐"]] },
  { n: "회의실", bg: "meeting", bossPal: BP({ h: "#9da3ad", j: "#3b2a5a", t: "#7c5cff" }), execs: ["회의 연장 팀장", "PPT 부장", "아이디어 차장", "결론없음 상무", "끝장회의 전무"], mons: [
    ["chair", { b: "#1b1f2a", c: "#3b4566", k: "#ffd54a", m: "#ff6b6b", a: "#2a2e38", w: "#5b6274" }, "회전의자 기사"],
    ["paper", { p: "#eef6ff", l: "#6fd3ff", k: "#1b1f2a" }, "화이트보드 슬라임"],
    ["bat", { w: "#5b6274", b: "#2a2e38", k: "#6fd3ff", m: "#ff6b6b" }, "빔프로젝터 박쥐"],
    ["ghost", { g: "#e3d6ff", k: "#2a1a5a", m: "#7c5cff" }, "회의 연장 유령"]] },
  { n: "서버실", bg: "server", bossPal: BP({ h: "#2a2a2a", j: "#14161c", t: "#7fe3a0" }), execs: ["야간 당직 팀장", "장애 대응 부장", "보안 패치 차장", "DB 관리 상무", "CTO"], mons: [
    ["golem", { d: "#2a2e38", b: "#7fe3a0", k: "#7fe3a0", m: "#14161c" }, "서버 골렘"],
    ["bat", { w: "#c9ced8", b: "#5b6274", k: "#7fe3a0", m: "#3a4052" }, "냉각팬 박쥐"],
    ["slime", { s: "#ff6b6b", h: "#ffd1cc", k: "#2a0b06", m: "#7a1f1d" }, "에러 로그 슬라임"],
    ["bug", { a: "#7fe3a0", b: "#2f8a4a", k: "#ffffff", w: "#b6f0a4", l: "#1b3a24" }, "버그 벌레"]] },
  { n: "자료실", bg: "archive", bossPal: BP({ h: "#d9d9d9", j: "#5a4a32", t: "#c9a26b" }), execs: ["문서 보관 팀장", "기록 관리 부장", "폐기 담당 차장", "보안 문서 상무", "아카이브 전무"], mons: [
    ["box", { b: "#9aa3b8", t: "#cfd6ea", k: "#1b1f2a", m: "#3a4052", w: "#ffffff" }, "문서 상자 미믹"],
    ["rat", { e: "#c9a6a0", g: "#8d8a96", k: "#1b1f2a", n: "#ff8fa3", t: "#c9a6a0" }, "자료실 쥐"],
    ["paper", { p: "#e8dcb5", l: "#a8925a", k: "#3a2a14" }, "먼지 쌓인 서류"],
    ["ghost", { g: "#d9d2c0", k: "#3a3226", m: "#8a7a5a" }, "분실 서류 유령"]] },
  { n: "구내식당", bg: "cafeteria", bossPal: BP({ h: "#ffffff", j: "#eef1f7", w: "#ffffff", t: "#d6403d" }), execs: ["배식 반장", "영양사 팀장", "조리장", "메뉴 결정 부장", "식당 운영 이사"], mons: [
    ["mug", { w: "#ffffff", c: "#f4f1e6", k: "#1b1f2a", m: "#ff8fa3" }, "공깃밥 슬라임"],
    ["slime", { s: "#c9743a", h: "#ffd08a", k: "#2a1408", m: "#7a3a12" }, "돈가스 슬라임"],
    ["bat", { w: "#cfd6ea", b: "#8d97b6", k: "#1b1f2a", m: "#d6403d" }, "수저 박쥐"],
    ["box", { b: "#b8bcc6", t: "#e6ecff", k: "#1b1f2a", m: "#3a4052", w: "#ffffff" }, "식판 미믹"]] },
  { n: "사내 헬스장", bg: "gym", bossPal: BP({ s: "#d99a6a", j: "#d6403d", w: "#ffffff", t: "#ffffff" }), execs: ["PT 트레이너", "헬스 동호회장", "3대 500 차장", "단백질 부장", "근육 상무"], mons: [
    ["dumbbell", { d: "#2a2e38", b: "#8d97b6", k: "#ffd54a", m: "#ff6b6b" }, "덤벨 골렘"],
    ["slime", { s: "#6fd3ff", h: "#e6f6ff", k: "#06263a", m: "#2b8fb8" }, "땀방울 슬라임"],
    ["guard", { a: "#ff9a3b", r: "#d6403d", k: "#ffffff", m: "#2a0b06", l: "#5b6274" }, "러닝머신 로봇"],
    ["ghost", { g: "#ffd1c4", k: "#3a1408", m: "#d6403d" }, "근육통 유령"]] },
  { n: "인사팀", bg: "hr", bossPal: BP({ j: "#2a3a2a", t: "#7fe3a0" }), execs: ["채용 담당", "평가 팀장", "인사 부장", "노무 상무", "인사 전무"], mons: [
    ["paper", { p: "#ffffff", l: "#d6403d", k: "#1b1f2a" }, "평가표 슬라임"],
    ["clockm", { b: "#3b4566", c: "#5b6274", w: "#f4f6fb", k: "#1b1f2a", m: "#d6403d" }, "근태 시계"],
    ["ghost", { g: "#e3c8ff", k: "#3a1a5a", m: "#9a5cff" }, "연봉협상 유령"],
    ["chair", { b: "#5a1f1f", c: "#d6403d", k: "#ffffff", m: "#1b1f2a", a: "#7a2a2a", w: "#3a1414" }, "면접 의자"]] },
  { n: "재무팀", bg: "finance", bossPal: BP({ h: "#5a5a5a", j: "#1b2a1b", t: "#ffd54a" }), execs: ["경리 대리", "회계 팀장", "세무 부장", "재무 상무", "CFO"], mons: [
    ["coin", { y: "#ffd54a", o: "#c9a43a", k: "#2a2206", m: "#7a5a12" }, "동전 슬라임"],
    ["golem", { d: "#3b4566", b: "#bfe6a8", k: "#ffd54a", m: "#1b1f2a" }, "계산기 골렘"],
    ["paper", { p: "#fff7e6", l: "#c9a26b", k: "#2a2206" }, "영수증 슬라임"],
    ["rat", { e: "#ffe08a", g: "#c9a43a", k: "#2a2206", n: "#ff8fa3", t: "#ffe08a" }, "예산 갉는 쥐"]] },
  { n: "옥상 정원", bg: "garden", bossPal: BP({ h: "#c9a26b", j: "#3a5a2a", t: "#ffd54a" }), execs: ["옥상 관리인", "정원사 반장", "비둘기 대장", "실외기 팀장", "옥상 이사"], mons: [
    ["plant", { g: "#4fb35a", p: "#c9743a", k: "#2a1408", m: "#7a1f1d" }, "화분 맨드레이크"],
    ["bird", { g: "#8d97b6", k: "#1b1f2a", o: "#ff9a3b", n: "#7fe3a0", w: "#eef1f7" }, "옥상 비둘기"],
    ["golem", { d: "#b8bcc6", b: "#5b6274", k: "#ffd54a", m: "#3a4052" }, "실외기 골렘"],
    ["mug", { w: "#5b8fd6", c: "#bfe6ff", k: "#0e1321", m: "#ffffff" }, "빗물 양동이"]] },
  { n: "헬기장", bg: "heliport", bossPal: BP({ j: "#1b2a4a", t: "#ffd54a", w: "#ffffff" }), execs: ["관제 팀장", "정비 부장", "항공 상무", "의전 전무", "전용기 기장"], mons: [
    ["bird", { g: "#2a2a35", k: "#ff5d5d", o: "#5b6274", n: "#7c5cff", w: "#3b3b48" }, "까마귀"],
    ["cloud", { w: "#9aa3b8", k: "#1b1f2a", m: "#3a4052", g: "#5b6274", y: "#cfd6ea" }, "돌풍 정령"],
    ["guard", { a: "#ffd54a", r: "#ff9a3b", k: "#1b1f2a", m: "#2a2e38", l: "#5b6274" }, "헬기 정비 로봇"],
    ["bat", { w: "#2a2e38", b: "#14161c", k: "#ff5d5d", m: "#ff6b6b" }, "야간 박쥐"]] },
  { n: "구름 위", bg: "clouds", bossPal: BP({ h: "#f4f6fb", j: "#6fa8d6", w: "#ffffff", t: "#ffffff" }), execs: ["구름 관리인", "기상 팀장", "천둥 부장", "무지개 상무", "하늘 전무"], mons: [
    ["cloud", { w: "#ffffff", k: "#3b4566", m: "#6fd3ff", g: "#cfd6ea", y: "#ffd54a" }, "심술 구름"],
    ["bird", { g: "#ffffff", k: "#1b1f2a", o: "#ffd54a", n: "#cfe3ff", w: "#e6f0ff" }, "구름 갈매기"],
    ["slime", { s: "#bfe6ff", h: "#ffffff", k: "#1d3f73", m: "#6fa8d6" }, "이슬 슬라임"],
    ["bat", { w: "#ffd54a", b: "#c9a43a", k: "#ffffff", m: "#7a5a12" }, "번개 박쥐"]] },
  { n: "성층권", bg: "stratos", bossPal: BP({ j: "#0b1a3a", t: "#6fd3ff" }), execs: ["위성 관리 팀장", "궤도 부장", "통신 상무", "우주사업 전무", "성층권 이사"], mons: [
    ["satellite", { p: "#3b7bd6", b: "#c9ced8", k: "#ff5d5d", m: "#3a4052", a: "#8d97b6" }, "고장난 위성"],
    ["slime", { s: "#ff9a3b", h: "#ffe08a", k: "#2a1408", m: "#d6403d" }, "유성 슬라임"],
    ["ufo", { c: "#bfe6ff", k: "#1b1f2a", m: "#8d97b6", y: "#7fe3a0", l: "#7fe3a0" }, "정찰 UFO"],
    ["ghost", { g: "#7fe3d6", k: "#0b2a2a", m: "#3fa89a" }, "오로라 유령"]] },
  { n: "달 지사", bg: "moon", bossPal: BP({ h: "#9aa3b8", j: "#e6ecff", w: "#9aa3b8", t: "#ffd54a" }), execs: ["달 지사장", "크레이터 팀장", "월면 물류 부장", "토끼 상무", "달빛 전무"], mons: [
    ["rabbit", { w: "#ffffff", p: "#ff8fa3", k: "#1b1f2a" }, "달토끼"],
    ["alien", { g: "#7fe3a0", k: "#1b1f2a", m: "#2f8a4a", s: "#c9ced8" }, "달 주재원"],
    ["box", { b: "#e6ecff", t: "#9aa3b8", k: "#1b1f2a", m: "#3a4052", w: "#ffffff" }, "월면 화물"],
    ["slime", { s: "#9aa3b8", h: "#cfd6ea", k: "#1b1f2a", m: "#5b6274" }, "월석 슬라임"]] },
  { n: "화성 공장", bg: "mars", bossPal: BP({ j: "#7a2a1f", w: "#ff9a3b", t: "#ffd54a" }), execs: ["공장장", "생산 팀장", "품질 부장", "안전 상무", "화성 전무"], mons: [
    ["guard", { a: "#c9ced8", r: "#c9473a", k: "#ffd54a", m: "#2a0b06", l: "#7a2a1f" }, "화성 작업 로봇"],
    ["slime", { s: "#d6603d", h: "#ffb38a", k: "#2a0b06", m: "#7a1f1d" }, "붉은 먼지 슬라임"],
    ["alien", { g: "#ff9a3b", k: "#2a0b06", m: "#d6403d", s: "#7a2a1f" }, "모래폭풍 외계인"],
    ["golem", { d: "#7a3a2a", b: "#ff9a3b", k: "#ffd54a", m: "#2a0b06" }, "용광로 골렘"]] },
  { n: "우주 정거장", bg: "station", bossPal: BP({ j: "#eef1f7", w: "#3b7bd6", t: "#d6403d" }), execs: ["관제사", "도킹 팀장", "생명유지 부장", "우주회의 상무", "정거장 사령관"], mons: [
    ["astro", { g: "#eef1f7", v: "#3b7bd6", k: "#ffffff", w: "#cfd6ea", r: "#d6403d" }, "무중력 회의 참석자"],
    ["chair", { b: "#cfd6ea", c: "#eef1f7", k: "#3b7bd6", m: "#1b1f2a", a: "#9aa3b8", w: "#5b6274" }, "떠다니는 의자"],
    ["bug", { a: "#c9ced8", b: "#5b6274", k: "#6fd3ff", w: "#cfd6ea", l: "#3b4566" }, "우주 벌레"],
    ["clockm", { b: "#6fd3ff", c: "#2b8fb8", w: "#e6f6ff", k: "#06263a", m: "#d6403d" }, "시차 시계"]] },
  { n: "은하 물류센터", bg: "galaxy", bossPal: BP({ j: "#4a35b8", t: "#ffd54a" }), execs: ["물류 센터장", "배송 팀장", "포장 부장", "통관 상무", "물류 전무"], mons: [
    ["box", { b: "#7c5cff", t: "#ffd54a", k: "#ffffff", m: "#2a1a5a", w: "#ffffff" }, "은하 택배 미믹"],
    ["ufo", { c: "#ffb3f0", k: "#1b1f2a", m: "#7c5cff", y: "#ffd54a", l: "#ff6bd6" }, "배송 UFO"],
    ["guard", { a: "#ff6bd6", r: "#4a35b8", k: "#ffd54a", m: "#120a2a", l: "#2a1a5a" }, "분류 로봇"],
    ["coin", { y: "#ff6bd6", o: "#7c5cff", k: "#ffffff", m: "#2a1a5a" }, "별사탕 코인"]] },
  { n: "블랙홀 재무팀", bg: "blackhole", bossPal: BP({ s: "#c9a6ff", j: "#14141c", w: "#3a3a48", t: "#ff5d5d" }), execs: ["손실 처리 팀장", "적자 부장", "부채 상무", "블랙홀 CFO", "파산 전무"], mons: [
    ["ghost", { g: "#2a1a3a", k: "#ff5d5d", m: "#7c5cff" }, "공허 유령"],
    ["slime", { s: "#1b1428", h: "#5a4a7a", k: "#ff6bd6", m: "#7c5cff" }, "암흑 물질 슬라임"],
    ["coin", { y: "#3a3a48", o: "#14141c", k: "#ff5d5d", m: "#7c5cff" }, "사라진 예산"],
    ["satellite", { p: "#4a35b8", b: "#3a3a48", k: "#ff5d5d", m: "#14141c", a: "#5a4a7a" }, "빨려든 위성"]] },
  { n: "시공간 이사회", bg: "timespace", bossPal: BP({ h: "#ffffff", j: "#2a1a5a", w: "#c9a6ff", t: "#ffd54a" }), execs: ["과거 이사", "현재 이사", "미래 이사", "평행 이사", "무한 이사"], mons: [
    ["clockm", { b: "#ffd54a", c: "#c9a43a", w: "#fff7e6", k: "#2a2206", m: "#d6403d" }, "시간외근무 시계"],
    ["alien", { g: "#c9a6ff", k: "#1b1f2a", m: "#7c5cff", s: "#ffffff" }, "평행세계 대리"],
    ["astro", { g: "#ffd54a", v: "#7c5cff", k: "#ffffff", w: "#fff7c2", r: "#ff6bd6" }, "시간 여행자"],
    ["ghost", { g: "#ffb3f0", k: "#2a1a5a", m: "#6fd3ff" }, "과거의 실수 유령"]] },
];
const DRAGONS = ["야근룡", "결재룡", "회식룡", "보고서룡", "감사룡", "구름룡", "별빛룡", "월광룡", "은하룡", "시공룡"];
const DRAGON_PAL = [["#3b4566", "#5a66a8", "#ff9a3b"], ["#7a2f22", "#d6403d", "#ffd54a"], ["#c9743a", "#ffd08a", "#ff6b3b"], ["#5b6274", "#cfd6ea", "#6fd3ff"], ["#2f8a4a", "#7fe3a0", "#ffd54a"],
  ["#6fa8d6", "#ffffff", "#ffd54a"], ["#1d3f73", "#6fd3ff", "#ffffff"], ["#8d8a96", "#e6ecff", "#ffd54a"], ["#4a35b8", "#ff6bd6", "#ffd54a"], ["#2a1a5a", "#ffd54a", "#ff6bd6"]]
  .map(([h, w, m]) => ({ h, w, m, k: "#ffffff", b: w, t: h }));
const CYCLE = ["", "심야 ", "새벽 ", "주말 ", "명절 ", "연말 ", "결산 ", "감사 기간 "];
const ZONE_LEN = 50;
const zoneNo = f => Math.floor((f - 1) / ZONE_LEN);
const zoneOf = f => ZONES[zoneNo(f) % ZONES.length];
const cycleOf = f => CYCLE[Math.min(CYCLE.length - 1, Math.floor((f - 1) / (ZONE_LEN * ZONES.length)))];
