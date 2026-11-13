// LoadRes로 있는 파일을 모두 꺼내 out/ 아래 같은 경로로 저장
const fs = require('fs'), path = require('path');
const { boot } = require('./x5lib.js');
(async () => {
  const [so, vfs, wasm, out] = process.argv.slice(2);
  const E = await boot(so, vfs, wasm);
  const LR = E.sym('_ZN10StaticUtil7LoadResEPcPi');
  const sz = E.ex.guest_malloc(4), pbuf = E.ex.guest_malloc(256);
  const pad = (n, w) => String(n).padStart(w, '0');
  const paths = [];
  for (let d = 0; d <= 6; d++) for (let i = 0; i < 400; i++) paths.push(`/c/sp/img${d}/${pad(i, 3)}.mgr`);
  for (let i = 0; i < 900; i++) { paths.push(`/c/sp/cif/${pad(i, 3)}.cif`); paths.push(`/c/sp/ext/${pad(i, 3)}.ext`); paths.push(`/c/sp/pal/${pad(i, 3)}.pal`); }
  ['828_sk', 'ealogo', 'eff', 'imo', 'pointer', 'title'].forEach(n => { paths.push(`/c/sp/imgcom/${n}.mgr`); paths.push(`/c/sp/cif/${n}.cif`); paths.push(`/c/sp/ext/${n}.ext`); });
  ['gmenu', 'icon', 'menu', 'shadow', 'touch', 'ui', 'worldmap'].forEach(n => paths.push(`/c/img/${n}.mgr`));
  for (let i = 0; i < 400; i++) { paths.push(`/c/mon/${i}_ai`); paths.push(`/c/par/p${pad(i, 3)}`); paths.push(`/c/par/ps${pad(i, 3)}`); }
  for (let i = 0; i < 40; i++) paths.push(`/c/par/pimg${pad(i, 2)}.mgr`);
  paths.push('/c/par/pinfo.dat');
  const csv = ['tips', 'mission_list', 'class', 'buildup', 'collection', 'droptable', 'option', 'probability', 'set_option', 'enemy_g', 'enemy_g_expert', 'npc_g', 'questTree', 'name', 'cash_expert'];
  csv.forEach(n => paths.push(`/c/csv/${n}.dat`));
  for (let i = 0; i < 40; i++) { paths.push(`/c/csv/skill_${pad(i, 2)}.dat`); paths.push(`/c/csv/item_${pad(i, 2)}.dat`); paths.push(`/c/csv/enemy_${i}.dat`); paths.push(`/c/csv/enemy_expert_${i}.dat`); paths.push(`/c/csv/smith_${i}.dat`); paths.push(`/c/csv/zonemap_${i}.dat`); }
  let n = 0, bytes = 0; const index = [];
  for (const p of paths) {
    const b = Buffer.from(p + '\0', 'latin1'); E.gw(pbuf, b); E.gw(sz, Buffer.alloc(4));
    const r = E.call(LR, [pbuf, sz]); const len = E.rd32(sz);
    if (E.halted()) { console.log('halted at', p); break; }
    if (r && len > 0) { const f = path.join(out, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, E.gr(r, len)); n++; bytes += len; index.push([p, len]); }
  }
  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index));
  console.log('files', n, 'bytes', bytes);
})();
