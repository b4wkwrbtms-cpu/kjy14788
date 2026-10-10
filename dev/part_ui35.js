/* ===================== v35 기둥 9: 화면 글자 크기 · 모자란 값 글자로 · 축하 카드 모두 넘기기 =====================
   U-UX-10 (글자를 키울 수 있게 — 이 앱은 화면 확대가 막혀 있어서 설정에서 키움) · U-UX-16 (설정은 저장되고 처음부터 닿게)
   U-UX-12·AP-UX-04 (빨강만으로 '못 산다'를 알리지 않기) · U-UX-17 (비플레이 콘텐츠 건너뛰기)
   draw·updateUI 에서 부르므로 var 와 function 선언만 씀 */

/* ---- 화면 글자 크기: 메뉴 화면(머리띠 + 패널)만 키움. 전투 화면 그림은 그대로 ---- */
var UI_ZOOMS = [[1, "기본"], [1.15, "크게"], [1.3, "더 크게"]];
function uiZoom() { const v = +fxSet().ui; return v >= 1 && v <= 1.3 ? v : 1; }
function uiZoomApply() {
  const z = uiZoom();
  ["panels", "tabHead"].forEach(id => { const e = $(id); if (e && e.style) e.style.zoom = z === 1 ? "" : String(z); });
}
function uiSegRow() {
  return `<div class="fx-row"><span>메뉴 글자</span><div class="seg" role="group" aria-label="메뉴 글자 크기">${UI_ZOOMS.map(([v, n]) => `<button type="button" data-fx="ui" data-v="${v}" aria-pressed="false">${n}</button>`).join("")}</div></div>`;
}

/* ---- 못 사는 값: '얼마 부족'을 글자로 (색 + 글자 두 채널) ---- */
var UI_CUR = { "원": "gold", "만나": "manna", "광석": "ore", "도장": "stamp", "은괴": "silver", "자수정": "ame" };
function uiUnfmt(t) {
  const m = /^([\d.]+)([A-Z]*)$/.exec(String(t).replace(/,/g, "").trim()); if (!m) return NaN;
  let i = 0; for (const ch of m[2]) i = i * 26 + (ch.charCodeAt(0) - 64);
  return parseFloat(m[1]) * Math.pow(1000, i);
}
function uiShort(cur, amt) {
  const key = UI_CUR[cur]; if (!key) return "";
  const have = +S[key] || 0, need = uiUnfmt(amt);
  return need > have ? `${fmt(need - have)} 부족` : "";
}

/* ---- 축하 카드가 몰리면: 남은 개수 + 모두 넘기기 ---- */
function celebMore() {
  const b = $("celebAll"), tap = $("celebTap"); if (!b) return;
  const n = celebQ.length;
  b.hidden = n < 1; if (n) b.textContent = `남은 축하 ${n}개 모두 넘기기`;
  if (tap) tap.textContent = n ? `눌러서 다음 · ${n}개 남음` : "눌러서 닫기";
}
(function () {
  const b = $("celebAll"); if (!b || !b.addEventListener) return;
  b.addEventListener("click", e => { if (e && e.stopPropagation) e.stopPropagation(); celebQ.length = 0; celebNext(); });
})();

/* ---- 업데이트 안내 한 번 (예전 기록만, 출근 카드 뒤에) ---- */
function feelArrive() {
  try {
    if (localStorage.getItem(SAVE_KEY + "-feel35")) return;
    localStorage.setItem(SAVE_KEY + "-feel35", "1");
    if (!isFreshSave(S)) celebrateLater({ ic: "weapon", title: "타격을 새로 만들었어요", sub: "팔과 몸으로 휘두르고, 큰 한 방일수록 더 묵직해요<br>글자가 작으면 <b>설정 › 화면 › 메뉴 글자</b>", tone: "gold", ms: 4200, keep: 1 });
  } catch (e) {}
}
