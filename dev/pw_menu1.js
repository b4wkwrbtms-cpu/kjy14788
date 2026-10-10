// v34 메뉴 묶기 · 설정 탭 화면 점검 (360px)
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
async function open(b, o = {}) {
  const save = o.fresh ? null : JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: o.w || 360, height: 740 } }); await fontRoutes(ctx);
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://localhost:8766' });
  await ctx.clock.setSystemTime(new Date('2026-10-11T10:00:00+09:00'));
  await ctx.addInitScript(([f, o]) => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); if (f) { const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } if (o.seen) localStorage.setItem('yageun-knight-v3-menu34', '1'); } }, [save ? JSON.stringify(save) : '', o]);
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html' + (o.q || '')); await p.waitForTimeout(1500);
  return p;
}
async function clear(p, keepBack) {
  for (let i = 0; i < 24; i++) { await p.waitForTimeout(300); if (await p.locator('#celeb').isVisible()) { p.celebs = (p.celebs || []).concat([await p.locator('#celebT').innerText()]); await p.click('#celeb', { timeout: 1500 }).catch(() => {}); } else if (!keepBack && await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 2000 }).catch(() => {}); else if (i > 10) break; }
}
(async () => {
  const b = await chromium.launch();
  const p = await open(b);
  await clear(p);
  console.log('[celebs]', JSON.stringify(p.celebs || []));
  await p.addStyleTag({ content: '.toast{display:none!important}' });
  await p.screenshot({ path: 'menushots/m0_top.png' });
  // 말씀 묶음
  await p.click('#tabs button[data-g="word"]'); await p.waitForTimeout(400);
  await p.evaluate(() => window.scrollTo(0, 690)); await p.waitForTimeout(300);
  await p.screenshot({ path: 'menushots/m1_word.png' });
  await p.click('.th-seg.on button[data-t="mem"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'menushots/m2_mem.png' });
  // 성장 묶음: 무기(도구 줄) · 옷장(재화 둘)
  await p.click('#tabs button[data-g="grow"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'menushots/m3_grow_weapon.png' });
  await p.click('.th-seg.on button[data-t="suit"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'menushots/m4_grow_suit.png' });
  const hh = await p.evaluate(() => ({ head: Math.round(document.getElementById('tabHead').getBoundingClientRect().height), segs: [...document.querySelectorAll('.th-seg.on button')].map(b => b.textContent + (b.hidden ? '(잠김)' : '')).join('/') }));
  console.log('[grow head]', JSON.stringify(hh));
  // 설정
  await p.click('#tabs button[data-g="set"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'menushots/m5_set1.png' });
  await p.evaluate(() => { document.querySelector('.snd').scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }); await p.waitForTimeout(300);
  await p.screenshot({ path: 'menushots/m6_set2.png' });
  // 슬라이더 실제로 움직이기
  const sl = await p.locator('#stVs').boundingBox();
  await p.mouse.click(sl.x + sl.width * 0.3, sl.y + sl.height / 2); await p.waitForTimeout(200);
  console.log('[slider s]', await p.evaluate(() => JSON.stringify({ vol: window.__ev('S.vol'), v: document.getElementById('stVsV').textContent, p: document.getElementById('stVs').style.getPropertyValue('--p') })));
  await p.click('#stMus'); await p.waitForTimeout(200);
  console.log('[music sw]', await p.evaluate(() => window.__ev('[S.music, sndLabel(), document.getElementById("soundBtn").dataset.st].join(",")')));
  await p.click('#stMus'); await p.waitForTimeout(200);
  await p.evaluate(() => { document.querySelector('.inv').scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }); await p.waitForTimeout(300);
  await p.click('.inv button[data-act="qr"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'menushots/m7_inv.png' });
  // 링크 복사 (클립보드)
  await p.click('.inv-url'); await p.waitForTimeout(300);
  console.log('[clipboard]', await p.evaluate(() => navigator.clipboard.readText()));
  // 공유 (헤드리스는 share 없음 → 문구+링크 복사)
  await p.click('.inv button[data-act="share"]'); await p.waitForTimeout(300);
  console.log('[share→clip]', JSON.stringify(await p.evaluate(() => navigator.clipboard.readText())), 'share?', await p.evaluate(() => typeof navigator.share));
  // QR 그림을 PNG로
  const qr = await p.evaluate(() => document.getElementById('stQrCv').toDataURL('image/png'));
  fs.writeFileSync('menushots/qr_live.png', Buffer.from(qr.split(',')[1], 'base64'));
  await p.evaluate(() => { document.querySelector('.acct').scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }); await p.waitForTimeout(300);
  await p.screenshot({ path: 'menushots/m8_set3.png' });
  // 정보 탭 (계정·화면 설정 빠짐) · 안내 다시 보기
  await p.click('#tabs button[data-g="info"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { document.getElementById('mgTabs').scrollIntoView({ block: 'start' }); window.scrollBy(0, -120); }); await p.waitForTimeout(300);
  await p.screenshot({ path: 'menushots/m9_guide.png' });
  // 위쪽 스피커 버튼
  await p.evaluate(() => window.scrollTo(0, 0)); await p.click('#soundBtn'); await p.waitForTimeout(200);
  console.log('[speaker]', await p.evaluate(() => window.__ev('[S.sound, sndLabel(), document.getElementById("soundBtn").dataset.st].join(",")')));
  await p.click('#soundBtn'); await p.waitForTimeout(200);
  console.log('[speaker2]', await p.evaluate(() => window.__ev('[S.sound, sndLabel()].join(",")')));
  console.log('errors', p.errs.length ? p.errs : 'none');
  await b.close();
})();
