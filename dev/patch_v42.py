"""v42: 체계적 밸런스 — 무기 7등급(42개)·등급 관문 · 재료 수급 · 지하 문서고(한 방에 +1초, 100m마다 보상) · 폭주 고리 끊기 (patch_v41 다음에)"""
import sys, os
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('var GAME_V = 41;', 'var GAME_V = 42;')

# ---- 무기 42개: 신화 6 · 초월 6 (마지막 무기만 5강 뒤 끝없이 돌파) ----
rep('''    story: "본사 타워 꼭대기, 별들 사이에서 내려온 지팡이. 5강 뒤에도 끝없이 초월할 수 있다." },
];''', '''    story: "본사 타워 꼭대기, 별들 사이에서 내려온 지팡이. 회장님이 퇴근할 때 별 하나를 끄고 간다는 소문이 있다." },
  /* v42 신화 */
  { n: "황룡 만년필 창", s: "pen", p: { a: "#c0392b", b: "#5a120c", c: "#ffd54a", d: "#ffd54a", h: "#3a0c08" }, leg: true, fx: "flame",
    story: "용의 수염으로 만든 펜촉. 서명하는 순간 계약서에 불길이 일어 다시는 번복되지 않는다." },
  { n: "뇌신 스테이플러 망치", s: "stapler", p: { a: "#2b3a8a", b: "#141c4a", c: "#7fe9ff", h: "#ffd54a" }, leg: true, fx: "spark",
    story: "한 번 박으면 천둥이 친다. 회의 자료 삼백 장을 한 번에 묶었다는 전설의 망치." },
  { n: "빙하 재단기 도끼", s: "ruler", p: { a: "#bff0ff", b: "#4a8ab8" }, leg: true, fx: "frost",
    story: "재단기 칼날에 만년설이 얼어붙었다. 이 칼로 자른 서류는 영원히 구겨지지 않는다." },
  { n: "불사조 인감 망치", s: "stamp", p: { a: "#ff6b3b", b: "#7a1f0c", c: "#ffe08a", d: "#ff3b1a", h: "#3b1a0a" }, leg: true, fx: "ember",
    story: "불에 타도 다시 살아나는 회사의 마지막 인감. 찍힌 자리에서 불꽃 깃털이 날린다." },
  { n: "세계수 결재봉", s: "cane", p: { a: "#3fa04a", b: "#1f5a24", c: "#c8ff6a", d: "#ffe08a", h: "#3a2414" }, leg: true, fx: "holy",
    story: "본사 정원 천 년 나무에서 꺾은 가지. 들고 있으면 서류에 새싹이 돋는다." },
  { n: "심연의 서버 키", s: "sword", p: { a: "#1a1030", b: "#0a0614", c: "#9b5cff", d: "#5cf0ff", h: "#2a1a4a" }, leg: true, fx: "cosmic",
    story: "지하 999층 서버실을 여는 열쇠. 꽂는 순간 모든 데이터가 칼날이 된다." },
  /* v42 초월 */
  { n: "태양 복사기 창", s: "pen", p: { a: "#fff2a8", b: "#ffb13b", c: "#ffffff", d: "#ffd54a", h: "#8a5a1a" }, leg: true, fx: "holy",
    story: "복사할 때마다 태양이 한 장씩 늘어난다. 너무 눈부셔서 원본이 보이지 않는다." },
  { n: "시간 정지 출입증", s: "card", p: { a: "#e6f9ff", b: "#6fa8d6", c: "#8ff0ff", d: "#ffffff", h: "#3b4566" }, leg: true, fx: "frost",
    story: "찍는 순간 모든 시계가 멈춘다. 이 출입증 앞에서 지각이란 말은 사라졌다." },
  { n: "은하 USB 성검", s: "sword", p: { a: "#f4f6fb", b: "#7c5cff", c: "#6fd3ff", d: "#ff6bd6", h: "#2a1a5a" }, leg: true, fx: "cosmic",
    story: "은하 하나를 통째로 담은 USB. 꽂을 곳은 오직 악의 심장뿐이다." },
  { n: "블랙홀 파쇄기 낫", s: "cane", p: { a: "#120a2a", b: "#000000", c: "#b18cff", d: "#ff6bd6", h: "#2a1a4a" }, leg: true, fx: "cosmic",
    story: "넣으면 서류도 빛도 돌아오지 않는다. 사내 보안 등급: 측정 불가." },
  { n: "창세 키보드 대검", s: "keyboard", p: { a: "#f4f6fb", b: "#c9ced8", c: "#ffd54a", h: "#8a5a1a" }, leg: true, fx: "rgb",
    story: "첫 줄에 '빛이 있으라'라고 쳤더니 모니터가 켜졌다는 키보드." },
  { n: "본사 타워 마스터키", s: "sword", p: { a: "#ffffff", b: "#ffd54a", c: "#fff2a8", d: "#ff6bd6", h: "#8a5a1a" }, leg: true, fx: "holy",
    story: "회장실 위, 아무도 모르는 층의 문을 여는 열쇠. 5강 뒤에도 끝없이 돌파할 수 있다." },
];''')

# ---- 잠금 = 등급 관문 ----
rep('function weaponStepCost() { const i = S.wi; if (S.wl < 5 || i === LAST_W) return wUp(i, S.wl); const nx = i + 1; if (WEAPONS[nx].leg && !S.legUnlock[nx - LEG_START]) return null; return wBuy(nx); }',
    'function weaponStepCost() { const i = S.wi; if (S.wl < 5 || i === LAST_W) return (i === LAST_W && S.wl >= 5 && (S.ame || 0) < overAme(S.wl)) ? null : wUp(i, S.wl); const nx = i + 1; if (wLocked(nx)) return null; return wBuy(nx); }')
rep('    let c; if (l < 5 || i === LAST_W) c = wUp(i, l); else { const nx = i + 1; if (WEAPONS[nx].leg && !S.legUnlock[nx - LEG_START]) break; c = wBuy(nx); }',
    '    let c; if (l < 5 || i === LAST_W) { if (i === LAST_W && l >= 5) break; c = wUp(i, l); } else { const nx = i + 1; if (wLocked(nx)) break; c = wBuy(nx); }')
rep('(S.gold >= wBuy(S.wi + 1) && (!WEAPONS[S.wi + 1].leg || S.legUnlock[S.wi + 1 - LEG_START]))',
    '(S.gold >= wBuy(S.wi + 1) && !wLocked(S.wi + 1))')

# ---- 퍼센트 피해는 보스 배율을 다시 곱하지 않음 · 문서고는 맞은 횟수를 셈 ----
rep('  if (mon.kind > 0 && mode === "tower") amount *= stats().bossBonus;\n  mon.hp -= amount;',
    '  if (mon.kind > 0 && mode === "tower" && !pctHit) amount *= stats().bossBonus;\n  if (mode === "vault") mon.hitN = (mon.hitN || 0) + 1;\n  mon.hp -= amount;')
rep('      hit(f.kind === "stamp" ? f.dmg : mon.max * (mon.kind ? 0.05 : 0.25), true, "skill", MON_X - 10, y);',
    '      if (f.kind !== "stamp") pctHit = true; try { hit(f.kind === "stamp" ? f.dmg : mon.max * (mon.kind ? 0.05 : 0.25), true, "skill", MON_X - 10, y); } finally { pctHit = false; }')
rep('if (cactusTimer >= 2000) { cactusTimer -= 2000; fireNeedles(); hit(mon.hp * (1 + 0.1 * ca) / 100 / (mon.kind ? 5 : 1), false, "pet"); }',
    'if (cactusTimer >= 2000) { cactusTimer -= 2000; fireNeedles(); pctHit = true; try { hit(mon.hp * (1 + 0.1 * ca) / 100 / (mon.kind ? 5 : 1), false, "pet"); } finally { pctHit = false; } }')

# ---- 회장 보스: 은괴 ----
rep('    if (kind === 3) { const st = 3 + Math.floor(f / 100) * 2; S.stamp += st; toast(`${mon.name} 격파! 월급 ${fmt(reward)}원, 결재도장 ${st}개`);',
    '    if (kind === 3) { const st = 3 + Math.floor(f / 100) * 2; S.stamp += st; S.silver += BAL.chairSilver; toast(`${mon.name} 격파! 월급 ${fmt(reward)}원, 결재도장 ${st}개, 은괴 ${BAL.chairSilver}`);')

# ---- 지하 문서고 ----
rep('''    const hp = hpBase(Math.max(1, S.maxFloor)) * 1.5;
    mon = Object.assign(base, { name: `잠긴 서류함 · 지하 ${vaultRun.depth}m`, sprite: "chest", pal: PAL.chest, scale: 7, kind: 0, hp, max: hp });''',
    '''    const hp = vaultChestHp(vaultRun.n);
    mon = Object.assign(base, { name: `잠긴 서류함 · 지하 ${vaultDepthOf(vaultRun.n + 1)}m`, sprite: "chest", pal: PAL.chest, scale: 7, kind: 0, hp, max: hp, hitN: 0 });''')
rep('''  if (mode === "vault") {
    const g = goldBase(Math.max(1, S.maxFloor)) * 0.6 * goldMult(), st = Math.random() < 0.3 ? 1 : 0;
    vaultRun.n++; vaultRun.depth += 40; vaultRun.gold += g; vaultRun.st += st;
    S.gold += g; S.stamp += st;
    if (vaultRun.depth % 1000 === 0) { S.stamp += 2; vaultRun.st += 2; addFloat(MON_X, 100, `${vaultRun.depth}m 돌파! 도장 +2`, "#ff7a6b", 24); }
    S.day.depth = Math.max(S.day.depth, vaultRun.depth);
    addFloat(MON_X, 140, `+${fmt(g)}원` + (st ? " 도장 +1" : ""), "#ffd54a", 26, true);
    return;
  }''', '''  if (mode === "vault") {
    const one = (mon.hitN || 0) <= 1, V = BAL.vault;
    vaultRun.combo = one ? (vaultRun.combo || 0) + 1 : 0;
    const stepN = vaultStepN(vaultRun.combo), from = vaultRun.depth;              // 한 방이 이어지면 서류함을 건너뛰며 더 빨리 내려감
    spawnWait = Math.round(vaultWait(vaultRun.combo) * 1000);
    vaultRun.n += stepN; vaultRun.depth = vaultDepthOf(vaultRun.n);
    if (one) { vaultRun.one = (vaultRun.one || 0) + 1; vaultTime = Math.min(V.cap, vaultTime + V.one); addFloat(MON_X - 30, 170, vaultRun.combo >= 5 ? `한 방 ${vaultRun.combo}연속! ×${stepN}` : `한 방! +${V.one}초`, "#7fe9ff", 22, true); }
    let msg = ""; for (let m = from + V.m; m <= vaultRun.depth; m += V.m) { const r = vaultReach(m, vaultRun); if (r) msg = r; }
    S.day.depth = Math.max(S.day.depth, vaultRun.depth);
    if (msg) addFloat(MON_X, 120, msg, msg.indexOf("첫") >= 0 ? "#ff9b6b" : "#ffd54a", msg.indexOf("첫") >= 0 ? 24 : 20, true);
    return;
  }''')
rep('  S.day.vaultUsed++; mode = "vault"; vaultTime = 30; vaultRun = { n: 0, gold: 0, st: 0, depth: 0 };',
    '  S.day.vaultUsed++; mode = "vault"; vaultTime = BAL.vault.t0; vaultRun = { n: 0, gold: 0, st: 0, depth: 0, one: 0, best0: vaultBestGet() };')
rep('  toast(`지하 ${vaultRun.depth}m까지 내려감! 서류함 ${vaultRun.n}개, ${fmt(vaultRun.gold)}원, 도장 ${vaultRun.st}개`);',
    '''  const R = vaultRun, got = ["stamp", "ore", "silver", "ame"].filter(k => R[k]).map(k => `${ECO_NAME[k] || k} ${fmtR(R[k])}`).join(" · ");
  celebrate({ ic: "chest", title: `지하 ${R.depth}m${R.depth > (R.best0 || 0) ? " · 새 기록!" : ""}`, sub: `서류함 ${R.n}개 · 한 방 ${R.one || 0}번<br><span class="rws">${fmt(R.gold)}원${got ? " · " + got : ""}</span>`, tone: "ore", ms: 2600 });''')
rep('total = mode === "vault" ? 30 : mon.golden', 'total = mode === "vault" ? BAL.vault.cap : mon.golden')

# ---- 곡괭이 최대 · 부적 값 ----
rep('''    desc: () => `광석 +${S.pick * 10}% → <b>+${(S.pick + 1) * 10}%</b> · 골드로 강화, 퇴사해도 유지`,
    btn: () => ({ label: fmt(pickCost(S.pick)) + "원", sub: "강화", ok: S.gold >= pickCost(S.pick) }),
    click: () => { if (S.gold < pickCost(S.pick)) return; S.gold -= pickCost(S.pick); S.pick++; },
    rep: { cost: k => pickCost(S.pick + k), have: () => S.gold, unit: "원" },''',
    '''    desc: () => S.pick >= BAL.pickMax ? `광석 +${S.pick * 10}% (최대) · 퇴사해도 유지` : `광석 +${S.pick * 10}% → <b>+${(S.pick + 1) * 10}%</b> · 골드로 강화, 퇴사해도 유지 · 최대 Lv.${BAL.pickMax}`,
    btn: () => S.pick >= BAL.pickMax ? { label: "최대", ok: false } : ({ label: fmt(pickCost(S.pick)) + "원", sub: "강화", ok: S.gold >= pickCost(S.pick) }),
    click: () => { if (S.pick >= BAL.pickMax || S.gold < pickCost(S.pick)) return; S.gold -= pickCost(S.pick); S.pick++; },
    rep: { cost: k => pickCost(S.pick + k), have: () => S.gold, max: () => Math.max(0, BAL.pickMax - S.pick), unit: "원" },''')
rep('''    btn: () => ({ label: `광석 ${CHARM_PRICE}`, sub: "붙이기", ok: S.ore >= CHARM_PRICE, cls: "ore" }), noDot: true,
    click: () => { if (S.ore < CHARM_PRICE) return; S.ore -= CHARM_PRICE; S.charms[c.id]++; },
    rep: { cost: () => CHARM_PRICE, have: () => S.ore, unit: "광석" },''',
    '''    btn: () => ({ label: `광석 ${fmtR(charmPrice(c.id))}`, sub: "붙이기", ok: S.ore >= charmPrice(c.id), cls: "ore" }), noDot: true,
    click: () => { const p = charmPrice(c.id); if (S.ore < p) return; S.ore -= p; S.charms[c.id]++; },
    rep: { cost: k => Math.ceil(CHARM_PRICE * Math.pow(BAL.charmGrow, (S.charms[c.id] || 0) + k)), have: () => S.ore, unit: "광석" },''')

# ---- 보물: 새 차수는 자수정으로 연 뒤 ----
rep('''    btn: () => { const lv = S.tre[t.id]; if (t.max && lv >= t.max) return { label: "최대", ok: false, cls: "stamp" }; const c = treCost(t, lv); return { label: `도장 ${fmtR(c)}`, sub: lv ? "강화" : "얻기", ok: S.stamp >= c, cls: "stamp" }; },
    click: () => { const lv = S.tre[t.id]; if (t.max && lv >= t.max) return; const c = treCost(t, lv); if (S.stamp < c) return;''',
    '''    btn: () => { const lv = S.tre[t.id]; if (t.max && lv >= t.max) return { label: "최대", ok: false, cls: "stamp" }; const gt = treGateAt(t); if (gt) { const a = treTierAme(gt); return { label: `자수정 ${fmtR(a)}`, sub: `${gt + 1}차수 열기`, ok: (S.ame || 0) >= a, cls: "rare" }; } const c = treCost(t, lv); return { label: `도장 ${fmtR(c)}`, sub: lv ? "강화" : "얻기", ok: S.stamp >= c, cls: "stamp" }; },
    click: () => { const lv = S.tre[t.id]; if (t.max && lv >= t.max) return; if (treGateAt(t)) { treTierTry(t); return; } const c = treCost(t, lv); if (S.stamp < c) return;''')

# ---- 플랜 하루 분량 보상(자수정 포함)을 취소할 때 함께 빼기 ----
rep('S.manna = Math.max(0, S.manna - drw.manna); S.stamp = Math.max(0, S.stamp - drw.stamp);',
    'S.manna = Math.max(0, S.manna - drw.manna); S.stamp = Math.max(0, S.stamp - drw.stamp); if (drw.ame) S.ame = Math.max(0, (S.ame || 0) - drw.ame);')

# ---- v42 코드 ----
rep('/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */',
    open('part_v42.js', encoding='utf-8').read() + open('part_v42art.js', encoding='utf-8').read() + '\n/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */')

open(P, 'w', encoding='utf-8').write(s)
print('patch_v42 ok', len(s))
