// 메뉴 글자 크기(1 / 1.15 / 1.3) × 폭(320 / 390)에서 가로로 넘치는 것 찾기
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  for (const W of [320, 390]) for (const Z of [1, 1.15, 1.3]) {
    const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], viewport: { width: W, height: 760 } }); await fontRoutes(ctx);
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); localStorage.setItem('yageun-knight-v3-menu34', '1'); const s = JSON.parse(f[0]); s.fx = Object.assign(s.fx || {}, { ui: f[1] }); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, [JSON.stringify(save), Z]);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(1500);
    for (let i = 0; i < 24; i++) { await p.waitForTimeout(300); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 10) break; }
    const bad = [];
    for (const g of ['word', 'grow', 'work', 'info', 'set']) {
      await p.click(`#tabs button[data-g="${g}"]`); await p.waitForTimeout(300);
      const subs = await p.evaluate(() => [...document.querySelectorAll('#thSeg .th-seg.on button')].map(b => b.getAttribute('data-t')));
      for (const t of (subs.length ? subs : [null])) {
        if (t) { await p.click(`#thSeg button[data-t="${t}"]`); await p.waitForTimeout(250); }
        const r = await p.evaluate(() => {
          const vw = document.documentElement.clientWidth, out = [];
          if (document.documentElement.scrollWidth > vw + 1) out.push('page scrollWidth ' + document.documentElement.scrollWidth);
          document.querySelectorAll('#panels *, #tabHead *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.right > vw + 1 || r.left < -1)) { const cs = getComputedStyle(e); if (cs.position === 'fixed') return; let clip = false; for (let x = e.parentElement; x; x = x.parentElement) { const o = getComputedStyle(x).overflowX; if (o === 'hidden' || o === 'auto' || o === 'scroll') { const pr = x.getBoundingClientRect(); if (pr.right <= vw + 1) { clip = true; break; } } } if (!clip) out.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} ${Math.round(r.left)}..${Math.round(r.right)}`); } });
          return out.slice(0, 6);
        });
        if (r.length) bad.push(`${g}${t ? '/' + t : ''}: ${r.join(' | ')}`);
      }
    }
    console.log(`[${W}px ×${Z}]`, bad.length ? '\n  ' + bad.join('\n  ') : '넘침 없음', errs.length ? 'ERR ' + errs[0] : '');
    await ctx.close();
  }
  await b.close();
})();
