// 영웅서기5 자료 꺼내기용 에뮬레이터 래퍼 (hl5-core + guest_malloc)
const fs = require('fs');
async function boot(soPath, vfsPath, wasmPath) {
  const so = fs.readFileSync(soPath), vfs = new Uint8Array(fs.readFileSync(vfsPath));
  let mem; const logs = [];
  const env = {
    host_log: (p, n) => { logs.push(Buffer.from(new Uint8Array(mem.buffer, p, n)).toString('latin1')); if (logs.length > 400) logs.shift(); },
    host_now: () => Date.now(), host_pow: Math.pow,
    host_vfs_read: (off, dst, len) => { const src = vfs.subarray(off, off + len); new Uint8Array(mem.buffer, dst, src.length).set(src); return src.length; },
    host_audio: () => 0, host_file_saved: () => {}, host_file_deleted: () => {},
    host_event: (kind) => (kind === 4 ? 1 : 0),
  };
  const { instance } = await WebAssembly.instantiate(fs.readFileSync(wasmPath), { env });
  const ex = instance.exports; mem = ex.memory;
  const p = ex.host_alloc(so.length); new Uint8Array(mem.buffer, p, so.length).set(so);
  if (ex.load_library(p, so.length) !== 0) throw new Error('load_library');
  ex.set_native_hooks(1); ex.set_vfs_size(vfs.length);
  const cstr = s => { const b = Buffer.from(s + '\0', 'latin1'); const q = ex.host_alloc(b.length); new Uint8Array(mem.buffer, q, b.length).set(b); return q; };
  const r = ex.app_start(800, 480, 400, 240, 2.0, 1);
  const G = () => ex.guest_base();
  const gw = (a, bytes) => new Uint8Array(mem.buffer, G() + (a & 0x3ffffff), bytes.length).set(bytes);
  const gr = (a, n) => Buffer.from(new Uint8Array(mem.buffer, G() + (a & 0x3ffffff), n));
  const rd32 = a => new DataView(mem.buffer).getInt32(G() + (a & 0x3ffffff), true);
  const sym = name => ex.find_symbol(cstr(name));
  const gstr = s => { const b = Buffer.from(s + '\0', 'latin1'); const a = ex.guest_malloc(b.length); gw(a, b); return a; };
  const call = (addr, args) => { const ap = ex.host_alloc(4 * Math.max(1, args.length)); const v = new Uint32Array(mem.buffer, ap, args.length); args.forEach((x, i) => v[i] = x >>> 0); const res = ex.guest_call(addr, args.length, ap); ex.host_free(ap); return res >>> 0; };
  return { ex, mem, logs, start: r, gw, gr, rd32, sym, gstr, call, cstr, halted: () => ex.is_halted() };
}
module.exports = { boot };
