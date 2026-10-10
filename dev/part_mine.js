/* ===================== 공부 탭 광산: 수정 동굴 (7층마다 동굴 색이 바뀜: 청록 → 은빛 얼음 → 자수정 → 용암) =====================
   멈춰 있는 배경은 한 번만 그려 두고, 매 프레임에는 수정 빛, 떠다니는 빛가루, 곽준영의 곡괭이질, 튀는 광석만 그린다. */
const MINE_W = 320, MINE_H = 150, MINE_GY = 120;
const MINE_THEMES = [
  { n: "청록 수정 동굴", sky: ["#061019", "#0f2c40", "#2b7088"], rock: "#0a1823", rock2: "#15303f", rock3: "#24506a", cry: ["#6fd3ff", "#d6f6ff", "#2a86b0"], glow: "111,211,255", floor: "#0d1d29", floor2: "#173446", water: "#1a4c66" },
  { n: "은빛 얼음 동굴", sky: ["#0a101c", "#25344f", "#7f97bd"], rock: "#121a29", rock2: "#243049", rock3: "#3c4d6e", cry: ["#e3e9f5", "#ffffff", "#8d9bc0"], glow: "225,236,255", floor: "#161e2f", floor2: "#2a3753", water: "#3a4f73" },
  { n: "자수정 동굴", sky: ["#0f0819", "#331d55", "#8550bf"], rock: "#140b22", rock2: "#2a1844", rock3: "#46296e", cry: ["#c9a6ff", "#f3e8ff", "#7446d0"], glow: "205,166,255", floor: "#1a102c", floor2: "#2f1c4d", water: "#3f2a6b" },
  { n: "용암 수정 동굴", sky: ["#150806", "#4c1a10", "#d8662f"], rock: "#170a08", rock2: "#341710", rock3: "#5a2a18", cry: ["#ffb36b", "#fff0c4", "#d9452c"], glow: "255,160,80", floor: "#1e0d0a", floor2: "#3a1a10", water: "#7a2e12" },
];
var mineBgCache, mineParts = [], mineLast = 0, mineHitT = 0, mineHitCyc = -1, mineCrys = null;
const mineTheme = depth => MINE_THEMES[Math.floor(depth / 7) % MINE_THEMES.length];
/* 픽셀 계단 모양 종유석(위에서 아래로) / 석순(아래에서 위로) */
function mineSpike(g, cx, y0, w, h, col, up, hi) {
  const rows = Math.max(1, Math.round(h / 3));
  for (let i = 0; i < rows; i++) {
    const t = i / rows, ww = Math.max(1, Math.round(w * (1 - t) * (0.85 + 0.15 * Math.cos(t * 9)))), y = up ? y0 - (i + 1) * 3 : y0 + i * 3;
    g.fillStyle = col; g.fillRect(Math.round(cx - ww / 2), y, ww, 3);
    if (hi && ww > 2) { g.fillStyle = hi; g.fillRect(Math.round(cx - ww / 2), y, 1, 3); }
  }
}
/* 수정 한 조각: 줄마다 사각형으로 채워 테두리가 또렷한 도트 느낌 */
function mineShard(g, x, yb, w, h, lean, cols) {
  for (let y = 0; y < h; y++) {
    const t = y / h, hw = Math.max(0.5, (w / 2) * (t < 0.72 ? 1 : 1 - (t - 0.72) / 0.28)), cx = x + lean * t;
    const l = Math.round(cx - hw), r = Math.round(cx + hw), m = Math.round(cx);
    g.fillStyle = cols[1]; g.fillRect(l, yb - y, Math.max(1, m - l), 1);
    g.fillStyle = cols[0]; g.fillRect(m, yb - y, Math.max(1, r - m), 1);
    g.fillStyle = cols[2]; g.fillRect(r - 1, yb - y, 1, 1);
  }
}
function mineCluster(g, x, yb, s, cols, R) {
  const n = 3 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) {
    const k = i - (n - 1) / 2, h = Math.round(s * (0.55 + R() * 0.5) * (1 - Math.abs(k) * 0.18));
    mineShard(g, x + k * s * 0.32, yb, Math.max(3, Math.round(s * 0.26)), h, k * s * 0.22, cols);
  }
}
function mineBg(ti, band) {
  mineBgCache = mineBgCache || new Map();
  const key = ti + "|" + band; if (mineBgCache.has(key)) return mineBgCache.get(key);
  const c = document.createElement("canvas"); c.width = MINE_W; c.height = MINE_H;
  const g = c.getContext && c.getContext("2d"); if (!g || !g.fillRect) { mineBgCache.set(key, null); return null; }
  const th = MINE_THEMES[ti], R = rng(9001 + band * 131 + ti * 7);
  // 하늘(동굴 안쪽 빛)
  const gr = g.createLinearGradient(0, 0, 0, MINE_H); gr.addColorStop(0, th.sky[0]); gr.addColorStop(0.55, th.sky[1]); gr.addColorStop(1, th.sky[2]);
  g.fillStyle = gr; g.fillRect(0, 0, MINE_W, MINE_H);
  const rg = g.createRadialGradient(214, 92, 6, 214, 92, 150); rg.addColorStop(0, `rgba(${th.glow},.45)`); rg.addColorStop(1, `rgba(${th.glow},0)`);
  g.fillStyle = rg; g.fillRect(0, 0, MINE_W, MINE_H);
  // 먼 기둥과 석순 (흐릿하게)
  g.globalAlpha = 0.55;
  for (let i = 0; i < 9; i++) mineSpike(g, 10 + i * 38 + R() * 20, MINE_GY - 2, 14 + R() * 18, 30 + R() * 50, th.rock3, true);
  for (let i = 0; i < 12; i++) mineSpike(g, R() * MINE_W, 0, 10 + R() * 16, 20 + R() * 40, th.rock3, false);
  g.globalAlpha = 1;
  // 빛줄기
  g.fillStyle = "rgba(255,255,255,.05)";
  [[150, 34], [205, 22], [250, 30]].forEach(([x, w]) => { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w + 46, MINE_GY); g.lineTo(x + 30, MINE_GY); g.closePath(); g.fill(); });
  // 먼 수정 무리
  g.globalAlpha = 0.6;
  for (let i = 0; i < 4; i++) mineCluster(g, 120 + i * 52 + R() * 20, MINE_GY - 4, 12 + R() * 8, th.cry, R);
  g.globalAlpha = 1;
  // 가까운 종유석
  for (let i = 0; i < 14; i++) mineSpike(g, R() * MINE_W, 0, 8 + R() * 22, 12 + R() * 34, R() < 0.5 ? th.rock : th.rock2, false, th.rock3);
  // 바닥
  g.fillStyle = th.floor; g.fillRect(0, MINE_GY, MINE_W, MINE_H - MINE_GY);
  for (let x = 0; x < MINE_W; x += 4) { const hgt = Math.round(R() * 3); g.fillStyle = th.floor2; g.fillRect(x, MINE_GY - hgt, 4, hgt + 2); }
  for (let i = 0; i < 26; i++) { g.fillStyle = R() < 0.5 ? th.floor2 : th.rock; g.fillRect(Math.round(R() * MINE_W), MINE_GY + 4 + Math.round(R() * 24), 2 + Math.round(R() * 4), 2); }
  // 오른쪽 물웅덩이와 비친 빛
  g.fillStyle = th.water; g.fillRect(236, 128, 84, 12); g.fillRect(244, 126, 70, 2); g.fillRect(248, 140, 64, 3);
  g.fillStyle = `rgba(${th.glow},.35)`; for (let i = 0; i < 6; i++) g.fillRect(244 + Math.round(R() * 60), 129 + Math.round(R() * 10), 6 + Math.round(R() * 10), 1);
  // 레일
  g.fillStyle = "#2a1d14"; for (let x = 2; x < 150; x += 9) g.fillRect(x, MINE_GY + 3, 5, 3);
  g.fillStyle = "#8d97b6"; g.fillRect(0, MINE_GY + 2, 150, 1); g.fillStyle = "#5a6482"; g.fillRect(0, MINE_GY + 5, 150, 1);
  // 캐는 광맥 바위
  for (let y = 0; y < 44; y++) {
    const t = y / 44, hw = Math.round(30 * Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.62) / 0.62, 2))));
    if (hw <= 0) continue; g.fillStyle = y < 3 ? th.rock3 : th.rock2; g.fillRect(232 - hw, MINE_GY - 44 + y, hw * 2, 1);
    g.fillStyle = th.rock; g.fillRect(232 + hw - 4, MINE_GY - 44 + y, 4, 1);
    g.fillStyle = th.rock3; g.fillRect(232 - hw, MINE_GY - 44 + y, 2, 1);
  }
  const R2 = rng(77 + ti); mineCrys = [];
  for (let i = 0; i < 9; i++) { const x = 212 + Math.round(R2() * 36), y = MINE_GY - 36 + Math.round(R2() * 30); g.fillStyle = th.cry[i % 2 ? 0 : 2]; g.fillRect(x, y, 3, 3); g.fillStyle = th.cry[1]; g.fillRect(x, y, 1, 1); mineCrys.push([x + 1, y + 1]); }
  // 앞쪽 큰 수정 무리 (왼쪽 벽, 오른쪽 앞)
  mineCluster(g, 18, MINE_GY + 2, 30, th.cry, R); mineCluster(g, 300, MINE_GY + 8, 34, th.cry, R); mineCluster(g, 112, MINE_GY + 4, 16, th.cry, R);
  // 가장자리 어둡게
  const vg = g.createRadialGradient(MINE_W / 2, MINE_H * 0.55, MINE_H * 0.35, MINE_W / 2, MINE_H * 0.55, MINE_W * 0.66);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.55)"); g.fillStyle = vg; g.fillRect(0, 0, MINE_W, MINE_H);
  mineBgCache.set(key, c); return c;
}
function drawMine(depth, running, now) {
  const c = $("mineCv"); if (!c || !c.getContext) return; const g = c.getContext("2d"); if (!g) return;
  now = now || performance.now(); g.imageSmoothingEnabled = false;
  const ti = Math.floor(depth / 7) % MINE_THEMES.length, th = MINE_THEMES[ti], bg = mineBg(ti, Math.floor(depth / 7));
  if (bg) g.drawImage(bg, 0, 0); else { g.fillStyle = th.sky[1]; g.fillRect(0, 0, MINE_W, MINE_H); }
  const t = now / 1000;
  // 수정 빛 숨쉬기
  g.save(); g.globalCompositeOperation = "lighter";
  [[18, 98, 34], [300, 102, 38], [112, 108, 18], [232, 92, 30]].forEach(([x, y, r], i) => {
    const a = 0.18 + 0.1 * Math.sin(t * 1.7 + i * 1.9), rg = g.createRadialGradient(x, y, 1, x, y, r);
    rg.addColorStop(0, `rgba(${th.glow},${a})`); rg.addColorStop(1, `rgba(${th.glow},0)`); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
  });
  // 떠다니는 빛가루
  for (let i = 0; i < 16; i++) {
    const px = (i * 61 + t * (6 + (i % 5) * 2)) % MINE_W, py = MINE_GY - 10 - ((i * 37 + t * (5 + i % 4)) % 90), tw = 0.5 + 0.5 * Math.sin(t * 3 + i);
    g.fillStyle = `rgba(${th.glow},${0.35 + 0.45 * tw})`; g.fillRect(Math.round(px), Math.round(py), i % 3 ? 1 : 2, i % 3 ? 1 : 2);
  }
  g.restore();
  // 광석 수레 (오늘 캔 만큼 쌓임)
  const fill = Math.min(1, (S.study.today || 0) / 120), cx = 34, cy = MINE_GY - 4;
  g.fillStyle = "#140f1c"; g.fillRect(cx - 21, cy - 19, 42, 18);
  g.fillStyle = "#6e3e1a"; g.fillRect(cx - 20, cy - 18, 40, 16); g.fillStyle = "#9a5f2c"; g.fillRect(cx - 20, cy - 18, 40, 3); g.fillStyle = "#4a2810"; g.fillRect(cx - 20, cy - 5, 40, 3);
  g.fillStyle = "#8d97b6"; g.fillRect(cx - 14, cy - 18, 2, 16); g.fillRect(cx + 12, cy - 18, 2, 16);
  if (fill > 0) { const hh = Math.round(3 + fill * 9); for (let x = -18; x < 18; x += 3) { const hgt = Math.round(hh * (1 - Math.abs(x) / 26)); g.fillStyle = (x / 3) % 2 ? th.cry[0] : th.cry[2]; g.fillRect(cx + x, cy - 18 - hgt, 3, hgt); g.fillStyle = th.cry[1]; g.fillRect(cx + x, cy - 18 - hgt, 1, 1); } }
  g.fillStyle = "#140f1c"; [cx - 12, cx + 12].forEach(x => { g.fillRect(x - 4, cy - 3, 8, 7); }); g.fillStyle = "#5a6482"; [cx - 12, cx + 12].forEach(x => { g.fillRect(x - 3, cy - 2, 6, 5); g.fillStyle = "#c9d2e6"; g.fillRect(x - 1, cy, 2, 1); g.fillStyle = "#5a6482"; });
  // 곽준영 + 형광펜 곡괭이
  const look = heroLook(), hs = 2, hx = 162, bob = running ? 0 : Math.round(Math.sin(t * 2) * 1), hy = MINE_GY - 24 * hs + 1 + bob;
  let ang = 0.5, hit = false;
  if (running) {
    const cyc = Math.floor(now / 640), p = (now % 640) / 640;
    ang = p < 0.72 ? 0.3 - 1.7 * (p / 0.72) : -1.4 + 2.5 * ((p - 0.72) / 0.28);
    if (p >= 0.9 && mineHitCyc !== cyc) { mineHitCyc = cyc; hit = true; }
  } else ang = 0.45 + Math.sin(t * 2) * 0.04;
  if (look.aura) { const ag = g.createRadialGradient(hx + 18, hy + 26, 2, hx + 18, hy + 26, 40); ag.addColorStop(0, hexA(look.aura, .4)); ag.addColorStop(1, hexA(look.aura, 0)); g.fillStyle = ag; g.fillRect(hx - 24, hy - 16, 84, 84); }
  g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(hx + 6, MINE_GY + 1, 26, 3);
  drawSprite(g, look.map, look.pal, hx, hy, hs, { pretty: true });
  g.save(); g.translate(hx + 15.5 * hs, hy + 16 * hs); g.rotate(ang); drawSprite(g, WSPR.pen, WEAPONS[1].p, -4 * 2.2, -15.5 * 2.2, 2.2, { pretty: true }); g.restore();
  // 바위를 때리는 순간: 광석 조각이 튐
  if (hit) {
    mineHitT = now; if (mineParts.length > 60) mineParts.splice(0, 20);
    for (let i = 0; i < 9; i++) mineParts.push({ x: 212, y: MINE_GY - 36 + Math.random() * 6, vx: 0.4 + Math.random() * 1.6, vy: -1.6 - Math.random() * 1.8, life: 1, col: th.cry[Math.floor(Math.random() * 3)], s: Math.random() < 0.3 ? 3 : 2 });
  }
  if (now - mineHitT < 90) { g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(207, MINE_GY - 38, 9, 9); g.fillStyle = "rgba(255,255,255,.95)"; g.fillRect(209, MINE_GY - 36, 5, 5); }
  mineParts = mineParts.filter(p => p.life > 0);
  mineParts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.16; p.life -= 0.03; if (p.y > MINE_GY) { p.y = MINE_GY; p.vy *= -0.4; p.vx *= 0.6; } g.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5)); g.fillStyle = p.col; g.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); });
  g.globalAlpha = 1;
  // 광맥 반짝임
  if (mineCrys) mineCrys.forEach(([x, y], i) => { const a = Math.max(0, Math.sin(t * 2.4 + i * 1.3)); if (a > 0.85) { g.fillStyle = "#ffffff"; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); } });
  // 깊이 표시판
  g.font = '13px "Do Hyeon", sans-serif'; g.textBaseline = "middle"; g.textAlign = "left";
  const label = `B${depth} · ${th.n}`, lw = Math.ceil(g.measureText(label).width) + 14;
  g.fillStyle = "rgba(8,10,18,.72)"; g.fillRect(6, 6, lw, 19); g.fillStyle = `rgba(${th.glow},.9)`; g.fillRect(6, 6, 2, 19);
  g.fillStyle = "#ffd54a"; g.fillText(label, 13, 16);
  if (!running) { g.textAlign = "right"; g.fillStyle = "rgba(233,237,246,.75)"; g.font = '12px "Gowun Dodum", sans-serif'; g.fillText("공부를 시작하면 캐기 시작해요", MINE_W - 8, 16); }
}
function mineTick(now) {
  if (curTab !== "study" || document.hidden) return;
  if (now - mineLast < 33) return; mineLast = now;
  drawMine(S.study.depth, S.study.running, now);
}
