function buildBg(floor, vault) {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d"); const R = rng(floor * 9973 + 7);
  const rect = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const grad = (y0, y1, c0, c1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0); };
  const circle = (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  const stars = (n, yMax, col = "#f4f6fb") => { for (let i = 0; i < n; i++) rect(Math.floor(R() * W), Math.floor(R() * yMax), R() < .2 ? 3 : 2, R() < .2 ? 3 : 2, col); };
  const city = (x0, x1, base, maxH, col, win) => { let x = x0; while (x < x1) { const bw = 30 + Math.floor(R() * 50), bh = 20 + Math.floor(R() * maxH); rect(x, base - bh, bw, bh, col); for (let wy = base - bh + 6; wy < base - 6; wy += 10) for (let wx = x + 5; wx < x + bw - 6; wx += 9) if (R() < .22) rect(wx, wy, 4, 5, R() < .8 ? win : "#6fd3ff"); x += bw + 3; } };
  const windowBox = (x, y, w, h, skyA, skyB) => {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, skyA); gr.addColorStop(1, skyB); g.fillStyle = gr; g.fillRect(x, y, w, h);
    for (let i = 0; i < 12; i++) rect(x + Math.floor(R() * w), y + Math.floor(R() * h * 0.4), 2, 2, "#f4f6fb");
    city(x - 10, x + w, y + h, h * 0.7, "#10152a", "#ffd54a"); g.restore();
    rect(x - 5, y - 5, w + 10, 5, "#0b0f1c"); rect(x - 5, y + h, w + 10, 6, "#0b0f1c"); rect(x - 5, y, 5, h, "#0b0f1c"); rect(x + w, y, 5, h, "#0b0f1c");
    for (let mx = x + w / 3; mx < x + w - 4; mx += w / 3) rect(mx - 2, y, 4, h, "#0b0f1c");
  };
  const floorTiles = (c1, c2, tw = 32, check = false) => { rect(0, 254, W, H - 254, c1); for (let x = 0; x < W; x += tw) for (let y = 254; y < H; y += tw / 2) if (check ? ((x / tw + (y - 254) / (tw / 2)) % 2 === 0) : (x / tw) % 2 === 0) rect(x, y, check ? tw : 2, check ? tw / 2 : H - 254, c2); };
  const ground = (c1, c2, line) => { rect(0, GROUND, W, H - GROUND, c1); for (let x = 0; x < W; x += 32) rect(x, GROUND, 2, H - GROUND, c2); rect(0, GROUND, W, 3, line || "#0e1321"); };
  g.font = '20px "Do Hyeon", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle";

  if (vault) {
    rect(0, 0, W, H, "#11151f");
    for (let x = 0; x < W; x += 80) for (let y = 30; y < 250; y += 56) { rect(x + 6, y, 68, 48, "#1a2030"); rect(x + 30, y + 20, 20, 5, "#2a3247"); }
    rect(0, 0, W, 24, "rgba(255,213,74,.12)");
    ground("#232a3c", "#1d2333");
    rect(20, 268, 116, 26, "#6fd3ff"); g.fillStyle = "#06263a"; g.fillText("지하 문서고", 78, 282);
    return c;
  }
  const z = zoneOf(floor);
  switch (z.bg) {
    case "lobby": {
      grad(0, 254, "#2a2f45", "#1f2336");
      windowBox(40, 30, 250, 170, "#0b1022", "#1d2446"); windowBox(350, 30, 250, 170, "#0b1022", "#1d2446");
      for (const px of [0, 310, 620]) { rect(px, 0, 20, 254, "#3a4058"); rect(px + 4, 0, 3, 254, "#4a5070"); }
      rect(200, 206, 240, 8, "#c9a26b"); g.fillStyle = "#ffd54a"; g.font = '18px "Do Hyeon", sans-serif'; g.fillText("야근상사 본사 타워", 320, 218);
      floorTiles("#3a3f55", "#323750", 40, true); for (let i = 0; i < 8; i++) rect(R() * W, 260 + R() * 90, 30, 2, "rgba(255,255,255,.08)");
      rect(520, 214, 110, 40, "#5a4a3a"); rect(520, 210, 110, 6, "#7a6a5a");
      break;
    }
    case "office": {
      grad(0, 254, "#232a40", "#1b2136");
      windowBox(30, 26, 160, 130, "#0b1022", "#1d2446"); windowBox(240, 26, 160, 130, "#0b1022", "#1d2446"); windowBox(450, 26, 160, 130, "#0b1022", "#1d2446");
      for (let x = 10; x < W; x += 104) { rect(x, 222, 92, 8, "#6b5a46"); rect(x + 6, 230, 6, 24, "#4a3e30"); rect(x + 80, 230, 6, 24, "#4a3e30"); rect(x + 24, 192, 40, 28, "#1b1f2a"); rect(x + 27, 195, 34, 20, R() < .5 ? "#6fd3ff" : "#3b7bd6"); rect(x + 40, 220, 8, 3, "#1b1f2a"); }
      floorTiles("#2b3352", "#252d48");
      break;
    }
    case "pantry": {
      rect(0, 0, W, 254, "#3b4a5a"); for (let x = 0; x < W; x += 24) for (let y = 0; y < 254; y += 24) rect(x, y, 23, 23, (x + y) % 48 ? "#41526a" : "#3d4d62");
      for (let x = 20; x < 620; x += 100) { rect(x, 34, 90, 64, "#c9a26b"); rect(x + 42, 60, 6, 14, "#7a5a32"); }
      rect(0, 196, W, 58, "#8d97b6"); rect(0, 190, W, 8, "#cfd6ea");
      rect(90, 140, 50, 50, "#2a2e38"); rect(98, 150, 34, 14, "#6fd3ff"); rect(108, 170, 14, 14, "#6b3f1f");
      rect(560, 50, 70, 204, "#cfd6ea"); rect(566, 120, 58, 3, "#8d97b6"); rect(616, 70, 4, 30, "#8d97b6");
      floorTiles("#3a3f4a", "#2e333e", 32, true);
      break;
    }
    case "meeting": {
      grad(0, 254, "#2a2238", "#211a2e");
      rect(110, 40, 260, 140, "#eef1f7"); rect(110, 40, 260, 6, "#9aa3b8");
      g.strokeStyle = "#3b7bd6"; g.lineWidth = 3; g.beginPath(); g.moveTo(130, 150); g.lineTo(190, 110); g.lineTo(240, 130); g.lineTo(300, 70); g.lineTo(350, 90); g.stroke();
      g.fillStyle = "#d6403d"; g.font = '16px "Do Hyeon", sans-serif'; g.fillText("결론: 다음 회의에서", 240, 168);
      rect(420, 50, 170, 110, "#1b1f2a"); rect(426, 56, 158, 98, "#3b2a5a"); g.fillStyle = "#ffd54a"; g.fillText("분기 실적", 505, 104);
      rect(0, 228, W, 26, "#5a3a28"); rect(0, 224, W, 6, "#7a5a3a");
      for (let x = 30; x < W; x += 90) { rect(x, 196, 34, 30, "#1b1f2a"); rect(x + 4, 200, 26, 22, "#3b4566"); }
      floorTiles("#3a2a48", "#33253f");
      break;
    }
    case "server": {
      rect(0, 0, W, 254, "#0f1418"); rect(0, 0, W, 16, "#1b2226");
      for (let x = 14; x < W; x += 72) { rect(x, 30, 60, 224, "#1b1f2a"); rect(x + 2, 32, 56, 220, "#232833"); for (let y = 40; y < 246; y += 12) { rect(x + 6, y, 48, 8, "#151a22"); rect(x + 44, y + 2, 3, 3, R() < .7 ? "#7fe3a0" : R() < .5 ? "#ff5d5d" : "#6fd3ff"); rect(x + 38, y + 2, 3, 3, R() < .5 ? "#7fe3a0" : "#151a22"); } }
      rect(0, 18, W, 6, "#2a3038"); for (let x = 0; x < W; x += 40) rect(x, 18, 3, 12, "#3a4048");
      floorTiles("#2a3038", "#232830", 40, true); for (let x = 20; x < W; x += 80) for (let y = 262; y < 350; y += 6) rect(x, y, 30, 2, "#1b2026");
      break;
    }
    case "archive": {
      rect(0, 0, W, 254, "#2a241c");
      for (let x = 10; x < W; x += 126) { rect(x, 20, 116, 234, "#4a3a28"); for (let y = 30; y < 250; y += 46) { rect(x + 4, y + 38, 108, 6, "#5a4a32"); let bx = x + 6; while (bx < x + 108) { const bw = 8 + Math.floor(R() * 10), bh = 20 + Math.floor(R() * 16); rect(bx, y + 38 - bh, bw, bh, ["#7a5a3a", "#5a6a7a", "#8a3a2a", "#6a7a4a", "#9a8a6a"][Math.floor(R() * 5)]); bx += bw + 1; } } }
      rect(0, 254, W, H - 254, "#4a3a28"); for (let y = 258; y < H; y += 12) rect(0, y, W, 2, "#3a2c1e");
      break;
    }
    case "cafeteria": {
      grad(0, 254, "#3a2a1f", "#2e2219");
      rect(190, 26, 260, 80, "#1f3a2a"); rect(190, 26, 260, 5, "#7a5a3a"); g.fillStyle = "#f4f1e6"; g.font = '18px "Do Hyeon", sans-serif'; g.fillText("오늘의 메뉴: 제육볶음", 320, 56); g.fillText("후식: 요구르트", 320, 84);
      for (const lx of [80, 560]) { rect(lx, 0, 3, 60, "#5a4a3a"); g.fillStyle = "#ffd54a"; g.beginPath(); g.moveTo(lx - 22, 78); g.lineTo(lx + 25, 78); g.lineTo(lx + 1, 58); g.fill(); circle(lx + 1, 86, 30, "rgba(255,213,74,.08)"); }
      for (let x = 20; x < W; x += 150) { rect(x, 222, 120, 10, "#c9a26b"); rect(x + 10, 232, 8, 22, "#7a5a3a"); rect(x + 102, 232, 8, 22, "#7a5a3a"); rect(x + 20, 214, 40, 8, "#b8bcc6"); rect(x + 66, 214, 40, 8, "#b8bcc6"); }
      floorTiles("#4a3f36", "#3e342c", 32, true);
      break;
    }
    case "gym": {
      rect(0, 0, W, 254, "#1f2a3a"); rect(30, 26, 580, 170, "#8fb3c9"); rect(36, 32, 568, 158, "#a8c8dc");
      for (let i = 0; i < 6; i++) rect(60 + i * 95, 40, 10, 140, "rgba(255,255,255,.18)");
      rect(0, 200, W, 6, "#3b4566"); for (let x = 30; x < W; x += 60) { rect(x, 214, 40, 6, "#2a2e38"); rect(x, 210, 8, 14, "#14161c"); rect(x + 32, 210, 8, 14, "#14161c"); }
      g.fillStyle = "#ffd54a"; g.font = '16px "Do Hyeon", sans-serif'; g.fillText("하나 더! 할 수 있다!", 320, 236);
      rect(0, 254, W, H - 254, "#22262e"); for (let x = 0; x < W; x += 64) rect(x, 254, 2, H - 254, "#2e333d");
      break;
    }
    case "hr": {
      grad(0, 254, "#2a3a2f", "#223028");
      [["인재제일", 60], ["정시퇴근", 250], ["상호존중", 440]].forEach(([s, x]) => { rect(x, 40, 140, 70, "#c9a26b"); rect(x + 6, 46, 128, 58, "#f4f1e6"); g.fillStyle = "#2a3a2f"; g.font = '22px "Do Hyeon", sans-serif'; g.fillText(s, x + 70, 76); });
      for (let x = 30; x < W; x += 110) { rect(x, 150, 70, 104, "#8d97b6"); for (let y = 160; y < 250; y += 30) { rect(x + 4, y, 62, 26, "#9aa3b8"); rect(x + 28, y + 10, 14, 4, "#5b6274"); } }
      floorTiles("#2f3a32", "#29332c");
      break;
    }
    case "finance": {
      grad(0, 254, "#1f2a24", "#18221d");
      rect(60, 30, 380, 170, "#0e1418"); rect(64, 34, 372, 162, "#14201a");
      g.strokeStyle = "#7fe3a0"; g.lineWidth = 4; g.beginPath(); let yy = 160; g.moveTo(80, yy); for (let x = 110; x <= 420; x += 30) { yy += (R() - 0.62) * 40; yy = Math.max(50, Math.min(180, yy)); g.lineTo(x, yy); } g.stroke();
      g.fillStyle = "#ffd54a"; g.font = '16px "Do Hyeon", sans-serif'; g.fillText("이번 분기 예산", 160, 52);
      rect(500, 120, 110, 134, "#3a4048"); rect(508, 128, 94, 118, "#4a5058"); circle(555, 187, 22, "#2a2e38"); circle(555, 187, 6, "#ffd54a");
      floorTiles("#2a3330", "#242c29");
      break;
    }
    case "garden": {
      grad(0, 230, "#1d1530", "#c96b4a"); circle(500, 150, 46, "rgba(255,200,120,.75)");
      city(-10, W, 236, 70, "#1a1424", "#ffb38a");
      rect(0, 236, W, 18, "#3a2a20"); for (let x = 0; x < W; x += 20) rect(x, 216, 4, 22, "#5b6274"); rect(0, 214, W, 4, "#8d97b6");
      for (let x = 20; x < W; x += 140) { rect(x, 238, 70, 16, "#7a4a2a"); for (let i = 0; i < 6; i++) circle(x + 8 + i * 11, 232, 7, i % 2 ? "#4fb35a" : "#6fd36a"); circle(x + 20, 226, 4, "#ff8fa3"); circle(x + 46, 224, 4, "#ffd54a"); }
      rect(0, 254, W, H - 254, "#6b4a32"); for (let x = 0; x < W; x += 40) rect(x, 254, 3, H - 254, "#5a3c28");
      break;
    }
    case "heliport": {
      grad(0, 254, "#060912", "#141a33"); stars(60, 160);
      city(-10, W, 254, 50, "#0c1020", "#ffd54a");
      rect(0, 254, W, H - 254, "#3a3f48"); g.strokeStyle = "#ffd54a"; g.lineWidth = 6; g.beginPath(); g.ellipse(320, 320, 150, 34, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = "#ffd54a"; g.font = '44px "Do Hyeon", sans-serif'; g.fillText("H", 320, 322);
      for (let x = 20; x < W; x += 60) circle(x, 258, 4, R() < .5 ? "#ff5d5d" : "#6fd3ff");
      break;
    }
    case "clouds": {
      grad(0, 254, "#6fa8d6", "#e6f4ff"); circle(110, 70, 34, "rgba(255,247,194,.9)");
      for (let i = 0; i < 9; i++) { const x = R() * W, y = 60 + R() * 160, s = 16 + R() * 26; for (let k = 0; k < 4; k++) circle(x + k * s * 0.8, y + (k % 2) * 6, s, "rgba(255,255,255,.75)"); }
      rect(0, 254, W, H - 254, "#f4f6fb"); for (let x = -20; x < W; x += 44) circle(x, 258, 26, "#ffffff"); for (let x = 0; x < W; x += 60) circle(x + 20, 330, 30, "#e2ecfa");
      break;
    }
    case "stratos": {
      grad(0, 254, "#000010", "#1d3f73"); stars(90, 200);
      g.fillStyle = "#3b7bd6"; g.beginPath(); g.ellipse(320, 520, 520, 300, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "rgba(111,211,255,.6)"; g.lineWidth = 10; g.beginPath(); g.ellipse(320, 520, 524, 304, 0, Math.PI, Math.PI * 2); g.stroke();
      rect(0, 270, W, H - 270, "#5b6274"); for (let x = 0; x < W; x += 50) { rect(x, 270, 2, H - 270, "#3b4566"); rect(x + 6, 276, 4, 4, "#8d97b6"); }
      rect(0, 266, W, 6, "#8d97b6");
      break;
    }
    case "moon": {
      rect(0, 0, W, 254, "#04050a"); stars(110, 240);
      circle(480, 80, 40, "#3b7bd6"); circle(470, 70, 16, "#4fb35a"); circle(494, 92, 12, "#4fb35a");
      rect(0, 240, W, H - 240, "#8d8a96"); for (let i = 0; i < 12; i++) { const x = R() * W, y = 250 + R() * 100, r = 8 + R() * 22; g.fillStyle = "#6f6c78"; g.beginPath(); g.ellipse(x, y, r, r * 0.35, 0, 0, Math.PI * 2); g.fill(); }
      rect(60, 200, 8, 46, "#c9ced8"); rect(68, 202, 30, 18, "#d6403d"); rect(70, 205, 8, 4, "#ffffff");
      break;
    }
    case "mars": {
      grad(0, 240, "#d6845a", "#7a3a2a"); circle(140, 60, 20, "rgba(255,240,200,.7)");
      g.fillStyle = "#6a2a1f"; g.beginPath(); g.moveTo(0, 240); for (let x = 0; x <= W; x += 40) g.lineTo(x, 190 + R() * 40); g.lineTo(W, 240); g.fill();
      for (const fx of [380, 470]) { rect(fx, 120, 70, 120, "#4a2a22"); rect(fx + 10, 60, 16, 60, "#3a201a"); for (let i = 0; i < 4; i++) circle(fx + 18 + i * 8, 50 - i * 14, 10 + i * 3, "rgba(80,70,70,.5)"); for (let y = 136; y < 230; y += 22) rect(fx + 8, y, 54, 8, "#ffb13b"); }
      rect(0, 240, W, H - 240, "#a8482f"); for (let i = 0; i < 18; i++) rect(R() * W, 250 + R() * 100, 6 + R() * 12, 4 + R() * 6, "#7a2a1f");
      break;
    }
    case "station": {
      rect(0, 0, W, 254, "#3a4052");
      for (let x = 0; x < W; x += 80) for (let y = 0; y < 254; y += 64) { rect(x + 2, y + 2, 76, 60, "#444b60"); rect(x + 6, y + 6, 3, 3, "#5b6274"); rect(x + 71, y + 6, 3, 3, "#5b6274"); }
      for (const px of [120, 320, 520]) { circle(px, 100, 44, "#2a2e38"); circle(px, 100, 36, "#04050a"); g.save(); g.beginPath(); g.arc(px, 100, 36, 0, Math.PI * 2); g.clip(); for (let i = 0; i < 12; i++) rect(px - 36 + R() * 72, 64 + R() * 72, 2, 2, "#f4f6fb"); if (px === 320) circle(px + 10, 112, 18, "#3b7bd6"); g.restore(); }
      rect(0, 236, W, 18, "#2a2e38"); for (let x = 0; x < W; x += 40) { rect(x, 236, 20, 18, "#ffd54a"); rect(x + 20, 236, 20, 18, "#14161c"); }
      rect(0, 254, W, H - 254, "#2a2e38"); for (let x = 0; x < W; x += 12) rect(x, 254, 2, H - 254, "#1f232b"); for (let y = 260; y < H; y += 12) rect(0, y, W, 2, "#1f232b");
      break;
    }
    case "galaxy": {
      grad(0, 254, "#120a2a", "#4a1a5a"); stars(80, 250);
      for (let i = 0; i < 5; i++) circle(R() * W, 40 + R() * 160, 50 + R() * 50, `rgba(${R() < .5 ? "255,107,214" : "124,92,255"},.12)`);
      rect(0, 226, W, 14, "#2a1a5a"); for (let x = 0; x < W; x += 30) circle(x + 15, 233, 6, "#4a35b8");
      for (let x = 30; x < W; x += 120) { rect(x, 196 - (x % 3) * 8, 36, 30, "#c9a26b"); rect(x, 206 - (x % 3) * 8, 36, 4, "#ffd54a"); }
      rect(0, 254, W, H - 254, "#1a0f2a"); g.strokeStyle = "rgba(255,107,214,.4)"; g.lineWidth = 2; for (let x = -320; x < W + 320; x += 48) { g.beginPath(); g.moveTo(320 + (x - 320) * 0.3, 254); g.lineTo(x, H); g.stroke(); } for (let y = 262; y < H; y += 18) rect(0, y, W, 1, "rgba(255,107,214,.3)");
      break;
    }
    case "blackhole": {
      rect(0, 0, W, 254, "#030306"); stars(70, 250, "#8d8a96");
      for (let i = 6; i >= 0; i--) { g.strokeStyle = `rgba(${i % 2 ? "255,154,59" : "124,92,255"},${0.18 + (6 - i) * 0.06})`; g.lineWidth = 10 - i; g.beginPath(); g.ellipse(320, 110, 120 + i * 18, 26 + i * 5, -0.12, 0, Math.PI * 2); g.stroke(); }
      circle(320, 110, 44, "#000000"); g.strokeStyle = "rgba(255,213,74,.6)"; g.lineWidth = 3; g.beginPath(); g.arc(320, 110, 46, 0, Math.PI * 2); g.stroke();
      rect(0, 254, W, H - 254, "#0c0c14"); for (let x = 0; x < W; x += 40) rect(x, 254, 1, H - 254, "rgba(124,92,255,.35)"); for (let y = 266; y < H; y += 20) rect(0, y, W, 1, "rgba(124,92,255,.25)");
      break;
    }
    case "timespace": {
      grad(0, 254, "#1a0f2a", "#3a1f5a"); stars(40, 250, "#ffd54a");
      for (let i = 0; i < 6; i++) { const x = 40 + R() * 560, y = 30 + R() * 170, r = 14 + R() * 22; circle(x, y, r + 3, "rgba(255,213,74,.5)"); circle(x, y, r, "rgba(255,247,230,.85)"); g.strokeStyle = "#2a2206"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - r * 0.7); g.moveTo(x, y); g.lineTo(x + r * 0.5, y); g.stroke(); }
      rect(0, 254, W, H - 254, "#2a1a4a"); for (let x = 0; x < W; x += 32) for (let y = 254; y < H; y += 16) if ((x / 32 + (y - 254) / 16) % 2 === 0) rect(x, y, 32, 16, "#3a2a5a"); rect(0, 254, W, 3, "#ffd54a");
      break;
    }
  }
  if (!["clouds", "stratos", "moon", "mars"].includes(z.bg)) rect(0, GROUND, W, 3, "rgba(0,0,0,.35)");
  const label = `${cycleOf(floor)}${z.n} ${floor}F`;
  g.font = '18px "Do Hyeon", sans-serif';
  const lw = Math.max(110, g.measureText(label).width + 24);
  rect(W - lw - 16, 268, lw, 26, "#ffd54a"); g.fillStyle = "#2a2206"; g.textAlign = "center"; g.fillText(label, W - 16 - lw / 2, 282);
  return c;
}
