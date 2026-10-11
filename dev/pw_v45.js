// v45 성경 읽기 창 확인(390px): 20대 말투 시범 장 · 개역한글 바꾸기 · 계보 빨간 밑줄. node pw_v45.js [prefix] [page]
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v45', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v41_cloud.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38', 'feel39', 'feel40', 'feel41', 'feel42', 'feel43', 'feel44'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.setFixedTime(new Date('2026-10-11T22:30:00+09:00').getTime());
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1800);
  for (let i = 0; i < 30; i++) {
    await p.waitForTimeout(250);
    if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {});
    else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {});
    else if (i > 6) break;
  }
  await p.evaluate(() => { window.__noAtk = true; });
  const open = async (bk, ch) => { await p.evaluate(([x, y]) => window.__ev(`openReader(${x}, ${y}); 0`), [bk, ch]); await p.waitForTimeout(900); };
  const shot = async (name, scrollTo) => {
    if (scrollTo !== undefined) await p.evaluate(y => { const e = document.getElementById('rdBody'); e.scrollTop = typeof y === 'number' ? y : 0; }, scrollTo);
    await p.waitForTimeout(300); await p.screenshot({ path: `uishots/${PREFIX}_${name}.png` });
  };
  const scrollToVerse = async n => p.evaluate(n => { const e = document.getElementById('rdBody'); const ps = e.querySelectorAll('p.mz, p'); const t = Array.from(e.querySelectorAll('sup')).find(s => s.textContent === String(n)); if (t) e.scrollTop = t.getBoundingClientRect().top - e.getBoundingClientRect().top + e.scrollTop - 60; }, n);
  await open(0, 21); await shot('gen22_a', 0); await scrollToVerse(7); await shot('gen22_b'); await scrollToVerse(15); await shot('gen22_c');
  await open(0, 0); await shot('gen1_a', 0); await scrollToVerse(26); await shot('gen1_b');
  await open(18, 22); await shot('ps23', 0);
  await open(39, 0); await shot('mat1_a', 0); await scrollToVerse(16); await shot('mat1_b');
  await p.click('[data-r="v-krv"]'); await p.waitForTimeout(400); await shot('mat1_krv', 0);
  console.log('rdv after toggle', await p.evaluate(() => window.__ev('S.rdv')));
  await p.click('[data-r="v-mz"]'); await p.waitForTimeout(300);
  await open(0, 1); await shot('gen2_fallback', 0);
  console.log('sub', await p.evaluate(() => document.getElementById('rdSub').textContent));
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
