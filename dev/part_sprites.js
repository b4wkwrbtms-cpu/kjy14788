/* 새 몬스터 그림 (오른쪽을 보고 그림, 화면에선 뒤집어 왼쪽을 봄) */
Object.assign(SPR, {
  slime: ["............","............","....ssss....","...ssssss...","..sshsssss..","..sssssssss.",".sskssskss..",".sskssskss..",".ssssssssss.",".sssmmmmsss.","ssssssssssss",".ssssssssss."],
  box: ["............",".bbbbbbbbbb.",".btttttttbb.",".bbbbbbbbbb.",".bbbbbbbbbb.",".bkbbbbbkbb.",".bbbbbbbbbb.",".bmmmmmmmmb.",".bwmwmwmwmb.",".bbbbbbbbbb.",".bbbbbbbbbb.","............"],
  bug: ["............","..a......a..","...a....a...","....bbbb....","...bkbbkb...","..bbbbbbbb..","l.bwwbbwwb.l",".lbbbbbbbbl.","l.bbwwwwbb.l","..bbbbbbbb..","...l....l...","..l......l.."],
  rat: ["............","............","........ee..",".......eeee.","...ggggggg..","..gggggggkg.",".ggggggggggn",".gggggggggg.","tt.gggggggg.","..t.g.g..g..","............","............"],
  guard: [".....aa.....","....a..a....","...rrrrrr...","..rrrrrrrr..","..rkkrrkkr..","..rrrrrrrr..","..rrmmmmrr..","...rrrrrr...",".llrrrrrrll.",".l.rrrrrr.l.","...rr..rr...","..rrr..rrr.."],
  coin: ["....yyyy....","..yyyyyyyy..",".yyoooooyyy.",".yoyyyyyyoy.","yoyykyykyyoy","yoyyyyyyyyoy","yoyyymmyyyoy","yoyyyyyyyyoy",".yoyyyyyyoy.",".yyoooooyyy.","..yyyyyyyy..","....yyyy...."],
  cloud: ["............","....ww......","..wwwwww.ww.",".wwwwwwwwwww","wwwkwwwkwwww","wwwwwwwwwwww","wwwwmmmwwwww",".wwwwwwwwww.","..gggggggg..","............","..y...y.....","...y...y...."],
  ufo: ["............","....cccc....","...cckkcc...","...cccccc...",".mmmmmmmmmm.","mmymmymmymmm",".mmmmmmmmmm.","...l....l...","..l......l..",".l........l.","............","............"],
  alien: ["............","..g......g..","...g....g...","...gggggg...","..gggggggg..","..gkkggkkg..","..gkkggkkg..","...gggggg...","....gmmg....","..ssssssss..","..s.ssss.s..","....s..s...."],
  satellite: ["............","pp..bbbb..pp","pp..bkkb..pp","pppbbbbbbppp","pp..bbbb..pp","pp..bmmb..pp","pp...a....pp",".....a......","....aaa.....","............","............","............"],
  rabbit: ["..w...w.....","..ww..ww....","..wp..wp....","..ww..ww....",".wwwwwwww...",".wwwwkwwk...",".wwwwwwpw...","..wwwwww....",".wwwwwwww...","wwwwwwwwww..",".ww....ww...","............"],
  clockm: ["..b......b..","...cccccc...","..cwwwwwwc..",".cwwwkwwwwc.",".cwwwkwwwwc.",".cwwwkkkwwc.",".cwwwwwwwwc.",".cwkwwwwkwc.",".cwwwmmwwwc.","..cwwwwwwc..","...cccccc...","..c......c.."],
  dumbbell: ["............","............","dd........dd","ddd......ddd","dddbbbbbbddd","dddbkbbkbddd","dddbbbbbbddd","dddbbmmbbddd","ddd......ddd","dd........dd","............","............"],
  astro: ["....gggg....","..gggggggg..","..gvvvvvvg..",".ggvkvvkvgg.",".ggvvvvvvgg.","..gggggggg..",".wwwwwwwwww.","wwwwrrwwwwww","wwwwwwwwwwww",".wwwwwwwwww.","..ww....ww..","..ww....ww.."],
  dragon: ["..........hh....",".........hhhh...","...w....hhhhhh..","..www..hhkhhhhh.",".wwwww.hhhhhhhmm","wwwwwwwhhhhhhmm.","wwwwwwhhhhhhh...",".wwwwhhhhhhhh...","..hhhhhhhhbb....",".hhhhhhhhbbb....","hhh.hhhhhbb.....","hh..hh..hh......","tt..hh..hh......","ttt............."],
  crown: ["y.y.y.","yyyyyy","yryyry"],
});

/* 주인공 캐릭터: 말씀·공부·층·퇴사 기록으로 해금 */
Object.assign(HAIR, {
  long: ["...hhhh.....", "..hhhhhh...."], cap: ["..hhhhhh....", "..hhhhhhhh.."], side: ["..hhhhh.....", "..hhhhhhh..."],
  bun: ["..hh.hhhh...", "..hhhhhh...."], antenna: [".....e......", "..hhhhhh...."],
});
const CHARS = [
  { id: "choi", n: "최대리", hair: "neat", pal: {}, req: null },
  { id: "lee", n: "이주임", hair: "long", pal: { h: "#5a3a2a", s: "#f7d3b5", g: "#f7d3b5", w: "#ffe6ef", t: "#ff6b8a", p: "#3b4566", b: "#5a2a3a" }, req: { k: "chap", v: 30, d: "말씀 누적 30장" } },
  { id: "park", n: "박인턴", hair: "cap", pal: { h: "#3b7bd6", s: "#f2c9a0", g: "#f2c9a0", w: "#fff7c2", t: "#ffd54a", p: "#4a5578", b: "#eef1f7" }, req: { k: "study", v: 5, d: "공부 누적 5시간" } },
  { id: "kim", n: "김과장", hair: "side", pal: { h: "#3a3a3a", s: "#e8b993", g: "#141418", w: "#cfe3ff", t: "#1d3f73", p: "#2a2e38", b: "#141418" }, req: { k: "floor", v: 100, d: "최고 100층" } },
  { id: "pastor", n: "정전도사", hair: "neat", pal: { h: "#2a2a35", s: "#f2c9a0", g: "#f2c9a0", w: "#1b1b1b", t: "#ffffff", p: "#1b1b1b", b: "#141418" }, req: { k: "rstreak", v: 14, d: "말씀 14일 연속" } },
  { id: "han", n: "한팀장", hair: "bun", pal: { h: "#1c1c22", s: "#f7d3b5", g: "#f7d3b5", w: "#2a2e38", t: "#ffd54a", p: "#2a2e38", b: "#141418" }, req: { k: "retire", v: 3, d: "퇴사 3회" } },
  { id: "robo", n: "로봇 대리", hair: "antenna", pal: { h: "#5b6274", s: "#9aa3b8", g: "#6fd3ff", w: "#c9ced8", t: "#ffd54a", p: "#5b6274", b: "#3b4566", e: "#ff6b6b" }, req: { k: "floor", v: 300, d: "최고 300층" } },
];
function charProgress(c) { return !c.req ? 0 : { chap: S.bible.total, study: S.study.total / 60, floor: S.bestFloor, retire: S.retires, rstreak: S.bible.best }[c.req.k]; }
const charUnlocked = c => !c.req || charProgress(c) >= c.req.v;
const curChar = () => { const c = CHARS.find(x => x.id === S.char); return c && charUnlocked(c) ? c : CHARS[0]; };
const setCh = (s, i, ch) => s.slice(0, i) + ch + s.slice(i + 1);
function heroLookFor(c) {
  const pal = Object.assign({}, PAL.hero, c.pal);
  let hair = c.hair, aura = null;
  SLOTS.forEach(sl => {
    let idx = S.look[sl.id];
    if (idx == null || idx < 0 || !own(sl.id, idx)) { idx = -1; for (let i = 2; i >= 0; i--) if (own(sl.id, i)) { idx = i; break; } }
    if (idx < 0) return;
    const lk = sl.items[idx].look;
    Object.keys(lk).forEach(k => { if (k === "hair") { if (sl.id !== "hair" || idx > 0 || c.id === "choi") hair = lk.hair; } else if (k === "aura") aura = lk.aura; else if (!(sl.id === "hair" && idx === 0 && c.id !== "choi")) pal[k] = lk[k]; });
  });
  if (!pal.a) pal.a = pal.w;
  const map = HERO.slice(); map[0] = HAIR[hair][0]; map[1] = HAIR[hair][1];
  if (hair === "long") for (let r = 2; r <= 7; r++) { if (map[r][1] === ".") map[r] = setCh(map[r], 1, "h"); if (map[r][8] === ".") map[r] = setCh(map[r], 8, "h"); }
  if (hair === "bald") pal.e = pal.e || "#ffd54a";
  return { map, pal, aura };
}
function heroLook() { return heroLookFor(curChar()); }
