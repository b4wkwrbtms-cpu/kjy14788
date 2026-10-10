// v36 리그 시제품: 게임 데이터(HERO·HAIR·PAL·CHARS·WITEMS)로 모양을 만들고 자세별 도트 격자(테두리·음영 포함)를 JSON으로
// node proto36.js game.html poses.json out.json
const fs = require("fs"), vm = require("vm");
const [, , htmlPath, posePath, outPath] = process.argv;
const html = fs.readFileSync(htmlPath, "utf8");
function grab(startPat) {
  const i = html.indexOf(startPat); if (i < 0) throw new Error("not found " + startPat);
  // 괄호 균형으로 정의 끝 찾기 (문자열 안 괄호는 무시)
  let j = startPat.startsWith("function") ? html.indexOf(")", i) + 1 : html.indexOf("=", i) + 1, depth = 0, started = false, q = null;
  for (; j < html.length; j++) {
    const ch = html[j];
    if (q) { if (ch === "\\") { j++; continue; } if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { q = ch; continue; }
    if (ch === "{" || ch === "[" || ch === "(") { depth++; started = true; }
    else if (ch === "}" || ch === "]" || ch === ")") { depth--; if (started && depth === 0) { j++; break; } }
  }
  let end = j; while (html[end] === ";" ) end++;
  return html.slice(i, end).replace(/^const |^let /, "var ");
}
const ctx = { console, Math, JSON, Object, Array, String, Number, Map, WeakMap, Set, RegExp, parseInt, parseFloat, isNaN };
vm.createContext(ctx);
const code = [
  grab("function hexRGB"), grab("function rgbHex"), grab("function shade("),
  grab("const HERO = "), grab("const HAIR = "), grab("const PAL = "), grab("const CHARS = "),
  "var setCh = (s, i, ch) => s.slice(0, i) + ch + s.slice(i + 1);",
  grab("function heroMap"), grab("function heroPal"), grab("function prettyPixels"),
  grab("var WITEMS = "), 'var WL_POOL = "0123456789!#$%&*+-/:;<=>?@^_~ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ", WL_ORDER = ["top", "tie", "arm", "shoes", "head", "prop"];',
  "var heroMapCache;",
  grab("function wardCompose"),
  fs.readFileSync(__dirname + "/rig36.js", "utf8"),
].join("\n");
vm.runInContext(code, ctx);
const P = JSON.parse(fs.readFileSync(posePath, "utf8"));
const out = [];
P.looks.forEach(lk => {
  const c = vm.runInContext(`CHARS.find(x => x.id === ${JSON.stringify(lk.char || "choi")})`, ctx);
  const sh = {}; (lk.items || []).forEach(id => { const it = vm.runInContext(`WITEMS.find(x => x.id === ${JSON.stringify(id)})`, ctx); if (it) sh[it.slot] = it; });
  ctx.__c = c; ctx.__sh = sh;
  const look = vm.runInContext("wardCompose(__c, __sh)", ctx);
  P.poses.forEach(pose => {
    ctx.__look = look; ctx.__pose = pose;
    const res = vm.runInContext(`(() => {
      const R = rigBody(__look, rigQ(__pose)), arm = rigArm(R, __pose);
      const pal = __look.pal, p2 = Object.assign({}, pal);
      const sl = pal[R.sleeve] || "#1c1c26"; p2.A = /^#[0-9a-f]{6}$/i.test(sl) ? shade(sl, 0.16) : sl; p2.X = pal[R.cuff] || sl; p2.S = pal[R.skin] || "#f2c9a0";
      return { body: prettyPixels(R.map, pal), arm: prettyPixels(arm.map, p2), abx: arm.bx, aby: arm.by, hx: arm.hx, hy: arm.hy, P: R.P, top: R.top, w: R.map[0].length, h: R.map.length };
    })()`, ctx);
    out.push({ look: lk.name, pose: pose.name, wa: pose.wa, dx: pose.dx || 0, lift: pose.lift || 0, ...res });
  });
});
fs.writeFileSync(outPath, JSON.stringify(out));
console.log("ok", out.length);
