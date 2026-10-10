/* ===================== 전투 배경 2.0: 원경·중경·뒷벽·근경 4겹 + 대기 원근 =====================
   참고: 사용자가 보낸 숲·유적·동굴 도트 그림 — 먼 것은 옅고 흐리게(안개 색에 묻힘), 가까운 것은 진하고 또렷하게,
   덩굴·꽃·이끼 같은 작은 소품, 빛줄기, 바닥 안개, 화면 가장자리를 감싸는 어두운 근경.
   반 해상도(320x180)에 도트로 찍고 2배로 키움. 카메라가 다가가거나 흔들리면 먼 층은 덜, 가까운 층은 더 움직임. */
const BW = 320, BH = 180, BFL = 127, BGR = 152;
let bgSet = null, bgRec = { texts: [], stars: [] };
function bgLayer() { const c = document.createElement("canvas"); c.width = BW; c.height = BH; const g = c.getContext("2d"); if (g) g.imageSmoothingEnabled = false; return { c, g }; }
const BX = {
  F(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
  vg(g, x, y, w, h, stops) { const gr = g.createLinearGradient(0, y, 0, y + h); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(x, y, w, h); },
  disc(g, cx, cy, r, col) { g.fillStyle = col; const R0 = Math.max(0.5, r); for (let y = -Math.floor(R0); y <= Math.floor(R0); y++) { const w = Math.floor(Math.sqrt(R0 * R0 - y * y) + 0.35); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } },
  oval(g, cx, cy, rx, ry, col) { g.fillStyle = col; for (let y = -Math.floor(ry); y <= Math.floor(ry); y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) * (y / ry))) + 0.35); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } },
  haze(g, y0, y1, rgb, a0, a1) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(${rgb},${a0})`); gr.addColorStop(1, `rgba(${rgb},${a1})`); g.fillStyle = gr; g.fillRect(0, y0, BW, y1 - y0); },
  glow(g, x, y, r, rgb, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); },
  shaft(g, x0, w0, x1, w1, y0, y1, rgb, a) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w0, y0); g.lineTo(x1 + w1, y1); g.lineTo(x1, y1); g.closePath(); g.fill(); },
  /* 잎 덩어리: 아래·오른쪽 어둡게, 위·왼쪽 밝게 (3단 명암) */
  bush(g, x, y, w, h, tones, R, n) {
    const [dk, md, lt] = tones, k = n || Math.max(4, Math.round(w * h / 40)), pts = [];
    for (let i = 0; i < k; i++) { const a = R() * Math.PI, rr = Math.sqrt(R()); pts.push([x + Math.cos(a) * w / 2 * rr * 0.9, y - Math.sin(a) * h * rr * 0.75, 2 + R() * Math.min(w, h) * 0.32]); }
    pts.sort((p, q) => q[1] - p[1]);
    pts.forEach(([px, py, r]) => BX.disc(g, px + 1, py + 1, r, dk));
    pts.forEach(([px, py, r]) => BX.disc(g, px, py, r * 0.92, md));
    pts.forEach(([px, py, r]) => { if (r > 2.5) BX.disc(g, px - r * 0.3, py - r * 0.35, r * 0.42, lt); });
  },
  tree(g, x, base, h, trunk, tones, R, wide) {
    const tw = Math.max(2, Math.round(h * 0.08)); BX.F(g, x - tw / 2, base - h * 0.55, tw, h * 0.55, trunk);
    BX.F(g, x - tw / 2 - 1, base - 2, tw + 2, 2, trunk);
    BX.bush(g, x, base - h * 0.45, h * (wide || 0.8), h * 0.62, tones, R);
  },
  vine(g, x, y, len, stem, leaf, R) {
    let cx = x;
    for (let i = 0; i < len; i++) { cx += (R() < 0.25 ? (R() < 0.5 ? -1 : 1) : 0) * (i > 2 ? 1 : 0); BX.F(g, cx, y + i, 1, 1, stem); if (i % 3 === 1) BX.F(g, cx + (i % 6 === 1 ? 1 : -2), y + i, 2, 1, leaf); }
    BX.F(g, cx - 1, y + len, 2, 2, leaf);
  },
  flowers(g, x, y, w, h, cols, R, n) { for (let i = 0; i < (n || 6); i++) { const fx = x + R() * w, fy = y + R() * h, c = cols[Math.floor(R() * cols.length)]; BX.F(g, fx, fy, 2, 1, c); BX.F(g, fx + 0.5, fy - 1, 1, 3, c); } },
  skyline(g, base, minH, maxH, col, wins, R, wMin, wMax, litP) {
    let x = -4 + R() * 6;
    while (x < BW) {
      const bw = wMin + R() * (wMax - wMin), bh = minH + R() * (maxH - minH);
      BX.F(g, x, base - bh, bw, bh, col);
      if (R() < 0.3) BX.F(g, x + bw * 0.4, base - bh - 3 - R() * 4, 1, 4 + R() * 3, col);
      if (wins) for (let wy = base - bh + 2; wy < base - 2; wy += 3) for (let wx = x + 1; wx < x + bw - 1; wx += 2) if (R() < (litP || 0.18)) BX.F(g, wx, wy, 1, 1, wins[Math.floor(R() * wins.length)]);
      x += bw + R() * 2;
    }
  },
  ridge(g, base, top, amp, col, R, step) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, base); let y = top;
    for (let x = 0; x <= BW + step; x += step) { y = Math.max(top - amp, Math.min(top + amp, y + (R() - 0.5) * amp)); g.lineTo(x, y); }
    g.lineTo(BW, base); g.closePath(); g.fill();
  },
  cloud(g, x, y, s, lt, md, dk) {
    const parts = [[0, 0, 1], [-0.9, 0.25, 0.7], [0.9, 0.25, 0.75], [-0.4, -0.35, 0.72], [0.45, -0.3, 0.62]];
    if (dk) parts.forEach(([a, b, r]) => BX.disc(g, x + a * s + 1, y + b * s * 0.8 + 2, r * s * 0.6, dk));
    parts.forEach(([a, b, r]) => BX.disc(g, x + a * s, y + b * s * 0.8, r * s * 0.6, md));
    parts.forEach(([a, b, r]) => BX.disc(g, x + a * s - r * s * 0.15, y + b * s * 0.8 - r * s * 0.18, r * s * 0.36, lt));
  },
  stars(g, n, yMax, R, cols) { for (let i = 0; i < n; i++) { const x = Math.round(R() * BW), y = Math.round(R() * yMax); BX.F(g, x, y, 1, 1, cols ? cols[i % cols.length] : (R() < 0.3 ? "#ffffff" : "#c8d6ff")); bgRec.stars.push([x, y]); } },
  bricks(g, x, y, w, h, base, line, hi, R, bw, bh) {
    BX.F(g, x, y, w, h, base);
    for (let yy = 0, row = 0; yy < h; yy += bh, row++) {
      BX.F(g, x, y + yy, w, 1, line);
      for (let xx = (row % 2 ? bw / 2 : 0); xx < w; xx += bw) { BX.F(g, x + xx, y + yy, 1, bh, line); if (hi && R() < 0.5) BX.F(g, x + xx + 1, y + yy + 1, bw - 2, 1, hi); }
    }
  },
  moss(g, x, y, w, col, lt, R) { for (let i = 0; i < w; i++) { const d = R() < 0.3 ? 2 + Math.floor(R() * 3) : 1; BX.F(g, x + i, y, 1, d, col); if (R() < 0.3) BX.F(g, x + i, y - 1, 1, 1, lt); } },
  /* 원근 바닥: 소실점으로 모이는 줄 + 가까울수록 넓어지는 가로줄 */
  floor(g, y0, c1, c2, line, vx, R, tiles) {
    BX.vg(g, 0, y0, BW, BH - y0, [[0, c1], [1, c2]]);
    g.strokeStyle = line; g.lineWidth = 1;
    for (let k = -14; k <= 14; k++) { g.beginPath(); g.moveTo(vx + k * 9, y0); g.lineTo(vx + k * 36, BH); g.stroke(); }
    let yy = y0, d = 3; while (yy < BH) { BX.F(g, 0, Math.round(yy), BW, 1, line); yy += d; d *= tiles || 1.32; }
  },
  pot(g, x, y, s, potCol, tones, R) {
    BX.F(g, x - 3 * s, y - 5 * s, 6 * s, 5 * s, potCol); BX.F(g, x - 3.5 * s, y - 5.5 * s, 7 * s, 1.2 * s, shade(potCol, 0.25));
    BX.F(g, x - 3 * s, y - 1.2 * s, 6 * s, 1.2 * s, shade(potCol, -0.3));
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55, L = (6 + R() * 5) * s; BX.F(g, x - 0.5, y - 5 * s - L * 0.6, 1, L * 0.6, tones[0]); BX.oval(g, x + Math.cos(a) * L * 0.75, y - 5 * s + Math.sin(a) * L * 0.85, 2.4 * s, 1.5 * s, tones[i % 2 ? 1 : 2]); }
  },
  winFrame(g, x, y, w, h, frame, mullions, sill) {
    g.clearRect(x, y, w, h);
    BX.F(g, x - 2, y - 2, w + 4, 2, frame); BX.F(g, x - 2, y + h, w + 4, 3, sill || frame); BX.F(g, x - 2, y, 2, h, frame); BX.F(g, x + w, y, 2, h, frame);
    for (let i = 1; i < (mullions || 1); i++) BX.F(g, x + Math.round(w * i / mullions) - 1, y, 2, h, frame);
  },
  glass(g, x, y, w, h) { g.fillStyle = "rgba(200,220,255,.06)"; g.fillRect(x, y, w, h); g.fillStyle = "rgba(255,255,255,.08)"; for (let i = 0; i < 3; i++) { const sx = x + w * (0.15 + i * 0.3); g.beginPath(); g.moveTo(sx, y); g.lineTo(sx + 6, y); g.lineTo(sx - 4 + 6, y + h); g.lineTo(sx - 4, y + h); g.closePath(); g.fill(); } },
  /* 글자는 도트로 뭉개지지 않게 기록만 해 두고, 화면에 그릴 때 또렷하게 씀 */
  text(g, s, x, y, col, px) { bgRec.texts.push([s, x * 2, y * 2, col, (px || 8) * 2]); },
};
/* 구역별 그림: (L, R) → L.far / L.mid / L.back / L.fore 에 그림, 돌려주는 값은 움직이는 장식 설정 */
const BG2 = {
  lobby(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, 120, [[0, "#070b1c"], [0.6, "#14204a"], [1, "#2a3a6a"]]); BX.stars(far.g, 60, 70, R);
    BX.glow(far.g, 250, 30, 26, "200,215,255", 0.25); BX.disc(far.g, 250, 30, 7, "#e6ecff");
    BX.skyline(far.g, 118, 18, 60, "#26345e", ["#4a5a8a", "#6a78a8"], R, 8, 18, 0.25); BX.haze(far.g, 50, 120, "60,80,140", 0, 0.45);
    BX.skyline(mid.g, 120, 10, 44, "#141c38", ["#ffd54a", "#ffb36b", "#6fd3ff"], R, 10, 22, 0.2);
    const b = back.g;
    BX.vg(b, 0, 0, BW, BFL, [[0, "#232a46"], [1, "#2e3658"]]);
    [[60, 10, 110, 92], [190, 10, 110, 92]].forEach(([x, y, w, h]) => { BX.winFrame(b, x, y, w, h, "#11162a", 3, "#3a4266"); });
    for (const px of [52, 176, 304]) { BX.F(b, px, 0, 10, BFL, "#3a4266"); BX.F(b, px + 2, 0, 2, BFL, "#56608a"); BX.F(b, px + 8, 0, 2, BFL, "#262c46"); BX.F(b, px - 1, BFL - 6, 12, 6, "#262c46"); }
    BX.F(b, 0, 0, BW, 6, "#161b30"); for (let x = 70; x < BW; x += 60) { BX.F(b, x, 6, 8, 1, "#ffe8b0"); BX.glow(b, x + 4, 10, 18, "255,226,170", 0.18); }
    BX.floor(b, BFL, "#3c4466", "#2a3150", "rgba(15,20,40,.45)", 200, R);
    for (let i = 0; i < 6; i++) BX.F(b, 70 + i * 40 + R() * 10, BFL + 6 + R() * 30, 14, 1, "rgba(255,255,255,.1)");
    BX.shaft(b, 70, 40, 40, 70, 10, BFL + 30, "170,190,255", 0.07); BX.shaft(b, 200, 40, 180, 70, 10, BFL + 30, "170,190,255", 0.06);
    BX.F(b, 56, 104, 95, 22, "#5a4434"); BX.F(b, 56, 102, 95, 3, "#8a6a4e"); BX.F(b, 62, 109, 83, 12, "#3b2c22"); BX.glow(b, 103, 104, 40, "255,213,74", 0.08);
    BX.pot(b, 168, 126, 1.4, "#6b4a2e", ["#1f5a32", "#3a8a4a", "#5fbf6a"], R); BX.pot(b, 296, 126, 1.6, "#6b4a2e", ["#1f5a32", "#3a8a4a", "#5fbf6a"], R);
    BX.vine(b, 120, 6, 18, "#1f5a32", "#4fb35a", R); BX.vine(b, 128, 6, 12, "#1f5a32", "#4fb35a", R); BX.vine(b, 258, 6, 22, "#1f5a32", "#4fb35a", R);
    BX.F(fore.g, 50, 150, 10, 30, "#0b0e18"); BX.F(fore.g, 47, 146, 16, 5, "#c9a43a"); BX.F(fore.g, 54, 150, 3, 30, "#7a5a1a");
    BX.bush(fore.g, 318, 182, 40, 40, ["#071a10", "#0d2a18", "#16402a"], R, 10);
    BX.text(b, "야근상사 본사 타워", 103, 115, "#ffd54a", 7.5);
    return { dust: "255,226,170", floorGlow: "255,226,170" };
  },
  office(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, 80, [[0, "#080c20"], [1, "#1e2a58"]]); BX.stars(far.g, 40, 40, R);
    BX.skyline(far.g, 76, 14, 40, "#24305a", ["#5a6a9a"], R, 8, 16, 0.3); BX.haze(far.g, 30, 80, "50,70,130", 0, 0.5);
    BX.skyline(mid.g, 78, 8, 30, "#121a36", ["#ffd54a", "#6fd3ff"], R, 9, 20, 0.22);
    const b = back.g;
    BX.vg(b, 0, 0, BW, BFL, [[0, "#1e2540"], [1, "#2a3354"]]);
    BX.winFrame(b, 54, 8, 262, 58, "#10152a", 6, "#2a3150"); BX.glass(b, 54, 8, 262, 58);
    BX.F(b, 0, 0, BW, 5, "#141a30"); for (let x = 64; x < BW; x += 52) { BX.F(b, x, 5, 26, 2, "#dfe8ff"); BX.shaft(b, x, 26, x - 10, 46, 7, 70, "220,232,255", 0.05); }
    for (let x = 48; x < BW; x += 46) { BX.F(b, x + 2, 76, 36, 3, "#4a3a2c"); BX.F(b, x + 13, 66, 14, 10, "#14182a"); BX.F(b, x + 14, 67, 12, 7, R() < 0.5 ? "#3b7bd6" : "#2a9ad6"); BX.glow(b, x + 20, 70, 12, "111,211,255", 0.12); BX.F(b, x, 79, 40, 14, "#2c3550"); BX.F(b, x, 79, 40, 1, "#3f4a70"); }
    for (let x = 30; x < BW; x += 62) { BX.F(b, x, 92, 54, 4, "#6b5642"); BX.F(b, x + 3, 96, 3, 26, "#4a3a2c"); BX.F(b, x + 48, 96, 3, 26, "#4a3a2c"); BX.F(b, x + 14, 78, 22, 14, "#151a2c"); BX.F(b, x + 15, 79, 20, 11, R() < 0.5 ? "#6fd3ff" : "#3b7bd6"); BX.F(b, x + 23, 92, 4, 1, "#151a2c"); BX.glow(b, x + 25, 84, 22, "111,211,255", 0.13); BX.F(b, x + 38, 88, 6, 4, "#e9edf6"); }
    BX.floor(b, BFL, "#2a3254", "#1e2440", "rgba(10,14,30,.4)", 190, R);
    BX.pot(b, 300, 126, 1.5, "#c9c2a8", ["#1f5a32", "#3a8a4a", "#6fd36a"], R); BX.vine(b, 220, 5, 14, "#1f5a32", "#4fb35a", R);
    BX.F(fore.g, 48, 146, 34, 34, "#0c0f1a"); BX.F(fore.g, 48, 146, 34, 3, "#1c2238"); BX.F(fore.g, 56, 132, 18, 14, "#0c0f1a"); BX.F(fore.g, 57, 133, 16, 10, "#1e4a7a"); BX.glow(fore.g, 65, 138, 14, "111,211,255", 0.25);
    return { dust: "200,220,255", floorGlow: "180,210,255" };
  },
  pantry(L, R) {
    const { far, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, 90, [[0, "#0a0f22"], [1, "#22305a"]]); BX.skyline(far.g, 88, 10, 36, "#1a2346", ["#ffd54a", "#ffb36b"], R, 8, 16, 0.25);
    const b = back.g;
    BX.F(b, 0, 0, BW, BFL, "#3a4a5e");
    for (let x = 0; x < BW; x += 8) for (let y = 40; y < 100; y += 8) BX.F(b, x, y, 7, 7, (x + y) % 16 ? "#46597a" : "#41536f");
    BX.winFrame(b, 150, 16, 40, 30, "#2a3348", 2, "#5b6684");
    for (let x = 52; x < 146; x += 31) { BX.F(b, x, 6, 29, 28, "#c9a26b"); BX.F(b, x, 6, 29, 2, "#e0c08a"); BX.F(b, x + 13, 18, 2, 6, "#7a5a32"); BX.F(b, x, 32, 29, 2, "#8a6a3e"); }
    for (let x = 196; x < 270; x += 31) { BX.F(b, x, 6, 29, 28, "#c9a26b"); BX.F(b, x, 6, 29, 2, "#e0c08a"); BX.F(b, x + 13, 18, 2, 6, "#7a5a32"); BX.F(b, x, 32, 29, 2, "#8a6a3e"); }
    BX.vine(b, 70, 34, 16, "#1f5a32", "#4fb35a", R); BX.vine(b, 230, 34, 20, "#1f5a32", "#4fb35a", R); BX.vine(b, 238, 34, 10, "#1f5a32", "#4fb35a", R);
    BX.F(b, 0, 98, BW, 28, "#8d97b6"); BX.F(b, 0, 96, BW, 3, "#cfd6ea"); BX.F(b, 0, 123, BW, 4, "#5b6684");
    BX.F(b, 80, 72, 26, 26, "#262a36"); BX.F(b, 84, 76, 18, 7, "#6fd3ff"); BX.F(b, 89, 86, 8, 9, "#5a3a1f"); BX.glow(b, 93, 80, 14, "111,211,255", 0.15);
    for (let i = 0; i < 4; i++) { BX.F(b, 118 + i * 8, 88, 6, 8, ["#ff8fa3", "#ffd54a", "#6fd3ff", "#ffffff"][i]); BX.F(b, 123 + i * 8, 90, 2, 4, ["#ff8fa3", "#ffd54a", "#6fd3ff", "#ffffff"][i]); }
    BX.F(b, 280, 24, 36, 102, "#dfe6f3"); BX.F(b, 280, 24, 36, 2, "#ffffff"); BX.F(b, 283, 62, 30, 1, "#9aa3b8"); BX.F(b, 310, 34, 2, 16, "#9aa3b8"); BX.F(b, 286, 30, 6, 5, "#ff6b6b"); BX.F(b, 294, 40, 5, 5, "#ffd54a");
    for (const lx of [120, 220]) { BX.F(b, lx, 0, 1, 16, "#2a2e38"); BX.oval(b, lx, 18, 7, 3, "#ffd54a"); BX.shaft(b, lx - 6, 12, lx - 24, 48, 20, BFL, "255,213,120", 0.1); }
    BX.floor(b, BFL, "#4a4f5e", "#30343f", "rgba(20,22,30,.35)", 170, R, 1.4);
    for (let x = 0; x < BW; x += 10) for (let y = BFL; y < BH; y += 10) if (((x + y) / 10) % 2 === 0) BX.F(b, x, y, 10, 10, "rgba(255,255,255,.04)");
    BX.F(fore.g, 290, 140, 30, 40, "#0b0e18"); BX.F(fore.g, 288, 138, 34, 3, "#2a2e3a"); BX.F(fore.g, 296, 128, 12, 10, "#c9743a"); BX.F(fore.g, 297, 129, 10, 3, "#ffd54a");
    return { steam: [[93 * 2, 70 * 2]], dust: "255,230,190", floorGlow: "255,226,170" };
  },
  meeting(L, R) {
    const { mid, back, fore } = L;
    BX.vg(mid.g, 0, 0, BW, BFL, [[0, "#141a30"], [1, "#1e2440"]]);
    for (let x = 0; x < BW; x += 40) { BX.F(mid.g, x + 4, 70, 30, 3, "#2a2a3a"); BX.F(mid.g, x + 12, 60, 14, 10, "#1a1e2e"); BX.F(mid.g, x + 13, 61, 12, 7, "#2a4a7a"); }
    BX.haze(mid.g, 0, BFL, "30,34,60", 0.2, 0.5);
    const b = back.g;
    BX.vg(b, 0, 0, BW, BFL, [[0, "#2a2140"], [1, "#221a34"]]);
    BX.winFrame(b, 54, 10, 76, 70, "#1a1428", 2, "#3a2f58"); for (let y = 12; y < 80; y += 4) BX.F(b, 54, y, 76, 1, "rgba(200,190,230,.18)");
    BX.F(b, 140, 16, 96, 58, "#eef1f7"); BX.F(b, 140, 16, 96, 2, "#b9c1d6"); BX.F(b, 138, 74, 100, 3, "#9aa3b8");
    b.strokeStyle = "#3b7bd6"; b.lineWidth = 1; b.beginPath(); b.moveTo(150, 60); b.lineTo(168, 46); b.lineTo(186, 52); b.lineTo(204, 32); b.lineTo(224, 40); b.stroke();
    BX.text(b, "결론: 다음 회의에서", 188, 68, "#d6403d", 7);
    BX.F(b, 248, 14, 64, 44, "#141020"); BX.F(b, 250, 16, 60, 40, "#3b2a5a"); BX.glow(b, 280, 36, 30, "160,130,255", 0.2);
    for (let i = 0; i < 4; i++) BX.F(b, 258 + i * 12, 46 - i * 6, 8, 8 + i * 6, ["#7c5cff", "#6fd3ff", "#ffd54a", "#7fe3a0"][i]);
    BX.F(b, 200, 0, 14, 5, "#2a2e38"); BX.shaft(b, 200, 14, 248, 64, 5, 56, "255,250,220", 0.16);
    BX.F(b, 40, 98, BW, 8, "#6a4a32"); BX.F(b, 40, 96, BW, 3, "#8a6a48"); for (let x = 54; x < BW; x += 44) { BX.F(b, x, 84, 16, 14, "#1b1f2a"); BX.F(b, x + 2, 86, 12, 10, "#3b4566"); BX.F(b, x + 7, 106, 2, 18, "#1b1f2a"); }
    BX.pot(b, 304, 126, 1.5, "#d9d2c0", ["#1f5a32", "#3a8a4a", "#6fd36a"], R);
    BX.floor(b, BFL, "#3a2c4c", "#241c34", "rgba(15,10,25,.4)", 180, R);
    BX.F(fore.g, 296, 128, 24, 52, "#0c0a14"); BX.F(fore.g, 292, 124, 30, 8, "#1a1428"); BX.F(fore.g, 300, 132, 16, 20, "#241c34");
    return { beam: [207 * 2, 10, 270 * 2, 112], dust: "255,250,220", floorGlow: "200,180,255" };
  },
  server(L, R) {
    const { far, mid, back, fore } = L, leds = [];
    BX.vg(far.g, 0, 0, BW, BFL + 10, [[0, "#04080c"], [1, "#0c1a24"]]);
    for (let x = 60; x < 300; x += 22) { BX.F(far.g, x, 40, 14, 80, "#0f1c26"); for (let y = 44; y < 116; y += 4) if (R() < 0.4) BX.F(far.g, x + 10, y, 1, 1, R() < 0.6 ? "#3fae7a" : "#2a7ab0"); }
    BX.haze(far.g, 20, BFL + 10, "40,120,160", 0.15, 0.4);
    for (let x = 40; x < BW; x += 34) { BX.F(mid.g, x, 24, 24, 102, "#111a22"); BX.F(mid.g, x + 1, 25, 22, 100, "#16222c"); for (let y = 30; y < 122; y += 6) { BX.F(mid.g, x + 3, y, 18, 4, "#0e161e"); if (R() < 0.5) BX.F(mid.g, x + 18, y + 1, 1, 1, R() < 0.7 ? "#7fe3a0" : "#ff5d5d"); } }
    BX.haze(mid.g, 0, BFL, "30,90,130", 0.05, 0.3);
    const b = back.g;
    BX.F(b, 0, 0, BW, 10, "#0a0e12"); BX.F(b, 0, 9, BW, 3, "#1e262e"); for (let x = 0; x < BW; x += 20) BX.F(b, x, 9, 2, 6, "#2a343e");
    for (const rx of [52, 270]) {
      BX.F(b, rx, 12, 46, 115, "#1a2028"); BX.F(b, rx + 2, 14, 42, 111, "#222a34");
      for (let y = 18; y < 122; y += 6) { BX.F(b, rx + 5, y, 36, 4, "#151a22"); const c = R() < 0.7 ? "#7fe3a0" : R() < 0.5 ? "#ff5d5d" : "#6fd3ff"; leds.push([(rx + 36) * 2, (y + 1) * 2, c]); BX.F(b, rx + 32, y + 1, 1, 1, "#0e1a14"); }
    }
    for (let i = 0; i < 5; i++) { const cx = 110 + i * 34 + R() * 10; b.strokeStyle = ["#2a3a8a", "#8a2a2a", "#2a8a4a", "#8a7a2a"][i % 4]; b.lineWidth = 1; b.beginPath(); b.moveTo(cx, 12); b.quadraticCurveTo(cx + 8, 30 + R() * 14, cx + 16, 12); b.stroke(); }
    BX.shaft(b, 150, 20, 130, 60, 12, BFL, "120,220,255", 0.06);
    BX.floor(b, BFL, "#283038", "#181e24", "rgba(5,8,12,.5)", 175, R, 1.25);
    for (let x = 0; x < BW; x += 16) for (let y = BFL + 4; y < BH; y += 12) for (let k = 0; k < 4; k++) BX.F(b, x + 3 + k * 3, y, 1, 1, "rgba(0,0,0,.35)");
    BX.haze(b, BFL - 10, BFL + 30, "120,200,255", 0, 0.1);
    for (let i = 0; i < 4; i++) BX.vine(fore.g, 52 + i * 4, 0, 10 + i * 5, ["#2a3a8a", "#8a2a2a", "#1e262e", "#2a8a4a"][i], ["#3a4aaa", "#aa3a3a", "#2e3640", "#3aaa5a"][i], R);
    BX.F(fore.g, 306, 0, 14, BH, "#080b0f"); BX.F(fore.g, 308, 0, 2, BH, "#1a2028");
    return { leds, dust: "140,220,255", floorGlow: "120,200,255", mist: "160,220,255" };
  },
  archive(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, BFL, [[0, "#1a140e"], [1, "#2a2016"]]);
    for (let x = 70; x < 290; x += 26) { BX.F(far.g, x, 30, 20, 90, "#2e2418"); for (let y = 36; y < 116; y += 10) BX.F(far.g, x + 1, y, 18, 1, "#3e3020"); }
    BX.haze(far.g, 0, BFL, "120,90,50", 0.25, 0.5);
    for (let x = 40; x < BW; x += 52) { BX.F(mid.g, x, 14, 40, 112, "#3a2c1e"); for (let y = 20; y < 122; y += 17) { BX.F(mid.g, x + 2, y + 14, 36, 2, "#4a3826"); let bx = x + 3; while (bx < x + 36) { const bw = 2 + Math.floor(R() * 3), bh = 7 + Math.floor(R() * 6); BX.F(mid.g, bx, y + 14 - bh, bw, bh, ["#8a5a3a", "#5a6a8a", "#7a7a4a", "#9a8a6a", "#6a4a3a"][Math.floor(R() * 5)]); bx += bw + 1; } } }
    BX.haze(mid.g, 0, BFL, "90,65,35", 0.15, 0.35);
    const b = back.g;
    for (const sx of [50, 262]) { BX.F(b, sx, 4, 56, 123, "#4a3a28"); BX.F(b, sx + 2, 4, 2, 123, "#5e4a34"); for (let y = 10; y < 124; y += 19) { BX.F(b, sx + 3, y + 16, 50, 3, "#5a4630"); let bx = sx + 5; while (bx < sx + 50) { const bw = 3 + Math.floor(R() * 3), bh = 9 + Math.floor(R() * 6); BX.F(b, bx, y + 16 - bh, bw, bh, ["#a86a3a", "#6a7aa8", "#9a9a5a", "#c8b08a", "#8a5a4a", "#c9a26b"][Math.floor(R() * 6)]); BX.F(b, bx, y + 16 - bh, bw, 1, "rgba(255,255,255,.18)"); bx += bw + (R() < 0.2 ? 2 : 0.5); } } }
    BX.F(b, 112, 0, 2, BFL, "#6a5236"); BX.F(b, 124, 0, 2, BFL, "#6a5236"); for (let y = 8; y < BFL; y += 10) BX.F(b, 112, y, 14, 2, "#6a5236");
    BX.winFrame(b, 160, 6, 30, 22, "#2a2016", 2, "#4a3a28"); BX.vg(b, 160, 6, 30, 22, [[0, "#ffe8b0"], [1, "#ffc86b"]]);
    BX.shaft(b, 160, 30, 190, 70, 28, BFL + 20, "255,220,150", 0.13);
    for (const lx of [150, 230]) { BX.F(b, lx, 0, 1, 20, "#2a2016"); BX.oval(b, lx, 22, 6, 3, "#c9a43a"); BX.glow(b, lx, 26, 30, "255,200,120", 0.15); }
    BX.floor(b, BFL, "#4e3c2a", "#2c2014", "rgba(30,20,10,.45)", 200, R, 1.3);
    for (let i = 0; i < 8; i++) { const px = 60 + R() * 250, py = BFL + 6 + R() * 40; BX.F(b, px, py, 6, 4, "#e8dcb5"); BX.F(b, px, py + 1, 6, 1, "#b8a888"); }
    BX.F(fore.g, 48, 138, 30, 42, "#120c06"); BX.F(fore.g, 50, 126, 24, 14, "#1e1408"); BX.F(fore.g, 52, 120, 18, 8, "#140e06");
    return { dust: "255,220,160", floorGlow: "255,200,140", dustN: 40 };
  },
  cafeteria(L, R) {
    const { far, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, 100, [[0, "#0a0f22"], [1, "#2a2a4a"]]); BX.skyline(far.g, 98, 12, 44, "#1c2248", ["#ffd54a", "#ffb36b", "#6fd3ff"], R, 8, 16, 0.25); BX.haze(far.g, 40, 100, "60,60,120", 0, 0.4);
    const b = back.g;
    BX.vg(b, 0, 0, BW, BFL, [[0, "#3a2a1f"], [1, "#2e2219"]]);
    BX.winFrame(b, 54, 12, 54, 50, "#1e160f", 2, "#5a4434"); BX.winFrame(b, 262, 12, 54, 50, "#1e160f", 2, "#5a4434");
    BX.F(b, 122, 10, 126, 40, "#1f3a2a"); BX.F(b, 122, 10, 126, 2, "#7a5a3a"); BX.F(b, 120, 50, 130, 3, "#7a5a3a");
    BX.text(b, "오늘의 메뉴: 제육볶음", 185, 24, "#f4f1e6", 8); BX.text(b, "후식: 요구르트", 185, 38, "#ffd54a", 8);
    BX.F(b, 110, 66, 150, 26, "#b8bcc6"); BX.F(b, 110, 64, 150, 3, "#e6ecff"); for (let i = 0; i < 5; i++) { BX.F(b, 116 + i * 29, 60, 22, 5, "#8d97b6"); BX.F(b, 118 + i * 29, 58, 18, 3, ["#c9743a", "#ffd54a", "#4fb35a", "#ff6b6b", "#f4f1e6"][i]); }
    for (const lx of [80, 290]) { BX.F(b, lx, 0, 1, 70, "#5a4a3a"); BX.oval(b, lx, 72, 9, 4, "#ffd54a"); BX.shaft(b, lx - 8, 16, lx - 22, 44, 74, BFL + 10, "255,213,120", 0.1); }
    for (let x = 50; x < BW; x += 74) { BX.F(b, x, 100, 60, 5, "#c9a26b"); BX.F(b, x, 100, 60, 1, "#e0c08a"); BX.F(b, x + 5, 105, 4, 20, "#7a5a3a"); BX.F(b, x + 51, 105, 4, 20, "#7a5a3a"); BX.F(b, x + 10, 96, 18, 4, "#b8bcc6"); BX.F(b, x + 32, 96, 18, 4, "#b8bcc6"); }
    BX.floor(b, BFL, "#4e4238", "#30281f", "rgba(20,14,10,.4)", 185, R, 1.4);
    BX.pot(b, 302, 126, 1.6, "#c9743a", ["#1f5a32", "#3a8a4a", "#6fd36a"], R);
    BX.F(fore.g, 48, 150, 40, 30, "#0e0a07"); BX.F(fore.g, 48, 148, 40, 3, "#2a2016"); BX.F(fore.g, 56, 140, 14, 8, "#d9d2c0");
    return { steam: [[130 * 2, 56 * 2], [190 * 2, 56 * 2], [240 * 2, 56 * 2]], dust: "255,226,170", floorGlow: "255,213,140" };
  },
  gym(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, 110, [[0, "#1a1a4a"], [0.55, "#c96b6a"], [1, "#ffb36b"]]);
    BX.disc(far.g, 240, 70, 14, "#ffd9a0"); BX.glow(far.g, 240, 70, 50, "255,200,140", 0.35);
    BX.skyline(far.g, 108, 14, 46, "#5a3a5a", null, R, 8, 18); BX.haze(far.g, 50, 110, "255,170,140", 0, 0.5);
    BX.skyline(mid.g, 110, 8, 30, "#2a1e36", ["#ffd54a"], R, 10, 22, 0.15);
    const b = back.g;
    BX.F(b, 0, 0, BW, BFL, "#1f2a3a");
    BX.winFrame(b, 54, 8, 262, 78, "#141c28", 5, "#3b4566"); BX.glass(b, 54, 8, 262, 78);
    BX.shaft(b, 230, 40, 200, 90, 8, BFL + 20, "255,190,130", 0.12);
    BX.F(b, 0, 92, BW, 3, "#3b4566"); BX.text(b, "하나 더! 할 수 있다!", 185, 100, "#ffd54a", 8);
    for (let x = 54; x < 290; x += 38) { BX.F(b, x, 110, 24, 3, "#2a2e38"); BX.F(b, x, 106, 4, 10, "#14161c"); BX.F(b, x + 20, 106, 4, 10, "#14161c"); }
    BX.F(b, 280, 96, 34, 28, "#2a2e38"); BX.F(b, 282, 98, 30, 6, "#14161c"); BX.F(b, 284, 99, 10, 3, "#ff5d5d");
    BX.floor(b, BFL, "#2e3440", "#1c2028", "rgba(10,12,16,.45)", 200, R);
    BX.F(fore.g, 48, 140, 22, 40, "#0b0d12"); BX.F(fore.g, 44, 136, 30, 6, "#1a1e28");
    return { dust: "255,210,170", floorGlow: "255,190,150" };
  },
  hr(L, R) {
    const { far, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, 90, [[0, "#081420"], [1, "#1e3a48"]]); BX.skyline(far.g, 88, 10, 40, "#16303a", ["#7fe3a0", "#ffd54a"], R, 8, 18, 0.2); BX.haze(far.g, 30, 90, "60,120,120", 0, 0.4);
    const b = back.g;
    BX.vg(b, 0, 0, BW, BFL, [[0, "#22362c"], [1, "#2a4034"]]);
    BX.winFrame(b, 54, 10, 56, 60, "#142018", 2, "#3a5a48");
    [["인재제일", 120], ["정시퇴근", 186], ["상호존중", 252]].forEach(([s, x]) => { BX.F(b, x, 14, 58, 30, "#c9a26b"); BX.F(b, x + 2, 16, 54, 26, "#f4f1e6"); BX.text(b, s, x + 29, 29, "#2a3a2f", 10); });
    for (let x = 116; x < BW; x += 44) { BX.F(b, x, 60, 30, 66, "#8d97b6"); BX.F(b, x, 60, 30, 2, "#b9c1d6"); for (let y = 64; y < 124; y += 15) { BX.F(b, x + 2, y, 26, 12, "#9aa3b8"); BX.F(b, x + 11, y + 4, 8, 2, "#5b6274"); } }
    BX.pot(b, 98, 126, 1.6, "#f4f1e6", ["#1f5a32", "#3a8a4a", "#6fd36a"], R); BX.vine(b, 140, 0, 14, "#1f5a32", "#4fb35a", R); BX.vine(b, 200, 0, 10, "#1f5a32", "#4fb35a", R);
    BX.floor(b, BFL, "#34443a", "#202a24", "rgba(10,20,14,.4)", 190, R);
    BX.bush(fore.g, 52, 186, 50, 46, ["#061a0e", "#0c2c18", "#164226"], R, 12);
    return { dust: "220,255,230", floorGlow: "200,255,220" };
  },
  finance(L, R) {
    const { mid, back, fore } = L;
    BX.vg(mid.g, 0, 0, BW, BFL, [[0, "#0c1410"], [1, "#16201a"]]); for (let x = 50; x < BW; x += 30) BX.F(mid.g, x, 20, 20, 90, "#121c16");
    const b = back.g;
    BX.vg(b, 0, 0, BW, BFL, [[0, "#1c2a22"], [1, "#16201b"]]);
    BX.F(b, 60, 12, 170, 74, "#0a100c"); BX.F(b, 62, 14, 166, 70, "#0e1a14");
    for (let x = 64; x < 226; x += 8) BX.F(b, x, 14, 1, 70, "rgba(127,227,160,.06)");
    b.strokeStyle = "#7fe3a0"; b.lineWidth = 1; b.beginPath(); let yy = 70; b.moveTo(68, yy); for (let x = 76; x <= 222; x += 8) { yy += (R() - 0.6) * 14; yy = Math.max(24, Math.min(80, yy)); b.lineTo(x, yy); } b.stroke();
    for (let i = 0; i < 12; i++) { const x = 70 + i * 13, up = R() < 0.6, h = 3 + R() * 10; BX.F(b, x, 50 - h / 2, 3, h, up ? "#7fe3a0" : "#ff5d5d"); }
    BX.glow(b, 145, 50, 70, "127,227,160", 0.12); BX.text(b, "이번 분기 예산", 106, 22, "#ffd54a", 8);
    BX.F(b, 244, 52, 66, 74, "#3a4048"); BX.F(b, 248, 56, 58, 66, "#4a5058"); BX.disc(b, 277, 89, 13, "#2a2e38"); BX.disc(b, 277, 89, 4, "#ffd54a"); for (let i = 0; i < 6; i++) BX.F(b, 277 + Math.cos(i) * 9, 89 + Math.sin(i) * 9, 1, 1, "#8d97b6");
    BX.floor(b, BFL, "#2c3632", "#1a201e", "rgba(5,12,8,.45)", 180, R);
    BX.pot(b, 236, 126, 1.4, "#c9a43a", ["#1f5a32", "#3a8a4a", "#6fd36a"], R);
    BX.F(fore.g, 48, 150, 36, 30, "#070b09"); for (let i = 0; i < 4; i++) BX.disc(fore.g, 58 + i * 7, 146 - i, 3, "#c9a43a");
    return { dust: "200,255,220", floorGlow: "127,227,160", ticker: true };
  },
  garden(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, 130, [[0, "#2a2050"], [0.45, "#a8607a"], [0.8, "#ffb37a"], [1, "#ffd9a0"]]);
    BX.disc(far.g, 250, 86, 13, "#fff0c8"); BX.glow(far.g, 250, 86, 60, "255,220,170", 0.4);
    BX.cloud(far.g, 110, 40, 16, "#ffd0c0", "#e8a0a8", null); BX.cloud(far.g, 200, 26, 12, "#ffd0c0", "#e8a0a8", null);
    BX.skyline(far.g, 118, 16, 54, "#8a5a7a", null, R, 8, 18); BX.haze(far.g, 50, 120, "255,190,170", 0, 0.55);
    BX.skyline(mid.g, 122, 10, 38, "#4a2e4a", ["#ffd9a0", "#ffb36b"], R, 10, 22, 0.12); BX.haze(mid.g, 80, 125, "255,170,150", 0, 0.3);
    const b = back.g;
    BX.F(b, 0, 104, BW, 4, "#8d97b6"); for (let x = 0; x < BW; x += 9) BX.F(b, x, 94, 2, 12, "#5b6274"); BX.F(b, 0, 93, BW, 2, "#b9c1d6");
    BX.F(b, 120, 20, 4, 90, "#6b4a32"); BX.F(b, 250, 20, 4, 90, "#6b4a32"); BX.F(b, 112, 18, 150, 4, "#8a6242"); for (let x = 116; x < 262; x += 10) BX.F(b, x, 15, 2, 4, "#6b4a32");
    for (let x = 118; x < 260; x += 7) BX.vine(b, x, 22, 8 + R() * 22, "#1f5a32", R() < 0.25 ? "#ff8fb8" : "#4fb35a", R);
    BX.tree(b, 70, 114, 70, "#4a3020", ["#1f5a32", "#3a8a4a", "#6fd36a"], R, 0.9); BX.flowers(b, 50, 60, 40, 30, ["#ff8fb8", "#ffd54a"], R, 8);
    BX.tree(b, 300, 114, 60, "#4a3020", ["#7a1f3a", "#c9466a", "#ff8fa3"], R, 0.9);
    for (let x = 40; x < BW; x += 46) { BX.F(b, x, 108, 34, 10, "#7a4a2a"); BX.F(b, x, 108, 34, 2, "#9a6a3e"); BX.bush(b, x + 17, 110, 34, 14, ["#1f5a32", "#3a8a4a", "#6fd36a"], R, 7); BX.flowers(b, x + 2, 100, 30, 8, ["#ff8fb8", "#ffd54a", "#ffffff"], R, 5); }
    BX.F(b, 0, 118, BW, 9, "#5a3c28"); BX.moss(b, 0, 118, BW, "#3a8a4a", "#6fd36a", R);
    BX.floor(b, BFL, "#7a5a40", "#4a3424", "rgba(40,24,14,.35)", 190, R, 1.45);
    for (let i = 0; i < 14; i++) BX.F(b, R() * BW, BFL + 2 + R() * 50, 2, 1, R() < 0.5 ? "#6fd36a" : "#3a8a4a");
    BX.haze(b, BFL - 20, BFL + 30, "255,200,170", 0, 0.12);
    BX.bush(fore.g, 54, 190, 56, 56, ["#0c2a14", "#164226", "#22603a"], R, 12); BX.flowers(fore.g, 40, 150, 30, 20, ["#ff8fb8"], R, 5);
    BX.vine(fore.g, 300, 0, 34, "#0c2a14", "#164226", R); BX.vine(fore.g, 310, 0, 22, "#0c2a14", "#164226", R);
    return { petals: ["#ff8fb8", "#ffd6e2", "#ffffff"], floorGlow: "255,200,170" };
  },
  heliport(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, 130, [[0, "#04060e"], [0.6, "#121a3a"], [1, "#2a2a5a"]]); BX.stars(far.g, 80, 80, R);
    BX.skyline(far.g, 126, 20, 70, "#1a2448", ["#5a6a9a"], R, 6, 14, 0.3); BX.haze(far.g, 60, 130, "60,70,140", 0, 0.5);
    BX.skyline(mid.g, 128, 10, 44, "#0e1430", ["#ffd54a", "#ff8a6b", "#6fd3ff"], R, 8, 18, 0.25);
    const b = back.g;
    BX.F(b, 60, 40, 3, 80, "#3a4058"); BX.F(b, 52, 38, 20, 3, "#5b6274"); BX.F(b, 62, 36, 2, 2, "#ff4040"); BX.glow(b, 63, 37, 10, "255,64,64", 0.35);
    BX.F(b, 290, 70, 2, 54, "#8d97b6"); b.fillStyle = "#ff8a3b"; b.beginPath(); b.moveTo(292, 70); b.lineTo(312, 74); b.lineTo(292, 79); b.fill(); BX.F(b, 300, 72, 3, 4, "#ffffff");
    BX.F(b, 0, 120, BW, 7, "#262a36"); BX.F(b, 0, 118, BW, 2, "#5b6274");
    BX.floor(b, BFL, "#3a3f4a", "#24272f", "rgba(10,12,16,.45)", 190, R, 1.25);
    b.strokeStyle = "#ffd54a"; b.lineWidth = 2; b.beginPath(); b.ellipse(190, 160, 78, 15, 0, 0, Math.PI * 2); b.stroke(); BX.text(b, "H", 190, 160, "#ffd54a", 18);
    for (let x = 6; x < BW; x += 24) { BX.disc(b, x, 129, 1, R() < 0.5 ? "#ff5d5d" : "#6fd3ff"); }
    BX.F(fore.g, 300, 120, 20, 60, "#06080e"); BX.F(fore.g, 296, 118, 26, 4, "#1a1e2a");
    return { clouds: { col: "rgba(150,160,210,.22)", y: 60, n: 5 }, plane: true, lights: true, floorGlow: "180,190,255" };
  },
  clouds(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, BH, [[0, "#7ab0e0"], [0.6, "#cfe6ff"], [1, "#f4fbff"]]);
    BX.disc(far.g, 90, 36, 12, "#fff9e0"); BX.glow(far.g, 90, 36, 50, "255,250,220", 0.5);
    for (let i = 0; i < 4; i++) { const x = 60 + i * 70 + R() * 20, h = 50 + R() * 40; BX.F(far.g, x, 120 - h, 18 + R() * 10, h, "#b8cde8"); BX.F(far.g, x + 2, 120 - h, 3, h, "#c8daf0"); }
    BX.haze(far.g, 30, 140, "230,240,255", 0, 0.55);
    for (let i = 0; i < 6; i++) BX.cloud(mid.g, 30 + i * 56 + R() * 20, 104 + R() * 20, 16 + R() * 10, "#ffffff", "#e4eefc", "#c8d8f0");
    const b = back.g;
    const plat = (x, y, w) => { BX.bricks(b, x, y, w, 12, "#c99a7a", "#9a6a52", "#e0b494", R, 8, 4); BX.F(b, x, y - 2, w, 3, "#5fbf6a"); BX.moss(b, x, y + 1, w, "#3a8a4a", "#7fe38a", R); BX.flowers(b, x + 2, y - 6, w - 4, 4, ["#ff8fa3", "#ffd54a", "#ffffff"], R, Math.round(w / 6)); for (let k = 0; k < w / 10; k++) BX.vine(b, x + 3 + R() * (w - 6), y + 12, 6 + R() * 18, "#2a7a3a", "#5fbf6a", R); BX.F(b, x + 4, y + 12, w - 8, 3, "#8a6a52"); };
    plat(56, 60, 52); plat(250, 44, 64);
    BX.F(b, 0, 122, BW, 5, "#e8f2ff");
    for (let x = -10; x < BW; x += 22) BX.disc(b, x, 130, 12, "#ffffff");
    BX.F(b, 0, 130, BW, BH - 130, "#f4f9ff"); for (let x = 0; x < BW; x += 30) BX.disc(b, x + 15, 168, 14, "#e2ecfa");
    BX.cloud(fore.g, 52, 170, 22, "#ffffff", "#eef4ff", "#cfdcf0"); BX.cloud(fore.g, 316, 176, 26, "#ffffff", "#eef4ff", "#cfdcf0");
    return { clouds: { col: "rgba(255,255,255,.55)", y: 80, n: 6 }, petals: ["#ff8fa3", "#ffffff"], noReflect: true, floorGlow: "255,255,255" };
  },
  stratos(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, BH, [[0, "#000006"], [0.55, "#0a1640"], [1, "#2a5aa8"]]); BX.stars(far.g, 120, 110, R);
    BX.oval(far.g, 190, 260, 300, 150, "#2a5aa8"); BX.oval(far.g, 190, 262, 296, 146, "#3b7bd6");
    for (let i = 0; i < 8; i++) BX.oval(far.g, 80 + R() * 220, 122 + R() * 20, 14 + R() * 20, 2, "rgba(255,255,255,.5)");
    BX.haze(far.g, 96, 140, "111,211,255", 0, 0.45);
    BX.F(mid.g, 250, 40, 30, 2, "#8d97b6"); BX.F(mid.g, 262, 34, 6, 14, "#c9ced8"); BX.F(mid.g, 240, 38, 10, 6, "#3b7bd6"); BX.F(mid.g, 280, 38, 10, 6, "#3b7bd6");
    const b = back.g;
    BX.F(b, 0, 132, BW, 4, "#8d97b6"); BX.floor(b, 136, "#5b6274", "#2e3448", "rgba(20,24,40,.4)", 190, R, 1.25);
    for (let x = 0; x < BW; x += 25) { BX.F(b, x, 136, 1, BH - 136, "#3b4566"); BX.F(b, x + 3, 139, 2, 2, "#8d97b6"); }
    for (const px of [60, 300]) { BX.F(b, px, 70, 3, 64, "#5b6274"); BX.F(b, px - 6, 68, 15, 3, "#8d97b6"); BX.disc(b, px + 1, 66, 2, "#7fe3a0"); }
    BX.F(fore.g, 46, 128, 20, 52, "#05070e"); BX.F(fore.g, 40, 124, 32, 6, "#141a2a");
    return { lights: true, floorGlow: "111,211,255" };
  },
  moon(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, BH, [[0, "#020306"], [1, "#0c0e1a"]]); BX.stars(far.g, 140, 120, R);
    BX.disc(far.g, 250, 40, 20, "#2a5aa8"); BX.disc(far.g, 246, 36, 7, "#4fb35a"); BX.disc(far.g, 256, 46, 5, "#4fb35a"); BX.disc(far.g, 252, 30, 4, "#ffffff"); BX.glow(far.g, 250, 40, 34, "111,170,255", 0.25);
    BX.ridge(far.g, BH, 100, 10, "#4a4a58", R, 12); BX.haze(far.g, 70, 130, "120,120,140", 0, 0.35);
    BX.ridge(mid.g, BH, 112, 8, "#6a6878", R, 9);
    for (let i = 0; i < 5; i++) BX.oval(mid.g, 60 + R() * 250, 116 + R() * 8, 8 + R() * 10, 2, "#58566a");
    const b = back.g;
    BX.F(b, 70, 98, 40, 22, "#c9ced8"); BX.oval(b, 90, 98, 20, 10, "#dfe4ee"); BX.F(b, 72, 108, 36, 2, "#8d97b6"); for (let i = 0; i < 4; i++) BX.F(b, 76 + i * 8, 112, 4, 3, "#ffd54a");
    BX.F(b, 120, 80, 2, 40, "#c9ced8"); BX.oval(b, 121, 80, 8, 3, "#dfe4ee"); BX.disc(b, 121, 77, 1, "#ff5d5d");
    BX.F(b, 280, 92, 3, 30, "#c9ced8"); BX.F(b, 283, 94, 16, 9, "#d6403d"); BX.F(b, 285, 96, 4, 2, "#ffffff");
    BX.vg(b, 0, 118, BW, BH - 118, [[0, "#9a98a6"], [1, "#5a5868"]]);
    for (let i = 0; i < 14; i++) { const x = R() * BW, y = 124 + R() * 52, r = 4 + R() * 12; BX.oval(b, x, y, r, r * 0.3, "#6e6c7c"); BX.oval(b, x, y - 0.5, r * 0.85, r * 0.22, "#5a5868"); }
    BX.ridge(fore.g, BH, 166, 6, "#1a1a22", R, 8);
    return { lights: true, floorGlow: "200,210,255", noReflect: true };
  },
  mars(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, BH, [[0, "#5a2018"], [0.5, "#c9603a"], [1, "#ffb37a"]]);
    BX.disc(far.g, 90, 34, 8, "#fff0d0"); BX.glow(far.g, 90, 34, 40, "255,220,170", 0.4);
    BX.ridge(far.g, BH, 88, 12, "#b8603e", R, 14); BX.haze(far.g, 50, 120, "255,170,120", 0, 0.5);
    BX.ridge(mid.g, BH, 100, 10, "#8a3a26", R, 10);
    for (const mx of [200, 270]) { BX.F(mid.g, mx, 58, 30, 50, "#4a2018"); BX.F(mid.g, mx + 6, 30, 8, 30, "#3a1810"); for (let y = 64; y < 104; y += 8) for (let x = mx + 3; x < mx + 28; x += 6) BX.F(mid.g, x, y, 3, 3, R() < 0.5 ? "#ffb36b" : "#5a2a1a"); }
    BX.haze(mid.g, 40, 125, "255,150,100", 0.05, 0.3);
    const b = back.g;
    BX.ridge(b, 130, 112, 6, "#7a2e1e", R, 7);
    BX.vg(b, 0, 118, BW, BH - 118, [[0, "#b8583a"], [1, "#6a2a1a"]]);
    for (let i = 0; i < 26; i++) BX.F(b, R() * BW, 122 + R() * 56, 3 + R() * 6, 2 + R() * 3, R() < 0.5 ? "#8a3424" : "#d9784e");
    BX.F(b, 60, 96, 26, 24, "#5a5a68"); BX.F(b, 62, 98, 22, 4, "#ffd54a"); BX.F(b, 66, 104, 6, 6, "#3a3a48"); BX.F(b, 76, 104, 6, 6, "#3a3a48");
    BX.ridge(fore.g, BH, 164, 8, "#3a120a", R, 7);
    return { embers: "255,170,110", floorGlow: "255,170,110", noReflect: true };
  },
  station(L, R) {
    const { far, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, BH, [[0, "#020410"], [1, "#0c1030"]]); BX.stars(far.g, 120, BH, R);
    BX.glow(far.g, 230, 50, 60, "200,100,255", 0.2); BX.glow(far.g, 120, 70, 50, "100,200,255", 0.15);
    BX.disc(far.g, 260, 60, 24, "#d9784e"); BX.disc(far.g, 254, 54, 22, "#e8956a"); BX.oval(far.g, 260, 60, 40, 5, "rgba(255,230,200,.5)");
    const b = back.g;
    BX.F(b, 0, 0, BW, BFL, "#363c50"); for (let x = 0; x < BW; x += 40) for (let y = 0; y < BFL; y += 32) { BX.F(b, x + 1, y + 1, 38, 30, "#40475e"); BX.F(b, x + 3, y + 3, 2, 2, "#5b6274"); BX.F(b, x + 35, y + 3, 2, 2, "#5b6274"); }
    for (const [cx, cy, r] of [[110, 50, 26], [210, 50, 26], [300, 50, 22]]) { BX.disc(b, cx, cy, r + 3, "#22262f"); g2Hole(b, cx, cy, r); }
    BX.F(b, 0, 104, BW, 10, "#2a2e38"); for (let x = 0; x < BW; x += 20) { BX.F(b, x, 104, 10, 10, "#ffd54a"); BX.F(b, x + 10, 104, 10, 10, "#14161c"); }
    BX.F(b, 0, 114, BW, 13, "#3a4052"); for (let x = 10; x < BW; x += 40) { BX.F(b, x, 116, 20, 3, "#6fd3ff"); BX.glow(b, x + 10, 117, 12, "111,211,255", 0.2); }
    BX.floor(b, BFL, "#2e323e", "#1a1d26", "rgba(8,10,16,.5)", 190, R, 1.25);
    BX.F(fore.g, 46, 0, 16, BH, "#0a0c12"); BX.F(fore.g, 58, 0, 2, BH, "#2a2e38"); BX.F(fore.g, 0, 0, BW, 8, "#0a0c12");
    return { lights: true, floorGlow: "111,211,255" };
  },
  galaxy(L, R) {
    const { far, mid, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, BH, [[0, "#0a0620"], [0.6, "#2a1050"], [1, "#4a1a5a"]]); BX.stars(far.g, 150, BH, R, ["#ffffff", "#ffd6f0", "#c8d6ff"]);
    for (let i = 0; i < 6; i++) BX.glow(far.g, 40 + R() * 260, 20 + R() * 100, 30 + R() * 40, R() < 0.5 ? "255,107,214" : "124,92,255", 0.18);
    BX.disc(far.g, 90, 50, 16, "#6a4ab8"); BX.oval(far.g, 90, 50, 30, 4, "rgba(255,200,255,.5)"); BX.disc(far.g, 90, 48, 15, "#7c5cc8");
    for (let i = 0; i < 8; i++) { const x = 140 + i * 22, y = 40 + Math.sin(i) * 10; BX.F(mid.g, x, y, 10, 8, "#c9a26b"); BX.F(mid.g, x, y + 3, 10, 2, "#ffd54a"); }
    BX.F(mid.g, 130, 50, 190, 3, "#4a35b8");
    const b = back.g;
    BX.F(b, 0, 108, BW, 8, "#2a1a5a"); for (let x = 0; x < BW; x += 15) BX.disc(b, x + 7, 112, 3, "#4a35b8");
    for (let x = 50; x < BW; x += 60) { BX.F(b, x, 92 - (x % 3) * 4, 20, 16, "#c9a26b"); BX.F(b, x, 98 - (x % 3) * 4, 20, 2, "#ffd54a"); BX.F(b, x + 8, 92 - (x % 3) * 4, 4, 16, "#e0c08a"); }
    BX.F(b, 0, 116, BW, 11, "#1a0f2a");
    BX.floor(b, BFL, "#24123a", "#120820", "rgba(255,107,214,.18)", 190, R, 1.3);
    BX.F(fore.g, 300, 120, 20, 60, "#06030c"); BX.disc(fore.g, 52, 182, 20, "#120820");
    return { sparkles: ["#ffffff", "#ff9be0", "#c9a6ff"], floorGlow: "255,107,214" };
  },
  blackhole(L, R) {
    const { far, mid, back, fore } = L;
    BX.F(far.g, 0, 0, BW, BH, "#020205"); BX.stars(far.g, 90, BH, R, ["#8d8a96", "#ffffff"]);
    for (let i = 7; i >= 0; i--) { far.g.strokeStyle = `rgba(${i % 2 ? "255,154,59" : "124,92,255"},${0.14 + (7 - i) * 0.05})`; far.g.lineWidth = 6 - i * 0.5; far.g.beginPath(); far.g.ellipse(190, 56, 70 + i * 10, 14 + i * 3, -0.12, 0, Math.PI * 2); far.g.stroke(); }
    BX.disc(far.g, 190, 56, 22, "#000000"); far.g.strokeStyle = "rgba(255,213,74,.7)"; far.g.lineWidth = 1.5; far.g.beginPath(); far.g.arc(190, 56, 23, 0, Math.PI * 2); far.g.stroke();
    BX.glow(far.g, 190, 56, 70, "255,154,59", 0.12);
    for (let i = 0; i < 10; i++) BX.F(mid.g, 60 + R() * 250, 20 + R() * 90, 2 + R() * 4, 2 + R() * 3, R() < 0.5 ? "#3a3a48" : "#5a4a3a");
    const b = back.g;
    BX.F(b, 0, BFL - 4, BW, 4, "#7c5cff"); BX.glow(b, 190, BFL, 120, "124,92,255", 0.12);
    BX.F(b, 0, BFL, BW, BH - BFL, "#0a0a12");
    for (let x = -300; x < BW + 300; x += 20) { b.strokeStyle = "rgba(124,92,255,.35)"; b.lineWidth = 1; b.beginPath(); b.moveTo(190 + (x - 190) * 0.25, BFL); b.lineTo(x, BH); b.stroke(); }
    let yy = BFL, d = 3; while (yy < BH) { BX.F(b, 0, Math.round(yy), BW, 1, "rgba(124,92,255,.28)"); yy += d; d *= 1.35; }
    BX.ridge(fore.g, BH, 170, 6, "#030305", R, 9);
    return { sparkles: ["#ffb36b", "#c9a6ff"], floorGlow: "124,92,255", swirl: [190 * 2, 56 * 2] };
  },
  timespace(L, R) {
    const { far, mid, back, fore } = L, clocks = [];
    BX.vg(far.g, 0, 0, BW, BH, [[0, "#140a28"], [0.6, "#3a1f5a"], [1, "#6a3a6a"]]); BX.stars(far.g, 50, 130, R, ["#ffd54a", "#ffffff"]);
    BX.glow(far.g, 200, 70, 90, "255,200,120", 0.15);
    for (let i = 0; i < 4; i++) { const x = 60 + i * 70 + R() * 20, h = 30 + R() * 50; BX.F(far.g, x, 120 - h, 12, h, "#4a2e6a"); BX.F(far.g, x - 2, 120 - h, 16, 3, "#5a3e7a"); }
    BX.haze(far.g, 40, 130, "200,150,220", 0, 0.4);
    for (let i = 0; i < 6; i++) { const x = 70 + R() * 240, y = 18 + R() * 70, r = 6 + R() * 8; BX.disc(mid.g, x, y, r + 1, "#c9a43a"); BX.disc(mid.g, x, y, r, "#fff4e0"); clocks.push([x * 2, y * 2, r * 2]); }
    const b = back.g;
    for (let i = 0; i < 6; i++) BX.F(b, 60 + i * 26, 116 - i * 9, 28, 4, "#5a3e7a");
    BX.F(b, 0, BFL - 2, BW, 3, "#ffd54a");
    for (let x = 0; x < BW; x += 16) for (let y = BFL; y < BH; y += 8) if (((x / 16) + (y - BFL) / 8) % 2 === 0) BX.F(b, x, y, 16, 8, "#3a2a5a"); else BX.F(b, x, y, 16, 8, "#2a1a4a");
    BX.haze(b, BFL - 30, BFL + 20, "255,213,140", 0, 0.12);
    BX.disc(fore.g, 312, 30, 18, "#c9a43a"); BX.disc(fore.g, 312, 30, 16, "#2a1a40"); BX.disc(fore.g, 312, 30, 13, "#fff4e0");
    return { clocks, sparkles: ["#ffd54a", "#ffffff"], floorGlow: "255,213,140" };
  },
  vault(L, R) {
    const { far, back, fore } = L;
    BX.vg(far.g, 0, 0, BW, BFL, [[0, "#06080e"], [1, "#101624"]]);
    for (let x = 60; x < 300; x += 24) { BX.F(far.g, x, 30, 18, 90, "#121a28"); for (let y = 36; y < 118; y += 12) BX.F(far.g, x + 2, y, 14, 9, "#18223a"); }
    BX.haze(far.g, 0, BFL, "60,80,140", 0.2, 0.5);
    const b = back.g;
    for (let x = 50; x < BW; x += 46) { BX.F(b, x, 10, 40, 117, "#1a2030"); for (let y = 16; y < 120; y += 26) { BX.F(b, x + 3, y, 34, 22, "#252e46"); BX.F(b, x + 15, y + 9, 10, 3, "#3a4566"); BX.F(b, x + 3, y, 34, 1, "#323c5a"); } }
    BX.F(b, 0, 0, BW, 10, "rgba(255,213,74,.14)"); BX.shaft(b, 170, 30, 150, 80, 0, BFL, "255,213,74", 0.08);
    BX.floor(b, BFL, "#262e42", "#121826", "rgba(5,8,14,.5)", 190, R);
    BX.F(fore.g, 46, 0, 14, BH, "#05070c");
    return { dust: "255,226,170", floorGlow: "255,213,74" };
  },
};
function g2Hole(g, cx, cy, r) { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); g.clearRect(cx - w, cy + y, w * 2 + 1, 1); } }
/* 구역 → 그림 묶음 (구역·변형별로 기억). 먼 층·중간 층·근경은 반 해상도 그대로 두고 그릴 때 2배로 키움 */
const bgCache = new Map();
function buildBgSet(floor, vault) {
  const zi = vault ? 99 : zoneNo(floor) % ZONES.length, kind = vault ? "vault" : ZONES[zi].bg, variant = vault ? 0 : Math.floor(((floor - 1) % ZONE_LEN) / 17), key = kind + ":" + variant;
  if (bgCache.has(key)) return bgCache.get(key);
  const R = rng(7919 * (zi + 1) + variant * 131);
  const L = { far: bgLayer(), mid: bgLayer(), back: bgLayer(), fore: bgLayer() };
  if (!L.far.g || !L.far.g.fillRect) return null;
  bgRec = { texts: [], stars: [] };
  let amb = {};
  try { amb = (BG2[kind] || BG2.lobby)(L, R, variant) || {}; } catch (e) { console.warn("bg2", kind, e); return null; }
  const back = document.createElement("canvas"); back.width = W; back.height = H;
  const bg2 = back.getContext("2d"); bg2.imageSmoothingEnabled = false; bg2.drawImage(L.back.c, 0, 0, W, H);
  if (!amb.noReflect) { bg2.fillStyle = "rgba(0,0,0,.28)"; bg2.fillRect(0, GROUND, W, 3); }
  const set = { kind, amb, far: L.far.c, mid: L.mid.c, back, fore: L.fore.c, texts: bgRec.texts, tw: [] };
  // 보이는 별만 골라 반짝이게 (벽·건물에 가린 별 제외)
  try {
    const t = document.createElement("canvas"); t.width = BW; t.height = BH; const tg = t.getContext("2d");
    tg.drawImage(L.far.c, 0, 0); tg.drawImage(L.mid.c, 0, 0); tg.drawImage(L.back.c, 0, 0);
    const d = tg.getImageData(0, 0, BW, BH).data;
    bgRec.stars.forEach(([x, y]) => { if (x < 48 || x >= BW || y < 2 || y >= BH) return; const i = (y * BW + x) * 4; if (d[i] + d[i + 1] + d[i + 2] > 330) set.tw.push([x * 2 + 1, y * 2 + 1]); });
    for (let i = set.tw.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [set.tw[i], set.tw[j]] = [set.tw[j], set.tw[i]]; }
    set.tw.length = Math.min(set.tw.length, 22);
  } catch (e) {}
  if (amb.clouds) { const cb = document.createElement("canvas"); cb.width = W; cb.height = 140; const cg = cb.getContext("2d"); const R2 = rng(41 + variant); for (let i = 0; i < amb.clouds.n * 2; i++) { const x = R2() * W, y = 30 + R2() * 80, s = 14 + R2() * 22; cg.fillStyle = amb.clouds.col; [[0, 0, 1], [-0.9, 0.2, 0.7], [0.9, 0.25, 0.7]].forEach(([a, b2, r]) => { cg.beginPath(); cg.arc(x + a * s, y + b2 * s, r * s, 0, 7); cg.fill(); }); } set.cloudBand = cb; }
  if (bgCache.size >= 6) bgCache.delete(bgCache.keys().next().value);
  bgCache.set(key, set); return set;
}
/* 층마다 다른 카메라: f=0 이면 고정(아주 먼 하늘), 1 이면 세상과 같이, 1보다 크면 더 많이 움직임(근경) */
let bgShx = 0, bgShy = 0;
function layerTransform(f) {
  const cxw = VX0 + VW / 2, cyw = VY0 + VH / 2, zc = VIEW_H / VH;
  const zf = 1 + (zc - 1) * f, cx = 370 + (cxw - 370) * f, cy = 180 + (cyw - 180) * f;
  const vh = VIEW_H / zf, x0 = cx - vh * VIEW_A / 2, y0 = cy - vh / 2, s = CSH / vh;
  ctx.setTransform(s, 0, 0, s, (-x0 + bgShx * f) * s, (-y0 + bgShy * f) * s);
}
/* 하늘 반짝이·비행기: 먼 층과 같이 움직이게 먼 층 좌표로 그림 */
function drawSkyFx(t) {
  AMB.stars.forEach(s => { const a = Math.max(0, Math.sin(t / 1000 * s.sp + s.p)); if (a < 0.05) return; ctx.fillStyle = `rgba(255,255,255,${0.8 * a})`; ctx.fillRect(s.x - 1, s.y - 1, 2, 2); if (a > 0.85) { ctx.fillRect(s.x - 3, s.y - 1, 6, 2); ctx.fillRect(s.x - 1, s.y - 3, 2, 6); } });
  if (AMB.plane) { const p = AMB.plane, on = Math.floor(t / 400) % 2; ctx.fillStyle = "rgba(20,24,40,.9)"; ctx.fillRect(p.x - 8, p.y, 16, 3); ctx.fillRect(p.x - 2, p.y - 3, 4, 9); ctx.fillStyle = on ? "#ff4040" : "#ffffff"; ctx.fillRect(p.x + 8, p.y, 2, 2); ctx.fillStyle = on ? "#ffffff" : "#40ff70"; ctx.fillRect(p.x - 10, p.y, 2, 2); }
}
function drawBgBack(t) {
  if (bgSet) {
    layerTransform(0.2); ctx.drawImage(bgSet.far, 0, 0, W, H); drawSkyFx(t);
    if (bgSet.cloudBand) { const off = (t / 60) % W, cy = bgSet.amb.clouds.y - 70; ctx.globalAlpha = 0.9; ctx.drawImage(bgSet.cloudBand, -off, cy); ctx.drawImage(bgSet.cloudBand, W - off, cy); ctx.globalAlpha = 1; }
    layerTransform(0.55); ctx.drawImage(bgSet.mid, 0, 0, W, H);
  }
  camApply(); ctx.translate(bgShx, bgShy);
  if (!bgSet) { ctx.drawImage(bg, 0, 0); return; }
  ctx.drawImage(bgSet.back, 0, 0);
  if (bgSet.texts.length) { ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; bgSet.texts.forEach(([s, x, y, col, px]) => { ctx.font = `${px}px "Do Hyeon", sans-serif`; ctx.fillStyle = col; ctx.fillText(s, x, y); }); ctx.restore(); }
}
function drawBgFore() {
  if (!bgSet) return;
  ctx.save(); layerTransform(1.2); ctx.drawImage(bgSet.fore, 0, 0, W, H); ctx.restore();
}
/* 구역별 움직이는 장식: 꽃잎, 김, 서버 불빛, 프로젝터 빛, 불티, 반짝이, 시계 바늘 */
let bgParts = [];
function drawBgAmbient(t) {
  if (!bgSet) return; const a = bgSet.amb;
  if (a.leds) a.leds.forEach(([x, y, c], i) => { if (Math.sin(t / (180 + (i % 7) * 60) + i * 1.7) > 0.2) { ctx.fillStyle = c; ctx.fillRect(x - 2, y, 4, 2); ctx.fillStyle = hexA(c, 0.25); ctx.fillRect(x - 5, y - 2, 10, 6); } });
  if (a.beam) { const [x0, y0, x1, y1] = a.beam, al = 0.08 + 0.03 * Math.sin(t / 90) + 0.02 * Math.sin(t / 23); const gr = ctx.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(255,250,220,${al * 2})`); gr.addColorStop(1, "rgba(255,250,220,0)"); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x0 - 6, y0); ctx.lineTo(x0 + 16, y0); ctx.lineTo(x1 + 60, y1); ctx.lineTo(x1 - 40, y1); ctx.closePath(); ctx.fill(); }
  if (a.steam) a.steam.forEach(([x, y], i) => { for (let k = 0; k < 4; k++) { const p = ((t / 1600 + k / 4 + i * 0.13) % 1), r = 4 + p * 10; ctx.fillStyle = `rgba(255,255,255,${0.18 * (1 - p)})`; ctx.beginPath(); ctx.arc(x + Math.sin(t / 500 + k * 2 + i) * 5 * p, y - p * 46, r, 0, 7); ctx.fill(); } });
  if (a.clocks) a.clocks.forEach(([x, y, r], i) => { const h = t / (900 + i * 300) + i, m = t / (140 + i * 40); ctx.strokeStyle = "#2a2206"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(h) * r * 0.5, y + Math.sin(h) * r * 0.5); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(m) * r * 0.8, y + Math.sin(m) * r * 0.8); ctx.stroke(); });
  if (a.swirl) { const [x, y] = a.swirl; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12); for (let i = 0; i < 14; i++) { const ang = t / 700 + i / 14 * Math.PI * 2, rx = 160 + (i % 3) * 18, ry = 32 + (i % 3) * 5; ctx.fillStyle = i % 2 ? "rgba(255,180,90,.7)" : "rgba(180,150,255,.6)"; ctx.fillRect(Math.cos(ang) * rx - 2, Math.sin(ang) * ry - 1, 4, 2); } ctx.restore(); }
  if (a.lights) for (let i = 0; i < 6; i++) { const on = Math.sin(t / 400 + i * 1.3) > 0.5; if (!on) continue; const x = 100 + i * 95, y = GROUND + 50; ctx.fillStyle = "rgba(255,90,90,.5)"; ctx.fillRect(x, y, 3, 3); }
  if (reduceMotion) return;
  // 입자
  const want = a.petals ? 18 : a.embers ? 26 : a.sparkles ? 22 : 0;
  while (bgParts.length < want) bgParts.push({ x: 100 + Math.random() * 540, y: Math.random() * 300, v: 0.3 + Math.random() * 0.6, p: Math.random() * 6.28, s: 2 + Math.random() * 2, c: Math.random() });
  if (bgParts.length > want) bgParts.length = want;
  bgParts.forEach((q, i) => {
    if (a.petals) { q.y += q.v * 0.6; q.x -= q.v * 0.5 - Math.sin(t / 600 + q.p) * 0.4; if (q.y > GROUND + 40 || q.x < 90) { q.y = -10; q.x = 140 + Math.random() * 520; } ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(t / 500 + q.p); ctx.fillStyle = a.petals[i % a.petals.length]; ctx.fillRect(-q.s, -q.s / 2, q.s * 2, q.s); ctx.restore(); }
    else if (a.embers) { q.x -= q.v * 2.2; q.y += Math.sin(t / 300 + q.p) * 0.3; if (q.x < 90) { q.x = 650; q.y = 40 + Math.random() * 280; } ctx.fillStyle = `rgba(${a.embers},${0.3 + 0.3 * Math.sin(t / 200 + q.p)})`; ctx.fillRect(q.x, q.y, q.s * 3, 1.5); }
    else if (a.sparkles) { const tw = Math.sin(t / 300 + q.p * 3); if (tw > 0.3) { ctx.fillStyle = a.sparkles[i % a.sparkles.length]; const s = q.s * tw; ctx.fillRect(q.x - s, q.y, s * 2, 1.5); ctx.fillRect(q.x, q.y - s, 1.5, s * 2); } q.y -= 0.05; if (q.y < 0) q.y = 300; }
  });
  if (a.mist) { for (let i = 0; i < 3; i++) { const x = ((t / (40 + i * 15)) + i * 200) % 800 - 100; const gr = ctx.createRadialGradient(x, GROUND + 6, 4, x, GROUND + 6, 120); gr.addColorStop(0, `rgba(${a.mist},.10)`); gr.addColorStop(1, `rgba(${a.mist},0)`); ctx.fillStyle = gr; ctx.fillRect(x - 120, GROUND - 60, 240, 120); } }
}
