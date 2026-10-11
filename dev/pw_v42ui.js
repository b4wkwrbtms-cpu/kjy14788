// v42 화면 확인: 성장 탭(무기 카드·목록·등급 사다리) · 지하 문서고 한 판 · 새 안내 — 사용자 기록, 390px
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v42', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v41_cloud.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 } }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38', 'feel39', 'feel40', 'feel41'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1800);
  // 새 안내 (v42)
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(300); const t = await p.evaluate(() => { const c = document.getElementById('celeb'); return c && !c.hidden ? (c.textContent || '').slice(0, 40) : ''; }); if (t.indexOf('7등급') >= 0) { await p.screenshot({ path: `uishots/${PREFIX}_notice.png` }); } if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {}); else if (i > 12) break; }
  await p.evaluate(() => { window.__noAtk = true; window.__ev('S.silver = 30; S.ame = 6; updateUI(true); 0'); });
  await p.click('#tabs button[data-g="grow"]'); await p.waitForTimeout(900);
  await p.screenshot({ path: `uishots/${PREFIX}_grow.png`, fullPage: true });
  const info = await p.evaluate(() => window.__ev('JSON.stringify({ wi: S.wi, wl: S.wl, unl: wUnl(), note: (document.getElementById("wNote") || {}).textContent, btn: (document.getElementById("wBtn") || {}).textContent, name: (document.getElementById("wName") || {}).textContent, pow: (document.getElementById("wPow") || {}).textContent })'));
  console.log('weapon card', info);
  // 문서고 한 판
  await p.evaluate(() => { window.__noAtk = false; window.__ev('S.day.vaultUsed = 0; S.vault.best = 0; startVault(); 0'); });
  for (const [ms, tag] of [[1500, 'v1'], [2600, 'v2'], [4000, 'v3']]) { await p.waitForTimeout(ms); await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: `uishots/${PREFIX}_${tag}.png` }); }
  const vr = await p.evaluate(() => window.__ev('JSON.stringify({ mode, t: vaultTime, d: vaultRun.depth, one: vaultRun.one, combo: vaultRun.combo })')); console.log('vault', vr);
  for (let i = 0; i < 160 && (await p.evaluate(() => window.__ev('mode'))) === 'vault'; i++) await p.waitForTimeout(500);
  await p.waitForTimeout(400); await p.screenshot({ path: `uishots/${PREFIX}_vend.png` });
  console.log('after', await p.evaluate(() => window.__ev('JSON.stringify({ mode, best: S.vault.best, sv: S.silver, ame: S.ame, depth: S.day.depth })')));
  console.log('errors', errs.length ? errs.slice(0, 3) : 'none');
  await b.close();
})();
