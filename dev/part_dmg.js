/* ===================== 데미지 숫자 연출 (뜰 때마다 모양이 다름) ===================== */
const DMG_LOOKS = ["classic", "gold", "slash", "burst", "stamp", "neon", "pixel", "fire", "ice", "ribbon"];
const CRIT_LOOKS = ["star", "lightning", "shatter", "split", "inferno"];
const DMG_MOTIONS = ["rise", "slam", "zoom", "spin", "slide"];
const CRIT_LABELS = ["치명타!", "CRITICAL!", "크리티컬!", "급소!", "치명!!"];
const RIBBON_COLS = ["#7c5cff", "#2b8fb8", "#d6403d", "#2f8a4a", "#c9743a"];
const NEON_COLS = ["#6fd3ff", "#ff6bd6", "#7fe3a0", "#ffd54a"];
const pick = a => a[Math.floor(Math.random() * a.length)];
function dmgLookFor(crit) {
  if (crit) return pick(CRIT_LOOKS);
  const fx = WEAPONS[skinIdx()].fx;
  const themed = { flame: "fire", ember: "fire", frost: "ice", cosmic: "neon", spark: "neon", gold: "gold", holy: "gold", laser: "neon", rgb: "neon" }[fx];
  return themed && Math.random() < 0.4 ? themed : pick(DMG_LOOKS);
}
/* 3x5 픽셀 글꼴 */
const PIX = {
  "0": "111101101101111", "1": "010110010010111", "2": "111001111100111", "3": "111001111001111", "4": "101101111001001", "5": "111100111001111",
  "6": "111100111101111", "7": "111001001001001", "8": "111101111101111", "9": "111101111001111", ".": "000000000000010",
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111", F: "111100110100100", G: "011100101101011",
  H: "101101111101101", I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111", M: "101111111101101", N: "110101101101101",
  O: "010101101101010", P: "110101110100100", Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010", U: "101101101101111",
  V: "101101101101010", W: "101101111111101", X: "101101010101101", Y: "101101010010010", Z: "111001010100111",
};
function drawPixelText(c, text, size, col) {
  const b = Math.max(2, Math.round(size / 6)), cw = 4 * b, total = text.length * cw - b;
  let x0 = -total / 2; const y0 = -2.5 * b;
  for (const ch of text) {
    const gl = PIX[ch] || PIX["0"];
    for (let i = 0; i < 15; i++) if (gl[i] === "1") {
      const x = x0 + (i % 3) * b, y = y0 + Math.floor(i / 3) * b;
      c.fillStyle = "#14080a"; c.fillRect(x + b * 0.45, y + b * 0.45, b, b);
      c.fillStyle = col; c.fillRect(x, y, b, b);
      c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(x, y, b, Math.max(1, b * 0.3));
    }
    x0 += cw;
  }
}
function outlined(c, text, x, y, fill, outer, inner, ow = 8, iw = 3) {
  c.lineJoin = "round";
  c.lineWidth = ow; c.strokeStyle = outer; c.strokeText(text, x, y);
  if (inner) { c.lineWidth = iw; c.strokeStyle = inner; c.strokeText(text, x, y); }
  c.fillStyle = fill; c.fillText(text, x, y);
}
function vgrad(c, h, stops) { const g = c.createLinearGradient(0, -h / 2, 0, h / 2); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; }
function jagged(c, rx, ry, n, seed, inner = 0.62) {
  const R = rng(seed); c.beginPath();
  for (let i = 0; i < n * 2; i++) { const an = i * Math.PI / n, r = i % 2 ? inner * (0.85 + R() * 0.3) : 1 + R() * 0.25; c.lineTo(Math.cos(an) * rx * r, Math.sin(an) * ry * r); }
  c.closePath();
}
function motionOf(f) {
  const t = f.age;
  switch (f.motion) {
    case "slam": { const k = Math.min(1, t / 90), bounce = t > 90 && t < 220 ? Math.sin((t - 90) / 130 * Math.PI) * -10 : 0; return { dy: -70 * (1 - k) * (1 - k) + bounce, sc: 1 + 1.4 * (1 - k), rot: 0 }; }
    case "zoom": { const k = Math.min(1, t / 160); const sc = k < 0.6 ? 0.2 + (k / 0.6) * 1.15 : 1.35 - (k - 0.6) / 0.4 * 0.35; return { dy: 0, sc, rot: 0 }; }
    case "spin": { const k = Math.min(1, t / 150), e = 1 - (1 - k) * (1 - k); return { dy: 0, sc: 1 + 0.7 * (1 - e), rot: -1.3 * (1 - e) }; }
    case "slide": { const k = Math.min(1, t / 130), e = 1 - (1 - k) * (1 - k); return { dx: 60 * (1 - e) * f.dir, dy: 0, sc: 1 + 0.3 * (1 - e), rot: 0, skew: 0.35 * (1 - e) * f.dir }; }
    default: { const k = Math.max(0, 1 - t / 120); return { dy: 0, sc: 1 + 0.8 * k * k, rot: 0 }; }
  }
}
function drawDmg(f, a) {
  const c = ctx, s = f.size, t = f.age, m = motionOf(f);
  c.save();
  c.translate(f.x + (m.dx || 0), f.y + (m.dy || 0));
  c.rotate((f.rot || 0) + (m.rot || 0));
  if (m.skew) c.transform(1, 0, -m.skew, 1, 0, 0);
  c.globalAlpha = a;
  c.textAlign = "center"; c.textBaseline = "middle";
  if (f.style === "crit") {
    const k = Math.max(0, 1 - t / 170), pop = (1 + 1.3 * k * k) * m.sc;
    if (t < 240) c.translate((Math.random() - .5) * 8, (Math.random() - .5) * 6);
    c.scale(pop, pop);
    c.font = `${s}px "Do Hyeon", sans-serif`;
    const w = c.measureText(f.text).width;
    switch (f.look) {
      case "lightning": {
        c.strokeStyle = hexA("#fff36b", a); c.lineWidth = 4;
        for (let side = -1; side <= 1; side += 2) { c.beginPath(); let x = side * (w / 2 + 18), y = -34; c.moveTo(x, y); for (let i = 0; i < 5; i++) { x += side * (Math.random() * 10 - 3); y += 15; c.lineTo(x, y); } c.stroke(); }
        c.fillStyle = hexA("#2a0a40", 0.75 * a); c.fillRect(-w / 2 - 12, -s * 0.5, w + 24, s);
        break;
      }
      case "shatter": {
        const sp = Math.min(1, t / 400);
        for (let i = 0; i < 10; i++) { const an = i * 0.628 + f.seed, r = 30 + sp * 60; c.fillStyle = hexA(i % 2 ? "#ff2a2a" : "#ffb13b", a * (1 - sp * 0.7)); c.beginPath(); c.moveTo(Math.cos(an) * r, Math.sin(an) * r * 0.7); c.lineTo(Math.cos(an + 0.2) * (r + 16), Math.sin(an + 0.2) * (r + 16) * 0.7); c.lineTo(Math.cos(an - 0.15) * (r + 22), Math.sin(an - 0.15) * (r + 22) * 0.7); c.fill(); }
        break;
      }
      case "inferno": {
        for (let i = 0; i < 9; i++) { const x = -w / 2 + (i + 0.5) * (w / 9), h = 30 + Math.sin(t / 60 + i * 1.7) * 12 + (i % 3) * 6; c.fillStyle = hexA(i % 2 ? "#ff6b3b" : "#ffd54a", a * 0.85); c.beginPath(); c.moveTo(x - 9, 10); c.quadraticCurveTo(x - 4, -h * 0.5, x, -h); c.quadraticCurveTo(x + 4, -h * 0.5, x + 9, 10); c.fill(); }
        break;
      }
      case "split": break;
      default: {
        const R1 = 46 + Math.sin(t / 40) * 3;
        c.save(); c.rotate(t / 600); jagged(c, R1 * 1.35 + w * 0.15, R1 * 0.85, 14, f.seed * 1000); c.restore();
        c.fillStyle = hexA("#ffb13b", 0.85 * a); c.fill(); c.lineWidth = 3; c.strokeStyle = hexA("#ff2a2a", a); c.stroke();
      }
    }
    c.font = '20px "Do Hyeon", sans-serif'; outlined(c, f.label, 0, -38, "#fff36b", "#2a0606", null, 5);
    c.font = `${s}px "Do Hyeon", sans-serif`;
    const fill = f.look === "inferno" ? vgrad(c, s, ["#fff36b", "#ff8a00", "#ff2a2a"]) : "#ff2a2a";
    if (f.look === "split" && t < 260) {
      const gap = Math.sin(Math.min(1, t / 260) * Math.PI) * 9;
      c.save(); c.beginPath(); c.rect(-w, -s, w * 2, s + 4); c.clip(); c.translate(-gap, 0); outlined(c, f.text, 0, 4, fill, "#2a0606", "#fff36b", 11, 4); c.restore();
      c.save(); c.beginPath(); c.rect(-w, 4, w * 2, s); c.clip(); c.translate(gap, 0); outlined(c, f.text, 0, 4, fill, "#2a0606", "#fff36b", 11, 4); c.restore();
      c.strokeStyle = hexA("#ffffff", a); c.lineWidth = 3; c.beginPath(); c.moveTo(-w / 2 - 20, 6); c.lineTo(w / 2 + 20, 2); c.stroke();
    } else outlined(c, f.text, 0, 4, fill, "#2a0606", "#fff36b", 11, 4);
    c.restore(); return;
  }
  // 일반 타격
  c.scale(m.sc, m.sc);
  c.font = `${s}px "Do Hyeon", sans-serif`;
  const w = c.measureText(f.text).width;
  switch (f.look) {
    case "gold":
      c.fillStyle = "rgba(0,0,0,.4)"; c.fillText(f.text, 3, 4);
      outlined(c, f.text, 0, 0, vgrad(c, s, ["#fff7c2", "#ffd54a", "#ff8a00"]), "#2a1606", "#fff7c2", 8, 2); break;
    case "slash":
      c.transform(1, 0, -0.28, 1, 0, 0);
      c.fillStyle = hexA(f.accent, 0.7 * a); c.fillRect(-w / 2 - 14, -s * 0.18, w + 28, s * 0.36);
      c.fillStyle = hexA("#ffffff", 0.9 * a); c.fillRect(-w / 2 - 22, -2, w + 44, 3);
      outlined(c, f.text, 0, 0, "#ffffff", "#0e1321", null, 7); break;
    case "burst":
      jagged(c, w / 2 + 20, s * 0.72, 10, f.seed * 997, 0.7);
      c.fillStyle = hexA("#fff36b", a); c.fill(); c.lineWidth = 3; c.strokeStyle = hexA("#1b1206", a); c.stroke();
      outlined(c, f.text, 0, 1, "#1b1206", "#ffffff", null, 5); break;
    case "stamp": {
      c.rotate(-0.16);
      c.strokeStyle = hexA("#e8452c", a); c.lineWidth = 4; c.strokeRect(-w / 2 - 12, -s * 0.55, w + 24, s * 1.1);
      c.lineWidth = 1.5; c.strokeRect(-w / 2 - 7, -s * 0.55 + 5, w + 14, s * 1.1 - 10);
      c.fillStyle = hexA("#fff5f0", 0.25 * a); c.fillRect(-w / 2 - 12, -s * 0.55, w + 24, s * 1.1);
      c.fillStyle = "#e8452c"; c.fillText(f.text, 0, 2);
      c.font = '11px "Do Hyeon", sans-serif'; c.fillText("결재", w / 2 + 2, -s * 0.55 - 6); break;
    }
    case "neon":
      c.shadowColor = f.accent; c.shadowBlur = 16;
      c.lineWidth = 4; c.strokeStyle = f.accent; c.strokeText(f.text, 0, 0);
      c.shadowBlur = 0; c.fillStyle = "#ffffff"; c.fillText(f.text, 0, 0); break;
    case "pixel": drawPixelText(c, f.text, s, f.accent); break;
    case "fire":
      for (let i = 0; i < 6; i++) { const ph = (t / 500 + i / 6) % 1; c.fillStyle = hexA(i % 2 ? "#ff6b3b" : "#ffd54a", a * (1 - ph)); c.fillRect(-w / 2 + ((i * 37) % Math.max(1, w)), -s * 0.4 - ph * 30, 4, 4); }
      outlined(c, f.text, 0, 0, vgrad(c, s, ["#fff36b", "#ff8a00", "#d6202a"]), "#2a0606", null, 8); break;
    case "ice":
      outlined(c, f.text, 0, 0, vgrad(c, s, ["#ffffff", "#bfe6ff", "#6fa8d6"]), "#0b1a3a", "#ffffff", 8, 2);
      for (let i = 0; i < 3; i++) { const on = (Math.sin(t / 90 + i * 2) + 1) / 2; if (on < 0.4) continue; const x = -w / 2 + i * w / 2, y = -s * 0.45 + (i % 2) * s * 0.8; c.fillStyle = hexA("#ffffff", on * a); c.fillRect(x - 1, y - 6, 2, 12); c.fillRect(x - 6, y - 1, 12, 2); }
      break;
    case "ribbon": {
      c.fillStyle = hexA(f.accent, a); c.beginPath(); c.moveTo(-w / 2 - 22, -s * 0.36); c.lineTo(w / 2 + 22, -s * 0.36); c.lineTo(w / 2 + 12, 0); c.lineTo(w / 2 + 22, s * 0.36); c.lineTo(-w / 2 - 22, s * 0.36); c.lineTo(-w / 2 - 12, 0); c.closePath(); c.fill();
      c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(-w / 2 - 22, s * 0.26, w + 44, s * 0.1);
      outlined(c, f.text, 0, 1, "#ffffff", "#0e1321", null, 6); break;
    }
    default:
      c.fillStyle = "rgba(0,0,0,.45)"; c.fillText(f.text, 3, 4);
      outlined(c, f.text, 0, 0, "#ffffff", "#1b1206", "#ffb13b");
  }
  c.restore();
}
