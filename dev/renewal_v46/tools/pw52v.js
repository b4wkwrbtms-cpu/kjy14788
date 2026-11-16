// 52: 60프레임으로 전투 찍기(곽준영 공격 연속 · 스킬 · 맞기 · 쓰러짐 · 보스) + 프레임마다 그리기 시간
const { chromium, devices } = require('playwright');
const ZIP = process.argv[2], OUT = process.argv[3] || 'vid52';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], viewport: { width: 393, height: 852 } });
  await ctx.addInitScript(() => { ['menu34','feel35','feel36','feel37','feel38','feel39','feel40','feel41','feel42','feel43','feel44'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.install();
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(2500);
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(250);
    if (await p.locator('#celeb').isVisible().catch(() => false)) await p.click('#celeb', { timeout: 1500 }).catch(() => {});
    else if (await p.locator('#back').isVisible().catch(() => false)) await p.click('#backGo', { timeout: 1500 }).catch(() => {});
    else if (i > 8) break; }
  await p.addStyleTag({ content: '#celeb, #back, .toast { display: none !important; }' });
  const ev = c => p.evaluate(c => window.__ev(c), c);
  await ev('menuGo("set"); 0'); await p.waitForTimeout(500);
  await p.setInputFiles('#hl5File', ZIP);
  for (let i = 0; i < 120; i++) { await p.waitForTimeout(500); if (await ev('hl5.ready && !hl5.busy')) break; }
  await ev('menuGo("tower"); S.bestFloor = 600; S.maxFloor = 600; fxSet().hl5c = 1; S.floor = 23; S.k = 1; spawn(); spawnWait = 0; 0');
  const rect = JSON.parse(await ev('JSON.stringify((() => { const r = ctx.canvas.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })())'));
  await p.clock.pauseAt(Date.now() + 500); await p.clock.runFor(2500);
  const tough = k => ev(`if (mon && !mon.dying) { mon.max = mon.hp = stats().dps * ${k}; } 0`);
  let n = 0; const fr = async k => { for (let i = 0; i < k; i++) { await p.clock.runFor(16.7); await p.screenshot({ path: `${OUT}/f${String(n++).padStart(4, '0')}.png`, clip: rect }); } };
  await tough(20); await fr(150);
  await ev('S.skillCd = {}; castSkill(SKILLS[0]); 0'); await fr(70);
  await ev('if (mon && !mon.dying) mon.hp = 1; 0'); await fr(120);
  await ev('S.floor = 30; S.k = 5; spawn(); spawnWait = 0; 0'); await fr(90); await tough(40); await ev('mon.hl5 && (mon.hl5.atkT = 0); 0'); await fr(90);
  console.log('frames', n, 'warm left', await ev('hl5.warm.length'), 'errors', errs.slice(0, 3));
  await b.close();
})();
