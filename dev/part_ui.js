/* ===================== 메뉴 꾸밈: 축하 팝업, 강화 반짝임, 탭 머리띠, 입력 중 메뉴바 숨김 ===================== */
let celebQ = [], celebOn = false, celebT = 0;
/* 큰 일(새 무기, +5, 동료 합류, 새 정장, 업적...)에 뜨는 축하 카드. 몰리면 마지막 몇 개만 차례로 */
function celebrate(o) {
  if (!$("celeb")) { if (o && o.title) toast(`${o.title} ${o.sub || ""}`); return; }
  celebQ.push(o); if (celebQ.length > 3) celebQ.splice(0, celebQ.length - 3);
  if (!celebOn) celebNext();
}
function celebNext() {
  clearTimeout(celebT);
  const box = $("celeb"), o = celebQ.shift();
  if (!o) { celebOn = false; box.hidden = true; box.classList.remove("go"); return; }
  celebOn = true; box.hidden = false;
  box.setAttribute("data-c", o.tone || "gold");
  const ic = $("celebIc"); ic.innerHTML = "";
  const icon = o.icon || pixIcon(o.ic || "star", 76); ic.appendChild(icon);
  $("celebT").textContent = o.title || ""; $("celebS").innerHTML = o.sub || "";
  box.classList.remove("go"); void box.offsetWidth; box.classList.add("go");
  celebFx(o.tone || "gold");
  if (o.sound) sfx(o.sound);
  celebT = setTimeout(celebNext, o.ms || 2100);
}
const CELEB_COL = { gold: ["#ffd54a", "#fff3b0", "#ff9b3d", "#ffffff"], manna: ["#a8f0c6", "#ffffff", "#ffd54a", "#6fd3ff"], ore: ["#6fd3ff", "#e6f6ff", "#c9a6ff", "#ffffff"], rare: ["#c9a6ff", "#ff6bd6", "#ffd54a", "#ffffff"], stamp: ["#ff7a6b", "#ffd54a", "#ffffff", "#ff9b3d"] };
function celebFx(tone) {
  const fx = $("celebFx"); if (!fx) return; fx.innerHTML = "";
  if (reduceMotion || !fx.appendChild) return;
  const cols = CELEB_COL[tone] || CELEB_COL.gold;
  for (let i = 0; i < 34; i++) {
    const p = document.createElement("i"); p.style.background = cols[i % cols.length];
    if (i % 3 === 0) { p.style.width = "6px"; p.style.height = "6px"; p.style.borderRadius = "50%"; }
    fx.appendChild(p);
    if (!p.animate) continue;
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, v = 120 + Math.random() * 170, dx = Math.cos(a) * v, dy = Math.sin(a) * v;
    p.animate([
      { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) rotate(${(Math.random() - .5) * 360}deg)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${dx * 1.35}px,${dy + 260 + Math.random() * 160}px) rotate(${(Math.random() - .5) * 900}deg)`, opacity: 0 },
    ], { duration: 1500 + Math.random() * 700, delay: Math.random() * 120, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" });
  }
}
(() => { const b = $("celeb"); if (b) b.addEventListener("click", () => celebNext()); })();
/* 강화·구매한 줄: 테두리 번쩍 + 글자가 떠오름 */
function rowPop(row, text, color) {
  if (!row || !row.classList) return;
  row.classList.remove("pop"); void row.offsetWidth; row.classList.add("pop");
  const f = document.createElement("span"); f.className = "upfx"; f.textContent = text || "UP!"; if (color) f.style.color = color;
  row.appendChild(f); setTimeout(() => { if (f.remove) f.remove(); }, 950);
}
/* 탭 머리띠: 지금 탭 이름·설명·쓰는 재화 (위에 붙어 다님) */
const TAB_META = {
  weapon: ["월급으로 무기·커피 강화", () => `<span>${ri("coin")}${fmt(S.gold)}</span>`],
  bible: ["말씀 읽고 만나·도장 받기", () => `<span>${ri("manna")}${fmtR(S.manna)}</span>`],
  mem: ["200구절 암송, 반복할수록 큰 보상", () => `<span>${ri("manna")}${fmtR(S.manna)}</span>`],
  study: ["공부한 시간만큼 광산을 파요", () => `<span>${ri("ore")}${fmtR(S.ore)}</span>`],
  pet: ["만나로 동료를 들이고 키워요", () => `<span>${ri("manna")}${fmtR(S.manna)}</span>`],
  suit: ["광석으로 정장·부적 사기", () => `<span>${ri("ore")}${fmtR(S.ore)}</span>` + (S.silver ? `<span>${ri("silver")}${fmtR(S.silver)}</span>` : "")],
  treasure: ["결재도장으로 보물 강화", () => `<span>${ri("stamp")}${fmtR(S.stamp)}</span>`],
  daily: ["일일 업무·지하 문서고·업적", () => ""],
  info: ["내 기록·캐릭터·도감·백업", () => ""],
  retire: ["사표 내고 더 강해져서 다시", () => `<span>${ri("stamp")}${fmtR(S.stamp)}</span>`],
};
let thTab = "", thCur = "";
function renderTabHead() {
  const th = $("tabHead"); if (!th) return;
  if (thTab !== curTab) {
    thTab = curTab; thCur = "";
    th.setAttribute("data-tab", curTab);
    const ic = $("thIc"); ic.innerHTML = ""; ic.appendChild(pixIcon(curTab, 30));
    $("thName").textContent = (TABS.find(t => t[0] === curTab) || ["", ""])[1];
    $("thSub").textContent = (TAB_META[curTab] || [""])[0];
  }
  const m = TAB_META[curTab], cur = m ? m[1]() : "";
  if (cur !== thCur) { thCur = cur; $("thCur").innerHTML = cur; }
}
/* 글자를 입력하는 동안에는 아래 메뉴바를 숨김 (아이폰 키보드에 겹치지 않게) */
(() => {
  const isField = t => !!(t && t.tagName && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  document.addEventListener("focusin", e => { if (isField(e.target) && document.body) document.body.classList.add("typing"); });
  document.addEventListener("focusout", () => setTimeout(() => { if (document.body && !isField(document.activeElement)) document.body.classList.remove("typing"); }, 60));
})();
