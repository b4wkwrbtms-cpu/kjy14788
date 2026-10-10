/* ===================== 메뉴용 도트 아이콘 (탭·자원·버프·축하) =====================
   지도 한 칸 = 화면 픽셀 여러 개. 기기 화소 밀도에 맞춰 정수 배로 그려서 흐릿하지 않게. */
const UIICON = {
  weapon: { m: ["............wW", "...........wWw", "..........wWw.", ".........wWw..", "........wWw...", ".......wWw....", "...g..WWw.....", "..gggWWw......", "...gggw.......", "...hheg.......", "..hhhggg......", ".hhh..g.......", ".pp...........", ".pp..........."], p: {"W": "#f4f8ff", "w": "#a9b6d0", "g": "#ffd54a", "h": "#7c5cff", "p": "#ffb53a", "e": "#ff6b6b"} },
  bible: { m: ["..............", ".CCcccccccc...", ".CCccccccccpp.", ".CCcccggcccpp.", ".CCcccggcccpp.", ".CCcggggggcpp.", ".CCcggggggcpp.", ".CCcccggcccpp.", ".CCcccggcccpp.", ".CCcccggcccpp.", ".CCcccggcccpp.", ".CCccccccccpp.", ".CCccccccrcpp.", "...pppppprppp."], p: {"p": "#f4ead2", "c": "#8a2436", "C": "#5c1424", "g": "#ffd54a", "r": "#6fd3ff"} },
  mem: { m: ["..............", "RrrrrrrrrrrrrR", "RrrrrrrrrrrrrR", "..pppppppppp..", "..ppllllllpp..", "..pppppppppp..", "..pplllllllp..", "..pppppppppm..", "..pplllllpmm..", "..ppppppppmm..", "..pppppppppp..", "RrrrrrrrrrrrrR", "RrrrrrrrrrrrrR", ".............."], p: {"p": "#f6e7c1", "r": "#a8643a", "R": "#ffd54a", "l": "#9a8466", "m": "#a8f0c6"} },
  study: { m: ["..............", "..............", "...sssssss....", "...ssssssss...", ".......hhhss..", ".......hh..s..", "......hh......", ".....hh.......", "....hh........", "...hh.....oo..", "..hh.....ooOo.", ".hhh......boo.", ".hh.......ooo.", "..........ooo."], p: {"s": "#c9d2e6", "h": "#a8643a", "o": "#6fd3ff", "O": "#e6f6ff", "b": "#3a7bd6"} },
  pet: { m: ["..............", "..............", ".ooo......ooo.", ".opoo....oopo.", ".oopooOoOopoo.", ".oooooOoOoooo.", ".oooooooooooo.", "..ooooooooooo.", "..ookooookooo.", "..ookooookooo.", "y.ooowppwooooy", "...oowwwwooo..", "....owwwwoo...", ".......o......"], p: {"o": "#ff9b3d", "O": "#d9701c", "p": "#ffb3c1", "k": "#1a1a22", "w": "#fff4e0", "y": "#ffe14a"} },
  suit: { m: ["..............", "...jjwwwwjj...", "..jjJwttwJjj..", ".jjjJwttwJjjj.", "jjjjjJttJjjjjj", "jjjjjJttJjjjjj", "jjjjjjJJjjjjjj", "jjjjjjjjjjjjjj", "jjjjjjjjjjjjjj", "jwwjjjjgjjjjjj", "jjjjjjjjjjjjjj", "jjjjjjjgjjjjjj", "jjjjjjjjjjjjjj", "jjjjjjjjjjjjjj"], p: {"j": "#3b4566", "J": "#262e48", "w": "#f4f6fb", "t": "#e0403d", "g": "#ffd54a"} },
  treasure: { m: ["...........c.c", "............W.", "...g.bbbb.g...", "...gbbbbbbg...", ".bbgbbbbbbgbb.", ".bbgbggggbgbb.", ".gggggkkggggg.", ".BBgBgkggBgBB.", ".bbgbggggbgbb.", ".bbgbbbbbbgbb.", ".bbgbbbbbbgbb.", ".bbgbbbbbbgbb.", ".bbgbbbbbbgbb.", ".............."], p: {"b": "#9a5f2c", "B": "#6e3e1a", "g": "#ffd54a", "k": "#1a1a22", "W": "#ffffff", "c": "#ffe680"} },
  daily: { m: ["....mmmmmm....", ".bbbmmmmmmbbb.", ".bbbmmmmmmbbb.", ".bwwwwwwwwwwb.", ".bwwwwwwwwwwb.", ".bwwllllllwcc.", ".bwwwwwwwwccb.", ".bwwlllllccwb.", ".bwwwccwccwwb.", ".bwwllccclwwb.", ".bwwwwwcwwwwb.", ".bwwllllwwwwb.", ".bwwwwwwwwwwb.", ".bbbbbbbbbbbb."], p: {"b": "#a8643a", "w": "#f4f6fb", "m": "#8d97b6", "l": "#b9c1d6", "c": "#3fc77a"} },
  info: { m: [".....rrrr.....", ".....rrrr.....", "......mm......", ".bbbbbbbbbbbb.", ".bbbbbbbbbbbb.", ".bbbbbbbbbbbb.", ".wwwwwwwwwwww.", ".wlhhlwlllllw.", ".wlsslwwwwwww.", ".wlsslwllllww.", ".wjjjjwwwwwww.", ".wjjjjwlllllw.", ".wwwwwwwwwwww.", ".wwwwwwwwwwww."], p: {"r": "#3b7bd6", "m": "#c9d2e6", "w": "#f4f6fb", "b": "#3b7bd6", "s": "#f2c9a0", "h": "#2a2a35", "l": "#9aa6c2", "j": "#3b4566"} },
  retire: { m: ["..............", "..............", "..............", "lwwwwwwwwwwwwl", "wllwwwwwwwwllw", "wwwlwwwwwwlwww", "wwwlwwwwwwlwww", "wwwwllrrllwwww", "wwwwwrRrrwwwww", "wwwwwrrrrwwwww", "wwwwwwrrwwwwww", "wwwwwwwwwwwwww", ".lllllllllllll", ".............."], p: {"w": "#f4f6fb", "l": "#b9c1d6", "r": "#e0403d", "R": "#ff8a7a", "k": "#1a1a22"} },
  coin: { m: ["....GG....", "..GGGGGG..", ".GWWgggGG.", ".GWgggggG.", "GGgghhggGG", "GGgghhggGG", ".GggggggG.", ".GGggggGG.", "..GGGGGG..", "....GG...."], p: {"g": "#ffd54a", "G": "#d9a21c", "W": "#fff7c2", "h": "#6b4a0c"} },
  manna: { m: [".g........", "....m...g.", "..m...m...", "..mmmmmm..", ".mmmmmmmm.", "bBBBBBBBBb", ".bbbbbbbb.", ".bbbbbbbb.", ".bbbbbbbb.", ".........."], p: {"b": "#b07a3a", "B": "#8a5a2b", "m": "#f8f4e2", "g": "#a8f0c6"} },
  stamp: { m: ["..........", "...hhhh...", "...hHHh...", "....HH....", "....HH....", "....HH....", ".rrrrrrrr.", ".rRrrrrrr.", ".rrrrrrrr.", "rrrrrrrrrr"], p: {"h": "#a8643a", "H": "#7a4220", "r": "#e0403d", "R": "#ff8a7a"} },
  ore: { m: ["..........", "...o......", "..oOo.....", "..oOoo....", ".ooooo.b..", ".ooooobbb.", ".ooooobbbb", "..oooobbb.", "..oooobbb.", "..ooo.bbb."], p: {"o": "#6fd3ff", "O": "#e6f6ff", "b": "#2b8fb8"} },
  silver: { m: ["..........", "..SSSSSS..", "..SWWSSS..", ".SSSSSSSS.", "SSSSSSSSSS", ".ssssssss.", ".ssssssss.", ".ssssssss.", ".ssssssss.", ".........."], p: {"s": "#aab6cc", "S": "#eef3fb", "W": "#ffffff"} },
  ame: { m: ["..........", "..AAAAAA..", ".AAAAAAAA.", "aaaaaaaaaa", ".aaaaaddd.", ".aaaaaddd.", "..aaaadd..", "...aaad...", "....ad....", ".........."], p: {"a": "#b07cff", "A": "#e2ccff", "d": "#7a4fd6"} },
  dps: { m: ["........wW", ".......wWw", "......wWw.", ".....wWw..", "....wWw...", ".ggwWw....", "..hgw.....", ".hhhg.....", "hhh.g.....", "hh........"], p: {"W": "#f4f8ff", "w": "#a9b6d0", "g": "#ffd54a", "h": "#7c5cff"} },
  haste: { m: [".......yy...", "......yy....", "......Yy....", ".....Yy.....", "....yyyyyy..", "...yyyyyy...", "..yyyyyy....", ".....yyy....", ".....yy.....", ".....y......", "....y.......", "............"], p: {"y": "#ffe14a", "Y": "#fff7c2", "o": "#ff9b3d"} },
  gold2: { m: ["............", "....bbbb....", "....bbbb....", "....rrrr....", ".....bbb....", "...bbbbbbb..", "..bbbgGgbbb.", ".bbbggGggbbb", ".bbbggGggbbb", "..bbggGggbb.", "..bbbgGgbbb.", "...bbbbbbb.."], p: {"b": "#c9a26b", "B": "#9a7444", "r": "#e0403d", "g": "#ffd54a", "G": "#b8941c"} },
  rage: { m: ["............", ".....rr.....", ".....rrr....", ".....rrrr...", "..r.rrorr...", ".rrrrrorrr..", ".rrrrooorrr.", ".rrrroooorr.", ".rroooyoorr.", "..rroyyyrr..", "...rryyyr...", "....rryr...."], p: {"r": "#ff4d3d", "o": "#ff9b3d", "y": "#ffe14a"} },
  sound: { m: ["............", ".....m......", "....mm....w.", "...mmm.....w", "MMmmmm..w..w", "MMmmmm..w..w", "MMmmmm..w..w", "MMmmmm..w..w", "...mmm.....w", "....mm....w.", ".....m......", "............"], p: {"m": "#c9d2e6", "M": "#8d97b6", "w": "#6fd3ff"} },
  mute: { m: ["............", ".....m......", "....mm......", "...mmm......", "MMmmmm..x..x", "MMmmmm...xx.", "MMmmmm...xx.", "MMmmmm..x..x", "...mmm......", "....mm......", ".....m......", "............"], p: {"m": "#8d97b6", "M": "#5a6482", "x": "#ff6b6b"} },
  trophy: { m: ["..............", "gggggggggggggg", "g..gWWggggg..g", "g..gWgrrrgg..g", ".gggggrrrgggg.", "...gggggggg...", "....gggggg....", ".....gggg.....", "......GG......", "......GG......", "....gggggg....", "...bbbbbbbb...", "...bbggggbb...", "...bbbbbbbb..."], p: {"g": "#ffd54a", "G": "#c9962a", "W": "#fff7c2", "b": "#6e3e1a", "r": "#e0403d"} },
  star: { m: ["..............", "..............", "......yy......", "......yy......", ".....yYyy.....", "yyyyyyYyyyyyyy", "..yyyYyyyyyy..", "...yyyyyyyy...", "....yyyyyy....", "....yyyyyy....", "....yyyyyy....", "...yyy..yyy...", "...y......y...", ".............."], p: {"y": "#ffe14a", "Y": "#fff7c2", "o": "#ffb53a"} },
  lvup: { m: ["..............", "......gg......", ".....gWgg.....", "....gWgggg....", "...gggggggg...", "..gggggggggg..", ".gggggggggggg.", "....gggggg....", "....gggggg....", "....gggggg....", "....gggggg....", "....gggggg....", "....gggggg....", ".............."], p: {"g": "#7fe3a0", "G": "#3fb871", "W": "#e6fff0"} },
  skull: { m: ["h........h", ".hwwwwwwh.", ".wwwwwwww.", ".wrrwwrrw.", ".wrrwwrrw.", ".wrrwwrrw.", ".wwwddwww.", "..wwwwww..", "..wwwwww..", "..wdwwdw.."], p: {"w": "#f4efe6", "r": "#ff4d4d", "h": "#ffd54a", "d": "#3a2a2a"} },
  lock: { m: ["...mmmm...", "..m....m..", "..m....m..", "..m....m..", ".yyyyyyyy.", ".yyyyyyyy.", ".yyykkyyy.", ".yyykkyyy.", ".yyyyyyyy.", ".yyyyyyyy."], p: {"m": "#c9d2e6", "y": "#ffd54a", "k": "#1a1a22"} },
  music: { m: ["............", "....m....nnn", "...mm....nnn", "..mmm....n.n", "MMmmm....n..", "MMmmm....n..", "MMmmm....n..", "MMmmm....n..", "..mmm...nn..", "...mm..nnn..", "....m..nnn..", "............"], p: {"m": "#c9d2e6", "M": "#8d97b6", "n": "#ffd54a"} }
};
const uiDpr = () => Math.max(1, Math.min(3, Math.round((typeof window !== "undefined" && window.devicePixelRatio) || 1)));
function pixIcon(name, css = 28) {
  const ic = UIICON[name], c = document.createElement("canvas");
  c.className = "pix";
  if (!ic) { c.width = c.height = 1; return c; }
  const units = ic.m.length + 2, d = uiDpr(), u = Math.max(1, Math.round(css * d / units));
  c.width = c.height = units * u;
  if (c.style) c.style.width = c.style.height = (units * u / d) + "px";
  const g = c.getContext && c.getContext("2d");
  if (g) { g.imageSmoothingEnabled = false; drawSprite(g, ic.m, ic.p, u, u, u, { pretty: true }); }
  return c;
}
/* 큰 그림(축하 팝업용): 아무 도트 지도나 정수 배로 키워 가운데에 */
function bigSprite(map, pal, css = 72, flip = false) {
  const h = map.length, w = Math.max(...map.map(r => r.length)), units = Math.max(w, h) + 2, d = uiDpr();
  const u = Math.max(1, Math.floor(css * d / units)), size = units * u, c = document.createElement("canvas");
  c.className = "pix"; c.width = c.height = size;
  if (c.style) c.style.width = c.style.height = (size / d) + "px";
  const g = c.getContext && c.getContext("2d");
  if (g) { g.imageSmoothingEnabled = false; drawSprite(g, map, pal, u * (1 + Math.floor((units - 2 - w) / 2)), u * (1 + Math.floor((units - 2 - h) / 2)), u, { pretty: true, flip }); }
  return c;
}
/* 글자 사이에 넣는 작은 아이콘: <i class="ri ri-coin"></i> (그림은 CSS 배경으로 한 번만 만들어 둠) */
const RI_NAMES = ["coin", "manna", "stamp", "ore", "silver", "ame", "dps", "haste", "gold2", "rage", "skull", "lock", "trophy", "star", "lvup", "weapon", "bible", "mem", "study", "pet", "suit", "treasure", "daily", "info", "retire"];
(function riStyles() {
  try {
    if (!document.head || !document.createElement("canvas").toDataURL) return;
    const css = RI_NAMES.map(n => `.ri-${n}{background-image:url(${pixIcon(n, 16).toDataURL("image/png")})}`).join("");
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  } catch (e) {}
})();
const ri = (n, cls = "") => `<i class="ri ri-${n}${cls ? " " + cls : ""}" aria-hidden="true"></i>`;
const CUR_ICON = { "만나": "manna", "광석": "ore", "도장": "stamp", "은괴": "silver", "자수정": "ame" };
const RW_ICON = { manna: "manna", stamp: "stamp", ore: "ore", silver: "silver", ame: "ame", haste: "haste", gold2: "gold2", rage: "rage" };
/* "만나 45" → 아이콘 45 */
const curHTML = s => String(s).replace(/(만나|광석|도장|은괴|자수정)\s+([\d.,]+[A-Za-z]*)/g, (m, k, v) => `<span class="cur">${ri(CUR_ICON[k])}${v}</span>`);
const rwHTML = rw => Object.entries(rw).map(([k, v]) => `<span class="rw" title="${RW_NAME[k]}">${ri(RW_ICON[k] || "star")}${v}</span>`).join("");
/* 구매 버튼 속: 비용이면 위에 할 일(강화·구매), 아래에 아이콘+값. 아니면 글자 그대로 */
function btnInner(b) {
  const lab = String(b.label), m = /^(만나|광석|도장|은괴|자수정)\s+(.+)$/.exec(lab), won = /^([\d.,]+[A-Za-z]*)원$/.exec(lab);
  if (m || won) {
    const cost = m ? `${ri(CUR_ICON[m[1]])}${m[2]}` : `${ri("coin")}${won[1]}`;
    return (b.sub ? `<small>${curHTML(b.sub)}</small>` : "") + `<span class="cost">${cost}</span>`;
  }
  return `<span class="act">${lab}</span>` + (b.sub ? `<small>${curHTML(b.sub)}</small>` : "");
}
const isMaxLabel = l => /^(최대|MAX|해금됨|완료|받음)/.test(String(l));
