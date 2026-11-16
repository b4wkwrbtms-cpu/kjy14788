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
  const info = await ev(`JSON.stringify((() => {
    const L = hl5.lists, out = { keys: Object.keys(L), nd: {} };
    for (const k of ["norm","named","boss","big"]) (L[k]||[]).forEach(e => { const c = hl5Cif(hl5Pad3(e.cif)); const nd = c && c.motions[0] ? c.motions[0].length : -1; out.nd[nd] = (out.nd[nd]||0)+1; });
    out.files = Object.keys(hl5.files || {}).filter(n => /cif/i.test(n)).slice(0, 40);
    return out; })())`);
  console.log(info);
  // 방향별 모습: 일반 몹 6종 × 방향
  const url = await ev(`(() => {
    const L = hl5.lists, ents = L.norm.slice(0, 8), W = 120, H = 140; let maxd = 1;
    const ts = ents.map((e, i) => { const T = hl5MonType(e, 0); if (T) maxd = Math.max(maxd, T.cif.motions[0].length); return T; });
    const c = document.createElement("canvas"); c.width = W * maxd; c.height = H * ents.length; const g = c.getContext("2d"); g.fillStyle = "#334"; g.fillRect(0,0,c.width,c.height);
    ts.forEach((T, r) => { if (!T) return; for (let d = 0; d < T.cif.motions[0].length; d++) { const fr = T.cif.motions[0][d]; if (!fr || !fr.length) continue; const [a,bb,u] = hl5Pose(fr, 0, true); g.save(); g.setTransform(1.6,0,0,1.6,W*d+W/2,H*r+H-10); hl5Draw(g, a, bb, u, T.banks, 0, 0, 1, false, null); g.restore(); g.fillStyle="#fff"; g.font="12px sans-serif"; g.fillText(r+":"+d, W*d+4, H*r+14); } });
    return c.toDataURL(); })()`);
  fs.writeFileSync('p53_dirs.png', Buffer.from(url.split(',')[1], 'base64'));
  console.log('errors', errs.slice(0, 3)); await b.close();
})();
