const { chromium, devices } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
  await ctx.route('https://ownarhjgryafrgoouirs.supabase.co/**', r => r.abort());
  await ctx.route('https://fonts.googleapis.com/**', r => r.abort()); await ctx.route('https://fonts.gstatic.com/**', r => r.abort());
  const save = fs.readFileSync('restore/save_v30.json', 'utf8');
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', '1'); const s = JSON.parse(f); s.t = Date.now(); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, save);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/index.html'); await p.waitForTimeout(3000);
  const st = await p.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('yageun-knight-v3')); return { fest: s.fest && s.fest.sid, lv: s.fest && s.fest.lv, jar: !!s.jar, firsts: !!s.firsts }; } catch (e) { return String(e); } });
  console.log('state', JSON.stringify(st), 'errors', errs.length ? errs : 'none');
  await b.close();
})();
