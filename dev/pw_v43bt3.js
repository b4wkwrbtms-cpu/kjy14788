// v43 보고용 전투 비교(깔끔하게): 공격·스킬 자동·숫자·안내를 끄고, 무기를 든 모습 1장 + 직접 한 대 친 순간 2장
// node pw_v43bt3.js [prefix] [page] [list]  → uishots/<prefix>_<wi>_{idle,h1,h2}.png + <prefix>_meta.json
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v43bc', PAGE = process.argv[3] || 'dbg.html', LIST = (process.argv[4] || '17,23,35,47,61,65').split(',').map(Number);
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v41_cloud.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 } }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38', 'feel39', 'feel40', 'feel41', 'feel42', 'feel43'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1800);
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(250); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {}); else if (i > 8) break; }
  await p.addStyleTag({ content: '.dpsfx, #celeb, .toast { display: none !important; }' });
  await p.evaluate(() => { window.scrollTo(0, 0); window.__noAtk = true; window.__ev('addFloat = function () {}; S.auto = false; S.autoSkill = false; S.fx = Object.assign(S.fx || {}, { shake: 0, flash: 0 }); S.k = 1; spawn(); 0'); });
  await p.waitForTimeout(1500);
  const box = await p.evaluate(() => { const cs = Array.from(document.querySelectorAll('canvas')).map(c => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }).filter(r => r.w > 300 && r.h > 150); return cs[0]; });
  const clip = { x: box.x + box.w * 0.22, y: box.y + box.h * 0.26, width: box.w * 0.78, height: box.h * 0.74 };
  const meta = { box, clip, rows: [] };
  const calm = () => p.evaluate(() => window.__ev('bubble.t = 0; if (mon) { mon.hp = mon.max; } jobFx.length = 0; 0'));
  for (const wi of LIST) {
    const info = await p.evaluate(w => JSON.parse(window.__ev(`S.gold = 0; S.wi = ${w}; S.wl = 5; S.skin = -1; S.wunl = Math.max(S.wunl, ${w}); updateUI(true); JSON.stringify({ n: WEAPONS[${w}].n, g: WGRADES[gradeOf(${w})].n, gc: WGRADES[gradeOf(${w})].c, pal: feelFxPal(0) })`)), wi);
    meta.rows.push(Object.assign({ wi }, info));
    await calm(); await p.waitForTimeout(900); await calm(); await p.waitForTimeout(250);
    await p.evaluate(() => window.__ev('bubble.t = 0; 0')); await p.waitForTimeout(40);
    const chk = await p.evaluate(() => window.__ev('S.wi + "/" + skinIdx()')); if (+chk.split('/')[0] !== wi) console.log('wi changed!', wi, chk);
    await p.screenshot({ path: `uishots/${PREFIX}_${wi}_idle.png`, clip });
    await p.evaluate(() => window.__ev('bubble.t = 0; gHitT[5] = 0; gHitT[6] = 0; hit(mon.max * 1e-9, true, "hero"); 0'));
    await p.waitForTimeout(60); await p.screenshot({ path: `uishots/${PREFIX}_${wi}_h1.png`, clip });
    await p.waitForTimeout(120); await p.screenshot({ path: `uishots/${PREFIX}_${wi}_h2.png`, clip });
    await p.waitForTimeout(600);
  }
  fs.writeFileSync(`uishots/${PREFIX}_meta.json`, JSON.stringify(meta));
  console.log(JSON.stringify(meta.rows.map(r => [r.wi, r.g, r.n, r.pal[1]])));
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
