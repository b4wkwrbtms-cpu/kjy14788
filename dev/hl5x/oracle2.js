// 게임의 SPRITE::DrawSprite로 프레임을 그려 PPM으로 저장 (정답지)
// node oracle2.js so vfs wasm out.ppm cif flag "bank0,bank1,.." "motion:dir:frame,..."  [pal0,pal1..]
const fs = require('fs');
const { boot } = require('./x5lib.js');
(async () => {
  const [so, vfs, wasm, out, cif, flagS, banksS, framesS, palsS] = process.argv.slice(2);
  const E = await boot(so, vfs, wasm);
  for (let i = 0; i < 20; i++) E.ex.app_loop();
  const g = E.rd32(0x100000 + 0x16fcc8) >>> 0;
  const fb = E.call(E.sym('MC_grpGetScreenFrameBuffer'), [0]);
  const fbi = E.ex.guest_malloc(64); E.gw(fbi, Buffer.alloc(64));
  E.call(E.sym('_ZN15FrameBufferInfoC1Ei'), [fbi, fb]);
  const ptr = E.call(E.sym('_ZN15FrameBufferInfo14GetFrameBufPtrEv'), [fbi]), W = 400, H = 240, bpl = 800;
  const GOT = 0x100000 + 0xdb544 + 0x8894c;
  const pathTab = E.rd32(GOT + 0x3b4) >>> 0, palTab = E.rd32(GOT + 0x248) >>> 0;
  const zalloc = n => { const a = E.ex.guest_malloc(n); E.gw(a, Buffer.alloc(n)); return a; };
  const sd = zalloc(256), si = zalloc(256), spr = zalloc(512);
  E.call(E.sym('_ZN11SPRITE_DATAC1Ev'), [sd]); E.call(E.sym('_ZN12SPRITE_IMAGEC1Ev'), [si]);
  E.call(E.sym('_ZN11SPRITE_DATA11LoadSprFileEPch'), [sd, E.gstr(cif), +flagS]);
  const banks = banksS.split(','), pals = (palsS || '').split(',');
  banks.forEach((p, k) => { const b = Buffer.alloc(256); b.write(p, 'latin1'); E.gw(pathTab + k * 256, b); const pb = Buffer.alloc(2); pb.writeInt16LE(pals[k] !== undefined && pals[k] !== '' ? +pals[k] : -1); E.gw(palTab + k * 2, pb); });
  E.call(E.sym('_ZN12SPRITE_IMAGE10LoadSprImgEP11SPRITE_DATA'), [si, sd]);
  { const cp = E.rd32(si + 0x34) >>> 0; const cnts = []; for (let k = 0; k < banks.length; k++) cnts.push(E.rd32(cp + k * 4)); console.log('pathTab', pathTab.toString(16), 'palTab', palTab.toString(16), 'counts', cnts, 'sd n', E.rd32(sd), 'logs', E.logs.slice(-3)); }
  if (E.halted()) { console.log('halted after LoadSprImg', E.logs.slice(-5)); return; }
  E.call(E.sym('_ZN6SPRITE12SetSpritePtrEP11SPRITE_DATAP12SPRITE_IMAGEP9ExtraData'), [spr, sd, si, 0]);
  const DS = E.sym('_ZN6SPRITE10DrawSpriteEiiiaash');
  const frames = framesS.split(',').map(s => s.split(':').map(Number));
  const CW = 100, CH = 100, cols = Math.min(frames.length, 10), rows = Math.ceil(frames.length / cols);
  const img = Buffer.alloc(cols * CW * rows * CH * 3);
  frames.forEach(([m, d, f], i) => {
    const bg = Buffer.alloc(bpl * H); for (let k = 0; k < bg.length; k += 2) bg.writeUInt16LE(0x2945, k);   // 어두운 회색 바탕
    E.gw(ptr, bg);
    E.call(DS, [spr, fb, 200, 120, m, d, f, 0]);
    const px = E.gr(ptr, bpl * H), cx = (i % cols) * CW, cy = Math.floor(i / cols) * CH;
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const v = px.readUInt16LE((120 - 50 + y) * bpl + (200 - 50 + x) * 2), o = ((cy + y) * cols * CW + cx + x) * 3; img[o] = ((v >> 11) & 31) * 255 / 31; img[o + 1] = ((v >> 5) & 63) * 255 / 63; img[o + 2] = (v & 31) * 255 / 31; }
  });
  fs.writeFileSync(out, Buffer.concat([Buffer.from(`P6\n${cols * CW} ${rows * CH}\n255\n`), img]));
  console.log('ok', frames.length, 'halted', E.halted());
})();
