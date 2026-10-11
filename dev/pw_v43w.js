// v43 옷장: 새 세트 입혀 보기 · 옷장 등급 사다리 · 새 옷 아이콘 — 사용자 기록, 390px
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v43w', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v41_cloud.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 } }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38', 'feel39', 'feel40', 'feel41', 'feel42', 'feel43'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1800);
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(250); if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {}); else if (i > 8) break; }
  await p.evaluate(() => window.__noAtk = true);
  await p.click('#tabs button[data-g="grow"]'); await p.waitForTimeout(600);
  const subs = await p.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b => /옷장/.test(b.textContent)).map(b => (b.className || '') + '|' + b.textContent.trim().slice(0, 20)));
  console.log('suit buttons', JSON.stringify(subs));
  await p.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim().startsWith('옷장')); if (b) b.click(); });
  await p.waitForTimeout(700);
  const SETS = process.argv[4] ? process.argv[4].split(',') : ['trip', 'david', 'victor', 'cosmo'];
  for (const st of SETS) {
    await p.evaluate(sid => window.__ev(`(() => { S.char = (window.__CH || "choi"); const W = wardState(); WITEMS.filter(it => it.set === "${sid}").forEach(it => { W.own[it.id] = 3; }); wardWearSet("${sid}", "eq"); const au = WITEMS.find(it => it.set === "${sid}" && it.slot === "aura"); if (au) W.eq.aura = au.id; else W.eq.aura = ""; wardDirty++; updateUI(true); return 0; })()`), st);
    await p.waitForTimeout(400);
    for (let i = 0; i < 12; i++) { if (await p.locator('#celeb').isVisible()) { await p.click('#celeb', { timeout: 1000 }).catch(() => {}); await p.waitForTimeout(250); } else break; }
    await p.evaluate(() => window.__ev('celebQ && celebQ.length ? (celebQ.length = 0) : 0; 0')).catch(() => {});
    await p.waitForTimeout(300);
    const room = await p.evaluate(() => { const c = document.getElementById('roomCv'); if (!c) return null; c.scrollIntoView({ block: 'center' }); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    await p.waitForTimeout(300);
    if (room) { const r2 = await p.evaluate(() => { const r = document.getElementById('roomCv').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }); await p.screenshot({ path: `uishots/${PREFIX}_room_${st}.png`, clip: { x: r2.x, y: r2.y, width: r2.w, height: r2.h + 80 } }); }
  }
  // 옷장 등급 사다리
  const lad = await p.evaluate(() => { const h = Array.from(document.querySelectorAll('h2, h3, .sec-title, .sect, div')).find(x => x.children.length < 4 && /^옷장 등급/.test((x.textContent || '').trim())); if (!h) return null; h.scrollIntoView({ block: 'start' }); return true; });
  await p.waitForTimeout(400);
  await p.screenshot({ path: `uishots/${PREFIX}_ladder.png` });
  // 무기 이펙트·오라 새 것 하나씩 입혀 전투 화면
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none', 'ladder', lad);
  await b.close();
})();
