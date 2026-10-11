/* ===================== v43: 무기 66개 · 무기마다 다른 스킬 색 · 등급마다 쌓이는 이펙트 · 옷장·캐릭터도 7등급 · 다시 맞춘 밸런스 =====================
   사용자(2026-10-11 15:35~16:00): "에픽 전설 신화 초월 개수를 2배로 늘려 너무 적어 · 그 과정에서 밸런스 패치까지 다시 · 옷장도 다 적용 ·
     이 시스템 무기에만 한 거야? · 스킨 모든 거 다 적용시키되 밸런스 패치까지 · 에픽부터 신화까지 무기마다 스킬 색이 달라야 ·
     등급이 올라갈 때마다 추가 이펙트"
   기준(game-design 스킬): 톱니형 진행·긴 정체 없음(U-SYS-12, G-IDLE-14) · 모든 재화에 싱크(G-IDLE-15) · 수집은 성장의 기록(기둥 7) ·
     등급은 화면으로 바로 읽혀야(희소성 신호 = 색·겹치는 이펙트, U-FEEL 피드백 계층) · 말씀 세트는 기록이 열쇠, 강화는 만나(기둥 6·11) */

/* ---------- 무기 등급: 일반·고급·희귀 6개씩, 에픽·전설·신화·초월 12개씩 ---------- */
var WG_SIZES = [6, 6, 6, 12, 12, 12, 12], WG_START = [0, 6, 12, 18, 30, 42, 54];
gradeOf = function (i) { let g = 0; for (let k = 1; k < WG_START.length; k++) if (i >= WG_START[k]) g = k; return g; };
gradeFirst = function (g) { return WG_START[g] || 0; };
function gradePos(i) { const g = gradeOf(i); return [i - WG_START[g] + 1, WG_SIZES[g]]; }
WEAPONS.forEach((w, i) => { w.leg = gradeOf(i) >= 3; w.grade = gradeOf(i); });

/* 무기 해금 재료: 등급마다 첫 무기(관문) + 나머지는 a → b 로 고르게 오름. 등급 합계는 v42보다 조금 많게(옷장 새 장비·문서고가 재료를 더 주므로) */
BAL.wt = [null,
  { gate: { ore: 120 }, a: { ore: 60 }, b: { ore: 100 } },                                   // 고급
  { gate: { ore: 300, silver: 4 }, a: { ore: 160, silver: 3 }, b: { ore: 240, silver: 5 } },  // 희귀
  { gate: { silver: 8, ame: 1 }, a: { silver: 4, ame: 1 }, b: { silver: 13, ame: 3 } },      // 에픽
  { gate: { silver: 120, ame: 38 }, a: { silver: 55, ame: 16 }, b: { silver: 175, ame: 52 } }, // 전설
  { gate: { silver: 450, ame: 165 }, a: { silver: 240, ame: 86 }, b: { silver: 430, ame: 158 } }, // 신화
  { gate: { silver: 700, ame: 260 }, a: { silver: 420, ame: 158 }, b: { silver: 660, ame: 245 } }]; // 초월 — 시뮬(꾸준): 전설 16일 · 신화 106일 · 초월 317일 (v42와 같은 시간표, 무기는 두 배라 1~5주마다 새 무기)
function wtabBuild() {
  const T = [];
  for (let i = 0; i < WEAPONS.length; i++) {
    const g = gradeOf(i), P = BAL.wt[g]; if (!P) { T.push({}); continue; }
    const k = i - WG_START[g], n = WG_SIZES[g]; if (k === 0) { T.push(Object.assign({}, P.gate)); continue; }
    const f = n > 2 ? (k - 1) / (n - 2) : 0, o = {};
    Object.keys(P.a).forEach(m => { o[m] = Math.round(P.a[m] + (P.b[m] - P.a[m]) * f); });
    T.push(o);
  }
  BAL.wtab = T; return T;
}
wtabBuild();
wUnlockInfo = function (i) {
  const req = wUnlockCost(i), keys = Object.keys(req), prev = i <= wUnl() + 1;
  const ok = prev && keys.every(k => (+S[k] || 0) >= req[k]);
  const need = keys.map(k => `${ECO_NAME[k] || k} ${fmtR(req[k])}`).join(" · ");
  const lack = keys.filter(k => (+S[k] || 0) < req[k]).map(k => `${ECO_NAME[k] || k} ${fmtR(req[k] - (+S[k] || 0))}`).join(" · ");
  return { i, req, ok, prev, need, lack, entry: i === WG_START[gradeOf(i)], short: !prev ? "앞 무기부터" : ok ? `${need}로 열기` : `${lack} 더 필요` };
};
weaponStep = function () {                                                   // v42 그대로 + 고른 모양이 새 무기보다 앞(위) 무기면 그 모양을 지킴
  const c = weaponStepCost(); if (c == null || S.gold < c) return 0;
  const over = S.wi === LAST_W && S.wl >= 5, a = over ? overAme(S.wl) : 0;
  if (a && (S.ame || 0) < a) return 0;
  S.gold -= c; if (a) S.ame -= a;
  if (S.wl < 5 || S.wi === LAST_W) { S.wl++; return 1; }
  S.wi++; S.wl = 1; if (S.skin >= 0 && S.skin <= S.wi) S.skin = -1; return 2;
};
wGradeLadderHTML = function () {
  const u = wUnl(), cur = gradeOf(S.wi);
  const rows = WGRADES.map((G, g) => {
    const a = WG_START[g], n = WG_SIZES[g], b = a + n - 1, open = Math.max(0, Math.min(n, u - a + 1));
    const nx = u + 1 >= a && u + 1 <= b ? u + 1 : -1, lk = nx >= 0 ? wUnlockInfo(nx) : null;
    const st = open >= n ? `<b class="ok">모두 열림</b>` : open > 0 ? `${open}/${n} 열림` : `잠김`;
    const nxt = lk ? `<div class="wgl-n">다음 ${WEAPONS[nx].n} · ${lk.need}${lk.entry ? " (등급 관문)" : ""}</div>` : "";
    return `<div class="wgl-r${g === cur ? " cur" : ""}${open || lk ? "" : " off"}"><span class="wgr" style="color:${G.c};border-color:${G.c}">${G.n}</span><div class="wgl-t">${n}개 · ${WEAPONS[a].n} ~ ${WEAPONS[b].n}</div><span class="wgl-s">${st}</span>${nxt}</div>`;
  }).join("");
  return `${rows}<p class="muted wgl-f">무기는 재료로 한 번 열면 퇴사해도 열린 채라 모양도 골라 써요. 에픽부터는 무기마다 스킬 색이 다르고, 등급이 오를수록 무기 둘레·타격 이펙트가 한 겹씩 늘어요 (에픽 빛 알갱이 → 전설 피어오르는 기운·충격 고리 → 신화 룬 고리·빛줄기 → 초월 후광·별 섬광).<br>지금 ${matHave({ ore: 1, silver: 1, ame: 1 })} · 은괴는 공부 광산·지하 문서고 이정표·'공부 25분' 업무·옷장 도감, 자수정은 광산·문서고·'암송 5구절' 업무·플랜 하루 분량에서 나와요.</p>`;
};

/* ---------- 저장: 예전(42개) 무기 번호 → 새 번호 (18번부터 2k−17) ---------- */
var WLAY = 43;
function wMap42(k) { k = Math.floor(+k); if (!(k >= 0)) return k; return k < 18 ? k : Math.min(65, 2 * k - 17); }
(function () {
  const fs0 = freshState;
  freshState = function () { const s = fs0(); s.wlay = WLAY; return s; };
  const mg0 = merge;
  merge = function (d) {
    const s = mg0(d);
    if (+d.wlay !== WLAY) {
      s.wi = wMap42(s.wi || 0); s.wunl = Math.min(WEAPONS.length - 1, wMap42(s.wunl == null ? 5 : s.wunl));
      if (s.skin >= 0) s.skin = wMap42(s.skin);
    }
    s.wi = Math.max(0, Math.min(WEAPONS.length - 1, Math.floor(+s.wi || 0)));
    s.wunl = Math.max(s.wunl || 5, s.wi); s.wlay = WLAY;
    return s;
  };
})();

/* ---------- 에픽부터 무기마다 다른 스킬 색 (진한 · 가운데 · 밝은) — 같은 등급 12개 안에서 겹치지 않게, 무기 이름·재질에서 고름 ---------- */
var VFX43 = {
  // 에픽: 한 빛깔씩 (주황 · 초록 · 하늘 · 청 · 파랑 · 금 · 보라 · 연두 · 빨강 · 장미 · 백금 · 자홍)
  18: ["#8a3a0c", "#ff8a3b", "#ffe0c8"], 19: ["#0f5a1a", "#3bff5a", "#e0ffe4"], 20: ["#0f4a6a", "#3be8ff", "#e0fbff"], 21: ["#1d4a8a", "#6fc8ff", "#e6f6ff"],
  22: ["#0c2a8a", "#4a7cff", "#dfe8ff"], 23: ["#a8650c", "#ffc23b", "#fff6cf"], 24: ["#4a1a8a", "#b07cff", "#f0e6ff"], 25: ["#3a7a0c", "#b8ff4a", "#f4ffd8"],
  26: ["#8a0c1a", "#ff3b4a", "#ffd8dc"], 27: ["#8a1a4a", "#ff7ab8", "#ffe6f2"], 28: ["#5a6a8a", "#dfe8ff", "#ffffff"], 29: ["#7a0c6a", "#ff4ae0", "#ffe0fa"],
  // 전설
  30: ["#1d6fa0", "#8ff0ff", "#ffffff"], 31: ["#4a5ab8", "#cfdcff", "#ffffff"], 32: ["#8a1a0c", "#ff6a1a", "#ffe08a"], 33: ["#8a0c0c", "#ff2a3b", "#ffd0c0"],
  34: ["#1f6a0c", "#7aff3b", "#eaffd8"], 35: ["#0c1a8a", "#4a5aff", "#dfe4ff"], 36: ["#3a1a7a", "#a05cff", "#efe0ff"], 37: ["#8a5a1a", "#e8b860", "#fff7c2"],
  38: ["#0c6a3a", "#2fd87a", "#dcffe9"], 39: ["#8a2a5a", "#ff8ac8", "#fff0f8"], 40: ["#0c3a8a", "#3bb0ff", "#e0f4ff"], 41: ["#7a0c6a", "#ff5ce0", "#ffe0fa"],
  // 신화: 밝은 색에 다른 빛깔을 섞음
  42: ["#8a5a0c", "#ffb03b", "#fff0d0"], 43: ["#8a7a0c", "#ffe23b", "#fffbe0"], 44: ["#5b6274", "#eef4ff", "#bfe4ff"], 45: ["#1b2a8a", "#7c8cff", "#e6ecff"],
  46: ["#0c5a3a", "#2fc87a", "#dcffe9"], 47: ["#0c3a8a", "#9fd8ff", "#ffffff"], 48: ["#a8200c", "#ff2a5a", "#ffd54a"], 49: ["#a8200c", "#ff7a3b", "#fff3c4"],
  50: ["#0c4a8a", "#3bb8ff", "#e6f6ff"], 51: ["#2f6a0c", "#9fe34a", "#ffe08a"], 52: ["#0c4a6a", "#2fe0e0", "#e0fbff"], 53: ["#2a0c6a", "#9b5cff", "#5cf0ff"],
  // 초월: 세 빛깔
  54: ["#b8501a", "#ffb08a", "#fff09a"], 55: ["#b8781a", "#ffd54a", "#ffffff"], 56: ["#0c6a4a", "#3be0a0", "#ffe9a0"], 57: ["#0c5a6a", "#5ff8d8", "#ffd6f6"],
  58: ["#6a1a8a", "#ff8fe0", "#9ff0ff"], 59: ["#3a1a8a", "#b18cff", "#6fd3ff"], 60: ["#a8200c", "#ff7a2a", "#fff6cf"], 61: ["#1a0a2a", "#ff3bd0", "#ffd6f6"],
  62: ["#1a6a3a", "#c8ff3b", "#6fffe0"], 64: ["#b88a1a", "#fffbe0", "#ffffff"], 65: ["#1a3a8a", "#5ab0ff", "#fff09a"],
};
(function () {
  Object.keys(VFX43).forEach(j => { const D = WPN36[+j]; if (!D) return; D.vfx = VFX43[j].slice(); if (D.gl) D.gl.c = VFX43[j][1]; if (D.glow) D.glow.col = VFX43[j][1]; });
})();
function wVfxOf(i, t) {
  const D = WPN36[i]; if (!D) return ["#6f7d9c", "#d6e2f5", "#ffffff"];
  if (WEAPONS[i] && WEAPONS[i].fx === "rgb") { const h = Math.floor(((t || 0) / 6) % 360); return [`hsl(${h},85%,40%)`, `hsl(${(h + 50) % 360},100%,65%)`, "#ffffff"]; }
  return D.vfx || [shade(wpnRimCol(i, t || 0), -0.4), wpnRimCol(i, t || 0), "#ffffff"];
}

/* ---------- 등급마다 쌓이는 무기 이펙트 (들고 있는 무기 · 아이콘) ----------
   에픽: 칼날을 도는 빛 알갱이 · 은은한 빛 / 전설: + 칼날에서 피어오르는 기운 / 신화: + 돌아가는 룬 고리 / 초월: + 칼끝 후광 · 별 반짝임 · 무지갯빛 알갱이
   그려지는 무기 모양이 지금 무기보다 낮은 '모양'이면 지금 무기 등급을 따름 (등급은 실력, 모양은 취향) */
function wDrawGrade(i) { let g = gradeOf(i); if (S && typeof skinIdx === "function" && i === skinIdx() && i !== S.wi) g = Math.max(g, gradeOf(S.wi)); return g; }
function gStar(g, x, y, r, col, a) {                                          // 네 갈래 반짝이 (어떤 캔버스에나)
  if (a <= 0.02 || r <= 0) return;
  g.fillStyle = hexA(col, Math.min(1, a)); const w = Math.max(0.6, r * 0.22);
  g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + w, y - w); g.lineTo(x + r, y); g.lineTo(x + w, y + w); g.lineTo(x, y + r); g.lineTo(x - w, y + w); g.lineTo(x - r, y); g.lineTo(x - w, y - w); g.closePath(); g.fill();
}
function gradeAura(g, i, gr, px, py, angle, sc, t, still, front) {
  const P = wVfxOf(i, t), T = still ? 0 : t;
  g.save(); g.translate(px, py); g.rotate(angle); g.globalCompositeOperation = "lighter";
  const cy = -9 * sc;
  if (!front) {
    const R = (gr >= 5 ? 12 : 10) * sc, a0 = (still ? 0.22 : 0.18 + Math.sin(T / 300) * 0.05) + (gr - 3) * 0.04;
    const rg = g.createRadialGradient(0, cy, 1, 0, cy, R); rg.addColorStop(0, hexA(P[1], a0)); rg.addColorStop(1, hexA(P[1], 0)); g.fillStyle = rg; g.fillRect(-R, cy - R, R * 2, R * 2);
    if (gr >= 5 && g.ellipse && g.setLineDash) {                               // 신화: 룬 고리 (점선이 돌고 글자 점 6개)
      g.save(); g.translate(0, cy); g.rotate(still ? 0.3 : T / 2200);
      g.strokeStyle = hexA(P[2], 0.55); g.lineWidth = Math.max(1, sc * 0.35); g.setLineDash([sc * 1.6, sc * 1.1]); g.lineDashOffset = still ? 0 : -T / 90;
      g.beginPath(); g.ellipse(0, 0, 8.5 * sc, 8.5 * sc, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3; g.fillStyle = hexA(k % 2 ? P[1] : P[2], 0.9); g.fillRect(Math.cos(an) * 8.5 * sc - 0.6 * sc, Math.sin(an) * 8.5 * sc - 0.6 * sc, 1.2 * sc, 1.2 * sc); }
      g.restore();
    }
    if (gr >= 6 && g.ellipse) {                                                 // 초월: 칼끝 위 후광
      const hy = -17.2 * sc, pul = still ? 1 : 0.85 + Math.sin(T / 260) * 0.15;
      g.strokeStyle = hexA(P[2], 0.85 * pul); g.lineWidth = Math.max(1, sc * 0.45); g.beginPath(); g.ellipse(0, hy, 5.2 * sc, 1.7 * sc, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = hexA(P[1], 0.45 * pul); g.lineWidth = Math.max(1, sc * 0.9); g.beginPath(); g.ellipse(0, hy, 6.2 * sc, 2.2 * sc, 0, 0, Math.PI * 2); g.stroke();
    }
  } else {
    for (let k = 0; k < 3; k++) {                                               // 에픽: 칼날을 도는 빛 알갱이 3개
      const an = (still ? 0.6 : T / 620) + k * 2.094, x = Math.cos(an) * 6.5 * sc, y = cy + Math.sin(an) * 9.5 * sc, z = (0.7 + 0.25 * Math.sin(an)) * sc;
      g.fillStyle = hexA(k === 0 ? P[2] : P[1], 0.95); g.fillRect(x - z / 2, y - z / 2, z, z);
    }
    if (gr >= 4) for (let k = 0; k < 4; k++) {                                  // 전설: 칼날에서 피어오르는 기운
      const life = still ? 0.2 + k * 0.2 : (T / 900 + k / 4) % 1, x = (k % 2 ? -1 : 1) * (1.6 + 1.6 * Math.sin(T / 300 + k)) * sc, y = -3 * sc - life * 14 * sc, z = sc * (1.3 - 0.8 * life);
      g.fillStyle = hexA(life < 0.5 ? P[2] : P[1], (1 - life) * 0.85); g.fillRect(x - z / 2, y - z, z, z * 2);
    }
    if (gr >= 6) {                                                              // 초월: 별 반짝임 + 무지갯빛 알갱이
      const tw = still ? 1 : 0.7 + 0.3 * Math.sin(T / 210);
      gStar(g, 0, -16.6 * sc, (1.6 + 0.8 * tw) * sc, "#ffffff", 0.95); gStar(g, 0, -16.6 * sc, (2.6 + 1.2 * tw) * sc, P[2], 0.5);
      for (let k = 0; k < 4; k++) { const an = (still ? 1 : -T / 800) + k * 1.571, x = Math.cos(an) * 8 * sc, y = cy + Math.sin(an) * 6 * sc; g.fillStyle = `hsla(${Math.floor(((still ? 0 : T / 6) + k * 90) % 360)},100%,72%,0.9)`; g.fillRect(x - 0.5 * sc, y - 0.5 * sc, sc, sc); }
    }
  }
  g.restore();
}
(function () {
  const dw0 = drawWeapon;
  drawWeapon = function (g, i, lv, px, py, angle, sc, t, still) {
    const gr = WPN36[i] ? wDrawGrade(i) : 0, can = gr >= 3 && g && g.createRadialGradient && g.translate;
    if (can) gradeAura(g, i, gr, px, py, angle, sc, t, still, false);
    const r = dw0(g, i, lv, px, py, angle, sc, t, still);
    if (can) gradeAura(g, i, gr, px, py, angle, sc, t, still, true);
    return r;
  };
})();

/* 타격: 에픽 무기 색 불꽃·작은 고리 / 전설 + 두 겹 충격 고리 / 신화 + 빛줄기 / 초월 + 별 섬광·무지갯빛 고리 (흔들림·번쩍임 없이 그림만) */
var gHitT = { 5: 0, 6: 0 };
function gradeHitFx(crit, px, py) {
  const gr = gradeOf(S.wi); if (gr < 3 || !mon || typeof jvAdd !== "function") return;
  const now = performance.now(), ms = typeof monSize === "function" ? monSize() : { w: 60, h: 60 };
  const x = px != null ? px : MON_X - ms.w * 0.25, y = py != null ? py : GROUND - ms.h * 0.55, P = feelFxPal(now).slice();
  jSparks(x, y, P[2], crit ? 7 : 4, 12); jSparks(x, y, P[1], crit ? 5 : 3, 9);
  jvAdd("gring", { x, y, pal: P, gr, crit, dur: gr >= 4 ? 360 : 280, noTint: true });
  if (gr >= 5 && (crit || now - gHitT[5] > 340)) { gHitT[5] = now; jvAdd("grays", { x, y, pal: P, crit, dur: 400, noTint: true }); }
  if (gr >= 6 && (crit || now - gHitT[6] > 520)) { gHitT[6] = now; jvAdd("gnova", { x, y, pal: P, crit, dur: 600, noTint: true }); }
}
(function () {
  const hit0 = hit;
  hit = function (amount, crit, src, px, py) {
    const m0 = mon && !mon.dying ? mon : null;
    const r = hit0(amount, crit, src, px, py);
    if (m0 && (src === "hero" || src === "tap" || src === "jhero")) { try { gradeHitFx(crit, px, py); } catch (e) {} }
    return r;
  };
  if (typeof JFX_DRAW !== "object") return;
  JFX_DRAW.gring = function (f) {
    const k = f.t / f.dur, P = f.pal, a = Math.max(0, 1 - k), e = TP_EASE(Math.min(1, k * 1.6)), b = f.crit ? 1.25 : 1;
    if (!ctx.ellipse) return;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a * 0.75; ctx.strokeStyle = P[1]; ctx.lineWidth = 2.4 * a * b + 0.5;
    ctx.beginPath(); ctx.ellipse(f.x, f.y, (6 + 18 * e) * b, (6 + 18 * e) * b * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
    if (f.gr >= 4) {
      const e2 = TP_EASE(Math.min(1, k * 1.2));
      ctx.globalAlpha = a * 0.6; ctx.strokeStyle = P[2]; ctx.lineWidth = 3 * a * b + 0.4;
      ctx.beginPath(); ctx.ellipse(f.x, f.y, (10 + 40 * e2) * b, (10 + 40 * e2) * b * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = a * 0.5; ctx.strokeStyle = P[1]; ctx.lineWidth = 1.6 * a + 0.3;
      ctx.beginPath(); ctx.ellipse(f.x, f.y, (8 + 30 * e2) * b, (8 + 30 * e2) * b * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  };
  JFX_DRAW.grays = function (f) {
    const k = f.t / f.dur, P = f.pal, a = Math.max(0, 1 - k), e = TP_EASE(Math.min(1, k * 1.8)), b = f.crit ? 1.3 : 1;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 8; i++) {
      const an = i * Math.PI / 4 + f.seed * 0.1 + k * 0.6, L = (22 + 58 * e) * b * (i % 2 ? 0.7 : 1), w = (i % 2 ? 2 : 3.2) * b * a + 0.4;
      ctx.globalAlpha = a * 0.7; ctx.fillStyle = i % 2 ? P[1] : P[2];
      ctx.beginPath(); ctx.moveTo(f.x + Math.cos(an) * L, f.y + Math.sin(an) * L * 0.8); ctx.lineTo(f.x - Math.sin(an) * w, f.y + Math.cos(an) * w); ctx.lineTo(f.x + Math.sin(an) * w, f.y - Math.cos(an) * w); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };
  JFX_DRAW.gnova = function (f) {
    const k = f.t / f.dur, P = f.pal, a = Math.max(0, 1 - k), e = TP_EASE(Math.min(1, k * 1.5)), b = f.crit ? 1.3 : 1;
    jvStar(f.x, f.y, (14 + 22 * (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) * 0.8)) * b, P[2], a, 1.25, f.seed * 0.1);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 6; i++) {                                               // 밖으로 도는 작은 별 6개
      const an = i * 1.047 + k * 2.4 + f.seed, r = (12 + 52 * e) * b;
      ctx.globalAlpha = a; ctx.fillStyle = `hsl(${Math.floor((i * 60 + f.seed * 20) % 360)},100%,74%)`;
      const sx = f.x + Math.cos(an) * r, sy = f.y + Math.sin(an) * r * 0.75, z = 3.2 * a + 1;
      ctx.fillRect(sx - z / 2, sy - z * 1.4, z, z * 2.8); ctx.fillRect(sx - z * 1.4, sy - z / 2, z * 2.8, z);
    }
    if (ctx.ellipse) { ctx.globalAlpha = a * 0.55; ctx.strokeStyle = `hsl(${Math.floor((f.seed * 37 + k * 300) % 360)},100%,70%)`; ctx.lineWidth = 2.2 * a + 0.4; ctx.beginPath(); ctx.ellipse(f.x, f.y, (18 + 60 * e) * b, (18 + 60 * e) * b * 0.5, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  };
  if (typeof TINT_SKIP === "object") { TINT_SKIP.gring = 1; TINT_SKIP.grays = 1; TINT_SKIP.gnova = 1; }
})();

/* ===================== 옷장: 무기와 같은 7등급 (영웅 → 에픽, 초월 새로) ===================== */
WGRADE[3].n = "에픽";
if (WGRADE.length < 7) WGRADE.push({ n: "초월", c: "#fff09a", m: 10 });
var FAITH_SETS = { armor: 1, david: 1, victor: 1 };
function wardFaith(it) { return !!(it && (it.faith || (it.set && FAITH_SETS[it.set]))); }
BAL.wd43 = { trip: { silver: 20, ame: 6 }, legShop: { silver: 30, ame: 10 }, cosmo: { silver: 90, ame: 35 }, cosmoAura: { silver: 120, ame: 50 }, galaxyWfx: { silver: 150, ame: 60 },
  enh5: { silver: 8, ame: 3 }, enh6: { silver: 12, ame: 5 } };
var WSETS43 = [
  { id: "trip", n: "글로벌 출장 세트", g: 4, d: "세계 어디든 결재하러 간다 · 은괴·자수정으로 사요", col: "#d9a066",
    bonus: { 2: { gold: 300 }, 4: { boss: 250, btime: 3 }, 6: { xdmg: 4, stamp: 30 } } },
  { id: "david", n: "다윗의 목자 세트", g: 5, d: "목동에서 왕으로 · 암송·말씀·공부·출근 기록이 열쇠 · 강화는 만나로", col: "#e8c66a",
    bonus: { 2: { dmg: 400 }, 4: { boss: 400, btime: 5 }, 6: { xdmg: 6, mem: 30 } } },
  { id: "victor", n: "이기는 자 세트", g: 6, d: "끝까지 지킨 사람에게 · 말씀·암송·공부·출근 기록이 열쇠 · 강화는 만나로", col: "#fff6d0",
    bonus: { 2: { dmg: 600 }, 4: { xdmg: 2, boss: 500 }, 6: { xdmg: 8, manna: 40 }, 7: { xdmg: 1.5, crit: 10 } } },
  { id: "cosmo", n: "은하 그룹 총수 세트", g: 6, d: "은하 단위로 결재하는 총수의 옷 · 은괴·자수정으로 사요", col: "#b18cff",
    bonus: { 2: { critd: 800 }, 4: { xaps: 1.15, gold: 800 }, 6: { xdmg: 8 }, 7: { xdmg: 1.5, boss: 300 } } },
];
var WITEMS43 = [
  /* 글로벌 출장 세트 (전설, 은괴·자수정) */
  { id: "tr_head", set: "trip", slot: "head", n: "에비에이터 선글라스", c43: "trip", look: { hair: "slick", pal: { h: "#2b2018", e: "#6b5040" }, f: { 6: ".......QQQ.QQQ....", 7: ".......LLL.LLL...." }, c: { Q: "#d4a640", L: "#2a3550" } } },
  { id: "tr_top", set: "trip", slot: "top", n: "카멜 트렌치코트", c43: "trip",
    look: { pal: { j: "#c29a62", a: "#c29a62", w: "#f4f1e6", p: "#3a3a44", B: "#6b4a2e" }, f: { 12: "....N.......N.....", 14: "......o....o......", 16: "......o....o......", 19: "...jjjjjjjjjjj....", 20: "...jjjj..jjjj....." }, c: { N: "#9a7444", o: "#5a3a22" } } },
  { id: "tr_tie", set: "trip", slot: "tie", n: "버건디 실크 타이", c43: "trip", look: { pal: { t: "#7a1f3d" }, f: { 13: ".........TT.......", 15: "..........T......." }, c: { T: "#b03a5f" } } },
  { id: "tr_arm", set: "trip", slot: "arm", n: "골드 크로노그래프", c43: "trip", look: { pal: { x: "#e8c66a" }, f: { 16: "..............Q..." }, c: { Q: "#fff6d8" } } },
  { id: "tr_shoes", set: "trip", slot: "shoes", n: "첼시 부츠", c43: "trip", look: { pal: { b: "#5a3a22" }, f: { 22: ".....bKb..bKb....." }, c: { K: "#2a1a10" } } },
  { id: "tr_prop", set: "trip", slot: "prop", n: "알루미늄 캐리어", c43: "trip",
    look: { b: { 14: ".K................", 15: ".K................", 16: "LLLL..............", 17: "LllL..............", 18: "LLLL..............", 19: "LllL..............", 20: "LLLL..............", 21: "LllL..............", 22: "LLLL..............", 23: ".o.o.............." },
      c: { K: "#5b6274", L: "#c9ced8", l: "#9aa3b8", o: "#1b1f2a" } } },
  /* 다윗의 목자 세트 (신화, 기록 · 만나) */
  { id: "da_head", set: "david", slot: "head", n: "목동의 금관", cond: ["mem", 80], vs: "또 그 종 다윗을 택하시되 양의 우리에서 취하시며 (시 78:70)",
    look: { pal: { h: "#8a4a2a", e: "#c87a4a" }, f: { "-2": ".......Y.Y.Y......", "-1": ".......YYYYY......", 0: "......YRYYYRY....." }, c: { Y: "#ffd54a", R: "#d6403d" } } },
  { id: "da_top", set: "david", slot: "top", n: "목자의 양털 겉옷", cond: ["chap", 800], vs: "여호와는 나의 목자시니 내가 부족함이 없으리로다 (시 23:1)",
    look: { pal: { j: "#efe4c8", a: "#efe4c8", w: "#c9a46a", p: "#7a5a3a", B: "#6b4a2e" }, f: { 13: "...J.J.J..........", 15: "....J.J...........", 17: "...J.J............", 19: "...jjjjjjjjjj.....", 20: "....jjjj.jjjj....." }, c: { J: "#fffaf0" } } },
  { id: "da_tie", set: "david", slot: "tie", n: "물맷돌 주머니", cond: ["memp", 150], vs: "시내에서 매끄러운 돌 다섯을 골라서 … 주머니에 넣고 (삼상 17:40)",
    look: { pal: { t: "#8a5a3a" }, f: { 18: "..........QQ......", 19: "..........QQ......" }, c: { Q: "#6b4a2e" } } },
  { id: "da_arm", set: "david", slot: "arm", n: "다윗의 물매", cond: ["sstreak", 30], vs: "손에 물매를 가지고 블레셋 사람에게로 나아가니라 (삼상 17:40)",
    look: { pal: { x: "#8a5a3a" }, f: { 17: "...............k..", 18: "...............kk.", 19: "................o." }, c: { k: "#6b4a2e", o: "#d6dde9" } } },
  { id: "da_shoes", set: "david", slot: "shoes", n: "광야의 샌들", cond: ["att", 150], vs: "나는 만군의 여호와의 이름 … 으로 네게 가노라 (삼상 17:45)",
    look: { pal: { b: "#a8743a" }, f: { 21: ".....k.k..k.k.....", 22: ".....kkk..kkk....." }, c: { k: "#6b4a2e" } } },
  { id: "da_prop", set: "david", slot: "prop", n: "다윗의 수금", cond: ["rstreak", 60], vs: "다윗이 수금을 취하여 손으로 탄즉 사울이 상쾌하여 낫고 (삼상 16:23)",
    look: { b: { 10: "Y...Y.............", 11: "YY.YY.............", 12: "YiiiY.............", 13: "YiiiY.............", 14: "YiiiY.............", 15: ".YYY..............", 16: "..Y..............." }, c: { Y: "#d4a640", i: "#fff3c4" } } },
  /* 이기는 자 세트 (초월, 기록 · 만나) */
  { id: "vc_head", set: "victor", slot: "head", n: "생명의 면류관", cond: ["chap", 1600], vs: "네가 죽도록 충성하라 그리하면 내가 생명의 면류관을 네게 주리라 (계 2:10)",
    look: { pal: { h: "#3a2a20" }, f: { "-2": "......G.Y.Y.G.....", "-1": ".....GGYYYYYGG....", 0: ".....GgGgGgGgG...." }, c: { G: "#4fa85a", g: "#7fe36a", Y: "#ffe27a" } } },
  { id: "vc_top", set: "victor", slot: "top", n: "이기는 자의 흰 옷", cond: ["rstreak", 100], vs: "이기는 자는 이와 같이 흰 옷을 입을 것이요 (계 3:5)",
    look: { pal: { j: "#ffffff", a: "#ffffff", w: "#f4f1e6", p: "#e8e2cc", B: "#ffd54a" }, f: { 19: "...jjjjjjjjjjj....", 20: "...jjjjjjjjjjj....", 21: "....jjjjjjjjj.....", 22: ".....jjj.jjj......" } } },
  { id: "vc_tie", set: "victor", slot: "tie", n: "새 이름의 흰 돌", cond: ["mem", 150], vs: "또 흰 돌을 줄터인데 그 돌 위에 새 이름을 기록한 것이 있나니 (계 2:17)",
    look: { pal: { t: "#f4f1e6" }, f: { 15: ".........Qq.......", 16: ".........qQ......." }, c: { Q: "#ffffff", q: "#d6dde9" } } },
  { id: "vc_arm", set: "victor", slot: "arm", n: "선한 싸움의 소매", cond: ["study", 18000], vs: "내가 선한 싸움을 싸우고 나의 달려갈 길을 마치고 믿음을 지켰으니 (딤후 4:7)",
    look: { pal: { a: "#ffffff", x: "#ffd54a" }, f: { 17: "...yy............." }, c: { y: "#ffd54a" } } },
  { id: "vc_shoes", set: "victor", slot: "shoes", n: "달려갈 길의 신", cond: ["att", 300], vs: "푯대를 향하여 … 부름의 상을 위하여 좇아가노라 (빌 3:14)",
    look: { pal: { b: "#fff6d8" }, f: { 22: "......Y.....Y....." }, c: { Y: "#ffd54a" } } },
  { id: "vc_prop", set: "victor", slot: "prop", n: "종려 가지", cond: ["memp", 300], vs: "흰 옷을 입고 손에 종려 가지를 들고 (계 7:9)",
    look: { b: { 8: ".g................", 9: "GgG...............", 10: "gGg...............", 11: "GgGg..............", 12: ".gGg..............", 13: "GgGg..............", 14: ".gG...............", 15: "..G...............", 16: "..G...............", 17: "..G..............." }, c: { G: "#4fa85a", g: "#9fe36a" } } },
  { id: "a_dawnstar", set: "victor", slot: "aura", n: "새벽 별 오라", g: 6, cond: ["round", 2], perk: { xdmg: 2, manna: 30 }, vs: "내가 또 그에게 새벽 별을 주리라 (계 2:28)", aura: { k: "dawnstar", c1: "#fff09a", c2: "#ffffff" }, d: "머리 위에 새벽 별이 떠오름" },
  /* 은하 그룹 총수 세트 (초월, 은괴·자수정) */
  { id: "cm_head", set: "cosmo", slot: "head", n: "성운 올백", c43: "cosmo", look: { hair: "slick", pal: { h: "#3a2a6a", e: "#b18cff" }, f: { 2: ".........Q........", 4: "....Q............." }, c: { Q: "#ffffff" } } },
  { id: "cm_top", set: "cosmo", slot: "top", n: "성운 수트", c43: "cosmo",
    look: { pal: { j: "#241a4a", a: "#241a4a", w: "#e6d8ff", p: "#1a1236", B: "#ffd54a" }, f: { 13: "....Q.......R.....", 15: "......R...Q.......", 17: ".....Q.....R......", 18: "...........Q......" }, c: { Q: "#ffffff", R: "#ff8fe0" } } },
  { id: "cm_tie", set: "cosmo", slot: "tie", n: "초신성 넥타이", c43: "cosmo", look: { pal: { t: "#ff6bd6" }, f: { 14: ".........QQ.......", 16: "..........Q......." }, c: { Q: "#fff2ff" } } },
  { id: "cm_arm", set: "cosmo", slot: "arm", n: "행성 고리 커프스", c43: "cosmo", look: { pal: { a: "#241a4a", x: "#6fd3ff" }, f: { 15: ".............R...." }, c: { R: "#ffd54a" } } },
  { id: "cm_shoes", set: "cosmo", slot: "shoes", n: "중력 부츠", c43: "cosmo", look: { pal: { b: "#1a1236" }, f: { 23: ".....Q......Q....." }, c: { Q: "#6fd3ff" } } },
  { id: "cm_prop", set: "cosmo", slot: "prop", n: "궤도 위성", c43: "cosmo",
    look: { b: { 2: ".Q................", 3: "QWQ...............", 4: ".Q................", 9: "...............R..", 10: "..............RWR.", 11: "...............R.." }, c: { Q: "#6fd3ff", W: "#ffffff", R: "#ff8fe0" } } },
  { id: "a_galaxy", set: "cosmo", slot: "aura", n: "은하 소용돌이 오라", g: 6, c43: "cosmoAura", perk: { xdmg: 2 }, aura: { k: "galaxy", c1: "#b18cff", c2: "#6fd3ff" }, d: "몸 둘레로 은하 팔이 돎" },
  /* 무기 이펙트 */
  { id: "w_storm", slot: "wfx", n: "뇌우", g: 4, c43: "legShop", fx: "storm", perk: { aps: 10, boss: 60 }, d: "보랏빛 번개가 쉬지 않고 칼날을 때림" },
  { id: "w_dark", slot: "wfx", n: "흑염", g: 4, cond: ["floor", 700], fx: "darkflame", perk: { xdmg: 1.6 }, d: "검보랏빛 불꽃이 칼날을 집어삼킴" },
  { id: "w_petal", slot: "wfx", n: "꽃보라", g: 4, cond: ["memp", 100], fx: "petal", perk: { mem: 30, crit: 4 }, d: "꽃잎과 금가루가 칼날 둘레를 소용돌이침" },
  { id: "w_wisdom", slot: "wfx", n: "궁창의 빛", g: 5, faith: 1, cond: ["sstreak", 45], fx: "firmament", perk: { xdmg: 2, ore: 20 }, vs: "지혜 있는 자는 궁창의 빛과 같이 빛날 것이요 (단 12:3)", d: "별빛이 반짝이고 빛줄기가 칼날을 훑음" },
  { id: "w_galaxy", slot: "wfx", n: "은하수", g: 6, c43: "galaxyWfx", fx: "galaxy", perk: { xdmg: 2.5 }, d: "별가루가 소용돌이치며 칼날을 감쌈" },
  { id: "w_life", slot: "wfx", n: "생명나무", g: 6, faith: 1, cond: ["chap", 2000], fx: "lifetree", perk: { xdmg: 2.5, manna: 30 }, vs: "강 좌우에 생명 나무가 있어 열 두가지 실과를 맺히되 (계 22:2)", d: "푸른 잎이 맴돌고 열매가 반짝임" },
  /* 오라 */
  { id: "a_goldstorm", slot: "aura", n: "황금 폭풍 오라", g: 4, c43: "legShop", perk: { gold: 200, boss: 60 }, aura: { k: "goldstorm", c1: "#ffd54a", c2: "#fff3b0" }, d: "금빛 바람과 금화가 소용돌이침" },
  { id: "a_moon", slot: "aura", n: "자정 달빛 오라", g: 4, cond: ["att", 200], perk: { xdmg: 1.5, crit: 4 }, aura: { k: "moon", c1: "#b18cff", c2: "#fff7c2" }, d: "등 뒤에 초승달, 별이 돎" },
  { id: "a_cloud", slot: "aura", n: "구름 기둥 오라", g: 5, faith: 1, cond: ["chap", 1200], perk: { xdmg: 1.8, manna: 20 }, vs: "낮에는 구름 기둥으로 그들의 길을 인도하시고 (출 13:21)", aura: { k: "pillar", c1: "#dfe9ff", c2: "#ffffff" }, d: "흰 구름 기둥이 감쌈" },
  { id: "a_firecol", slot: "aura", n: "불 기둥 오라", g: 5, faith: 1, cond: ["rstreak", 80], perk: { xdmg: 1.8, boss: 120 }, vs: "밤에는 불 기둥으로 그들에게 비취사 (출 13:21)", aura: { k: "pillar", c1: "#ff7a1a", c2: "#ffe08a", ember: 1 }, d: "불 기둥이 솟고 불티가 오름" },
  /* 칭호 */
  { id: "t_k1000", slot: "title", n: "천 장의 사람", g: 4, cond: ["chap", 1000], perk: { manna: 30, dmg: 150 }, d: "말씀 1000장을 읽었습니다" },
  { id: "t_f800", slot: "title", n: "구름 위 임원실", g: 4, cond: ["floor", 800], perk: { dmg: 150, boss: 80 }, d: "800층에 올랐습니다" },
  { id: "t_vault", slot: "title", n: "문서고 탐험가", g: 4, cond: ["vault", 5000], perk: { gold: 150, ore: 15 }, d: "지하 문서고 5000m까지 내려갔습니다" },
  { id: "t_s200", slot: "title", n: "집중의 장인", g: 4, cond: ["study", 12000], perk: { ore: 40, dmg: 120 }, d: "공부 200시간을 채웠습니다" },
  { id: "t_heart", slot: "title", n: "마음판에 새긴 사람", g: 5, cond: ["mem", 200], perk: { mem: 40, critd: 300 }, d: "그것을 네 목에 매며 네 마음판에 새기라 (잠 3:3) · 암송 완료 200구절" },
  { id: "t_plan3", slot: "title", n: "세 번 완주한 순례자", g: 5, cond: ["planfin", 3], perk: { manna: 40, dmg: 250 }, d: "읽기 플랜을 세 번 끝까지 마쳤습니다" },
  { id: "t_victor", slot: "title", n: "이기는 자", g: 6, cond: ["rstreak", 365], perk: { dmg: 500, manna: 50 }, d: "이기는 그에게는 내가 하나님의 낙원에 있는 생명나무의 과실을 주어 먹게 하리라 (계 2:7) · 말씀 365일 연속" },
  { id: "t_f1000", slot: "title", n: "본사 꼭대기", g: 6, cond: ["floor", 1000], perk: { dmg: 400, gold: 400 }, d: "1000층, 본사 타워 꼭대기에 올랐습니다" },
];
function ward43Costs() { WITEMS.forEach(it => { if (it.c43 && BAL.wd43[it.c43]) it.cost = Object.assign({}, BAL.wd43[it.c43]); }); }
(function () {
  WSETS43.forEach(st => { if (!WSETX[st.id]) { WSETS.push(st); WSETX[st.id] = st; } });
  WITEMS43.forEach(it => { if (WIT[it.id]) return; if (!it.g) it.g = it.set && WSETX[it.set] ? WSETX[it.set].g : 1; WITEMS.push(it); WIT[it.id] = it; });
  ward43Costs();
  Object.assign(WFX_STYLE, { storm: "spark", darkflame: "flame", petal: "holy", firmament: "holy", galaxy: "cosmic", lifetree: "leaf" });
  Object.assign(WFX_PAL, { storm: ["#8a7cff", "#e6e0ff"], darkflame: ["#9b3bff", "#ff8fe0"], petal: ["#ff8fb0", "#ffd54a"], firmament: ["#9fd8ff", "#fff7c2"], galaxy: ["#b18cff", "#6fd3ff"], lifetree: ["#4fc85a", "#ffe08a"] });
  WCOND.vault = ["지하 문서고 최고", v => `${fmtR(v)}m`];
  WCOLL.push({ n: 140, fx: { dmg: 150 }, rw: { ore: 6000, silver: 12, ame: 6 } }, { n: 160, fx: { xdmg: 1.5 }, rw: { ore: 8000, silver: 16, ame: 8 } },
    { n: 180, fx: { critd: 300 }, rw: { ore: 10000, silver: 20, ame: 10 } }, { n: 190, fx: { xdmg: 2 }, rw: { silver: 30, ame: 15 } });
  const cv0 = wardCondVal;
  wardCondVal = function (k) { if (k === "vault") return vaultBestGet(); return cv0(k); };
})();
/* 강화 재료 사다리: 고급·희귀 광석 → 에픽 광석(+5강부터 은괴) → 전설 광석+은괴 → 신화·초월은 말씀 세트면 만나, 총수 세트처럼 사는 옷이면 은괴+자수정 */
wardEnhCost = function (it, e) {
  const g = it.g, faith = wardFaith(it);
  if (g >= 6) return faith ? { manna: Math.round(60 * Math.pow(1.4, e)) } : { silver: BAL.wd43.enh6.silver * (e + 1), ame: BAL.wd43.enh6.ame * (e + 1) };
  if (g === 5) return faith || !it.cost ? { manna: Math.round(30 * Math.pow(1.35, e)) } : { silver: BAL.wd43.enh5.silver * (e + 1), ame: BAL.wd43.enh5.ame * (e + 1) };
  if (g === 4) return { ore: Math.ceil(1500 * Math.pow(1.6, e) * (BAL.legEnhK || 1)), silver: 5 * (e + 1) };
  const base = [0, 40, 100, 250][g] || 40, c = { ore: Math.ceil(base * Math.pow(1.5, e)) };
  if (g === 3 && e >= 5) c.silver = e - 4;
  return c;
};
var WARD_MAIN = ["manna", "ore", "silver", "ame"];
function wardCostText(c) { return Object.keys(c || {}).map(k => `${ECO_NAME[k] || k} ${fmtR(c[k])}`).join(" · "); }
function wardCostOk(c) { return Object.keys(c || {}).every(k => (+S[k] || 0) >= c[k]); }
function wardCostOre(c) { c = c || {}; return (c.ore || 0) + 40 * (c.silver || 0) + 400 * (c.ame || 0) + 3 * (c.manna || 0); }
function wardBuyWhere(it) { const c = it.cost || {}; return c.silver || c.ame ? "은괴·자수정 (공부 광산·지하 문서고·업무)" : "공부로 캔 광석"; }
wardCostLabel = function (c) {
  const main = WARD_MAIN.find(k => c[k]) || "ore", rest = Object.keys(c).filter(k => k !== main && c[k]).map(k => `${ECO_NAME[k] || k} ${fmtR(c[k])}`).join(" · ");
  return { label: `${ECO_NAME[main] || main} ${fmtR(c[main] || 0)}`, ok: wardCostOk(c), cls: main === "manna" ? "manna" : main === "ore" ? "ore" : "rare", silver: 0, rest };
};
wardBuy = function (id) {
  const it = WIT[id], W = wardState(); if (!it || !it.cost || W.own[id] != null) return false;
  const c = it.cost, lack = Object.keys(c).filter(k => (+S[k] || 0) < c[k]);
  if (lack.length) { toast(`${lack.map(k => `${ECO_NAME[k] || k} ${fmtR(c[k] - (+S[k] || 0))}`).join(" · ")} 모자라요 · ${wardBuyWhere(it)}`); return false; }
  Object.keys(c).forEach(k => { S[k] -= c[k]; });
  W.own[id] = 0; W.ops++; if (W.seen && W.seen.indexOf(id) < 0) W.seen.push(id);
  const cur = W.eq[it.slot] && WIT[W.eq[it.slot]];
  if (!cur || it.g > cur.g) W.eq[it.slot] = id;
  wardDirty++;
  celebrate({ icon: wardBig(id, 92), title: it.g >= 4 ? `${WGRADE[it.g].n} 옷 구매!` : "새 옷!", sub: `${it.n} · ${WGRADE[it.g].n}<br><span class="muted">${W.eq[it.slot] === id ? "바로 입었어요" : "옷장에서 입을 수 있어요"} · 가지고만 있어도 모든 피해 +${wardNum(wardOwnVal(it, 0))}%</span>`, tone: it.g >= 4 ? "rare" : "ore" });
  wardCollTick(true);
  return true;
};

/* ---------- 새 무기 이펙트 6종 그리기 ---------- */
var WFX43 = { storm: 1, darkflame: 1, petal: 1, firmament: 1, galaxy: 1, lifetree: 1 };
(function () {
  const wb0 = drawWfxBack, wf0 = drawWfxFront;
  drawWfxBack = function (g, fx, sc, t, still, gain) {
    if (!WFX43[fx]) return wb0(g, fx, sc, t, still, gain);
    if (!g || !g.createRadialGradient) return;
    const P = WFX_PAL[fx], ga = gain || 1, cy = -9 * sc, big = fx === "galaxy" || fx === "lifetree", r = (big ? 16 : 13) * sc, pulse = (still ? 0.32 : 0.28 + Math.sin(t / 260) * 0.08) * ga;
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(0, cy, 1, 0, cy, r); gr.addColorStop(0, hexA(P[0], Math.min(0.9, pulse + 0.06))); gr.addColorStop(1, hexA(P[0], 0)); g.fillStyle = gr; g.fillRect(-r, cy - r, r * 2, r * 2);
    if (fx === "firmament" && g.createLinearGradient) { const lg = g.createLinearGradient(-12 * sc, 0, 12 * sc, 0); lg.addColorStop(0, hexA(P[1], 0)); lg.addColorStop(0.5, hexA(P[1], 0.35 * ga)); lg.addColorStop(1, hexA(P[1], 0)); g.fillStyle = lg; g.fillRect(-12 * sc, cy - 1.2 * sc, 24 * sc, 2.4 * sc); }
    if (fx === "galaxy") for (let arm = 0; arm < 2; arm++) for (let k = 0; k < 10; k++) { const an = (still ? 0 : t / 1400) + arm * Math.PI + k * 0.42, rr = (1.5 + k * 1.05) * sc; g.fillStyle = hexA(k % 3 ? P[0] : P[1], (1 - k / 10) * 0.55 * ga); g.fillRect(Math.cos(an) * rr - 0.5 * sc, cy + Math.sin(an) * rr * 0.75 - 0.5 * sc, sc, sc); }
    g.restore();
  };
  drawWfxFront = function (g, fx, sc, t, still, gain) {
    if (!WFX43[fx]) return wf0(g, fx, sc, t, still, gain);
    if (!g) return;
    const P = WFX_PAL[fx], R = wardRnd, ga = gain || 1, zk = 0.6 + 0.4 * ga, gp = g.__gain;
    const box = (x, y, w, h, col, a) => { g.fillStyle = hexA(col, Math.min(1, a * ga)); g.fillRect(x - w * (zk - 1) / 2, y - h * (zk - 1) / 2, w * zk, h * zk); };
    g.save(); g.__gain = ga; if (fx !== "darkflame") g.globalCompositeOperation = "lighter";
    if (fx === "storm") {
      const seed = still ? 5 : Math.floor(t / 70); g.lineWidth = Math.max(1, sc * 0.5);
      for (let k = 0; k < 3; k++) {
        let x = (R(seed + k * 3) - 0.5) * 2 * sc, y = -(4 + 10 * R(seed * 3 + k)) * sc; const dir = R(seed + k * 7) < 0.5 ? -1 : 1;
        g.strokeStyle = hexA(k === 1 ? "#ffffff" : P[0], Math.min(1, 0.9 * ga)); g.beginPath(); g.moveTo(x, y);
        for (let q = 0; q < 5; q++) { x += dir * (0.8 + R(seed + q + k * 5) * 1.3) * sc; y += (R(seed * 2 + q + k) - 0.5) * 3.4 * sc; g.lineTo(x, y); }
        g.stroke(); box(x - sc / 2, y - sc / 2, sc, sc, P[1], 0.9);
      }
      for (let i = 0; i < 6; i++) { const life = still ? R(i) : (t / 520 + i / 6) % 1; box((R(i + 9) - 0.5) * 9 * sc, -15 * sc + life * 17 * sc, sc * 0.35, sc * 1.6, P[1], (1 - life) * 0.55); }
    } else if (fx === "darkflame") {
      const cols = ["#ff8fe0", "#9b3bff", "#3a0a5a"];
      for (let i = 0; i < 15; i++) { const life = still ? R(i) : (t / 500 + i / 15) % 1, side = i % 2 ? 1 : -1; const x = side * (1.1 + 2 * R(i + 1)) * sc * (1 - 0.3 * life) + (still ? 0 : Math.sin(t / 160 + i) * 0.7 * sc), y = (-2 - 13 * R(i + 3)) * sc - life * 7 * sc, z = sc * (2.1 - 1.3 * life); box(x - z / 2, y - z / 2, z, z, life < 0.35 ? cols[0] : life < 0.7 ? cols[1] : cols[2], 1 - life); }
    } else if (fx === "petal") {
      for (let i = 0; i < 11; i++) { const an = (still ? 0 : t / 900) + i * 0.571, rr = (3 + (i % 3) * 1.6) * sc, life = still ? R(i) : (t / 1700 + i / 11) % 1; box(Math.cos(an) * rr, -9 * sc + Math.sin(an) * rr * 1.5 + life * 3 * sc, sc * 1.3, sc * 0.7, i % 3 ? P[0] : "#ffe3ec", 0.9 - life * 0.5); }
      for (let i = 0; i < 4; i++) { const on = still ? 0.8 : (Math.sin(t / 240 + i * 1.7) + 1) / 2; wardPlus(g, (R(i + 21) - 0.5) * 8 * sc, -(3 + 12 * R(i + 22)) * sc, sc * (0.3 + on * 0.5), P[1], on); }
    } else if (fx === "firmament") {
      for (let i = 0; i < 7; i++) { const on = still ? 0.7 : (Math.sin(t / 260 + i * 1.9) + 1) / 2; wardPlus(g, (R(i + 3) - 0.5) * 10 * sc, -(2 + 14 * R(i + 4)) * sc, sc * (0.3 + on * 0.6), i % 2 ? P[1] : "#ffffff", 0.4 + on * 0.6); }
      const p = still ? 0.5 : (t % 1500) / 1500; box(-2.2 * sc, -(1 + p * 15) * sc, 4.4 * sc, 0.8 * sc, "#ffffff", p < 0.85 ? 0.8 : (1 - p) * 5);
    } else if (fx === "galaxy") {
      for (let i = 0; i < 12; i++) { const an = (still ? 0.4 : t / 700) + i * 0.524, x = Math.cos(an) * 6 * sc, y = -9 * sc + Math.sin(an) * 8 * sc; if (Math.sin(an) < -0.2) continue; box(x - 0.45 * sc, y - 0.45 * sc, 0.9 * sc, 0.9 * sc, i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? P[0] : P[1], 0.9); }
      for (let i = 0; i < 3; i++) { const on = still ? 0.8 : (Math.sin(t / 300 + i * 2.1) + 1) / 2; wardPlus(g, (R(i + 31) - 0.5) * 7 * sc, -(4 + 11 * R(i + 32)) * sc, sc * (0.35 + on * 0.55), "#ffffff", on); }
    } else if (fx === "lifetree") {
      for (let i = 0; i < 9; i++) { const an = (still ? 0 : t / 1100) + i * 0.698, rr = (4 + (i % 3) * 1.5) * sc, x = Math.cos(an) * rr, y = -9 * sc + Math.sin(an) * rr * 1.3; box(x - 0.7 * sc, y - 0.4 * sc, 1.4 * sc, 0.8 * sc, i % 2 ? P[0] : "#b8ff6a", 0.85); }
      const fr = ["#ff6b6b", "#ffd54a", "#ff9bd2", "#ffb13b", "#ffffff"];
      for (let i = 0; i < 5; i++) { const on = still ? 0.8 : (Math.sin(t / 280 + i * 1.3) + 1) / 2; box((R(i + 41) - 0.5) * 7 * sc - 0.5 * sc, -(3 + 12 * R(i + 42)) * sc - 0.5 * sc, sc, sc, fr[i], 0.5 + on * 0.5); }
    }
    g.__gain = gp; g.restore();
  };
})();

/* ---------- 새 오라 4종: 황금 폭풍 · 달빛 · 은하 소용돌이 · 새벽 별 (+ 불 기둥은 기둥에 불티) ---------- */
var AURA43 = { goldstorm: 1, moon: 1, galaxy: 1, dawnstar: 1 };
(function () {
  const da0 = drawWardAura;
  drawWardAura = function (g, au, cx, cy, s, t, still, gain) {
    if (!au || !g || !g.createRadialGradient) return da0(g, au, cx, cy, s, t, still, gain);
    if (!AURA43[au.k]) {
      da0(g, au, cx, cy, s, t, still, gain);
      if (au.k === "pillar" && au.ember) { g.save(); g.globalCompositeOperation = "lighter"; const tt = still ? 0 : t; for (let i = 0; i < 8; i++) { const life = still ? wardRnd(i + 50) : (tt / 1000 + i / 8) % 1; g.fillStyle = hexA(i % 2 ? "#ffd54a" : "#ff5a1a", (1 - life) * Math.min(1, gain || 1)); g.fillRect(cx + (wardRnd(i + 60) - 0.5) * 14 * s, cy + 12 * s - life * 34 * s, s, s); } g.restore(); }
      return;
    }
    const tt = still ? 0 : t, c1 = au.c1, c2 = au.c2 || au.c1, ga = gain || 1, gp = g.__gain;
    g.save(); g.globalCompositeOperation = "lighter"; g.__gain = ga;
    const hA = (c, a) => hexA(c, Math.min(1, a * ga));
    const a0 = still ? 0.3 : 0.24 + Math.sin(tt / 260) * 0.06, R0 = 22 * s;
    const gr = g.createRadialGradient(cx, cy, 2, cx, cy, R0); gr.addColorStop(0, hA(c1, a0)); gr.addColorStop(1, hA(c1, 0)); g.fillStyle = gr; g.fillRect(cx - R0, cy - R0, R0 * 2, R0 * 2);
    if (au.k === "goldstorm") {
      g.lineWidth = Math.max(1, s * 0.8);
      for (let j = 0; j < 3; j++) { const a1 = (still ? 0 : tt / 420) + j * 2.1, yc = cy + (j - 1) * 8 * s; g.strokeStyle = hA(j === 1 ? c1 : c2, 0.6); g.beginPath(); for (let q = 0; q <= 9; q++) { const an = a1 + q * 0.2, x = cx + Math.cos(an) * 13 * s, y = yc + Math.sin(an) * 4.5 * s; if (q) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
      for (let i = 0; i < 7; i++) { const life = still ? wardRnd(i) : (tt / 1300 + i / 7) % 1; const x = cx + (wardRnd(i + 3) - 0.5) * 24 * s; g.fillStyle = hA(i % 2 ? c1 : "#fff6cf", 1 - life); g.fillRect(x - s * 0.8, cy + 12 * s - life * 30 * s - s * 0.5, s * 1.6, s); }
    } else if (au.k === "moon") {
      const mx = cx + 7 * s, my = cy - 15 * s, mr = 7 * s;
      g.fillStyle = hA(c2, 0.55); g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = "destination-out"; g.fillStyle = "rgba(0,0,0,1)"; g.beginPath(); g.arc(mx + 3 * s, my - 1.5 * s, mr * 0.85, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 6; i++) { const an = (still ? 0 : tt / 1100) + i * 1.047; wardPlus(g, cx + Math.cos(an) * 14 * s, cy + 1 * s + Math.sin(an) * 4 * s, s * 0.6, i % 2 ? c1 : c2, 0.85); }
    } else if (au.k === "galaxy") {
      for (let arm = 0; arm < 2; arm++) for (let k = 0; k < 16; k++) { const an = (still ? 0 : tt / 1600) + arm * Math.PI + k * 0.36, rr = (3 + k * 1.15) * s; g.fillStyle = hA(k % 4 === 0 ? "#ffffff" : k % 2 ? c1 : c2, (1 - k / 16) * 0.85); g.fillRect(cx + Math.cos(an) * rr - s * 0.5, cy + 2 * s + Math.sin(an) * rr * 0.42 - s * 0.5, s, s); }
      for (let i = 0; i < 4; i++) { const on = still ? 0.8 : (Math.sin(tt / 300 + i * 1.6) + 1) / 2; wardPlus(g, cx + (wardRnd(i + 70) - 0.5) * 26 * s, cy + (wardRnd(i + 71) - 0.5) * 22 * s, s * (0.3 + on * 0.5), "#ffffff", on); }
    } else if (au.k === "dawnstar") {
      const L = 27 * s, rg = g.createRadialGradient(cx, cy - 2 * s, 3 * s, cx, cy - 2 * s, L); rg.addColorStop(0, hA(c2, 0.4)); rg.addColorStop(0.5, hA(c1, 0.16)); rg.addColorStop(1, hA(c1, 0)); g.fillStyle = rg;
      for (let i = 0; i < 9; i++) { const an = (still ? 0 : tt / 4200) + i * 0.698; g.beginPath(); g.moveTo(cx, cy - 2 * s); g.lineTo(cx + Math.cos(an - 0.06) * L, cy - 2 * s + Math.sin(an - 0.06) * L); g.lineTo(cx + Math.cos(an + 0.06) * L, cy - 2 * s + Math.sin(an + 0.06) * L); g.closePath(); g.fill(); }
      const tw = still ? 1 : 0.75 + 0.25 * Math.sin(tt / 240), sx = cx, sy = cy - 24 * s;
      gStar(g, sx, sy, 4.5 * s * tw, c1, 0.6 * ga); gStar(g, sx, sy, 2.8 * s * tw, "#ffffff", 0.95 * ga);
    }
    g.__gain = gp; g.restore();
  };
})();

/* ---------- 옷장 등급 사다리 (옷장 탭 맨 아래) ---------- */
function wardGradeHTML() {
  const W = wardState(), rows = WGRADE.map((G, g) => {
    if (g === 0) return "";
    const all = WITEMS.filter(it => it.g === g), own = all.filter(it => W.own[it.id] != null).length;
    const buy = all.filter(it => it.cost), keyN = all.filter(it => it.cond).length;
    const bm = buy.length ? [...new Set(buy.map(it => wardBuyWhere(it).split(" (")[0]))].join(" · ") : "";
    const enhAll = all.filter(it => it.slot !== "title"), fa = enhAll.some(it => wardFaith(it)), nf = enhAll.some(it => !wardFaith(it));
    const enh = g <= 2 ? "광석" : g === 3 ? "광석 (+5강부터 은괴)" : g === 4 ? "광석 + 은괴" : [fa ? (nf ? "말씀 세트는 만나" : "만나") : "", nf ? (fa ? "사는 옷은 은괴 + 자수정" : "은괴 + 자수정") : ""].filter(Boolean).join(" · ");
    const sets = WSETS.filter(st => st.g === g).map(st => st.n).join(" · ");
    return `<div class="wgl-r wdg-r${own ? "" : " off"}"><span class="wgr" style="color:${G.c};border-color:${G.c}">${G.n}</span><div class="wgl-t">${sets ? `<b>${escapeHtml(sets)}</b> 등` : ""} ${all.length}벌</div><span class="wgl-s">${own >= all.length ? `<b class="ok">모두</b>` : `${own}/${all.length}`}</span><div class="wdg-m">${bm ? `사기: ${bm} · ` : ""}${keyN ? `열쇠 ${keyN}벌 · ` : ""}강화: ${enh}</div></div>`;
  }).join("");
  return `${rows}<p class="muted wgl-f">옷장도 무기와 같은 일반~초월 7등급이에요. 등급이 높을수록 입었을 때·가지고만 있어도 효과가 커져요 (초월 x10). 말씀 세트(신화 전신갑주·다윗, 초월 이기는 자)는 말씀·암송·공부·출근 기록이 열쇠예요.</p>`;
}
(function () {
  if (typeof panels === "undefined" || !panels.suit || typeof secTitle !== "function") return;
  secTitle("suit", "옷장 등급", "무기와 같은 7등급 · 사는 재료와 강화 재료");
  const box = el("div", "card wgl"); let key = "";
  addCustom("suit", box, () => { const W = wardState(), k = Object.keys(W.own).length + "|" + wardDirty; if (k === key) return; key = k; box.innerHTML = wardGradeHTML(); });
})();

/* ---------- 캐릭터도 등급 (이름 색) + 전설·신화·초월 3명 ---------- */
(function () {
  const G = { choi: 0, lee: 1, park: 1, kim: 2, han: 2, pastor: 3, robo: 3 };
  CHARS.forEach(c => { if (c.g == null) c.g = G[c.id] || 0; });
  const add = c => { if (!CHARS.some(x => x.id === c.id)) CHARS.push(c); };
  add({ id: "yoon", n: "윤이사", g: 4, hair: "bun", pal: { h: "#2a1a10", s: "#f7d3b5", g: "#f7d3b5", w: "#fff6d8", j: "#7a1f3d", a: "#7a1f3d", t: "#ffd54a", p: "#2a1a10", b: "#141418" }, req: { k: "floor", v: 600, d: "최고 600층" } });
  add({ id: "elder", n: "백발 회장님", g: 5, hair: "slick", pal: { h: "#e8e8ee", e: "#ffffff", s: "#e8b993", g: "#141418", w: "#ffffff", j: "#141414", a: "#141414", t: "#c8322e", p: "#141414", b: "#141418", x: "#ffd54a", B: "#ffd54a" }, req: { k: "rank", v: 8, d: "전무 승진" } });
  add({ id: "goldkwak", n: "황금 곽준영", g: 6, hair: "neat", pal: { h: "#ffd54a", e: "#fff6cf", s: "#ffe8b0", g: "#ffd54a", w: "#fff6d8", j: "#ffd54a", a: "#ffd54a", t: "#ffffff", p: "#c9a43a", b: "#ffd54a", x: "#ffffff", B: "#c9a43a", k: "#7a5a1a" }, req: { k: "rstreak", v: 200, d: "말씀 200일 연속" } });
  const cp0 = charProgress;
  charProgress = function (c) { if (c && c.req && c.req.k === "rank") return rankIdx(); if (c && c.req && c.req.k === "round") return (S.bible && +S.bible.rounds) || 0; return cp0(c); };
})();

/* ---------- 체력 바: 깎인 자국(흰빛)이 부드럽게 따라 내려옴 · 보스는 여러 줄(x N) ----------
   사용자(16:18, 던전앤파이터 영상): "보스랑 잡몹 HP 소모될 때 영상처럼 스무스하게 닳게"
   영상: 지금 체력은 바로 줄고, 깎인 만큼 흰빛 자국이 잠깐 남았다가 스르르 따라 내려옴. 보스는 줄마다 색이 다르고, 한 줄을 다 깎으면 아래 줄 색이 드러남 (x N).
   예전엔 CSS 전환이라 아이폰 '동작 줄이기'가 켜져 있으면 아예 안 움직였고, 계속 맞으면 자국이 멈춰 있다가 한 번에 떨어졌음 → 매 프레임 직접 계산 */
var HP_COLS = [["#ffa293", "#ff4d4d", "#c62b3c"], ["#ffd0a0", "#ff9a3b", "#c8641c"], ["#fff3a0", "#ffd54a", "#c9a21c"], ["#d8ffb0", "#8fe36a", "#4f9a2a"],
  ["#b8fff0", "#3bd8c0", "#1f8a80"], ["#c8e4ff", "#4aa8ff", "#2a5ab8"], ["#e0d0ff", "#9b7cff", "#5a3ab8"], ["#ffd0f0", "#ff6bd6", "#b02a90"]];
var HPB = { mon: null, shown: 0, ghost: 0, hold: 0, t: 0, idx: -1, L: 0 };
function hpLinesOf(m) { if (!m || mode === "vault") return 1; if (m.golden) return 2; return [1, 3, 5, 8][m.kind] || 1; }
function hpBarTick() {
  const m = mon, bar = $("hpBar"), tr = $("hpTrail"); if (!m || !bar || !tr) return;
  const now = performance.now(), dt = Math.max(0, Math.min(100, now - (HPB.t || now))); HPB.t = now;
  const max = Math.max(1e-9, +m.max || 1), hp = Math.max(0, Math.min(max, +m.hp || 0)), eps = max * 1e-9;
  if (HPB.mon !== m || hp > HPB.ghost + eps) { HPB.mon = m; HPB.shown = hp; HPB.ghost = hp; HPB.hold = 0; HPB.idx = -1; }
  if (hp < HPB.shown - eps && HPB.ghost - HPB.shown < max * 0.002) HPB.hold = 110;          // 새로 깎이면 자국이 잠깐 멈췄다가
  HPB.shown = hp + (HPB.shown - hp) * Math.exp(-dt / 55);                                  // 지금 체력은 아주 빨리
  if (HPB.shown - hp < max * 1e-5) HPB.shown = hp;
  const L = hpLinesOf(m), per = max / L;
  if (HPB.hold > 0) HPB.hold -= dt;
  else if (HPB.ghost > HPB.shown) { const d = HPB.ghost - HPB.shown, step = Math.max(d * (1 - Math.exp(-dt / 210)), per * 0.35 * dt / 1000); HPB.ghost = Math.max(HPB.shown, HPB.ghost - step); }
  const idx = Math.max(0, Math.min(L - 1, Math.ceil(HPB.shown / per - 1e-9) - 1)), base = idx * per;
  const w1 = Math.max(0, Math.min(100, (HPB.shown - base) / per * 100)), w2 = Math.max(w1, Math.min(100, (HPB.ghost - base) / per * 100));
  bar.style.width = w1.toFixed(2) + "%"; tr.style.width = w2.toFixed(2) + "%";
  if (idx !== HPB.idx || HPB.L !== L) {
    HPB.idx = idx; HPB.L = L;
    const c = HP_COLS[idx % HP_COLS.length], nx = idx > 0 ? HP_COLS[(idx - 1) % HP_COLS.length] : null, box = bar.parentElement;
    bar.style.background = `linear-gradient(180deg, ${c[0]} 0 3px, ${c[1]} 3px 62%, ${c[2]} 62% 100%)`;
    tr.style.background = `linear-gradient(90deg, #ffffff, #fffaf0 40%, ${c[0]})`;
    if (box) box.style.background = nx ? `linear-gradient(180deg, ${nx[1]} 0 62%, ${nx[2]} 62% 100%)` : "";
    let lab = $("hpLines"); if (!lab && box) { lab = document.createElement("b"); lab.id = "hpLines"; lab.className = "hp-n num"; box.appendChild(lab); }
    if (lab) lab.textContent = L > 1 ? `x${idx + 1}` : "";
  }
}
(function () { const rt0 = renderTop; renderTop = function (full) { rt0(full); try { hpBarTick(); } catch (e) {} }; })();
