"""v31 고도화 4단계: 결제 대체 장치 (patch_ward 다음에)
첫걸음 꾸러미 · 절기 순례(패스·토큰·상점) · 시간의 두루마리 · 묵상 2배 · 달란트 항아리 · 첫 완독·첫 암송 2배 · 성경 66권 도감"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('</style>', open('css_fest.css', encoding='utf-8').read() + '</style>', 1)
# 코드 조각 (성장 길잡이 다음, 탭 앞)
rep('/* ===================== 탭 ===================== */',
    open('part_fest.js', encoding='utf-8').read() + '\n/* ===================== 탭 ===================== */')
# 저장값
rep('eco: null, tabSeen: null, ward: wardNew(),', 'eco: null, tabSeen: null, ward: wardNew(), fest: festNew(), jar: jarNew(), scroll: scrollNew(), dbl: dblNew(), firsts: firstsNew(),')
rep('  s.ward = wardMerge(d.ward, d);\n  return s;', '  s.ward = wardMerge(d.ward, d);\n  payMerge(s, d);\n  return s;')
# 달란트 항아리: 보스 월급의 12% (자리 비운 동안 포함)
rep('    S.gold += reward; S.bossKills++; S.day.boss++;', '    S.gold += reward; S.bossKills++; S.day.boss++; jarAdd(reward);')
rep('    r = simulateOffline(sec); if (r && r.gold) r.gold *= careerAway();', '    r = simulateOffline(sec); if (r && r.gold) r.gold *= careerAway(); if (r && r.gold > 0) jarAdd(r.gold);')
# 시간의 두루마리: 집중 25분마다
rep('  if (Math.floor(before / 25) < Math.floor(St.today / 25)) graceGift("study");',
    '  if (Math.floor(before / 25) < Math.floor(St.today / 25)) { scrollEarn(Math.floor(St.today / 25) - Math.floor(before / 25)); graceGift("study"); }')
# 첫 암송 2배 · 항아리
rep('  const s = r.s, rw = memReward(s);\n  S.manna += rw.manna;', '  const s = r.s, rw = memReward(s), first = memFirstX2(r, rw);\n  S.manna += rw.manna;')
rep('  S.mem.total++; S.day.mem = (S.day.mem || 0) + 1; if (S.week) S.week.mem = (S.week.mem || 0) + 1;\n  habitRecAdd("mem", 1);',
    '  S.mem.total++; S.day.mem = (S.day.mem || 0) + 1; if (S.week) S.week.mem = (S.week.mem || 0) + 1; jarOnMem();\n  habitRecAdd("mem", 1);')
rep('  let bonus = "";\n  if (r.s === MEM_MASTER)', '  let bonus = first ? " · 첫 통과 2배" : "";\n  if (r.s === MEM_MASTER)')
rep('<b>반복해서 통과할수록 보상이 커져요</b>', '<b>반복해서 통과할수록 보상이 커져요</b>, 새 구절 첫 통과는 2배')
# 첫 완독: 읽은 시간으로 확인된 장이 그 권의 마지막이면 · 1독 끝날 때
rep('  planOnRead(e.b, e.c, e);\n  graceGift("bible");\n}', '  planOnRead(e.b, e.c, e);\n  graceGift("bible");\n  bookCheck(e.b);\n}')
rep('    B.rounds++; B.read = {}; S.stamp += 100; S.manna += 500;', '    bookRoundSweep(); B.rounds++; B.read = {}; S.stamp += 100; S.manna += 500;')
# 묵상 2배: 정산서 · 오늘 업무 모두 완료
rep('  let gold = 0, gift = null, res = null;\n  if (a) { gold = a.gold || 0; S.gold += gold; gift = giftOf(a.miss || 0); if (gift) grant(gift); S.away = null; }',
    '  let gold = 0, gift = null, res = null, dbl = false;\n  if (a) { gold = a.gold || 0; S.gold += gold; gift = giftOf(a.miss || 0); if (gift) grant(gift); S.away = null; dbl = dblAdd("back", gold, gift); }')
rep('afterClaim(gold, gift, res);', 'afterClaim(gold, gift, res, dbl);')
rep('function afterClaim(gold, gift, res) {', 'function afterClaim(gold, gift, res, dbl) {')
rep('  if (parts.length) toast((res ? "출근 완료! " : "정산 완료! ") + parts.join(" · "));',
    '  if (dbl) parts.push("말씀 1장·암송 5구절·묵상 한 줄이면 한 번 더 (묵상 2배)");\n  if (parts.length) toast((res ? "출근 완료! " : "정산 완료! ") + parts.join(" · "));')
rep('S.day.claimed.all = 1; grant({ haste: 1, gold2: 1, rage: 1, manna: 20 }); celebrate({ ic: "daily", title: "오늘은 여기까지!", sub: `할 일을 다 했어요 · 남은 시간은 곽준영이 알아서 일해요<br>',
    'S.day.claimed.all = 1; grant({ haste: 1, gold2: 1, rage: 1, manna: 20 }); const dbl = dblAdd("daily", 0, { haste: 1, gold2: 1, rage: 1, manna: 20 }); celebrate({ ic: "daily", title: "오늘은 여기까지!", sub: `할 일을 다 했어요 · 남은 시간은 곽준영이 알아서 일해요<br>${dbl ? "말씀 1장 · 암송 5구절 · 묵상 한 줄이면 한 번 더 받아요 (묵상 2배)<br>" : ""}')
# 업무 탭: 첫걸음 꾸러미 · 묵상 2배 (맨 위) · 절기 순례 (연속 지키기 다음)
rep('''  buildLadderCard(); buildGoalStrip();
  buildAttCard();
  buildHabitCard();''', '''  buildStartCard(); buildDblCard();
  buildLadderCard(); buildGoalStrip();
  buildAttCard();
  buildHabitCard();
  buildFestCard();''')
# 말씀 탭: 66권 도감 (권 목록 다음) · 공부 탭: 두루마리 · 암송 탭: 항아리
rep('  const note = el("div", "card");', '  buildDexCard();\n  const note = el("div", "card");')
rep('  $("stStop").addEventListener("click", () => { studyStop(); updateUI(true); save(); });',
    '  $("stStop").addEventListener("click", () => { studyStop(); updateUI(true); save(); });\n  buildScrollCard();')
rep('  addCustom("mem", box, () => { if (!memSess) box.hidden = true; });', '  addCustom("mem", box, () => { if (!memSess) box.hidden = true; });\n  buildJarCard();')
# 화면 갱신 · 탭 점 · 다음 목표
rep('  planDailyCheck(); careerTick(); proofSweep(); celebFlush(); growTick();', '  planDailyCheck(); careerTick(); proofSweep(); celebFlush(); growTick(); festTick();')
rep('    else if (id === "mem") any = memQueue().length > 0;', '    else if (id === "mem") any = memQueue().length > 0 || jarReady();')
rep('  return rows;\n}\n/* 메인 화면 한 줄', '  festLadder(rows);\n  return rows;\n}\n/* 메인 화면 한 줄')
# 안내·문구
rep('${GR_GUIDE.map(([n, d]) =>', '${GR_GUIDE.concat(FEST_GUIDE).map(([n, d]) =>')
rep('  daily: "다음 목표, 출근부, 연속 지키기, 일일 업무, 주간 목표, 업적이 모여 있어요.",',
    '  daily: "다음 목표, 출근부, 연속 지키기, 절기 순례, 일일 업무, 주간 목표, 업적이 모여 있어요. 첫걸음 꾸러미와 묵상 2배도 여기서 받아요.",')
rep('  daily: ["출근부·연속 지키기·일일 업무·업적",', '  daily: ["출근부·절기 순례·일일 업무·업적",')
rep('mkColl("옷장", "세트 14 · 무기 이펙트 · 오라 · 칭호")', 'mkColl("옷장", "세트 16 · 무기 이펙트 · 오라 · 칭호")')
rep('곡괭이, 전설무기 해금, 말씀·공부 기록<br>빠른 출근:', '곡괭이, 전설무기 해금, 말씀·공부 기록, 달란트 항아리·두루마리<br>빠른 출근:')
open(P, 'w', encoding='utf-8').write(s)
print('patch_fest ok', len(s))
