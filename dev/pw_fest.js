const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
async function page(b, save, opts = {}) {
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', ...(opts.ctx || {}) }); await fontRoutes(ctx);
  if (opts.time) await ctx.clock.setSystemTime(new Date(opts.time));
  await ctx.route('https://ownarhjgryafrgoouirs.supabase.co/**', r => r.abort());
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); if (f) { const s = JSON.parse(f); s.t = Date.now(); s.autoSkill = false; s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } } }, save ? JSON.stringify(save) : "");
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(1800);
  p.celebs = [];
  for (let i = 0; i < 3; i++) { if (await p.locator('#back').isVisible()) { await p.click('#backGo').catch(() => {}); await p.waitForTimeout(1600); } }
  for (let i = 0; i < 8; i++) { if (await p.locator('#celeb').isVisible()) { p.celebs.push(await p.locator('#celebT').textContent()); if (opts.shotCeleb && p.celebs[p.celebs.length - 1].indexOf(opts.shotCeleb[0]) >= 0) await p.screenshot({ path: opts.shotCeleb[1] }); await p.click('#celeb').catch(() => {}); await p.waitForTimeout(350); } }
  await p.addStyleTag({ content: '.toast{display:none!important}' });
  await p.evaluate(() => { window.__noFloat = true; window.__noAtk = true; });
  return p;
}
const go = async (p, js, shot, wait) => { await p.evaluate(c => window.__ev(c), js); await p.waitForTimeout(wait || 500); if (shot) await p.screenshot({ path: 'festshots/' + shot }); };
const at = sel => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (e) { e.scrollIntoView({ block: "start" }); window.scrollBy(0, -140); } })()`;
(async () => {
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const b = await chromium.launch();
  const p = await page(b, save, { shotCeleb: ['순례', 'festshots/f0_intro.png'] });
  console.log('celebs', p.celebs);
  const E = c => p.evaluate(c2 => window.__ev(c2), c);
  await go(p, 'selectTab("weapon"); window.scrollTo(0, 0)', 'f1_main.png', 900);
  await go(p, 'selectTab("daily"); ' + at('.stp'), 'f2_daily_top.png', 600);
  await go(p, at('.fs'), 'f3_fest.png', 500);
  await go(p, '(() => { const H = habitState(); ["2026-10-05","2026-10-06","2026-10-07"].forEach(d => { H.td[d] = (H.td[d] || 0) | 1; }); festMemo.k = ""; updateUI(true); })()', null, 600);
  for (let i = 0; i < 3; i++) { if (await p.locator('#celeb').isVisible()) { console.log('celeb', await p.locator('#celebT').textContent()); if (i === 0) await p.screenshot({ path: 'festshots/f4_dev_celeb.png' }); await p.click('#celeb').catch(() => {}); await p.waitForTimeout(350); } }
  await go(p, at('.fs'), 'f5_fest_dev.png', 400);
  await p.click('#fsInfo button[data-act="claim"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'festshots/f6_claim.png' });
  await p.click('#celeb').catch(() => {}); await p.waitForTimeout(300);
  await go(p, 'S.fest.tok = 37; festUI.k = {}; updateUI(true)', null, 300);
  await p.click('#fsInfo button[data-act="shop"]'); await p.waitForTimeout(400);
  await go(p, at('#fsShop'), 'f7_shop.png', 400);
  await go(p, 'dblAdd("back", 3.2e9, { manna: 30, stamp: 5, haste: 1 }); selectTab("daily"); ' + at('.dbl'), 'f8_dbl.png', 600);
  await go(p, 'selectTab("weapon"); window.scrollTo(0, 0)', 'f9_strip.png', 1700);
  await go(p, 'selectTab("study"); ' + at('.scr'), 'f10_scroll.png', 600);
  await go(p, 'S.scroll.n = 2; updateUI(true)', null, 300);
  await p.click('#scrGo'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'festshots/f11_scroll_use.png' });
  await p.click('#celeb').catch(() => {}); await p.waitForTimeout(300);
  await go(p, 'jarAdd(5e8); selectTab("mem"); ' + at('.jar'), 'f12_jar.png', 600);
  await go(p, 'for (let i = 0; i < 10; i++) jarOnMem(); updateUI(true)', 'f13_jar_ready.png', 400);
  await go(p, '[0,1,2,3,4,30,39,40].forEach(b => { S.firsts.bk[b] = dayKey(); S.firsts.br[b] = 0; S.firsts.bc[b] = b === 30 ? 2 : 1; }); selectTab("bible"); ' + at('.bdex'), 'f14_dex.png', 700);
  await go(p, 'window.scrollBy(0, 300)', 'f15_dex2.png', 300);
  console.log('errors', p.errs.length ? p.errs.slice(0, 5) : 'none');
  // 순례 사이 · 대림절
  const save2 = JSON.parse(JSON.stringify(save)); save2.fest = { sid: "thanks-2026", lv: 30, cf: 10, cd: 10, dev: 1, tok: 40, b: {}, wk: {}, hist: [] };
  const q = await page(b, save2, { time: '2026-11-20T12:00:00+09:00', shotCeleb: ['마쳤어요', 'festshots/f16_close.png'] });
  console.log('gap celebs', q.celebs);
  await go(q, 'selectTab("daily"); ' + at('.fs'), 'f17_gap.png', 600);
  console.log('gap errors', q.errs.length ? q.errs.slice(0, 5) : 'none');
  const r = await page(b, save, { time: '2026-12-01T12:00:00+09:00', shotCeleb: ['순례', 'festshots/f18_advent_intro.png'] });
  console.log('advent celebs', r.celebs);
  await go(r, 'S.fest.lv = 12; S.fest.dev = 1; S.fest.tok = 30; festUI.k = {}; selectTab("daily"); ' + at('.fs'), 'f19_advent.png', 600);
  await go(r, 'document.getElementById("fsTrk").scrollLeft = 400', 'f20_advent_trk.png', 300);
  console.log('advent errors', r.errs.length ? r.errs.slice(0, 5) : 'none');
  // 좁은 화면 (360px)
  const w = await page(b, save, { ctx: { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } });
  await go(w, '(() => { const H = habitState(); ["2026-10-05","2026-10-06","2026-10-07"].forEach(d => { H.td[d] = (H.td[d] || 0) | 1; }); festMemo.k = ""; selectTab("daily"); })()', null, 600);
  for (let i = 0; i < 4; i++) { if (await w.locator('#celeb').isVisible()) { await w.click('#celeb').catch(() => {}); await w.waitForTimeout(300); } }
  await go(w, at('.fs'), 'f22_narrow_fest.png', 500);
  await go(w, 'selectTab("bible"); ' + at('.bdex'), 'f23_narrow_dex.png', 600);
  console.log('narrow errors', w.errs.length ? w.errs.slice(0, 5) : 'none', 'overflowX', await w.evaluate(() => document.documentElement.scrollWidth > window.innerWidth));
  // 새 게임: 첫걸음 꾸러미 카드
  const n = await page(b, null);
  await go(n, 'selectTab("daily"); ' + at('.stp'), 'f21_fresh_daily.png', 600);
  console.log('fresh errors', n.errs.length ? n.errs.slice(0, 5) : 'none');
  await b.close();
})();
