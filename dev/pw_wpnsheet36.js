// v36 무기 30개 한 장: 게임의 drawWeapon(새) · drawWeaponV35(예전)로 그리고, 무기 이펙트 색 초승달을 곁들임
const { chromium, devices } = require('playwright');
const fs = require('fs');
const fontRoutes = require('./pw_fonts.js');
const OUT = process.argv[2] || 'wpn36_sheet.png', PAGE = process.argv[3] || 'dbg.html';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 14 Pro'], timezoneId: 'Asia/Seoul', viewport: { width: 390, height: 760 } }); await fontRoutes(ctx);
  await ctx.addInitScript(() => { if (!sessionStorage.getItem('fixed')) { sessionStorage.setItem('fixed', '1'); localStorage.setItem('yageun-knight-v3-menu34', '1'); localStorage.setItem('yageun-knight-v3-feel35', '1'); localStorage.setItem('yageun-knight-v3-feel36', '1'); } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/' + PAGE); await p.waitForTimeout(2500);
  const url = await p.evaluate(() => window.__ev(`(() => {
    const N = WEAPONS.length, cols = 6, cw = 200, ch = 250, rows = Math.ceil(N / cols);
    const c = document.createElement("canvas"); c.width = cols * cw; c.height = rows * ch + 70; const g = c.getContext("2d"); g.imageSmoothingEnabled = false;
    g.fillStyle = "#141a2c"; g.fillRect(0, 0, c.width, c.height);
    g.font = '30px "Do Hyeon", sans-serif'; g.fillStyle = "#ffd54a"; g.textAlign = "left"; g.fillText("v36 무기 30개 · 왼쪽 작은 그림 = 예전 · 초승달 = 그 무기를 들면 나오는 이펙트 색", 18, 44);
    for (let i = 0; i < N; i++) {
      const x0 = (i % cols) * cw, y0 = 70 + Math.floor(i / cols) * ch, w = WEAPONS[i], D = WPN36[i];
      g.fillStyle = w.leg ? "#2a2440" : "#1c2338"; g.fillRect(x0 + 6, y0 + 6, cw - 12, ch - 12);
      // 이펙트 초승달 (무기 고유 색)
      const v = D.vfx || ["#7a1aa0", "#ff5fd2", "#ffe6fb"], cx = x0 + 118, cy = y0 + 150, R = 74;
      [[1, v[0], 0.35], [0.62, v[1], 0.6], [0.3, v[2], 0.95]].forEach(([th, col, a]) => {
        g.beginPath(); const a0 = -2.5, a1 = 0.5, n = 24;
        for (let k = 0; k <= n; k++) { const t = a0 + (a1 - a0) * k / n; g.lineTo(cx + Math.cos(t) * R, cy + Math.sin(t) * R); }
        for (let k = n; k >= 0; k--) { const u = k / n, t = a0 + (a1 - a0) * u, wdt = 34 * th * Math.pow(Math.sin(Math.PI * Math.min(1, 0.1 + u * 0.9)), 0.7); g.lineTo(cx + Math.cos(t) * (R - wdt), cy + Math.sin(t) * (R - wdt)); }
        g.closePath(); g.globalAlpha = a * 0.55; g.fillStyle = col; g.fill(); g.globalAlpha = 1;
      });
      drawWeaponV35(g, i, 5, x0 + 34, y0 + 132, 0, 3.2, 1000, true);
      drawWeapon(g, i, 5, x0 + 118, y0 + 196, 0, 9.4, 1000, true);
      g.font = '19px "Do Hyeon", sans-serif'; g.textAlign = "center"; g.fillStyle = w.leg ? "#ffd54a" : "#e9edf6";
      g.fillText((i + 1) + ". " + w.n, x0 + cw / 2, y0 + ch - 20);
    }
    return c.toDataURL("image/png");
  })()`));
  fs.writeFileSync(OUT, Buffer.from(url.split(',')[1], 'base64'));
  console.log('ok', OUT, 'errors', errs.length ? errs.slice(0, 3) : 'none');
  await b.close();
})();
