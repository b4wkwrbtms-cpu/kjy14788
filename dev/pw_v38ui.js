// v38: 설정 › 화면 '곽준영 몸 동작' 줄 · 인사 기록 '동작 미리 보기' 버튼 → 누르면 전투 화면에서 그 직무 동작 (390px, 휴대폰 '동작 줄이기' 켬)
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v38', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 }, reducedMotion: 'reduce' }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1500);
  for (let i = 0; i < 24; i++) { await p.waitForTimeout(300); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 10) break; }
  console.log('reduceMotion', await p.evaluate(() => window.__ev('reduceMotion')));
  // 설정 › 화면
  await p.click('#tabs button[data-g="set"]'); await p.waitForTimeout(600);
  const rows = await p.evaluate(() => [...document.querySelectorAll('.fxset.scr .fx-row > span')].map(s => s.textContent));
  console.log('화면 설정 줄', rows);
  const bodyBtns = await p.evaluate(() => [...document.querySelectorAll('button[data-fx="body"]')].map(b => b.textContent + (b.getAttribute('aria-pressed') === 'true' ? '*' : '')));
  console.log('몸 동작 버튼', bodyBtns);
  await p.evaluate(() => { const c = document.querySelector('.fxset.scr'); if (c) c.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(300);
  const scr = p.locator('.card.fxset.scr'); await scr.screenshot({ path: `uishots/${PREFIX}_scr.png` });
  console.log('note', await p.evaluate(() => (document.getElementById('stFxNote') || {}).textContent));
  // 끄기 → 다시 기본
  await p.click('button[data-fx="body"][data-v="0"]'); await p.waitForTimeout(200);
  console.log('끄기 뒤 body', await p.evaluate(() => window.__ev('S.fx.body')));
  await p.click('button[data-fx="body"][data-v="1"]'); await p.waitForTimeout(200);
  console.log('기본 뒤 body', await p.evaluate(() => window.__ev('S.fx.body')));
  // 인사 기록 → 직무 '기획' → 미리 보기
  await p.evaluate(() => window.__ev('S.rank = 2; S.jobs = ["sales"]; S.job = "sales"; crFocus = "plan"; crKey = ""; jskKey = null; renderJobSkills(); updateUI(true); 0'));
  await p.click('#tabs button[data-g="info"]'); await p.waitForTimeout(600);
  await p.evaluate(() => { window.__ev('crKey = ""; renderCareer(); 0'); const d = document.getElementById('crDet'); if (d) d.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(400);
  const pv = p.locator('#crDet button[data-act="preview"]');
  console.log('미리 보기 버튼', await pv.count(), await pv.count() ? (await pv.textContent()).replace(/\s+/g, ' ') : '-');
  await p.locator('#crDet').screenshot({ path: `uishots/${PREFIX}_det.png` });
  if (await pv.count()) await pv.click();
  await p.waitForTimeout(2500);
  console.log('미리 보기 중', await p.evaluate(() => window.__ev('JSON.stringify({ kit: feelKitId(), main: feelMainKitId(), x: HERO_X, pv: jobPreviewId() })')));
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(800);
  await p.screenshot({ path: `uishots/${PREFIX}_preview.png` });
  console.log('errors', errs.length ? errs.slice(0, 3) : 'none');
  await b.close();
})();
