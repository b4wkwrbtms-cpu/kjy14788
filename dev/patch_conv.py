"""강화 편의 패치"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:110]); sys.exit(1)
    s = s.replace(old, new)
# CSS
rep('</style>', open('css_conv.css', encoding='utf-8').read() + '</style>', 1)
# 꾹 누르는 동안 축하 팝업은 모았다가 마지막 것만
rep('''function celebrate(o) {
  if (!$("celeb"))''', '''function celebrate(o) {
  if (typeof holdRep !== "undefined" && holdRep) { heldCeleb = o; return; }
  if (!$("celeb"))''')
# 탭 머리띠 도구줄
rep('<div class="th-cur num" id="thCur"></div></div>', '<div class="th-cur num" id="thCur"></div><div class="th-tools" id="thTools"></div></div>')
# 저장값 기본
rep('    sound: true, char: "choi",', '    sound: true, char: "choi", buyN: 1, autoUp: false,')
# 편의 코드 넣기 (무기 탭 앞)
rep('/* ---------- 무기 탭 ---------- */', open('part_conv.js', encoding='utf-8').read() + '\n/* ---------- 무기 탭 ---------- */')
# 머리띠 그릴 때 도구줄도
rep('''  const m = TAB_META[curTab], cur = m ? m[1]() : "";
  if (cur !== thCur) { thCur = cur; $("thCur").innerHTML = cur; }
}''', '''  const m = TAB_META[curTab], cur = m ? m[1]() : "";
  if (cur !== thCur) { thCur = cur; $("thCur").innerHTML = cur; }
  if (typeof renderTools === "function") renderTools();
}''')
rep('''/* ---------- 무기 탭 ---------- */
(() => {
  const card = el("div", "card hero-card");''', '''/* ---------- 무기 탭 ---------- */
(() => {
  const card = el("div", "card hero-card"); wCardEl = card;''')
# 공통 행: 꾹 누르기 표시, 한 번에 여러 번, 초당 피해 +%
rep('''  const btn = el("button", "buy num"); if (btn.style) btn.style.animationDelay = (Math.random() * 2.4).toFixed(2) + "s";
  btn.addEventListener("click", () => {
    const before = (cfg.lv ? cfg.lv() : "") + "|" + cfg.name();
    cfg.click();''', '''  const btn = el("button", "buy num"); if (btn.style) btn.style.animationDelay = (Math.random() * 2.4).toFixed(2) + "s";
  if (cfg.rep && btn.setAttribute) btn.setAttribute("data-rep", "1");
  btn.addEventListener("click", () => {
    const before = (cfg.lv ? cfg.lv() : "") + "|" + cfg.name(), d0 = cfg.rep ? stats().dps : 0, plan = bulkPlan(tab, cfg);
    for (let k = 0, nn = plan ? plan.n : 1; k < nn; k++) cfg.click();''')
rep('''      if (t) rowPop(row, t);
    }
    updateUI(true); save();
  });''', '''      if (t && (!row._popT || Date.now() - row._popT > 110)) { row._popT = Date.now(); rowPop(row, plan && plan.n > 1 ? `${t.replace(/!$/, "")} (×${plan.n})` : t); }
    }
    updateUI(true); save();
    if (cfg.rep) dpsPop(d0);
  });''')
rep('''      const b = cfg.btn();
      btn.className = "buy num" + (b.cls ? " " + b.cls : "") + (!b.ok && isMaxLabel(b.label) ? " max" : ""); btn.disabled = !b.ok;''', '''      let b = cfg.btn();
      const pl = b.ok ? bulkPlan(tab, cfg) : null;
      if (pl && pl.n > 1) b = Object.assign({}, b, { label: repLabel(cfg.rep.unit, pl.total), sub: `×${pl.n} 강화` });
      btn.className = "buy num" + (b.cls ? " " + b.cls : "") + (!b.ok && isMaxLabel(b.label) ? " max" : ""); btn.disabled = !b.ok;''')
# 무기 카드: '한번에' 자리를 자동 강화 스위치로, 큰 버튼은 ×N 따라감
rep('''<div class="row-btns"><button class="buy num" id="wBtn" style="flex:1"></button><button class="buy ghost num" id="wAll">한번에<small>되는 만큼</small></button></div>''',
    '''<div class="row-btns"><button class="buy num" id="wBtn" style="flex:1" data-rep="1"></button><button class="buy ghost num" id="wAuto" aria-pressed="false"><span class="act">자동 강화</span><small><i class="sw"></i>꺼짐</small></button></div>''')
rep('''    $("wAll").disabled = (S.wl < 5 || i === LAST_W) ? S.gold < wUp(i, S.wl) : (S.gold < wBuy(i + 1) || (WEAPONS[i + 1].leg && !S.legUnlock[i + 1 - LEG_START]));
    const b = $("wBtn");
    if (S.wl < 5 || i === LAST_W) {''', '''    const ab = $("wAuto"), ah = S.autoUp ? `<span class="act">자동 강화</span><small><i class="sw"></i>켜짐</small>` : `<span class="act">자동 강화</span><small><i class="sw"></i>꺼짐</small>`;
    if (ab._h !== ah) { ab._h = ah; ab.innerHTML = ah; ab.classList.toggle("on", !!S.autoUp); ab.setAttribute("aria-pressed", S.autoUp ? "true" : "false"); }
    const b = $("wBtn"), N = bulkN(), wp = N === 1 ? null : wPlan(N === 0 ? 500 : N);
    if (wp && wp.n > 1) {
      b.className = "buy num" + (WEAPONS[wp.i].leg ? " rare" : ""); b.disabled = false;
      const wh = btnInner({ label: `${fmt(wp.total)}원`, sub: `×${wp.n} 강화 · ${wp.newW ? `${WEAPONS[wp.i].n} +${wp.l}까지` : `+${S.wl} → +${wp.l}`}` }); if (b._h !== wh) { b._h = wh; b.innerHTML = wh; }
      $("wNote").textContent = wp.newW ? `새 무기 ${wp.newW}개까지 한 번에 사요.` : "한 번에 여러 단계를 올려요. 버튼을 꾹 누르고 있으면 계속 강화해요.";
    } else if (S.wl < 5 || i === LAST_W) {''')
rep('''  $("wBtn").addEventListener("click", () => {
    const i = S.wi;
    if (S.wl < 5 || i === LAST_W) {''', '''  $("wBtn").addEventListener("click", () => {
    const i = S.wi, d0 = stats().dps, N = bulkN(), wp = N === 1 ? null : wPlan(N === 0 ? 500 : N);
    if (wp && wp.n > 1) {
      const startI = S.wi, startL = S.wl; let n = 0; while (n < wp.n && weaponStep()) n++;
      if (S.wi !== startI) celebrate({ icon: weaponBig(S.wi, S.wl), title: WEAPONS[S.wi].leg ? "전설 무기 장착!" : "새 무기 장착!", sub: `${WEAPONS[startI].n} +${startL} → ${WEAPONS[S.wi].n} +${S.wl}`, tone: WEAPONS[S.wi].leg ? "rare" : "gold" });
      else if (S.wl === 5 && startL < 5) celebrate({ icon: weaponBig(S.wi, 5), title: "+5 완성!", sub: `${WEAPONS[S.wi].n} +${startL} → +5`, tone: "gold" });
      else if (!card._popT || Date.now() - card._popT > 110) { card._popT = Date.now(); rowPop(card, `+${S.wl}! (×${n})`, "#ffd54a"); }
      updateUI(true); save(); dpsPop(d0); return;
    }
    if (S.wl < 5 || i === LAST_W) {''')
rep('''    else { const n = i + 1, nw = WEAPONS[n], c = wBuy(n); if (nw.leg && !S.legUnlock[n - LEG_START]) return; if (S.gold < c) return; S.gold -= c; S.wi = n; S.wl = 1; if (S.skin >= 0) S.skin = -1; celebrate({ icon: weaponBig(n, 1), title: nw.leg ? "전설 무기 장착!" : "새 무기 장착!", sub: `${n + 1}번째 무기 · ${nw.n}`, tone: nw.leg ? "rare" : "gold" }); }
    updateUI(true); save();
  });''', '''    else { const n = i + 1, nw = WEAPONS[n], c = wBuy(n); if (nw.leg && !S.legUnlock[n - LEG_START]) return; if (S.gold < c) return; S.gold -= c; S.wi = n; S.wl = 1; if (S.skin >= 0) S.skin = -1; celebrate({ icon: weaponBig(n, 1), title: nw.leg ? "전설 무기 장착!" : "새 무기 장착!", sub: `${n + 1}번째 무기 · ${nw.n}`, tone: nw.leg ? "rare" : "gold" }); }
    updateUI(true); save(); dpsPop(d0);
  });''')
# 한번에 버튼 처리 → 자동 강화 스위치
i0 = s.index('  $("wAll").addEventListener("click", () => {')
j0 = s.index('  addRow("weapon", {\n    icon: iconCanvas(g => drawSprite(g, SPR.cup, PAL.cup, 2, 2, 3)), name: () => "아이스 아메리카노"')
s = s[:i0] + '''  $("wAuto").addEventListener("click", () => {
    S.autoUp = !S.autoUp; sfx(S.autoUp ? "upgrade" : "uncheck"); autoUpT = 0;
    toast(S.autoUp ? "자동 강화 켬 · 월급이 모이면 무기·커피 중 싼 것부터 알아서 올려요" : "자동 강화 껐어요");
    updateUI(true); save(); if (S.autoUp) autoUpgradeTick();
  });
''' + s[j0:]
# 강화 줄마다 반복 규칙
rep('''    click: () => { if (S.coffee >= 30 || S.gold < coffeeCost(S.coffee)) return; S.gold -= coffeeCost(S.coffee); S.coffee++; },''',
    '''    click: () => { if (S.coffee >= 30 || S.gold < coffeeCost(S.coffee)) return; S.gold -= coffeeCost(S.coffee); S.coffee++; },
    rep: { cost: k => coffeeCost(S.coffee + k), have: () => S.gold, max: () => 30 - S.coffee, unit: "원" },''')
rep('''    click: () => { if (S.gold < pickCost(S.pick)) return; S.gold -= pickCost(S.pick); S.pick++; },''',
    '''    click: () => { if (S.gold < pickCost(S.pick)) return; S.gold -= pickCost(S.pick); S.pick++; },
    rep: { cost: k => pickCost(S.pick + k), have: () => S.gold, unit: "원" },''')
rep('''    click: () => { if (S.bestFloor < p.floor) return; const lv = petLv(p.id), c = lv ? petUp(p, lv) : p.price; if (S.manna < c) return; S.manna -= c; S.pets[p.id] = lv + 1; if (!lv) celebrate({ icon: petBig(p.id), title: "동료 합류!", sub: `${p.n} · ${p.desc(1)}`, tone: "manna" }); },''',
    '''    click: () => { if (S.bestFloor < p.floor) return; const lv = petLv(p.id), c = lv ? petUp(p, lv) : p.price; if (S.manna < c) return; S.manna -= c; S.pets[p.id] = lv + 1; if (!lv) celebrate({ icon: petBig(p.id), title: "동료 합류!", sub: `${p.n} · ${p.desc(1)}`, tone: "manna" }); },
    rep: { ok: () => S.bestFloor >= p.floor, cost: k => { const lv = petLv(p.id) + k; return lv ? petUp(p, lv) : p.price; }, have: () => S.manna, unit: "만나" },''')
rep('''    click: () => { if (S.ore < CHARM_PRICE) return; S.ore -= CHARM_PRICE; S.charms[c.id]++; },''',
    '''    click: () => { if (S.ore < CHARM_PRICE) return; S.ore -= CHARM_PRICE; S.charms[c.id]++; },
    rep: { cost: () => CHARM_PRICE, have: () => S.ore, unit: "광석" },''')
rep('''    click: () => { const lv = S.tre[t.id]; if (t.max && lv >= t.max) return; const c = treCost(t, lv); if (S.stamp < c) return; S.stamp -= c; S.tre[t.id]++; if ((lv + 1) % 50 === 0) celebrate({ ic: "treasure", title: "보물 차수 상승!", sub: `${treName(t, lv + 1)} · 효과가 크게 올라요`, tone: "stamp" }); },''',
    '''    click: () => { const lv = S.tre[t.id]; if (t.max && lv >= t.max) return; const c = treCost(t, lv); if (S.stamp < c) return; S.stamp -= c; S.tre[t.id]++; if ((lv + 1) % 50 === 0) celebrate({ ic: "treasure", title: "보물 차수 상승!", sub: `${treName(t, lv + 1)} · 효과가 크게 올라요`, tone: "stamp" }); },
    rep: { cost: k => treCost(t, S.tre[t.id] + k), have: () => S.stamp, max: () => t.max ? t.max - S.tre[t.id] : Infinity, unit: "도장" },''')
# 자동 강화 타이머
rep('''setInterval(() => { studyTick(); updateUI(false); if (rd) updateReaderState(); bgmUpdate(); sfxWatch(); skillAuto(); }, 250);''',
    '''setInterval(() => { studyTick(); updateUI(false); if (rd) updateReaderState(); bgmUpdate(); sfxWatch(); skillAuto(); autoUpgradeTick(); }, 250);''')
rep('#wBtn small, #wAll small { max-width: none; }', '#wBtn small, #wAuto small { max-width: none; }')
open(P, 'w', encoding='utf-8').write(s); print('ok', len(s))
