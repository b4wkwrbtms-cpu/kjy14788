// v43 전투 화면: 등급별 무기 이펙트 (들고 있을 때 · 칠 때) — 사용자 기록, 390px
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v43bt', PAGE = process.argv[3] || 'dbg.html', LIST = (process.argv[4] || '17,23,35,47,61,65').split(',').map(Number);
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v41_cloud.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 } }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38', 'feel39', 'feel40', 'feel41', 'feel42', 'feel43'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1800);
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(250); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {}); else if (i > 8) break; }
  await p.evaluate(() => window.scrollTo(0, 0));
  const box = await p.evaluate(() => { const cs = Array.from(document.querySelectorAll('canvas')).map(c => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }).filter(r => r.w > 300 && r.h > 150); return cs[0]; });
  console.log('canvas', JSON.stringify(box));
  for (const wi of LIST) {
    await p.evaluate(w => window.__ev(`S.wi = ${w}; S.wl = 5; S.skin = -1; S.wunl = Math.max(S.wunl, ${w}); S.fx = Object.assign(S.fx || {}, { shake: 0, flash: 0 }); updateUI(true); 0`), wi);
    for (let k = 0; k < 3; k++) { await p.waitForTimeout(k ? 210 : 1200); await p.screenshot({ path: `uishots/${PREFIX}_${wi}_${k}.png`, clip: { x: box.x, y: box.y + box.h * 0.38, width: box.w, height: box.h * 0.62 } }); }
  }
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
