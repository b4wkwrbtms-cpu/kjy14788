/* ===================== 강화 편의 =====================
   1) 한 번에 강화할 양: ×1 · ×10 · 최대 (탭 머리띠에서 고름, 무기·동료·정장·보물 탭)
   2) 버튼을 꾹 누르고 있으면 계속 강화 (점점 빨라짐)
   3) 무기 자동 강화 스위치: 월급이 모이면 무기·커피 중 싼 것부터 알아서
   4) 동료·보물: 가진 만나·도장을 싼 것부터 전부 쓰기 (두 번 눌러 확인)
   5) 강화로 초당 피해가 오르면 지갑 옆에 +몇 % 가 떠오름 */
const BULK_TABS = new Set(["weapon", "pet", "suit", "treasure"]);
const BULK_OPTS = [[1, "×1"], [10, "×10"], [0, "최대"]];
const bulkN = () => (S.buyN === 10 || S.buyN === 0) ? S.buyN : 1;
/* 줄 하나(rep)에 대한 계획: 몇 번 살 수 있고 모두 얼마인지 */
function bulkPlan(tab, cfg) {
  const N = bulkN(); if (N === 1 || !cfg.rep || !BULK_TABS.has(tab) || (cfg.rep.ok && !cfg.rep.ok())) return null;
  const lim = N === 0 ? 1000 : N, have = cfg.rep.have(), max = cfg.rep.max ? cfg.rep.max() : Infinity;
  let n = 0, total = 0;
  while (n < lim && n < max) { const c = cfg.rep.cost(n); if (!(c >= 0) || total + c > have) break; total += c; n++; }
  return n >= 1 ? { n, total } : null;
}
const repLabel = (unit, v) => unit === "원" ? `${fmt(v)}원` : `${unit} ${fmtR(v)}`;
/* 무기 카드 계획: 강화와 다음 무기 사기를 이어서 */
function weaponStepCost() { const i = S.wi; if (S.wl < 5 || i === LAST_W) return wUp(i, S.wl); const nx = i + 1; if (WEAPONS[nx].leg && !S.legUnlock[nx - LEG_START]) return null; return wBuy(nx); }
function weaponStep() { const c = weaponStepCost(); if (c == null || S.gold < c) return 0; S.gold -= c; if (S.wl < 5 || S.wi === LAST_W) { S.wl++; return 1; } S.wi++; S.wl = 1; S.skin = -1; return 2; }
function wPlan(limit) {
  let i = S.wi, l = S.wl, total = 0, n = 0, newW = 0;
  while (n < limit) {
    let c; if (l < 5 || i === LAST_W) c = wUp(i, l); else { const nx = i + 1; if (WEAPONS[nx].leg && !S.legUnlock[nx - LEG_START]) break; c = wBuy(nx); }
    if (total + c > S.gold) break;
    total += c; n++; if (l < 5 || i === LAST_W) l++; else { i++; l = 1; newW++; }
  }
  return { n, total, newW, i, l };
}
/* 초당 피해가 오르면 지갑 옆에 +% (꾹 누르는 동안은 한 숫자로 모아서) */
let dpsFx = null;
function dpsPop(d0) {
  const d1 = stats().dps; if (!(d0 > 0) || !(d1 > d0 * 1.0005)) return;
  const sp = $("dps"), box = sp && sp.parentElement && sp.parentElement.parentElement; if (!box || !box.appendChild) return;
  const now = performance.now();
  if (!dpsFx || now - dpsFx.t > 900 || !dpsFx.el.isConnected) { const e = document.createElement("span"); e.className = "dpsfx"; box.appendChild(e); dpsFx = { el: e, base: d0, t: now }; }
  const r = d1 / dpsFx.base; dpsFx.t = now;
  dpsFx.el.textContent = r >= 2 ? `×${r >= 10 ? Math.round(r) : r.toFixed(1)}` : `+${Math.max(1, Math.round((r - 1) * 100))}%`;
  dpsFx.el.classList.remove("go"); void dpsFx.el.offsetWidth; dpsFx.el.classList.add("go");
  const el = dpsFx.el; clearTimeout(el._t); el._t = setTimeout(() => { if (el.remove) el.remove(); if (dpsFx && dpsFx.el === el) dpsFx = null; }, 1300);
}
/* 꾹 누르고 있으면 계속 강화: data-rep 붙은 버튼만. 누르는 동안 축하 팝업은 모아 두었다가 손을 떼면 마지막 것만 */
var holdRep = false, heldCeleb = null;
(() => {
  if (typeof document === "undefined" || !document.addEventListener) return;
  let timer = 0, btn = null, n = 0, fired = false, inStep = false, sx = 0, sy = 0, swallowUntil = 0;
  const stop = () => {
    clearTimeout(timer); timer = 0; if (btn && btn.classList) btn.classList.remove("holding"); btn = null;
    if (fired) { swallowUntil = Date.now() + 400; fired = false; }
    if (holdRep) { holdRep = false; const c = heldCeleb; heldCeleb = null; if (c) celebrate(c); }
  };
  const step = () => {
    if (!btn || btn.disabled || (btn.isConnected === false)) return stop();
    fired = true; holdRep = true; inStep = true; try { btn.click(); } finally { inStep = false; } n++;
    if (!btn || btn.disabled) return stop();
    timer = setTimeout(step, Math.max(50, 170 - n * 12));
  };
  document.addEventListener("pointerdown", e => {
    const b = e.target && e.target.closest ? e.target.closest("button[data-rep]") : null;
    if (btn) stop();
    if (!b || b.disabled) return;
    btn = b; n = 0; fired = false; sx = e.clientX; sy = e.clientY; if (b.classList) b.classList.add("holding");
    timer = setTimeout(step, 430);
  }, { passive: true });
  document.addEventListener("pointermove", e => { if (btn && Math.hypot(e.clientX - sx, e.clientY - sy) > 18) stop(); }, { passive: true });
  ["pointerup", "pointercancel"].forEach(t => document.addEventListener(t, () => { if (btn || holdRep) stop(); }, { passive: true }));
  window.addEventListener && window.addEventListener("blur", () => { if (btn || holdRep) stop(); });
  document.addEventListener("click", e => { if (!inStep && Date.now() < swallowUntil) { swallowUntil = 0; e.stopPropagation(); e.preventDefault(); } }, true);
  document.addEventListener("contextmenu", e => { if (e.target && e.target.closest && e.target.closest("button[data-rep]")) e.preventDefault(); });
})();
/* 자동 강화 (무기·커피, 싼 것부터) */
let autoUpT = 0, wCardEl = null;
function autoUpgradeTick() {
  if (!S.autoUp || (typeof document !== "undefined" && document.hidden)) return;
  const now = Date.now(); if (now - autoUpT < 1000) return; autoUpT = now;
  const d0 = stats().dps, i0 = S.wi, l0 = S.wl, c0 = S.coffee; let n = 0;
  while (n < 120) {
    const wc = weaponStepCost(), cc = S.coffee < 30 ? coffeeCost(S.coffee) : Infinity, useW = wc != null && wc <= cc, c = useW ? wc : cc;
    if (!isFinite(c) || S.gold < c) break;
    if (useW) weaponStep(); else { S.gold -= c; S.coffee++; }
    n++;
  }
  if (!n) return;
  if (S.wi !== i0) { if (WEAPONS[S.wi].leg) celebrate({ icon: weaponBig(S.wi, S.wl), title: "전설 무기 장착!", sub: `자동 강화 · ${WEAPONS[i0].n} +${l0} → ${WEAPONS[S.wi].n} +${S.wl}`, tone: "rare" }); else toast(`자동 강화 · 새 무기 ${WEAPONS[S.wi].n} +${S.wl}`); if (curTab === "weapon" && wCardEl) rowPop(wCardEl, "NEW!", "#ffd54a"); }
  else if (curTab === "weapon") { const card = wCardEl; if (S.wl !== l0) rowPop(card, `+${S.wl}!`, "#ffd54a"); else if (S.coffee !== c0) rowPop(card, `커피 Lv.${S.coffee}`, "#ffd54a"); }
  updateUI(true); save(); dpsPop(d0);
}
/* 가진 재화를 싼 것부터 전부 쓰기 */
function spendAll(tab) {
  const d0 = stats().dps, joined = []; let n = 0, spent = 0, tierUp = 0;
  const opts = tab === "pet"
    ? PETS.filter(p => S.bestFloor >= p.floor).map(p => ({ cost: () => { const lv = petLv(p.id); return lv ? petUp(p, lv) : p.price; }, buy: c => { const lv = petLv(p.id); S.manna -= c; S.pets[p.id] = lv + 1; if (!lv) joined.push(p); } }))
    : TREASURES.map(t => ({ cost: () => (t.max && S.tre[t.id] >= t.max) ? Infinity : treCost(t, S.tre[t.id]), buy: c => { S.stamp -= c; S.tre[t.id]++; if (S.tre[t.id] % 50 === 0) tierUp++; } }));
  const have = () => tab === "pet" ? S.manna : S.stamp;
  while (n < 3000) {
    let best = null, bc = Infinity; opts.forEach(o => { const c = o.cost(); if (c < bc) { bc = c; best = o; } });
    if (!best || !isFinite(bc) || bc > have()) break;
    best.buy(bc); spent += bc; n++;
  }
  if (!n) { toast(tab === "pet" ? "만나가 모자라요" : "도장이 모자라요"); return; }
  sfx("upgrade");
  joined.forEach(p => celebrate({ icon: petBig(p.id), title: "동료 합류!", sub: `${p.n} · ${p.desc(1)}`, tone: "manna" }));
  if (tierUp) celebrate({ ic: "treasure", title: "보물 차수 상승!", sub: `도장으로 보물 ${n}번 강화 · 차수가 올랐어요`, tone: "stamp" });
  toast(tab === "pet" ? `만나 ${fmtR(spent)}로 동료 ${n}번 강화했어요` : `도장 ${fmtR(spent)}로 보물 ${n}번 강화했어요`);
  updateUI(true); save(); dpsPop(d0);
}
/* 탭 머리띠 아래 도구줄 */
let toolsTab = "", spendArm = 0, spendArmT = 0;
function renderTools() {
  const box = $("thTools"), th = $("tabHead"); if (!box || !th) return;
  const on = BULK_TABS.has(curTab); th.classList.toggle("tools", on);
  if (!on) { if (toolsTab) { box.innerHTML = ""; toolsTab = ""; } return; }
  const spend = curTab === "pet" ? "만나" : curTab === "treasure" ? "도장" : "";
  const key = curTab + "|" + bulkN() + "|" + (spendArm && Date.now() < spendArmT ? 1 : 0);
  if (box._k === key) return; box._k = key; toolsTab = curTab;
  box.innerHTML = `<span class="tl-lab">한 번에</span><div class="bseg" role="group" aria-label="한 번에 강화할 양">${BULK_OPTS.map(([v, l]) => `<button type="button" data-n="${v}" aria-pressed="${bulkN() === v}">${l}</button>`).join("")}</div>`
    + (spend ? `<button type="button" class="spend${spendArm && Date.now() < spendArmT ? " armed" : ""}" id="spendAll">${spendArm && Date.now() < spendArmT ? "한 번 더 누르면 사용" : `${spend} 전부 쓰기`}<small>싼 것부터</small></button>` : `<span class="tl-hint">버튼을 꾹 누르면 계속 강화</span>`);
}
(() => {
  const box = typeof document !== "undefined" ? document.getElementById("thTools") : null; if (!box || !box.addEventListener) return;
  box.addEventListener("click", e => {
    const t = e.target && e.target.closest ? (e.target.closest("button") || (e.target.tagName === "BUTTON" ? e.target : null)) : null; if (!t) return;
    if (t.dataset && t.dataset.n != null) { S.buyN = +t.dataset.n; sfx("tick"); save(); renderTools(); updateUI(true); return; }
    if (t.id === "spendAll") {
      if (spendArm && Date.now() < spendArmT) { spendArm = 0; renderTools(); spendAll(curTab); return; }
      spendArm = 1; spendArmT = Date.now() + 3000; renderTools(); setTimeout(() => { spendArm = 0; renderTools(); }, 3050);
    }
  });
})();
