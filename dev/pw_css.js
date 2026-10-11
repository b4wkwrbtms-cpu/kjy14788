const { chromium, devices } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const save = JSON.parse(fs.readFileSync('restore/save_v41_cloud.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], viewport: { width: 390, height: 760 } });
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34','feel35','feel36','feel37','feel38','feel39','feel40','feel41','feel42'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => { const c = document.getElementById('celeb'); if (c) c.hidden = true; const bk = document.getElementById('back'); if (bk) bk.hidden = true; });
  await p.click('#tabs button[data-g="grow"]').catch(() => {}); await p.waitForTimeout(800);
  console.log(await p.evaluate(() => { const r = document.querySelector('.wgl-r.cur'); if (!r) return 'no row'; const cs = getComputedStyle(r), n = r.querySelector('.wgl-n'); return JSON.stringify({ disp: cs.display, cols: cs.gridTemplateColumns, n: n ? getComputedStyle(n).gridColumnStart + '/' + getComputedStyle(n).gridColumnEnd : 'none', html: r.outerHTML.slice(0, 300) }); }));
  await b.close();
})();
