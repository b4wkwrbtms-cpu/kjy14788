// 작은 글자·작은 버튼을 '선택자 경로'로 모으기 (고칠 CSS를 정하려고)
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PAGE = process.argv[2] || 'dbg.html', LIM = +(process.argv[3] || 12);
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 } }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); localStorage.setItem('yageun-knight-v3-menu34', '1'); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage();
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1500);
  for (let i = 0; i < 24; i++) { await p.waitForTimeout(300); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 10) break; }
  const all = new Map(), btn = new Map();
  for (const g of ['word', 'grow', 'work', 'info', 'set']) {
    const segs = await p.evaluate(g => [...document.querySelectorAll('#thSeg .th-seg.on button')].map(b => b.getAttribute('data-t')), g).catch(() => []);
    await p.click(`#tabs button[data-g="${g}"]`); await p.waitForTimeout(400);
    const subs = await p.evaluate(() => [...document.querySelectorAll('#thSeg .th-seg.on button')].map(b => b.getAttribute('data-t')));
    for (const t of (subs.length ? subs : [null])) {
      if (t) { await p.click(`#thSeg button[data-t="${t}"]`); await p.waitForTimeout(350); }
      const r = await p.evaluate(LIM => {
        const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && e.offsetParent !== null; };
        const path = e => { const parts = []; for (let x = e; x && x !== document.body && parts.length < 4; x = x.parentElement) { let s = x.tagName.toLowerCase(); if (x.id) { s += '#' + x.id; parts.unshift(s); break; } const c = String(x.className && x.className.baseVal !== undefined ? x.className.baseVal : x.className).trim().split(/\s+/).filter(Boolean).slice(0, 2); if (c.length) s += '.' + c.join('.'); parts.unshift(s); } return parts.join(' > '); };
        const out = [], bt = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) { const t = w.currentNode; if (!t.textContent.trim()) continue; const e = t.parentElement; if (!e || !vis(e)) continue; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < LIM) out.push([path(e), fs, t.textContent.trim().slice(0, 14)]); }
        document.querySelectorAll('#panels button, #panels input, #panels select, .tab-head button, .actbar button').forEach(e => { if (!vis(e)) return; const r = e.getBoundingClientRect(); if (r.height < 44) bt.push([path(e), Math.round(r.width) + 'x' + Math.round(r.height), (e.textContent || e.value || '').trim().slice(0, 10)]); });
        return { out, bt };
      }, LIM);
      r.out.forEach(([k, fs, s]) => { const key = k + ' @' + fs; if (!all.has(key)) all.set(key, [g + (t ? '/' + t : ''), s, 0]); all.get(key)[2]++; });
      r.bt.forEach(([k, sz, s]) => { const key = k.replace(/:nth.*$/, ''); if (!btn.has(key)) btn.set(key, [g + (t ? '/' + t : ''), sz, s, 0]); btn.get(key)[3]++; });
    }
  }
  console.log('=== 작은 글자 (<' + LIM + 'px):', all.size);
  [...all.entries()].sort((a, b) => b[1][2] - a[1][2]).forEach(([k, v]) => console.log(String(v[2]).padStart(4), v[0].padEnd(14), k, '«' + v[1] + '»'));
  console.log('=== 44px보다 낮은 버튼:', btn.size);
  [...btn.entries()].sort((a, b) => b[1][3] - a[1][3]).forEach(([k, v]) => console.log(String(v[3]).padStart(4), v[0].padEnd(14), v[1].padEnd(8), k, '«' + v[2] + '»'));
  await b.close();
})();
