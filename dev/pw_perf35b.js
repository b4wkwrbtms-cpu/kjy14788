const { chromium, devices } = require('playwright');
const fs = require('fs');
const save = fs.readFileSync('restore/save_v30.json', 'utf8');
(async () => {
  const b = await chromium.launch();
  for (const page of ['old34.html', 'new35.html', 'old34.html', 'new35.html']) {
    const ctx = await b.newContext({ ...devices['iPhone 14 Pro'] });
    await ctx.addInitScript(([f]) => { const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); localStorage.setItem('yageun-knight-v3-menu34', '1'); }, [save]);
    const p = await ctx.newPage();
    await p.goto('http://localhost:8766/' + page); await p.waitForTimeout(3000);
    await p.evaluate(() => { const c = document.getElementById('celeb'); if (c && !c.hidden) c.click(); const bg = document.getElementById('backGo'); if (bg && bg.offsetParent) bg.click(); });
    await p.waitForTimeout(1000);
    await p.evaluate(() => window.__ev(`(() => { window.__pf = { draw: 0, step: 0, hero: 0, n: 0 };
      const wrap = (name, key) => { const f = eval(name); if (typeof f !== "function") return; const g = function () { const t = performance.now(); const r = f.apply(this, arguments); window.__pf[key] += performance.now() - t; return r; }; eval(name + " = g"); };
      wrap("draw", "draw"); wrap("step", "step"); if (typeof drawHeroRig === "function") { wrap("drawHeroRig", "hero"); wrap("feelFront", "hero"); }
      const _f = frame; })()`));
    await p.waitForTimeout(5000);
    const r = await p.evaluate(() => window.__ev('JSON.stringify(window.__pf)'));
    const o = JSON.parse(r);
    console.log(page.padEnd(11), 'draw 합', o.draw.toFixed(0) + 'ms', 'step 합', o.step.toFixed(0) + 'ms', '곽준영 그리기 합', o.hero.toFixed(0) + 'ms');
    await ctx.close();
  }
  await b.close();
})();
