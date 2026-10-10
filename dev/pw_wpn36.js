// v36 무기 목록 아이콘 확인: 성장 › 무기 화면 (복원 기록 · 새 기록)
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'wpn', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  for (const fresh of [false, true]) {
    const save = fresh ? null : JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
    const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 } }); await fontRoutes(ctx);
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); localStorage.setItem('yageun-knight-v3-menu34', '1'); localStorage.setItem('yageun-knight-v3-feel35', '1'); localStorage.setItem('yageun-knight-v3-feel36', '1'); if (f) { const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } } }, save ? JSON.stringify(save) : '');
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1500);
    for (let i = 0; i < 24; i++) { await p.waitForTimeout(300); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {}); }
    await p.evaluate(() => { window.__noAtk = true; });
    if (fresh) await p.evaluate(() => window.__ev('S.wi = 6; S.wl = 3; S.gold = 1e9; updateUI(true); 0'));
    await p.click('#tabs button[data-g="grow"]'); await p.waitForTimeout(400);
    const tb = p.locator('[data-tab="weapon"], button[data-t="weapon"]').first(); if (await tb.count()) await tb.click().catch(() => {});
    await p.waitForTimeout(600);
    await p.screenshot({ path: `uishots/${PREFIX}_${fresh ? 'fresh' : 'restore'}.png`, fullPage: true });
    console.log(fresh ? 'fresh' : 'restore', 'errors', errs.length ? errs.slice(0, 3) : 'none');
    await ctx.close();
  }
  await b.close();
})();
