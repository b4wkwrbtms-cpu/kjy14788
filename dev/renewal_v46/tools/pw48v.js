// 시연 영상: 시계를 1/30초씩 진행하며 전투 화면만 찍어 mp4로
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], viewport: { width: 393, height: 852 }, timezoneId: 'Asia/Seoul' });
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('f')) { sessionStorage.setItem('f', '1'); ['menu34','feel35','feel36','feel37','feel38','feel39','feel40','feel41','feel42','feel43','feel44'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.install();
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(2500);
  await p.addStyleTag({ content: '#celeb, #back, .toast { display: none !important; }' });
  const ev = c => p.evaluate(c => window.__ev(c), c);
  await ev('S.bestFloor = 600; S.maxFloor = 600; S.floor = 82; S.k = 1; spawn(); spawnWait = 0; 0');
  const rect = JSON.parse(await ev('JSON.stringify((() => { const r = ctx.canvas.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })())'));
  await p.clock.pauseAt(Date.now() + 500);
  await p.clock.runFor(3500);                                          // 구역 안내가 지나가게
  const tough = () => ev('if (mon && !mon.dying) { mon.max = mon.hp = stats().dps * 6; } 0');
  let n = 0; const fr = async (k = 1) => { for (let i = 0; i < k; i++) { await p.clock.runFor(33); await p.screenshot({ path: `vid/f${String(n++).padStart(4, '0')}.png`, clip: rect }); } };
  await tough(); await fr(70);                                         // 자동 공격: 평타·치명타
  await tough(); await ev('S.skillCd = {}; castSkill(SKILLS[0]); 0'); await fr(40);    // 결재 폭탄
  await ev('if (mon && !mon.dying) mon.hp = 1; 0'); await fr(32);      // 처치 → 픽셀로 부서짐
  await ev('S.floor = 90; S.k = 5; spawn(); entrance(mon); spawnWait = 0; 0'); await fr(70);   // 임원 등장·착지
  await ev('mon.max = mon.hp = stats().dps * 40; mon.hp = mon.max * 0.49; 0'); await fr(45);   // 격노
  await ev('mon.hp = 1; 0'); await fr(45);                             // 연쇄 폭발
  console.log('frames', n, 'errors', errs.length ? errs.slice(0, 4) : 'none');
  await b.close();
})();
