const { chromium, devices } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  for (const fresh of [true, false]) {
    const save = fs.readFileSync('restore/save_v30.json', 'utf8');
    const ctx = await b.newContext({ ...devices['iPhone 14 Pro'] });
    if (!fresh) await ctx.addInitScript(f => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', 1); const s = JSON.parse(f); s.t = Date.now(); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, save);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await p.goto('http://localhost:8766/index.html'); await p.waitForTimeout(4000);
    for (let i = 0; i < 10; i++) { if (await p.locator('#celeb').isVisible()) await p.click('#celeb').catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo').catch(() => {}); await p.waitForTimeout(400); }
    const a = await p.evaluate(() => document.getElementById('cv').toDataURL().length);
    await p.locator('#cv').click({ position: { x: 300, y: 150 } }).catch(() => {});
    await p.waitForTimeout(1500);
    const v = await p.evaluate(() => document.body.innerText.includes('곽준영'));
    console.log(fresh ? '[새 기록]' : '[예전 기록]', 'canvas', a > 10000, 'title', v, 'errors', errs.length ? errs.slice(0, 3) : 'none');
    await ctx.close();
  }
  await b.close();
})();
