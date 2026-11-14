// v50 확인 2: ver2 질의응답 설교 · 길잡이 끄기 · 차례 · 성경 쪽 연결 · 다시 열기 유지
const { chromium, devices } = require('playwright');
const OUT = process.argv[2], PACK = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], viewport: { width: 393, height: 852 }, timezoneId: 'Asia/Seoul' });
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('f')) { sessionStorage.setItem('f', '1'); ['menu34','feel35','feel36','feel37','feel38','feel39','feel40','feel41','feel42','feel43','feel44'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const boot = async () => { await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(2500);
    for (let i = 0; i < 30; i++) { await p.waitForTimeout(250);
      if (await p.locator('#celeb').isVisible().catch(() => false)) await p.click('#celeb', { timeout: 1500 }).catch(() => {});
      else if (await p.locator('#back').isVisible().catch(() => false)) await p.click('#backGo', { timeout: 1500 }).catch(() => {});
      else if (i > 8) break; }
    await p.addStyleTag({ content: '#celeb, #back, .toast { display: none !important; }' }); };
  const ev = c => p.evaluate(c => { try { return window.__ev(c); } catch (e) { return 'ERR ' + e.message; } }, c);
  await boot(); await ev('menuGo("bible"); typeof showTab === "function" && showTab("study"); 0'); await p.waitForTimeout(900);
  await p.setInputFiles('#kelFile', PACK); for (let i = 0; i < 20 && !(await ev('kel.ready')); i++) await p.waitForTimeout(500);
  await boot(); await p.waitForTimeout(1500); console.log('after reload', await ev('kel.ready + " " + kel.list.length'));
  const sc = async n => p.screenshot({ path: `${OUT}/${n}.png` });
  await ev('smOpenFromTab("k2-01"); 0'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const q = document.querySelector('.kl-qq'); if (q) q.scrollIntoView({ block: 'start' }); }); await p.waitForTimeout(500); await sc('i_qa');
  await p.evaluate(() => document.querySelector('[data-ktoc]').click()); await p.evaluate(() => document.getElementById('rdShBody').scrollTop = 0); await p.waitForTimeout(400); await sc('j_toc');
  await p.evaluate(() => document.querySelector('[data-kov]').click()); await p.waitForTimeout(800);
  console.log('ov off hooks', await ev('document.querySelectorAll(".kl-hook").length'), 'map', await ev('document.querySelectorAll(".kl-map").length')); await sc('k_off');
  await p.evaluate(() => document.querySelector('[data-kov]').click()); await p.waitForTimeout(600);
  await ev('rdSheetClose(); openReader(60, 0); 0'); await p.waitForTimeout(2000);   // 베드로후서 1장
  console.log('bible side keller chips', await ev('[...document.querySelectorAll("#reader [data-sm]")].map(x => x.dataset.sm).join(",")'));
  await sc('l_bible');
  await ev('smOpenFromTab("k2-15"); 0'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const q = document.querySelectorAll('.kl-sp')[2]; if (q) q.scrollIntoView({ block: 'start' }); }); await p.waitForTimeout(500); await sc('m_k215');
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none'); await b.close();
})();
