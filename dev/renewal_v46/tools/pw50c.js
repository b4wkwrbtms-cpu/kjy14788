// v50 확인 3: 36편 전부 열어 소제목 수·원문 글자 대조(화면 글자에서 공백 뺀 길이 ≥ 원고 본문)·가로 넘침·오류
const { chromium, devices } = require('playwright');
const PACK = process.argv[2];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 14 Pro'] });
  await ctx.addInitScript(() => { ['menu34','feel35','feel36','feel37','feel38','feel39','feel40','feel41','feel42','feel43','feel44'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(3000);
  const ev = c => p.evaluate(c => { try { return window.__ev(c); } catch (e) { return 'ERR ' + e.message; } }, c);
  await ev('menuGo("bible"); typeof showTab === "function" && showTab("study"); 0'); await p.waitForTimeout(800);
  await p.setInputFiles('#kelFile', PACK); for (let i = 0; i < 20 && !(await ev('kel.ready')); i++) await p.waitForTimeout(500);
  const ids = JSON.parse(await ev('JSON.stringify(kel.list.map(s => s.id))')); let bad = 0;
  for (const id of ids) {
    await ev(`rdSheetClose(); smOpenFromTab("${id}"); 0`); await p.waitForTimeout(700);
    const r = JSON.parse(await ev(`JSON.stringify((() => { const s = kel.by["${id}"], root = document.querySelector(".kl-root"); if (!root) return { err: "no root" };
      const strip = t => t.replace(/\\[주\\s?\\d+\\]|\\[자료[^\\]]{0,20}\\]/g, "").replace(/\\s/g, "");
      const want = strip(s.secs.map(x => x.b.filter(b => b.k !== "del").map(b => (b.sp || "") + b.t).join("")).join(""));
      const secs = [...root.querySelectorAll(".kl-sec")]; const got = strip(secs.map(x => [...x.querySelectorAll("p:not(.kl-hook):not(.kl-key):not(.kl-fnt p), h5, blockquote")].map(e => e.closest(".kl-fnt") ? "" : e.textContent.replace(/주\\d+/g, "")).join("")).join(""));
      return { n: secs.length, want: s.secs.length, chars: [want.length, got.length], hs: document.documentElement.scrollWidth };
    })())`));
    const ok = r.n === r.want && r.chars && r.chars[1] >= r.chars[0] && r.hs <= 393;
    if (!ok) { bad++; console.log(id, JSON.stringify(r)); }
  }
  console.log('checked', ids.length, 'bad', bad, 'errors', errs.length ? errs.slice(0, 4) : 'none'); await b.close();
})();
