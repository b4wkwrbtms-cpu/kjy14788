// v36 휘두르기를 정확히 1틱(1/60 s)씩 찍기: 게임의 rAF를 멈추고 frame(t)를 직접 16.667 ms씩 부름
// 사용: node pw_pose36.js [prefix] [page] [jobs] [n]
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v36', PAGE = process.argv[3] || 'dbg.html', ONLY = process.argv[4], NF = +process.argv[5] || 0;
async function run(b, name, o) {
  const save = o.fresh ? null : JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 }, reducedMotion: o.rm ? 'reduce' : 'no-preference' }); await fontRoutes(ctx);
  await ctx.addInitScript(([f]) => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); localStorage.setItem('yageun-knight-v3-menu34', '1'); localStorage.setItem('yageun-knight-v3-feel35', '1'); localStorage.setItem('yageun-knight-v3-feel36', '1'); if (f) { const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } } }, [save ? JSON.stringify(save) : '']);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.install({ time: new Date('2026-10-11T10:00:00+09:00') });
  await p.goto('http://localhost:8766/' + PAGE);
  for (let i = 0; i < 40; i++) { await p.clock.runFor(100); }
  for (let i = 0; i < 12; i++) {
    if (await p.locator('#celeb').isVisible()) { await p.evaluate(() => document.getElementById('celeb').click()); }
    else if (await p.locator('#back').isVisible()) { await p.evaluate(() => document.getElementById('backGo').click()); }
    await p.clock.runFor(900);
  }
  await p.evaluate(() => { window.__noFloat = false; window.scrollTo(0, 0); });
  if (o.setup) await p.evaluate(o.setup);
  for (let i = 0; i < 20; i++) await p.clock.runFor(50);
  if (o.dummy) { for (let i = 0; i < 60 && !(await p.evaluate(() => window.__ev('feelLive()'))); i++) await p.clock.runFor(50); await p.evaluate(() => window.__ev('mon.hp = mon.max = 1e300; S.pets.idol = 0; 0')); }
  if (o.wi != null) await p.evaluate(wi => window.__ev(`S.wi = ${wi}; S.wl = 5; S.skin = -1; 0`), o.wi);
  const info = await p.evaluate(() => window.__ev('JSON.stringify({ aps: +stats().aps.toFixed(2), interval: Math.round(stats().interval), floor: S.floor, mon: mon && mon.name })'));
  // 게임 루프 멈추고 직접 한 틱씩
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await p.clock.runFor(200);
  let T = await p.evaluate(() => window.__ev('last'));
  const frames = [], n = NF || o.n;
  for (let f = 0; f < n; f++) {
    if (o.tapEvery && f % o.tapEvery === 2) await p.evaluate(() => { const c = document.getElementById('cv'), r = c.getBoundingClientRect(); c.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + r.width * 0.75, clientY: r.top + r.height * 0.6, bubbles: true })); });
    T += 1000 / 60;
    const d = await p.evaluate(t => { window.__ev(`frame(${t}); 0`); const c = document.getElementById('cv'); return { u: c.toDataURL('image/png'), a: window.__ev('(() => { const d = feelDebug(); return d.state[0] + " " + (d.mv || "-") + "@" + d.f + (d.frz ? " z" + d.frz : "") + (d.vfrz ? " v" + d.vfrz : "") + (d.pend ? " p" + d.pend : "") + (d.buf ? " b" + d.buf : ""); })()') }; }, T);
    fs.writeFileSync(`feelshots/${PREFIX}_${name}_${String(f).padStart(3, '0')}.png`, Buffer.from(d.u.split(',')[1], 'base64'));
    frames.push(d.a);
  }
  fs.writeFileSync(`feelshots/${PREFIX}_${name}.json`, JSON.stringify(frames));
  console.log(`[${name}]`, info, '\n', frames.join(' | '), '\nerrors', errs.length ? errs.slice(0, 3) : 'none');
  await ctx.close();
}
(async () => {
  const b = await chromium.launch();
  const jobs = { slow: { n: 90, fresh: true, dummy: true }, fast: { n: 60, dummy: true }, tap: { n: 60, tapEvery: 8, dummy: true }, rm: { n: 40, rm: true, dummy: true },
    w0: { n: 40, dummy: true, wi: 0 }, w12: { n: 40, dummy: true, wi: 12 }, w29: { n: 40, dummy: true, wi: 29 } };
  (ONLY || '').split(',').forEach(k => { const m = /^f(\d+)$/.exec(k); if (m) jobs[k] = { n: 40, fresh: true, dummy: true, wi: +m[1] }; });
  for (const k in jobs) if (!ONLY || ONLY.split(',').includes(k)) await run(b, k, jobs[k]);
  await b.close();
})();
