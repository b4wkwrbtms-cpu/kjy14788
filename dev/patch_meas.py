"""v32 고도화 5단계: 측정 (patch_fest 다음에)
말씀 상태판 · 월간 청지기 점검 · 보상 끄기 주간 · 실행 의도와 웹 푸시"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('</style>', open('css_meas.css', encoding='utf-8').read() + '</style>', 1)
rep('/* ===================== 탭 ===================== */',
    open('part_meas.js', encoding='utf-8').read() + '\n/* ===================== 탭 ===================== */')
# 저장값
rep('firsts: firstsNew(),', 'firsts: firstsNew(), met: metNew(), stew: stewNew(), roff: roffNew(), ii: iiNew(),')
rep('  payMerge(s, d);\n', '  payMerge(s, d);\n  measMerge(s, d);\n')
# 매 틱 · 날 바뀜
rep('growTick(); festTick();', 'growTick(); festTick(); measTick();')
rep('if (S.day && S.day.key) attArchive(S.day);', 'if (S.day && S.day.key) { attArchive(S.day); measArchive(S.day); }')

# ---- 말씀: 처음 읽은 시각 · 보상 끄기 · 외적 보상 비중 ----
rep('  B.total++; S.day.chap++; if (S.week) S.week.chap++;\n', '  B.total++; S.day.chap++; if (S.week) S.week.chap++; measRead();\n')
rep('  if (B.rewarded < READ_CAP) { const m = Math.round(10 * readMult()); e.rw = { manna: m, stamp: 1 };',
    '  if (roffOn()) msg += " · 보상 끄기 주간이라 기록만 남겨요";\n  else if (B.rewarded < READ_CAP) { const m = Math.max(1, Math.round(10 * readMult() * devWgt())); e.rw = { manna: m, stamp: 1 };')
rep('function graceGift(k) {\n', 'function graceGift(k) {\n  if (roffOn()) return null;\n')
rep('  if (first) { S.day.med = 1; const m = Math.round(30 * readMult()); S.manna += m; S.stamp += 2; toast(`오늘의 묵상을 남겼어요 · 만나 +${m}, 도장 +2`); graceGift("med"); }',
    '  if (first) { S.day.med = 1; if (roffOn()) toast("오늘의 묵상을 남겼어요 · 보상 끄기 주간이라 기록만"); else { const m = Math.max(1, Math.round(30 * readMult() * devWgt())); S.manna += m; S.stamp += 2; toast(`오늘의 묵상을 남겼어요 · 만나 +${m}, 도장 +2`); graceGift("med"); } }')
rep('  const m = Math.round(got * readMult()); S.manna += m;\n  toast(min < 1 ? "1분 이상 읽어야 기록돼요" : `${min}분 읽었어요 · 만나 +${m}`);',
    '  const off = roffOn(), m = off ? 0 : Math.round(got * readMult() * devWgt()); S.manna += m;\n  if (min >= 1) measRead(Date.now() - min * 60000);\n  toast(min < 1 ? "1분 이상 읽어야 기록돼요" : off ? `${min}분 읽었어요 · 보상 끄기 주간이라 기록만` : `${min}분 읽었어요 · 만나 +${m}`);')
# 1독 완료: 한 번뿐인 보상은 보관
rep('    bookRoundSweep(); B.rounds++; B.read = {}; S.stamp += 100; S.manna += 500;',
    '    bookRoundSweep(); B.rounds++; B.read = {}; if (roffOn()) roffEsc({ stamp: 100, manna: 500 }); else { S.stamp += 100; S.manna += 500; }')
rep('sub: `<span class="rws">${rwHTML({ stamp: 100, manna: 500 })}</span>`, tone: "manna", ms: 3200 });',
    'sub: `<span class="rws">${rwHTML({ stamp: 100, manna: 500 })}</span>${roffOn() ? "<br>보상 끄기 주간이라 주가 끝나면 받아요" : ""}`, tone: "manna", ms: 3200 });')
# 읽기 플랜: 날마다 보상은 끄고(되돌릴 때 빼지 않게 2로), 이정표는 보관
rep('    const drw = planDayRw(); S.day.plan = 1; grant(drw);', '    const off = roffOn(), drw = off ? {} : planDayRw(); S.day.plan = off ? 2 : 1; grant(drw);')
rep('플랜 연속 ${P.streak}일<br><span class="rws">${rwHTML(drw)}</span>`',
    '플랜 연속 ${P.streak}일<br>${off ? "보상 끄기 주간 · 기록만 남겨요" : `<span class="rws">${rwHTML(drw)}</span>`}`')
rep('    else toast(`오늘 말씀은 이미 읽어 두었어요 · ${rwText(drw).replace(/ (\\d+)/g, " +$1")}`);',
    '    else toast(off ? "오늘 말씀은 이미 읽어 두었어요 · 보상 끄기 주간이라 기록만" : `오늘 말씀은 이미 읽어 두었어요 · ${rwText(drw).replace(/ (\\d+)/g, " +$1")}`);')
rep('    P.got |= 1 << i; const r = planScale(rw, st.total, planHard()); grant(r);',
    '    P.got |= 1 << i; const r = planScale(rw, st.total, planHard()); if (roffOn()) roffEsc(r); else grant(r);')
rep('${st.done}/${st.total}장<br><span class="rws">${rwHTML(r)}</span>`',
    '${st.done}/${st.total}장<br><span class="rws">${rwHTML(r)}</span>${roffOn() ? "<br>보상 끄기 주간이라 주가 끝나면 받아요" : ""}`')
rep('<span class="rws">${rwHTML(planScale(PLAN_MILES[4][1], st.total, planHard()))}</span>`',
    '<span class="rws">${rwHTML(planScale(PLAN_MILES[4][1], st.total, planHard()))}</span>${roffOn() ? "<br>보상 끄기 주간이라 주가 끝나면 받아요" : ""}`')
rep('    const drw = planDayRw(); S.day.plan = 0;', '    const drw = S.day.plan === 2 ? { manna: 0, stamp: 0 } : planDayRw(); S.day.plan = 0;')

# ---- 암송: 첫 시도 유지율 · 보상 끄기(첫 통과 보너스·완료 보너스는 보관) ----
rep('  const s = r.s, rw = memReward(s), first = memFirstX2(r, rw);\n  S.manna += rw.manna; S.stamp += rw.stamp; S.gold += rw.gold;',
    '''  const s = r.s, rw = memReward(s), first = memFirstX2(r, rw), off = roffOn();
  measMem(v.no, r, true);
  if (off) { if (first) roffEsc({ manna: rw.manna / 2, stamp: rw.stamp / 2, gold: rw.gold / 2 }); rw.manna = 0; rw.stamp = 0; rw.gold = 0; }
  else if (devWgt() < 1) rw.manna = Math.max(1, Math.round(rw.manna * devWgt()));
  S.manna += rw.manna; S.stamp += rw.stamp; S.gold += rw.gold;''')
rep('''  let bonus = first ? " · 첫 통과 2배" : "";
  if (r.s === MEM_MASTER) { S.stamp += 10; bonus = " · 암송 완료 보너스 도장 10"; }
  return { rw, bonus, from: s, to: r.s };''',
    '''  let bonus = first ? (off ? " · 첫 통과 보너스는 주가 끝나면" : " · 첫 통과 2배") : "";
  if (r.s === MEM_MASTER) { if (off) { roffEsc({ stamp: 10 }); bonus = " · 암송 완료 보너스 도장 10은 주가 끝나면"; } else { S.stamp += 10; bonus = " · 암송 완료 보너스 도장 10"; } }
  return { rw, bonus, from: s, to: r.s, off };''')
rep('  if (r.failDay !== dayKey()) { r.s = Math.max(0, r.s - 1); r.failDay = dayKey(); }',
    '  measMem(v.no, r, false);\n  if (r.failDay !== dayKey()) { r.s = Math.max(0, r.s - 1); r.failDay = dayKey(); }')
rep('<span>만나 +${res.rw.manna}${res.rw.stamp ? ` · 도장 +${res.rw.stamp}` : ""} · 월급 +${fmt(res.rw.gold)}원${res.bonus}</span>',
    '${res.off ? `<span>보상 끄기 주간 · 기록만 남겨요${res.bonus}</span>` : `<span>만나 +${res.rw.manna}${res.rw.stamp ? ` · 도장 +${res.rw.stamp}` : ""} · 월급 +${fmt(res.rw.gold)}원${res.bonus}</span>`}')
rep('say(`${v.ref} 통과! 월급 보너스 들어왔다!`, 3);', 'say(r.off ? `${v.ref} 통과!` : `${v.ref} 통과! 월급 보너스 들어왔다!`, 3);')

# ---- 공부: 집중 완주율 · 광석 보상 끄기·비중 ----
rep('  if (nd > St.depth) {\n    const om = oreMult(); ore = Math.round(ore * om);',
    '  if (nd > St.depth && roffOn()) St.depth = nd;\n  if (nd > St.depth) {\n    const om = oreMult() * devWgt(); ore = Math.round(ore * om);')
rep('  addStudy(since); St.sessionMs += since; St.lastConfirm', '  measFocus(since, false); addStudy(since); St.sessionMs += since; St.lastConfirm')
rep('  addStudy(since); St.sessionMs += since; St.running = false;', '  measFocus(since, true); addStudy(since); St.sessionMs += since; St.running = false;')
rep('    addStudy(CONFIRM_MS); St.sessionMs += CONFIRM_MS; St.running = false;', '    measFocus(CONFIRM_MS, true); addStudy(CONFIRM_MS); St.sessionMs += CONFIRM_MS; St.running = false;')

# ---- 일일 업무(말씀·묵상·공부·암송만) · 주간 목표 · 업적(말씀·공부·암송·플랜만): 보상 끄기 주간에는 받기 쉼 ----
rep('if (S.day.claimed[d.id] || (S.day[d.stat] || 0) < d.goal) return;', 'if (S.day.claimed[d.id] || (S.day[d.stat] || 0) < d.goal || roffDaily(d)) return;')
rep('      ready: () => !S.day.claimed[d.id] && (S.day[d.stat] || 0) >= d.goal,', '      ready: () => !S.day.claimed[d.id] && (S.day[d.stat] || 0) >= d.goal && !roffDaily(d),')
rep('btn.disabled = done || v < d.goal; btn.textContent = done ? "받음" : v >= d.goal ? "받기" : "진행 중";',
    'const off = roffDaily(d); btn.disabled = done || v < d.goal || off; btn.textContent = done ? "받음" : off ? "보상 쉼" : v >= d.goal ? "받기" : "진행 중";')
rep('if (S.week.claimed[w.id] || w.val() < w.goal) return;', 'if (S.week.claimed[w.id] || w.val() < w.goal || roffOn()) return;')
rep('      ready: () => !!(S.week && !S.week.claimed[w.id] && w.val() >= w.goal),', '      ready: () => !roffOn() && !!(S.week && !S.week.claimed[w.id] && w.val() >= w.goal),')
rep('btn.disabled = done || v < w.goal; btn.textContent = done ? "받음" : v >= w.goal ? "받기" : "진행 중";',
    'const off = roffOn(); btn.disabled = done || v < w.goal || off; btn.textContent = done ? "받음" : off ? "보상 쉼" : v >= w.goal ? "받기" : "진행 중";')
rep('if (i >= a.tiers.length || val() < a.tiers[i]) return;', 'if (i >= a.tiers.length || val() < a.tiers[i] || roffAch(a)) return;')
rep('      ready: () => { const i = S.ach[a.id] || 0; return i < a.tiers.length && val() >= a.tiers[i]; },',
    '      ready: () => { const i = S.ach[a.id] || 0; return !roffAch(a) && i < a.tiers.length && val() >= a.tiers[i]; },')
rep('btn.disabled = done || v < a.tiers[i]; btn.textContent = done ? "완료" : v >= a.tiers[i] ? "받기" : `${i}/${a.tiers.length}`;',
    'const off = roffAch(a); btn.disabled = done || v < a.tiers[i] || off; btn.textContent = done ? "완료" : v >= a.tiers[i] ? (off ? "주 끝나면" : "받기") : `${i}/${a.tiers.length}`;')

# ---- 퇴사 게이지 기록 · 다음 목표 · 알림으로 열기 · 로그아웃 ----
rep('  if (promo && S.manna < 300) return;\n  if (promo) S.manna -= 300;', '  if (promo && S.manna < 300) return;\n  measRetire();\n  if (promo) S.manna -= 300;')
rep('  festLadder(rows);\n', '  festLadder(rows); measLadder(rows);\n')
rep('  spawn(); selectTab(tab);', '  spawn(); selectTab(tab); notiGo();')
rep('async function cloudLogout() {\n  const a = acctGet(); if (!a) return;\n',
    'async function cloudLogout() {\n  const a = acctGet(); if (!a) return;\n  try { if (iiState().push) await notiOff(true); } catch (e) {}\n')
# ---- 카드 자리: 정보 탭(프로필 아래) · 말씀 탭(읽기 플랜 아래) ----
rep('  const mkColl = (title, sub) => {', '  buildMeasCards();\n  const mkColl = (title, sub) => {')
rep('  buildPlanCard();\n', '  buildPlanCard();\n  buildIICard();\n')
# ---- 축하 대기열: 꼭 보여 줄 축하(keep)는 밀려나지 않게 ----
rep('celebQ.push(o); if (celebQ.length > 3) celebQ.splice(0, celebQ.length - 3);',
    'celebQ.push(o); while (celebQ.length > 3) { const i = celebQ.findIndex(x => !x.keep); celebQ.splice(i >= 0 ? i : 0, 1); }')
rep('function celebrateLater(o) { const H = habitState(); H.cq = (H.cq || []).concat([o]).slice(-4); celebFlush(); }',
    'function celebrateLater(o) { const H = habitState(); H.cq = (H.cq || []).concat([o]); while (H.cq.length > 4) { const i = H.cq.findIndex(x => !x.keep); H.cq.splice(i >= 0 ? i : 0, 1); } celebFlush(); }')
# ---- 안내·문구 ----
rep('GR_GUIDE.concat(FEST_GUIDE)', 'GR_GUIDE.concat(FEST_GUIDE).concat(MEAS_GUIDE)')
rep('  info: ["인사 기록·경제·도감·설정·백업",', '  info: ["인사 기록·말씀 상태판·경제·도감·백업",')
rep('  info: "인사 기록과 내 기록, 이번 주 경제, 도감, 화면 설정, 백업이 있어요.",',
    '  info: "인사 기록과 내 기록, 말씀 상태판(지표·월간 점검·보상 끄기 주간), 이번 주 경제, 도감, 화면 설정, 백업이 있어요.",')
rep('  bible: "개역한글 본문을 읽고 묵상 한 줄을 남겨요. 읽은 장마다 만나와 도장이 쌓이고, 읽은 시간으로 확인돼요.",',
    '  bible: "개역한글 본문을 읽고 묵상 한 줄을 남겨요. 읽은 장마다 만나와 도장이 쌓이고, 읽은 시간으로 확인돼요. 읽을 때와 곳을 정해 두면 그 시각에 알림도 받을 수 있어요.",')
open(P, 'w', encoding='utf-8').write(s)
print('patch_meas ok', len(s))
