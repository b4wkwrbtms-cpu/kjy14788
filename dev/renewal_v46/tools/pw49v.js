// v49 시연 영상: zip 불러온 뒤 시계를 1/30초씩 진행하며 전투 화면만 찍음
const { chromium, devices } = require('playwright');
const ZIP = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], viewport: { width: 393, height: 852 }, timezoneId: 'Asia/Seoul' });
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('f')) { sessionStorage.setItem('f', '1'); ['menu34','feel35','feel36','feel37','feel38','feel39','feel40','feel41','feel42','feel43','feel44'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.install();
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(2500);
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(250);
    if (await p.locator('#celeb').isVisible().catch(() => false)) await p.click('#celeb', { timeout: 1500 }).catch(() => {});
    else if (await p.locator('#back').isVisible().catch(() => false)) await p.click('#backGo', { timeout: 1500 }).catch(() => {});
    else if (i > 8) break; }
  await p.addStyleTag({ content: '#celeb, #back, .toast { display: none !important; }' });
  const ev = c => p.evaluate(c => window.__ev(c), c);
  await p.setInputFiles('#hl5File', ZIP);
  for (let i = 0; i < 120; i++) { await p.waitForTimeout(500); if (await ev('hl5.ready && !hl5.busy')) break; }
  await ev('S.bestFloor = 600; S.maxFloor = 600; fxSet().hl5c = 1; S.floor = 3; S.k = 1; spawn(); spawnWait = 0; 0');
  const rect = JSON.parse(await ev('JSON.stringify((() => { const r = ctx.canvas.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })())'));
  await p.clock.pauseAt(Date.now() + 500);
  await p.clock.runFor(1800);
  const tough = (k = 6) => ev(`if (mon && !mon.dying) { mon.max = mon.hp = stats().dps * ${k}; } 0`);
  let n = 0; const fr = async (k = 1) => { for (let i = 0; i < k; i++) { await p.clock.runFor(33); await p.screenshot({ path: `vid49/f${String(n++).padStart(4, '0')}.png`, clip: rect }); } };
  await tough(); await fr(55);
  await tough(); await ev('S.skillCd = {}; castSkill(SKILLS[0]); 0'); await fr(36);
  await ev('if (mon && !mon.dying) mon.hp = 1; 0'); await fr(26);
  for (const [c, f] of [[2, 37], [3, 64], [4, 118]]) {
    await ev(`fxSet().hl5c = ${c}; S.floor = ${f}; S.k = 1; spawn(); spawnWait = 0; if (zoneBanner) zoneBanner.t = 0; 0`); await p.clock.runFor(900); await tough(8); await fr(40);
    await ev('S.skillCd = {}; castSkill(SKILLS[0]); 0'); await fr(30);
  }
  await ev('fxSet().hl5c = 1; S.floor = 90; S.k = 5; spawn(); spawnWait = 0; 0'); await fr(66);
  await ev('mon.max = mon.hp = stats().dps * 40; mon.hp = mon.max * 0.49; mon.hl5 && (mon.hl5.atkT = 0); 0'); await fr(50);
  await ev('mon.hp = 1; 0'); await fr(40);
  await ev('S.floor = 100; S.k = 5; spawn(); spawnWait = 0; 0'); await fr(80);
  await ev('mon.max = mon.hp = stats().dps * 40; mon.hl5 && (mon.hl5.atkT = 0); 0'); await fr(60);
  console.log('frames', n, 'errors', errs.length ? errs.slice(0, 4) : 'none');
  await b.close();
})();
