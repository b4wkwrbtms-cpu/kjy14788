// v35 공격 장면을 1/60초 단위로 찍기 (시계 고정): 빠른 공속(복원 기록) · 느린 공속(새 기록) · 터치 연타 · 안 죽는 몬스터
// 사용: node pw_feel1.js [prefix] [page]
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v35', PAGE = process.argv[3] || 'dbg.html';
async function run(b, name, o) {
  const save = o.fresh ? null : JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 }, reducedMotion: o.rm ? 'reduce' : 'no-preference' }); await fontRoutes(ctx);
  await ctx.addInitScript(([f]) => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); localStorage.setItem('yageun-knight-v3-menu34', '1'); if (f) { const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } } }, [save ? JSON.stringify(save) : '']);
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
  if (o.dummy) { for (let i = 0; i < 60 && !(await p.evaluate(() => window.__ev('typeof feelLive === "function" ? feelLive() : !!(mon && !mon.dying)'))); i++) await p.clock.runFor(50); await p.evaluate(() => window.__ev('mon.hp = mon.max = 1e300; S.pets.idol = 0; 0')); }
  const info = await p.evaluate(() => window.__ev('JSON.stringify({ aps: +stats().aps.toFixed(2), interval: Math.round(stats().interval), floor: S.floor, mon: mon && mon.name })'));
  const frames = [];
  for (let f = 0; f < o.n; f++) {
    if (o.tapEvery && f % o.tapEvery === 2) await p.evaluate(() => { const c = document.getElementById('cv'), r = c.getBoundingClientRect(); c.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + r.width * 0.75, clientY: r.top + r.height * 0.6, bubbles: true })); });
    await p.clock.runFor(16.667);
    const d = await p.evaluate(() => { const c = document.getElementById('cv'); return { u: c.toDataURL('image/png'), a: window.__ev('typeof feelDebug === "function" ? (() => { const d = feelDebug(); return d.state[0] + " " + (d.mv || "-") + "@" + d.f + (d.frz ? " z" + d.frz : "") + (d.vfrz ? " v" + d.vfrz : "") + (d.pend ? " p" + d.pend : "") + (d.buf ? " b" + d.buf : "") + " tr" + d.trauma.toFixed(2); })() : (anim.a.toFixed(2) + " " + (anim.type||"") + " hs=" + Math.round(hitStop))') }; });
    fs.writeFileSync(`feelshots/${PREFIX}_${name}_${String(f).padStart(3, '0')}.png`, Buffer.from(d.u.split(',')[1], 'base64'));
    frames.push(d.a);
  }
  fs.writeFileSync(`feelshots/${PREFIX}_${name}.json`, JSON.stringify(frames));
  console.log(`[${name}]`, info, '\n', frames.join(' | '), '\nerrors', errs.length ? errs.slice(0, 3) : 'none');
  await ctx.close();
}
(async () => {
  const b = await chromium.launch();
  const only = process.argv[4];
  const jobs = { fast: { n: 60 }, slow: { n: 72, fresh: true }, tap: { n: 60, tapEvery: 8 }, boss: { n: 72, dummy: true }, rm: { n: 40, rm: true, dummy: true }, tapd: { n: 48, tapEvery: 8, dummy: true, fresh: true } };
  for (const k in jobs) if (!only || only.split(',').includes(k)) await run(b, k, jobs[k]);
  await b.close();
})();
