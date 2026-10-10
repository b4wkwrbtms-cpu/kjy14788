"""v30 고도화 3단계: 옷장 개편 (patch_grow 다음에)
정장·의상 코스튬·무기 스킨 → 옷장 하나: 세트 14종, 무기 이펙트 13종(모양은 그대로), 오라 10종, 칭호 15종.
입으면 착용 효과 + 가지고만 있어도 보유 효과, 세트 2·4·6벌, 덧입기(겉모습), 도감, 강화(광석·만나), 예전 저장 옮기기"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)
def rep_between(a, b, new):
    global s
    i = s.find(a); j = s.find(b, i + 1)
    if i < 0 or j < 0 or s.count(a) != 1: print('BETWEEN MISS', a[:80], '|', b[:80], i, j, s.count(a)); sys.exit(1)
    s = s[:i] + new + s[j:]

rep('</style>', open('css_ward.css', encoding='utf-8').read() + '</style>', 1)

# 저장값
rep('eco: null, tabSeen: null,\n  };', 'eco: null, tabSeen: null, ward: wardNew(),\n  };')
rep('  s.eco = ecoMerge(d.eco); s.tabSeen = tabSeenMerge(d.tabSeen, s);', '  s.eco = ecoMerge(d.eco); s.tabSeen = tabSeenMerge(d.tabSeen, s);\n  s.ward = wardMerge(d.ward, d);')

# 능력치: 옷장 합계(wardStats) 하나로
rep_between('function stats() {', 'const retireGain = ', '''function stats() {
  const W = wardStats(), now = Date.now();
  const wp = wPower(S.wi, S.wl) * (1 + W.wpn / 100);
  const add = 1 + W.dmg / 100 + treVal("badge") * (W.badge2 ? 2 : 1) + charmEff(CHARMS[0], S.charms.red);
  let mul = W.xdmg
    * (petLv("legend") ? 2 + 0.2 * petLv("legend") : 1)
    * (W.floor5 ? 1 + 0.01 * Math.floor(S.floor / 5) : 1)
    * (S.active.rage > 0 ? 3 : 1) * (idolBuff.t > 0 && idolBuff.type === "rage" ? 3 : 1) * (S.promo ? 4 : 1)
    * (skillOn("night") ? 3 : 1);
  const atk = wp * add * mul * careerAtk();
  const aps = (2 + 0.1 * S.coffee) * (1 + treVal("tumbler")) * (1 + W.aps / 100) * W.xaps
    * (now < S.sneakerUntil ? 3 : 1) * (S.active.haste > 0 ? 2 : 1) * (idolBuff.t > 0 && idolBuff.type === "haste" ? 2 : 1) * (skillOn("rush") ? 2 : 1) * careerAps();
  const crit = (idolBuff.t > 0 && idolBuff.type === "crit") ? 1 : Math.min(1, 0.05 + W.crit / 100 + careerCrit());
  const critMul = (1.5 + W.critd / 100) * careerCritMul();
  const heroDps = atk * aps * (1 + crit * (critMul - 1));
  const cl = petLv("clone"), petK = 1 + W.pet / 100;
  const clone = cl ? heroDps * (0.3 + 0.1 * cl) * (cl >= 10 ? 2 : 1) * careerPet() * petK : 0;
  const cat = petLv("cat") ? atk * (1.5 + 0.5 * petLv("cat")) / 2.5 * 1.4 * careerPet() * petK : 0;
  const bossBonus = (1 + W.boss / 100) * careerBoss();
  return { atk, aps, interval: 1000 / aps, crit, critMul, heroDps, clone, cat, tap: atk * 0.5, bossBonus, dps: heroDps + clone + cat };
}
function goldMult() {
  return (1 + treVal("wallet")) * (1 + wardStats().gold / 100)
    * (1 + 0.2 * petLv("intern")) * (1 + charmEff(CHARMS[1], S.charms.yellow)) * (S.active.gold2 > 0 ? 2 : 1) * (S.promo ? 4 : 1) * careerGold();
}
function stampMult() { const W = wardStats(); return (1 + treVal("review")) * (1 + W.stamp / 100) * W.xstamp * (1 + charmEff(CHARMS[2], S.charms.blue)); }
const rewardBoost = () => 1;
const readMult = () => (1 + 0.1 * Math.min(10, readStreak())) * (1 + wardStats().manna / 100);
const oreMult = () => (1 + wardStats().ore / 100) * (1 + 0.05 * petLv("robot")) * (1 + 0.1 * S.pick) * (isWeekend() ? 1.3 : 1) * (1 + 0.05 * Math.min(20, studyStreak()));
''')
rep('const bossTimeOf = kind => TIME_LIMIT[kind] ? TIME_LIMIT[kind] + treVal("pin") + careerBossTime() : 0;',
    'const bossTimeOf = kind => TIME_LIMIT[kind] ? TIME_LIMIT[kind] + treVal("pin") + careerBossTime() + wardStats().btime : 0;')
rep('const vaultTickets = () => 3 + (own("acc", 0) ? 1 : 0);', 'const vaultTickets = () => 3 + (wardStats().vault ? 1 : 0);')
rep('const memMult = () => (1 + 0.05 * Math.min(20, memStreak())) * rewardBoost();', 'const memMult = () => (1 + 0.05 * Math.min(20, memStreak())) * (1 + wardStats().mem / 100);')
# 겉모습: 옷장이 만듦 (예전 정장 겉모습 함수 제거)
rep_between('function heroLookFor(c) {', 'const skinIdx = ', '/* 겉모습(heroLook·heroLookFor)은 옷장(wardLook)에서 만듦 */\n\n')
rep('  if (curFx() === "laser") laser = 1;', '  if (WEAPONS[skinIdx()].fx === "laser") laser = 1;')
rep('''  if (look.aura) {
    const a = 0.22 + Math.sin(t / 250) * 0.06;
    const gr = ctx.createRadialGradient(hx + 36, hy + 44, 8, hx + 36, hy + 44, 74);
    gr.addColorStop(0, hexA(look.aura, a)); gr.addColorStop(1, hexA(look.aura, 0));
    ctx.fillStyle = gr; ctx.fillRect(hx - 44, hy - 34, 160, 160);
  }''', '  if (look.aura) drawWardAura(ctx, look.aura, hx + 10 * hs, hy + 13 * hs, hs, t, reduceMotion, 1.6);')
rep('  drawHeldWeapon(ctx, px, py, ang, WS, t, false); heroHand.x = px; heroHand.y = py;', '  drawHeldWeapon(ctx, px, py, ang, WS, t, false, 1.8); heroHand.x = px; heroHand.y = py;')
rep('cos: JSON.stringify(S.cos || {}).length + JSON.stringify(S.look || {}).length,', 'cos: (S.ward && S.ward.ops) || 0,')
rep('  if (own("shoes", 0)) S.sneakerUntil = Date.now() + 3 * 60000;', '  if (wardStats().sneaker) S.sneakerUntil = Date.now() + 3 * 60000;')
# 축하 창: 옷 그림 아이콘(wid), 미리 입기는 조용히(quiet)
rep('  const icon = o.icon || pixIcon(o.ic || "star", 76); ic.appendChild(icon);',
    '  const icon = o.icon || (o.wid && WIT[o.wid] ? wardBig(o.wid, 76) : null) || pixIcon(o.ic || "star", 76); ic.appendChild(icon);')
rep('  celebFx(o.tone || "gold");\n  if (o.sound) sfx(o.sound);', '  if (!o.quiet) celebFx(o.tone || "gold"); else { const cf = $("celebFx"); if (cf) cf.innerHTML = ""; }\n  if (o.sound) sfx(o.sound);')
# 예전 코스튬 덩어리 → 옷장 데이터 + 옷장 코드
rep_between('/* ===================== 코스튬: 판타지 무기 스킨 12종', '/* ===================== 새 콘텐츠: 스킬 5종',
    open('part_ward_data.js', encoding='utf-8').read() + '\n' + open('part_ward.js', encoding='utf-8').read() + '\n')
rep('''    const sk = curSkin(), skn = $("wSkin"); if (skn) { skn.hidden = !sk; if (sk) skn.textContent = `무기 코스튬 '${sk.n}'을(를) 들고 있어요 · 성능은 이 무기 그대로`; }''',
    '''    const wf = wardShown("wfx"), skn = $("wSkin"); if (skn) { skn.hidden = !wf; if (wf) skn.textContent = `무기 이펙트 '${wf.n}' · 무기 모양은 그대로, 둘레에만 효과 (옷장에서 바꿔요)`; }''')
rep('  if (look.aura) { const ag = g.createRadialGradient(hx + 18, hy + 26, 2, hx + 18, hy + 26, 40); ag.addColorStop(0, hexA(look.aura, .4)); ag.addColorStop(1, hexA(look.aura, 0)); g.fillStyle = ag; g.fillRect(hx - 24, hy - 16, 84, 84); }',
    '  if (look.aura) drawWardAura(g, look.aura, hx + 9 * hs, hy + 13 * hs, hs, now, false, 1.3);')
# 정장 탭 → 옷장 탭 (부적은 그대로)
rep_between('/* ---------- 정장 탭 ---------- */', '/* ---------- 보물 탭 ---------- */', '''/* ---------- 옷장 탭 ---------- */
(() => {
  buildWardTab();
  const cg = el("div", "panel"); cg.appendChild(el("h3", "sec-title", `포스트잇 부적 <small>개수만큼 쌓이는 강화석</small>`)); panels.suit.appendChild(cg);
  CHARMS.forEach(c => addRow("suit", {
    icon: iconCanvas(g => { g.fillStyle = { red: "#ff6b6b", yellow: "#ffd54a", blue: "#6fd3ff" }[c.id]; g.fillRect(8, 6, 24, 24); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(8, 26, 24, 4); g.fillStyle = "#1b1f2a"; g.fillRect(12, 12, 16, 2); g.fillRect(12, 17, 12, 2); }),
    name: () => c.n, lv: () => ` ${S.charms[c.id]}개`,
    desc: () => `${c.d} +${Math.round(charmEff(c, S.charms[c.id]) * 100)}% · 200개 넘으면 효율 80%`,
    btn: () => ({ label: `광석 ${CHARM_PRICE}`, sub: "붙이기", ok: S.ore >= CHARM_PRICE, cls: "ore" }), noDot: true,
    click: () => { if (S.ore < CHARM_PRICE) return; S.ore -= CHARM_PRICE; S.charms[c.id]++; },
    rep: { cost: () => CHARM_PRICE, have: () => S.ore, unit: "광석" },
  }, cg));
})();

''')
# 직무 스킬 대기 줄이기 (직무 세트 6벌)
rep('  S.skillCd = S.skillCd || {}; S.skillCd[sk.id] = Date.now() + sk.cd * 1000;\n  if (sk.dur) skillUntil[sk.id] = Date.now() + sk.dur * 1000;\n  jobCut',
    '  S.skillCd = S.skillCd || {}; S.skillCd[sk.id] = Date.now() + sk.cd * 1000 * (1 - wardStats().jobcd / 100);\n  if (sk.dur) skillUntil[sk.id] = Date.now() + sk.dur * 1000;\n  jobCut')
# 정보 탭: 칭호 줄, 오라, 도감 칸
rep('      ["직급", rankName() + (curJob() ? " · " + curJob().n : "")], ', '      ["직급", rankName() + (curJob() ? " · " + curJob().n : "")], ["칭호", (wardShown("title") || {}).n || "없음"], ')
rep('    if (look.aura) { const gr = g.createRadialGradient(46, 56, 4, 46, 56, 56); gr.addColorStop(0, hexA(look.aura, .45)); gr.addColorStop(1, hexA(look.aura, 0)); g.fillStyle = gr; g.fillRect(0, 0, 112, 112); }',
    '    if (look.aura) drawWardAura(g, look.aura, 18 + 10 * 3.6, 12 + 13 * 3.6, 3.6, t, true);')
rep_between('  const sc = mkColl("정장", "광석 · 금테는 전설 5강");', '  const wc = mkColl("무기", "모은 무기");',
    '  const sc = mkColl("옷장", "세트 14 · 무기 이펙트 · 오라 · 칭호");\n  const wardCellsUpd = wardInfoCells(sc, cell);\n')
rep('''    sCells.forEach(({ sl, i, it, c }) => { const o = own(sl.id, i), lv = it.leg ? legLv(sl.id) : 0; c.em.textContent = !o ? "" : it.leg ? (lv >= LEG_MAX ? "MAX" : "+" + lv) : "보유"; c.d.classList.toggle("off", !o); c.d.classList.toggle("max", it.leg && lv >= LEG_MAX); });''',
    '    wardCellsUpd();')
rep('동료, 정장, 부적, 보물, 곡괭이', '동료, 옷장, 부적, 보물, 곡괭이')
# 해금 확인
rep('  refreshCostumes(true);', '  wardTick(true);')
rep('  rollDay(); habitGuard(); refreshCostumes(false);', '  rollDay(); habitGuard(); wardTick(false);')
# 탭 이름·머리띠
rep('["suit", "정장"]', '["suit", "옷장"]')
rep('  suit: ["광석으로 정장·부적 사기", () =>', '  suit: ["옷 모으고 입기 · 세트·이펙트·오라·칭호", () =>')
open(P, 'w', encoding='utf-8').write(s)
print('patch_ward ok', len(s))
