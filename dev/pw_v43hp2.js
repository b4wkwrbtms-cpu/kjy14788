// v43 체력 바 보고용: 동작 줄이기 켠 채(사용자 아이폰과 같게) 한 번 맞힌 뒤 시간마다 바 모양 + 맞은 뒤 몇 초인지 기록
// node pw_v43hp2.js [prefix] [page]  → uishots/<prefix>_<tag>_NN.png + uishots/<prefix>_times.json
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v43hq', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v41_cloud.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 }, reducedMotion: 'reduce' }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38', 'feel39', 'feel40', 'feel41', 'feel42', 'feel43'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1800);
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(250); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {}); else if (i > 8) break; }
  await p.evaluate(() => window.scrollTo(0, 0));
  const bar = await p.evaluate(() => { const r = document.getElementById('hpBar').parentElement.getBoundingClientRect(), n = document.getElementById('monName').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, ny: n.y }; });
  const clip = { x: Math.max(0, bar.x - 6), y: Math.max(0, Math.min(bar.ny, bar.y) - 4), width: Math.min(390, bar.w + 12), height: (bar.y + bar.h + 6) - (Math.min(bar.ny, bar.y) - 4) };
  await p.evaluate(() => { window.__noAtk = true; });
  const times = {};
  for (const [tag, setup, hit] of [['boss', 'S.floor = 340; S.k = 5; S.auto = true; spawn(); 0', 0.1], ['mob', 'S.floor = 340; S.k = 2; spawn(); 0', 0.3]]) {
    await p.evaluate(c => window.__ev(c), setup); await p.waitForTimeout(1400);
    await p.evaluate(() => window.__ev('bossTime = 999; mon.hp = mon.max * 0.97; 0')).catch(() => {}); await p.waitForTimeout(1200);
    times[tag] = [];
    await p.screenshot({ path: `uishots/${PREFIX}_${tag}_00.png`, clip }); times[tag].push(-1);
    const t0 = await p.evaluate(x => { window.__ev(`mon.hp -= mon.max * ${x}; 0`); return performance.now(); }, hit);
    for (let k = 1; k <= 9; k++) {
      const t = await p.evaluate(() => performance.now());
      await p.screenshot({ path: `uishots/${PREFIX}_${tag}_${String(k).padStart(2, '0')}.png`, clip });
      const t2 = await p.evaluate(() => performance.now());
      times[tag].push([Math.round(t - t0), Math.round(t2 - t0)]);
      await p.waitForTimeout(k < 5 ? 10 : 80);
    }
  }
  fs.writeFileSync(`uishots/${PREFIX}_times.json`, JSON.stringify(times));
  console.log('clip', JSON.stringify(clip), 'times', JSON.stringify(times));
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
