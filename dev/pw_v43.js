// v43 화면 확인: 새 안내 · 성장 탭(무기 카드·목록·등급 사다리) · 무기 66개 아이콘(등급 이펙트) · 전투 화면 등급별 · 옷장(새 세트·등급 사다리) · 캐릭터 — 사용자 기록, 390px
// node pw_v43.js [prefix] [page] [what: all|icons|battle|ward|grow]
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const PREFIX = process.argv[2] || 'v43', PAGE = process.argv[3] || 'dbg.html', WHAT = process.argv[4] || 'all';
const on = k => WHAT === 'all' || WHAT.split(',').indexOf(k) >= 0;
(async () => {
  const b = await chromium.launch();
  const save = JSON.parse(fs.readFileSync('restore/save_v41_cloud.json', 'utf8'));
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 } }); await fontRoutes(ctx);
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); ['menu34', 'feel35', 'feel36', 'feel37', 'feel38', 'feel39', 'feel40', 'feel41', 'feel42'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); const s = JSON.parse(f); s.t = Date.now(); s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } }, JSON.stringify(save));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(1800);
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(300); const t = await p.evaluate(() => { const c = document.getElementById('celeb'); return c && !c.hidden ? (c.textContent || '').slice(0, 40) : ''; }); if (t.indexOf('66') >= 0) { await p.screenshot({ path: `uishots/${PREFIX}_notice.png` }); } if (await p.locator('#celeb').isVisible()) await p.click('#celeb', { timeout: 1500 }).catch(() => {}); else if (await p.locator('#back').isVisible()) await p.click('#backGo', { timeout: 1500 }).catch(() => {}); else if (i > 12) break; }
  const shot = async (name, full) => { await p.screenshot({ path: `uishots/${PREFIX}_${name}.png`, fullPage: !!full }); };
  if (on('grow')) {
    await p.evaluate(() => { window.__noAtk = true; window.__ev('updateUI(true); 0'); });
    await p.click('#tabs button[data-g="grow"]'); await p.waitForTimeout(900);
    await shot('grow', true);
    console.log('weapon card', await p.evaluate(() => window.__ev('JSON.stringify({ wi: S.wi, wl: S.wl, unl: wUnl(), name: (document.getElementById("wName") || {}).textContent, pow: (document.getElementById("wPow") || {}).textContent, note: (document.getElementById("wNote") || {}).textContent })')));
  }
  if (on('icons')) {   // 무기 66개: 등급마다 한 줄, 아이콘(still) — 등급 이펙트가 겹쳐 보이는지
    await p.evaluate(() => {
      const box = document.createElement('div'); box.id = 'sheet43'; box.style.cssText = 'position:fixed;left:0;top:0;width:390px;background:#121522;z-index:99999;padding:6px;font:11px sans-serif;color:#cfd6ea';
      const G = window.__ev('JSON.stringify(WGRADES.map(g => [g.n, g.c]))'), gs = JSON.parse(G);
      const starts = [0, 6, 12, 18, 30, 42, 54], sizes = [6, 6, 6, 12, 12, 12, 12];
      gs.forEach(([n, c], g) => {
        const row = document.createElement('div'); row.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;margin:2px 0'; const lab = document.createElement('b'); lab.textContent = n; lab.style.cssText = `color:${c};width:30px;font-size:12px`; row.appendChild(lab);
        for (let k = 0; k < sizes[g]; k++) { const i = starts[g] + k; const cv = document.createElement('canvas'); cv.id = 'wc' + i; cv.width = cv.height = 64; cv.style.cssText = 'width:30px;height:30px;margin:1px;background:#1a1e30;border-radius:4px'; row.appendChild(cv); }
        box.appendChild(row);
      });
      document.body.appendChild(box);
      for (let i = 0; i < 66; i++) window.__ev(`(() => { const g = document.getElementById('wc${i}').getContext('2d'); g.imageSmoothingEnabled = false; wpnIconDraw(g, ${i}, 5, 64, false); return 0; })()`);
    }).catch(e => console.log('icons err', e.message));
    await p.waitForTimeout(300);
    await p.locator('#sheet43').screenshot({ path: `uishots/${PREFIX}_icons.png` }).catch(e => console.log('shot err', e.message));
    await p.evaluate(() => { const x = document.getElementById('sheet43'); if (x) x.remove(); });
  }
  if (on('battle')) {   // 전투 화면: 등급별 무기 (에픽 23 · 전설 35 · 신화 47 · 초월 65)
    await p.click('#tabs button[data-g="grow"]').catch(() => {}); await p.evaluate(() => window.scrollTo(0, 0));
    for (const wi of [23, 35, 47, 61, 65]) {
      await p.evaluate(w => { window.__noAtk = false; window.__ev(`S.wi = ${w}; S.wl = 5; S.skin = -1; S.wunl = Math.max(S.wunl, ${w}); updateUI(true); 0`); }, wi);
      await p.waitForTimeout(1300); await p.evaluate(() => window.scrollTo(0, 0));
      const cv = await p.locator('#cv, canvas#game, canvas').first();
      await p.screenshot({ path: `uishots/${PREFIX}_bt${wi}.png`, clip: { x: 0, y: 150, width: 390, height: 300 } });
    }
    await p.evaluate(() => window.__ev(`S.wi = 23; S.wl = 5; S.skin = 17; updateUI(true); 0`));
  }
  if (on('ward')) {
    await p.evaluate(() => window.__ev(`(() => { const W = wardState(); ["tr_head","tr_top","tr_tie","tr_arm","tr_shoes","tr_prop","w_storm","a_goldstorm"].forEach(id => { W.own[id] = 0; }); wardWearSet("trip", "eq"); W.eq.aura = "a_goldstorm"; W.eq.wfx = "w_storm"; wardDirty++; updateUI(true); return 0; })()`));
    await p.click('#tabs button[data-g="suit"]').catch(async () => { await p.click('#tabs button[data-g="grow"]'); });
    await p.waitForTimeout(400);
    const tabs = await p.evaluate(() => Array.from(document.querySelectorAll('#tabs button')).map(b => b.dataset.g + ':' + b.textContent.trim()).join(' | '));
    console.log('tabs', tabs);
    await p.evaluate(() => { const b = Array.from(document.querySelectorAll('#tabs button, .subtabs button, [data-tab]')).find(x => /옷장/.test(x.textContent)); if (b) b.click(); });
    await p.waitForTimeout(900);
    await shot('ward', true);
    // 새 옷 아이콘 모아 보기
    await p.evaluate(() => {
      const ids = JSON.parse(window.__ev('JSON.stringify(WITEMS43.map(it => [it.id, it.n, WGRADE[it.g].c]))'));
      const box = document.createElement('div'); box.id = 'wsheet'; box.style.cssText = 'position:fixed;left:0;top:0;width:390px;background:#121522;z-index:99999;padding:6px;display:flex;flex-wrap:wrap;font:10px sans-serif;color:#cfd6ea';
      ids.forEach(([id, n, c]) => { const d = document.createElement('div'); d.style.cssText = 'width:62px;margin:1px;text-align:center'; const im = document.createElement('img'); im.src = window.__ev(`wardIconURL(WIT["${id}"])`); im.style.cssText = `width:58px;height:58px;image-rendering:pixelated;background:#1a1e30;border:1px solid ${c};border-radius:6px`; const s = document.createElement('div'); s.textContent = n; s.style.cssText = `color:${c};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`; d.append(im, s); box.appendChild(d); });
      document.body.appendChild(box);
    });
    await p.waitForTimeout(300);
    await p.locator('#wsheet').screenshot({ path: `uishots/${PREFIX}_wsheet.png` });
    await p.evaluate(() => { const x = document.getElementById('wsheet'); if (x) x.remove(); });
  }
  if (on('chars')) {
    await p.evaluate(() => { const b = Array.from(document.querySelectorAll('#tabs button')).find(x => /정보/.test(x.textContent)); if (b) b.click(); });
    await p.waitForTimeout(700); await shot('info', true);
  }
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
