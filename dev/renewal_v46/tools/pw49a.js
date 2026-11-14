// v49 확인: zip 불러오기 → 프레임 단위 캡처
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || 'shots49', ZIP = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], viewport: { width: 393, height: 852 }, timezoneId: 'Asia/Seoul' });
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('f')) { sessionStorage.setItem('f', '1'); ['menu34','feel35','feel36','feel37','feel38','feel39','feel40','feel41','feel42','feel43','feel44'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('C:' + m.text()); });
  await p.clock.install();
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(2500);
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(250);
    if (await p.locator('#celeb').isVisible().catch(() => false)) await p.click('#celeb', { timeout: 1500 }).catch(() => {});
    else if (await p.locator('#back').isVisible().catch(() => false)) await p.click('#backGo', { timeout: 1500 }).catch(() => {});
    else if (i > 8) break; }
  const ev = c => p.evaluate(c => window.__ev(c), c);
  await p.addStyleTag({ content: '#celeb, #back, .toast, .dpsfx { display: none !important; }' });
  const t0 = Date.now();
  await p.setInputFiles('#hl5File', ZIP);
  for (let i = 0; i < 240; i++) { await p.waitForTimeout(500); const st = await ev('JSON.stringify([hl5.ready, hl5.busy, hl5.msg])'); if (i % 6 === 0) console.log(st); const a = JSON.parse(st); if (!a[1]) break; }
  console.log('import ms', Date.now() - t0, await ev('hl5StatText()'));
  console.log(await ev('JSON.stringify({ norm: hl5.lists.norm.map(e => e.name).slice(0, 40), boss: hl5.lists.boss.map(e => e.name), big: hl5.lists.big.map(e => e.name), named: hl5.lists.named.length })'));
  await ev('window.__noAtk = true; window.__noFloat = true; S.bestFloor = 600; S.maxFloor = 600; 0');
  const rect = JSON.parse(await ev('JSON.stringify((() => { const r = ctx.canvas.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })())'));
  await p.clock.pauseAt(Date.now() + 1000);
  const run = ms => p.clock.runFor(ms);
  const shot = async n => p.screenshot({ path: `${OUT}/${n}.png`, clip: rect });
  const fresh = async f => { await ev(`__setF(${f}); spawnWait = 0; 0`); await run(1600); await ev('if (mon) { mon.hp = mon.max; } 0'); };
  await fresh(3); console.log('mon', await ev('JSON.stringify([mon.name, mon.sprite, mon.scale, !!mon.hl5, monSize()])'));
  await shot('1_idle');
  await ev('hit(stats().atk, false, "hero"); 0'); await run(60); await shot('2_hit');
  await run(300); await ev('hit(stats().atk * 3, true, "hero"); 0'); await run(60); await shot('3_crit'); await run(120); await shot('3b_crit');
  await ev('window.__noAtk = false; 0'); for (let i = 0; i < 6; i++) { await run(110); await shot('4_atk' + i); } await ev('window.__noAtk = true; 0');
  await run(600); await ev('S.skillCd = {}; castSkill(SKILLS[0]); 0'); await run(200); await shot('5_cast'); await run(260); await shot('5b_cast');
  await run(800); await ev('mon.hp = 1; hit(stats().atk, false, "hero"); 0'); await run(50); await shot('6_kill'); await run(220); await shot('6b_kill');
  await run(2500);
  for (const [f, tag] of [[90, 'exec'], [100, 'big']]) {
    await ev(`S.floor = ${f}; S.k = 5; spawn(); spawnWait = 0; 0`);
    for (let i = 0; i < 40; i++) { await run(60); const st = await ev('intro ? intro.t / intro.dur : 1'); if (st >= 1) break; }
    await run(500); console.log(tag, await ev('JSON.stringify([mon.name, mon.kind, monSize()])')); await shot(`7_${tag}`);
    await ev('hit(stats().atk, true, "hero"); 0'); await run(80); await shot(`7b_${tag}_hit`);
    await ev('mon.hl5 && (mon.hl5.atkT = 0); 0'); await run(450); await shot(`7c_${tag}_atk`);
    await run(2500);
  }
  console.log('errors', errs.length ? errs.slice(0, 8) : 'none');
  await b.close();
})();
