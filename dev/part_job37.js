/* ===================== v37 직무별 대표 동작 · 새 직무 감사팀(저격수) · 겸직 속성 =====================
   사용자 결정(2026-10-11): 직무마다 대표 동작 한 벌(영업 전사 · 기획 거너 · 개발 마법사 · 인사·총무 소환사 · 감사 저격수)을 만들고,
   가진 직무 중 '대표 직무'를 직접 고름 → 그 동작·기본 공격·스킬로 싸움. 나머지 가진 직무는 '겸직 속성'으로 얹혀
   매 타격 속성 피해 +20%(직무 하나당) + 그 직무 색 이펙트, 3연타 마무리마다 속성 발동 → 직무가 늘수록 확실히 세짐.
   참고: 메이플 키우기(계열마다 공격 방식이 다름) · FF11 메인/서포트 잡(메인이 정체성, 서포트는 능력 일부) ·
   게임 디자인 스킬 G-MOBA-07(직업 키트는 효과가 달라야) · U-FEEL-12(1차 실루엣 = 대표 직무 하나) · G-SHT-02(사격 한 발 레이어)
   이 파일은 직무 코드(JOBS·JSK·JSK_CAST·JFX_DRAW) 뒤에 들어감 */

/* ---------- 새 직무: 감사팀 · 정밀 저격형 ---------- */
JOBS.push({ id: "audit", n: "감사", team: "감사팀", type: "정밀 저격형", col: "#ffa24a", ic: "job_audit",
  pas: ["한 발 피해 2배 (공격 속도 −30%)", "치명타 피해 +50%", "3발마다 '지적!' 확정 치명타"], atk: "떨어져서 무릎 꿇고 정밀 저격 · 3발마다 '지적!' 관통", sk: ["probe", "censure"] });
JSK.probe = { id: "j_probe", key: "probe", job: "audit", n: "전수 조사", cd: 45, ic: "jsk_probe", d: "정밀 사격 6발 (한 발에 초당 피해 3.5배)" };
JSK.censure = { id: "j_censure", key: "censure", job: "audit", n: "징계 확정", cd: 70, dur: 8, ic: "jsk_censure", d: "8초 동안 모든 공격이 치명타 · 치명타 피해 2배" };
/* 기본 공격 설명을 대표 동작에 맞춤 (직무 고르기 창 · 인사 기록 '대표 동작' 줄) */
[["sales", "몬스터에 붙어 베기 · 마무리 돌진 찌르기 · 치명타마다 '계약!'"], ["dev", "떨어져서 지팡이 끝 코드 탄 · 마무리는 하늘에서 번개"],
 ["plan", "떨어져서 레이저 포인터 사격 · 마무리 3연발"], ["hr", "떨어져서 결재 도장 투척 · 마무리는 큰 도장이 쾅"]].forEach(([id, a]) => { const j = JOBS.find(x => x.id === id); if (j) j.atk = a; });
/* 직무 칸: 대리·과장·부장 + 이사(새로) + 사장 → 다섯 */
RANKS.forEach(r => { if (r.n === "이사") r.job = true; });
Object.assign(UIICON, {
  job_audit: { m: ["..............", "....kkkkk.....", "...kGGGGGk....", "..kGgwggGGk...", "..kGwggggGk...", "..kGggggggk...", "..kGggggGGk...", "...kGGGGGk....", "....kkkkkhh...", ".........hHh..", "..........hHh.", "...........hHh", "............h.", ".............."],
    p: { k: "#5a3a0c", G: "#ffa24a", g: "#ffe6c4", w: "#ffffff", h: "#8a5a3a", H: "#c98a5a" } },
  jsk_probe: { m: ["......kk......", "......kk......", "..............", "...kkkkkkkk...", "..k........k..", "..k...rr...k..", "kk..rrRRrr..kk", "kk..rrRRrr..kk", "..k...rr...k..", "..k........k..", "...kkkkkkkk...", "..............", "......kk......", "......kk......"],
    p: { k: "#ffa24a", r: "#ff7a3b", R: "#ffffff" } },
  jsk_censure: { m: ["..............", "...rrrrrrrr...", "..r........r..", ".r..wwwwww..r.", ".r..w....w..r.", ".r..wwwwww..r.", ".r....ww....r.", ".r..wwwwww..r.", ".r....ww....r.", ".r...w..w...r.", "..r........r..", "...rrrrrrrr...", "..............", ".............."],
    p: { r: "#e0262c", w: "#ff9b9b" } },
});

/* ---------- 겸직 속성 ---------- */
var JOB_ATTR = {
  sales: { n: "금빛",   col: "#ffd54a", d: "매 타격 금빛 피해 +20% · 3연타 마무리마다 금화 폭발" },
  dev:   { n: "번개",   col: "#6fd3ff", d: "매 타격 번개 피해 +20% · 3연타 마무리마다 연쇄 번개" },
  plan:  { n: "레이저", col: "#ff7a9a", d: "매 타격 레이저 피해 +20% · 3연타 마무리마다 레이저 저격 (보스에겐 2배)" },
  hr:    { n: "인주",   col: "#e0403d", d: "매 타격 인주 피해 +20% · 3연타 마무리마다 도장 (인주 자국 +1)" },
  audit: { n: "정밀",   col: "#ffa24a", d: "매 타격 정밀 피해 +20% · 3연타 마무리마다 약점 관통 (치명타)" },
};
var JOB_SUB_BONUS = 0.2, JOB_SUB_PROC = 0.6;   // 겸직 하나당: 매 타격 +20% · 마무리 발동 공격력 ×0.6 (튜닝)
function jobSubs() { const js = (typeof S !== "undefined" && S && S.jobs) || []; return js.filter(id => id !== S.job && JOB_ATTR[id]); }
function jobSubMul() { return 1 + JOB_SUB_BONUS * jobSubs().length; }
/* 매 타격: 겸직 직무 색 불꽃 (피해는 careerAtk 배율에 이미 들어 있음) */
function jobAttrFx(x, y) {
  if (reduceMotion) return;
  jobSubs().forEach((id, i) => {
    const c = JOB_ATTR[id].col;
    for (let k = 0; k < 2; k++) sparks.push({ x, y, vx: 2 + Math.random() * 6, vy: -3 + (i - 1.5) * 1.6 + Math.random() * 2, life: 0.85, c, line: true });
  });
}
/* 3연타 마무리: 겸직 속성 발동 — 직무마다 제 색 폭발 + 제 그림 + 제 색 피해 숫자 + 이름표 (사용자: "이펙트랑 속성데미지로 확실히 메리트") */
var hitFloatCol = null;   // hit()의 피해 숫자 색을 잠깐 바꿈 (겸직 속성 피해는 그 직무 색)
function jobSubProc(st) {
  const subs = jobSubs(); if (!subs.length || !mon || mon.dying) return;
  const [x, y] = monHitPoint(0.5), o = typeof feelMuzzle === "function" ? feelMuzzle() : { x: heroHand.x, y: heroHand.y };
  subs.forEach((id, i) => {
    if (!mon || mon.dying) return;
    const A = JOB_ATTR[id], px = x + [0, 14, -12, 22][i % 4], py = y + [0, -16, 12, -4][i % 4];
    let d = st.atk * JOB_SUB_PROC, crit = false;
    if (!reduceMotion) jvAdd("sphere", { x: px, y: py, R: 24, col: A.col, dur: 320 });
    if (id === "sales") { jGold(px, py - 10, 4); jvAdd("star", { x: px + 14, y: py - 26, r: 8, col: "#ffd54a", dur: 420 }); }
    else if (id === "dev") { const segs = []; let qx = o.x, qy = o.y; for (let k = 0; k < 3; k++) { const nx = px + (Math.random() - .5) * 46, ny = py + (Math.random() - .5) * 56; segs.push(jBoltPts(qx, qy, nx, ny, 6, 16)); qx = nx; qy = ny; } jvAdd("chain", { dur: 260, segs }); jvAdd("crackle", { x: px, y: py, r: 26, col: "#bfefff", dur: 220 }); }
    else if (id === "plan") { jvAdd("pointer", { dur: 200, x0: o.x, y0: o.y, x1: px, y1: py - 6, snipe: mon.kind >= 1 }); if (mon.kind >= 1) d *= 2; }
    else if (id === "hr") {
      jvAdd("splat", { dur: 320, x: px + 6, y: py + 8 }); jvAdd("aseal", { dur: 520, x: px - 4, y: py - 6 });
      if (jobMarks.m !== mon) { jobMarks.m = mon; jobMarks.n = 0; jobMarks.pos = []; }
      if (jobMarks.n < 5) { jobMarks.n++; const { w: mw, h: mh } = msz(); jobMarks.pos.push([(px + 6 - MON_X) / mw, (GROUND - py - 8) / mh, (Math.random() - .5) * 0.8]); }
    }
    else if (id === "audit") { jvAdd("tracer", { dur: 220, x0: o.x, y0: o.y, x1: px, y1: py, col: "#ffa24a", core: "#fff1dc", w: 3.6 }); d *= st.critMul; crit = true; }
    hitFloatCol = A.col; try { hit(d, crit, "skill", px + 10, py - 18); } finally { hitFloatCol = null; }
    addFloat(x - 44, y - 44 - i * 18, A.n + "!", A.col, 17, true);
  });
}
/* 원거리 직무로 터치했을 때: 총구·지팡이에서 탄이 날아가 보이게 (피해는 feelTap이 이미 넣음) */
function jobTapFx(ix, iy) {
  const j = curJob(); if (!j || reduceMotion) return;
  const kit = FEEL_KIT_OF[j.id]; if (!kit || kit === "melee") return;
  const o = feelMuzzle(fHero.mv && FEEL_MOVES[fHero.mv].tap ? fHero.mv : FEEL_KITS[kit].tap);
  if (kit === "gun") jvAdd("pointer", { dur: 110, x0: o.x, y0: o.y, x1: ix, y1: iy, snipe: false });
  else if (kit === "snipe") jvAdd("tracer", { dur: 150, x0: o.x, y0: o.y, x1: ix, y1: iy, col: "#ffa24a", core: "#fff1dc", w: 2.4 });
  else if (kit === "magic") jvAdd("tracer", { dur: 140, x0: o.x, y0: o.y, x1: ix, y1: iy, col: "#6fd3ff", core: "#e6f6ff", w: 2.2, glyph: CODE_GLYPHS[jobHitN % CODE_GLYPHS.length] });
  else if (kit === "summon") jvAdd("tracer", { dur: 150, x0: o.x, y0: o.y, x1: ix, y1: iy, col: "#e0403d", core: "#ffd0c8", w: 2, arc: 26 });
}
/* 감사팀 기본 공격: 조준선 끝에 정밀 저격 (즉시 맞음) · 3발마다 '지적!' 확정 치명타 */
function auditStrike(st, crit) {
  const forced = jobHitN % 3 === 0, c = crit || forced, [tx, ty] = monHitPoint(forced ? 0.62 : null), o = feelMuzzle();
  const dmg = st.atk * (c ? st.critMul : 1);
  jvAdd("tracer", { dur: forced ? 300 : 200, x0: o.x, y0: o.y, x1: tx, y1: ty, col: "#ffa24a", core: "#fff1dc", w: forced ? 5 : 3.4 });
  jvAdd("sphere", { x: tx, y: ty, R: forced ? 30 : 18, col: "#ffa24a", dur: forced ? 380 : 240 });
  hit(dmg, c, "jhero", tx, ty);
  if (forced) { addFloat(tx - 6, ty - 34, "지적!", "#ffa24a", 24, true); sfx("zap"); } else sfx("pew");
  return true;
}
/* ---------- 감사팀 스킬 ---------- */
JSK_CAST.probe = function (st) {
  const f = jvAdd("probe", { dur: 1250, ev: [] });
  for (let i = 0; i < 6; i++) f.ev.push({ at: 120 + i * 170, fn: () => {
    if (!mon || mon.dying) return;
    const o = feelMuzzle(), [x, y] = monHitPoint(0.2 + 0.12 * i), crit = Math.random() < st.crit;
    jvAdd("tracer", { dur: 190, x0: o.x, y0: o.y, x1: x, y1: y, col: "#ffa24a", core: "#ffffff", w: 4 });
    jvAdd("sphere", { x, y, R: 22, col: "#ffa24a", dur: 300 });
    hit(st.dps * 3.5 * (crit ? st.critMul : 1), crit, "skill", x, y); sfx("pew");
  } });
  say("한 장도 빠짐없이 본다!", 2);
};
JSK_CAST.censure = function (st) {
  stampFx = { t: 0, kind: 2, hit: false, text: "징계", top: "징계 확정", nocam: true };
  jvAdd("seal", { dur: 900, x: MON_X - 10, y: GROUND - 70 });
  say("지적 사항, 전부 확정입니다", 2);
};
/* ---------- 이펙트 그림 (JFX_DRAW에 더함) ---------- */
JFX_DRAW.tracer = function (f) {
  const k = f.t / f.dur, a = 1 - k, dx = f.x1 - f.x0, dy = f.y1 - f.y0;
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
  const path = () => { ctx.beginPath(); ctx.moveTo(f.x0, f.y0); if (f.arc) ctx.quadraticCurveTo((f.x0 + f.x1) / 2, Math.min(f.y0, f.y1) - f.arc, f.x1, f.y1); else ctx.lineTo(f.x1, f.y1); ctx.stroke(); };
  ctx.globalAlpha = a * 0.35; ctx.strokeStyle = f.col; ctx.lineWidth = (f.w || 3) * 3; path();
  ctx.globalAlpha = a; ctx.lineWidth = f.w || 3; path();
  ctx.strokeStyle = f.core || "#ffffff"; ctx.lineWidth = Math.max(1, (f.w || 3) * 0.4); path();
  ctx.restore();
  if (f.glyph) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = f.core || "#ffffff"; ctx.font = '10px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.fillText(f.glyph, f.x0 + dx * 0.6, f.y0 + dy * 0.6 - 10); ctx.restore(); }
};
JFX_DRAW.aseal = function (f) {   // 겸직 인주 속성: 작은 '인' 도장이 찍힘
  const k = f.t / f.dur, s = k < 0.2 ? 1.8 - 4 * k : 1, a = k < 0.7 ? 1 : (1 - k) / 0.3;
  jSeal(f.x, f.y, (f.r || 14) * s, 0.25, Math.max(0, a), "인");
};
JFX_DRAW.seal = function (f) {
  const k = f.t / f.dur, s = k < 0.18 ? 2.2 - 6.6 * k : 1, a = k < 0.75 ? 1 : (1 - k) / 0.25;
  jSeal(f.x, f.y, 30 * s, -0.2, Math.max(0, a), "징");
};
