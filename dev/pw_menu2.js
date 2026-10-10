// v34: 메뉴 바뀜 안내 · 도구 줄 · 새 사용자(초대 링크) · 좁은 화면 · 설치한 앱
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
async function open(b, o = {}) {
  const save = o.fresh ? null : JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: o.w || 360, height: 740 } }); await fontRoutes(ctx);
  await ctx.clock.setSystemTime(new Date('2026-10-11T10:00:00+09:00'));
  await ctx.addInitScript(([f, o]) => {
    if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); if (f) { const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } if (o.seen) localStorage.setItem('yageun-knight-v3-menu34', '1'); }
    if (o.standalone) Object.defineProperty(navigator, 'standalone', { configurable: true, get: () => true });
  }, [save ? JSON.stringify(save) : '', o]);
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html' + (o.q || '')); await p.waitForTimeout(1500);
  return p;
}
async function clear(p) {
  for (let i = 0; i < 24; i++) { await p.waitForTimeout(300); if (await p.locator('#celeb').isVisible()) { p.celebs = (p.celebs || []).concat([await p.locator('#celebT').innerText()]); await p.click('#celeb', { timeout: 1500 }).catch(() => {}); } else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 10) break; }
}
const head = p => p.evaluate(() => { const h = document.getElementById('tabHead'); return { h: Math.round(h.getBoundingClientRect().height), grp: h.classList.contains('grp'), tools: document.getElementById('thTools').children.length, segs: [...document.querySelectorAll('.th-seg.on button')].filter(b => !b.hidden).map(b => b.textContent).join('/') }; });
(async () => {
  const b = await chromium.launch();
  // A. 예전 기록
  const A = await open(b); await clear(A);
  console.log('[A celebs]', JSON.stringify(A.celebs || []));
  await A.addStyleTag({ content: '.toast{display:none!important}' });
  await A.click('#tabs button[data-g="word"]'); await A.waitForTimeout(300); console.log('[A word]', JSON.stringify(await head(A)));
  await A.click('#tabs button[data-g="grow"]'); await A.waitForTimeout(300); console.log('[A grow/weapon]', JSON.stringify(await head(A)));
  await A.click('.th-seg.on button[data-t="pet"]'); await A.waitForTimeout(300); console.log('[A pet]', JSON.stringify(await head(A)));
  await A.evaluate(() => window.scrollTo(0, 700)); await A.waitForTimeout(200); await A.screenshot({ path: 'menushots/n1_pet.png' });
  await A.click('#tabs button[data-g="work"]'); await A.waitForTimeout(300); console.log('[A work]', JSON.stringify(await head(A)));
  await A.click('#tabs button[data-g="grow"]'); await A.waitForTimeout(300); console.log('[A back to grow]', await A.evaluate(() => window.__ev('curTab')), JSON.stringify(await head(A)));
  console.log('[A errors]', A.errs.length ? A.errs : 'none');
  // B. 새 사용자 + 초대 링크
  const B = await open(b, { fresh: true, q: '?invite=1' });
  await B.waitForTimeout(800);
  console.log('[B back]', await B.locator('#back').isVisible(), JSON.stringify(await B.locator('#backT').innerText()), 'inst note', await B.locator('#backInst').isVisible(), 'url', await B.evaluate(() => location.search));
  await B.screenshot({ path: 'menushots/n2_invite_back.png' });
  await clear(B);
  console.log('[B celebs]', JSON.stringify(B.celebs || []));
  console.log('[B tabs]', await B.evaluate(() => [...document.querySelectorAll('#tabs button')].map(x => x.textContent + (x.querySelector('.dot').hidden ? '' : '●')).join(' ')), 'cur', await B.evaluate(() => window.__ev('curTab')), JSON.stringify(await head(B)));
  await B.click('#tabs button[data-g="word"]'); await B.waitForTimeout(300); console.log('[B word]', JSON.stringify(await head(B)));
  await B.screenshot({ path: 'menushots/n3_fresh_word.png' });
  await B.click('#tabs button[data-g="set"]'); await B.waitForTimeout(400); console.log('[B set dot after]', await B.evaluate(() => document.querySelector('#tabs button[data-g="set"] .dot').hidden), 'inst', await B.locator('.inst').isVisible());
  console.log('[B errors]', B.errs.length ? B.errs : 'none');
  // C. 좁은 화면 320
  const C = await open(b, { w: 320, seen: true }); await clear(C);
  await C.addStyleTag({ content: '.toast{display:none!important}' });
  await C.click('#tabs button[data-g="grow"]'); await C.waitForTimeout(300);
  await C.evaluate(() => window.scrollTo(0, 650)); await C.waitForTimeout(200);
  console.log('[C 320 grow]', JSON.stringify(await head(C)), 'overflow', await C.evaluate(() => [...document.querySelectorAll('.th-seg.on button')].map(b => b.scrollWidth > b.clientWidth ? b.textContent : '').filter(Boolean).join(',') || 'none'), 'docW', await C.evaluate(() => document.documentElement.scrollWidth));
  await C.screenshot({ path: 'menushots/n4_320.png' });
  console.log('[C errors]', C.errs.length ? C.errs : 'none');
  // D. 설치한 앱
  const D = await open(b, { standalone: true, seen: true }); await clear(D);
  console.log('[D set dot]', await D.evaluate(() => document.querySelector('#tabs button[data-g="set"] .dot').hidden ? 'none' : 'dot'));
  await D.click('#tabs button[data-g="set"]'); await D.waitForTimeout(400);
  console.log('[D inst visible]', await D.locator('.inst').isVisible(), 'first card', await D.evaluate(() => [...document.querySelectorAll('#panels > .panel:not([hidden]) > *')].filter(e => e.offsetParent).slice(0, 2).map(e => e.className).join(' | ')));
  console.log('[D errors]', D.errs.length ? D.errs : 'none');
  await b.close();
})();
