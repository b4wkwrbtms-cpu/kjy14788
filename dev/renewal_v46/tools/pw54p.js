// 53 조사: 몬스터 방향 수와 방향별 모습, 영웅 cif 목록
const { chromium, devices } = require('playwright'); const fs = require('fs');
const ZIP = process.argv[2];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 393, height: 852 } });
  await ctx.addInitScript(() => { ['menu34','feel35','feel36','feel37','feel38','feel39','feel40','feel41','feel42','feel43','feel44'].forEach(k => localStorage.setItem('yageun-knight-v3-' + k, '1')); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/dbg.html'); await p.waitForTimeout(3000);
  const ev = c => p.evaluate(c => window.__ev(c), c);
  await ev('menuGo("set"); 0'); await p.waitForTimeout(500);
  await p.setInputFiles('#hl5File', ZIP);
  for (let i = 0; i < 120; i++) { await p.waitForTimeout(500); if (await ev('hl5.ready && !hl5.busy')) break; }
  console.log(await ev('JSON.stringify({ n: hl5.files.size, sk: Object.fromEntries(Object.entries(hl5.skills).map(([k, v]) => [k, v.map(x => x.name + ":" + x.mo.join("-"))])) })'));
  console.log('errors', errs.slice(0, 3)); await b.close();
})();
