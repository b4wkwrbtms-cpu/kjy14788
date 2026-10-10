// 큰 보스(임원) 처치 장면: 12f 히트스톱 · 임팩트 프레임 · 트라우마 0.7
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 } }); await fontRoutes(ctx);
  await ctx.addInitScript(() => { localStorage.setItem('yageun-knight-v3-menu34', '1'); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.install({ time: new Date('2026-10-11T10:00:00+09:00') });
  await p.goto('http://localhost:8766/dbg.html');
  for (let i = 0; i < 40; i++) await p.clock.runFor(100);
  for (let i = 0; i < 12; i++) { if (await p.locator('#celeb').isVisible()) await p.evaluate(() => document.getElementById('celeb').click()); else if (await p.locator('#back').isVisible()) await p.evaluate(() => document.getElementById('backGo').click()); await p.clock.runFor(900); }
  await p.evaluate(() => { window.__noFloat = false; window.scrollTo(0, 0); window.__ev('S.floor = 20; S.maxFloor = 20; S.k = 5; spawn(); 0'); });
  for (let i = 0; i < 160; i++) { await p.clock.runFor(50); if (await p.evaluate(() => window.__ev('feelLive() && !intro'))) break; }
  for (let i = 0; i < 30; i++) await p.clock.runFor(50);
  await p.evaluate(() => window.__ev('mon.hp = Math.min(mon.hp, mon.max * 0.001); 0'));
  const labs = [];
  for (let f = 0; f < 48; f++) {
    await p.clock.runFor(16.667);
    const d = await p.evaluate(() => { const c = document.getElementById('cv'); return { u: c.toDataURL('image/png'), a: window.__ev('(() => { const d = feelDebug(); return d.state[0] + " " + (d.mv || "-") + "@" + d.f + (d.frz ? " z" + d.frz : "") + (d.vfrz ? " v" + d.vfrz : "") + " tr" + d.trauma.toFixed(2) + " k" + (mon ? mon.kind : "-") + (mon && mon.dying ? " dead" : ""); })()') }; });
    fs.writeFileSync(`feelshots/v35d_bosskill_${String(f).padStart(3, '0')}.png`, Buffer.from(d.u.split(',')[1], 'base64')); labs.push(d.a);
  }
  fs.writeFileSync('feelshots/v35d_bosskill.json', JSON.stringify(labs));
  console.log(labs.join(' | '), '\nerrors', errs.length ? errs.slice(0, 3) : 'none');
  await b.close();
})();
