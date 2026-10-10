const fs = require('fs');
eval(fs.readFileSync('../qr_core.js', 'utf8'));
const cases = [
  ['https://b4wkwrbtms-cpu.github.io/kjy14788/?invite=1', 0],
  ['https://b4wkwrbtms-cpu.github.io/kjy14788/', 0],
  ['hi', 0], ['hello world', 2], ['곽준영 키우기 같이 해요!', 0],
  ['https://b4wkwrbtms-cpu.github.io/kjy14788/?invite=1', 5], ['https://b4wkwrbtms-cpu.github.io/kjy14788/?invite=1', 6],
  ['https://b4wkwrbtms-cpu.github.io/kjy14788/?invite=1', 7], ['https://b4wkwrbtms-cpu.github.io/kjy14788/?invite=1', 8],
  ['https://b4wkwrbtms-cpu.github.io/kjy14788/?invite=1', 9], ['https://b4wkwrbtms-cpu.github.io/kjy14788/?invite=1', 10],
  ['x'.repeat(150), 0], ['말씀 읽고 공부하며 오르는 본사 타워 · 곽준영 키우기 '.repeat(3), 0],
];
const out = cases.map(([t, v]) => { const M = qrMatrix(t, v); return { t, v, n: M ? M.length : 0, m: M ? M.map(r => r.map(b => b ? 1 : 0).join('')) : null }; });
fs.writeFileSync('mats.json', JSON.stringify(out));
console.log(out.map(o => `${o.v}->${o.n ? (o.n - 17) / 4 : 'none'}`).join(' '));
