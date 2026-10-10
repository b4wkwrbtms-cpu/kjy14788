// v34 전체 둘러보기: 실제 index.html 로 모든 묶음·작은 메뉴를 눌러 보고 오류·가로 넘침 확인
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
(async () => {
  const b = await chromium.launch();
  for (const w of [390, 320]) {
    const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: w, height: 760 }, serviceWorkers: 'block' }); await fontRoutes(ctx);
    await ctx.route('https://ownarhjgryafrgoouirs.supabase.co/**', r => r.abort());
    const save = fs.readFileSync('restore/save_v30.json', 'utf8');
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', '1'); const s = JSON.parse(f); s.t = Date.now(); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, save);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8766/index.html'); await p.waitForTimeout(2500);
    for (let i = 0; i < 30; i++) { await p.waitForTimeout(250); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 12) break; }
    const visits = [];
    for (const g of ['word', 'grow', 'work', 'info', 'set']) {
      await p.click(`#tabs button[data-g="${g}"]`); await p.waitForTimeout(350);
      const subs = await p.evaluate(() => [...document.querySelectorAll('.th-seg.on button')].filter(b => !b.hidden).map(b => b.dataset.t));
      for (const t of (subs.length ? subs : [null])) {
        if (t) { await p.click(`.th-seg.on button[data-t="${t}"]`); await p.waitForTimeout(300); }
        await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(250);
        const r = await p.evaluate(() => ({ cur: window.__ev ? window.__ev('curTab') : '', sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        visits.push(`${g}/${t || '-'}${r.sw > r.cw ? '(넘침 ' + r.sw + ')' : ''}`);
        if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {});
      }
    }
    // 같은 묶음 다시 누르면 맨 위로
    await p.click('#tabs button[data-g="set"]'); await p.waitForTimeout(300);
    const top = await p.evaluate(() => Math.round(document.getElementById('panels').getBoundingClientRect().top));
    console.log(`[${w}] visits`, visits.join(' '), '| re-tap top', top, '| errors', errs.length ? errs.slice(0, 3) : 'none');
    await ctx.close();
  }
  await b.close();
})();
