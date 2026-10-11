// v43 체력 바: 동작 줄이기 켠 채(사용자 아이폰과 같게) 보스·잡몹을 칠 때 프레임마다 바 모양
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v43hp', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v41_cloud.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 }, reducedMotion: 'reduce' }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38', 'feel39', 'feel40', 'feel41', 'feel42', 'feel43'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1800);
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(250); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {}); else if (i > 8) break; }
  await p.evaluate(() => window.scrollTo(0, 0));
  const top = await p.evaluate(() => { const r = document.querySelector('.stage-top').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await p.evaluate(() => { window.__noAtk = true; });
  for (const [tag, setup, hits] of [['boss', 'S.floor = 340; S.k = 5; S.auto = true; spawn(); 0', [0.08, 0.05, 0.12]], ['mob', 'S.floor = 340; S.k = 2; spawn(); 0', [0.3, 0.15, 0.2]]]) {
    await p.evaluate(c => window.__ev(c), setup); await p.waitForTimeout(1200);
    await p.evaluate(() => window.__ev('bossTime = 999; 0')).catch(() => {});
    let n = 0;
    for (const h of hits) {
      await p.evaluate(x => window.__ev(`mon.hp -= mon.max * ${x}; 0`), h);
      for (let k = 0; k < 8; k++) { await p.screenshot({ path: `uishots/${PREFIX}_${tag}_${String(n++).padStart(2, '0')}.png`, clip: { x: top.x, y: top.y + top.h * 0.56, width: top.w, height: top.h * 0.2 } }); await p.waitForTimeout(60); }
    }
  }
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
