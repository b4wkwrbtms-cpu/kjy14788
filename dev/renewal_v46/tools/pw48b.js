// v48 연출 확인: 시계를 멈추고 프레임 단위로 진행하며 전투 화면만 캡처
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || 'shots';
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
  const ev = c => p.evaluate(c => window.__ev(c), c);
  await p.addStyleTag({ content: '#celeb, #back, .toast, .dpsfx { display: none !important; }' });
  await ev('window.__noAtk = true; window.__noFloat = true; S.bestFloor = 600; S.maxFloor = 600; 0');
  const rect = JSON.parse(await ev('JSON.stringify((() => { const r = ctx.canvas.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })())'));
  await p.clock.pauseAt(Date.now() + 1000);
  const run = ms => p.clock.runFor(ms);
  const shot = async n => p.screenshot({ path: `${OUT}/${n}.png`, clip: rect });
  const fresh = async f => { await ev(`__setF(${f}); spawnWait = 0; 0`); await run(1600); await ev('if (mon) { mon.hp = mon.max; } 0'); };
  await fresh(3);
  await ev('hit(stats().atk, false, "hero"); 0'); await run(50); await shot('1_hit');
  await run(300); await ev('hit(stats().atk * 3, true, "hero"); 0'); await run(50); await shot('2_crit'); await run(120); await shot('2b_crit');
  await run(600); await ev('S.skillCd = {}; castSkill(SKILLS[0]); 0'); await run(150); await shot('3_cast'); await run(140); await shot('3b_skillhit'); await run(150); await shot('3c_skill');
  await run(800); await ev('mon.hp = 1; hit(stats().atk, false, "hero"); 0'); await run(34); await shot('4_kill'); await run(220); await shot('4b_kill'); await run(380); await shot('4c_kill');
  for (const [f, tag] of [[90, 'exec'], [100, 'dragon']]) {
    await ev(`S.floor = ${f}; S.k = 5; spawn(); entrance(mon); spawnWait = 0; 0`);
    let landed = false;
    for (let i = 0; i < 40; i++) { await run(60); const st = await ev('intro ? intro.t / intro.dur : 1'); if (!landed && st > 0.47) { landed = true; await run(60); await shot(`5_${tag}_land`); } if (st >= 1) break; }
    await run(400); await ev('mon.hp = mon.max * 0.49; 0'); await run(90); await shot(`6_${tag}_rage`); await run(1100); await shot(`6b_${tag}_embers`);
    await ev('mon.hp = 1; hit(stats().atk, false, "hero"); 0'); await run(260); await shot(`7_${tag}_chain`); await run(330); await shot(`7b_${tag}_chain`); await run(500); await shot(`7c_${tag}_end`);
    await run(2500);
  }
  await ev('fxSet().bloom = 0; 0'); await run(40); await shot('8_nobloom'); await ev('fxSet().bloom = 1; 0'); await run(40); await shot('8_bloom');
  console.log('errors', errs.length ? errs.slice(0, 6) : 'none');
  await b.close();
})();
