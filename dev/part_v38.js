/* ===================== v38 직무 동작 미리 보기 · 몸 동작 설정 =====================
   사용자(2026-10-11 09:09, 아이폰 화면 녹화): "이상하다, 모션도 그렇고 수정이 안 된 것 같다"
   → 녹화에서 곽준영 몸이 전혀 숙이지 않고 팔·무기만 움직임 + 배경이 한 번도 안 흔들림 = 휴대폰 '동작 줄이기'가 켜져 있어
     게임이 몸 동작(v36)을 꺼 두고 있었음. 이제 '동작 줄이기'는 화면 흔들림·카메라만 줄이고, 몸 동작은 설정 › 화면 '곽준영 몸 동작'으로 따로 정함.
   → 대리(직무 칸 1개) · 영업이면 v37 직무 동작을 볼 길이 없음 → 인사 기록에서 어느 직무든 '동작 미리 보기 15초'. */

/* ---------- 동작 미리 보기: 15초 동안 그 직무 동작·기본 공격으로 싸움 (능력치·스킬·겸직은 그대로) ---------- */
var jobPreview = { id: "", until: 0 }, JOB_PREVIEW_MS = 15000;
function jobPreviewId() { return jobPreview.id && performance.now() < jobPreview.until ? jobPreview.id : ""; }
function jobPreviewStart(id) {
  const j = jobById(id); if (!j) return;
  jobPreview = { id, until: performance.now() + JOB_PREVIEW_MS };
  jobCut = { t: 0, dur: 1100, name: `${j.team} 미리 보기`, team: `${FEEL_KITS[FEEL_KIT_OF[id]].n} 동작 · 15초`, col: j.col };
  sfx("buff"); toast(`${j.team} · ${FEEL_KITS[FEEL_KIT_OF[id]].n} 동작을 15초 동안 보여 줘요 · 위 전투 화면을 보세요`);
  if (typeof crKey !== "undefined") crKey = "";
}
/* 머리 위 이름표: '기획 거너 미리 보기 12' */
function drawJobPreviewTag(t, hx, hy) {
  const id = jobPreviewId(); if (!id) return;
  const j = jobById(id), left = Math.ceil((jobPreview.until - performance.now()) / 1000), txt = `${FEEL_KITS[FEEL_KIT_OF[id]].n} 미리 보기 ${left}`;
  ctx.save(); ctx.font = '11px "Do Hyeon", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const w = (ctx.measureText ? ctx.measureText(txt).width : txt.length * 8) + 12, x = hx + 31, y = hy - 10;
  ctx.globalAlpha = 0.92; ctx.fillStyle = "rgba(10,14,26,.86)"; ctx.fillRect(x - w / 2, y - 8, w, 16);
  ctx.fillStyle = j.col; ctx.fillRect(x - w / 2, y - 8, w, 1.5); ctx.fillRect(x - w / 2, y + 6.5, w, 1.5);
  ctx.fillText(txt, x, y + 0.5);
  ctx.restore();
}
(function () {
  const base = drawJobAura;
  drawJobAura = function (t, hx, hy) { base(t, hx, hy); drawJobPreviewTag(t, hx, hy); };
})();
