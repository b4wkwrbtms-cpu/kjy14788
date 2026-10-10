// 기둥 9 화면 둘러보기: 묶음마다 화면 사진 (390px), 선택: 320px
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'ui', W = +(process.argv[3] || 390), PAGE = process.argv[4] || 'dbg.html', ZOOM = +(process.argv[5] || 0);
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: W, height: 760 } }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); localStorage.setItem('yageun-knight-v3-menu34', '1'); const s = JSON.parse(f[0]); if (f[1]) s.fx = Object.assign(s.fx || {}, { ui: f[1] }); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, [JSON.stringify(save), ZOOM]);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1500);
  for (let i = 0; i < 24; i++) { await p.waitForTimeout(300); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 10) break; }
  await p.evaluate(() => { window.__noAtk = true; });
  for (const g of ['word', 'grow', 'work', 'info', 'set']) {
    await p.click(`#tabs button[data-g="${g}"]`); await p.waitForTimeout(500);
    await p.screenshot({ path: `uishots/${PREFIX}_${W}_${g}.png`, fullPage: true });
  }
  console.log('errors', errs.length ? errs.slice(0, 3) : 'none');
  await b.close();
})();
