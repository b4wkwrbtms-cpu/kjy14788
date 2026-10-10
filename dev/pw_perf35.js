const { chromium, devices } = require('playwright');
const fs = require('fs');
const save = fs.readFileSync('restore/save_v30.json', 'utf8');
(async () => {
  const b = await chromium.launch();
  for (const rate of [1, 4, 6]) for (const page of ['old34.html', 'new35.html']) {
    const ctx = await b.newContext({ ...devices['iPhone 14 Pro'] });
    await ctx.addInitScript(([f]) => { const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); localStorage.setItem('yageun-knight-v3-menu34', '1'); }, [save]);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await p.goto('http://localhost:8766/' + page); await p.waitForTimeout(3000);
    await p.evaluate(() => { const c = document.getElementById('celeb'); if (c && !c.hidden) c.click(); const bg = document.getElementById('backGo'); if (bg && bg.offsetParent) bg.click(); });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => new Promise(res => { let n = 0, t0 = performance.now(), worst = 0, last = t0, slow = 0; const tick = () => { const now = performance.now(), d = now - last; worst = Math.max(worst, d); if (d > 25) slow++; last = now; n++; if (now - t0 < 6000) requestAnimationFrame(tick); else res({ fps: n / ((now - t0) / 1000), worst, slow }); }; requestAnimationFrame(tick); }));
    console.log('cpu x' + rate, page.padEnd(11), 'fps', r.fps.toFixed(1), 'worst', r.worst.toFixed(0) + 'ms', '25ms 넘은 프레임', r.slow, errs.length ? 'ERR ' + errs[0] : '');
    await ctx.close();
  }
  await b.close();
})();
