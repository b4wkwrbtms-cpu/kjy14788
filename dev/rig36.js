/* ---------- v36 몸 리그: 머리 · 몸통 · 허리 · 두 다리를 도트 칸 단위로 다시 짜 맞춤 ----------
   기본 그림 18×24 칸: 머리 0~11줄 · 몸통 12~18 · 허리띠 19 · 다리 20~22 · 신발 23 / 뒷다리 5~7칸 · 앞다리 10~12칸.
   회전 대신 줄 밀기(시어)와 통째 옮기기만 써서 도트가 깨지지 않게 함 (얼굴·안경 줄은 그대로).
   q = 정수 자세(칸)
     bx 골반을 앞으로 · hip 골반 내림(무릎이 굽음) · lean 어깨가 골반보다 앞(몸통 줄마다 비례로 밀어 숙임) · tq 몸통 접기 0~3줄(더 숙임: 15 → 14 → 16줄 순서로 뺌)
     hx 머리를 어깨보다 더 앞 · hy 머리 내림(목 움츠림) · fF 앞발 · fB 뒷발(− = 뒤로 뺌) · kF·kB 무릎을 다리와 직각으로 내미는 칸(+ = 앞·아래, − = 뒤·위, 0 = 곧은 다리)
     hl 뒷발 뒤꿈치 들기 0~2줄 (발끝으로 땅을 밀어냄 — 다리를 찢지 않고도 역동적으로)
   장비: 몸통·머리에 붙은 것은 같이 움직이고, 발밑 왼쪽(19~23줄 0~3칸, 가방·도장 같은 소품)은 땅에 그대로 둠 */
var RIG_PADX = 9;                                              // 좌우 여백 칸 — 뒷발을 뒤로 빼고 머리를 앞으로 내밀 자리
var RIG_LEG = { B: { c: 6, s0: 4, s1: 8 }, F: { c: 11, s0: 9, s1: 15 } };   // 다리 가운데 칸 · 신발 줄 범위
var RIG_LEGLEN = 3;                                            // 다리 길이(칸, 20~22줄)
var RIG_HAIR = { h: 1, e: 1 };
var rigBodyCache;
function rigQ(P) {
  return { bx: Math.round(P.bx || 0), hip: Math.max(0, Math.round(P.hip || 0)), lean: Math.round(P.lean || 0), tq: Math.max(0, Math.min(3, Math.round(P.tq || 0))),
    hx: Math.round(P.hx || 0), hy: P.hy > 0.5 ? 1 : 0, fF: Math.round(P.fF || 0), fB: Math.round(P.fB || 0), kF: Math.round(P.kF || 0), kB: Math.round(P.kB || 0), hl: Math.max(0, Math.min(2, Math.round(P.hl || 0))) };
}
function rigBody(look, q) {
  rigBodyCache = rigBodyCache || new WeakMap();
  let byKey = rigBodyCache.get(look.map); if (!byKey) { byKey = new Map(); rigBodyCache.set(look.map, byKey); }
  const key = q.bx + "|" + q.hip + "|" + q.lean + "|" + q.tq + "|" + q.hx + "|" + q.hy + "|" + q.fF + "|" + q.fB + "|" + q.kF + "|" + q.kB + "|" + q.hl;
  const hit = byKey.get(key); if (hit) return hit;
  const top = look.top || 0, src = look.map, P = RIG_PADX, W = 18 + 2 * P, H = top + 24;
  const at = (r, c) => { const row = src[top + r]; return row && c >= 0 && c < row.length ? row[c] : "."; };
  // 앞팔은 따로 그림(rigArm) → 14줄 14칸, 15줄 13~16칸(13칸은 몸통 색으로 메움), 16줄 14~16칸을 지움
  const sleeve = at(15, 14) !== "." ? at(15, 14) : "a", cuff = at(16, 14) !== "." ? at(16, 14) : sleeve, skin = at(15, 15) !== "." ? at(15, 15) : "s";
  const fill13 = at(15, 12) !== "." ? at(15, 12) : "j";
  const S = (r, c) => {
    if (r === 14 && c === 14) return ".";
    if (r === 15) { if (c === 13) return fill13; if (c >= 14 && c <= 16) return "."; }
    if (r === 16 && c >= 14 && c <= 16) return ".";
    return at(r, c);
  };
  const g = []; for (let i = 0; i < H; i++) g.push(new Array(W).fill("."));
  const put = (r, c, ch) => { if (ch === "." || ch == null) return; const i = r + top, j = c + P; if (i >= 0 && i < H && j >= 0 && j < W) g[i][j] = ch; };
  const FOLD = [15, 14, 16].slice(0, q.tq), FL = FOLD.length, tH = 7 - FL;   // 몸통 접기: 뺄 줄과 남는 몸통 높이(허리띠 위)
  const below = r => FOLD.filter(x => x > r).length;                           // r보다 아래에서 빠진 줄 수 → 그만큼 내려 그림
  const ts = y => q.bx + Math.round(q.lean * Math.max(0, Math.min(1, (19 + q.hip - y) / tH)));   // 그려지는 줄 y의 밀림 (허리띠 = bx, 어깨 = bx + lean)
  const headDY = q.hip + FL + q.hy, headDX = q.bx + q.lean + q.hx;
  const isHair = (r, c, ch) => r <= 13 && c <= 6 && RIG_HAIR[ch];
  // 1) 땅에 둔 소품 (19~23줄, 0~3칸)
  for (let r = 19; r <= 23; r++) for (let c = 0; c <= 3; c++) put(r, c, S(r, c));
  // 2) 다리: 엉덩이 관절 → (무릎) → 발목. 칸마다 다리 길이 방향 t·폭 방향 u를 구해 원래 다리 줄·칸에서 색을 가져옴
  const leg = (L, f, kp, hl) => {
    const jx = L.c + 0.5 + q.bx, jy = 20 + q.hip, ax = L.c + 0.5 + f, ay = 23 - hl;           // 뒤꿈치를 들면 발목도 그만큼 올라감
    const dx = ax - jx, dy = ay - jy, d = Math.hypot(dx, dy) || 1;
    let kx = (jx + ax) / 2, ky = (jy + ay) / 2;
    if (kp) { kx += dy / d * kp; ky += -dx / d * kp; }                     // 무릎을 다리와 직각, 앞쪽으로
    const segs = [[jx, jy, kx, ky], [kx, ky, ax, ay]].map(([x0, y0, x1, y1]) => { const l = Math.hypot(x1 - x0, y1 - y0) || 1e-6; return { x0, y0, ex: (x1 - x0) / l, ey: (y1 - y0) / l, l }; });
    const tot = segs[0].l + segs[1].l;
    const c0 = Math.floor(Math.min(jx, kx, ax) - 2), c1 = Math.ceil(Math.max(jx, kx, ax) + 2), r0 = Math.floor(Math.min(jy, ky) - 1);
    for (let r = r0; r <= 22; r++) for (let c = c0; c <= c1; c++) {
      const px = c + 0.5, py = r + 0.5;
      let best = null;
      segs.forEach((s, i) => {
        const wx = px - s.x0, wy = py - s.y0, al = wx * s.ex + wy * s.ey, pe = wx * s.ey - wy * s.ex;
        const ac = Math.max(0, Math.min(s.l, al)), dd = Math.hypot(wx - s.ex * ac, wy - s.ey * ac);
        if (!best || dd < best.dd - 1e-9) best = { dd, t: ((i ? segs[0].l : 0) + al) / tot, u: pe };
      });
      if (best.dd >= 1.5 || best.t < -0.05) continue;
      const sr = 20 + Math.max(0, Math.min(2, Math.floor(best.t * 3))), sc = L.c + Math.max(-1, Math.min(1, Math.round(best.u)));
      const ch = S(sr, sc); put(r, c, ch !== "." ? ch : "p");
    }
    let heel = -1, toe = -1; for (let c = L.s0; c <= L.s1; c++) if (S(23, c) !== "." && c > 3) { if (heel < 0) heel = c; toe = c; }
    for (let c = L.s0; c <= L.s1; c++) {                                                        // 신발은 발목을 따라감. 뒤꿈치를 들면 앞꿈치만 땅에 (발끝 → 뒤꿈치로 비스듬히)
      const ch = S(23, c); if (ch === "." || c <= 3) continue;
      const up = hl ? Math.round(hl * (toe - c) / Math.max(1, toe - heel)) : 0;
      put(23 - up, c + f, ch);
    }
    return { kx, ky };
  };
  const kb = leg(RIG_LEG.B, q.fB, q.kB, q.hl), kf = leg(RIG_LEG.F, q.fF, q.kF, 0);
  // 3) 몸통 (12~18줄, 줄마다 밀어 숙임) · 허리띠 (19줄) · 허리 아래 옷자락(20~22줄, 다리 칸이 아닌 것)
  for (let r = 12; r <= 18; r++) { if (FOLD.indexOf(r) >= 0) continue; const y = r + q.hip + below(r), dx = ts(y); for (let c = 0; c < 18; c++) { const ch = S(r, c); if (ch !== "." && !isHair(r, c, ch)) put(y, c + dx, ch); } }
  for (let c = 4; c < 18; c++) put(19 + q.hip, c + q.bx, S(19, c));
  for (let r = 20; r <= 22; r++) for (let c = 4; c < 18; c++) { if (Math.abs(c - RIG_LEG.B.c) <= 1 || Math.abs(c - RIG_LEG.F.c) <= 1) continue; put(r + q.hip, c + q.bx, S(r, c)); }
  // 4) 머리 (11줄까지 + 모자 줄 + 긴 머리카락) — 통째로 옮김
  for (let r = -top; r <= 13; r++) for (let c = 0; c < 18; c++) { const ch = S(r, c); if (ch === ".") continue; if (r <= 11 || isHair(r, c, ch)) put(r + headDY, c + headDX, ch); }
  const R = { map: g.map(row => row.join("")), top, P, sx: P + 13.3 + q.bx + q.lean * (6.2 - FL) / tH, sy: top + 12.8 + q.hip + FL, sleeve, cuff, skin, q, knB: kb, knF: kf };
  if (byKey.size > 160) byKey.clear();
  byKey.set(key, R); return R;
}
/* ---------- 앞팔: 어깨 → 팔꿈치 → 손을 도트 칸으로 (각도는 10도 단위로 모아 지도를 다시 씀) ---------- */
var RIG_L1 = 2.8, RIG_L2 = 2.3;
var rigArmCache = new Map();
function rigArm(R, pose) {
  const qa = v => Math.round(v / 0.1745) * 0.1745, sh = qa(pose.sh), fa = qa(pose.fa);
  const Sx = R.sx, Sy = R.sy;
  const Ex = Sx + RIG_L1 * Math.sin(sh), Ey = Sy - RIG_L1 * Math.cos(sh), Hx = Ex + RIG_L2 * Math.sin(fa), Hy = Ey - RIG_L2 * Math.cos(fa);
  const key = [sh.toFixed(2), fa.toFixed(2), Sx.toFixed(1), Sy.toFixed(1)].join("|");
  let A = rigArmCache.get(key);
  if (!A) {
    const seg = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy || 1, k = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / L)), dx = ax + vx * k - px, dy = ay + vy * k - py; return [Math.hypot(dx, dy), k]; };
    const x0 = Math.floor(Math.min(Sx, Ex, Hx) - 2), y0 = Math.floor(Math.min(Sy, Ey, Hy) - 2), x1 = Math.ceil(Math.max(Sx, Ex, Hx) + 2), y1 = Math.ceil(Math.max(Sy, Ey, Hy) + 2);
    const rows = [];
    for (let y = y0; y < y1; y++) {
      let s = "";
      for (let x = x0; x < x1; x++) {
        const cx = x + 0.5, cy = y + 0.5, dh = Math.hypot(cx - Hx, cy - Hy), [d1] = seg(cx, cy, Sx, Sy, Ex, Ey), [d2, k2] = seg(cx, cy, Ex, Ey, Hx, Hy);
        s += dh <= 1.0 ? "S" : d2 <= 0.78 ? (k2 > 0.72 ? "X" : "A") : d1 <= 0.86 ? "A" : ".";
      }
      rows.push(s);
    }
    A = { map: rows, bx: x0, by: y0 };
    if (rigArmCache.size > 400) rigArmCache.clear();
    rigArmCache.set(key, A);
  }
  return { map: A.map, bx: A.bx, by: A.by, hx: Hx, hy: Hy, sx: Sx, sy: Sy };
}
