"""스킬·황금 몹·주간 목표 패치"""
import json, sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:110]); sys.exit(1)
    s = s.replace(old, new)

d = json.load(open('skill_icons.json'))
icons = ',\n'.join('  %s: { m: %s, p: %s }' % (k, json.dumps(v['m']), json.dumps(v['p'])) for k, v in d.items())
part = open('content_tpl.js', encoding='utf-8').read().replace('__SKILL_ICONS__', icons)
rep('/* ===================== 탭 ===================== */', part + '\n/* ===================== 탭 ===================== */')

# ---------- HTML: 스킬·버프 한 줄, 소리 버튼은 머리로 ----------
rep('<div class="buffbar" id="buffbar"></div>',
    '<div class="actbar"><button class="autob" id="autoBtn" aria-label="스킬 자동 사용">AUTO</button><div class="skills" id="skillbar"></div><i class="act-div" aria-hidden="true"></i><div class="buffbar" id="buffbar"></div></div>')
rep('''      <div class="floor-big num" aria-label="지금 층"><i class="fl-up" aria-hidden="true">▲</i><span id="floorChip">1</span><small>층</small></div>''',
    '''      <div class="hd-right"><span id="sndSlot"></span><div class="floor-big num" aria-label="지금 층"><i class="fl-up" aria-hidden="true">▲</i><span id="floorChip">1</span><small>층</small></div></div>''')
rep('''$("buffbar").appendChild(soundBtn);''', '''($("sndSlot") || $("buffbar")).appendChild(soundBtn);''')
rep('''    b.querySelector(".bf-bar i").style.width = on ? Math.min(100, S.active[id] / 60 * 100) + "%" : "0%";''',
    '''    b.querySelector(".bf-bar i").style.width = on ? Math.min(100, S.active[id] / 60 * 100) + "%" : "0%";
    const secv = on ? String(Math.ceil(S.active[id])) : ""; if (b.dataset.sec !== secv) { b.dataset.sec = secv; if (b.setAttribute) b.setAttribute("data-sec", secv); }''')
rep('''  b.addEventListener("click", () => { if (S.buffs[id] <= 0 || S.active[id] > 0) return; S.buffs[id]--; S.active[id] = 60; toast(`${n} 사용! 1분 동안 ${d}`); updateUI(); save(); });''',
    '''  b.setAttribute("aria-label", `${n}: ${d}`);
  b.addEventListener("click", () => { if (S.active[id] > 0) { toast(`${n} 효과 중 · ${Math.ceil(S.active[id])}초 남음`); return; } if (S.buffs[id] <= 0) { toast(`${n} (${d}) 없음 · 업무·업적 보상으로 받아요`); return; } S.buffs[id]--; S.active[id] = 60; toast(`${n} 사용! 1분 동안 ${d}`); updateUI(); save(); });''')
rep('''    b.classList.toggle("on", on); b.disabled = !on && S.buffs[id] <= 0;''', '''    b.classList.toggle("on", on); b.classList.toggle("empty", !on && S.buffs[id] <= 0);''')

# ---------- 능력치: 커피 러시·야근 모드, 회식 동료 피해 ----------
rep('''    * (now < S.sneakerUntil ? 3 : 1) * (S.active.haste > 0 ? 2 : 1) * (idolBuff.t > 0 && idolBuff.type === "haste" ? 2 : 1);''',
    '''    * (now < S.sneakerUntil ? 3 : 1) * (S.active.haste > 0 ? 2 : 1) * (idolBuff.t > 0 && idolBuff.type === "haste" ? 2 : 1) * (skillOn("rush") ? 2 : 1);''')
rep('''    * (1 + 0.03 * (typeof costN === "number" ? costN : 0));''', '''    * (1 + 0.03 * (typeof costN === "number" ? costN : 0)) * (skillOn("night") ? 3 : 1);''')
rep('''function hit(amount, crit, src, px, py) {
  if (!mon || mon.dying) return;''', '''function hit(amount, crit, src, px, py) {
  if (!mon || mon.dying) return;
  if ((src === "pet" || src === "clone") && skillOn("party")) amount *= 3;''')

# ---------- 황금 몹 ----------
rep('''  mon = Object.assign(base, { name, sprite, pal, scale, kind, hp, max: hp, crown });''',
    '''  mon = Object.assign(base, { name, sprite, pal, scale, kind, hp, max: hp, crown });
  if (kind === 0 && mode === "tower" && S.bestFloor >= 20 && Math.random() < GOLDEN_P) makeGolden();''')
rep('''    if (mode === "tower" && mon && TIME_LIMIT[mon.kind] && !mon.dying && spawnWait <= 0) { bossTime -= sec; if (bossTime <= 0) failBoss(); }''',
    '''    if (mode === "tower" && mon && TIME_LIMIT[mon.kind] && !mon.dying && spawnWait <= 0) { bossTime -= sec; if (bossTime <= 0) failBoss(); }
    if (mode === "tower" && mon && mon.golden && !mon.dying && spawnWait <= 0) { goldenTime -= sec; if (goldenTime <= 0) goldenEscape(); }''')
rep('''  const f = S.floor, kind = mon.kind;
  if (kind > 0) {
    const reward = goldBase(f) * GOLD_MUL[kind] * goldMult();''', '''  const f = S.floor, kind = mon.kind;
  if (mon.golden) goldenReward();
  if (kind > 0) {
    const reward = goldBase(f) * GOLD_MUL[kind] * goldMult();''')
rep('''  const timed = mode === "vault" || TIME_LIMIT[mon.kind] > 0;''', '''  const timed = mode === "vault" || TIME_LIMIT[mon.kind] > 0 || !!mon.golden;''')
rep('''    const left = mode === "vault" ? vaultTime : bossTime, total = mode === "vault" ? 30 : bossTimeOf(mon.kind);''',
    '''    const left = mode === "vault" ? vaultTime : mon.golden ? goldenTime : bossTime, total = mode === "vault" ? 30 : mon.golden ? GOLDEN_SEC : bossTimeOf(mon.kind);''')
rep('''  n.className = "mon-name" + (mode === "vault" ? " vault" : mon.kind >= 2 ? " boss" : mon.kind === 1 ? " small" : "");''',
    '''  n.className = "mon-name" + (mode === "vault" ? " vault" : mon.golden ? " golden" : mon.kind >= 2 ? " boss" : mon.kind === 1 ? " small" : "");''')
rep('''  $("progLabel").textContent = mode === "vault" ? "문서고 마감까지" :''', '''  $("progLabel").textContent = mode === "vault" ? "문서고 마감까지" : mon.golden ? "황금 몹 · 도망가기 전에!" :''')
rep('''    ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(MON_X + ox - w / 2 + 8 + mon.kb * 24 + eo.dx, GROUND - 3, w - 16, 6);''',
    '''    if (mon.golden && !mon.dying && eo.a > 0) drawGoldenAura(mxp, myp, h, t);
    ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(MON_X + ox - w / 2 + 8 + mon.kb * 24 + eo.dx, GROUND - 3, w - 16, 6);''')
rep('''  drawCoins(); drawCritLines(MON_X + monOX() * 0.5, GROUND - 60);''', '''  drawSkillFx(t); drawCoins(); drawCritLines(MON_X + monOX() * 0.5, GROUND - 60);''')
rep('''fxPhys(gdt); fx4Phys(gdt); petPhys(gdt); step(gdt); draw(now); mineTick(now); requestAnimationFrame(frame);''',
    '''fxPhys(gdt); fx4Phys(gdt); petPhys(gdt); step(gdt); skillPhys(gdt); draw(now); mineTick(now); requestAnimationFrame(frame);''')

# ---------- 화면 갱신·자동 스킬 ----------
rep('''  renderBuffs();
  renderTabHead();''', '''  renderBuffs();
  renderSkills();
  renderTabHead();''')
rep('''setInterval(() => { studyTick(); updateUI(false); if (rd) updateReaderState(); bgmUpdate(); sfxWatch(); }, 250);''',
    '''setInterval(() => { studyTick(); updateUI(false); if (rd) updateReaderState(); bgmUpdate(); sfxWatch(); skillAuto(); }, 250);''')

# ---------- 주간 목표 ----------
rep('''function rollDay() {
  const k = dayKey();''', '''function rollDay() {
  rollWeek();
  const k = dayKey();''')
rep('''B.today.push(entry); B.total++; S.day.chap++;''', '''B.today.push(entry); B.total++; S.day.chap++; if (S.week) S.week.chap++;''')
rep('''B.total = Math.max(0, B.total - 1); S.day.chap = Math.max(0, S.day.chap - 1);''', '''B.total = Math.max(0, B.total - 1); S.day.chap = Math.max(0, S.day.chap - 1); if (S.week) S.week.chap = Math.max(0, S.week.chap - 1);''')
rep('''St.today += ms / 60000; St.total += ms / 60000; S.day.study = St.today;''', '''St.today += ms / 60000; St.total += ms / 60000; S.day.study = St.today; if (S.week) S.week.study += ms / 60000;''')
rep('''S.mem.total++; S.day.mem = (S.day.mem || 0) + 1;''', '''S.mem.total++; S.day.mem = (S.day.mem || 0) + 1; if (S.week) S.week.mem = (S.week.mem || 0) + 1;''')
rep('''  secTitle("daily", "지하 문서고", "하루 입장 제한");''', '''  buildWeekly();
  secTitle("daily", "지하 문서고", "하루 입장 제한");''')
rep('''    v: 3, gold: 0, floor: 1, k: 1, maxFloor: 1, bestFloor: 1, auto: true,''', '''    v: 3, gold: 0, floor: 1, k: 1, maxFloor: 1, bestFloor: 1, auto: true, skillCd: {}, autoSkill: false, goldenKills: 0,''')
rep('''      ["말씀 누적", S.bible.total + "장"], ["공부 누적", (S.study.total / 60).toFixed(1) + "시간"],''',
    '''      ["말씀 누적", S.bible.total + "장"], ["공부 누적", (S.study.total / 60).toFixed(1) + "시간"], ["황금 몹", (S.goldenKills || 0) + "마리"],''')

css = '''
/* 스킬·버프 한 줄 (둥근 칸) */
.actbar { display: flex; align-items: center; gap: 5px; padding: 8px 8px 10px; border-top: 2px solid var(--edge); background: linear-gradient(180deg, #161d34, #10162a); box-shadow: inset 0 1px 0 var(--hi); }
.actbar .skills { display: flex; gap: 5px; min-width: 0; }
.actbar .buffbar { display: flex; gap: 5px; padding: 0; border: 0; background: none; box-shadow: none; margin-left: auto; }
.act-div { flex: none; width: 2px; align-self: stretch; margin: 2px; background: linear-gradient(180deg, rgba(52,65,106,0), #34416a, rgba(52,65,106,0)); }
.autob { flex: 0 1 40px; width: 40px; height: 40px; min-width: 32px; border-radius: 50%; border: 2px solid var(--edge); padding: 0; font: 11.5px/1 var(--display); letter-spacing: -.6px; color: #8d99b6; background: radial-gradient(circle at 50% 35%, #2c3760, #161d33 75%); box-shadow: inset 0 0 0 2px #3a4774, 0 3px 0 rgba(0,0,0,.45); cursor: pointer; }
.autob.on { color: #2a2206; background: radial-gradient(circle at 50% 35%, #fff3b0, #ffd54a 60%, #d9a21c); box-shadow: inset 0 0 0 2px #fff3b0, 0 0 12px rgba(255,213,74,.55), 0 3px 0 #8a6a12; animation: autoGlow 1.4s ease-in-out infinite; }
.autob:disabled { opacity: .45; cursor: default; }
@keyframes autoGlow { 0%, 100% { box-shadow: inset 0 0 0 2px #fff3b0, 0 0 6px rgba(255,213,74,.4), 0 3px 0 #8a6a12; } 50% { box-shadow: inset 0 0 0 2px #fff3b0, 0 0 16px rgba(255,213,74,.8), 0 3px 0 #8a6a12; } }
.sk { position: relative; flex: 0 1 40px; width: 40px; height: 40px; min-width: 32px; border-radius: 50%; border: 2px solid var(--edge); padding: 0; display: grid; place-items: center; cursor: pointer; background: radial-gradient(circle at 50% 35%, #34407a, #19203c 72%); box-shadow: inset 0 0 0 2px #5a4a22, 0 3px 0 rgba(0,0,0,.45); }
.sk canvas { pointer-events: none; }
.sk-cd { position: absolute; inset: 0; border-radius: 50%; pointer-events: none; }
.sk-t { position: absolute; inset: 0; display: grid; place-items: center; font: 15px var(--display); color: #fff; text-shadow: 0 2px 0 var(--edge), 0 0 6px #000; pointer-events: none; }
.sk-lk { position: absolute; left: 50%; bottom: -8px; transform: translateX(-50%); font: 10px/13px var(--display); font-style: normal; padding: 0 4px; border-radius: 6px; background: #0a0e1a; color: #8d99b6; border: 1px solid #2c3657; white-space: nowrap; pointer-events: none; }
.sk.locked canvas { filter: grayscale(1) brightness(.5); }
.sk.ready { box-shadow: inset 0 0 0 2px #ffd54a, 0 0 10px rgba(255,213,74,.5), 0 3px 0 rgba(0,0,0,.45); animation: skReady 1.8s ease-in-out infinite; }
.sk.on { box-shadow: inset 0 0 0 2px #7fe3a0, 0 0 12px rgba(127,227,160,.6), 0 3px 0 rgba(0,0,0,.45); }
.sk:active:not(.locked) { transform: translateY(2px); }
@keyframes skReady { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
.actbar .buffbar button { flex: 0 1 40px; width: 40px; height: 40px; min-width: 32px; padding: 0; border-radius: 50%; justify-content: center; overflow: visible; background: radial-gradient(circle at 50% 35%, #34407a, #19203c 72%); box-shadow: inset 0 0 0 2px #3d4a7a, 0 3px 0 rgba(0,0,0,.45); }
.actbar .buffbar button.empty .bf-ic canvas { filter: grayscale(.9) brightness(.55); }
.actbar .bf-t, .actbar .bf-bar { display: none; }
.actbar .bf-ic { width: auto; height: auto; background: none; box-shadow: none; position: static; }
.actbar .bf-n { right: -5px; bottom: -5px; }
.actbar .buffbar button.on { box-shadow: inset 0 0 0 2px var(--gold), 0 0 12px rgba(255,213,74,.5), 0 3px 0 rgba(0,0,0,.45); }
.actbar .buffbar button.on::after { content: attr(data-sec); position: absolute; inset: 0; display: grid; place-items: center; border-radius: 50%; background: rgba(6,9,18,.42); font: 14px var(--display); color: #fff; text-shadow: 0 2px 0 var(--edge); }
.hd-right { display: flex; align-items: center; gap: 8px; }
#soundBtn { flex: none; width: 40px; height: 40px; padding: 0; display: grid; place-items: center; border-radius: 12px; border: 2px solid var(--edge); background: linear-gradient(180deg, #28325c, #1b2242); box-shadow: inset 0 0 0 1px #3d4a7a, 0 3px 0 rgba(0,0,0,.4); cursor: pointer; }
#soundBtn .bf-t, #soundBtn .bf-bar, #soundBtn .bf-n { display: none; }
#soundBtn .bf-ic { background: none; box-shadow: none; width: auto; height: auto; }
.mon-name.golden { color: #ffd54a; text-shadow: 0 2px 0 var(--edge), 0 0 10px rgba(255,213,74,.6); }
.task.week .qbar > i { background-color: var(--gold); }
'''
rep('/* 입력칸 */', css + '/* 입력칸 */')
open(P, 'w', encoding='utf-8').write(s); print('ok', len(s))
