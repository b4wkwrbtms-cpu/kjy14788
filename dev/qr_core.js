/* ---------- QR 코드 (초대 링크용): 바이트 모드 · 오류 정정 M · 1~10버전 · 마스크 8개 중 벌점 가장 낮은 것 ----------
   QR 표준(ISO/IEC 18004) 순서 그대로: 데이터 비트 → 블록마다 리드-솔로몬 → 섞어 담기 → 기능 무늬 → 지그재그 배치 → 마스크 → 형식 정보 */
var QR_ECC_M = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
var QR_BLK_M = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
function qrRawCw(v) { let r = (16 * v + 128) * v + 64; if (v >= 2) { const na = Math.floor(v / 7) + 2; r -= (25 * na - 10) * na - 55; if (v >= 7) r -= 36; } return r >> 3; }
function qrMul(x, y) { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; } return z & 255; }
function qrDivisor(deg) { const r = new Array(deg).fill(0); r[deg - 1] = 1; let root = 1; for (let i = 0; i < deg; i++) { for (let j = 0; j < deg; j++) { r[j] = qrMul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; } root = qrMul(root, 2); } return r; }
function qrRem(data, div) { const r = new Array(div.length).fill(0); data.forEach(b => { const f = b ^ r.shift(); r.push(0); div.forEach((d, i) => { r[i] ^= qrMul(d, f); }); }); return r; }
function qrUtf8(s) { const o = []; for (const ch of String(s)) { let c = ch.codePointAt(0); if (c < 0x80) o.push(c); else if (c < 0x800) o.push(0xc0 | c >> 6, 0x80 | c & 63); else if (c < 0x10000) o.push(0xe0 | c >> 12, 0x80 | c >> 6 & 63, 0x80 | c & 63); else o.push(0xf0 | c >> 18, 0x80 | c >> 12 & 63, 0x80 | c >> 6 & 63, 0x80 | c & 63); } return o; }
function qrAlign(v) { if (v === 1) return []; const na = Math.floor(v / 7) + 2, step = Math.floor((v * 8 + na * 3 + 5) / (na * 4 - 4)) * 2, o = [6]; for (let p = v * 4 + 10, i = na - 1; i >= 1; i--, p -= step) o.splice(1, 0, p); return o; }
function qrMatrix(text, minV, fm) {
  const bytes = qrUtf8(text);
  let v = Math.max(1, minV || 1), dcw = 0;
  for (; v <= 10; v++) { dcw = qrRawCw(v) - QR_ECC_M[v] * QR_BLK_M[v]; if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= dcw * 8) break; }
  if (v > 10) return null;
  // 1) 데이터 비트: 모드(0100) · 글자 수 · 바이트 · 끝 표시 · 0으로 바이트 맞춤 · 채움(EC 11)
  const bits = [], put = (x, n) => { for (let i = n - 1; i >= 0; i--) bits.push((x >>> i) & 1); };
  put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
  const cap = dcw * 8; put(0, Math.min(4, cap - bits.length)); put(0, (8 - bits.length % 8) % 8);
  for (let p = 0xec; bits.length < cap; p ^= 0xec ^ 0x11) put(p, 8);
  const cw = []; for (let i = 0; i < bits.length; i += 8) { let x = 0; for (let j = 0; j < 8; j++) x = (x << 1) | bits[i + j]; cw.push(x); }
  // 2) 블록마다 오류 정정 코드 → 번갈아 섞기 (짧은 블록 먼저)
  const raw = qrRawCw(v), nb = QR_BLK_M[v], ecl = QR_ECC_M[v], nShort = nb - raw % nb, sLen = Math.floor(raw / nb), div = qrDivisor(ecl), blocks = [];
  for (let i = 0, k = 0; i < nb; i++) { const dl = sLen - ecl + (i < nShort ? 0 : 1), dat = cw.slice(k, k + dl); k += dl; const blk = dat.concat(i < nShort ? [0] : []).concat(qrRem(dat, div)); blocks.push(blk); }
  const all = []; for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== sLen - ecl || j >= nShort) all.push(b[i]); });
  // 3) 기능 무늬: 타이밍 · 찾기 무늬 3개 · 정렬 무늬 · (형식 자리) · 버전 정보
  const N = v * 4 + 17, M = [], F = [];
  for (let y = 0; y < N; y++) { M.push(new Array(N).fill(false)); F.push(new Array(N).fill(false)); }
  const fn = (x, y, d) => { M[y][x] = d; F[y][x] = true; };
  for (let i = 0; i < N; i++) { fn(6, i, i % 2 === 0); fn(i, 6, i % 2 === 0); }
  [[3, 3], [N - 4, 3], [3, N - 4]].forEach(([cx, cy]) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy)); if (x >= 0 && y >= 0 && x < N && y < N) fn(x, y, d !== 2 && d !== 4); } });
  const al = qrAlign(v), na = al.length;
  for (let i = 0; i < na; i++) for (let j = 0; j < na; j++) { if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) fn(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }
  const fmt = mask => {
    const data = (0 << 3) | mask; let r = data; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((data << 10) | r) ^ 0x5412, bit = i => ((b >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i++) fn(8, i, bit(i));
    fn(8, 7, bit(6)); fn(8, 8, bit(7)); fn(7, 8, bit(8));
    for (let i = 9; i < 15; i++) fn(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) fn(N - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) fn(8, N - 15 + i, bit(i));
    fn(8, N - 8, true);
  };
  fmt(0);
  if (v >= 7) { let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25); const b = (v << 12) | r; for (let i = 0; i < 18; i++) { const d = ((b >>> i) & 1) !== 0, a = N - 11 + i % 3, c = Math.floor(i / 3); fn(a, c, d); fn(c, a, d); } }
  // 4) 지그재그로 데이터 담기 (오른쪽 아래에서 두 칸씩 위아래로)
  let bi = 0;
  for (let right = N - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < N; vert++) for (let j = 0; j < 2; j++) {
      const x = right - j, up = ((right + 1) & 2) === 0, y = up ? N - 1 - vert : vert;
      if (!F[y][x] && bi < all.length * 8) { M[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0; bi++; }
    }
  }
  // 5) 마스크 8개 중 벌점이 가장 낮은 것
  const inv = (m, x, y) => m === 0 ? (x + y) % 2 === 0 : m === 1 ? y % 2 === 0 : m === 2 ? x % 3 === 0 : m === 3 ? (x + y) % 3 === 0 : m === 4 ? (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0 : m === 5 ? (x * y) % 2 + (x * y) % 3 === 0 : m === 6 ? ((x * y) % 2 + (x * y) % 3) % 2 === 0 : ((x + y) % 2 + (x * y) % 3) % 2 === 0;
  const apply = m => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!F[y][x] && inv(m, x, y)) M[y][x] = !M[y][x]; };
  const pen = () => {
    let p = 0;
    const line = get => {
      let run = 0, col = false, h = [0, 0, 0, 0, 0, 0, 0], q = 0;
      const add = len => { if (h[0] === 0) len += N; h.pop(); h.unshift(len); };
      const cnt = () => { const n = h[1], core = n > 0 && h[2] === n && h[3] === n * 3 && h[4] === n && h[5] === n; return (core && h[0] >= n * 4 && h[6] >= n ? 1 : 0) + (core && h[6] >= n * 4 && h[0] >= n ? 1 : 0); };
      for (let i = 0; i < N; i++) {
        if (get(i) === col) { run++; if (run === 5) q += 3; else if (run > 5) q++; }
        else { add(run); if (!col) q += cnt() * 40; col = get(i); run = 1; }
      }
      if (col) { add(run); run = 0; } run += N; add(run); q += cnt() * 40;
      return q;
    };
    for (let y = 0; y < N; y++) p += line(i => M[y][i]);
    for (let x = 0; x < N; x++) p += line(i => M[i][x]);
    let dark = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (M[y][x]) dark++; if (x < N - 1 && y < N - 1) { const c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) p += 3; } }
    const tot = N * N; p += (Math.ceil(Math.abs(dark * 20 - tot * 10) / tot) - 1) * 10;
    return p;
  };
  let best = 0, bestP = Infinity;
  for (let m = 0; m < 8; m++) { apply(m); fmt(m); const p = pen(); if (p < bestP) { bestP = p; best = m; } apply(m); }
  if (fm >= 0 && fm < 8) best = fm;
  apply(best); fmt(best);
  return M;
}
