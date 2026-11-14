// v50 확인: 설교 탭 → 켈러 팩 고르기 → 설교 열기 → 지도·훅·강조·주석·다음 장·해부
const { chromium, devices } = require('playwright');
const OUT = process.argv[2], PACK = process.argv[3], SID = process.argv[4] || 'k1-02';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], viewport: { width: 393, height: 852 }, timezoneId: 'Asia/Seoul' });
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('f')) { sessionStorage.setItem('f', '1'); ['menu34','feel35','feel36','feel37','feel38','feel39','feel40','feel41','feel42','feel43','feel44'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(2500);
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(250);
    if (await p.locator('#celeb').isVisible().catch(() => false)) await p.click('#celeb', { timeout: 1500 }).catch(() => {});
    else if (await p.locator('#back').isVisible().catch(() => false)) await p.click('#backGo', { timeout: 1500 }).catch(() => {});
    else if (i > 8) break; }
  await p.addStyleTag({ content: '#celeb, #back, .toast { display: none !important; }' });
  const ev = c => p.evaluate(c => { try { return window.__ev(c); } catch (e) { return 'ERR ' + e.message; } }, c);
  await ev('menuGo("bible"); 0'); await p.waitForTimeout(600);
  await ev('typeof showTab === "function" && showTab("study"); 0'); await p.waitForTimeout(800);
  const has = await p.locator('#kelFile').count(); console.log('file input', has);
  if (!has) { console.log(await ev('document.querySelector("#smList") ? "smList ok" : "no smList"')); }
  await p.setInputFiles('#kelFile', PACK); await p.waitForTimeout(2500);
  for (let i = 0; i < 20 && !(await ev("kel.ready")); i++) await p.waitForTimeout(500);
  console.log("loaded", await ev("kel.ready + \" \" + kel.list.length + \" \" + kel.msg + \" busy \" + kel.busy"));
  await p.locator('#smList').scrollIntoViewIfNeeded().catch(() => {}); await p.waitForTimeout(800);
  await p.evaluate(() => { const L = [...document.querySelectorAll('#smList .sec-title')].find(x => /켈러/.test(x.textContent)); if (L) L.scrollIntoView(); });
  await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/a_list.png` });
  await ev(`smOpenFromTab("${SID}"); 0`); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/b_top.png` });
  const sc = async (y, n) => { await p.evaluate(y => { document.getElementById('rdShBody').scrollTop = y; }, y); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/${n}.png` }); };
  await sc(900, 'c_900'); await sc(2600, 'd_2600');
  await p.evaluate(() => { const f = document.querySelector('.kl-fn'); if (f) { f.scrollIntoView({ block: 'center' }); f.click(); } }); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/e_note.png` });
  await p.evaluate(() => { const k = document.querySelector('.kl-key'); if (k) k.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/f_key.png` });
  await p.evaluate(() => { const k = document.getElementById('kl-anat'); if (k) k.scrollIntoView(); }); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/g_anat.png` });
  const st = await ev('JSON.stringify({ secs: document.querySelectorAll(".kl-sec").length, hooks: document.querySelectorAll(".kl-hook").length, keys: document.querySelectorAll(".kl-key").length, em: document.querySelectorAll(".kl-em").length, fn: document.querySelectorAll(".kl-fn").length, vref: document.querySelectorAll(".kl-root .vref").length, paras: document.querySelectorAll(".kl-root .sm-p").length, hscroll: document.documentElement.scrollWidth })');
  console.log(st);
  // 성경 주소 누르기 → 관련 구절 → 돌아가기
  const hasRef = await p.evaluate(() => { const v = document.querySelector('.kl-root .vref'); if (v) { v.click(); return v.textContent; } return null; });
  await p.waitForTimeout(1200); if (hasRef) { await p.screenshot({ path: `${OUT}/h_ref.png` }); await p.evaluate(() => { const bk = document.querySelector('[data-r="sh-prev"]'); if (bk) bk.click(); }); await p.waitForTimeout(800); console.log('back to keller', await ev('!!document.querySelector(".kl-root")')); }
  console.log('ref clicked', hasRef, 'errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
