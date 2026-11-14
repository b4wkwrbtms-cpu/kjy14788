// v49 확인 2: 직업 4종 · 서류함 · 다시 열기(폰 저장 유지) · 설정 카드 · 성능
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || 'shots49', ZIP = process.argv[3];
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
    await p.addStyleTag({ content: '#celeb, #back, .toast, .dpsfx { display: none !important; }' }); };
  const ev = c => p.evaluate(c => { try { return window.__ev(c); } catch (e) { return 'ERR ' + e.message; } }, c);
  await boot();
  await p.setInputFiles('#hl5File', ZIP);
  for (let i = 0; i < 120; i++) { await p.waitForTimeout(500); if (await ev('hl5.ready && !hl5.busy')) break; }
  await ev('save(); 0'); await p.waitForTimeout(500);
  // 다시 열기: 폰 저장에서 바로 불러오는지
  await boot(); await p.waitForTimeout(1500);
  console.log('after reload ready =', await ev('hl5.ready'), await ev('hl5StatText()'));
  await ev('window.__noFloat = true; S.bestFloor = 600; S.maxFloor = 600; 0');
  const rect = JSON.parse(await ev('JSON.stringify((() => { const r = ctx.canvas.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })())'));
  const shot = async n => p.screenshot({ path: `${OUT}/${n}.png`, clip: rect });
  // 성능: 2초 동안 프레임 시간
  const perf = async tag => { const r = await p.evaluate(() => new Promise(res => { const ts = []; let n = 0; const f = t => { ts.push(t); if (++n < 120) requestAnimationFrame(f); else { const d = ts.slice(1).map((v, i) => v - ts[i]); d.sort((a, b) => a - b); res({ med: d[d.length >> 1], p95: d[Math.floor(d.length * 0.95)] }); } }; requestAnimationFrame(f); })); console.log('perf', tag, JSON.stringify(r)); };
  await ev('__setF(37); spawnWait = 0; mon.hp = mon.max = 1e300; 0'); await p.waitForTimeout(1800);
  await perf('hl5 on'); await ev('fxSet().hl5 = 0; 0'); await ev('__setF(37); mon.hp = mon.max = 1e300; 0'); await p.waitForTimeout(800); await perf('hl5 off'); await ev('fxSet().hl5 = 1; 0');
  for (const c of [1, 2, 3, 4]) {
    await ev(`fxSet().hl5c = ${c}; __setF(${[12, 37, 64, 118][c - 1]}); spawnWait = 0; mon.hp = mon.max = 1e300; 0`); await p.waitForTimeout(1900);
    console.log('class', c, await ev('JSON.stringify([mon.name, monSize()])'));
    for (let i = 0; i < 3; i++) { await p.waitForTimeout(170); await shot(`c${c}_${i}`); }
    await ev('S.skillCd = {}; castSkill(SKILLS[0]); 0'); await p.waitForTimeout(420); await shot(`c${c}_sk`);
  }
  await ev('fxSet().hl5c = 0; 0');
  await ev('__startVault(); 0'); await p.waitForTimeout(2200); console.log('vault', await ev('JSON.stringify([mode, mon && mon.name, mon && mon.sprite])')); await shot('v_vault');
  // 설정 카드
  await ev('menuGo("set"); 0'); await p.waitForTimeout(800);
  const card = p.locator('.hl5-card'); await card.scrollIntoViewIfNeeded().catch(() => {}); await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/set_card.png` });
  console.log('errors', errs.length ? errs.slice(0, 8) : 'none');
  await b.close();
})();
