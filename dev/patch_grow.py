"""v29 고도화 2단계: 성장 길잡이 (patch_habit 다음에)
목표 사다리·다음 목표 한 줄, 퇴사 권장 게이지·빠른 출근, 자리 비운 동안 12시간, 탭 차례로 열기·안내 다시 보기, 이번 주 경제"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('</style>', open('css_grow.css', encoding='utf-8').read() + '</style>', 1)
# 메인 화면: 다음 목표 한 줄 (지갑 아래, 메뉴 위)
rep('  <section class="stage" aria-label="전투 화면">',
    '  <button type="button" class="goal-strip" id="goalStrip" data-go="daily" aria-label="다음 목표"><span class="gs-k" id="gsK">오늘</span><span class="gs-t" id="gsT"></span><span class="gs-v num" id="gsV"></span><span class="gs-go" aria-hidden="true">›</span></button>\n  <section class="stage" aria-label="전투 화면">')
rep('  info: ["인사 기록·내 기록·도감·백업",', '  info: ["인사 기록·경제·도감·설정·백업",')
# 코드 조각 (습관 지키기 다음, 탭 앞)
rep('/* ===================== 탭 ===================== */',
    open('part_grow.js', encoding='utf-8').read() + '\n/* ===================== 탭 ===================== */')
# 저장값
rep('t: Date.now(), habit: null, fx: { shake: 1, flash: 1 },', 't: Date.now(), habit: null, fx: { shake: 1, flash: 1 }, eco: null, tabSeen: null,')
rep('  s.habit = habitMerge(d.habit, s); s.fx = fxMerge(d.fx);', '  s.habit = habitMerge(d.habit, s); s.fx = fxMerge(d.fx);\n  s.eco = ecoMerge(d.eco); s.tabSeen = tabSeenMerge(d.tabSeen, s);')
# 자리 비운 동안 12시간, 정산서에 늘 표시
rep('var OFF_CAP = 8 * 3600, BACK_MIN = 300;', 'var OFF_CAP = 12 * 3600, BACK_MIN = 300;')
rep(': run && a.cap ? `<p class="slip-note">전투는 자리 비운 뒤 8시간까지만 계산돼요</p>` : "");',
    ': run ? `<p class="slip-note">${a.cap ? `${OFF_CAP / 3600}시간이 넘어서 ${OFF_CAP / 3600}시간까지만 계산했어요` : `자리 비운 동안은 ${OFF_CAP / 3600}시간까지 일해요`}</p>` : "");')
# 퇴사: 빠른 출근
rep('''  S.stamp += gain; S.retires++;
  Object.assign(S, { gold: 0, floor: 1, k: 1, maxFloor: 1, auto: true, wi: 0, wl: 1, coffee: 0, promo: !!promo });''', '''  S.stamp += gain; S.retires++;
  const prevMax = S.maxFloor;
  Object.assign(S, { gold: 0, floor: 1, k: 1, maxFloor: 1, auto: true, wi: 0, wl: 1, coffee: 0, promo: !!promo });
  const qc = quickCommute(prevMax);''')
rep('sub: (promo ? `다음 퇴사까지 월급과 피해 4배<br>` : `${S.retires + 1}번째 회사 1층부터 다시<br>`) + `<span class="rws">',
    'sub: (promo ? `다음 퇴사까지 월급과 피해 4배<br>` : "") + (qc ? `출근 버스로 ${qc.f}층까지 바로 · ${WEAPONS[S.wi].n} +${S.wl}<br>` : `${S.retires + 1}번째 회사 1층부터 다시<br>`) + `<span class="rws">')
# 퇴사 탭: 게이지
rep('  card.innerHTML = `<div class="sec-title" style="margin:0">퇴사 (환생)</div><p class="muted" id="rBody"></p>',
    '  card.innerHTML = `<div class="sec-title" style="margin:0">퇴사 (환생)</div><div id="rGauge"></div><p class="muted" id="rBody"></p>')
rep('유지: 만나, 도장, 광석, 광물, 동료, 정장, 부적, 보물, 곡괭이, 전설무기 해금, 말씀·공부 기록</p>',
    '유지: 만나, 도장, 광석, 광물, 동료, 정장, 부적, 보물, 곡괭이, 전설무기 해금, 말씀·공부 기록<br>빠른 출근: ${QC_MIN}층 넘게 올랐다면 다음 회사는 최고층의 ${Math.round(QC_FRAC * 100)}%까지 출근 버스로 바로 올라가요</p>')
rep('    $("rBtn").disabled = g <= 0; $("rPromo").disabled = g <= 0 || S.manna < 300;',
    '    const rgh = retireGaugeHTML(), rgb = $("rGauge"); if (rgb && rgb._h !== rgh) { rgb._h = rgh; rgb.innerHTML = rgh; }\n    $("rBtn").disabled = g <= 0; $("rPromo").disabled = g <= 0 || S.manna < 300;')
rep('    if (id === "retire") any = retireGain() > 0;', '    if (id === "retire") any = retireRatio() >= 0.5;')
rep('  retire: ["사표 내고 더 강해져서 다시", () => `<span>${ri("stamp")}${fmtR(S.stamp)}</span>`],',
    '  retire: ["사표 내고 더 강해져서 다시", () => `<span>${ri("stamp")}${fmtR(S.stamp)}</span>` + (retireGain() > 0 ? `<span>퇴사 +${Math.round(retireRatio() * 100)}%</span>` : "")],')
# 업무 탭 맨 위: 다음 목표 / 정보 탭: 이번 주 경제 · 안내 다시 보기
rep('''  buildAttCard();
  buildHabitCard();''', '''  buildLadderCard(); buildGoalStrip();
  buildAttCard();
  buildHabitCard();''')
rep('  buildFxCard();\n  secTitle("info", "기록 백업"', '  buildEcoCard();\n  buildGuideCard();\n  buildFxCard();\n  secTitle("info", "기록 백업"')
# 화면 갱신 · 시작 탭
rep('  planDailyCheck(); careerTick(); proofSweep(); celebFlush();', '  planDailyCheck(); careerTick(); proofSweep(); celebFlush(); growTick();')
rep('  if (!panels[tab]) tab = "weapon";', '  if (!panels[tab] || !tabOpen(tab)) tab = "weapon";')
open(P, 'w', encoding='utf-8').write(s)
print('patch_grow ok', len(s))
