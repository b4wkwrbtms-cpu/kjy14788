// 사용자 설정으로 성장 탭(무기) 화면 — 예전(v35)·지금 비교
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'uw', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 }, reducedMotion: 'reduce' }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1500);
  for (let i = 0; i < 24; i++) { await p.waitForTimeout(300); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {}); else if (i > 10) break; }
  await p.evaluate(() => { window.__noAtk = true; window.__ev('S.bestFloor = Math.max(S.bestFloor || 0, 329); S.maxFloor = Math.max(S.maxFloor || 0, 329); S.wi = 20; S.wl = 5; S.skin = -1; S.char = "robo"; S.gold = 1e30; updateUI(true); 0'); });
  await p.click('#tabs button[data-g="grow"]'); await p.waitForTimeout(800);
  await p.screenshot({ path: `uishots/${PREFIX}_grow.png`, fullPage: true });
  console.log(PREFIX, 'errors', errs.length ? errs.slice(0, 3) : 'none');
  await b.close();
})();
