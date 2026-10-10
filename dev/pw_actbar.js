const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  for (const [page, W] of [['old34.html', 320], ['dbg.html', 320], ['old34.html', 375], ['dbg.html', 375]]) {
    const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], viewport: { width: W, height: 760 } }); await fontRoutes(ctx);
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); localStorage.setItem('yageun-knight-v3-menu34', '1'); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
    const p = await ctx.newPage(); await p.goto('http://localhost:8766/' + page); await p.waitForTimeout(1500);
    for (let i = 0; i < 24; i++) { await p.waitForTimeout(300); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 10) break; }
    await p.locator('.actbar').screenshot({ path: `uishots/actbar_${page.replace('.html', '')}_${W}.png` });
    const r = await p.evaluate(() => [...document.querySelectorAll('.actbar button')].map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width)]; }));
    console.log(page, W, JSON.stringify(r));
    await ctx.close();
  }
  await b.close();
})();
