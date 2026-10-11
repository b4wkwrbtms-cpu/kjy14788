/* ===================== v40 무기 색 = 스킬 색 · 전직 공격 =====================
   사용자(2026-10-11 11:55): "무기가 바뀌면 스킬 색깔이 바뀌어야지, 전직하면 전직 공격이 바뀌어야지"
   ① 직무 스킬(실적 돌파·계약 성사·핫픽스·무한 루프·PPT·로드맵 레이저·전수 조사 …)과 직무 기본 공격 이펙트를 그릴 때
      색을 들고 있는 무기의 이펙트 색 3단(진한·가운데·밝은)으로 바꿔 칠함 — 밝기는 그대로 두고 색만 무기 쪽으로.
      흰색·회색(채도 낮음)은 빛의 심이라 그대로. 금화·도장·인주·계약서·회의 인원·슬라이드 같은 '물건'과 겸직 속성(직무마다 제 색)은 그대로.
   ② 전직 공격: 직무가 없으면 기본 베기(몸 동작 + 궤적만). 영업(전사)으로 전직하면 베기마다 검기가 나감 —
      올려베기 = 솟구치는 검기 · 내려치기 = 지면 강타(땅이 갈라지며 빛) · 마무리 돌진 = 몬스터를 꿰뚫는 관통 검기 · 터치 = 날아가는 검기 */

/* ---------- ① 무기 색으로 다시 칠하기 ---------- */
var tintOn = false, jvNoTint = false, tintPal = null, tintKey = "", tintCache = new Map(), tintFrame = -1;
var TINT_SKIP = { splat: 1, aseal: 1, seal: 1, contract: 1, meeting: 1, order: 1, ppt: 1, kwave: 1, kquake: 1, kpierce: 1 };
function tintParse(c) {
  if (typeof c !== "string") return null;
  let m;
  if (c[0] === "#") {
    const h = c.length === 4 ? c.slice(1).split("").map(x => x + x).join("") : c.slice(1, 7);
    const n = parseInt(h, 16); if (isNaN(n)) return null;
    return [n >> 16 & 255, n >> 8 & 255, n & 255, 1];
  }
  if ((m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(c))) return [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]];
  if ((m = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(c))) {
    const H = (+m[1] % 360) / 360, Sx = +m[2] / 100, L = +m[3] / 100, q = L < 0.5 ? L * (1 + Sx) : L + Sx - L * Sx, p = 2 * L - q;
    const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [Math.round(f(H + 1 / 3) * 255), Math.round(f(H) * 255), Math.round(f(H - 1 / 3) * 255), m[4] == null ? 1 : +m[4]];
  }
  return null;
}
function tintSync(t) {
  const fr = typeof feelClock !== "undefined" ? feelClock.tick : 0; if (fr === tintFrame && tintPal) return; tintFrame = fr;
  const pal = typeof feelFxPal === "function" ? feelFxPal(t || performance.now()) : null; if (!pal) { tintPal = null; return; }
  const key = pal.join("|"); if (key === tintKey && tintPal) return;
  tintKey = key; tintCache.clear(); tintPal = pal.map(c => tintParse(c) || [255, 213, 74, 1]);
}
/* 색 하나를 무기 팔레트로: 원래 밝기(L)에 맞춰 진한→가운데→밝은 사이를 고름, 투명도는 그대로 */
function tintMap(c) {
  if (!tintPal || typeof c !== "string") return c;
  let v = tintCache.get(c); if (v !== undefined) return v;
  const p = tintParse(c);
  if (!p) v = c;
  else {
    const [r, g, b, a] = p, mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, L = (mx + mn) / 2, d = mx - mn, Sx = d === 0 ? 0 : d / (1 - Math.abs(2 * L - 1));
    if (Sx < 0.18 || d < 0.08) v = c;                                     // 흰색·회색·검정: 빛의 심·그림자는 그대로
    else {
      const P = tintPal, lo = L <= 0.55, k = lo ? Math.min(1, L / 0.55) : Math.min(1, (L - 0.55) / 0.4), A = lo ? P[0] : P[1], B = lo ? P[1] : P[2];
      v = `rgba(${Math.round(A[0] + (B[0] - A[0]) * k)},${Math.round(A[1] + (B[1] - A[1]) * k)},${Math.round(A[2] + (B[2] - A[2]) * k)},${a})`;
    }
  }
  if (tintCache.size > 800) tintCache.clear();
  tintCache.set(c, v); return v;
}
function tintNow(c) { tintSync(); return tintMap(c); }
function jobTintOn(f) { return !!tintPal && !f.noTint && !TINT_SKIP[f.kind]; }
/* 전투 캔버스의 색 지정(채우기·선·그림자·그라데이션)을 tintOn 동안만 무기 색으로 — 직무 이펙트 그리는 동안만 켬 */
(function () {
  if (typeof ctx === "undefined" || !ctx || typeof CanvasRenderingContext2D === "undefined") return;
  const P = CanvasRenderingContext2D.prototype;
  ["fillStyle", "strokeStyle", "shadowColor"].forEach(k => {
    const D = Object.getOwnPropertyDescriptor(P, k); if (!D || !D.set || !D.get) return;
    try { Object.defineProperty(ctx, k, { configurable: true, get() { return D.get.call(this); }, set(v) { D.set.call(this, tintOn && typeof v === "string" ? tintMap(v) : v); } }); } catch (e) {}
  });
  ["createRadialGradient", "createLinearGradient"].forEach(k => {
    const f0 = ctx[k]; if (typeof f0 !== "function") return;
    ctx[k] = function () { const g = f0.apply(ctx, arguments); if (tintOn && g && g.addColorStop) { const add = g.addColorStop.bind(g); g.addColorStop = (o, c) => add(o, tintMap(c)); } return g; };
  });
})();
(function () {
  const ds0 = drawSprite;                                                  // 잔상(한 색 실루엣)도 무기 색
  drawSprite = function (c, map, pal, x, y, sc, opts) { if (tintOn && opts && opts.solid) opts = Object.assign({}, opts, { solid: tintMap(opts.solid) }); return ds0(c, map, pal, x, y, sc, opts); };
  const js0 = jSparks;                                                     // 직무 이펙트 불꽃도 무기 색 (금화 불꽃·겸직 속성은 제 색)
  jSparks = function (x, y, col, n, spd) { return js0(x, y, jvNoTint ? col : tintNow(col), n, spd); };
  const jg0 = jGold; jGold = function (x, y, n) { const o = jvNoTint; jvNoTint = true; try { return jg0(x, y, n); } finally { jvNoTint = o; } };
  const jv0 = jvAdd; jvAdd = function (kind, o) { if (jvNoTint && o) o.noTint = true; return jv0(kind, o); };
  if (typeof jobSubProc === "function") { const sp0 = jobSubProc; jobSubProc = function (st) { const o = jvNoTint; jvNoTint = true; try { return sp0(st); } finally { jvNoTint = o; } }; }
})();

/* ---------- ② 영업(전사) 전직 공격: 검기 ---------- */
function warriorFx(x, y, crit) {
  const pal = feelFxPal(performance.now()).slice(), mv = fHero.mv, { h: mh } = msz(), big = crit ? 1.25 : 1;
  if (mv === "rise") {                                                     // 솟구치는 검기: 땅에서 몬스터를 가르며 위로
    jvAdd("kwave", { x: x - 6, y: GROUND - 18, vx: 30, vy: -420, r: 46 * big, ang: -Math.PI / 2 + 0.25, th: 15 * big, span: 1.15, dur: 300, pal });
  } else if (mv === "chop") {                                              // 지면 강타: 땅이 갈라지며 빛이 새고 고리가 퍼짐
    jvAdd("kquake", { x: x - 30, gy: GROUND - 2, dur: 420, pal, big });
    jvAdd("shards", { x: x - 10, gy: GROUND - 2, n: crit ? 8 : 5, col: pal[1], dark: pal[0], h: crit ? 58 : 40, spread: 100, dur: 520, noTint: true });
  } else if (mv === "lunge") {                                             // 마무리 관통 검기: 몬스터를 꿰뚫고 화면 끝까지
    const yy = GROUND - mh * 0.45;
    jvAdd("kpierce", { x0: HERO_X + 30, x1: MON_X + 230, y: yy, dur: 460, pal, big });
    jvAdd("kwave", { x: x - 10, y: yy, vx: 520, vy: 0, r: 58 * big, ang: 0, th: 20 * big, span: 1.3, dur: 280, pal });
  } else {                                                                 // 터치(찌르기) 등: 앞으로 날아가는 작은 검기
    jvAdd("kwave", { x: x - 20, y, vx: 480, vy: 0, r: 30 * big, ang: 0, th: 10 * big, span: 1.2, dur: 220, pal });
  }
}
JFX_DRAW.kwave = function (f) {
  const k = f.t / f.dur, a = Math.max(0, 1 - k * k), P = f.pal, s = f.dur / 1000;
  for (let g = 3; g >= 1; g--) {                                           // 꼬리 잔상
    const kk = Math.max(0, k - g * 0.07);
    jvCrescent(f.x + f.vx * kk * s, f.y + f.vy * kk * s, f.r * (0.9 + 0.3 * kk), f.ang, P[0], a * 0.32 / g, f.th * 0.75, f.span);
  }
  const x = f.x + f.vx * k * s, y = f.y + f.vy * k * s;
  jvCrescent(x, y, f.r * (0.9 + 0.3 * k), f.ang, P[1], a, f.th, f.span);
  jvCrescent(x, y, f.r * (0.82 + 0.3 * k), f.ang, P[2], a, f.th * 0.38, f.span * 0.92);
};
JFX_DRAW.kquake = function (f) {
  const k = f.t / f.dur, a = Math.max(0, 1 - k), P = f.pal, L = (60 + 150 * Math.min(1, k / 0.3)) * (f.big || 1);
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (let pass = 0; pass < 2; pass++) {                                   // 땅 갈라짐 (빛이 새어 나오는 금)
    ctx.globalAlpha = a * (pass ? 1 : 0.5); ctx.strokeStyle = pass ? P[2] : P[1]; ctx.lineWidth = pass ? 1.8 : 6;
    ctx.beginPath(); ctx.moveTo(f.x - 10, f.gy);
    for (let i = 1; i <= 9; i++) ctx.lineTo(f.x - 10 + L * i / 9, f.gy - 1 + Math.sin(f.seed + i * 2.3) * 3.2);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {                                            // 금에서 솟는 빛 조각
    const px = f.x + 20 + i * L / 4.5, h = (18 + (i % 2) * 14) * (1 - k) * (f.big || 1);
    ctx.globalAlpha = a * 0.8; ctx.fillStyle = P[1]; ctx.beginPath(); ctx.moveTo(px - 4, f.gy); ctx.lineTo(px, f.gy - h); ctx.lineTo(px + 4, f.gy); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  jvHalo(f.x + 34, f.gy, (24 + 130 * k) * (f.big || 1), (24 + 130 * k) * 0.16 * (f.big || 1), P[1], a * 0.95, 0);
};
JFX_DRAW.kpierce = function (f) {
  const k = f.t / f.dur, P = f.pal, ext = Math.min(1, k / 0.16), fade = k < 0.35 ? 1 : Math.max(0, 1 - (k - 0.35) / 0.65), x1 = f.x0 + (f.x1 - f.x0) * ext, b = f.big || 1;
  jvBlade(f.x0, f.y, x1, f.y, (12 * fade + 3) * b, P[1], fade, f.seed, 0.22, 0.75);
  jvBlade(f.x0, f.y, x1, f.y, (4 * fade + 1) * b, P[2], fade, f.seed + 3, 0.18, 0.7);
  if (k < 0.5) {                                                           // 돌진 속도선
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = P[1]; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { const yy = f.y - 26 + i * 13, L = 40 + ((f.seed * 7 + i * 13) % 30); ctx.globalAlpha = (1 - k / 0.5) * 0.7; ctx.beginPath(); ctx.moveTo(f.x0 - 30 - L, yy); ctx.lineTo(f.x0 - 30, yy); ctx.stroke(); }
    ctx.restore();
  }
};
