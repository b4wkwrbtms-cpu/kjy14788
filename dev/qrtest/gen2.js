const fs = require('fs');
eval(fs.readFileSync('../qr_core.js', 'utf8'));
const out = [];
for (const v of [1, 2, 4, 7, 10]) for (let m = 0; m < 8; m++) { const t = v === 1 ? 'KJY' : 'https://b4wkwrbtms-cpu.github.io/kjy14788/?invite=1'; const M = qrMatrix(t, v, m); out.push({ t, v, m, n: M.length, mat: M.map(r => r.map(b => b ? 1 : 0).join('')) }); }
fs.writeFileSync('mats2.json', JSON.stringify(out)); console.log(out.length);
