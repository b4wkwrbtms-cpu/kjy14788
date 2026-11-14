const { boot } = require('./x5lib.js');
(async () => {
  const [so, vfs, wasm] = process.argv.slice(2);
  const E = await boot(so, vfs, wasm);
  for (let i = 0; i < 30; i++) E.ex.app_loop && E.ex.app_loop();
  const g = E.rd32(0x100000 + 0x16fcc8) >>> 0; console.log('graphic', g.toString(16));
  const lut = E.gr(g + 0x6d, 16 * 1024);
  const cands = { src: (s, d) => s, add: (s, d) => Math.min(31, s + d), sub: (s, d) => Math.max(0, d - s), mul: (s, d) => Math.floor(s * d / 31), screen: (s, d) => 31 - Math.floor((31 - s) * (31 - d) / 31), max: (s, d) => Math.max(s, d), min: (s, d) => Math.min(s, d), dst: (s, d) => d, avg: (s, d) => (s + d) >> 1, inv: (s, d) => 31 - d };
  for (let m = 0; m < 16; m++) {
    const T = (s, d) => lut[(m * 32 + s) * 32 + d]; const res = [];
    for (const [n, f] of Object.entries(cands)) { let err = 0; for (let s = 0; s < 32; s++) for (let d = 0; d < 32; d++) err += Math.abs(T(s, d) - f(s, d)); res.push([n, err]); }
    res.sort((a, b) => a[1] - b[1]);
    console.log('mode', m, res.slice(0, 2).map(x => x.join(':')).join(' '), '| T(8,8)=', T(8, 8), 'T(20,10)=', T(20, 10), 'T(10,20)=', T(10, 20), 'T(31,0)=', T(31, 0), 'T(0,31)=', T(0, 31));
  }
})();
