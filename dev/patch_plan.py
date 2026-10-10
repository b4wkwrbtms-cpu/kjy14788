"""말씀 읽기 플랜 패치 (patch_att 다음에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:120]); sys.exit(1)
    s = s.replace(old, new)
rep('</style>', open('css_plan.css', encoding='utf-8').read() + '</style>', 1)
rep('    ach: {}, att: { log: {}, best: 0, mk: {}, ms: {} }, away: null, t: Date.now(),',
    '    ach: {}, att: { log: {}, best: 0, mk: {}, ms: {} }, away: null, plan: null, planFin: 0, planHist: [], t: Date.now(),')
rep('  s.att = attMerge(d.att); if (!d.att) attBackfill(s);',
    '  s.att = attMerge(d.att); if (!d.att) attBackfill(s);\n  s.plan = planMerge(d.plan); s.planFin = +d.planFin || 0; s.planHist = Array.isArray(d.planHist) ? d.planHist.slice(-12) : [];')
# 읽기 체크 ↔ 플랜
rep('    const e = B.today[idx]; B.today.splice(idx, 1);', '    const e = B.today[idx]; B.today.splice(idx, 1);\n    if (e.plan) planOnUndo(b, c);')
rep('  B.today.push(entry); B.total++; S.day.chap++; if (S.week) S.week.chap++;', '  B.today.push(entry); B.total++; S.day.chap++; if (S.week) S.week.chap++;\n  planOnRead(b, c, entry);')
# 리더: 플랜에서 열면 '다음 장'이 플랜 순서
rep('''function openReader(b, c) {
  rollDay();
  if (!rd) { rd = { autoTimer: false }; if (!S.bible.timer) { S.bible.timer = Date.now(); rd.autoTimer = true; } }''', '''function openReader(b, c, plan) {
  rollDay();
  if (!rd) { rd = { autoTimer: false }; if (!S.bible.timer) { S.bible.timer = Date.now(); rd.autoTimer = true; } }
  if (plan !== undefined) rd.plan = !!plan;''')
rep('  let b = rd.b, c = rd.c + dir;', '  if (rd.plan) { const nx = planStep(rd.b, rd.c, dir); if (nx) { openReader(nx[0], nx[1]); return; } }\n  let b = rd.b, c = rd.c + dir;')
rep('$("rdSub").textContent = "개역한글" + (done ?', '$("rdSub").textContent = "개역한글" + (rd.plan ? planReaderTag(b, c) : "") + (done ?')
# 말씀 탭 맨 위에 플랜 카드
rep('/* ---------- 말씀 탭 ---------- */', open('part_plan.js', encoding='utf-8').read() + '\n/* ---------- 말씀 탭 ---------- */')
rep('''(() => {
  const sum = el("div", "card");''', '''(() => {
  buildPlanCard();
  const sum = el("div", "card");''')
rep('else if (id === "bible") any = S.bible.today.length === 0;', 'else if (id === "bible") any = S.bible.today.length === 0 || planTodayLeft() > 0;')
rep('  if (backReady && (attWatch !== dayKey() || backWant)) { attWatch = dayKey(); backWant = false; backMaybeOpen(); }',
    '  if (backReady && (attWatch !== dayKey() || backWant)) { attWatch = dayKey(); backWant = false; backMaybeOpen(); }\n  planDailyCheck();')
# 업적·정보
rep('''  { id: "att", n: "출근 누적", unit: "일", tiers: [7, 30, 100, 200, 365], rw: i => ({ manna: 100 * (i + 1), stamp: 5 * (i + 1) }) },''',
    '''  { id: "att", n: "출근 누적", unit: "일", tiers: [7, 30, 100, 200, 365], rw: i => ({ manna: 100 * (i + 1), stamp: 5 * (i + 1) }) },
  { id: "planf", n: "읽기 플랜 완주", unit: "번", tiers: [1, 2, 3, 5, 10], rw: i => ({ ame: 5 * (i + 1), stamp: 30 * (i + 1) }) },''')
rep('const val = () => a.id === "att" ? attTotal() :', 'const val = () => a.id === "planf" ? (S.planFin || 0) : a.id === "att" ? attTotal() :')
rep('["출근 누적", `${attTotal()}일 · 연속 ${attStreak()}`],', '["출근 누적", `${attTotal()}일 · 연속 ${attStreak()}`], ["읽기 플랜", planShort()],')
# 백업을 불러온 뒤에도 출근 카드 확인
rep('    toast(`기록을 불러왔어요. ${S.floor}층부터 이어서!`);', '    toast(`기록을 불러왔어요. ${S.floor}층부터 이어서!`); setTimeout(backMaybeOpen, 900);')
open(P, 'w', encoding='utf-8').write(s)
print('plan patched', len(s))
