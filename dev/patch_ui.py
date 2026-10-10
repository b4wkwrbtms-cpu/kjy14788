"""메뉴·탭 꾸밈 패치 (v16)"""
import re, sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()

def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt:
        print('COUNT MISMATCH', n, 'expected', cnt, '::', old[:90]); sys.exit(1)
    s = s.replace(old, new)

# ---------- HTML ----------
rep('<div class="floor-big num"><span id="floorChip">1</span><small>층</small></div>',
    '<div class="floor-big num" aria-label="지금 층"><i class="up" aria-hidden="true">▲</i><span id="floorChip">1</span><small>층</small></div>')
rep('''      <span class="chip">만나 <b id="mannaChip" class="num c-manna">0</b></span>
      <span class="chip">도장 <b id="stampChip" class="num c-stamp">0</b></span>
      <span class="chip">광석 <b id="oreChip" class="num c-ore">0</b></span>
      <span class="chip">은괴 <b id="silverChip" class="num c-rare">0</b> · 자수정 <b id="ameChip" class="num c-rare">0</b></span>''',
'''      <span class="chip" title="만나"><i class="ri ri-manna"></i><b id="mannaChip" class="num c-manna">0</b></span>
      <span class="chip" title="결재도장"><i class="ri ri-stamp"></i><b id="stampChip" class="num c-stamp">0</b></span>
      <span class="chip" title="광석"><i class="ri ri-ore"></i><b id="oreChip" class="num c-ore">0</b></span>
      <span class="chip" title="은괴"><i class="ri ri-silver"></i><b id="silverChip" class="num c-silver">0</b></span>
      <span class="chip" title="자수정"><i class="ri ri-ame"></i><b id="ameChip" class="num c-rare">0</b></span>''')
rep('<div class="bar"><i id="hpBar"></i></div>', '<div class="bar"><i id="hpTrail" class="trail"></i><i id="hpBar"></i></div>')
rep('<div class="gold num"><span id="gold">0</span><small>원</small></div>', '<div class="gold num"><i class="ri ri-coin"></i><span id="gold">0</span><small>원</small></div>')
rep('<div class="dps">초당 피해<b id="dps" class="num">0</b></div>', '<div class="dps">초당 피해<b class="num"><i class="ri ri-dps"></i><span id="dps">0</span></b></div>')
rep('''  <nav class="tabs" role="tablist" aria-label="메뉴" id="tabs"></nav>
  <section id="panels"></section>''',
'''  <nav class="tabs" role="tablist" aria-label="메뉴" id="tabs"></nav>
  <div class="tab-head" id="tabHead"><span class="th-ic" id="thIc"></span><div class="th-t"><b id="thName"></b><small id="thSub"></small></div><div class="th-cur num" id="thCur"></div></div>
  <section id="panels"></section>''')
rep('<div id="toast" class="toast" role="status"></div>',
'''<div id="toast" class="toast" role="status"></div>
<div id="celeb" class="celeb" hidden role="status" aria-live="polite">
  <div class="celeb-card"><div class="celeb-rays"></div><div class="celeb-ic" id="celebIc"></div><b class="celeb-t" id="celebT"></b><small class="celeb-s" id="celebS"></small><span class="celeb-tap">눌러서 닫기</span></div>
  <div class="celeb-fx" id="celebFx"></div>
</div>''')

# ---------- 아이콘 + 꾸밈 부품 끼우기 ----------
rep('/* ===================== 배경 ===================== */', open('part_ui_icons.js', encoding='utf-8').read() + '\n/* ===================== 배경 ===================== */')
rep('/* ===================== 탭 ===================== */', open('part_ui.js', encoding='utf-8').read() + '\n/* ===================== 탭 ===================== */')

# 큰 그림 도우미 (무기·동료)
rep('const weaponIcon = (i, lv, size = 40) => iconCanvas((g, s) => drawWeapon(g, i, lv, s / 2, s - 3, 0.6, s / 20, 0, true), size);',
'''const weaponIcon = (i, lv, size = 40) => iconCanvas((g, s) => drawWeapon(g, i, lv, s / 2, s - 3, 0.6, s / 20, 0, true), size);
function weaponBig(i, lv, css = 88) { const d = Math.max(1, Math.min(3, Math.round((typeof window !== "undefined" && window.devicePixelRatio) || 1))), s = Math.round(css * d); const c = iconCanvas(g => drawWeapon(g, i, lv, s / 2, s - 3 * d, 0.6, s / 20, 0, true), s); c.className = "pix"; if (c.style) c.style.width = c.style.height = css + "px"; return c; }
function petBig(id, css = 84) {
  if (id === "intern" || id === "idol" || id === "legend" || id === "clone") return bigSprite(heroMap(PET_HAIR[id]), id === "clone" ? clonePal(heroPal(PAL.hero)) : petHeroPal(id), css);
  return id === "cactus" ? bigSprite(SPR.plant, PAL.cactus, css) : bigSprite(SPR[id], PAL[id], css);
}''')

# ---------- 진행도: 마름모 + 보스 해골 ----------
rep('for (let i = 0; i < 5; i++) { const s = document.createElement("span"); if (i === 4) s.className = "bs"; pipsEl.appendChild(s); }',
    'for (let i = 0; i < 5; i++) { const s = document.createElement("span"); if (i === 4) { s.className = "bs ri-skull"; s.title = "작은 보스"; } pipsEl.appendChild(s); }\nlet trailMon = null, trailPct = 100;')
rep('  [...pipsEl.children].forEach((p, i) => p.classList.toggle("on", i < S.k - 1));',
    '  [...pipsEl.children].forEach((p, i) => { p.classList.toggle("on", i < S.k - 1); p.classList.toggle("now", i === S.k - 1); });')
rep('  $("hpBar").style.width = Math.max(0, mon.hp / mon.max) * 100 + "%";',
'''  const hpPct = Math.max(0, mon.hp / mon.max) * 100; $("hpBar").style.width = hpPct + "%";
  const tr = $("hpTrail");   // 깎인 체력이 잠깐 노랗게 남았다가 따라 내려옴
  if (tr) {
    if (mon !== trailMon || hpPct > trailPct + 0.01) { tr.style.transition = "none"; tr.style.width = hpPct + "%"; void tr.offsetWidth; tr.style.transition = ""; trailMon = mon; }
    else if (hpPct < trailPct) tr.style.width = hpPct + "%";
    trailPct = hpPct;
  }''')

# ---------- 버프 바: 아이콘 칸 + 개수 배지 + 남은 시간 막대 ----------
rep('''BUFFS.forEach(([id, n, d]) => {
  const b = document.createElement("button"); b.innerHTML = `${n}<small></small>`;''',
'''const bfParts = (b, icon, name) => {
  const ic = document.createElement("span"); ic.className = "bf-ic"; if (icon) ic.appendChild(icon);
  const cnt = document.createElement("em"); cnt.className = "bf-n num"; ic.appendChild(cnt);
  const tx = document.createElement("span"); tx.className = "bf-t"; tx.innerHTML = `${name}<small></small>`;
  const bar = document.createElement("i"); bar.className = "bf-bar"; bar.appendChild(document.createElement("i"));
  b.append(ic, tx, bar); b.className = "bf";
};
BUFFS.forEach(([id, n, d]) => {
  const b = document.createElement("button"); bfParts(b, pixIcon(id, 22), n);''')
rep('''const soundBtn = document.createElement("button"); soundBtn.id = "soundBtn";''',
    '''const soundBtn = document.createElement("button"); soundBtn.id = "soundBtn"; bfParts(soundBtn, null, "소리");''')
rep('''  soundBtn.innerHTML = `소리<small>${!S.sound ? "꺼짐" : S.music === false ? "효과음만" : "음악+효과음"}</small>`; soundBtn.classList.toggle("on", !!S.sound);''',
'''  const sm = !S.sound ? "mute" : S.music === false ? "sound" : "music";
  if (soundBtn.dataset.st !== sm) {
    soundBtn.dataset.st = sm; const ic = soundBtn.querySelector(".bf-ic"), old = ic.querySelector("canvas"); if (old && old.remove) old.remove();
    const cv2 = pixIcon(sm, 22); if (ic.insertBefore && ic.firstChild) ic.insertBefore(cv2, ic.firstChild); else ic.appendChild(cv2);
    soundBtn.querySelector("small").textContent = sm === "mute" ? "꺼짐" : sm === "sound" ? "효과음만" : "음악+효과음";
  }
  soundBtn.classList.toggle("on", !!S.sound);''')
rep('''    b.querySelector("small").textContent = on ? `${Math.ceil(S.active[id])}초 남음` : `${d} · ${S.buffs[id]}개`;''',
'''    const sm2 = on ? `${Math.ceil(S.active[id])}초 남음` : d, smEl = b.querySelector("small"); if (smEl.textContent !== sm2) smEl.textContent = sm2;
    const nEl = b.querySelector(".bf-n"), nv = S.buffs[id] > 0 ? String(S.buffs[id]) : ""; if (nEl.textContent !== nv) nEl.textContent = nv;
    b.querySelector(".bf-bar i").style.width = on ? Math.min(100, S.active[id] / 60 * 100) + "%" : "0%";''')

# ---------- 아래 메뉴바: 도트 아이콘 + 이름 ----------
rep('''  const b = document.createElement("button"); b.setAttribute("role", "tab"); b.innerHTML = label + '<span class="dot" hidden></span>';
  b.addEventListener("click", () => selectTab(id)); $("tabs").appendChild(b); tabBtns[id] = b;''',
'''  const b = document.createElement("button"); b.setAttribute("role", "tab"); b.setAttribute("aria-label", label);
  b.appendChild(pixIcon(id, 30)); const tl = document.createElement("span"); tl.className = "tl"; tl.textContent = label; b.appendChild(tl);
  const dot = document.createElement("span"); dot.className = "dot"; dot.hidden = true; b.appendChild(dot);
  b.addEventListener("click", () => selectTab(id, true)); $("tabs").appendChild(b); tabBtns[id] = b;''')
rep('''function selectTab(id) {
  curTab = id;
  TABS.forEach(([t]) => { tabBtns[t].setAttribute("aria-selected", t === id); panels[t].hidden = t !== id; });
  try { localStorage.setItem(SAVE_KEY + "-tab", id); } catch (e) {}
  updateUI(true);
}''',
'''function selectTab(id, user) {
  curTab = id;
  TABS.forEach(([t]) => { tabBtns[t].setAttribute("aria-selected", t === id); panels[t].hidden = t !== id; });
  try { localStorage.setItem(SAVE_KEY + "-tab", id); } catch (e) {}
  updateUI(true);
  // 아래쪽을 보고 있었다면 새 탭의 맨 위가 보이게 (탭 머리띠 바로 아래로)
  if (user && typeof window !== "undefined" && window.scrollTo && typeof getComputedStyle === "function") {
    try {
      const pr = $("panels").getBoundingClientRect(), th = $("tabHead"), hh = th.getBoundingClientRect().height, top0 = parseFloat(getComputedStyle(th).top) || 0;
      if (pr.top < hh + top0) window.scrollTo(0, window.scrollY + pr.top - hh - top0 - 4);
    } catch (e) {}
  }
}''')

# ---------- 공통 강화 줄: Lv 배지, 큰 버튼, 강화하면 반짝 ----------
rep('''  const ic = el("div", "icon"); ic.appendChild(typeof cfg.icon === "string" ? document.createTextNode(cfg.icon) : cfg.icon);
  const info = el("div", "up-info", `<div class="up-name"><span class="nm"></span><span class="lv num"></span></div><div class="up-desc num"></div>`);
  let barEl = null;
  if (cfg.bar) { const b = el("div", "qbar", "<i></i>"); info.appendChild(b); barEl = b.firstChild; }
  const btn = el("button", "buy num"); btn.addEventListener("click", () => { cfg.click(); updateUI(true); save(); });''',
'''  const ic = el("div", "icon"); ic.appendChild(typeof cfg.icon === "string" ? document.createTextNode(cfg.icon) : cfg.icon);
  const lvb = el("span", "lvb num"); lvb.hidden = true; ic.appendChild(lvb);
  const info = el("div", "up-info", `<div class="up-name"><span class="nm"></span><span class="lv num"></span></div><div class="up-desc num"></div>`);
  let barEl = null;
  if (cfg.bar) { const b = el("div", "qbar", "<i></i>"); info.appendChild(b); barEl = b.firstChild; }
  const btn = el("button", "buy num"); if (btn.style) btn.style.animationDelay = (Math.random() * 2.4).toFixed(2) + "s";
  btn.addEventListener("click", () => {
    const before = (cfg.lv ? cfg.lv() : "") + "|" + cfg.name();
    cfg.click();
    const lvNow = cfg.lv ? cfg.lv().trim() : "";
    if ((lvNow + "|" + cfg.name()) !== before.replace(/^\\s+/, "")) {
      const t = /^(Lv\\.|\\+)/.test(lvNow) ? lvNow + "!" : /개$/.test(lvNow) ? "+1" : /보유|해금/.test(lvNow) ? "GET!" : "";
      if (t) rowPop(row, t);
    }
    updateUI(true); save();
  });''')
rep('''    update(force) {
      nm.textContent = cfg.name(); lvEl.textContent = cfg.lv ? cfg.lv() : "";
      const d = cfg.desc(); if (force || d !== lastD) { desc.innerHTML = d; lastD = d; }
      const b = cfg.btn();
      btn.className = "buy num" + (b.cls ? " " + b.cls : ""); btn.disabled = !b.ok;
      btn.innerHTML = b.label + (b.sub ? `<small>${b.sub}</small>` : "");''',
'''    update(force) {
      nm.textContent = cfg.name();
      const lvt = cfg.lv ? cfg.lv() : "", short = /^\\s*(Lv\\.\\s?\\d+|\\+\\d+|\\d+개)\\s*$/.test(lvt);
      lvEl.textContent = short ? "" : lvt; lvb.hidden = !short; if (short && lvb.textContent !== lvt.trim()) lvb.textContent = lvt.trim();
      const d = cfg.desc(); if (force || d !== lastD) { desc.innerHTML = d; lastD = d; }
      const b = cfg.btn();
      btn.className = "buy num" + (b.cls ? " " + b.cls : "") + (!b.ok && isMaxLabel(b.label) ? " max" : ""); btn.disabled = !b.ok;
      const bh = btnInner(b); if (btn._h !== bh) { btn._h = bh; btn.innerHTML = bh; }''')

# ---------- 무기 카드 ----------
rep('''      b.innerHTML = `${fmt(c)}원<small>${S.wl < 5 ? `강화 +${S.wl} → +${S.wl + 1} (공격력 +${Math.round(0.25 / (1 + 0.25 * (S.wl - 1)) * 100)}%)` : "초월 강화 (공격력 +12%)"}</small>`;''',
'''      const wh = btnInner({ label: `${fmt(c)}원`, sub: S.wl < 5 ? `강화 +${S.wl} → +${S.wl + 1} · 공격력 +${Math.round(0.25 / (1 + 0.25 * (S.wl - 1)) * 100)}%` : "초월 강화 · 공격력 +12%" }); if (b._h !== wh) { b._h = wh; b.innerHTML = wh; }''')
rep('''      b.innerHTML = locked ? `잠김: ${nw.n}<small>아래 전설 무기 해금에서 광물로 풀어 주세요</small>` : `${fmt(c)}원<small>다음 무기 구매: ${nw.n} (공격력 x${(wPower(n, 1) / wPower(i, 5)).toFixed(1)})</small>`;''',
'''      const wh = locked ? `<span class="act">잠김: ${nw.n}</span><small>아래 전설 무기 해금에서 광물로 풀어 주세요</small>` : btnInner({ label: `${fmt(c)}원`, sub: `새 무기 ${nw.n} · 공격력 x${(wPower(n, 1) / wPower(i, 5)).toFixed(1)}` }); if (b._h !== wh) { b._h = wh; b.innerHTML = wh; }''')
rep('''    if (S.wl < 5 || i === LAST_W) { const c = wUp(i, S.wl); if (S.gold < c) return; S.gold -= c; S.wl++; if (S.wl === 5) toast(`${WEAPONS[i].n} +5 완성! 빛이 나기 시작해요`); }
    else { const n = i + 1, nw = WEAPONS[n], c = wBuy(n); if (nw.leg && !S.legUnlock[n - LEG_START]) return; if (S.gold < c) return; S.gold -= c; S.wi = n; S.wl = 1; if (S.skin >= 0) S.skin = -1; toast(`새 무기 ${nw.n} 장착!`); }''',
'''    if (S.wl < 5 || i === LAST_W) {
      const c = wUp(i, S.wl); if (S.gold < c) return; S.gold -= c; S.wl++;
      if (S.wl === 5) celebrate({ icon: weaponBig(i, 5), title: "+5 완성!", sub: `${WEAPONS[i].n} · 빛이 나기 시작해요`, tone: WEAPONS[i].leg ? "rare" : "gold" });
      else rowPop(card, `+${S.wl}!`, "#ffd54a");
    }
    else { const n = i + 1, nw = WEAPONS[n], c = wBuy(n); if (nw.leg && !S.legUnlock[n - LEG_START]) return; if (S.gold < c) return; S.gold -= c; S.wi = n; S.wl = 1; if (S.skin >= 0) S.skin = -1; celebrate({ icon: weaponBig(n, 1), title: nw.leg ? "전설 무기 장착!" : "새 무기 장착!", sub: `${n + 1}번째 무기 · ${nw.n}`, tone: nw.leg ? "rare" : "gold" }); }''')
rep('''    if (n) toast(S.wi !== startI ? `${WEAPONS[startI].n} +${startL} → ${WEAPONS[S.wi].n} +${S.wl}` : `${WEAPONS[S.wi].n} +${startL} → +${S.wl}`);''',
'''    if (n && S.wi !== startI) celebrate({ icon: weaponBig(S.wi, S.wl), title: WEAPONS[S.wi].leg ? "전설 무기 장착!" : "새 무기 장착!", sub: `${WEAPONS[startI].n} +${startL} → ${WEAPONS[S.wi].n} +${S.wl}`, tone: WEAPONS[S.wi].leg ? "rare" : "gold" });
    else if (n && S.wl === 5 && startL < 5) celebrate({ icon: weaponBig(S.wi, 5), title: "+5 완성!", sub: `${WEAPONS[S.wi].n} +${startL} → +5`, tone: "gold" });
    else if (n) { toast(`${WEAPONS[S.wi].n} +${startL} → +${S.wl}`); rowPop(card, `+${S.wl}!`, "#ffd54a"); }''')
# 무기 목록 줄: 아이콘 아래 +강화 배지
rep('''    const ic = el("div", "icon");
    const info = el("div", "up-info", `<div class="up-name"><span class="nm"></span><span class="lv num"></span></div><div class="up-desc num"></div>`);
    const btn = el("button", "buy num");''',
'''    const ic = el("div", "icon"), lvb = el("span", "lvb num"); lvb.hidden = true;
    const info = el("div", "up-info", `<div class="up-name"><span class="nm"></span><span class="lv num"></span></div><div class="up-desc num"></div>`);
    const btn = el("button", "buy num"); if (btn.style) btn.style.animationDelay = (Math.random() * 2.4).toFixed(2) + "s";''')
rep('''    return { row, ic, nm: info.querySelector(".nm"), lv: info.querySelector(".lv"), desc: info.querySelector(".up-desc"), btn, key: "" };''',
    '''    return { row, ic, lvb, nm: info.querySelector(".nm"), lv: info.querySelector(".lv"), desc: info.querySelector(".up-desc"), btn, key: "" };''')
rep('''      r.ic.innerHTML = ""; r.ic.appendChild(i <= S.wi + 1 && !lockedLeg ? weaponIcon(i, Math.max(1, lv)) : iconCanvas(g => { g.fillStyle = "#3a4466"; g.fillRect(12, 18, 16, 14); g.strokeStyle = "#3a4466"; g.lineWidth = 3; g.beginPath(); g.arc(20, 18, 6, Math.PI, 0); g.stroke(); }));
      r.nm.textContent = `${i + 1}. ${w.n}`; r.nm.style.color = w.leg ? "var(--rare)" : "";
      r.lv.textContent = ` LV.${lv}/5` + (i === LAST_W && lv > 5 ? ` (+${lv - 5})` : "");''',
'''      r.ic.innerHTML = ""; r.ic.appendChild(i <= S.wi + 1 && !lockedLeg ? weaponIcon(i, Math.max(1, lv)) : pixIcon("lock", 22)); r.ic.appendChild(r.lvb);
      r.lvb.hidden = lv <= 0; r.lvb.textContent = lv >= 5 && i !== LAST_W ? "MAX" : `+${lv}`; r.lvb.classList.toggle("mx", lv >= 5 && i !== LAST_W);
      r.nm.textContent = `${i + 1}. ${w.n}`; r.nm.style.color = w.leg ? "var(--rare)" : "";
      r.lv.textContent = i === LAST_W && lv > 5 ? ` 초월 +${lv - 5}` : "";''')
rep('''      if (i < S.wi) { b.className = "buy ghost num"; b.disabled = skinIdx() === i; b.innerHTML = skinIdx() === i ? "착용 중<small>모양</small>" : "모양 바꾸기"; }
      else if (i === S.wi) {
        if (S.wl < 5 || i === LAST_W) { b.className = "buy num"; b.disabled = S.gold < cost; b.innerHTML = `${fmt(cost)}원<small>${S.wl < 5 ? "강화" : "초월"}</small>`; }
        else { b.className = "buy ghost num"; b.disabled = skinIdx() === i; b.innerHTML = skinIdx() === i ? "착용 중<small>완성</small>" : "모양 바꾸기"; }
      }
      else if (nextOk && !lockedLeg) { b.className = "buy num" + (w.leg ? " rare" : ""); b.disabled = S.gold < cost; b.innerHTML = `${fmt(cost)}원<small>구매</small>`; }
      else { b.className = "buy ghost num"; b.disabled = true; b.innerHTML = lockedLeg ? "잠김<small>광물 해금</small>" : "잠김"; }''',
'''      if (i < S.wi) { b.className = "buy ghost num"; b.disabled = skinIdx() === i; b.innerHTML = skinIdx() === i ? `<span class="act">착용 중</span><small>모양</small>` : `<span class="act">모양 바꾸기</span>`; }
      else if (i === S.wi) {
        if (S.wl < 5 || i === LAST_W) { b.className = "buy num"; b.disabled = S.gold < cost; b.innerHTML = btnInner({ label: `${fmt(cost)}원`, sub: S.wl < 5 ? "강화" : "초월" }); }
        else { b.className = "buy ghost num"; b.disabled = skinIdx() === i; b.innerHTML = skinIdx() === i ? `<span class="act">착용 중</span><small>완성</small>` : `<span class="act">모양 바꾸기</span>`; }
      }
      else if (nextOk && !lockedLeg) { b.className = "buy num" + (w.leg ? " rare" : ""); b.disabled = S.gold < cost; b.innerHTML = btnInner({ label: `${fmt(cost)}원`, sub: "구매" }); }
      else { b.className = "buy ghost num"; b.disabled = true; b.innerHTML = lockedLeg ? `<span class="act">잠김</span><small>광물 해금</small>` : `<span class="act">잠김</span>`; }''')
rep('''S.silver -= req.silver; S.ame -= req.ame; S.legUnlock[k] = true; toast(`${w.n} 해금!`); },''',
    '''S.silver -= req.silver; S.ame -= req.ame; S.legUnlock[k] = true; celebrate({ icon: weaponBig(i, 5), title: "전설 무기 해금!", sub: `${w.n} · 이제 월급으로 살 수 있어요`, tone: "rare" }); },''')

# ---------- 동료·정장·보물 ----------
rep('''S.manna -= c; S.pets[p.id] = lv + 1; if (!lv) toast(`${p.n} 합류!`); },''',
    '''S.manna -= c; S.pets[p.id] = lv + 1; if (!lv) celebrate({ icon: petBig(p.id), title: "동료 합류!", sub: `${p.n} · ${p.desc(1)}`, tone: "manna" }); },''')
rep('''S.cos[sl.id][i] = 1; S.look[sl.id] = i; toast(`${it.n} 구매! 바로 입었어요`); return; }''',
'''S.cos[sl.id][i] = 1; S.look[sl.id] = i;
          const pal = Object.assign({}, PAL.hero); let hair = "neat"; Object.keys(it.look).forEach(k => { if (k === "hair") hair = it.look.hair; else if (k !== "aura") pal[k] = it.look[k]; });
          celebrate({ icon: bigSprite(heroMap(hair), heroPal(pal), 92), title: it.leg ? "전설 정장!" : "새 정장!", sub: `${it.n} · 바로 입었어요`, tone: it.leg ? "rare" : "ore" }); return; }''')
rep('''if ((lv + 1) % 50 === 0) toast(`${treName(t, lv + 1)}으로 차수가 올랐어요!`); },''',
    '''if ((lv + 1) % 50 === 0) celebrate({ ic: "treasure", title: "보물 차수 상승!", sub: `${treName(t, lv + 1)} · 효과가 크게 올라요`, tone: "stamp" }); },''')
# 보물 아이콘: 동그라미 글자 → 도트 보물상자 위에 글자
rep('''    icon: iconCanvas(g => { g.fillStyle = "#ffd54a"; g.beginPath(); g.arc(20, 20, 13, 0, 7); g.fill(); g.fillStyle = "#2a2206"; g.font = '16px "Do Hyeon", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t.n[0], 20, 21); }),
    name: () => treName(t, S.tre[t.id]), lv: () => ` Lv.${S.tre[t.id]}`,''',
'''    icon: treIcon(t),
    name: () => treName(t, S.tre[t.id]), lv: () => ` Lv.${S.tre[t.id]}`,''')
rep('''  const tCells = TREASURES.map(t => cell(tc, () => iconCanvas(g => { g.fillStyle = "#ffd54a"; g.beginPath(); g.arc(20, 20, 14, 0, 7); g.fill(); g.fillStyle = "#2a2206"; g.font = '16px "Do Hyeon", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t.n[0], 20, 21); })));''',
    '''  const tCells = TREASURES.map(t => cell(tc, () => treIcon(t)));''')
rep('''/* ---------- 보물 탭 ---------- */''',
'''/* ---------- 보물 탭 ---------- */
/* 보물 아이콘: 금빛 메달 + 보물 이름 첫 글자 (보물마다 테두리 색이 다름) */
function treIcon(t) {
  const hue = [...t.id].reduce((a, ch) => a + ch.charCodeAt(0), 0) * 47 % 360;
  return iconCanvas(g => {
    g.fillStyle = "#140f1c"; g.beginPath(); g.arc(20, 20, 17, 0, 7); g.fill();
    g.fillStyle = `hsl(${hue},70%,55%)`; g.beginPath(); g.arc(20, 20, 15, 0, 7); g.fill();
    g.fillStyle = "#ffd54a"; g.beginPath(); g.arc(20, 20, 12, 0, 7); g.fill();
    g.fillStyle = "#fff3b0"; g.fillRect(12, 12, 4, 3);
    g.fillStyle = "#d9a21c"; g.beginPath(); g.arc(20, 21, 10, 0.2, Math.PI - 0.2); g.lineWidth = 2; g.strokeStyle = "#d9a21c"; g.stroke();
    g.fillStyle = "#3a2a06"; g.font = '17px "Do Hyeon", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t.n[0], 20, 21);
  });
}''')

# ---------- 업무·업적: 진행 막대 + 보상 아이콘 + 축하 ----------
rep('''    const row = el("div", "task"); row.innerHTML = `<div><div class="t-name">${d.n}</div><div class="t-sub num"></div></div><button class="buy num"></button>`;
    const sub = row.querySelector(".t-sub"), btn = row.querySelector("button");
    btn.addEventListener("click", () => { if (S.day.claimed[d.id] || (S.day[d.stat] || 0) < d.goal) return; S.day.claimed[d.id] = 1; grant(d.rw); toast(`${d.n} 완료 · ${rwText(d.rw)}`); updateUI(true); save(); });''',
'''    const row = el("div", "task"); row.innerHTML = `<div><div class="t-name">${d.n}</div><div class="t-sub num"></div><div class="qbar"><i></i></div></div><button class="buy num"></button>`;
    const sub = row.querySelector(".t-sub"), btn = row.querySelector("button"), qb = row.querySelector(".qbar i");
    btn.addEventListener("click", () => { if (S.day.claimed[d.id] || (S.day[d.stat] || 0) < d.goal) return; S.day.claimed[d.id] = 1; grant(d.rw); toast(`${d.n} 완료 · ${rwText(d.rw)}`); rowPop(row, "완료!", "#a8f0c6"); updateUI(true); save(); });''')
rep('''        const v = Math.min(d.goal, Math.floor(S.day[d.stat] || 0)), done = !!S.day.claimed[d.id];
        sub.textContent = `${v} / ${d.goal} · 보상 ${rwText(d.rw)}`;''',
'''        const v = Math.min(d.goal, Math.floor(S.day[d.stat] || 0)), done = !!S.day.claimed[d.id];
        const sh = `<span>${v} / ${d.goal}</span><span class="rws">${rwHTML(d.rw)}</span>`; if (sub._h !== sh) { sub._h = sh; sub.innerHTML = sh; }
        qb.style.width = (done ? 100 : v / d.goal * 100) + "%";''')
rep('''grant({ haste: 1, gold2: 1, rage: 1, manna: 20 }); toast("오늘 업무 끝! 버프 3종과 만나 20"); updateUI(true); save(); });''',
    '''grant({ haste: 1, gold2: 1, rage: 1, manna: 20 }); celebrate({ ic: "daily", title: "오늘 업무 끝!", sub: `<span class="rws">${rwHTML({ haste: 1, gold2: 1, rage: 1, manna: 20 })}</span>`, tone: "manna", sound: "pass" }); updateUI(true); save(); });''')
rep('''    const row = el("div", "task"); row.innerHTML = `<div><div class="t-name"></div><div class="t-sub num"></div></div><button class="buy num stamp"></button>`;
    const nm = row.querySelector(".t-name"), sub = row.querySelector(".t-sub"), btn = row.querySelector("button");''',
'''    const row = el("div", "task"); row.innerHTML = `<div><div class="t-name"></div><div class="t-sub num"></div><div class="qbar"><i></i></div></div><button class="buy num stamp"></button>`;
    const nm = row.querySelector(".t-name"), sub = row.querySelector(".t-sub"), btn = row.querySelector("button"), qb = row.querySelector(".qbar i");''')
rep('''S.ach[a.id] = i + 1; grant(a.rw(i)); toast(`업적 달성: ${a.n} ${a.tiers[i]}${a.unit} · ${rwText(a.rw(i))}`); updateUI(true); save(); });''',
    '''S.ach[a.id] = i + 1; grant(a.rw(i)); celebrate({ ic: "trophy", title: "업적 달성!", sub: `${a.n} ${a.tiers[i]}${a.unit}<br><span class="rws">${rwHTML(a.rw(i))}</span>`, tone: "gold", sound: "pass" }); updateUI(true); save(); });''')
rep('''        sub.textContent = done ? "" : `${a.unit === "시간" ? v.toFixed(1) : Math.floor(v)} / ${a.tiers[i]}${a.unit} · 보상 ${rwText(a.rw(i))}`;''',
'''        const sh = done ? "" : `<span>${a.unit === "시간" ? v.toFixed(1) : Math.floor(v)} / ${a.tiers[i]}${a.unit}</span><span class="rws">${rwHTML(a.rw(i))}</span>`; if (sub._h !== sh) { sub._h = sh; sub.innerHTML = sh; }
        qb.style.width = (done ? 100 : Math.min(1, v / a.tiers[i]) * 100) + "%";''')

# ---------- 통독 완료, 퇴사, 새 캐릭터 ----------
rep('''    toast(`성경 통독 ${B.rounds}독 완료! 도장 100, 만나 500`);''',
    '''    celebrate({ ic: "bible", title: `성경 ${B.rounds}독 완료!`, sub: `<span class="rws">${rwHTML({ stamp: 100, manna: 500 })}</span>`, tone: "manna", ms: 3200 });''')
rep('''  toast(promo ? `영전 퇴사! 도장 ${gain}개, 다음 퇴사까지 월급과 피해 4배` : `사표 수리. 도장 ${gain}개 챙겨서 새 회사 1층부터!`);''',
    '''  celebrate({ ic: "retire", title: promo ? "영전 퇴사!" : "사표 수리!", sub: (promo ? `다음 퇴사까지 월급과 피해 4배<br>` : `${S.retires + 1}번째 회사 1층부터 다시<br>`) + `<span class="rws">${rwHTML({ stamp: gain })}</span>`, tone: "stamp", ms: 2800 });''')
rep('''    CHARS.forEach(c => { if (c.req && c.req.k === "floor" && prev < c.req.v && S.bestFloor >= c.req.v) toast(`새 캐릭터 ${c.n} 해금! (정보 탭)`); });''',
    '''    CHARS.forEach(c => { if (c.req && c.req.k === "floor" && prev < c.req.v && S.bestFloor >= c.req.v) { const lk = heroLookFor(c); celebrate({ icon: bigSprite(lk.map, lk.pal, 92), title: "새 캐릭터 해금!", sub: `${c.n} · 정보 탭에서 바꿀 수 있어요`, tone: "gold" }); } });''')

# ---------- 화면 갱신: 탭 머리띠 ----------
rep('''  renderBuffs();
  updaters[curTab].forEach(r => r.update(force));''',
'''  renderBuffs();
  renderTabHead();
  updaters[curTab].forEach(r => r.update(force));''')

open(P, 'w', encoding='utf-8').write(s)
print('ok', len(s))
