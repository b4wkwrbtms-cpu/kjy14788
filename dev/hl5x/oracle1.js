// 게임의 Graphic::DrawEffect를 직접 불러 회전·배율의 기준점을 잰다
const fs = require('fs');
const { boot } = require('./x5lib.js');
(async () => {
  const [so, vfs, wasm, mgrPath, idxS] = process.argv.slice(2);
  const E = await boot(so, vfs, wasm);
  for (let i = 0; i < 20; i++) E.ex.app_loop();
  const g = E.rd32(0x100000 + 0x16fcc8) >>> 0;
  const fb = E.call(E.sym('MC_grpGetScreenFrameBuffer'), [0]);
  const fbi = E.ex.guest_malloc(64); E.gw(fbi, Buffer.alloc(64));
  E.call(E.sym('_ZN15FrameBufferInfoC1Ei'), [fbi, fb]);
  const ptr = E.call(E.sym('_ZN15FrameBufferInfo14GetFrameBufPtrEv'), [fbi]), W = E.call(E.sym('_ZN15FrameBufferInfo8GetWidthEv'), [fbi]), H = E.call(E.sym('_ZN15FrameBufferInfo9GetHeightEv'), [fbi]), bpl = E.call(E.sym('_ZN15FrameBufferInfo6GetBplEv'), [fbi]);
  console.log('graphic', g.toString(16), 'fb', fb.toString(16), 'ptr', ptr.toString(16), W, H, bpl);
  // mgr 기록 하나를 게스트 메모리에
  const b = fs.readFileSync(mgrPath); let o = 4, rec = null; const n = b.readUInt32LE(0), want = +idxS;
  for (let i = 0; i < n; i++) { const sz = b.readUInt32LE(o); if (i === want) rec = b.subarray(o + 4, o + 4 + sz); o += 4 + sz; }
  const w = rec.readUInt16LE(2), h = rec.readUInt16LE(4); console.log('img', w, h);
  const ra = E.ex.guest_malloc(rec.length + 16); E.gw(ra, rec);
  const img = E.ex.guest_malloc(64); E.gw(img, Buffer.alloc(64));
  E.call(E.sym('_ZN7Graphic14LoadImageResIDEP8GbmImagej'), [g, img, ra]);
  const DE = E.sym('_ZN7Graphic10DrawEffectEiiiP8GbmImagehiiihhi');
  const clear = () => E.gw(ptr, Buffer.alloc(bpl * H));
  const bbox = () => { const d = E.gr(ptr, bpl * H); let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, cnt = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (d.readUInt16LE(y * bpl + x * 2)) { cnt++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } } return cnt ? [x0, y0, x1 - x0 + 1, y1 - y0 + 1, cnt] : null; };
  const X = 200, Y = 120;
  for (const [flip, rot, sx, sy, bl, al] of [[16, 0, 100, 100, 0, 255], [16, 0, 100, 100, 7, 255], [16, 90, 100, 100, 0, 255], [16, 180, 100, 100, 0, 255], [16, 270, 100, 100, 0, 255], [16, 30, 100, 100, 0, 255], [16, 0, 200, 100, 0, 255], [16, 0, 100, 200, 0, 255], [16, 0, 60, 140, 0, 255], [16, 90, 200, 100, 0, 255], [8, 0, 100, 100, 0, 255], [16, 0, 100, 100, 0, 128], [16, 45, 150, 150, 4, 255]]) {
    clear(); E.call(DE, [g, fb, X, Y, img, flip, rot, sx, sy, bl, al, 18]);
    const bb = bbox(); console.log(`flip ${flip} rot ${rot} sx ${sx} sy ${sy} blend ${bl} a ${al} →`, bb ? `dx ${bb[0] - X} dy ${bb[1] - Y} w ${bb[2]} h ${bb[3]} px ${bb[4]}` : 'nothing', E.halted() ? 'HALT' : '');
  }
})();
