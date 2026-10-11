// v44 암송 화면 확인(390px, 사용자 기록): 안내 · 지금(1바퀴 1일차) · 외우기 화면 · 날마다 다 통과했다고 치고 12일차 · 2바퀴 3일차
// 날짜는 page.clock.setFixedTime으로 옮김(타이머는 그대로). node pw_v44.js [prefix] [page]
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v44', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v41_cloud.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38', 'feel39', 'feel40', 'feel41', 'feel42', 'feel43'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const base = new Date('2026-10-11T17:30:00+09:00').getTime();
  await p.clock.setFixedTime(base);
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1800);
  const clear = async (shotNotice) => {
    for (let i = 0; i < 30; i++) {
      await p.waitForTimeout(250);
      const t = await p.evaluate(() => { const c = document.getElementById('celeb'); return c && !c.hidden ? (c.textContent || '') : ''; });
      if (shotNotice && t.indexOf('하루 5구절 암송') >= 0) { await p.waitForTimeout(700); await p.screenshot({ path: `uishots/${PREFIX}_notice.png` }); shotNotice = false; }
      if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {});
      else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {});
      else if (i > 6) break;
    }
  };
  await clear(true);
  const goMem = async () => { await p.evaluate(() => { window.__noAtk = true; window.__ev('selectTab("mem", true); updateUI(true); 0'); window.scrollTo(0, 0); }); await p.waitForTimeout(600); };
  const topShot = async name => {
    const r = await p.evaluate(() => { const a = document.getElementById('mM').closest('.card').getBoundingClientRect(), g = document.getElementById('mGo').getBoundingClientRect(); return { y: a.top + window.scrollY, h: a.height, hb: g.bottom - a.top }; });
    await p.screenshot({ path: `uishots/${PREFIX}_${name}.png`, clip: { x: 0, y: Math.max(0, r.y - 8), width: 390, height: r.h + 16 }, fullPage: true });
    await p.screenshot({ path: `uishots/${PREFIX}_${name}_btn.png`, clip: { x: 0, y: Math.max(0, r.y - 8), width: 390, height: r.hb + 22 }, fullPage: true });
  };
  const planShot = async (name, day) => {
    await p.evaluate(d => { const rows = Array.from(document.querySelectorAll('.memday')); const h = rows[d - 1] && rows[d - 1].querySelector('.memday-h'); if (h) h.click(); }, day);
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => { const rows = Array.from(document.querySelectorAll('.memday')), pan = rows[0].parentElement, hd = pan.previousElementSibling; const a = (hd || rows[0]).getBoundingClientRect(), z = rows[rows.length - 1].getBoundingClientRect(); return { y: a.top + window.scrollY, h: z.bottom - a.top }; });
    await p.screenshot({ path: `uishots/${PREFIX}_${name}.png`, clip: { x: 0, y: r.y - 6, width: 390, height: r.h + 14 }, fullPage: true });
    await p.evaluate(d => { const rows = Array.from(document.querySelectorAll('.memday')); const h = rows[d - 1] && rows[d - 1].querySelector('.memday-h'); if (h) h.click(); }, day);
  };
  await goMem();
  await topShot('now'); await planShot('plan_now', 1);
  console.log('now', await p.evaluate(() => window.__ev('memRoundLine() + " | " + document.getElementById("mGo").textContent')));
  // 외우기 화면 (201)
  await p.click('#mGo'); await p.waitForTimeout(700);
  const box = await p.evaluate(() => { const a = document.getElementById('memBox').getBoundingClientRect(); return { y: a.top + window.scrollY, h: a.height }; });
  await p.screenshot({ path: `uishots/${PREFIX}_learn.png`, clip: { x: 0, y: Math.max(0, box.y - 8), width: 390, height: Math.min(900, box.h + 16) }, fullPage: true });
  await p.evaluate(() => window.__ev('memSess = null; memRender(); 0'));
  // 날마다 다 통과했다고 치고 하루씩
  const passAll = () => p.evaluate(() => window.__ev('(() => { memTryUnlock(); let k = 0, q; while ((q = memQueue()).length && k < 400) { memPass(q[0]); k++; } memTryUnlock(); return k; })()'));
  const loads = [await passAll()];
  for (let d = 2; d <= 23; d++) {
    await p.clock.setFixedTime(base + (d - 1) * 86400000);
    await p.evaluate(() => window.__ev('rollDay(); memTryUnlock(); 0'));
    if (d === 12 || d === 23) {
      await clear(false); await goMem();
      await topShot(d === 12 ? 'd12' : 'r2'); await planShot(d === 12 ? 'plan_d12' : 'plan_r2', d === 12 ? 1 : 3);
      console.log('day', d, await p.evaluate(() => window.__ev('memRoundLine() + " | " + document.getElementById("mGo").textContent')));
    }
    loads.push(await passAll());
  }
  console.log('loads', loads.join(' '));
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
