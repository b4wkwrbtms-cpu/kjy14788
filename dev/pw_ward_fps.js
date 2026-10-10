const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
(async () => {
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul' }); await fontRoutes(ctx);
  await ctx.route('https://ownarhjgryafrgoouirs.supabase.co/**', r => r.abort());
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); const s = JSON.parse(f); s.t = Date.now(); s.autoSkill = false; localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(2000);
  for (let i = 0; i < 3; i++) if (await p.locator('#back').isVisible()) { await p.click('#backGo'); await p.waitForTimeout(1800); }
  for (let i = 0; i < 5; i++) if (await p.locator('#celeb').isVisible()) { await p.click('#celeb'); await p.waitForTimeout(300); }
  const E = c => p.evaluate(c2 => window.__ev(c2), c);
  const fps = () => p.evaluate(() => new Promise(res => { let n = 0, worst = 0, prev = performance.now(); const t0 = prev; const f = () => { const t = performance.now(); worst = Math.max(worst, t - prev); prev = t; n++; if (t - t0 < 2500) requestAnimationFrame(f); else res((n / 2.5).toFixed(1) + " fps, worst " + worst.toFixed(0) + "ms"); }; requestAnimationFrame(f); }));
  const tank = 'if (mon) { mon.hp = mon.max = 1e60; }';
  await E(`${tank}; S.ward.look = { aura: "-", wfx: "-" }; wardDirty++`); console.log('no aura/wfx ', await fps());
  for (const [a, w] of [["a_dawn", "w_dragon"], ["a_word", "w_flame"]]) {
    await E(`${tank}; ["${a}", "${w}"].forEach(id => S.ward.own[id] = 0); S.ward.look = { aura: "${a}", wfx: "${w}" }; wardDirty++`); await p.waitForTimeout(300);
    console.log((a + ' ' + w).padEnd(20), await fps());
  }
  await E(`${tank}; selectTab("weapon"); window.scrollTo(0, 0)`); await p.waitForTimeout(400);
  await p.evaluate(() => { window.__noFloat = true; window.__noAtk = true; }); await p.waitForTimeout(1500);
  await E('S.ward.look = { aura: "a_dawn", wfx: "w_dragon" }; wardDirty++'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'wardshots/w12a.png' });
  await E('S.ward.look = { aura: "a_word", wfx: "w_flame" }; wardDirty++'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'wardshots/w12b.png' });
  console.log('errors', errs.length ? errs.slice(0, 4) : 'none'); await b.close();
})();
