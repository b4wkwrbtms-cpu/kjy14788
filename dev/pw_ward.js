const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
async function page(b, save, opts = {}) {
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', ...(opts.ctx || {}) }); await fontRoutes(ctx);
  await ctx.route('https://ownarhjgryafrgoouirs.supabase.co/**', r => r.abort());
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); if (f) { const s = JSON.parse(f); s.t = Date.now(); s.autoSkill = false; s.habit = Object.assign(s.habit || {}, { intro: 1 }); localStorage.setItem('yageun-knight-v3', JSON.stringify(s)); } } }, save ? JSON.stringify(save) : "");
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(1800);
  p.celebs = [];
  for (let i = 0; i < 3; i++) { if (await p.locator('#back').isVisible()) { await p.click('#backGo').catch(() => {}); await p.waitForTimeout(1600); } }
  for (let i = 0; i < 6; i++) { if (await p.locator('#celeb').isVisible()) { p.celebs.push(await p.locator('#celebT').textContent()); if (i === 0 && opts.shotCeleb) await p.screenshot({ path: opts.shotCeleb }); await p.click('#celeb').catch(() => {}); await p.waitForTimeout(350); } }
  await p.addStyleTag({ content: '.toast{display:none!important}' });
  await p.evaluate(() => { window.__noFloat = true; window.__noAtk = true; });
  return p;
}
(async () => {
  const save = JSON.parse(fs.readFileSync('restore/save_v30.json', 'utf8'));
  const b = await chromium.launch();
  const p = await page(b, save, { shotCeleb: 'wardshots/w0_migrate.png' });
  console.log('celebs', p.celebs);
  const E = c => p.evaluate(c2 => window.__ev(c2), c);
  await E('selectTab("weapon"); window.scrollTo(0, 0)'); await p.waitForTimeout(900);
  await p.screenshot({ path: 'wardshots/w1_battle.png' });
  await E('selectTab("suit"); document.querySelector(".wd-room").scrollIntoView({ block: "start" }); window.scrollBy(0, -130)'); await p.waitForTimeout(600);
  await p.screenshot({ path: 'wardshots/w2_room.png' });
  await E('document.getElementById("wdList").scrollIntoView({ block: "start" }); window.scrollBy(0, -130)'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'wardshots/w3_list.png' });
  await E('wardUI.slot = "head"; updateUI(true); document.getElementById("wdList").scrollIntoView({ block: "start" }); window.scrollBy(0, -130)'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'wardshots/w3b_head.png' });
  await E('wardUI.mode = "look"; updateUI(true)'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'wardshots/w5_look.png' });
  await E('wardUI.mode = "eq"; wardUI.view = "set"; updateUI(true); document.getElementById("wdList").scrollIntoView({ block: "start" }); window.scrollBy(0, -130)'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'wardshots/w4_set.png' });
  await E('document.getElementById("wdColl").scrollIntoView({ block: "start" }); window.scrollBy(0, -150)'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'wardshots/w6_coll.png' });
  await E('wardPreview("ar_head")'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'wardshots/w7_preview.png' });
  await p.click('#celeb').catch(() => {}); await p.waitForTimeout(300);
  await E('selectTab("info"); document.querySelector(".profile").scrollIntoView({ block: "start" }); window.scrollBy(0, -120)'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'wardshots/w8_info.png' });
  // 그림 견본: 세트 14벌 · 오라 10 · 무기 이펙트 13 (애니메이션 한 장면)
  await E(`(() => {
    const cv = document.createElement("canvas"); cv.id = "sheet"; cv.width = 1170; cv.height = 1500; cv.style.cssText = "position:fixed;left:0;top:0;width:390px;height:500px;z-index:99999;background:#151b31;image-rendering:pixelated";
    document.body.appendChild(cv); const g = cv.getContext("2d"); g.imageSmoothingEnabled = false; g.fillStyle = "#151b31"; g.fillRect(0, 0, 1170, 1500);
    g.font = '20px "Do Hyeon"'; g.fillStyle = "#e9edf6"; g.textBaseline = "top";
    WSETS.forEach((set, i) => { const sh = {}; wardSetPieces(set).forEach(it => { if (WBODY.indexOf(it.slot) >= 0) sh[it.slot] = it; }); const lk = wardLookWith(CHARS[0], sh); const x = 10 + (i % 7) * 166, y = 10 + Math.floor(i / 7) * 190; drawSprite(g, lk.map, lk.pal, x + 30, y + 10, 5, { pretty: true }); g.fillText(set.n, x, y + 158); });
    WITEMS.filter(it => it.slot === "aura").forEach((it, i) => { const x = 10 + (i % 5) * 232, y = 400 + Math.floor(i / 5) * 230; const sh = { aura: it }; const lk = wardLookWith(CHARS[0], sh); drawWardAura(g, it.aura, x + 80 + 9 * 5, y + 30 + 13 * 5, 5, 600 + i * 137, false); drawSprite(g, lk.map, lk.pal, x + 80, y + 30, 5, { pretty: true }); g.fillStyle = "#e9edf6"; g.fillText(it.n, x + 10, y + 200); });
    WITEMS.filter(it => it.slot === "wfx").forEach((it, i) => { const x = 10 + (i % 7) * 166, y = 870 + Math.floor(i / 7) * 300; const wi = 12; g.save(); g.translate(x + 70, y + 230); g.rotate(0.3); drawWfxBack(g, it.fx, 9, 800 + i * 211, false); g.restore(); drawWeapon(g, wi, 5, x + 70, y + 230, 0.3, 9, 800 + i * 211, false); g.save(); g.translate(x + 70, y + 230); g.rotate(0.3); drawWfxFront(g, it.fx, 9, 800 + i * 211, false); g.restore(); g.fillStyle = "#e9edf6"; g.fillText(it.n, x + 10, y + 262); });
  })()`);
  await p.waitForTimeout(300);
  await p.locator('#sheet').screenshot({ path: 'wardshots/w9_sheet.png' });
  console.log('errors', p.errs.length ? p.errs.slice(0, 5) : 'none');
  // 새 게임
  const q = await page(b, null);
  const Q = c => q.evaluate(c2 => window.__ev(c2), c);
  await Q('S.bible.total = 5; S.bestFloor = 6; updateUI(true)'); await q.waitForTimeout(1500);
  const cs = []; for (let i = 0; i < 4; i++) { if (await q.locator('#celeb').isVisible()) { cs.push(await q.locator('#celebT').textContent()); if (i === 0) await q.screenshot({ path: 'wardshots/w10_fresh_unlock.png' }); await q.click('#celeb').catch(() => {}); await q.waitForTimeout(400); } }
  console.log('fresh celebs', cs, 'tabs', await Q('JSON.stringify(TABS.filter(t => tabOpen(t[0])).map(t => t[1]))'));
  await Q('selectTab("suit"); window.scrollTo(0, 0)'); await q.waitForTimeout(500);
  await q.screenshot({ path: 'wardshots/w11_fresh_suit.png' });
  console.log('fresh errors', q.errs.length ? q.errs.slice(0, 5) : 'none');
  await b.close();
})();
