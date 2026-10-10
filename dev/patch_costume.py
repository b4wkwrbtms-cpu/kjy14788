"""코스튬 패치"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:100]); sys.exit(1)
    s = s.replace(old, new)

rep('/* ===================== 탭 ===================== */', open('part_costume.js', encoding='utf-8').read() + '\n/* ===================== 탭 ===================== */')
rep('''  if (hair === "bald") pal.e = pal.e || "#ffd54a";
  return { map: heroMap(hair), pal: heroPal(pal), aura };
}
function heroLook() { return heroLookFor(curChar()); }''',
'''  if (hair === "bald") pal.e = pal.e || "#ffd54a";
  return { map: heroMap(hair), pal: heroPal(pal), aura, hair };
}
function heroLook() { const lk = heroLookFor(curChar()), o = typeof curOutfit === "function" ? curOutfit() : null; return o ? applyOutfit(lk, o) : lk; }''')
# 그리는 자리: 의상은 위로 3줄 더 있으므로 그만큼 올려 그림
rep('drawSprite(ctx, look.map, clonePal(look.pal), HERO_X - 40 - c * 36 + pose.dx * 0.6, GROUND - 84, 3.5, { pretty: true });',
    'drawSprite(ctx, look.map, clonePal(look.pal), HERO_X - 40 - c * 36 + pose.dx * 0.6, GROUND - 84 - (look.top || 0) * 3.5, 3.5, { pretty: true });')
rep('''  reflect(() => drawSprite(ctx, look.map, look.pal, hx, hy, hs, { pretty: true }));''',
    '''  reflect(() => drawSprite(ctx, look.map, look.pal, hx, hy - (look.top || 0) * hs, hs, { pretty: true }));''')
rep('''  drawSprite(ctx, look.map, look.pal, hx, hy, hs, { pretty: true });
  const wi = skinIdx(), wlv = wi === S.wi ? S.wl : 5, WS = 5;''',
'''  drawSprite(ctx, look.map, look.pal, hx, hy - (look.top || 0) * hs, hs, { pretty: true });
  const WS = 5;''')
rep('''    for (let g = 1; g <= 3; g++) { ctx.save(); ctx.globalAlpha = 0.3 * smear / g; drawWeapon(ctx, wi, wlv, px, py, ang - dir * g * 0.42, WS, t, true); ctx.restore(); }
  }
  drawWeapon(ctx, wi, wlv, px, py, ang, WS, t, false);''',
'''    for (let g = 1; g <= 3; g++) { ctx.save(); ctx.globalAlpha = 0.3 * smear / g; drawHeldWeapon(ctx, px, py, ang - dir * g * 0.42, WS, t, true); ctx.restore(); }
  }
  drawHeldWeapon(ctx, px, py, ang, WS, t, false);''')
rep('''  drawSprite(g, look.map, look.pal, hx, hy, hs, { pretty: true });
  g.save(); g.translate(hx + 15.5 * hs, hy + 16 * hs);''',
'''  drawSprite(g, look.map, look.pal, hx, hy - (look.top || 0) * hs, hs, { pretty: true });
  g.save(); g.translate(hx + 15.5 * hs, hy + 16 * hs);''')
rep('''    drawSprite(g, look.map, look.pal, x, y, sc, { flip, pretty: true });''',
    '''    drawSprite(g, look.map, look.pal, x, y - (look.top || 0) * sc, sc, { flip, pretty: true });''')
rep('''  drawWeapon(g, skinIdx(), skinIdx() === S.wi ? S.wl : 5, 110 + 15.5 * 3.5, 44 + 16 * 3.5, 0.35, 3.4, 0, true);''',
    '''  drawHeldWeapon(g, 110 + 15.5 * 3.5, 44 + 16 * 3.5, 0.35, 3.4, 0, true);''')
rep('''    drawSprite(g, look.map, look.pal, 18, 12, 3.6, { pretty: true });
    drawWeapon(g, skinIdx(), skinIdx() === S.wi ? S.wl : 5, 18 + 15.5 * 3.6, 12 + 16 * 3.6, 0.35, 3.0, t, false);''',
'''    drawSprite(g, look.map, look.pal, 18, 12 - (look.top || 0) * 3.6, 3.6, { pretty: true });
    drawHeldWeapon(g, 18 + 15.5 * 3.6, 12 + 16 * 3.6, 0.35, 3.0, t, false);''')
# 무기 성질(베기 색·타격음): 스킨을 입었으면 스킨 성질
rep('if (WEAPONS[skinIdx()].fx === "laser") laser = 1;', 'if (curFx() === "laser") laser = 1;')
rep('  const fx = WEAPONS[skinIdx()].fx;', '  const fx = curFx();')
rep('const slashStyle = () => SLASH_STYLE[WEAPONS[skinIdx()].fx] || "steel";', 'const slashStyle = () => SLASH_STYLE[curFx()] || "steel";')
rep('      if (WEAPONS[skinIdx()].fx === "rgb") {', '      if (curFx() === "rgb") {')
rep('const SLASH_STYLE = { flame: "fire", ember: "fire", frost: "ice", spark: "volt", laser: "volt", holy: "holy", gold: "gold", cosmic: "magic", rgb: "magic" };',
    'const SLASH_STYLE = { flame: "fire", ember: "fire", frost: "ice", spark: "volt", laser: "volt", holy: "holy", gold: "gold", cosmic: "magic", rgb: "magic", leaf: "leaf" };')
# 모은 코스튬마다 모든 피해 +3%
rep('''    * (S.active.rage > 0 ? 3 : 1) * (idolBuff.t > 0 && idolBuff.type === "rage" ? 3 : 1) * (S.promo ? 4 : 1);
  const atk = wp * add * mul;''',
'''    * (S.active.rage > 0 ? 3 : 1) * (idolBuff.t > 0 && idolBuff.type === "rage" ? 3 : 1) * (S.promo ? 4 : 1)
    * (1 + 0.03 * (typeof costN === "number" ? costN : 0));
  const atk = wp * add * mul;''')
# 화면 갱신마다 코스튬 해금 확인
rep('''function updateUI(force) {
  rollDay();''', '''function updateUI(force) {
  rollDay();
  refreshCostumes(true);''')
# 옷방 다시 그리기 조건
rep('''    const k = JSON.stringify(S.cos) + JSON.stringify(S.look) + skinIdx() + S.wl;''',
    '''    const k = JSON.stringify(S.cos) + JSON.stringify(S.look) + skinIdx() + S.wl + "|" + (S.outfit || "") + "|" + (S.wskin || "") + "|" + costN;''')
# 정장 탭: 코스튬 묶음 + '코스튬' 거르기
rep('''  const filters = [["all", "전체"], ...SLOTS.map(s => [s.id, s.n]), ["charm", "부적"]];''',
    '''  const filters = [["all", "전체"], ["cost", "코스튬"], ...SLOTS.map(s => [s.id, s.n]), ["charm", "부적"]];''')
rep('''      Object.keys(groups).forEach(g => groups[g].hidden = !(suitFilter === "all" || suitFilter === g));''',
    '''      Object.keys(groups).forEach(g => groups[g].hidden = !(suitFilter === "all" || suitFilter === g || (suitFilter === "cost" && (g === "outfit" || g === "wskin"))));''')
rep('''  SLOTS.forEach(sl => {
    const grp = mkGroup(sl.id, sl.n);''',
'''  // 코스튬: 의상 6종, 무기 12종 (기록으로 해금, 모양만)
  const og = mkGroup("outfit", "의상 코스튬", "기록으로 열려요 · 모양만 바뀜");
  const costHead = el("div", "cost-head num"); og.appendChild(costHead);
  updaters.suit.push({ ready: () => false, update() { const h = `모은 코스튬 <b>${costN}</b> / ${OUTFITS.length + WSKINS.length} · 모든 피해 <b class="c-good">+${costN * 3}%</b>`; if (costHead._h !== h) { costHead._h = h; costHead.innerHTML = h; } } });
  const costRow = (c, kind, grp) => addRow("suit", {
    icon: kind === "o" ? outfitIcon(c) : skinIcon(c),
    name: () => c.n, lv: () => costOwned(c) ? ((kind === "o" ? curOutfit() : curSkin()) === c ? " 착용 중" : "") : "",
    locked: () => !costOwned(c), legOwned: () => (kind === "o" ? curOutfit() : curSkin()) === c,
    desc: () => costOwned(c) ? c.d : `${c.d}<br>해금: ${condText(c)}`,
    bar: () => condProg(c),
    btn: () => !costOwned(c) ? { label: "잠김", sub: `${Math.floor(condProg(c) * 100)}%`, ok: false, cls: "ghost" } : (kind === "o" ? curOutfit() : curSkin()) === c ? { label: "벗기", ok: true, cls: "ghost" } : { label: "입기", ok: true, cls: "rare" },
    noDot: true,
    click: () => {
      if (!costOwned(c)) return;
      if (kind === "o") S.outfit = curOutfit() === c ? null : c.id; else S.wskin = curSkin() === c ? null : c.id;
      toast((kind === "o" ? S.outfit : S.wskin) ? `${c.n} 착용! (모양만 바뀌어요)` : `${c.n}을(를) 벗었어요`);
    },
  }, grp);
  OUTFITS.forEach(o => costRow(o, "o", og));
  const wg = mkGroup("wskin", "무기 코스튬", "무기 모양만 바뀜 · 성능은 그대로");
  WSKINS.forEach(k => costRow(k, "w", wg));
  SLOTS.forEach(sl => {
    const grp = mkGroup(sl.id, sl.n);''')
# 무기 탭 설명: 스킨 입었으면 알림
rep('''    $("wStory").hidden = !w.leg; $("wStory").textContent = w.story || "";''',
    '''    $("wStory").hidden = !w.leg; $("wStory").textContent = w.story || "";
    const sk = curSkin(), skn = $("wSkin"); if (skn) { skn.hidden = !sk; if (sk) skn.textContent = `무기 코스튬 '${sk.n}'을(를) 들고 있어요 · 성능은 이 무기 그대로`; }''')
rep('''    <p class="story" id="wStory" hidden></p>''', '''    <p class="story" id="wStory" hidden></p>
    <p class="muted c-rare" id="wSkin" hidden></p>''')
# 시작할 때 코스튬 상태 먼저 계산
rep('''function start(data) {
  if (data && data.S) S = merge(data.S); else load();
  rollDay();''', '''function start(data) {
  if (data && data.S) S = merge(data.S); else load();
  rollDay(); refreshCostumes(false);''')
open(P, 'w', encoding='utf-8').write(s); print('ok', len(s))
