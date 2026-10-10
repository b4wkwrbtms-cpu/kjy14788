/* ===================== 전투 배경 2.0: 원경·중경·뒷벽·근경 4겹 + 대기 원근 =====================
   참고: 사용자가 보낸 숲·유적·동굴 도트 그림 — 먼 것은 옅고 흐리게(안개 색에 묻힘), 가까운 것은 진하고 또렷하게,
   덩굴·꽃·이끼 같은 작은 소품, 빛줄기, 바닥 안개, 화면 가장자리를 감싸는 어두운 근경.
   반 해상도(320x180)에 도트로 찍고 2배로 키움. 카메라가 다가가거나 흔들리면 먼 층은 덜, 가까운 층은 더 움직임.
   한 구역 안에서도 층을 오를수록 창밖이 저녁 → 깊은 밤 → 새벽으로 바뀜(야근!). */
const BW = 320, BH = 180, BFL = 127, BGR = 152;
let bgSet = null, bgRec = { texts: [], stars: [] };
function bgLayer() { const c = document.createElement("canvas"); c.width = BW; c.height = BH; const g = c.getContext("2d"); if (g) g.imageSmoothingEnabled = false; return { c, g }; }
const BX = {
  F(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
  P(g, x, y, col) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); },
  vg(g, x, y, w, h, stops) { const gr = g.createLinearGradient(0, y, 0, y + h); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(x, y, w, h); },
  hg(g, x, y, w, h, stops) { const gr = g.createLinearGradient(x, 0, x + w, 0); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(x, y, w, h); },
  disc(g, cx, cy, r, col) { g.fillStyle = col; const R0 = Math.max(0.5, r); for (let y = -Math.floor(R0); y <= Math.floor(R0); y++) { const w = Math.floor(Math.sqrt(R0 * R0 - y * y) + 0.35); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } },
  oval(g, cx, cy, rx, ry, col) { g.fillStyle = col; for (let y = -Math.floor(ry); y <= Math.floor(ry); y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) * (y / ry))) + 0.35); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } },
  /* 행성의 그늘: 행성 원 안에서만 다른 원 모양으로 어둡게 */
  shadeDisc(g, cx, cy, r, sx, sy, sr, col) { g.fillStyle = col; for (let y = -Math.floor(r); y <= Math.floor(r); y++) { const w = Math.floor(Math.sqrt(r * r - y * y) + 0.35), yy = cy + y - sy; if (Math.abs(yy) > sr) continue; const w2 = Math.floor(Math.sqrt(sr * sr - yy * yy) + 0.35), a = Math.max(cx - w, sx - w2), b = Math.min(cx + w + 1, sx + w2 + 1); if (b > a) g.fillRect(Math.round(a), Math.round(cy + y), Math.round(b - a), 1); } },
  ring(g, cx, cy, r, col) { g.fillStyle = col; for (let a = 0; a < 360; a += 2) { const t = a * Math.PI / 180; g.fillRect(Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), 1, 1); } },
  haze(g, y0, y1, rgb, a0, a1) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(${rgb},${a0})`); gr.addColorStop(1, `rgba(${rgb},${a1})`); g.fillStyle = gr; g.fillRect(0, y0, BW, y1 - y0); },
  /* 이미 그린 부분에만 색을 덮음(먼 것일수록 안개 색에 묻히게) */
  tint(g, rgb, a, y0, y1) { g.save(); g.globalCompositeOperation = "source-atop"; if (y1 != null) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(${rgb},${a[0]})`); gr.addColorStop(1, `rgba(${rgb},${a[1]})`); g.fillStyle = gr; } else g.fillStyle = `rgba(${rgb},${a})`; g.fillRect(0, 0, BW, BH); g.restore(); },
  glow(g, x, y, r, rgb, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); },
  pool(g, x, y, rx, ry, rgb, a) { g.save(); g.translate(x, y); g.scale(1, ry / rx); BX.glow(g, 0, 0, rx, rgb, a); g.restore(); },
  shaft(g, x0, w0, x1, w1, y0, y1, rgb, a) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w0, y0); g.lineTo(x1 + w1, y1); g.lineTo(x1, y1); g.closePath(); g.fill(); },
  speck(g, x, y, w, h, col, n, R) { g.fillStyle = col; for (let i = 0; i < n; i++) g.fillRect(Math.round(x + R() * w), Math.round(y + R() * h), 1, 1); },
  /* 잎 하나: 기울어진 타원을 칸칸이 찍음(가장자리 또렷). 위쪽 반은 밝게, 가운데 잎맥 */
  leaf(g, cx, cy, len, wid, ang, col, hi, vein) {
    const ca = Math.cos(ang), sa = Math.sin(ang), r = Math.ceil(len) + 1;
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const u = (x * ca + y * sa) / len, v = (-x * sa + y * ca) / wid;
      if (u * u + v * v > 1) continue;
      let c = col; if (vein && Math.abs(v) < 0.18 && u > -0.7) c = vein; else if (hi && v < -0.15 && u > -0.5) c = hi;
      g.fillStyle = c; g.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
    }
  },
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
    BX.F(g, x - tw / 2 - 1, base - 2, tw + 2, 2, trunk); BX.F(g, x + tw / 2 - 1, base - h * 0.55, 1, h * 0.55, shade(trunk, -0.35));
    BX.bush(g, x, base - h * 0.45, h * (wide || 0.8), h * 0.62, tones, R);
  },
  /* 큰 잎 화분(몬스테라·야자 느낌) */
  plant(g, x, base, s, potCol, tones, R, n) {
    const [dk, md, lt] = tones, k = n || 7;
    for (let i = 0; i < k; i++) {
      const a = -Math.PI / 2 + (i - (k - 1) / 2) * (1.9 / k) + (R() - 0.5) * 0.25, L = (9 + R() * 6) * s;
      const ex = x + Math.cos(a) * L * 0.55, ey = base - 7 * s + Math.sin(a) * L * 0.75;
      g.strokeStyle = dk; g.lineWidth = 1; g.beginPath(); g.moveTo(x, base - 6 * s); g.lineTo(Math.round(ex), Math.round(ey)); g.stroke();
      BX.leaf(g, ex + Math.cos(a) * 3 * s, ey + Math.sin(a) * 2 * s, 4.2 * s, 2 * s, a + (R() - 0.5) * 0.4, i % 2 ? md : dk, lt, i % 3 === 0 ? dk : null);
    }
    BX.pot2(g, x, base, 4 * s, 6 * s, potCol);
  },
  pot2(g, x, base, w, h, col) {
    const lt = shade(col, 0.25), dk = shade(col, -0.3);
    for (let y = 0; y < h; y++) { const ww = w - (y / h) * w * 0.25; BX.F(g, x - ww, base - h + y, ww * 2, 1, col); BX.F(g, x + ww - 1.5, base - h + y, 1.5, 1, dk); BX.F(g, x - ww, base - h + y, 1, 1, lt); }
    BX.F(g, x - w - 1, base - h - 1, w * 2 + 2, 2, lt); BX.F(g, x - w - 1, base - h + 1, w * 2 + 2, 1, dk);
  },
  /* 천장에 매단 화분 + 늘어진 덩굴 */
  hangPlant(g, x, y, tones, R, len, potCol) {
    const [dk, md, lt] = tones;
    BX.F(g, x, 0, 1, y, "rgba(30,30,40,.8)");
    BX.oval(g, x, y + 3, 5, 3, potCol || "#c9743a"); BX.F(g, x - 5, y + 1, 11, 1, shade(potCol || "#c9743a", 0.3));
    for (let i = 0; i < 5; i++) BX.vine(g, x - 5 + i * 2.4, y + 4, len * (0.4 + R() * 0.7), dk, i % 2 ? md : lt, R);
    BX.bush(g, x, y + 3, 14, 6, tones, R, 6);
  },
  vine(g, x, y, len, stem, leaf, R, flower) {
    let cx = x;
    for (let i = 0; i < len; i++) { cx += (R() < 0.22 ? (R() < 0.5 ? -1 : 1) : 0) * (i > 2 ? 1 : 0); BX.F(g, cx, y + i, 1, 1, stem); if (i % 3 === 1) BX.F(g, cx + (i % 6 === 1 ? 1 : -2), y + i, 2, 1, leaf); if (flower && i % 7 === 5 && R() < 0.6) BX.F(g, cx + (i % 2 ? 1 : -1), y + i, 1, 1, flower); }
    BX.F(g, cx - 1, y + len, 2, 2, leaf);
  },
  /* 등나무처럼 늘어진 꽃송이 덩굴 */
  wisteria(g, x, y, len, stem, cols, R) {
    let cx = x; BX.F(g, cx, y, 1, 2, stem);
    for (let i = 0; i < len; i++) { cx += R() < 0.2 ? (R() < 0.5 ? -1 : 1) : 0; const w = Math.max(1, Math.round(3.2 * (1 - i / len))); BX.F(g, cx - Math.floor(w / 2), y + 2 + i, w, 1, cols[Math.min(cols.length - 1, Math.floor(i / len * cols.length))]); if (R() < 0.25) BX.P(g, cx - w, y + 2 + i, cols[0]); }
  },
  flowers(g, x, y, w, h, cols, R, n) { for (let i = 0; i < (n || 6); i++) { const fx = x + R() * w, fy = y + R() * h, c = cols[Math.floor(R() * cols.length)]; BX.F(g, fx - 1, fy, 3, 1, c); BX.F(g, fx, fy - 1, 1, 3, c); BX.P(g, fx, fy, "#fff6c0"); } },
  grass(g, x, y, w, col, lt, R, dens) { for (let i = 0; i < w; i++) { if (R() > (dens || 0.6)) continue; const h = 1 + Math.floor(R() * 3); BX.F(g, x + i, y - h, 1, h, R() < 0.3 ? lt : col); } },
  skyline(g, base, minH, maxH, col, wins, R, wMin, wMax, litP) {
    let x = -4 + R() * 6; const roofs = [];
    while (x < BW) {
      const bw = Math.round(wMin + R() * (wMax - wMin)), bh = Math.round(minH + R() * (maxH - minH));
      BX.F(g, x, base - bh, bw, bh, col);
      const r = R();
      if (r < 0.22) { const ah = 4 + Math.round(R() * 4), ay = base - bh - 3 - Math.round(R() * 5); BX.F(g, x + Math.round(bw * 0.4), ay, 1, ah + (base - bh - ay - ah) + 1, col); roofs.push([x + Math.round(bw * 0.4), ay - 1]); }
      else if (r < 0.4 && bw > 9) { BX.F(g, x + 2, base - bh - 3, bw - 4, 3, col); }
      else if (r < 0.5 && bw > 8) { BX.F(g, x + bw - 5, base - bh - 4, 3, 4, col); }
      if (wins) for (let wy = base - bh + 2; wy < base - 2; wy += 3) for (let wx = x + 1; wx < x + bw - 1; wx += 2) if (R() < (litP || 0.18)) BX.F(g, wx, wy, 1, 1, wins[Math.floor(R() * wins.length)]);
      x += bw + Math.round(R() * 2);
    }
    return roofs;
  },
  ridge(g, base, top, amp, col, R, step) {
    g.fillStyle = col; let y = top;
    for (let x = 0; x <= BW; x += 1) { if (x % step === 0) y = Math.max(top - amp, Math.min(top + amp, y + (R() - 0.5) * amp)); g.fillRect(x, Math.round(y), 1, base - Math.round(y)); }
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
      for (let xx = (row % 2 ? bw / 2 : 0); xx < w; xx += bw) { BX.F(g, x + xx, y + yy, 1, Math.min(bh, h - yy), line); if (hi && R() < 0.5) BX.F(g, x + xx + 1, y + yy + 1, bw - 2, 1, hi); }
    }
  },
  moss(g, x, y, w, col, lt, R) { for (let i = 0; i < w; i++) { const d = R() < 0.3 ? 2 + Math.floor(R() * 3) : 1; BX.F(g, x + i, y, 1, d, col); if (R() < 0.3) BX.F(g, x + i, y - 1, 1, 1, lt); } },
  /* 원근 바닥: 소실점으로 모이는 줄 + 가까울수록 넓어지는 가로줄 */
  floor(g, y0, c1, c2, line, vx, R, tiles, spread) {
    BX.vg(g, 0, y0, BW, BH - y0, [[0, c1], [1, c2]]);
    g.fillStyle = line; const sp = spread || 9;
    for (let k = -16; k <= 16; k++) { const xa = vx + k * sp, xb = vx + k * sp * 4; for (let y = y0; y < BH; y++) { const t = (y - y0) / (BH - y0); g.fillRect(Math.round(xa + (xb - xa) * t), y, 1, 1); } }
    let yy = y0, d = 3; while (yy < BH) { BX.F(g, 0, Math.round(yy), BW, 1, line); yy += d; d *= tiles || 1.32; }
  },
  /* 원근 체크 타일 바닥: 지평선을 바닥 위쪽에 두고 줄마다 깊이를 계산 (가까울수록 크게) */
  checker(g, y0, cA, cB, vx, tileW, R, tileH, hz) {
    const yh = y0 - (hz || 40), dB = BH - yh, depthK = dB * dB / (tileH || 11), colK = dB / (tileW || 22);
    for (let y = y0; y < BH; y++) {
      const d = y - yh + 0.5, zi = Math.floor(depthK / d); let runX = 0, runC = null;
      for (let x = 0; x <= BW; x++) {
        const c = x === BW ? null : ((Math.floor((x - vx) * colK / d) + zi) & 1) ? cA : cB;
        if (c !== runC) { if (runC) { g.fillStyle = runC; g.fillRect(runX, y, x - runX, 1); } runC = c; runX = x; }
      }
    }
  },
  /* 원근 판자 바닥(마루·데크): 세로줄은 소실점으로, 판자 이음새는 엇갈리게 */
  planks(g, y0, c1, c2, line, vx, R, w, hz) {
    BX.vg(g, 0, y0, BW, BH - y0, [[0, c1], [1, c2]]);
    const yh = y0 - (hz || 40), dB = BH - yh, colK = dB / (w || 18), depthK = dB * dB / 26;
    g.fillStyle = line;
    for (let y = y0; y < BH; y++) {
      const d = y - yh + 0.5, zi = Math.floor(depthK / d), zprev = Math.floor(depthK / (d - 1));
      for (let x = 0; x < BW; x++) { const ci = Math.floor((x - vx) * colK / d), cp = Math.floor((x - 1 - vx) * colK / d); if (ci !== cp) g.fillRect(x, y, 1, 1); else if (zi !== zprev && ((ci + zi) % 3 === 0)) g.fillRect(x, y, 1, 1); }
    }
  },
  /* 바닥에 비친 위쪽 풍경(반들반들한 바닥) */
  gloss(L, a, y0, rgb) {
    y0 = y0 || BFL; const h = BH - y0, t = document.createElement("canvas"); t.width = BW; t.height = h; const tg = t.getContext("2d");
    if (!tg || !tg.drawImage) return;
    tg.save(); tg.translate(0, h); tg.scale(1, -1); [L.far, L.mid, L.back].forEach(l => tg.drawImage(l.c, 0, y0 - h, BW, h, 0, 0, BW, h)); tg.restore();
    tg.globalCompositeOperation = "destination-in"; const gr = tg.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(0.75, "rgba(0,0,0,0)"); tg.fillStyle = gr; tg.fillRect(0, 0, BW, h);
    if (rgb) { tg.globalCompositeOperation = "source-atop"; tg.fillStyle = `rgba(${rgb},.25)`; tg.fillRect(0, 0, BW, h); }
    L.back.g.drawImage(t, 0, y0);
  },
  pot(g, x, y, s, potCol, tones, R) { BX.plant(g, x, y, s * 0.8, potCol, tones, R, 5); },
  winFrame(g, x, y, w, h, frame, mullions, sill, hi) {
    g.clearRect(x, y, w, h);
    BX.F(g, x - 2, y - 2, w + 4, 2, frame); BX.F(g, x - 2, y + h, w + 4, 3, sill || frame); BX.F(g, x - 2, y, 2, h, frame); BX.F(g, x + w, y, 2, h, frame);
    for (let i = 1; i < (mullions || 1); i++) BX.F(g, x + Math.round(w * i / mullions) - 1, y, 2, h, frame);
    if (hi) { BX.F(g, x - 2, y - 2, w + 4, 1, hi); BX.F(g, x - 2, y + h, w + 4, 1, hi); }
  },
  glass(g, x, y, w, h, a) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = `rgba(200,220,255,${(a || 1) * 0.05})`; g.fillRect(x, y, w, h); g.fillStyle = `rgba(255,255,255,${(a || 1) * 0.07})`; for (let i = 0; i < Math.max(2, Math.round(w / 50)); i++) { const sx = x + w * (0.1 + i * 0.37) % w; g.beginPath(); g.moveTo(sx, y); g.lineTo(sx + 9, y); g.lineTo(sx - 18 + 9, y + h); g.lineTo(sx - 18, y + h); g.closePath(); g.fill(); g.fillRect(sx + 12, y, 2, h); } g.restore(); },
  /* 천장 펜던트 등 + 빛 원뿔 */
  pendant(g, x, y, col, rgb, coneTo, a) {
    BX.F(g, x, 0, 1, y, "rgba(20,20,26,.9)"); BX.F(g, x - 4, y, 9, 2, col); BX.F(g, x - 5, y + 2, 11, 2, shade(col, -0.25)); BX.F(g, x - 3, y + 4, 7, 1, "#fff4d0");
    BX.glow(g, x, y + 5, 16, rgb, 0.35);
    if (coneTo) BX.shaft(g, x - 3, 7, x - coneTo * 0.45, coneTo * 0.9, y + 4, BFL + 8, rgb, a || 0.12);
  },
  column(g, x, y0, y1, w, base, lt, dk, cap) {
    BX.F(g, x, y0, w, y1 - y0, base); BX.F(g, x + 1, y0, 2, y1 - y0, lt); BX.F(g, x + w - 2, y0, 2, y1 - y0, dk);
    for (let k = 4; k < w - 3; k += 3) BX.F(g, x + k, y0 + 3, 1, y1 - y0 - 6, shade(base, -0.12));
    BX.F(g, x - 2, y0, w + 4, 3, cap || lt); BX.F(g, x - 1, y0 + 3, w + 2, 1, dk); BX.F(g, x - 2, y1 - 4, w + 4, 4, cap || lt); BX.F(g, x - 2, y1 - 1, w + 4, 1, dk);
  },
  marble(g, x, y, w, h, base, vein, R, n) { BX.F(g, x, y, w, h, base); g.fillStyle = vein; for (let i = 0; i < (n || Math.round(w * h / 90)); i++) { let vx = x + R() * w, vy = y + R() * h; for (let k = 0; k < 6 + R() * 10; k++) { g.fillRect(Math.round(vx), Math.round(vy), 1, 1); vx += (R() - 0.3) * 2; vy += (R() - 0.5) * 1.6; if (vx > x + w || vy < y || vy > y + h) break; } } },
  /* 사람 없는 의자·책상 같은 작은 소품 */
  chair(g, x, y, col) { BX.F(g, x, y, 8, 2, col); BX.F(g, x + 1, y - 9, 6, 9, shade(col, -0.15)); BX.F(g, x + 3, y + 2, 2, 5, "#14161c"); BX.F(g, x, y + 7, 8, 1, "#14161c"); },
  /* 근경 사무 의자(어두운 실루엣) */
  bigChair(g, x, y, s, col, hi) { BX.oval(g, x, y, 9 * s, 11 * s, col); BX.F(g, x - 9 * s, y + 8 * s, 18 * s, 4 * s, col); BX.F(g, x - 1.5 * s, y + 12 * s, 3 * s, 8 * s, col); BX.F(g, x - 10 * s, y + 20 * s, 20 * s, 2 * s, col); if (hi) { BX.F(g, x - 7 * s, y - 9 * s, 6 * s, 1, hi); BX.F(g, x - 8 * s, y + 8 * s, 14 * s, 1, hi); } },
  monitor(g, x, y, w, h, scr, R) { BX.F(g, x - 1, y - 1, w + 2, h + 2, "#12141c"); BX.F(g, x, y, w, h, scr); BX.F(g, x, y, w, 1, shade(scr, 0.35)); for (let i = 0; i < h - 2; i += 2) if (R() < 0.7) BX.F(g, x + 1, y + 1 + i, Math.round(R() * (w - 2)), 1, shade(scr, 0.25)); BX.F(g, x + w / 2 - 1, y + h + 1, 2, 2, "#12141c"); BX.F(g, x + w / 2 - 3, y + h + 3, 6, 1, "#12141c"); },
  text(g, s, x, y, col, px) { bgRec.texts.push([s, x * 2, y * 2, col, (px || 8) * 2]); },
};
/* 창밖 하늘: 0 저녁 노을, 1 깊은 밤, 2 새벽 */
const SKY = [
  { st: [[0, "#1a1e4a"], [0.45, "#6a3f74"], [0.8, "#e0786a"], [1, "#ffb37a"]], far: "#6e4f7e", far2: "#4c3a62", near: "#21193a", wins: ["#ffd9a0", "#ffb36b", "#fff0c8"], lit: 0.14, sun: [226, 0.6, 11, "#ffe2a8", "255,180,120"], stars: 8, haze: "255,160,140", cloud: ["#ffb0a0", "#d9788a", "#9a5070"] },
  { st: [[0, "#050816"], [0.5, "#111a44"], [1, "#2b3b70"]], far: "#2a3866", far2: "#1d2850", near: "#0f152c", wins: ["#ffd54a", "#ffb36b", "#6fd3ff", "#fff4c0"], lit: 0.24, moon: [150, 0.3, 7], stars: 70, haze: "60,80,150", cloud: null },
  { st: [[0, "#24345e"], [0.5, "#7a74a0"], [0.85, "#f0b0a0"], [1, "#ffd8a8"]], far: "#8a84a8", far2: "#67628a", near: "#2c2c4c", wins: ["#ffe8b0"], lit: 0.07, sun: [150, 0.68, 9, "#fff2c8", "255,215,160"], stars: 6, haze: "255,205,170", cloud: ["#ffe0d0", "#e8b0b8", "#b08aa0"] },
];
/* 창밖 원경(far)과 가까운 건물(mid). base = 땅선, 높이는 구역마다 다름 */
function skyScene(L, V, R, base, opt) {
  const k = SKY[V], f = L.far.g, m = L.mid.g, o = opt || {}; bgRec.city = true;
  BX.vg(f, 0, 0, BW, base + 4, k.st);
  if (k.stars) BX.stars(f, k.stars, base - 20, R);
  if (k.moon && !o.noSun) { const [mx, myf, mr] = o.moon || k.moon, my = Math.max(14, base * myf); BX.glow(f, mx, my, mr * 4.5, "200,215,255", 0.22); BX.disc(f, mx, my, mr, "#e8eeff"); BX.disc(f, mx + 2, my - 1, mr - 2, "#ffffff"); BX.P(f, mx - 2, my + 2, "#c8d0e8"); BX.P(f, mx + 1, my + 3, "#c8d0e8"); }
  if (k.sun && !o.noSun) { const [sx, syf, sr, sc, sg] = k.sun, sy = Math.min(base * syf, base - (o.h1 ? o.h1[1] : base * 0.55) - sr * 0.3); BX.glow(f, sx, sy, sr * 6, sg, 0.45); BX.disc(f, sx, sy, sr, sc); BX.disc(f, sx - 2, sy - 2, sr * 0.6, "#fffbe8"); }
  if (k.cloud) for (let i = 0; i < 4; i++) { const cx = 40 + i * 80 + R() * 30, cy = 20 + R() * (base * 0.35); BX.oval(f, cx, cy, 16 + R() * 14, 2 + R() * 2, k.cloud[1]); BX.oval(f, cx - 4, cy - 1, 10 + R() * 8, 1.5, k.cloud[0]); }
  BX.skyline(f, base, o.h1 ? o.h1[0] : 16, o.h1 ? o.h1[1] : base * 0.55, k.far, null, R, 6, 14);
  BX.haze(f, base * 0.45, base + 4, k.haze, 0, 0.35);
  BX.skyline(f, base, o.h2 ? o.h2[0] : 8, o.h2 ? o.h2[1] : base * 0.4, k.far2, k.wins.slice(0, 2), R, 8, 18, k.lit * 0.5);
  BX.haze(f, base - 14, base + 4, k.haze, 0, 0.3);
  const roofs = BX.skyline(m, base + 2, o.h3 ? o.h3[0] : 6, o.h3 ? o.h3[1] : base * 0.3, k.near, k.wins, R, 10, 22, k.lit);
  BX.tint(L.far.g, k.haze, 0.06);
  return Object.assign({ blink: roofs.map(([x, y]) => [x * 2 + 1, y * 2 + 1]) }, k);
}
/* 구역별 그림 (1): 로비 ~ 구내식당. (L, R, V) → L.far / L.mid / L.back / L.fore 에 그림, 돌려주는 값은 움직이는 장식 설정 */
const LEAF = { dk: ["#0a1a12", "#12301e", "#1e4a2c"], green: ["#1f5a32", "#3a8a4a", "#6fd36a"], deep: ["#16402a", "#2a6e3e", "#4fb35a"], pink: ["#7a1f3a", "#c9466a", "#ff8fa3"] };
/* 원근선이 한 소실점으로 모이는 바닥 줄 */
function vpLines(g, vx, vy, y0, sp, col, n) { g.fillStyle = col; for (let k = -(n || 18); k <= (n || 18); k++) { const xb = vx + k * sp; for (let y = y0; y < BH; y++) { const t = (y - vy) / (BH - vy); g.fillRect(Math.round(vx + (xb - vx) * t), y, 1, 1); } } }
function vpRows(g, vy, y0, col, step) { let y = y0, d = step || 2; while (y < BH) { BX.F(g, 0, Math.round(y), BW, 1, col); d *= 1 + 8 / (BH - vy); y += d; } }
/* 바닥 위 사다리꼴 깔개(카펫) */
function runner(g, cx, wTop, wBot, y0, col, edge, stripe) {
  for (let y = y0; y < BH; y++) { const t = (y - y0) / (BH - y0), w = wTop + (wBot - wTop) * t, x0 = Math.round(cx - w / 2), x1 = Math.round(cx + w / 2); BX.F(g, x0, y, x1 - x0, 1, (stripe && Math.floor(t * 9) % 3 === 1) ? stripe : col); BX.F(g, x0 + 1, y, 1, 1, edge); BX.F(g, x1 - 2, y, 1, 1, edge); }
}
/* 근경 큰 잎 무더기(어두운 실루엣, 가장자리만 살짝 밝게) */
function foreLeaves(g, x, y, n, s, tones, R, dir) {
  for (let i = 0; i < n; i++) { const a = (dir || -1) * (0.3 + R() * 1.2) - Math.PI / 2 * (R() < 0.5 ? 1 : 0.6), L = (8 + R() * 8) * s; BX.leaf(g, x + Math.cos(a) * L * 0.6, y + Math.sin(a) * L * 0.6, L * 0.55, L * 0.24, a, tones[i % 2], tones[2], tones[0]); }
}
/* 근경 큰 잎 화초: 아래에서 위로 부채처럼 펼친 긴 잎 (어두운 실루엣 + 가장자리 빛) */
function forePlant(g, x, base, s, tones, R, n) {
  const k = n || 9;
  for (let i = 0; i < k; i++) {
    const a = -Math.PI * (0.18 + 0.64 * i / (k - 1)) + (R() - 0.5) * 0.18, L = (20 + R() * 14) * s;
    for (let j = 0; j < L; j += 1.5) { const px = x + Math.cos(a) * j, py = base + Math.sin(a) * j + (j / L) * (j / L) * 9 * s; BX.F(g, px, py, 1, 1, tones[0]); }
    const cx = x + Math.cos(a) * L * 0.62, cy = base + Math.sin(a) * L * 0.62 + 3 * s;
    BX.leaf(g, cx, cy, L * 0.42, L * 0.15, a + 0.25 * (i % 2 ? 1 : -1), tones[i % 2], tones[2], tones[0]);
  }
}
const BG2_A = {
  lobby(L, R, V) {
    const b = L.back.g, fo = L.fore.g;
    const k = skyScene(L, V, R, 100, { h1: [24, 66], h2: [14, 50], h3: [6, 32] });
    BX.F(b, 0, 0, BW, BFL, "#262b44");
    BX.winFrame(b, 64, 14, 104, 84, "#151a2e", 3, "#2a2f48", "#3a4266"); BX.winFrame(b, 186, 14, 108, 84, "#151a2e", 3, "#2a2f48", "#3a4266");
    BX.F(b, 64, 42, 104, 2, "#151a2e"); BX.F(b, 186, 42, 108, 2, "#151a2e");
    BX.glass(b, 64, 14, 104, 84); BX.glass(b, 186, 14, 108, 84);
    // 천장과 금빛 테두리, 매입 조명
    BX.vg(b, 0, 0, BW, 11, [[0, "#0a0d1a"], [1, "#171c32"]]); BX.F(b, 0, 11, BW, 1, "#c9a43a"); BX.F(b, 0, 12, BW, 1, "#5a4618");
    for (let x = 60; x < BW; x += 34) { BX.F(b, x, 4, 6, 2, "#fff0c8"); BX.glow(b, x + 3, 6, 9, "255,226,170", 0.3); }
    // 창 아래 대리석 벽
    BX.marble(b, 0, 98, BW, 29, "#36314c", "#45405e", R, 26); BX.F(b, 0, 98, BW, 2, "#c9a43a"); BX.F(b, 0, 100, BW, 1, "#5a4618"); BX.F(b, 0, 124, BW, 3, "#1c1a2a");
    for (const x of [48, 170, 296]) BX.column(b, x, 13, BFL, 14, "#4a4562", "#6e6890", "#2c283e", "#c9a43a");
    // 덩굴(창 위 테두리에서)
    for (const x of [80, 92, 142, 204, 258, 270]) BX.vine(b, x, 13, 6 + R() * 16, "#1f5a32", R() < 0.5 ? "#4fb35a" : "#6fd36a", R, R() < 0.4 ? "#ff8fb8" : null);
    // 샹들리에
    BX.pendant(b, 118, 22, "#c9a43a", "255,220,150", 70, 0.11); BX.pendant(b, 240, 22, "#c9a43a", "255,220,150", 70, 0.11);
    // 안내 데스크
    BX.F(b, 66, 104, 86, 23, "#4a2e1e"); BX.F(b, 66, 104, 86, 1, "#2a1a10"); for (let x = 70; x < 150; x += 10) BX.F(b, x, 105, 1, 21, "#56362a");
    BX.F(b, 63, 100, 92, 4, "#8a6242"); BX.F(b, 63, 100, 92, 1, "#b8895c"); BX.F(b, 63, 103, 92, 1, "#5a3a26");
    BX.F(b, 72, 107, 74, 15, "#24170e"); BX.F(b, 72, 107, 74, 1, "#c9a43a"); BX.F(b, 72, 121, 74, 1, "#c9a43a");
    BX.monitor(b, 126, 89, 13, 8, "#3b7bd6", R); BX.glow(b, 132, 93, 16, "111,170,255", 0.16);
    BX.F(b, 75, 93, 5, 7, "#d9e4f0"); BX.F(b, 76, 93, 1, 6, "#ffffff"); BX.leaf(b, 74, 88, 4, 1.5, -2.2, "#2a7a3a", "#5fbf6a"); BX.leaf(b, 81, 88, 4, 1.5, -0.9, "#2a7a3a", "#5fbf6a"); BX.flowers(b, 72, 84, 10, 6, ["#ff8fb8", "#ffd54a", "#ffffff"], R, 5);
    BX.F(b, 110, 98, 4, 2, "#c9a43a"); BX.P(b, 111, 97, "#ffe08a");
    BX.text(b, "야근상사 본사 타워", 109, 114.5, "#ffd54a", 7);
    BX.plant(b, 284, BFL, 2.1, "#3a3550", LEAF.green, R, 9);
    BX.plant(b, 158, BFL, 1.3, "#3a3550", LEAF.green, R, 6);
    // 바닥: 반들반들한 대리석 + 붉은 카펫
    BX.checker(b, BFL, "#3a3f5e", "#30344f", 191, 30, R, 13);
    BX.gloss(L, 0.3, BFL);
    runner(b, 191, 30, 120, BFL, "#7a1a26", "#c9a43a", "#6a1520");
    BX.pool(b, 118, 140, 46, 8, "255,220,150", 0.14); BX.pool(b, 240, 140, 46, 8, "255,220,150", 0.14);
    // 근경: 매단 화분, 아래 큰 잎
    BX.hangPlant(fo, 66, 14, LEAF.dk, R, 30, "#2a1c14");
    forePlant(fo, 60, 186, 1.5, LEAF.dk, R, 9);
    foreLeaves(fo, 322, 184, 6, 1.2, LEAF.dk, R, 1);
    return { dust: "255,226,170", floorGlow: "255,226,170", blink: k.blink };
  },
  office(L, R, V) {
    const b = L.back.g, fo = L.fore.g;
    const k = skyScene(L, V, R, 64, { h1: [12, 42], h2: [8, 32], h3: [4, 20] });
    BX.vg(b, 0, 0, BW, BFL, [[0, "#1c2340"], [1, "#283152"]]);
    BX.winFrame(b, 52, 12, 270, 50, "#10152a", 6, "#2a3150", "#3a4266"); BX.glass(b, 52, 12, 270, 50);
    BX.F(b, 0, 0, BW, 8, "#12172a"); for (let x = 0; x < BW; x += 16) BX.F(b, x, 0, 1, 8, "#1a2036");
    for (let x = 58; x < BW; x += 54) { BX.F(b, x, 6, 30, 2, "#eef4ff"); BX.F(b, x, 8, 30, 1, "#9aa6c8"); BX.glow(b, x + 15, 9, 20, "220,232,255", 0.14); BX.shaft(b, x, 30, x - 12, 54, 9, BFL + 10, "220,232,255", 0.04); }
    BX.F(b, 0, 64, BW, 2, "#3a4266");
    // 뒷줄 칸막이와 모니터
    for (let x = 50; x < BW; x += 46) { BX.monitor(b, x + 12, 70, 14, 9, R() < 0.5 ? "#3b7bd6" : "#2a9ad6", R); BX.glow(b, x + 19, 74, 14, "111,190,255", 0.15); }
    BX.F(b, 0, 80, BW, 20, "#46507a"); BX.F(b, 0, 80, BW, 2, "#6a7598"); BX.speck(b, 0, 82, BW, 18, "#4e5984", 260, R);
    for (let x = 48; x < BW; x += 46) { BX.F(b, x, 80, 2, 20, "#353d60"); for (let i = 0; i < 2; i++) BX.F(b, x + 6 + R() * 30, 85 + R() * 8, 3, 3, ["#ffd54a", "#ff8fb8", "#7fe3a0"][Math.floor(R() * 3)]); }
    // 벽시계: 늦은 시각
    BX.disc(b, 168, 30, 7, "#e9edf6"); BX.ring(b, 168, 30, 7, "#5b6274"); BX.F(b, 168, 25, 1, 5, "#1b1f2a"); BX.F(b, 168, 30, 4, 1, "#1b1f2a"); BX.P(b, 168, 30, "#d6403d");
    // 앞줄 책상 (양쪽)
    const desk = x => { BX.F(b, x, 101, 52, 3, "#7a6048"); BX.F(b, x, 101, 52, 1, "#a07e5c"); BX.F(b, x + 2, 104, 3, 21, "#4a3a2c"); BX.F(b, x + 47, 104, 3, 21, "#4a3a2c"); BX.monitor(b, x + 18, 87, 17, 11, R() < 0.5 ? "#6fd3ff" : "#3b7bd6", R); BX.glow(b, x + 26, 92, 26, "111,211,255", 0.17); BX.F(b, x + 5, 96, 8, 5, "#e9edf6"); BX.F(b, x + 5, 95, 8, 1, "#ffffff"); BX.F(b, x + 6, 93, 7, 2, "#f4f1e6"); BX.F(b, x + 40, 97, 4, 4, "#d6403d"); BX.F(b, x + 44, 98, 1, 2, "#d6403d"); BX.F(b, x + 15, 99, 20, 2, "#2a2e3c"); BX.chair(b, x + 22, 112, "#2a2e3c"); };
    desk(54); desk(250);
    // 가운데 정수기와 화분
    BX.F(b, 146, 98, 12, 27, "#d9e0ee"); BX.F(b, 146, 98, 12, 1, "#ffffff"); BX.F(b, 156, 99, 2, 26, "#aab4c8"); BX.F(b, 147, 84, 10, 14, "#7ab8e8"); BX.F(b, 148, 85, 2, 12, "#b8e0ff"); BX.F(b, 149, 82, 6, 2, "#5a8ab8"); BX.F(b, 149, 106, 2, 2, "#4a7ae8"); BX.F(b, 153, 106, 2, 2, "#e84a4a");
    BX.plant(b, 128, BFL, 1.4, "#c9c2a8", LEAF.green, R, 6);
    // 바닥: 카펫 타일
    BX.checker(b, BFL, "#2a3254", "#2e375c", 186, 20, R, 9); BX.speck(b, 0, BFL, BW, BH - BFL, "#252c4a", 320, R);
    for (let x = 58; x < BW; x += 54) BX.pool(b, x + 15, 140, 34, 7, "200,220,255", 0.08);
    // 근경: 책상 모서리 + 빛나는 모니터, 오른쪽 의자 등
    BX.F(fo, 44, 150, 40, 30, "#0c0f1a"); BX.F(fo, 44, 150, 40, 2, "#20263c"); BX.F(fo, 52, 135, 22, 15, "#0c0f1a"); BX.F(fo, 54, 137, 18, 11, "#1e4a7a"); BX.F(fo, 54, 137, 18, 1, "#4a8ad6"); BX.glow(fo, 63, 142, 18, "111,211,255", 0.22); BX.F(fo, 76, 144, 5, 6, "#0c0f1a");
    return { dust: "200,220,255", floorGlow: "180,210,255", blink: k.blink };
  },
  pantry(L, R, V) {
    const b = L.back.g, fo = L.fore.g;
    const k = skyScene(L, V, R, 48, { h1: [8, 26], h2: [6, 20], h3: [3, 12], noSun: V === 1 });
    BX.vg(b, 0, 0, BW, BFL, [[0, "#3e3242"], [1, "#4a3c48"]]);
    // 흰 타일 벽
    BX.F(b, 0, 36, BW, 60, "#dfe4ea"); for (let y = 36; y < 96; y += 4) { BX.F(b, 0, y, BW, 1, "#bcc4d0"); for (let x = (y / 4) % 2 ? 0 : 3; x < BW; x += 6) BX.F(b, x, y, 1, 4, "#bcc4d0"); }
    BX.haze(b, 36, 96, "60,40,50", 0.18, 0);
    // 위 찬장
    const cab = (x, n) => { for (let i = 0; i < n; i++) { const cx = x + i * 24; BX.F(b, cx, 4, 23, 30, "#c9a26b"); BX.F(b, cx, 4, 23, 1, "#e6c48e"); BX.F(b, cx + 2, 7, 19, 24, "#d4ae78"); BX.F(b, cx + 3, 8, 17, 22, "#c29a62"); BX.F(b, cx + (i % 2 ? 4 : 17), 18, 2, 6, "#6a4a28"); BX.F(b, cx, 33, 23, 1, "#7a5a32"); } BX.F(b, x, 34, n * 24, 3, "rgba(40,20,20,.35)"); };
    cab(52, 4); cab(196, 3);
    // 창 + 창턱 허브 화분
    BX.winFrame(b, 152, 12, 38, 30, "#2a2030", 2, "#e6dccb", "#5a4a58");
    for (const x of [158, 172, 184]) { BX.F(b, x - 3, 38, 7, 4, "#c9743a"); BX.F(b, x - 3, 38, 7, 1, "#e0905a"); BX.bush(b, x, 38, 8, 6, LEAF.green, R, 4); }
    // 선반과 머그컵
    BX.F(b, 60, 52, 70, 2, "#8a6a4a"); BX.F(b, 60, 54, 70, 1, "#5a4232");
    ["#ff6b6b", "#ffd54a", "#6fd3ff", "#ffffff", "#7fe3a0", "#c9a6ff"].forEach((c, i) => { BX.F(b, 64 + i * 11, 45, 6, 7, c); BX.F(b, 64 + i * 11, 45, 6, 1, shade(c, 0.4)); BX.F(b, 70 + i * 11, 47, 2, 3, c); });
    BX.F(b, 204, 52, 60, 2, "#8a6a4a"); BX.F(b, 204, 54, 60, 1, "#5a4232");
    ["#d6403d", "#ffb36b", "#3b7bd6", "#7fe3a0", "#ffd54a"].forEach((c, i) => { const h = 8 + (i % 3) * 2; BX.F(b, 208 + i * 11, 52 - h, 8, h, c); BX.F(b, 208 + i * 11, 52 - h, 8, 1, shade(c, 0.4)); BX.F(b, 210 + i * 11, 52 - h + 3, 4, 2, "#ffffff"); });
    // 조리대
    BX.F(b, 0, 96, BW, 4, "#efece4"); BX.F(b, 0, 96, BW, 1, "#ffffff"); BX.F(b, 0, 99, BW, 1, "#9a948a");
    BX.F(b, 0, 100, BW, 25, "#7a5a3e"); for (let x = 0; x < BW; x += 26) { BX.F(b, x, 100, 1, 25, "#5a4030"); BX.F(b, x + 2, 102, 22, 21, "#866446"); BX.F(b, x + 11, 104, 4, 1, "#d9c08a"); } BX.F(b, 0, 125, BW, 2, "#2a2026");
    // 커피머신(김이 오름), 전자레인지, 주전자, 싱크대, 과일, 간식
    BX.F(b, 80, 72, 22, 24, "#22252e"); BX.F(b, 80, 72, 22, 2, "#3a3e4a"); BX.F(b, 84, 76, 14, 6, "#6fd3ff"); BX.F(b, 85, 77, 5, 1, "#e9f8ff"); BX.F(b, 88, 84, 6, 4, "#14161c"); BX.F(b, 87, 89, 8, 7, "#f4f1e6"); BX.F(b, 88, 90, 6, 2, "#6a3a1f"); BX.glow(b, 91, 79, 16, "111,211,255", 0.18);
    BX.F(b, 110, 82, 28, 14, "#b9c1d0"); BX.F(b, 110, 82, 28, 1, "#e6ecf6"); BX.F(b, 112, 84, 17, 10, "#2a2e38"); BX.F(b, 113, 85, 9, 3, "rgba(255,213,74,.35)"); BX.F(b, 131, 85, 5, 2, "#7fe3a0"); BX.F(b, 131, 89, 5, 1, "#5b6274"); BX.F(b, 131, 91, 5, 1, "#5b6274");
    BX.F(b, 143, 88, 9, 8, "#d6403d"); BX.F(b, 143, 88, 9, 1, "#ff7a6a"); BX.F(b, 141, 90, 2, 4, "#d6403d"); BX.F(b, 146, 86, 3, 2, "#2a2e38");
    BX.F(b, 160, 95, 30, 2, "#9aa3b8"); BX.F(b, 173, 84, 2, 11, "#c9ced8"); BX.F(b, 173, 84, 8, 2, "#c9ced8"); BX.F(b, 180, 86, 1, 2, "#6fd3ff");
    BX.oval(b, 206, 93, 8, 3, "#c9a26b"); BX.disc(b, 202, 90, 2.5, "#ff6b6b"); BX.disc(b, 207, 89, 2.5, "#ffd54a"); BX.disc(b, 211, 90, 2.5, "#7fe3a0"); BX.F(b, 205, 85, 4, 2, "#ffe08a");
    for (let i = 0; i < 4; i++) { BX.F(b, 222 + i * 9, 87, 7, 9, ["#ff8fa3", "#ffd54a", "#6fd3ff", "#c9a6ff"][i]); BX.F(b, 223 + i * 9, 89, 5, 2, "#ffffff"); }
    // 냉장고
    BX.F(b, 274, 20, 42, 105, "#dfe6f3"); BX.F(b, 274, 20, 42, 2, "#ffffff"); BX.F(b, 314, 22, 2, 103, "#aab4c8"); BX.F(b, 275, 62, 39, 1, "#9aa3b8"); BX.F(b, 308, 30, 2, 18, "#9aa3b8"); BX.F(b, 308, 68, 2, 24, "#9aa3b8");
    BX.F(b, 280, 28, 7, 6, "#ff6b6b"); BX.F(b, 290, 36, 6, 6, "#ffd54a"); BX.F(b, 282, 44, 8, 7, "#fff6a8"); BX.F(b, 283, 46, 6, 1, "#8a7a3a"); BX.F(b, 283, 48, 4, 1, "#8a7a3a"); BX.disc(b, 296, 72, 2, "#6fd3ff"); BX.F(b, 280, 74, 10, 8, "#ffffff"); BX.F(b, 281, 76, 7, 1, "#8d97b6");
    // 펜던트 등
    BX.pendant(b, 104, 40, "#2a2e38", "255,213,120", 60, 0.13); BX.pendant(b, 236, 40, "#2a2e38", "255,213,120", 60, 0.13);
    // 바닥
    BX.checker(b, BFL, "#5a4a46", "#4a3c3a", 190, 22, R, 11); BX.gloss(L, 0.22, BFL, "255,220,180");
    BX.pool(b, 104, 140, 40, 8, "255,213,120", 0.16); BX.pool(b, 236, 140, 40, 8, "255,213,120", 0.16);
    // 근경: 오른쪽 조리대 끝 머그잔, 왼쪽 위 펜던트 그림자
    BX.F(fo, 62, 0, 1, 14, "#0a0a10"); BX.F(fo, 54, 14, 17, 4, "#0e0e16"); BX.F(fo, 52, 18, 21, 3, "#16161e"); BX.F(fo, 56, 21, 13, 1, "#ffe8a8"); BX.glow(fo, 62, 22, 14, "255,213,120", 0.3);
    return { steam: [[91 * 2, 70 * 2], [148 * 2, 84 * 2]], dust: "255,230,190", floorGlow: "255,226,170", blink: [] };
  },
  meeting(L, R, V) {
    const b = L.back.g, fo = L.fore.g;
    const k = skyScene(L, V, R, 80, { h1: [16, 52], h2: [10, 40], h3: [6, 24] });
    BX.vg(b, 0, 0, BW, BFL, [[0, "#2a2140"], [1, "#221a34"]]);
    BX.F(b, 0, 82, BW, 45, "#3a2a26"); for (let x = 0; x < BW; x += 20) BX.F(b, x, 82, 1, 45, "#2c201c"); BX.F(b, 0, 82, BW, 2, "#5a4232"); BX.F(b, 0, 124, BW, 3, "#1e1614");
    // 블라인드 창
    BX.winFrame(b, 54, 12, 78, 64, "#1a1428", 2, "#4a3a5a", "#3a2f58");
    for (let y = 13; y < 76; y += 4) { BX.F(b, 54, y, 78, 2, "rgba(206,198,232,.62)"); BX.F(b, 54, y, 78, 1, "rgba(240,236,255,.75)"); }
    BX.F(b, 92, 12, 1, 64, "rgba(240,236,255,.5)");
    // 화이트보드
    BX.F(b, 141, 13, 98, 62, "#9aa3b8"); BX.F(b, 143, 15, 94, 58, "#f4f6fb"); BX.F(b, 139, 75, 102, 3, "#8d97b6"); BX.F(b, 150, 74, 6, 1, "#d6403d"); BX.F(b, 158, 74, 6, 1, "#3b7bd6"); BX.F(b, 166, 74, 6, 1, "#2a2e38");
    let px = 150, py = 58; b.fillStyle = "#3b7bd6"; for (let i = 0; i < 6; i++) { const nx = px + 12, ny = Math.max(24, Math.min(64, py + (R() - 0.62) * 18)); for (let s = 0; s <= 12; s++) b.fillRect(Math.round(px + s), Math.round(py + (ny - py) * s / 12), 1, 1); px = nx; py = ny; }
    BX.F(b, 216, 20, 12, 10, "#fff6a8"); BX.F(b, 218, 23, 8, 1, "#8a7a3a"); BX.F(b, 218, 25, 6, 1, "#8a7a3a"); BX.F(b, 200, 18, 11, 9, "#ffc8d8");
    BX.text(b, "결론: 다음 회의에서", 186, 67, "#d6403d", 6.5);
    // 벽걸이 TV
    BX.F(b, 248, 14, 66, 44, "#141020"); BX.F(b, 250, 16, 62, 40, "#2a2050"); BX.glow(b, 281, 36, 34, "160,130,255", 0.22);
    for (let i = 0; i < 4; i++) BX.F(b, 258 + i * 12, 48 - i * 7, 8, 7 + i * 7, ["#7c5cff", "#6fd3ff", "#ffd54a", "#7fe3a0"][i]);
    BX.F(b, 254, 20, 24, 2, "#e9edf6");
    // 천장 프로젝터
    BX.F(b, 0, 0, BW, 5, "#161226"); BX.F(b, 189, 5, 2, 4, "#2a2e38"); BX.F(b, 182, 9, 16, 6, "#3a3e48"); BX.F(b, 182, 9, 16, 1, "#5a5e6a"); BX.disc(b, 186, 12, 2, "#c8f0ff");
    // 의자 등받이 + 긴 탁자 + 노트북
    for (let x = 46; x < BW; x += 34) { BX.F(b, x, 86, 14, 14, "#1b1f2a"); BX.F(b, x + 1, 87, 12, 2, "#2e3446"); }
    BX.F(b, 30, 99, 292, 6, "#5a3a26"); BX.F(b, 30, 99, 292, 1, "#8a6242"); BX.F(b, 30, 104, 292, 1, "#2a1a10");
    for (let x = 52; x < BW; x += 68) { BX.F(b, x, 92, 14, 7, "#2a2e3c"); BX.F(b, x + 1, 93, 12, 5, "#6fa8ff"); BX.glow(b, x + 7, 95, 12, "111,170,255", 0.15); BX.F(b, x - 1, 98, 16, 1, "#9aa3b8"); BX.F(b, x + 22, 96, 4, 3, "#f4f1e6"); BX.F(b, x + 30, 97, 10, 2, "#e9edf6"); }
    for (const x of [60, 300]) { BX.F(b, x, 105, 3, 20, "#3a2618"); }
    BX.plant(b, 316, BFL, 1.5, "#d9d2c0", LEAF.green, R, 7);
    // 바닥: 보라 카펫 + 블라인드 사이 달빛 줄무늬
    BX.floor(b, BFL, "#3a2c4c", "#241c34", "rgba(15,10,25,.3)", 190, R); BX.speck(b, 0, BFL, BW, BH - BFL, "#43345a", 200, R);
    for (let i = 0; i < 7; i++) BX.shaft(b, 56 + i * 11, 6, 96 + i * 22, 12, BFL, BH, "200,200,255", 0.07);
    // 근경: 왼쪽 아래 의자
    BX.bigChair(fo, 62, 150, 1.25, "#0c0a14", "#2a2040");
    return { beam: [190 * 2, 14 * 2, 190 * 2, 70 * 2, 110], dust: "255,250,220", floorGlow: "200,180,255", blink: k.blink };
  },
  server(L, R, V) {
    const f = L.far.g, m = L.mid.g, b = L.back.g, fo = L.fore.g, leds = [];
    const vx = 186, vy = 64;
    // 원경: 끝없는 랙 통로, 끝에 밝은 문, 파란 안개
    BX.vg(f, 0, 0, BW, BH, [[0, "#03070c"], [0.45, "#0a1824"], [1, "#050c14"]]);
    for (let x = 0; x < BW; x++) { const d = Math.abs(x - vx); if (d < 9) continue; const top = vy - d * 0.78, bot = vy + d * 0.62, band = Math.floor(Math.log(d) * 6); BX.F(f, x, top, 1, bot - top, band % 2 ? "#0f1e2a" : "#132634"); for (let y = top + 2; y < bot - 2; y += 3) if (R() < 0.12) BX.P(f, x, y, R() < 0.7 ? "#3fae7a" : "#2a7ab0"); }
    for (let x = 0; x < BW; x++) { const d = Math.abs(x - vx); const top = vy - Math.max(9, d) * 0.78; BX.F(f, x, 0, 1, top, "#070e16"); const bot = vy + Math.max(9, d) * 0.62; BX.F(f, x, bot, 1, BH - bot, "#0c161e"); }
    BX.F(f, vx - 9, vy - 7, 18, 13, "#8fe6ff"); BX.F(f, vx - 7, vy - 5, 14, 11, "#d8f8ff"); BX.glow(f, vx, vy, 70, "90,210,255", 0.4);
    for (let i = 0; i < 6; i++) { const t = i / 6; BX.F(f, vx - 9 - t * 140, vy - 7 - t * 110, 2 + t * 6, 1, "rgba(120,230,255,.4)"); BX.F(f, vx + 7 + t * 140, vy - 7 - t * 110, 2 + t * 6, 1, "rgba(120,230,255,.4)"); }
    BX.haze(f, 0, BH, "40,150,200", 0.08, 0.12); BX.glow(f, vx, vy + 20, 120, "40,140,190", 0.18);
    // 중경: 바닥 안개
    BX.haze(m, 80, 135, "80,190,240", 0, 0.12);
    // 가까운 랙 (양옆)
    BX.F(b, 0, 0, BW, 9, "#0a0e12"); BX.F(b, 0, 9, BW, 3, "#1e262e"); for (let x = 0; x < BW; x += 14) BX.F(b, x, 9, 2, 6, "#2a343e");
    const rack = (rx, w) => {
      BX.F(b, rx, 12, w, 115, "#1a2028"); BX.F(b, rx + 2, 14, w - 4, 111, "#222a34"); BX.F(b, rx + 2, 14, 1, 111, "#323c48");
      for (let y = 18; y < 122; y += 7) { BX.F(b, rx + 4, y, w - 8, 5, "#151a22"); BX.F(b, rx + 4, y, w - 8, 1, "#2a323e"); for (let x = rx + 6; x < rx + w - 16; x += 3) BX.P(b, x, y + 2, "#0e1218"); const c = R() < 0.65 ? "#7fe3a0" : R() < 0.5 ? "#ff5d5d" : "#6fd3ff"; leds.push([(rx + w - 10) * 2, (y + 2) * 2, c]); BX.F(b, rx + w - 10, y + 2, 1, 1, "#0e1a14"); if (R() < 0.5) leds.push([(rx + w - 7) * 2, (y + 2) * 2, R() < 0.7 ? "#7fe3a0" : "#ffd54a"]); }
    };
    rack(50, 48); rack(272, 48);
    // 천장 케이블 다발
    for (let i = 0; i < 6; i++) { const cx = 104 + i * 28 + R() * 8; b.strokeStyle = ["#2a3a8a", "#8a2a2a", "#2a8a4a", "#8a7a2a", "#5a2a8a", "#2a6a8a"][i]; b.lineWidth = 1; b.beginPath(); b.moveTo(cx, 12); b.quadraticCurveTo(cx + 10, 26 + R() * 14, cx + 20, 12); b.stroke(); }
    // 천장 냉기 조명
    BX.F(b, 120, 12, 132, 1, "#6fdcff"); BX.glow(b, 186, 14, 60, "111,220,255", 0.12);
    // 바닥: 이중 바닥 타일, 가운데 통풍구(냉기)
    BX.vg(b, 0, BFL, BW, BH - BFL, [[0, "#1e262e"], [1, "#141a20"]]);
    vpLines(b, vx, vy, BFL, 26, "rgba(5,8,12,.6)", 10); vpRows(b, vy, BFL, "rgba(5,8,12,.55)", 3);
    for (let y = BFL + 4; y < BH; y += 5) for (let x = 150; x < 230; x += 3) if (R() < 0.5) BX.P(b, x + (y - BFL) * ((x - vx) / 120), y, "rgba(120,220,255,.25)");
    BX.pool(b, vx, BFL + 18, 70, 12, "111,220,255", 0.16);
    // 근경: 늘어진 케이블, 오른쪽 랙 모서리
    for (let i = 0; i < 4; i++) BX.vine(fo, 52 + i * 4, 0, 12 + i * 6, ["#2a3a8a", "#8a2a2a", "#1e262e", "#2a8a4a"][i], ["#3a4aaa", "#aa3a3a", "#2e3640", "#3aaa5a"][i], R);
    BX.F(fo, 308, 0, 12, BH, "#080b0f"); BX.F(fo, 309, 0, 1, BH, "#1a2028"); for (let y = 10; y < BH; y += 12) BX.P(fo, 312, y, "#7fe3a0");
    return { leds, dust: "140,220,255", floorGlow: "120,200,255", mist: "160,220,255" };
  },
  archive(L, R, V) {
    const f = L.far.g, m = L.mid.g, b = L.back.g, fo = L.fore.g;
    const vx = 190, vy = 70, BOOK = ["#a86a3a", "#6a7aa8", "#9a9a5a", "#c8b08a", "#8a5a4a", "#c9a26b", "#5a8a6a", "#b85a5a"];
    // 원경: 끝없는 서가 통로 (호박색 안개)
    BX.vg(f, 0, 0, BW, BH, [[0, "#120c06"], [0.5, "#2a1c10"], [1, "#160f08"]]);
    for (let x = 0; x < BW; x++) { const d = Math.abs(x - vx); if (d < 10) continue; const top = vy - d * 0.7, bot = vy + d * 0.56; BX.F(f, x, top, 1, bot - top, "#2a1e12"); const n = Math.max(3, Math.round((bot - top) / 7)); for (let s = 0; s < n; s++) { const y = top + (bot - top) * s / n; BX.F(f, x, y, 1, 1, "#3e2c1a"); if (R() < 0.55) BX.F(f, x, y + 1, 1, Math.max(1, (bot - top) / n - 2), BOOK[Math.floor(R() * BOOK.length)]); } }
    for (let x = 0; x < BW; x++) { const d = Math.max(10, Math.abs(x - vx)); BX.F(f, x, 0, 1, vy - d * 0.7, "#0e0904"); BX.F(f, x, vy + d * 0.56, 1, BH, "#1e150c"); }
    BX.glow(f, vx, vy, 40, "255,200,120", 0.5); BX.F(f, vx - 6, vy - 8, 12, 16, "#ffd9a0");
    BX.tint(f, "120,80,40", [0.55, 0.15], 0, BH);
    // 가까운 큰 책장 (양옆) + 사다리
    BX.F(b, 0, 0, BW, BFL, "rgba(0,0,0,0)");
    for (const sx of [44, 262]) {
      BX.F(b, sx, 0, 58, BFL, "#4a3a28"); BX.F(b, sx + 2, 0, 2, BFL, "#5e4a34"); BX.F(b, sx + 54, 0, 4, BFL, "#33281a");
      for (let y = 6; y < BFL - 6; y += 20) { BX.F(b, sx + 3, y + 17, 52, 3, "#5a4630"); BX.F(b, sx + 3, y + 20, 52, 1, "#2a2014"); let bx = sx + 5; while (bx < sx + 52) { const bw = 3 + Math.floor(R() * 3), bh = 10 + Math.floor(R() * 6), c = BOOK[Math.floor(R() * BOOK.length)]; if (R() < 0.12) { BX.F(b, bx, y + 17 - 4, bh, 4, c); bx += bh + 1; continue; } BX.F(b, bx, y + 17 - bh, bw, bh, c); BX.F(b, bx, y + 17 - bh, bw, 1, shade(c, 0.3)); BX.F(b, bx + bw - 1, y + 17 - bh, 1, bh, shade(c, -0.3)); if (bh > 12) BX.F(b, bx, y + 17 - bh + 3, bw, 1, "#e8d8a8"); bx += bw + (R() < 0.15 ? 2 : 0); } }
    }
    BX.F(b, 104, 0, 2, BFL, "#6a5236"); BX.F(b, 116, 0, 2, BFL, "#6a5236"); for (let y = 6; y < BFL; y += 9) BX.F(b, 104, y, 14, 2, "#7a6040");
    // 높은 아치 창과 빛줄기
    BX.F(b, 150, 0, 80, 4, "#2a2014");
    // 독서대 + 녹색 램프 + 상자 + 지구본
    BX.F(b, 132, 104, 64, 4, "#6a4a2a"); BX.F(b, 132, 104, 64, 1, "#8a6a42"); BX.F(b, 136, 108, 3, 19, "#4a3220"); BX.F(b, 189, 108, 3, 19, "#4a3220");
    BX.F(b, 140, 96, 2, 8, "#c9a43a"); BX.F(b, 136, 93, 12, 4, "#1f7a4a"); BX.F(b, 136, 93, 12, 1, "#3fae7a"); BX.glow(b, 142, 99, 18, "255,220,140", 0.3);
    BX.F(b, 156, 100, 14, 4, "#e8dcb5"); BX.F(b, 157, 99, 12, 1, "#f4ecd0"); BX.F(b, 172, 98, 10, 6, "#8a5a3a"); BX.F(b, 172, 98, 10, 1, "#a87a5a");
    for (const [x, y, w, h] of [[214, 108, 22, 19], [236, 112, 18, 15], [220, 94, 18, 14]]) { BX.F(b, x, y, w, h, "#a8845a"); BX.F(b, x, y, w, 1, "#c8a47a"); BX.F(b, x + w / 2 - 1, y, 2, h, "#8a6a42"); BX.F(b, x + 3, y + 4, 8, 3, "#f4ecd0"); }
    BX.text(b, "기밀", 223, 106.5, "#d6403d", 4.5);
    BX.disc(b, 124, 92, 6, "#3b7bd6"); BX.disc(b, 122, 90, 3, "#4fb35a"); BX.F(b, 123, 98, 2, 6, "#c9a43a"); BX.F(b, 119, 104, 10, 2, "#6a4a2a"); BX.ring(b, 124, 92, 7, "#c9a43a");
    for (const lx of [150, 236]) { BX.F(b, lx, 0, 1, 16, "#2a2016"); BX.oval(b, lx, 18, 6, 3, "#c9a43a"); BX.F(b, lx - 3, 20, 7, 1, "#fff0c0"); BX.glow(b, lx, 22, 26, "255,200,120", 0.2); }
    // 바닥: 나무 마루 + 광택 + 흩어진 종이
    BX.vg(b, 0, BFL, BW, BH - BFL, [[0, "#4e3c2a"], [1, "#2c2014"]]);
    vpLines(b, vx, vy, BFL, 16, "rgba(30,20,10,.45)", 14);
    BX.gloss(L, 0.24, BFL, "255,200,140");
    for (let i = 0; i < 9; i++) { const x = 60 + R() * 250, y = BFL + 8 + R() * 44; BX.F(b, x, y, 7, 4, "#e8dcb5"); BX.F(b, x, y + 1, 7, 1, "#b8a888"); BX.F(b, x + 1, y + 3, 5, 1, "rgba(0,0,0,.3)"); }
    BX.shaft(b, 160, 40, 150, 120, 0, BH, "255,220,150", 0.12);
    // 근경: 쌓인 책 + 촛불
    for (let i = 0; i < 5; i++) { const c = BOOK[i]; BX.F(fo, 48 - i % 2 * 2, 176 - i * 6, 34, 6, shade(c, -0.55)); BX.F(fo, 48 - i % 2 * 2, 176 - i * 6, 34, 1, shade(c, -0.3)); }
    BX.F(fo, 60, 140, 5, 6, "#d8c8a0"); BX.F(fo, 62, 137, 1, 3, "#ffd54a"); BX.glow(fo, 62, 138, 10, "255,200,100", 0.45);
    return { dust: "255,220,160", floorGlow: "255,200,140" };
  },
  cafeteria(L, R, V) {
    const b = L.back.g, fo = L.fore.g;
    const k = skyScene(L, V, R, 60, { h1: [12, 36], h2: [8, 28], h3: [4, 18] });
    BX.vg(b, 0, 0, BW, BFL, [[0, "#3a2a20"], [1, "#2e2219"]]);
    BX.F(b, 0, 64, BW, 63, "#e6dccb"); for (let y = 64; y < 127; y += 5) BX.F(b, 0, y, BW, 1, "#c9bca6"); for (let x = 0; x < BW; x += 8) BX.F(b, x, 64, 1, 63, "#d4c8b2"); BX.F(b, 0, 64, BW, 2, "#8a6a4a"); BX.haze(b, 64, 127, "60,40,30", 0.25, 0.05);
    BX.winFrame(b, 52, 12, 52, 44, "#1e160f", 2, "#5a4434", "#7a5a42"); BX.winFrame(b, 268, 12, 50, 44, "#1e160f", 2, "#5a4434", "#7a5a42");
    // 메뉴판
    BX.F(b, 116, 8, 140, 46, "#7a5a3a"); BX.F(b, 119, 11, 134, 40, "#1f3a2a"); BX.speck(b, 119, 11, 134, 40, "#2a4a38", 90, R); BX.F(b, 114, 52, 144, 3, "#7a5a3a");
    BX.text(b, "오늘의 메뉴: 제육볶음", 186, 24, "#f4f1e6", 8); BX.text(b, "후식: 요구르트 · 국: 미역국", 186, 38, "#ffd54a", 6.5);
    BX.F(b, 124, 46, 8, 3, "#ff8fb8"); BX.F(b, 240, 45, 6, 4, "#f4f1e6");
    // 배식대: 스테인리스 + 가림막 + 반찬통
    BX.F(b, 108, 76, 156, 20, "#9aa3b8"); BX.F(b, 108, 76, 156, 2, "#e6ecf6"); BX.F(b, 108, 94, 156, 2, "#5b6274"); for (let x = 112; x < 262; x += 24) BX.F(b, x, 80, 20, 12, "#b8c0ce");
    BX.F(b, 108, 60, 156, 1, "rgba(220,240,255,.6)"); BX.F(b, 108, 61, 156, 13, "rgba(200,230,255,.12)"); BX.F(b, 110, 61, 1, 15, "#b8c0ce"); BX.F(b, 261, 61, 1, 15, "#b8c0ce");
    ["#c9743a", "#ffd54a", "#4fb35a", "#ff6b6b", "#f4f1e6", "#8a5a3a"].forEach((c, i) => { const x = 114 + i * 25; BX.F(b, x, 72, 20, 4, "#6a7488"); BX.F(b, x + 1, 71, 18, 2, c); BX.speck(b, x + 1, 70, 18, 2, shade(c, 0.35), 6, R); });
    // 식판 더미 + 수저통 + 정수기
    for (let i = 0; i < 6; i++) BX.F(b, 92, 92 - i * 2, 14, 2, i % 2 ? "#c9ced8" : "#e6ecf6");
    BX.F(b, 270, 84, 12, 42, "#dfe6f3"); BX.F(b, 270, 84, 12, 1, "#ffffff"); BX.F(b, 271, 72, 10, 12, "#7ab8e8"); BX.F(b, 272, 73, 2, 10, "#b8e0ff"); BX.F(b, 273, 94, 2, 2, "#4a7ae8"); BX.F(b, 277, 94, 2, 2, "#e84a4a");
    // 펜던트 등
    BX.pendant(b, 80, 54, "#2a2e38", "255,213,120", 44, 0.12); BX.pendant(b, 296, 58, "#2a2e38", "255,213,120", 44, 0.12);
    // 식탁과 의자
    for (const x of [52, 134, 216, 290]) { BX.F(b, x, 104, 46, 4, "#c9a26b"); BX.F(b, x, 104, 46, 1, "#e0c08a"); BX.F(b, x + 4, 108, 3, 18, "#7a5a3a"); BX.F(b, x + 39, 108, 3, 18, "#7a5a3a"); BX.F(b, x + 6, 101, 13, 3, "#b8bcc6"); BX.F(b, x + 7, 100, 4, 1, "#c9743a"); BX.F(b, x + 13, 100, 4, 1, "#4fb35a"); BX.F(b, x + 26, 101, 13, 3, "#b8bcc6"); BX.F(b, x + 28, 100, 5, 1, "#ffd54a"); BX.F(b, x + 20, 99, 3, 5, "#e9edf6"); }
    BX.plant(b, 318, BFL, 1.6, "#c9743a", LEAF.green, R, 7);
    // 바닥
    BX.checker(b, BFL, "#5a4c40", "#4c4036", 190, 24, R, 12); BX.gloss(L, 0.2, BFL, "255,220,170");
    BX.pool(b, 80, 140, 38, 8, "255,213,120", 0.16); BX.pool(b, 296, 140, 38, 8, "255,213,120", 0.16);
    // 근경: 식판 든 식탁 모서리
    BX.F(fo, 44, 152, 46, 28, "#120c08"); BX.F(fo, 44, 150, 46, 3, "#3a2a1c"); BX.F(fo, 52, 144, 24, 6, "#5b6274"); BX.F(fo, 53, 143, 7, 2, "#a8642a"); BX.F(fo, 62, 143, 6, 2, "#3a8a3a"); BX.F(fo, 70, 143, 5, 2, "#c9a43a"); BX.F(fo, 80, 140, 4, 10, "#3a3e4a");
    return { steam: [[126 * 2, 66 * 2], [176 * 2, 66 * 2], [226 * 2, 66 * 2]], dust: "255,226,170", floorGlow: "255,213,140", blink: k.blink };
  },
};
/* 구역별 그림 (2): 헬스장 ~ 성층권 */
const BG2_B = {
  gym(L, R, V) {
    const b = L.back.g, fo = L.fore.g;
    const k = skyScene(L, V, R, 84, { h1: [18, 52], h2: [10, 40], h3: [6, 26] });
    BX.F(b, 0, 0, BW, BFL, "#1f2a3a");
    BX.winFrame(b, 52, 8, 270, 78, "#141c28", 5, "#3b4566", "#4a5578"); BX.glass(b, 52, 8, 270, 78);
    BX.F(b, 0, 0, BW, 6, "#10151e"); for (let x = 70; x < BW; x += 44) { BX.F(b, x, 4, 8, 2, "#eef4ff"); BX.glow(b, x + 4, 6, 10, "220,232,255", 0.2); }
    // 창 아래 벽 + 표어 현수막
    BX.F(b, 0, 88, BW, 39, "#243042"); BX.F(b, 0, 88, BW, 2, "#3b4566");
    BX.F(b, 112, 92, 150, 12, "#d6403d"); BX.F(b, 112, 92, 150, 1, "#ff6b5a"); BX.F(b, 112, 103, 150, 1, "#8a2020"); BX.F(b, 110, 91, 2, 14, "#c9ced8"); BX.F(b, 262, 91, 2, 14, "#c9ced8");
    BX.text(b, "하나 더! 할 수 있다!", 187, 98, "#fff4c0", 7.5);
    // 러닝머신 (창 앞, 옆모습)
    for (const x of [58, 96]) { BX.F(b, x, 80, 32, 5, "#1a1e28"); BX.F(b, x + 1, 79, 30, 1, "#3a3e4a"); BX.F(b, x + 26, 60, 3, 20, "#2a2e38"); BX.F(b, x + 22, 56, 11, 6, "#2a2e38"); BX.F(b, x + 23, 57, 9, 3, "#6fd3ff"); BX.F(b, x + 14, 66, 13, 2, "#3a3e4a"); BX.glow(b, x + 27, 58, 10, "111,211,255", 0.25); }
    // 덤벨 거치대
    BX.F(b, 140, 112, 70, 3, "#3a3e4a"); BX.F(b, 140, 120, 70, 3, "#3a3e4a"); BX.F(b, 142, 112, 3, 15, "#2a2e38"); BX.F(b, 205, 112, 3, 15, "#2a2e38");
    for (let i = 0; i < 6; i++) { const x = 147 + i * 10, c = ["#d6403d", "#3b7bd6", "#ffd54a", "#4fb35a", "#2a2e38", "#c9a6ff"][i]; BX.F(b, x, 108, 3, 4, c); BX.F(b, x + 3, 109, 2, 2, "#9aa3b8"); BX.F(b, x + 5, 108, 3, 4, c); BX.F(b, x, 116, 3, 4, c); BX.F(b, x + 3, 117, 2, 2, "#9aa3b8"); BX.F(b, x + 5, 116, 3, 4, c); }
    // 파워랙 + 바벨
    BX.F(b, 252, 54, 3, 73, "#4a5060"); BX.F(b, 300, 54, 3, 73, "#4a5060"); BX.F(b, 252, 54, 51, 3, "#4a5060"); BX.F(b, 253, 55, 1, 72, "#6a7080");
    BX.F(b, 240, 90, 76, 2, "#c9ced8"); BX.F(b, 242, 82, 4, 18, "#d6403d"); BX.F(b, 247, 84, 3, 14, "#3b7bd6"); BX.F(b, 310, 82, 4, 18, "#d6403d"); BX.F(b, 306, 84, 3, 14, "#3b7bd6");
    BX.F(b, 258, 118, 40, 3, "#2a2e38"); BX.F(b, 262, 112, 32, 6, "#5a2a2a"); BX.F(b, 262, 112, 32, 1, "#8a4a4a");
    // 바닥: 고무 매트 + 반들
    BX.vg(b, 0, BFL, BW, BH - BFL, [[0, "#2a2f3a"], [1, "#1a1e26"]]); BX.speck(b, 0, BFL, BW, BH - BFL, "#343a48", 260, R);
    vpLines(b, 190, 90, BFL, 34, "rgba(10,12,16,.5)", 8); BX.gloss(L, 0.2, BFL);
    for (let y = BFL + 6; y < BH; y += 16) BX.F(b, 0, y, BW, 1, "rgba(255,213,74,.18)");
    if (V !== 1) for (let i = 0; i < 4; i++) BX.shaft(b, 80 + i * 60, 22, 40 + i * 70, 50, 14, BH, V === 0 ? "255,170,120" : "255,220,170", 0.07);
    // 근경: 벤치와 덤벨
    BX.F(fo, 44, 158, 40, 5, "#0c0e14"); BX.F(fo, 50, 163, 3, 17, "#0c0e14"); BX.F(fo, 76, 163, 3, 17, "#0c0e14"); BX.F(fo, 44, 157, 40, 1, "#2a2e3a");
    BX.F(fo, 56, 150, 4, 7, "#160a0a"); BX.F(fo, 60, 152, 8, 3, "#3a3e4a"); BX.F(fo, 68, 150, 4, 7, "#160a0a");
    return { dust: V === 1 ? "200,220,255" : "255,210,170", floorGlow: V === 1 ? "180,200,255" : "255,190,150", blink: k.blink };
  },
  hr(L, R, V) {
    const b = L.back.g, fo = L.fore.g;
    const k = skyScene(L, V, R, 70, { h1: [14, 44], h2: [8, 34], h3: [4, 22] });
    BX.vg(b, 0, 0, BW, BFL, [[0, "#22362c"], [1, "#2a4034"]]);
    BX.F(b, 0, 96, BW, 31, "#5a4632"); for (let x = 0; x < BW; x += 14) BX.F(b, x, 96, 1, 31, "#4a3826"); BX.F(b, 0, 96, BW, 2, "#7a5e42"); BX.F(b, 0, 124, BW, 3, "#2a2016");
    BX.winFrame(b, 52, 10, 56, 62, "#142018", 2, "#5a4632", "#3a5a48");
    for (const x of [60, 74, 92]) { BX.F(b, x - 3, 68, 7, 4, "#e6dccb"); BX.bush(b, x, 69, 9, 8, LEAF.green, R, 5); }
    BX.vine(b, 56, 10, 22, "#1f5a32", "#4fb35a", R, "#ff8fb8"); BX.vine(b, 104, 10, 16, "#1f5a32", "#4fb35a", R);
    [["인재제일", 120], ["정시퇴근", 186], ["상호존중", 252]].forEach(([t, x]) => { BX.F(b, x, 10, 58, 28, "#c9a26b"); BX.F(b, x + 2, 12, 54, 24, "#f4f1e6"); BX.F(b, x + 2, 35, 54, 1, "#d9d2c0"); BX.text(b, t, x + 29, 24, "#2a3a2f", 9.5); });
    // 초록 벽 정원 (이끼 + 잎 + 꽃 + 늘어진 덩굴)
    BX.F(b, 118, 44, 194, 48, "#163a24"); BX.F(b, 116, 42, 198, 2, "#5a4632"); BX.F(b, 116, 92, 198, 3, "#5a4632");
    BX.speck(b, 118, 44, 194, 48, "#1f4a2c", 500, R); BX.speck(b, 118, 44, 194, 48, "#0e2a18", 300, R);
    for (let i = 0; i < 150; i++) { const x = 120 + R() * 190, y = 46 + R() * 44; BX.leaf(b, x, y, 2.5 + R() * 2.5, 1.3 + R(), R() * 6.28, ["#1f5a32", "#2a6e3e", "#3a8a4a"][Math.floor(R() * 3)], R() < 0.5 ? "#6fd36a" : "#4fb35a"); }
    BX.flowers(b, 120, 48, 190, 40, ["#ff8fb8", "#ffd54a", "#ffffff", "#c9a6ff"], R, 26);
    for (let x = 122; x < 310; x += 7 + R() * 8) BX.vine(b, x, 92, 4 + R() * 12, "#1f5a32", R() < 0.5 ? "#4fb35a" : "#6fd36a", R, R() < 0.3 ? "#ff8fb8" : null);
    // 낮은 서랍장 + 화분
    BX.F(b, 52, 104, 52, 23, "#8d97b6"); BX.F(b, 52, 104, 52, 2, "#b9c1d6"); for (let i = 0; i < 2; i++) { BX.F(b, 54 + i * 26, 108, 22, 16, "#9aa3b8"); BX.F(b, 62 + i * 26, 113, 6, 2, "#5b6274"); }
    BX.plant(b, 66, 104, 1.1, "#f4f1e6", LEAF.green, R, 6); BX.F(b, 84, 98, 12, 6, "#fff6a8"); BX.F(b, 86, 100, 8, 1, "#8a7a3a");
    BX.plant(b, 300, BFL, 1.7, "#c9743a", LEAF.green, R, 8);
    // 바닥: 마루 + 광택
    BX.planks(b, BFL, "#6a5038", "#3e2c1e", "rgba(30,18,10,.5)", 190, R, 16);
    BX.gloss(L, 0.2, BFL, "200,255,220");
    BX.pool(b, 190, 140, 90, 10, "220,255,230", 0.07);
    // 근경: 큰 잎(왼쪽 아래), 늘어진 덩굴(오른쪽 위)
    forePlant(fo, 58, 188, 1.6, ["#0a2414", "#0e3018", "#1e5a30"], R, 10);
    for (let i = 0; i < 6; i++) BX.vine(fo, 40 + i * 5, 0, 16 + R() * 30, "#0a2414", i % 2 ? "#123a20" : "#1e5a30", R);
    BX.F(fo, 36, 0, 34, 3, "#0a2414");
    return { dust: "220,255,230", floorGlow: "200,255,220", petals: null, blink: k.blink };
  },
  finance(L, R, V) {
    const b = L.back.g, fo = L.fore.g;
    const k = skyScene(L, V, R, 44, { h1: [8, 26], h2: [6, 20], h3: [3, 14] });
    BX.F(b, 0, 0, BW, BFL, "#14221a");
    BX.winFrame(b, 52, 6, 270, 34, "#0a120e", 6, "#2a3a30", "#3a4a3e"); BX.glass(b, 52, 6, 270, 34, 0.7);
    BX.F(b, 0, 42, BW, 2, "#c9a43a"); BX.F(b, 0, 44, BW, 1, "#5a4618");
    BX.F(b, 0, 98, BW, 29, "#3a2a1a"); for (let x = 0; x < BW; x += 18) BX.F(b, x, 98, 1, 29, "#2a1e12"); BX.F(b, 0, 98, BW, 2, "#c9a43a");
    for (const x of [48, 232]) BX.column(b, x, 45, BFL, 12, "#2a3a30", "#3e5244", "#16221a", "#c9a43a");
    // 전광판
    BX.F(b, 64, 48, 164, 46, "#070c09"); BX.F(b, 66, 56, 160, 36, "#0b1610"); BX.F(b, 66, 49, 160, 6, "#14100a");
    for (let x = 68; x < 226; x += 8) BX.F(b, x, 56, 1, 36, "rgba(127,227,160,.07)");
    let yy = 84; b.fillStyle = "#7fe3a0"; let px0 = 70; for (let x = 78; x <= 222; x += 8) { const ny = Math.max(60, Math.min(88, yy + (R() - 0.62) * 10)); for (let s = 0; s <= 8; s++) b.fillRect(px0 + s, Math.round(yy + (ny - yy) * s / 8), 1, 1); yy = ny; px0 = x; }
    for (let i = 0; i < 14; i++) { const x = 72 + i * 11, up = R() < 0.6, h = 3 + R() * 9; BX.F(b, x, 72 - h / 2, 3, h, up ? "#7fe3a0" : "#ff5d5d"); BX.F(b, x + 1, 72 - h / 2 - 2, 1, h + 4, up ? "#3fae7a" : "#a83a3a"); }
    BX.glow(b, 146, 72, 80, "127,227,160", 0.1); BX.text(b, "이번 분기 예산", 102, 62, "#ffd54a", 6.5);
    // 금고 문
    BX.F(b, 244, 48, 68, 79, "#2a3036"); BX.F(b, 246, 50, 64, 75, "#3a4048"); BX.disc(b, 278, 88, 27, "#4a5058"); BX.disc(b, 278, 88, 24, "#5a6068"); BX.ring(b, 278, 88, 24, "#2a3036"); BX.ring(b, 278, 88, 18, "#3a4048");
    BX.disc(b, 278, 88, 7, "#c9a43a"); BX.disc(b, 277, 87, 4, "#ffe08a"); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; BX.F(b, 278 + Math.cos(a) * 12 - 1, 88 + Math.sin(a) * 12 - 1, 3, 3, "#8d97b6"); }
    for (let y = 56; y < 122; y += 14) { BX.F(b, 248, y, 4, 6, "#6a7080"); BX.F(b, 304, y, 4, 6, "#6a7080"); }
    // 금화 더미 + 돈나무
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4 - i % 3; j++) { BX.oval(b, 212 + i * 6, 124 - j * 2, 3, 1, j % 2 ? "#ffd54a" : "#c9a43a"); }
    BX.plant(b, 104, BFL, 1.4, "#c9a43a", ["#1f5a32", "#3a8a4a", "#7fe3a0"], R, 7);
    BX.F(b, 132, 106, 50, 4, "#5a3a26"); BX.F(b, 132, 106, 50, 1, "#8a6242"); BX.F(b, 136, 110, 3, 17, "#3a2618"); BX.F(b, 175, 110, 3, 17, "#3a2618"); BX.F(b, 140, 98, 12, 8, "#2a2e38"); BX.F(b, 141, 99, 10, 2, "#7fe3a0"); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) BX.P(b, 142 + i * 3, 102 + j * 1.5, "#9aa3b8"); BX.F(b, 158, 102, 16, 4, "#e9edf6"); BX.F(b, 160, 101, 12, 1, "#7fe3a0");
    // 바닥: 어두운 대리석 + 금빛 반사
    BX.checker(b, BFL, "#25302b", "#1c2622", 190, 28, R, 12); BX.gloss(L, 0.3, BFL, "255,213,74");
    BX.F(b, 0, BFL, BW, 1, "#c9a43a");
    // 근경: 금화 탑
    for (let s = 0; s < 3; s++) for (let i = 0; i < 9 - s * 2; i++) { const x = 52 + s * 9, y = 178 - i * 3; BX.oval(fo, x, y, 4, 1.4, i % 2 ? "#8a6a1a" : "#5a4410"); BX.F(fo, x - 3, y - 1, 2, 1, "#c9a43a"); }
    return { dust: "200,255,220", floorGlow: "127,227,160", ticker: [66 * 2, 49 * 2, 160 * 2, 6 * 2], blink: k.blink };
  },
  garden(L, R, V) {
    const f = L.far.g, m = L.mid.g, b = L.back.g, fo = L.fore.g;
    const k = skyScene(L, V, R, 100, { h1: [14, 48], h2: [8, 36], h3: [4, 22] });
    if (V !== 1) for (let i = 0; i < 3; i++) BX.cloud(f, 70 + i * 90 + R() * 20, 18 + R() * 20, 9 + R() * 6, k.cloud[0], k.cloud[1], null);
    // 난간 (유리 + 기둥)
    BX.F(b, 0, 92, BW, 14, "rgba(200,230,255,.16)"); BX.F(b, 0, 91, BW, 2, "#b9c1d6"); for (let x = 0; x < BW; x += 22) BX.F(b, x, 91, 2, 16, "#8d97b6");
    // 화단 + 잔디
    BX.F(b, 0, 106, BW, 21, "#5a3c28"); BX.F(b, 0, 106, BW, 2, "#7a5438");
    for (let x = 40; x < BW; x += 46) { BX.F(b, x, 100, 36, 12, "#8a5a3a"); BX.F(b, x, 100, 36, 2, "#a8744e"); BX.bush(b, x + 18, 102, 34, 14, LEAF.green, R, 8); BX.flowers(b, x + 2, 92, 32, 10, ["#ff8fb8", "#ffd54a", "#ffffff", "#c9a6ff"], R, 7); }
    BX.moss(b, 0, 112, BW, "#3a8a4a", "#6fd36a", R); BX.grass(b, 0, 127, BW, "#3a8a4a", "#6fd36a", R, 0.7);
    // 나무 (왼쪽 초록, 오른쪽 꽃나무)
    BX.tree(b, 66, 112, 78, "#4a3020", LEAF.green, R, 0.95); BX.flowers(b, 44, 50, 46, 30, ["#ffd54a", "#ffffff"], R, 8);
    BX.tree(b, 306, 112, 70, "#4a3020", LEAF.pink, R, 0.95);
    // 퍼걸러 + 등나무 꽃 + 꼬마전구
    BX.F(b, 116, 18, 4, 92, "#6b4a32"); BX.F(b, 117, 18, 1, 92, "#8a6242"); BX.F(b, 254, 18, 4, 92, "#6b4a32"); BX.F(b, 255, 18, 1, 92, "#8a6242");
    BX.F(b, 106, 16, 162, 4, "#8a6242"); BX.F(b, 106, 16, 162, 1, "#a87a54"); for (let x = 110; x < 266; x += 9) BX.F(b, x, 12, 3, 5, "#6b4a32");
    const wcol = V === 1 ? ["#b8a0e8", "#9a7ad6", "#7a5ab8"] : ["#e8c0f0", "#c890e0", "#a068c8"];
    for (let x = 108; x < 266; x += 3 + R() * 3) { if (R() < 0.55) BX.wisteria(b, x, 20, 8 + R() * 22, "#3a5a2a", wcol, R); else BX.vine(b, x, 20, 6 + R() * 14, "#1f5a32", "#4fb35a", R); }
    for (let i = 0; i <= 20; i++) { const x = 110 + i * 7.7, y = 22 + Math.sin(i / 20 * Math.PI) * 8; BX.P(b, x, y, "#3a3020"); BX.P(b, x, y + 1, "#ffe08a"); }
    // 바닥: 나무 데크 + 디딤돌
    BX.planks(b, BFL, "#8a6444", "#4a3424", "rgba(40,24,14,.45)", 190, R, 15);
    BX.gloss(L, 0.12, BFL, "255,200,170");
    BX.grass(b, 0, BFL + 3, BW, "#3a8a4a", "#6fd36a", R, 0.25);
    for (const x of [92, 282]) { BX.F(b, x, 104, 2, 23, "#2a2a30"); BX.F(b, x - 3, 98, 8, 7, "#2a2a30"); BX.F(b, x - 2, 99, 6, 5, V === 1 ? "#ffe08a" : "#ffd9a0"); BX.glow(b, x + 1, 101, 16, "255,220,140", V === 1 ? 0.45 : 0.25); BX.pool(b, x + 1, BFL + 4, 22, 4, "255,220,140", V === 1 ? 0.2 : 0.1); }
    // 근경: 꽃 핀 덤불(왼쪽 아래), 등나무 꽃 늘어짐(오른쪽 위), 잎(왼쪽 위)
    BX.bush(fo, 56, 194, 60, 56, ["#0c2a14", "#164226", "#22603a"], R, 14); BX.flowers(fo, 34, 148, 40, 26, ["#ff8fb8", "#ffd6e2"], R, 9);
    for (let i = 0; i < 9; i++) BX.wisteria(fo, 286 + i * 4, 0, 14 + R() * 26, "#1a2a14", ["#6a4a8a", "#5a3a7a", "#4a2a6a"], R);
    foreLeaves(fo, 50, -4, 7, 1.3, ["#0c2a14", "#164226", "#22603a"], R, 1);
    return { petals: V === 1 ? ["#c9a6ff", "#ffffff"] : ["#ff8fb8", "#ffd6e2", "#ffffff"], floorGlow: V === 1 ? "200,180,255" : "255,200,170", blink: k.blink, fairy: [[110 * 2, 22 * 2, 154 * 2, 8 * 2]] };
  },
  heliport(L, R, V) {
    const b = L.back.g, fo = L.fore.g;
    const k = skyScene(L, V, R, 112, { h1: [22, 70], h2: [12, 52], h3: [6, 34] });
    // 옥상 난간 + 바닥 턱
    BX.F(b, 0, 112, BW, 15, "#262a36"); BX.F(b, 0, 112, BW, 2, "#5b6274"); BX.F(b, 0, 125, BW, 2, "#1a1e28");
    BX.F(b, 0, 100, BW, 1, "#8d97b6"); for (let x = 4; x < BW; x += 16) BX.F(b, x, 100, 1, 12, "#5b6274");
    // 실외기
    for (const x of [56, 86]) { BX.F(b, x, 94, 26, 18, "#9aa3b8"); BX.F(b, x, 94, 26, 1, "#c9ced8"); BX.disc(b, x + 13, 103, 6, "#5b6274"); BX.disc(b, x + 13, 103, 2, "#2a2e38"); for (let i = -5; i <= 5; i += 2) BX.F(b, x + 8 + (i + 5) * 0.5, 103 + i * 0.5, 1, 1, "#3a3e48"); }
    // 안테나 탑 (빨간 불은 깜빡임)
    BX.F(b, 118, 26, 3, 86, "#3a4058"); for (let y = 30; y < 110; y += 8) { BX.F(b, 114, y, 11, 1, "#3a4058"); BX.P(b, 115 + (y / 8 % 2) * 8, y + 4, "#3a4058"); } BX.F(b, 114, 22, 11, 4, "#5b6274");
    // 바람자루
    BX.F(b, 292, 58, 2, 54, "#8d97b6"); for (let i = 0; i < 5; i++) { b.fillStyle = i % 2 ? "#ffffff" : "#ff8a3b"; b.fillRect(294 + i * 4, 59 + i * 0.6, 4, 7 - i); }
    // 조명탑
    for (const x of [72, 250]) { BX.F(b, x, 50, 2, 62, "#5b6274"); BX.F(b, x - 4, 46, 10, 5, "#3a4058"); BX.F(b, x - 3, 50, 8, 1, "#fff8e0"); BX.shaft(b, x - 3, 8, x - 30, 66, 51, BH, "255,248,220", 0.07); }
    // 바닥: 헬기장
    BX.vg(b, 0, BFL, BW, BH - BFL, [[0, "#3a3f4a"], [1, "#24272f"]]); BX.speck(b, 0, BFL, BW, BH - BFL, "#444a56", 200, R);
    BX.gloss(L, 0.14, BFL);
    b.strokeStyle = "#ffd54a"; b.lineWidth = 2; b.beginPath(); b.ellipse(190, 156, 82, 17, 0, 0, Math.PI * 2); b.stroke(); b.strokeStyle = "rgba(255,213,74,.4)"; b.lineWidth = 1; b.beginPath(); b.ellipse(190, 156, 74, 14, 0, 0, Math.PI * 2); b.stroke();
    BX.text(b, "H", 190, 157, "#ffd54a", 20);
    BX.pool(b, 58, 150, 40, 9, "255,248,220", 0.12); BX.pool(b, 236, 150, 40, 9, "255,248,220", 0.12);
    const pad = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; pad.push([(190 + Math.cos(a) * 88) * 2, (156 + Math.sin(a) * 19) * 2]); }
    // 근경: 난간 기둥(왼쪽), 조명 머리(왼쪽 위)
    BX.F(fo, 48, 120, 6, 60, "#0a0c12"); BX.F(fo, 44, 118, 14, 4, "#1a1e2a"); BX.F(fo, 0, 140, 60, 3, "#0a0c12");
    return { clouds: V === 1 ? { col: "rgba(150,160,210,.2)", y: 66, n: 5 } : { col: "rgba(255,220,220,.24)", y: 60, n: 5 }, plane: true, padLights: pad, blink: k.blink.concat([[119 * 2 + 1, 22 * 2]]), floorGlow: "200,200,255", search: V !== 2 };
  },
  clouds(L, R, V) {
    const f = L.far.g, m = L.mid.g, b = L.back.g, fo = L.fore.g;
    const P = [
      { sky: [[0, "#5a9ae0"], [0.55, "#a8d0ff"], [1, "#eaf6ff"]], cl: ["#ffffff", "#e6f0fc", "#c4d6ee"], far: "#b6cdea", far2: "#9ab8e0", sun: "#fff9e0", sg: "255,250,220", tint: "230,240,255" },
      { sky: [[0, "#0c1430"], [0.6, "#2a3a70"], [1, "#4a5a90"]], cl: ["#c8d4f4", "#9aaad8", "#6a7ab0"], far: "#3a4a7a", far2: "#4a5a8a", sun: "#f4f6ff", sg: "200,215,255", tint: "60,80,140" },
      { sky: [[0, "#8a9ad8"], [0.55, "#f0c0d8"], [1, "#fff0e0"]], cl: ["#ffffff", "#ffe6ee", "#e8c0d0"], far: "#d8c0d8", far2: "#c8a8c8", sun: "#fff4e0", sg: "255,230,210", tint: "255,230,240" },
    ][V];
    BX.vg(f, 0, 0, BW, BH, P.sky); if (V === 1) BX.stars(f, 60, 100, R);
    BX.glow(f, 96, 34, 60, P.sg, 0.55); BX.disc(f, 96, 34, V === 1 ? 8 : 11, P.sun);
    // 멀리 떠 있는 섬과 탑(아주 옅게)
    for (let i = 0; i < 5; i++) { const x = 56 + i * 58 + R() * 20, y = 60 + R() * 40, w = 14 + R() * 18; BX.F(f, x - w / 2, y - 3, w, 4, P.far); for (let s = 0; s < 6; s++) BX.F(f, x - w / 2 + s * 1.5, y + 1 + s, w - s * 3, 1, P.far); if (R() < 0.6) { BX.F(f, x - 2, y - 20 - R() * 12, 5, 20, P.far2); BX.F(f, x - 3, y - 22, 7, 2, P.far2); } }
    BX.haze(f, 40, 150, P.tint, 0, 0.5);
    // 중경: 뭉게구름 + 떠 있는 섬(덜 옅게)
    for (let i = 0; i < 7; i++) BX.cloud(m, 20 + i * 50 + R() * 20, 112 + R() * 18, 18 + R() * 12, P.cl[0], P.cl[1], P.cl[2]);
    const isl = (g, x, y, w, top, dirt, grass, R) => { BX.F(g, x - w / 2, y, w, 4, grass); for (let s = 0; s < w / 3; s++) BX.F(g, x - w / 2 + s * 1.5 + 1, y + 4 + s, w - s * 3 - 2, 1, dirt); BX.bush(g, x - w * 0.2, y, w * 0.4, 10, top, R, 5); };
    isl(m, 150, 70, 34, ["#5a8a7a", "#7aa89a", "#a8d0c0"], "#a89aa8", "#8ab8a0", R); isl(m, 230, 54, 24, ["#5a8a7a", "#7aa89a", "#a8d0c0"], "#a89aa8", "#8ab8a0", R);
    BX.tint(m, P.tint, 0.3);
    // 뒷층: 이끼 낀 벽돌 섬 두 개 (꽃·덩굴), 무너진 기둥
    const plat = (x, y, w, h) => {
      BX.bricks(b, x, y, w, h, "#c99a7a", "#9a6a52", "#e0b494", R, 9, 4); BX.F(b, x, y + h - 2, w, 2, "#8a5a44");
      for (let s = 0; s < 8; s++) BX.F(b, x + 3 + s * 2, y + h + s, w - 6 - s * 4, 1, s % 2 ? "#7a4a3a" : "#8a5a44");
      BX.F(b, x - 1, y - 2, w + 2, 3, "#5fbf6a"); BX.moss(b, x, y + 1, w, "#3a8a4a", "#7fe38a", R); BX.grass(b, x, y - 1, w, "#3a8a4a", "#7fe38a", R, 0.8);
      BX.flowers(b, x + 2, y - 7, w - 4, 5, ["#ff8fa3", "#ffd54a", "#ffffff", "#ff6b8a"], R, Math.round(w / 5));
      for (let i = 0; i < w / 8; i++) BX.vine(b, x + 2 + R() * (w - 4), y + h, 8 + R() * 22, "#2a7a3a", "#5fbf6a", R, R() < 0.4 ? "#ff8fa3" : null);
      BX.bush(b, x + w * 0.75, y - 1, 14, 9, LEAF.green, R, 5);
    };
    plat(54, 54, 50, 12); plat(250, 38, 66, 14);
    BX.F(b, 120, 66, 10, 46, "#d8c8d8"); BX.F(b, 121, 66, 2, 46, "#efe2ef"); BX.F(b, 128, 66, 2, 46, "#b8a8b8"); BX.F(b, 117, 62, 16, 4, "#e8dce8"); BX.F(b, 118, 66, 14, 1, "#b8a8b8"); BX.F(b, 124, 58, 6, 4, "#d8c8d8");
    BX.vine(b, 122, 62, 26, "#2a7a3a", "#5fbf6a", R, "#ff8fa3"); BX.moss(b, 117, 62, 16, "#3a8a4a", "#7fe38a", R);
    // 구름 바다 (멀리)
    for (let x = -10; x < BW + 10; x += 16) BX.disc(b, x + R() * 6, 120 + R() * 4, 10 + R() * 4, P.cl[1]);
    for (let x = -10; x < BW + 10; x += 14) BX.disc(b, x + R() * 6, 118 + R() * 3, 7 + R() * 3, P.cl[0]);
    BX.vg(b, 0, 124, BW, BH - 124, [[0, P.cl[0]], [1, P.cl[1]]]);
    // 이끼 낀 돌다리: 윗면(원근) + 앞면 벽돌 + 아래로 늘어진 덩굴
    const s0 = V === 1 ? ["#6a6a86", "#5a5a76", "#4a4a64", "#3a3a52"] : V === 2 ? ["#b8a0b0", "#a08898", "#8a7484", "#6a5868"] : ["#a8a8b8", "#9090a4", "#7a7a90", "#5e5e74"];
    BX.checker(b, 132, s0[0], s0[1], 190, 22, R, 7, 30);
    BX.F(b, 0, 132, BW, 1, s0[0]); BX.F(b, 0, 131, BW, 1, "#5fbf6a"); BX.moss(b, 0, 132, BW, "#3a8a4a", "#7fe38a", R); BX.grass(b, 0, 132, BW, "#3a8a4a", "#7fe38a", R, 0.5);
    for (let i = 0; i < 40; i++) { const x = R() * BW, y = 134 + R() * 24; BX.F(b, x, y, 2 + R() * 4, 1, "#4a9a5a"); }
    BX.bricks(b, 0, 158, BW, 12, s0[2], s0[3], s0[1], R, 12, 4); BX.F(b, 0, 158, BW, 1, s0[0]); BX.moss(b, 0, 158, BW, "#3a8a4a", "#6fd36a", R);
    for (let i = 0; i < 26; i++) BX.vine(b, R() * BW, 168, 4 + R() * 12, "#2a7a3a", "#5fbf6a", R, R() < 0.3 ? "#ff8fa3" : null);
    BX.flowers(b, 0, 133, BW, 4, ["#ff8fa3", "#ffd54a", "#ffffff"], R, 14);
    for (let x = -10; x < BW + 10; x += 18) BX.disc(b, x + R() * 8, 178 + R() * 4, 8 + R() * 5, P.cl[0]);
    // 근경: 위에서 늘어진 덩굴(왼쪽), 구름 덩이(아래 모서리)
    for (let i = 0; i < 6; i++) BX.vine(fo, 48 + i * 5, 0, 18 + R() * 30, "#1a5a2a", i % 2 ? "#2a7a3a" : "#4fb35a", R, R() < 0.4 ? "#ff8fa3" : null);
    BX.F(fo, 40, 0, 40, 4, "#2a5a32"); BX.moss(fo, 40, 3, 40, "#2a7a3a", "#4fb35a", R);
    BX.cloud(fo, 52, 172, 22, P.cl[0], P.cl[1], P.cl[2]); BX.cloud(fo, 320, 178, 24, P.cl[0], P.cl[1], P.cl[2]);
    return { clouds: { col: V === 1 ? "rgba(200,210,255,.3)" : "rgba(255,255,255,.55)", y: 84, n: 6 }, petals: ["#ff8fa3", "#ffffff", "#ffd6e2"], floorGlow: V === 1 ? "180,200,255" : "255,255,255", dust: "255,255,255" };
  },
  stratos(L, R, V) {
    const f = L.far.g, m = L.mid.g, b = L.back.g, fo = L.fore.g;
    BX.vg(f, 0, 0, BW, BH, [[0, "#000006"], [0.55, "#081236"], [1, "#1a3a80"]]); BX.stars(f, 120, 100, R);
    // 둥근 지구 + 대기 테두리 + 구름 + 밤쪽 도시 불빛
    BX.glow(f, 190, 300, 240, "111,211,255", 0.4);
    BX.oval(f, 190, 300, 360, 226, "#9ae6ff"); BX.oval(f, 190, 302, 356, 223, "#3a7ad0"); BX.oval(f, 190, 305, 352, 220, "#1e4a96");
    for (let i = 0; i < 26; i++) { const x = 20 + R() * 300, y = 86 + R() * 60; BX.oval(f, x, y, 8 + R() * 24, 1.5 + R() * 2, "rgba(255,255,255,.5)"); }
    for (let i = 0; i < 18; i++) { const x = 20 + R() * 300, y = 92 + R() * 50; BX.oval(f, x, y, 4 + R() * 8, 1 + R() * 2, "rgba(80,160,90,.55)"); }
    BX.haze(f, 70, 100, "111,211,255", 0, 0.3);
    // 중경: 인공위성 + 기상 풍선
    BX.F(m, 236, 40, 34, 2, "#8d97b6"); BX.F(m, 248, 34, 10, 14, "#c9ced8"); BX.F(m, 249, 35, 2, 12, "#ffffff"); BX.F(m, 224, 36, 12, 9, "#2a5aa8"); BX.F(m, 270, 36, 12, 9, "#2a5aa8"); for (let i = 0; i < 3; i++) { BX.F(m, 224 + i * 4, 36, 1, 9, "#6fa8ff"); BX.F(m, 270 + i * 4, 36, 1, 9, "#6fa8ff"); } BX.disc(m, 253, 31, 2, "#ff5d5d");
    BX.disc(m, 100, 34, 9, "#f4f1e6"); BX.disc(m, 97, 31, 4, "#ffffff"); BX.F(m, 100, 43, 1, 10, "#c9ced8"); BX.F(m, 96, 53, 9, 6, "#c9743a"); BX.F(m, 96, 53, 9, 1, "#e0905a");
    // 전망대 바닥 + 난간 + 캡슐
    BX.F(b, 0, 118, BW, 9, "#3a4256"); BX.F(b, 0, 118, BW, 1, "#8d97b6"); for (let x = 0; x < BW; x += 18) { BX.F(b, x, 106, 2, 12, "#5b6274"); BX.P(b, x, 105, "#6fd3ff"); } BX.F(b, 0, 106, BW, 1, "#8d97b6");
    BX.F(b, 56, 76, 34, 42, "#c9ced8"); BX.oval(b, 73, 76, 17, 10, "#dfe4ee"); BX.F(b, 56, 76, 34, 1, "#ffffff"); BX.disc(b, 73, 90, 7, "#2a3a5a"); BX.disc(b, 71, 88, 3, "#6fd3ff"); BX.F(b, 60, 112, 26, 3, "#8d97b6"); BX.F(b, 88, 96, 2, 22, "#8d97b6");
    BX.F(b, 300, 60, 3, 58, "#5b6274"); BX.F(b, 294, 58, 15, 3, "#8d97b6"); BX.disc(b, 301, 55, 2, "#7fe3a0");
    BX.vg(b, 0, BFL, BW, BH - BFL, [[0, "#4a5266"], [1, "#2a3042"]]);
    for (let x = 0; x < BW; x += 24) { BX.F(b, x, BFL, 1, BH - BFL, "#2e3448"); for (let y = BFL + 4; y < BH; y += 12) BX.P(b, x + 3, y, "#8d97b6"); }
    vpRows(b, 70, BFL, "rgba(20,24,40,.5)", 4); BX.gloss(L, 0.2, BFL, "111,211,255");
    // 근경: 버팀대
    BX.F(fo, 44, 140, 8, 40, "#05070e"); BX.F(fo, 44, 140, 40, 4, "#0a0e1a"); BX.F(fo, 50, 136, 4, 4, "#6fd3ff");
    return { floorGlow: "111,211,255", dust: "200,230,255", blink: [[301 * 2, 55 * 2], [50 * 2 + 4, 136 * 2]] };
  },
};
/* 구역별 그림 (3): 달 지사 ~ 시공간 이사회, 금고 */
function crater(g, x, y, r, base, dk, lt) { BX.oval(g, x, y, r, r * 0.32, dk); BX.oval(g, x + r * 0.08, y + r * 0.04, r * 0.82, r * 0.24, base); BX.F(g, x - r * 0.7, y - r * 0.3, r * 1.2, 1, lt); }
function gear(g, cx, cy, r, col, hole, teeth) { const n = teeth || 10; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; BX.disc(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.max(1.2, r * 0.2), col); } BX.disc(g, cx, cy, r * 0.92, col); if (hole) BX.disc(g, cx, cy, r * 0.35, hole); }
const BG2_C = {
  moon(L, R, V) {
    const f = L.far.g, m = L.mid.g, b = L.back.g, fo = L.fore.g, blink = [];
    BX.vg(f, 0, 0, BW, BH, [[0, "#020306"], [1, "#0c0e1a"]]); BX.stars(f, 150, 110, R);
    const ex = V === 1 ? 236 : 120, ey = 34, er = 18;
    BX.glow(f, ex, ey, er * 3.2, "111,170,255", 0.3); BX.disc(f, ex, ey, er, "#2a5aa8"); BX.disc(f, ex - 1, ey - 1, er - 1, "#3b7bd6");
    BX.disc(f, ex - 6, ey - 4, 6, "#4fb35a"); BX.disc(f, ex + 5, ey + 6, 5, "#5ac36a"); BX.disc(f, ex + 8, ey - 8, 3, "#4fb35a"); BX.oval(f, ex - 2, ey - 11, 8, 2, "#ffffff"); BX.oval(f, ex + 4, ey + 1, 6, 1.5, "#e6f0ff");
    BX.shadeDisc(f, ex, ey, er, ex + er * 0.55, ey + er * 0.3, er * 0.95, "rgba(0,0,20,.55)");
    BX.ridge(f, BH, 92, 12, "#5a5a6c", R, 11); BX.ridge(f, BH, 100, 8, "#4a4a5c", R, 8); BX.haze(f, 76, 122, "150,150,180", 0, 0.3);
    BX.ridge(m, BH, 106, 8, "#6e6c80", R, 7); for (let i = 0; i < 6; i++) crater(m, 60 + R() * 250, 112 + R() * 6, 4 + R() * 6, "#6e6c80", "#58566a", "#8a889c");
    // 월면 기지: 큰 돔 + 작은 돔 + 연결 통로 + 모듈 + 안테나 + 태양광 + 깃발
    BX.vg(b, 0, 112, BW, BH - 112, [[0, "#a4a2b2"], [0.4, "#8a889a"], [1, "#5a5868"]]);
    BX.F(b, 98, 104, 30, 6, "#b8bcc8"); BX.F(b, 98, 104, 30, 1, "#dfe4ee");
    BX.disc(b, 76, 104, 24, "#c9ced8"); BX.F(b, 52, 104, 50, 26, "#a4a2b2"); BX.disc(b, 72, 100, 17, "#dfe4ee"); for (let i = -2; i <= 2; i++) { BX.F(b, 74 + i * 8, 90, 4, 3, "#ffd54a"); blink.push([(75 + i * 8) * 2, 91 * 2]); }
    BX.F(b, 52, 103, 50, 2, "#8d97b6"); BX.ring(b, 76, 104, 24, "#9aa3b8");
    BX.disc(b, 138, 104, 13, "#c9ced8"); BX.F(b, 124, 104, 28, 14, "#a4a2b2"); BX.disc(b, 136, 101, 9, "#dfe4ee"); BX.F(b, 134, 96, 5, 3, "#6fd3ff");
    BX.F(b, 150, 92, 26, 14, "#b8bcc8"); BX.F(b, 150, 92, 26, 1, "#ffffff"); for (let i = 0; i < 3; i++) BX.F(b, 153 + i * 8, 96, 5, 3, "#ffd54a"); BX.F(b, 150, 105, 26, 1, "#6a7080");
    BX.F(b, 262, 70, 2, 40, "#c9ced8"); b.fillStyle = "#dfe4ee"; b.beginPath(); b.moveTo(250, 62); b.lineTo(276, 58); b.lineTo(268, 76); b.closePath(); b.fill(); BX.F(b, 262, 66, 2, 2, "#ff5d5d"); blink.push([263 * 2, 67 * 2]);
    for (let i = 0; i < 3; i++) { BX.F(b, 280 + i * 12, 96, 10, 7, "#2a3a6a"); BX.F(b, 281 + i * 12, 97, 8, 1, "#6fa8ff"); BX.F(b, 284 + i * 12, 103, 2, 7, "#8d97b6"); }
    BX.F(b, 236, 82, 1, 28, "#c9ced8"); BX.F(b, 237, 82, 14, 9, "#d6403d"); BX.F(b, 239, 84, 4, 2, "#ffffff"); BX.F(b, 245, 84, 4, 2, "#ffffff");
    // 탐사차
    BX.F(b, 186, 108, 26, 8, "#d9dee8"); BX.F(b, 186, 108, 26, 1, "#ffffff"); BX.F(b, 190, 104, 10, 4, "#8d97b6"); BX.F(b, 192, 105, 6, 2, "#6fd3ff"); for (const wx of [189, 199, 209]) BX.disc(b, wx, 117, 3, "#2a2e38");
    // 바닥: 크레이터와 발자국
    for (let i = 0; i < 12; i++) crater(b, R() * BW, 128 + R() * 48, 5 + R() * 13, "#7a788a", "#5e5c6e", "#b8b6c6");
    for (let i = 0; i < 12; i++) { const x = 110 + i * 12 + (i % 2) * 3, y = 160 - i * 2.4; BX.F(b, x, y, 3, 2, "#6e6c80"); }
    BX.speck(b, 0, 114, BW, 66, "#b8b6c6", 140, R); BX.speck(b, 0, 114, BW, 66, "#5e5c6e", 140, R);
    // 근경: 어두운 바위
    BX.ridge(fo, BH, 168, 6, "#16161e", R, 7); BX.oval(fo, 52, 170, 18, 10, "#1c1c26"); BX.F(fo, 40, 162, 14, 1, "#3a3a48"); BX.oval(fo, 316, 172, 14, 8, "#1c1c26");
    return { floorGlow: "200,210,255", noReflect: true, dust: "220,220,240", blink };
  },
  mars(L, R, V) {
    const f = L.far.g, m = L.mid.g, b = L.back.g, fo = L.fore.g, smoke = [];
    const P = [
      { sky: [[0, "#5a2018"], [0.5, "#c9603a"], [1, "#ffb37a"]], sun: [96, 34, 7, "#fff0d0", "255,220,170"], m1: "#b8603e", m2: "#8a3a26", haze: "255,170,120", gr: [["#b8583a"], ["#6a2a1a"]], win: "#ffd54a" },
      { sky: [[0, "#2a1a2a"], [0.55, "#8a5a5a"], [0.85, "#9ab0c8"], [1, "#c8e0f0"]], sun: [230, 92, 5, "#ffffff", "170,210,255"], m1: "#7a4a44", m2: "#5a2e28", haze: "170,190,220", gr: [["#9a4a32"], ["#5a2416"]], win: "#ffd54a" },
      { sky: [[0, "#06040c"], [0.6, "#1a1028"], [1, "#3a1e28"]], sun: null, m1: "#4a2a2a", m2: "#36201e", haze: "120,70,70", gr: [["#7a3a28"], ["#3a1a10"]], win: "#ffb36b" },
    ][V];
    BX.vg(f, 0, 0, BW, BH, P.sky); if (V === 2) { BX.stars(f, 90, 100, R); BX.disc(f, 120, 30, 5, "#d9c8b8"); BX.disc(f, 118, 29, 3, "#efe2d4"); BX.disc(f, 210, 22, 3, "#c8b8a8"); }
    if (P.sun) { const [sx, sy, sr, sc, sg] = P.sun; BX.glow(f, sx, sy, sr * 7, sg, 0.45); BX.disc(f, sx, sy, sr, sc); }
    BX.ridge(f, BH, 82, 14, shade(P.m1, 0.15), R, 16); for (let i = 0; i < 3; i++) { const x = 70 + i * 90 + R() * 30, w = 30 + R() * 20; BX.F(f, x, 70 - R() * 8, w, 40, shade(P.m1, 0.15)); BX.F(f, x + 2, 68 - R() * 4, w - 4, 3, shade(P.m1, 0.25)); }
    BX.haze(f, 40, 124, P.haze, 0, 0.5);
    BX.ridge(m, BH, 96, 10, P.m1, R, 10);
    // 공장: 굴뚝(연기), 창 불빛, 돔, 파이프
    for (const [mx, w, h] of [[176, 34, 46], [222, 44, 58], [274, 30, 40]]) {
      BX.F(m, mx, 104 - h, w, h, shade(P.m2, -0.1)); BX.F(m, mx, 104 - h, w, 2, shade(P.m2, 0.2));
      for (let y = 108 - h; y < 100; y += 6) for (let x = mx + 3; x < mx + w - 3; x += 5) if (R() < 0.55) BX.F(m, x, y, 3, 2, P.win);
      const cx = mx + w * 0.6; BX.F(m, cx, 104 - h - 22, 6, 22, shade(P.m2, -0.25)); BX.F(m, cx - 1, 104 - h - 24, 8, 3, shade(P.m2, 0.1)); BX.F(m, cx, 104 - h - 18, 6, 2, "#d6403d"); smoke.push([(cx + 3) * 2, (104 - h - 25) * 2]);
    }
    BX.disc(m, 140, 104, 14, shade(P.m2, 0.25)); BX.F(m, 126, 104, 28, 6, shade(P.m2, 0.05)); BX.disc(m, 136, 99, 7, shade(P.m2, 0.4)); BX.F(m, 120, 100, 160, 2, shade(P.m2, -0.2));
    BX.haze(m, 40, 120, P.haze, 0.05, 0.22);
    // 뒷층: 모래 언덕, 파이프 줄, 울타리, 상자, 탐사차
    BX.ridge(b, BH, 112, 5, shade(P.gr[0][0], -0.1), R, 6);
    BX.vg(b, 0, 118, BW, BH - 118, [[0, P.gr[0][0]], [1, P.gr[1][0]]]);
    for (let y = 124; y < BH; y += 5 + (y - 118) * 0.12) { b.fillStyle = shade(P.gr[0][0], -0.18); let x = 0; while (x < BW) { const w = 6 + R() * 18; b.fillRect(Math.round(x), Math.round(y + Math.sin(x / 9) * 1.5), Math.round(w), 1); x += w + 4 + R() * 10; } }
    for (let i = 0; i < 20; i++) { const x = R() * BW, y = 124 + R() * 54, w = 3 + R() * 6; BX.oval(b, x, y, w, w * 0.45, shade(P.gr[0][0], -0.35)); BX.oval(b, x - 0.5, y - 0.5, w * 0.8, w * 0.3, shade(P.gr[0][0], 0.15)); }
    BX.F(b, 0, 106, BW, 3, "#5a5a68"); BX.F(b, 0, 106, BW, 1, "#8a8a98"); for (let x = 8; x < BW; x += 40) { BX.F(b, x, 104, 6, 7, "#4a4a58"); BX.F(b, x + 2, 109, 2, 9, "#3a3a48"); }
    for (const [x, w] of [[60, 18], [80, 12], [270, 16]]) { BX.F(b, x, 120 - w * 0.6, w, w * 0.6, "#6a5a48"); BX.F(b, x, 120 - w * 0.6, w, 1, "#8a7a62"); BX.F(b, x + w / 2 - 1, 120 - w * 0.6, 2, w * 0.6, "#5a4a3a"); }
    BX.F(b, 100, 112, 30, 8, "#5a5a68"); BX.F(b, 102, 108, 22, 4, "#ffd54a"); BX.F(b, 104, 109, 8, 2, "#2a2e38"); for (const wx of [104, 116, 126]) BX.disc(b, wx, 121, 3, "#2a2e38");
    // 근경: 어두운 바위
    BX.ridge(fo, BH, 166, 8, "#2a0e08", R, 7); BX.oval(fo, 50, 168, 18, 10, "#2a0e08"); BX.F(fo, 40, 160, 16, 1, "#5a2a18");
    return { embers: V === 2 ? "255,140,90" : "255,190,140", smoke, floorGlow: "255,170,110", noReflect: true };
  },
  station(L, R, V) {
    const f = L.far.g, b = L.back.g, fo = L.fore.g, blink = [];
    BX.vg(f, 0, 0, BW, BH, [[0, "#020410"], [1, "#0c1030"]]); BX.stars(f, 140, BH, R);
    BX.glow(f, 230, 40, 70, "200,100,255", 0.2); BX.glow(f, 130, 70, 60, "100,200,255", 0.16);
    const pc = [["#d9784e", "#e8956a", "#b85a3a"], ["#4a8ad6", "#6fa8ff", "#2a5aa8"], ["#9a6ad6", "#c09aff", "#6a3aa8"]][V];
    BX.disc(f, 196, 58, 30, pc[2]); BX.disc(f, 192, 54, 27, pc[0]); BX.disc(f, 186, 48, 12, pc[1]); for (let i = 0; i < 4; i++) BX.oval(f, 196, 46 + i * 9, 28 - Math.abs(i - 1.5) * 4, 1, shade(pc[0], -0.15));
    BX.shadeDisc(f, 192, 54, 27, 210, 68, 26, "rgba(0,0,30,.5)");
    BX.oval(f, 196, 60, 52, 6, "rgba(255,230,200,.45)"); BX.oval(f, 196, 60, 44, 4, "rgba(0,0,0,0)");
    BX.disc(f, 140, 30, 5, "#c9ced8"); BX.disc(f, 139, 29, 3, "#e6ecf6");
    // 정거장 안: 벽판, 큰 전망창, 콘솔, 수경재배 칸, 경고 줄무늬
    BX.F(b, 0, 0, BW, BFL, "#363c50"); for (let x = 0; x < BW; x += 40) for (let y = 0; y < BFL; y += 32) { BX.F(b, x + 1, y + 1, 38, 30, "#40475e"); BX.F(b, x + 3, y + 3, 2, 2, "#5b6274"); BX.F(b, x + 35, y + 3, 2, 2, "#5b6274"); BX.F(b, x + 1, y + 1, 38, 1, "#4a526a"); }
    BX.F(b, 104, 10, 172, 90, "#22262f");
    b.clearRect(110, 16, 160, 78); BX.F(b, 108, 14, 164, 2, "#5b6274"); BX.F(b, 108, 94, 164, 2, "#1a1e26"); BX.F(b, 188, 16, 4, 78, "#22262f"); for (const x of [110, 268]) BX.F(b, x - 2, 16, 2, 78, "#2a2e38");
    BX.glass(b, 110, 16, 160, 78, 0.8);
    BX.F(b, 0, 0, BW, 6, "#1e222c"); for (let x = 0; x < BW; x += 30) BX.F(b, x, 6, 22, 3, "#2a2e38"); BX.F(b, 0, 9, BW, 1, "#6fd3ff");
    // 왼쪽 콘솔
    BX.F(b, 52, 74, 50, 30, "#2a2e38"); BX.F(b, 52, 74, 50, 2, "#4a5060"); for (let i = 0; i < 2; i++) { BX.F(b, 56 + i * 23, 78, 20, 13, "#0c1a24"); BX.F(b, 57 + i * 23, 79, 18, 11, i ? "#103a2a" : "#102a3a"); for (let k = 0; k < 4; k++) BX.F(b, 59 + i * 23, 81 + k * 2.4, 4 + R() * 10, 1, i ? "#7fe3a0" : "#6fd3ff"); }
    for (let k = 0; k < 6; k++) { const c = ["#ff5d5d", "#ffd54a", "#7fe3a0"][k % 3]; BX.F(b, 58 + k * 7, 96, 3, 2, c); blink.push([(59 + k * 7) * 2, 97 * 2]); }
    BX.glow(b, 77, 86, 26, "111,211,255", 0.14);
    // 오른쪽 수경재배 칸 (분홍 조명 + 식물)
    BX.F(b, 280, 30, 36, 74, "#22262f"); BX.F(b, 282, 32, 32, 70, "#2a1e30");
    for (let y = 40; y < 100; y += 20) { BX.F(b, 282, y - 8, 32, 1, "#ff6bd6"); BX.glow(b, 298, y - 6, 18, "255,107,214", 0.2); BX.F(b, 284, y + 4, 28, 3, "#5b6274"); for (let x = 286; x < 312; x += 6) BX.bush(b, x, y + 4, 6, 7, LEAF.green, R, 3); }
    // 경고 줄무늬 + 바닥 조명
    BX.F(b, 0, 104, BW, 8, "#2a2e38"); for (let x = 0; x < BW; x += 16) { b.fillStyle = "#ffd54a"; b.beginPath(); b.moveTo(x, 112); b.lineTo(x + 8, 104); b.lineTo(x + 14, 104); b.lineTo(x + 6, 112); b.closePath(); b.fill(); }
    BX.F(b, 0, 112, BW, 15, "#3a4052"); for (let x = 10; x < BW; x += 40) { BX.F(b, x, 116, 20, 2, "#6fd3ff"); BX.glow(b, x + 10, 117, 14, "111,211,255", 0.2); }
    // 바닥: 금속 격자
    BX.vg(b, 0, BFL, BW, BH - BFL, [[0, "#2e323e"], [1, "#1a1d26"]]); vpLines(b, 190, 96, BFL, 22, "rgba(8,10,16,.55)", 12); vpRows(b, 96, BFL, "rgba(8,10,16,.5)", 3);
    BX.gloss(L, 0.22, BFL, "111,211,255");
    // 근경: 천장 배관, 왼쪽 아래 콘솔 모서리
    BX.F(fo, 0, 0, BW, 7, "#0a0c12"); BX.F(fo, 0, 7, BW, 2, "#1a1e28"); for (let x = 30; x < BW; x += 60) { BX.F(fo, x, 6, 8, 6, "#14161e"); }
    fo.fillStyle = "#0a0c12"; fo.beginPath(); fo.moveTo(40, 180); fo.lineTo(40, 150); fo.lineTo(70, 144); fo.lineTo(84, 160); fo.lineTo(84, 180); fo.closePath(); fo.fill(); BX.F(fo, 46, 150, 6, 2, "#7fe3a0"); BX.F(fo, 56, 148, 6, 2, "#ff5d5d"); BX.F(fo, 66, 146, 4, 2, "#6fd3ff");
    return { floorGlow: "111,211,255", blink, dust: "200,230,255" };
  },
  galaxy(L, R, V) {
    const f = L.far.g, m = L.mid.g, b = L.back.g, fo = L.fore.g;
    BX.vg(f, 0, 0, BW, BH, [[0, "#0a0620"], [0.6, "#2a1050"], [1, "#4a1a5a"]]); BX.stars(f, 160, BH, R, ["#ffffff", "#ffd6f0", "#c8d6ff"]);
    for (let i = 0; i < 7; i++) BX.glow(f, 40 + R() * 260, 20 + R() * 100, 30 + R() * 46, R() < 0.5 ? "255,107,214" : "124,92,255", 0.2);
    // 소용돌이 은하
    for (let i = 0; i < 120; i++) { const a = i * 0.16, r = 2 + i * 0.16; BX.P(f, 250 + Math.cos(a) * r * 1.6, 30 + Math.sin(a) * r * 0.6, i % 3 ? "rgba(255,220,255,.6)" : "#ffffff"); BX.P(f, 250 - Math.cos(a) * r * 1.6, 30 - Math.sin(a) * r * 0.6, i % 3 ? "rgba(220,200,255,.55)" : "#ffffff"); }
    BX.glow(f, 250, 30, 12, "255,240,255", 0.6);
    BX.disc(f, 90, 50, 16, "#6a4ab8"); BX.disc(f, 88, 48, 15, "#7c5cc8"); BX.disc(f, 84, 44, 6, "#9a7ae0"); BX.oval(f, 90, 52, 30, 3, "rgba(255,200,255,.55)");
    // 중경: 떠다니는 화물 컨테이너
    for (let i = 0; i < 5; i++) { const x = 120 + i * 40 + R() * 10, y = 30 + R() * 50, w = 12 + R() * 8, c = ["#c9a26b", "#3b7bd6", "#d6403d", "#7fe3a0", "#ffd54a"][i]; BX.F(m, x, y, w, w * 0.6, shade(c, -0.25)); BX.F(m, x, y, w, 1, shade(c, 0.2)); for (let k = 2; k < w - 1; k += 3) BX.F(m, x + k, y + 1, 1, w * 0.6 - 2, shade(c, -0.4)); }
    BX.tint(m, "120,80,180", 0.3);
    // 뒷층: 간판, 선반 랙, 컨베이어
    BX.F(b, 120, 6, 140, 18, "#1a0f2a"); BX.F(b, 120, 6, 140, 1, "#ff6bd6"); BX.F(b, 120, 23, 140, 1, "#ff6bd6"); BX.glow(b, 190, 15, 60, "255,107,214", 0.15); BX.text(b, "은하 물류센터 · 오늘도 당일배송", 190, 15, "#ffd6f0", 7);
    for (const sx of [48, 262]) { BX.F(b, sx, 28, 4, 82, "#4a35b8"); BX.F(b, sx + 52, 28, 4, 82, "#4a35b8"); for (let y = 40; y < 108; y += 22) { BX.F(b, sx, y, 56, 3, "#6a55d8"); let bx = sx + 5; while (bx < sx + 50) { const w = 8 + R() * 8, h = 7 + R() * 9, c = R() < 0.7 ? "#c9a26b" : ["#3b7bd6", "#d6403d", "#7fe3a0"][Math.floor(R() * 3)]; BX.F(b, bx, y - h, w, h, c); BX.F(b, bx, y - h, w, 1, shade(c, 0.3)); BX.F(b, bx + w / 2 - 1, y - h, 2, h, shade(c, -0.2)); bx += w + 2; } } }
    BX.F(b, 0, 98, BW, 8, "#2a1a5a"); BX.F(b, 0, 98, BW, 1, "#7c5cff"); for (let x = 0; x < BW; x += 8) BX.disc(b, x + 4, 106, 2, "#4a35b8");
    BX.F(b, 0, 108, BW, 19, "#1a0f2a"); BX.F(b, 0, 108, BW, 1, "#4a35b8");
    // 로봇 팔
    BX.F(b, 140, 60, 8, 38, "#c9ced8"); BX.F(b, 140, 60, 2, 38, "#ffffff"); BX.F(b, 134, 56, 34, 6, "#c9ced8"); BX.F(b, 164, 56, 4, 14, "#c9ced8"); BX.F(b, 160, 70, 12, 3, "#ffd54a"); BX.disc(b, 144, 60, 4, "#7c5cff");
    // 바닥: 네온 격자
    BX.F(b, 0, BFL, BW, BH - BFL, "#160a28"); vpLines(b, 190, 90, BFL, 24, "rgba(255,107,214,.35)", 12); vpRows(b, 90, BFL, "rgba(255,107,214,.3)", 3);
    BX.gloss(L, 0.25, BFL, "255,107,214");
    // 근경: 택배 상자 더미
    for (const [x, y, w, h] of [[44, 156, 30, 24], [70, 164, 20, 16], [50, 140, 20, 16]]) { BX.F(fo, x, y, w, h, "#1a1008"); BX.F(fo, x, y, w, 1, "#3a2a18"); BX.F(fo, x + w / 2 - 1, y, 2, h, "#2a1a0e"); }
    return { sparkles: ["#ffffff", "#ff9be0", "#c9a6ff"], floorGlow: "255,107,214", conveyor: [99 * 2, 0, BW * 2], dust: "255,200,255" };
  },
  blackhole(L, R, V) {
    const f = L.far.g, m = L.mid.g, b = L.back.g, fo = L.fore.g, cx = 190, cy = 54;
    BX.F(f, 0, 0, BW, BH, "#020205"); BX.stars(f, 110, BH, R, ["#8d8a96", "#ffffff", "#c9a6ff"]);
    for (let i = 0; i < 40; i++) { const a = R() * 6.28, r = 60 + R() * 120; f.strokeStyle = "rgba(200,190,255,.25)"; f.lineWidth = 1; f.beginPath(); f.arc(cx, cy, r, a, a + 0.08 + R() * 0.1); f.stroke(); }
    BX.glow(f, cx, cy, 120, "124,92,255", 0.18); BX.glow(f, cx, cy, 70, "255,154,59", 0.18);
    for (let i = 9; i >= 0; i--) { f.strokeStyle = `rgba(${i % 2 ? "255,154,59" : "255,213,120"},${0.12 + (9 - i) * 0.05})`; f.lineWidth = 7 - i * 0.55; f.beginPath(); f.ellipse(cx, cy, 64 + i * 10, 12 + i * 2.6, -0.1, 0, Math.PI * 2); f.stroke(); }
    BX.disc(f, cx, cy, 22, "#000000");
    f.strokeStyle = "rgba(255,230,160,.85)"; f.lineWidth = 1.5; f.beginPath(); f.arc(cx, cy, 23.5, 0, Math.PI * 2); f.stroke();
    f.strokeStyle = "rgba(255,180,90,.5)"; f.lineWidth = 3; f.beginPath(); f.ellipse(cx, cy - 4, 30, 20, 0, Math.PI * 1.05, Math.PI * 1.95); f.stroke();
    f.strokeStyle = "rgba(255,200,120,.8)"; f.lineWidth = 2.5; f.beginPath(); f.ellipse(cx, cy + 2, 70, 9, -0.1, 0.05, Math.PI - 0.05); f.stroke();
    // 중경: 빨려 드는 서류·동전·의자
    for (let i = 0; i < 18; i++) { const a = R() * 6.28, r = 50 + R() * 90, x = cx + Math.cos(a) * r * 1.4, y = cy + Math.sin(a) * r * 0.55; if (y > 112) continue; const k = R(); if (k < 0.5) { BX.F(m, x, y, 4, 3, "#e9edf6"); BX.F(m, x, y + 1, 4, 1, "#9aa3b8"); } else if (k < 0.8) BX.disc(m, x, y, 1.5, "#ffd54a"); else { BX.F(m, x, y, 5, 2, "#3a3a48"); BX.F(m, x + 1, y - 4, 3, 4, "#2a2a38"); } }
    // 뒷층: 깨진 바닥 가장자리 + 부서진 책상
    BX.F(b, 0, BFL - 4, BW, 4, "#7c5cff"); BX.glow(b, cx, BFL, 130, "124,92,255", 0.12);
    BX.F(b, 0, BFL, BW, BH - BFL, "#0a0a12"); vpLines(b, cx, 70, BFL, 20, "rgba(124,92,255,.32)", 14); vpRows(b, 70, BFL, "rgba(124,92,255,.26)", 3);
    for (let i = 0; i < 8; i++) { const x = 40 + i * 40 + R() * 20; b.fillStyle = "#020205"; b.beginPath(); b.moveTo(x, BFL - 4); b.lineTo(x + 6 + R() * 8, BFL - 4); b.lineTo(x + 3, BFL + 2 + R() * 3); b.closePath(); b.fill(); }
    BX.F(b, 60, 110, 30, 4, "#3a3a48"); BX.F(b, 62, 114, 3, 13, "#2a2a38"); BX.F(b, 84, 114, 3, 9, "#2a2a38"); BX.F(b, 66, 106, 10, 4, "#e9edf6"); BX.F(b, 78, 104, 8, 6, "#1b1f2a"); BX.F(b, 79, 105, 6, 3, "#ff5d5d");
    BX.F(b, 276, 116, 22, 3, "#3a3a48"); BX.F(b, 280, 119, 2, 8, "#2a2a38"); BX.F(b, 292, 119, 2, 8, "#2a2a38"); BX.text(b, "적자", 287, 112, "#ff5d5d", 5);
    BX.gloss(L, 0.2, BFL, "124,92,255");
    // 근경: 떠도는 바위 조각
    BX.ridge(fo, BH, 170, 6, "#030305", R, 9); BX.oval(fo, 52, 172, 16, 8, "#06060c"); BX.F(fo, 40, 166, 12, 1, "#2a2050");
    return { sparkles: ["#ffb36b", "#c9a6ff"], floorGlow: "124,92,255", swirl: [cx * 2, cy * 2] };
  },
  timespace(L, R, V) {
    const f = L.far.g, m = L.mid.g, b = L.back.g, fo = L.fore.g, clocks = [];
    BX.vg(f, 0, 0, BW, BH, [[0, "#140a28"], [0.6, "#3a1f5a"], [1, "#6a3a6a"]]); BX.stars(f, 60, 130, R, ["#ffd54a", "#ffffff"]);
    // 거대한 시계판(희미하게) + 시간 고리
    BX.glow(f, 190, 64, 100, "255,200,120", 0.16);
    f.strokeStyle = "rgba(255,213,120,.28)"; f.lineWidth = 2; f.beginPath(); f.arc(190, 64, 62, 0, Math.PI * 2); f.stroke(); f.lineWidth = 1; f.beginPath(); f.arc(190, 64, 56, 0, Math.PI * 2); f.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; BX.F(f, 190 + Math.cos(a) * 50 - 1, 64 + Math.sin(a) * 50 - 2, 2, 4, "rgba(255,213,120,.35)"); }
    for (let i = 0; i < 3; i++) { f.strokeStyle = `rgba(200,160,255,${0.2 - i * 0.05})`; f.lineWidth = 1; f.beginPath(); f.ellipse(190, 70, 120 + i * 30, 18 + i * 6, 0.12 * (i - 1), 0, Math.PI * 2); f.stroke(); }
    BX.haze(f, 60, 140, "200,150,220", 0, 0.35);
    // 중경: 떠 있는 시계 + 톱니
    for (let i = 0; i < 6; i++) { const x = 60 + i * 46 + R() * 16, y = 18 + R() * 64, r = 5 + R() * 7; BX.disc(m, x, y, r + 1.5, "#c9a43a"); BX.disc(m, x, y, r, "#fff4e0"); BX.P(m, x, y - r + 1.5, "#2a2206"); BX.P(m, x + r - 1.5, y, "#2a2206"); clocks.push([x * 2, y * 2, r * 2]); }
    gear(m, 96, 92, 9, "#6a4a8a", "#3a1f5a", 10); gear(m, 286, 70, 12, "#6a4a8a", "#3a1f5a", 12); gear(m, 300, 88, 6, "#7a5a9a", "#3a1f5a", 8);
    BX.tint(m, "120,90,160", 0.2);
    // 뒷층: 금빛 기둥, 떠 있는 계단, 이사회 탁자, 모래시계
    for (const x of [52, 300]) BX.column(b, x, 20, BFL, 14, "#5a3e7a", "#7a5e9a", "#3a2a5a", "#c9a43a");
    for (let i = 0; i < 6; i++) { BX.F(b, 74 + i * 14, 108 - i * 9, 22, 4, "#5a3e7a"); BX.F(b, 74 + i * 14, 108 - i * 9, 22, 1, "#c9a43a"); }
    BX.F(b, 150, 100, 110, 6, "#3a2010"); BX.F(b, 150, 100, 110, 1, "#c9a43a"); BX.F(b, 154, 106, 4, 21, "#2a1808"); BX.F(b, 252, 106, 4, 21, "#2a1808");
    for (let x = 160; x < 256; x += 22) { BX.F(b, x, 82, 12, 18, "#4a2a6a"); BX.F(b, x + 1, 80, 10, 3, "#c9a43a"); BX.F(b, x + 2, 84, 8, 12, "#5a3a7a"); }
    BX.F(b, 268, 86, 12, 2, "#c9a43a"); BX.F(b, 268, 108, 12, 2, "#c9a43a"); b.fillStyle = "rgba(220,240,255,.5)"; b.beginPath(); b.moveTo(270, 88); b.lineTo(278, 88); b.lineTo(275, 98); b.lineTo(278, 108); b.lineTo(270, 108); b.lineTo(273, 98); b.closePath(); b.fill(); BX.F(b, 271, 103, 6, 5, "#ffd54a"); BX.F(b, 273, 92, 2, 3, "#ffd54a");
    BX.F(b, 0, BFL - 2, BW, 3, "#ffd54a");
    BX.checker(b, BFL, "#3a2a5a", "#2a1a4a", 190, 26, R, 10); BX.gloss(L, 0.26, BFL, "255,213,140");
    BX.haze(b, BFL - 30, BFL + 20, "255,213,140", 0, 0.1);
    // 근경: 큰 톱니(왼쪽 아래), 시계(오른쪽 위)
    gear(fo, 50, 182, 26, "#12081e", "#05020a", 14); BX.disc(fo, 50, 182, 8, "#2a1a40");
    return { clocks, sparkles: ["#ffd54a", "#ffffff"], floorGlow: "255,213,140", dust: "255,230,180" };
  },
  vault(L, R, V) {
    const f = L.far.g, b = L.back.g, fo = L.fore.g, vx = 190, vy = 66;
    // 원경: 금고 안쪽으로 이어지는 통로
    BX.vg(f, 0, 0, BW, BH, [[0, "#06080e"], [1, "#101624"]]);
    for (let x = 0; x < BW; x++) { const d = Math.abs(x - vx); if (d < 12) continue; const top = vy - d * 0.7, bot = vy + d * 0.56; BX.F(f, x, top, 1, bot - top, "#141c2c"); const n = Math.max(2, Math.round((bot - top) / 6)); for (let s = 0; s < n; s++) BX.F(f, x, top + (bot - top) * s / n, 1, 1, "#22304a"); if (Math.floor(Math.log(d) * 8) % 2) BX.F(f, x, top, 1, bot - top, "rgba(40,56,90,.3)"); }
    BX.glow(f, vx, vy, 50, "255,213,74", 0.45); BX.F(f, vx - 10, vy - 9, 20, 16, "#ffd54a"); BX.F(f, vx - 8, vy - 7, 16, 12, "#fff0b0");
    BX.tint(f, "255,200,90", [0.05, 0.2], 0, BH);
    // 뒷층: 양옆 보관함 벽, 둥근 금고 문(열림), 금괴·금화 더미
    for (const [x0, x1] of [[44, 120], [262, 320]]) { BX.F(b, x0, 0, x1 - x0, BFL, "#1a2030"); for (let x = x0 + 2; x < x1 - 2; x += 15) for (let y = 4; y < 120; y += 13) { BX.F(b, x, y, 13, 11, "#28324c"); BX.F(b, x, y, 13, 1, "#3a4666"); BX.F(b, x + 5, y + 4, 3, 3, "#c9a43a"); BX.P(b, x + 6, y + 5, "#14161c"); } }
    BX.F(b, 120, 0, 142, 10, "#10141e"); BX.F(b, 120, 10, 142, 1, "#c9a43a");
    BX.disc(b, 132, 70, 30, "#3a4048"); BX.disc(b, 130, 70, 27, "#5a6068"); BX.ring(b, 130, 70, 27, "#2a3036"); BX.ring(b, 130, 70, 20, "#4a5058"); BX.disc(b, 130, 70, 8, "#c9a43a"); BX.disc(b, 129, 69, 5, "#ffe08a"); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; BX.F(b, 130 + Math.cos(a) * 14 - 1, 70 + Math.sin(a) * 14 - 1, 3, 3, "#8d97b6"); }
    BX.F(b, 156, 64, 8, 12, "#2a3036");
    const pile = (x, y, w, h) => { for (let r = 0; r < h; r++) { const ww = w * (1 - r / h); for (let i = 0; i < ww; i += 3) { BX.oval(b, x - ww / 2 + i + (r % 2) * 1.5, y - r * 2, 2, 1, (i + r) % 3 ? "#c9a43a" : "#ffd54a"); } } BX.glow(b, x, y - h, w, "255,213,74", 0.2); };
    pile(232, 126, 40, 9); pile(84, 126, 30, 7);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3 - (i > 1 ? 1 : 0); j++) { const x = 244 + j * 9 + (i % 2) * 4, y = 114 - i * 3; BX.F(b, x, y, 8, 3, "#e0b030"); BX.F(b, x, y, 8, 1, "#ffe08a"); }
    BX.shaft(b, 170, 40, 150, 80, 10, BH, "255,213,74", 0.08);
    // 바닥: 어두운 대리석 + 금빛 반사
    BX.checker(b, BFL, "#262e42", "#1c2232", 190, 28, R, 12); BX.gloss(L, 0.3, BFL, "255,213,74");
    BX.pool(b, 190, 150, 100, 14, "255,213,74", 0.1);
    // 근경: 금화 더미
    for (let r = 0; r < 8; r++) for (let i = 0; i < 30 - r * 3; i += 3) BX.oval(fo, 34 + i + r * 1.5, 182 - r * 2.2, 2.2, 1.1, (i + r) % 3 ? "#8a6a1a" : "#c9a43a");
    return { dust: "255,226,170", floorGlow: "255,213,74", sparkles: ["#ffe08a", "#ffffff"] };
  },
};
const BG2 = Object.assign({}, BG2_A, BG2_B, BG2_C);
function g2Hole(g, cx, cy, r) { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); g.clearRect(cx - w, cy + y, w * 2 + 1, 1); } }
/* 구역 → 그림 묶음 (구역·변형별로 기억). 먼 층·중간 층·근경은 반 해상도 그대로 두고 그릴 때 2배로 키움 */
const bgCache = new Map();
function buildBgSet(floor, vault) {
  const zi = vault ? 99 : zoneNo(floor) % ZONES.length, kind = vault ? "vault" : ZONES[zi].bg, variant = vault ? 0 : Math.floor(((floor - 1) % ZONE_LEN) / 17), key = kind + ":" + variant;
  if (bgCache.has(key)) { const hit = bgCache.get(key); bgCache.delete(key); bgCache.set(key, hit); return hit; }
  const R = rng(7919 * (zi + 1) + variant * 131);
  const L = { far: bgLayer(), mid: bgLayer(), back: bgLayer(), fore: bgLayer() };
  if (!L.far.g || !L.far.g.fillRect) return null;
  bgRec = { texts: [], stars: [] };
  let amb = {};
  try { amb = (BG2[kind] || BG2.lobby)(L, R, variant) || {}; } catch (e) { console.warn("bg2", kind, e); return null; }
  const back = document.createElement("canvas"); back.width = W; back.height = H;
  const bg2 = back.getContext("2d"); bg2.imageSmoothingEnabled = false; bg2.drawImage(L.back.c, 0, 0, W, H);
  amb.city = !!bgRec.city;
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
/* 다음 배경(다음 시간대·다음 구역)을 미리 그려 두기: 바뀌는 순간 끊김이 없게 */
let bgPrefT = 0;
function bgPrefetch(floor) {
  clearTimeout(bgPrefT);
  const off = (floor - 1) % ZONE_LEN, v = Math.floor(off / 17), next = v < 2 ? floor - off + (v + 1) * 17 : floor - off + ZONE_LEN;
  bgPrefT = setTimeout(() => { try { buildBgSet(next, false); } catch (e) {} }, 1500);
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
    if (bgSet.amb.search && !reduceMotion) for (let i = 0; i < 2; i++) { const bx = 230 + i * 260, by = 250, a = -Math.PI / 2 + Math.sin(t / (2600 + i * 900) + i * 2) * 0.55, L2 = 300; const gr = ctx.createLinearGradient(bx, by, bx + Math.cos(a) * L2, by + Math.sin(a) * L2); gr.addColorStop(0, "rgba(220,230,255,.16)"); gr.addColorStop(1, "rgba(220,230,255,0)"); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(bx - 4, by); ctx.lineTo(bx + Math.cos(a - 0.07) * L2, by + Math.sin(a - 0.07) * L2); ctx.lineTo(bx + Math.cos(a + 0.07) * L2, by + Math.sin(a + 0.07) * L2); ctx.lineTo(bx + 4, by); ctx.closePath(); ctx.fill(); }
    if (bgSet.amb.smoke && !reduceMotion) bgSet.amb.smoke.forEach(([x, y], i) => { for (let k = 0; k < 6; k++) { const p = ((t / 2600 + k / 6 + i * 0.37) % 1), r = 5 + p * 22; ctx.fillStyle = `rgba(${p < 0.15 ? "120,90,80" : "90,70,70"},${0.32 * (1 - p)})`; ctx.beginPath(); ctx.arc(x + p * 70 + Math.sin(t / 900 + k + i) * 4, y - p * 90, r, 0, 7); ctx.fill(); } });
    if (bgSet.amb.blink) bgSet.amb.blink.forEach(([x, y], i) => { const on = Math.sin(t / 520 + i * 2.1) > 0.35; if (!on) return; ctx.fillStyle = "#ff4a4a"; ctx.fillRect(x - 1, y - 1, 3, 2); ctx.fillStyle = "rgba(255,74,74,.25)"; ctx.fillRect(x - 3, y - 3, 7, 6); });
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
/* 구역별 움직이는 장식: 꽃잎, 김, 서버 불빛, 프로젝터 빛, 불티, 반짝이, 시계 바늘, 전광판, 헬기장 불빛, 꼬마전구 */
const BG_TICKER = [["야근지수 ▲12.4%", "#ff5d5d"], ["커피 소비 ▲25%", "#ff5d5d"], ["정시퇴근 ▼3.1%", "#7fe3a0"], ["회의 시간 ▲40분", "#ff5d5d"], ["월급 →0.0%", "#ffd54a"], ["간식 재고 ▼80%", "#7fe3a0"], ["칭찬 지수 ▲1.2%", "#ffd54a"]];
let bgParts = [];
function drawBgAmbient(t) {
  if (!bgSet) return; const a = bgSet.amb;
  if (a.leds) a.leds.forEach(([x, y, c], i) => { if (Math.sin(t / (180 + (i % 7) * 60) + i * 1.7) > 0.2) { ctx.fillStyle = c; ctx.fillRect(x - 2, y, 4, 2); ctx.fillStyle = hexA(c, 0.25); ctx.fillRect(x - 5, y - 2, 10, 6); } });
  if (a.beam) { const [x0, y0, x1, y1, bw] = a.beam, al = 0.08 + 0.025 * Math.sin(t / 90) + 0.015 * Math.sin(t / 23); const gr = ctx.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(235,245,255,${al * 2.2})`); gr.addColorStop(1, `rgba(235,245,255,${al * 0.6})`); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x0 - 3, y0); ctx.lineTo(x0 + 3, y0); ctx.lineTo(x1 + bw / 2, y1); ctx.lineTo(x1 - bw / 2, y1); ctx.closePath(); ctx.fill(); }
  if (a.steam) a.steam.forEach(([x, y], i) => { for (let k = 0; k < 4; k++) { const p = ((t / 1600 + k / 4 + i * 0.13) % 1), r = 4 + p * 10; ctx.fillStyle = `rgba(255,255,255,${0.18 * (1 - p)})`; ctx.beginPath(); ctx.arc(x + Math.sin(t / 500 + k * 2 + i) * 5 * p, y - p * 46, r, 0, 7); ctx.fill(); } });
  if (a.clocks) a.clocks.forEach(([x, y, r], i) => { const h = t / (900 + i * 300) + i, m = t / (140 + i * 40); ctx.strokeStyle = "#2a2206"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(h) * r * 0.5, y + Math.sin(h) * r * 0.5); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(m) * r * 0.8, y + Math.sin(m) * r * 0.8); ctx.stroke(); });
  if (a.swirl) { const [x, y] = a.swirl; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12); for (let i = 0; i < 14; i++) { const ang = t / 700 + i / 14 * Math.PI * 2, rx = 160 + (i % 3) * 18, ry = 32 + (i % 3) * 5; ctx.fillStyle = i % 2 ? "rgba(255,180,90,.7)" : "rgba(180,150,255,.6)"; ctx.fillRect(Math.cos(ang) * rx - 2, Math.sin(ang) * ry - 1, 4, 2); } ctx.restore(); }
  if (a.conveyor) { const [y, x0, x1] = a.conveyor, sp = 64, off = (t / 30) % sp; for (let x = x0 - sp + off; x < x1; x += sp) { const k = Math.floor((x - off) / sp) & 3, w = [20, 16, 24, 18][k], h = [14, 12, 16, 10][k]; ctx.fillStyle = "#a8845a"; ctx.fillRect(x, y - h, w, h); ctx.fillStyle = "#c8a47a"; ctx.fillRect(x, y - h, w, 2); ctx.fillStyle = "#8a6a42"; ctx.fillRect(x + w / 2 - 2, y - h, 4, h); ctx.fillStyle = "#f4ecd0"; ctx.fillRect(x + 3, y - h + 5, 6, 3); } }
  if (a.ticker) { const [x, y, w, h] = a.ticker; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.font = `${h - 2}px "Do Hyeon", sans-serif`; ctx.textBaseline = "middle"; ctx.textAlign = "left"; const msg = BG_TICKER, tw = ctx.measureText(msg.map(m => m[0]).join("   ")).width + 60; let ox = x + w - ((t / 28) % (tw + w)); msg.forEach(([s, c]) => { ctx.fillStyle = c; ctx.fillText(s, ox, y + h / 2 + 1); ox += ctx.measureText(s + "   ").width; }); ctx.restore(); }
  if (a.padLights) a.padLights.forEach(([x, y], i) => { const on = ((i - t / 140) % 12 + 12) % 12 < 2.2; ctx.fillStyle = on ? "#fff4a0" : "rgba(255,213,74,.35)"; ctx.fillRect(x - 2, y - 1, 4, 3); if (on) { ctx.fillStyle = "rgba(255,230,120,.25)"; ctx.fillRect(x - 6, y - 4, 12, 9); } });
  if (a.fairy) a.fairy.forEach(([x0, y0, w, sag]) => { for (let i = 0; i <= 20; i++) { const x = x0 + w * 2 * i / 20, y = y0 + Math.sin(i / 20 * Math.PI) * sag + 2, tw = 0.55 + 0.45 * Math.sin(t / 380 + i * 1.9); ctx.fillStyle = `rgba(255,230,140,${0.18 * tw})`; ctx.fillRect(x - 4, y - 3, 9, 8); ctx.fillStyle = `rgba(255,240,170,${0.6 + 0.4 * tw})`; ctx.fillRect(x - 1, y, 2, 2); } });
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
