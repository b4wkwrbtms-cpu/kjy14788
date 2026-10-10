"""v28 고도화 1단계: 습관·동기 기반 (patch_career 다음에)
연속 지키기(보호권·48시간 회복·안식 모드·주일 공부 쉼), 최소 행동, 이번 주 말씀 n일, 누적 먼저,
말씀 확인(읽은 시간), 예고 없는 선물, 묵상 노트, 화면 설정, 번쩍임 안전, 자율 지지 문구"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)
def rep_between(start, end, new):
    """start 로 시작해서 end 로 끝나는(포함) 구간을 바꿈"""
    global s
    if s.count(start) != 1: print('START MISMATCH', s.count(start), '::', start[:120]); sys.exit(1)
    i = s.index(start); j = s.find(end, i)
    if j < 0: print('END NOT FOUND ::', end[:120]); sys.exit(1)
    s = s[:i] + new + s[j + len(end):]

# ---------- CSS · 마크업 · 코드 조각 ----------
rep('</style>', open('css_habit.css', encoding='utf-8').read() + '</style>', 1)
rep('    <div class="back-att" id="backAtt" hidden></div>',
    '    <div class="back-att" id="backAtt" hidden></div>\n    <div class="back-hab" id="backHab" hidden></div>')
rep('/* ===================== 탭 ===================== */',
    open('part_habit.js', encoding='utf-8').read() + '\n/* ===================== 탭 ===================== */')

# ---------- 저장값 ----------
rep('    bible: { read: {}, total: 0, rounds: 0, streak: 0, best: 0, last: "", today: [], rewarded: 0, minToday: 0, timer: 0, note: "", noteDay: "" },',
    '    bible: { read: {}, total: 0, rounds: 0, streak: 0, best: 0, last: "", today: [], rewarded: 0, minToday: 0, timer: 0, note: "", noteDay: "", rsec: 0, pused: 0, cpm: 1000, notes: [], rec: null, sPrev: null },')
rep('    study: { running: false, lastConfirm: 0, sessionMs: 0, subject: "", today: 0, depth: 0, streak: 0, best: 0, last: "", total: 0, log: [], beeped: false },',
    '    study: { running: false, lastConfirm: 0, sessionMs: 0, subject: "", today: 0, depth: 0, streak: 0, best: 0, last: "", total: 0, log: [], beeped: false, rec: null, sPrev: null },')
rep('    mem: { sets: 1, setDay: "", v: {}, streak: 0, best: 0, last: "", total: 0 },',
    '    mem: { sets: 1, setDay: "", v: {}, streak: 0, best: 0, last: "", total: 0, rec: null, sPrev: null },')
rep('    ach: {}, att: { log: {}, best: 0, mk: {}, ms: {} }, away: null, plan: null, planFin: 0, planHist: [], t: Date.now(),',
    '    ach: {}, att: { log: {}, best: 0, mk: {}, ms: {} }, away: null, plan: null, planFin: 0, planHist: [], t: Date.now(), habit: null, fx: { shake: 1, flash: 1 },')
rep('''  s.job = s.jobs.indexOf(d.job) >= 0 ? d.job : (s.jobs[0] || "");
  return s;''', '''  s.job = s.jobs.indexOf(d.job) >= 0 ? d.job : (s.jobs[0] || "");
  hbMigrateBible(s.bible);
  if (!s.bible.notes.length && s.bible.note && s.bible.noteDay) s.bible.notes.push({ d: s.bible.noteDay, t: s.bible.note });
  HB_KINDS.forEach(k => { const X = s[k]; if (X && X.rec && !(X.rec.d && X.rec.until && X.rec.need)) X.rec = null; });
  s.habit = habitMerge(d.habit, s); s.fx = fxMerge(d.fx);
  return s;''')

# ---------- 하루 넘김 · 켤 때 · 서버/백업 불러올 때 ----------
rep('''    S.study.today = 0; S.study.depth = 0; S.study.log = [];
    return true;''', '''    S.study.today = 0; S.study.depth = 0; S.study.log = []; S.bible.rsec = 0; S.bible.pused = 0;
    habitGuard();
    return true;''')
rep('  rollDay(); refreshCostumes(false);', '  rollDay(); habitGuard(); refreshCostumes(false);')
rep('celebrate({ ic: "bible", title: "오늘 말씀 완료!"', 'celebrateLater({ ic: "bible", title: "오늘 말씀 완료!"')
rep('if (t < 1) celebrate({ ic: "trophy", title: `플랜', 'if (t < 1) celebrateLater({ ic: "trophy", title: `플랜')
rep('celebrate({ ic: "bible", title: "통독 완주!"', 'celebrateLater({ ic: "bible", title: "통독 완주!"')
rep('''  awaySettle(data.t || Date.now(), true);
  mode = "tower";''', '''  awaySettle(data.t || Date.now(), true); habitGuard();
  mode = "tower";''')
rep('pending.t = Date.now(); S = merge(pending); pending = null;', 'pending.t = Date.now(); S = merge(pending); pending = null; habitGuard();')

# ---------- 말씀: 읽은 시간으로 확인 ----------
rep_between('function toggleChapter(b, c) {', '\nfunction readTimerToggle() {', '''function toggleChapter(b, c) {
  rollDay();
  const B = S.bible;
  const idx = B.today.findIndex(e => e.b === b && e.c === c);
  if (idx >= 0) {
    const e = B.today[idx]; B.today.splice(idx, 1);
    if (e.plan) planOnUndo(b, c);
    if (e.newRead) setBit(b, c, false);
    if (e.pf) chapUnproof(e);
    toast(`${BOOKS[b][0]} ${c + 1}장 체크를 취소했어요`);
    return;
  }
  const newRead = bits(b)[c] !== "1";
  if (newRead) setBit(b, c, true);
  // 확인(만나·도장·연속·누적)은 오늘 읽은 시간이 이 장의 최소 시간까지 쌓였을 때
  const entry = { b, c, newRead, rw: null, pf: 0, need: needSec(b, c) };
  B.today.push(entry);
  proofSweep();
  if (!entry.pf) toast(`${BOOKS[b][0]} ${c + 1}장 기록 · ${hbSecTxt(pendLeft(entry))} 더 읽으면 확인돼요`);
  if (roundCount() >= TOTAL_CH) {
    B.rounds++; B.read = {}; S.stamp += 100; S.manna += 500;
    celebrateLater({ ic: "bible", title: `성경 ${B.rounds}독 완료!`, sub: `<span class="rws">${rwHTML({ stamp: 100, manna: 500 })}</span>`, tone: "manna", ms: 3200 });
  }
}
function readTimerToggle() {''')
rep('  const min = Math.floor((Date.now() - B.timer) / 60000); B.timer = 0;',
    '  const min = Math.floor((Date.now() - B.timer) / 60000); B.rsec = (+B.rsec || 0) + Math.max(0, Math.min(6 * 3600, (Date.now() - B.timer) / 1000)); B.timer = 0;')
rep('''  if (first) { S.day.med = 1; const m = Math.round(20 * readMult()); S.manna += m; toast(`오늘의 묵상을 남겼어요 · 만나 +${m}`); }
  else toast("묵상을 고쳤어요");''', '''  if (first) { S.day.med = 1; const m = Math.round(30 * readMult()); S.manna += m; S.stamp += 2; toast(`오늘의 묵상을 남겼어요 · 만나 +${m}, 도장 +2`); graceGift("med"); }
  else toast("묵상을 고쳤어요");
  noteLog(text);''')
# planAfterChange 들여쓰기 확인 후 바꿈
if s.count('  if (!st.over && st.today.length && !st.tLeft && S.day && !S.day.plan) {') == 1:
    rep('  if (!st.over && st.today.length && !st.tLeft && S.day && !S.day.plan) {',
        '  if (!st.over && st.today.length && !st.tLeft && S.day && !S.day.plan && planProofOK()) {')
else:
    print('planAfterChange anchor missing'); sys.exit(1)

# 본문 화면
rep('const readEnough = () => !!(rd && rd.verses && rd.verses.length && rd.bottom && (Date.now() - rd.t0) / 1000 >= rd.min);',
    'const readEnough = () => !!(rd && rd.verses && rd.verses.length && rd.bottom && rdLeft() <= 0);')
rep('const left = Math.max(0, Math.ceil(rd.min - (Date.now() - rd.t0) / 1000));', 'const left = Math.max(0, Math.ceil(rdLeft()));', 2)
rep('  if (isToday(rd.b, rd.c)) txt = "오늘 읽음 ✓";', '  if (isToday(rd.b, rd.c)) txt = rdPendTxt();')
rep('txt = !rd.bottom ? "끝까지 읽어 주세요" :', 'txt = !rd.bottom ? "끝까지 읽으면 체크돼요" :')
rep('''<button class="btn manna" data-r="done" ${done ? "disabled" : ""}>${done ? "오늘 읽음으로 체크됨 ✓" : "이 장 다 읽음 ✓"}</button>''',
    '''<button class="btn manna${done && !rdPf(b, c) ? " pend" : ""}" data-r="done" ${done ? "disabled" : ""}>${done ? (rdPf(b, c) ? "오늘 읽음으로 체크됨 ✓" : "기록됨 · 읽은 시간이 쌓이면 ✓") : "이 장 다 읽음 ✓"}</button>''')
rep('(done ? " · 오늘 읽음 ✓" : before ? " · 이번 통독에서 읽은 장" : "")', '(done ? (rdPf(b, c) ? " · 오늘 읽음 ✓" : " · 기록됨") : before ? " · 이번 통독에서 읽은 장" : "")')
rep('  toggleChapter(rd.b, rd.c); save(); return true;', '  rdSpeedNote(); toggleChapter(rd.b, rd.c); save(); return true;')
rep('`${left}초만 더 읽으면 체크돼요 · 한 번 더 누르면 체크 없이 넘어가요`', '`${hbSecTxt(left)}만 더 읽으면 체크돼요 · 한 번 더 누르면 체크 없이 넘어가요`')
rep('`${left}초 뒤 넘기면 체크`', '`${hbSecTxt(left)} 뒤 넘기면 체크`')
# 장 버튼: 기록만 남은 장은 점선
rep('S.bible.today.map(e => e.b + ":" + e.c).join(",")', 'S.bible.today.map(e => e.b + ":" + e.c + (e.pf ? "" : "p")).join(",")')
rep('const btn = el("button", today ? "today" : s[c] === "1" ? "read" : "", String(c + 1));',
    'const btn = el("button", today ? (rdPf(bibleBook, c) ? "today" : "today pend") : s[c] === "1" ? "read" : "", String(c + 1));')
rep('초록색은 오늘 읽은 장, 파란색은 이번 통독에서 이미 읽은 장.', '초록색은 오늘 읽은 장, 점선은 읽은 시간이 쌓이면 확인될 장, 파란색은 이번 통독에서 이미 읽은 장.')

# 말씀 탭: 이번 주 말씀 카드 + 누적 먼저
rep('''(() => {
  buildPlanCard();''', '''(() => {
  buildHabitWeek();
  buildPlanCard();''')
rep_between('''  sum.innerHTML = `<div class="stat-grid">
    <div class="stat"><span>오늘 읽은 장</span>''', '''보상 받은 장 오늘 ${B.rewarded}/${READ_CAP}`;''', '''  sum.innerHTML = `<div class="stat-grid">
    <div class="stat big"><span>누적</span><b class="num" id="bTotal"></b></div>
    <div class="stat"><span>오늘 읽은 장</span><b class="num" id="bToday"></b></div>
    <div class="stat"><span>말씀 연속</span><b class="num" id="bStreak"></b></div></div>
    <div><div class="muted num" id="bRound"></div><div class="prog"><i id="bRoundBar"></i></div></div>
    <p class="muted">읽은 장마다 만나와 도장이 쌓여요(하루 ${READ_CAP}장까지, 그다음은 기록으로). 이어 읽은 날이 늘수록 커져서 지금 <b class="c-manna" id="bMult"></b>배. 말씀은 읽은 시간으로 확인돼요: 너무 빨리 넘긴 장은 기록만 남고, 읽은 시간이 쌓이면 저절로 확인돼요.</p>`;
  addCustom("bible", sum, () => {
    const B = S.bible, pend = B.today.filter(e => !e.pf).length;
    $("bTotal").textContent = `${B.total}장`;
    $("bToday").textContent = `${S.day.chap || 0}장` + (pend ? ` +${pend}` : "");
    $("bStreak").textContent = `${readStreak()}일`;
    $("bMult").textContent = readMult().toFixed(1);
    const rc = roundCount();
    $("bRound").textContent = `${B.rounds + 1}독 진행 ${rc} / ${TOTAL_CH}장 · 오늘 선물 받은 장 ${B.rewarded}/${READ_CAP}`;''')
rep('    $("rtSub").textContent = `오늘 ${B.minToday}분 · 1분에 만나 1 (하루 ${READ_MIN_CAP}분까지)`;',
    '    $("rtSub").textContent = `오늘 ${Math.floor(readSecToday() / 60)}분 읽음 · 1분에 만나 1 (하루 ${READ_MIN_CAP}분까지) · 종이 성경도 이 시간으로 확인돼요`;')
# 묵상 노트
rep('<div class="sec-title" style="margin:0">오늘의 묵상 한 줄 <small>하루 한 번 만나 20</small></div>',
    '<div class="sec-title" style="margin:0">오늘의 묵상 한 줄 <small>하루 한 번 만나 30 · 도장 2</small></div>')
rep('''    <div class="row-btns"><button class="btn manna" id="noteBtn">저장</button><span class="muted" id="noteState" style="align-self:center"></span></div>`;''',
    '''    <div class="row-btns"><button class="btn manna" id="noteBtn">저장</button><span class="muted" id="noteState" style="align-self:center"></span></div>
    <details class="note-hist" id="noteHist" hidden><summary>지난 묵상 보기</summary><ul id="noteList"></ul></details>`;''')
rep('''    if (document.activeElement !== $("noteTxt") && !$("noteTxt").dataset.touched) $("noteTxt").value = done ? S.bible.note : "";''',
    '''    if (document.activeElement !== $("noteTxt") && !$("noteTxt").dataset.touched) $("noteTxt").value = done ? S.bible.note : "";
    renderNoteHist();''')

# ---------- 공부 · 암송: 최소 행동, 회복, 선물, 누적 먼저 ----------
rep("  if (before < 25 && St.today >= 25 && St.last !== dayKey()) { St.streak = (St.last === yesterdayKey() ? St.streak : 0) + 1; St.last = dayKey(); St.best = Math.max(St.best, St.streak); toast(`공부 연속 ${St.streak}일째!`); }",
    '''  habitRecAdd("study", ms / 60000);
  if (St.today >= HB_MIN.study && habitTouch("study")) toast(`공부 연속 ${St.streak}일째!`);
  if (Math.floor(before / 25) < Math.floor(St.today / 25)) graceGift("study");''')
rep('  if (S.mem.last !== dayKey()) { S.mem.streak = (S.mem.last === yesterdayKey() ? S.mem.streak : 0) + 1; S.mem.last = dayKey(); S.mem.best = Math.max(S.mem.best, S.mem.streak); }',
    '''  habitRecAdd("mem", 1);
  if (S.mem.last !== dayKey() && (S.day.mem >= HB_MIN.mem || !memQueue().length)) habitTouch("mem");
  if (S.day.mem % 5 === 0) graceGift("mem");''')
rep('<div class="stat-grid"><div class="stat"><span>오늘 공부</span><b class="num" id="mToday"></b></div><div class="stat"><span>공부 연속</span><b class="num" id="mStreak"></b></div><div class="stat"><span>누적</span><b class="num" id="mTotal"></b></div></div>',
    '<div class="stat-grid"><div class="stat big"><span>누적</span><b class="num" id="mTotal"></b></div><div class="stat"><span>오늘 공부</span><b class="num" id="mToday"></b></div><div class="stat"><span>공부 연속</span><b class="num" id="mStreak"></b></div></div>\n    <div class="hk-note" id="mRec" hidden></div>')
rep('하루 ${STUDY_CAP}분까지, 25분 이상 공부한 날이 이어지면 연속 보너스.', '하루 ${STUDY_CAP}분까지, 10분 이상 공부한 날이 이어지면 연속 보너스(주일은 쉬어 가요).')
rep('    $("mTotal").textContent = `${(St.total / 60).toFixed(1)}시간`;', '    $("mTotal").textContent = `${(St.total / 60).toFixed(1)}시간`; hbNoteInto("mRec", "study");')
rep('''    <div class="stat"><span>오늘 볼 구절</span><b class="num" id="mQ"></b></div>
    <div class="stat"><span>암송 완료</span><b class="num c-manna" id="mM"></b></div>
    <div class="stat"><span>암송 연속</span><b class="num" id="mS"></b></div></div>''', '''    <div class="stat big"><span>외운 구절</span><b class="num" id="mM"></b></div>
    <div class="stat"><span>오늘 볼 구절</span><b class="num" id="mQ"></b></div>
    <div class="stat"><span>암송 연속</span><b class="num" id="mS"></b></div></div>
    <div class="hk-note" id="mmRec" hidden></div>''')
rep('$("mS").textContent = `${memStreak()}일`;', '$("mS").textContent = `${memStreak()}일`; hbNoteInto("mmRec", "mem");')

# ---------- 탭 머리띠 ----------
rep('  bible: ["말씀 읽고 만나·도장 받기",', '  bible: ["말씀 읽고 묵상 남기기",')
rep('  mem: ["200구절 암송, 반복할수록 큰 보상",', '  mem: ["200구절을 간격 반복으로 마음에 새기기",')
rep('  daily: ["출근부·일일 업무·문서고·업적", () => `<span>${ri("cal")}연속 ${attStreak()}일</span>`],',
    '  daily: ["출근부·연속 지키기·일일 업무·업적", () => `<span>${ri("cal")}출근 ${attTotal()}일</span><span>${ri("shield")}${habitState().sh}</span>`],')

# ---------- 업무 탭: 연속 지키기 + 주간 목표(말씀 n일) ----------
rep('''  buildAttCard();
  secTitle("daily", "일일 업무", "매일 자정에 새로 시작");''', '''  buildAttCard();
  buildHabitCard();
  secTitle("daily", "일일 업무", "매일 자정에 새로 시작");''')
rep_between('const WEEKLY = [', '];\nconst WEEK_ALL', '''const WEEKLY = [
  { id: "bdays", get n() { return `말씀 ${wGoal()}일 읽기`; }, get goal() { return wGoal(); }, val: () => weekBibleN(), f: v => `${Math.floor(v)}일`, rw: { stamp: 10, haste: 2 } },
  { id: "study", get n() { return `공부 ${wkHours()}시간`; }, get goal() { return wkScale(300); }, val: () => S.week.study, f: v => `${(v / 60).toFixed(1)}시간`, get fg() { return `${wkHours()}시간`; }, rw: { ore: 600, silver: 3 } },
  { id: "mem", get n() { return `암송 ${wkScale(40)}구절 통과`; }, get goal() { return wkScale(40); }, val: () => S.week.mem, f: v => `${Math.floor(v)}구절`, rw: { manna: 150, ame: 2 } },
];
const WEEK_ALL''')
rep('''        rollWeek();
        const v = Math.min(w.goal, w.val()), done = !!S.week.claimed[w.id];''', '''        rollWeek(); const tn = row.querySelector(".t-name"); if (tn && tn.textContent !== w.n) tn.textContent = w.n;
        const v = Math.min(w.goal, w.val()), done = !!S.week.claimed[w.id];''')
rep('        qb.style.width = (done ? 100 : v / w.goal * 100) + "%";', '        qb.style.width = (done || !w.goal ? 100 : v / w.goal * 100) + "%";')
rep('celebrate({ ic: "daily", title: "오늘 업무 끝!", sub: `<span class="rws">',
    'celebrate({ ic: "daily", title: "오늘은 여기까지!", sub: `할 일을 다 했어요 · 남은 시간은 곽준영이 알아서 일해요<br><span class="rws">')

# ---------- 출근부: 보호권·안식으로 지킨 날 ----------
rep('''const seal = r.a ? `<i class="seal${r.a === 2 ? " mk" : ""}">${r.a === 2 ? "지각" : "출근"}</i>` : "";''',
    '''const seal = r.a ? `<i class="seal${r.a === 2 ? " mk" : r.a === 3 ? " sh" : r.a === 4 ? " rs" : ""}">${r.a === 2 ? "지각" : r.a === 3 ? "보호" : r.a === 4 ? "안식" : "출근"}</i>` : "";''')
rep('${r.a === 1 ? " 출근" : r.a === 2 ? " 지각" : ""}', '${r.a === 1 ? " 출근" : r.a === 2 ? " 지각" : r.a === 3 ? " 보호권으로 지킴" : r.a === 4 ? " 안식" : ""}')
rep(''': r.a === 2 ? `<span class="ci-st mk">지각</span>` : isT ? `<span class="ci-st todo">도장 전</span>` : sel > dayKey() ? `<span class="ci-st off">예정</span>` : `<span class="ci-st off">결근</span>`;''',
    ''': r.a === 2 ? `<span class="ci-st mk">지각</span>` : r.a === 3 ? `<span class="ci-st sh">보호권</span>` : r.a === 4 ? `<span class="ci-st rs">안식</span>` : isT ? `<span class="ci-st todo">도장 전</span>` : sel > dayKey() ? `<span class="ci-st off">예정</span>` : `<span class="ci-st off">쉰 날</span>`;''')
rep('${got ? "받음" : ym !== cur ? "못 받음" : `${Math.max(0, t - n)}일 남음`}', '${got ? "받음" : ym !== cur ? "지난 달" : `${Math.max(0, t - n)}일 남음`}')
# 복귀 카드
rep('  if (att) { if (need) { att.hidden = false; att.innerHTML = backAttHTML(k); } else att.hidden = true; }',
    '  if (att) { if (need) { att.hidden = false; att.innerHTML = backAttHTML(k); } else att.hidden = true; }\n  backHabRender();')
rep('  if (wantAtt) res = attStamp();', '  if (wantAtt) res = attStamp();\n  if (S.habit) S.habit.news = [];')

# ---------- 화면 갱신 ----------
rep('  planDailyCheck(); careerTick();', '  planDailyCheck(); careerTick(); proofSweep(); celebFlush();')
rep('    else if (id === "bible") any = S.bible.today.length === 0 || planTodayLeft() > 0;', '    else if (id === "bible") any = (S.day.chap || 0) === 0 || planTodayLeft() > 0;')

# ---------- 정보 탭: 화면 설정 ----------
rep('  secTitle("info", "기록 백업", "다른 기기나 앱으로 옮길 때");', '  buildFxCard();\n  secTitle("info", "기록 백업", "다른 기기나 앱으로 옮길 때");')

# ---------- 연출 안전: 번쩍임·흔들림 ----------
rep_between('function drawScreenFlash() {', '  ctx.fillRect(0, 0, UW, UH);\n}', 'function drawScreenFlash() { hbDrawFlash(); }')
rep('''  if (t < 55) {
    ctx.globalCompositeOperation = "saturation"; ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, UW, UH);
    ctx.globalCompositeOperation = "difference"; ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, UW, UH);
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.globalAlpha = t < 55 ? 0.92 : Math.max(0, 0.9 * (1 - (t - 55) / 50)); ctx.fillStyle = t < 55 ? "#000000" : "#ffffff";''',
    '''  ctx.globalAlpha = (t < 55 ? 0.6 : Math.max(0, 0.55 * (1 - (t - 55) / 50))) * flashK(); ctx.fillStyle = t < 55 ? "#1b1206" : "#fff4dc";''')
rep('    ctx.beginPath(); ctx.moveTo(ix + Math.cos(a0) * 40, iy + Math.sin(a0) * 40);\n    ctx.lineTo(ix + Math.cos(a0 - w) * 520, iy + Math.sin(a0 - w) * 520); ctx.lineTo(ix + Math.cos(a0 + w) * 520, iy + Math.sin(a0 + w) * 520); ctx.closePath(); ctx.fill();',
    '    ctx.beginPath(); ctx.moveTo(ix + Math.cos(a0) * 34, iy + Math.sin(a0) * 34);\n    ctx.lineTo(ix + Math.cos(a0 - w) * 130, iy + Math.sin(a0 - w) * 130); ctx.lineTo(ix + Math.cos(a0 + w) * 130, iy + Math.sin(a0 + w) * 130); ctx.closePath(); ctx.fill();')
rep('  if (reduceMotion) return; const now = performance.now();\n  if (!force && now - lastImpactF < 900) return; lastImpactF = now;',
    '  if (reduceMotion || flashK() <= 0) return; const now = performance.now();\n  if (!force && now - lastImpactF < 900) return; lastImpactF = now;')
rep('''  const a = (0.3 - r) / 0.3 * (0.5 + 0.5 * Math.sin(t / 140));
  const gr = ctx.createRadialGradient(UW / 2, UH / 2, 90, UW / 2, UH / 2, 260);
  gr.addColorStop(0, "rgba(255,30,30,0)"); gr.addColorStop(1, `rgba(255,30,30,${0.55 * a})`);''', '''  const a = (0.3 - r) / 0.3 * (flashK() < 1 ? 0.6 : 0.7 + 0.3 * Math.sin(t / 300));
  const gr = ctx.createRadialGradient(UW / 2, UH / 2, 110, UW / 2, UH / 2, 270);
  gr.addColorStop(0, "rgba(120,24,24,0)"); gr.addColorStop(1, `rgba(120,24,24,${0.32 * a})`);''')
rep('  if (shakeAmt > 0.3) { bgShx = (Math.random() - .5) * shakeAmt * 2; bgShy = (Math.random() - .5) * shakeAmt * 1.4; } else { bgShx = 0; bgShy = 0; }',
    '  const shk = shakeK();\n  if (shakeAmt > 0.3 && shk > 0) { bgShx = (Math.random() - .5) * shakeAmt * 2 * shk; bgShy = (Math.random() - .5) * shakeAmt * 1.4 * shk; } else { bgShx = 0; bgShy = 0; }')
rep('  const z = cam.z * (1 + (reduceMotion ? 0 : cam.kick * 0.04)),', '  const z = cam.z * (1 + cam.kick * 0.04 * shakeK()),')

# ---------- 자율 지지 문구 ----------
rep('toast("시간 초과! 아래층에서 무기를 키우고 다시 도전하세요");', 'toast("시간 초과! 한 층 아래에서 무기를 키우면 다시 도전할 수 있어요");')
rep('    toast("집중 확인이 없어서 25분까지만 기록하고 멈췄어요");', '    toast("25분 공부를 기록하고 잠시 멈췄어요 · 이어서 하려면 다시 시작을 눌러요");')
rep('10분 안에 안 누르면 25분까지만 기록돼요.', '10분 안에 누르면 이어서 기록되고, 누르지 않으면 25분까지 기록하고 쉬어요.')
rep('${res.pass ? "연습 통과" : "연습 실패"}', '${res.pass ? "연습 통과" : "한 번 더 연습"}')
rep('<b>아쉬워요</b> 이 구절을 통과해야 다음 구절로 넘어갈 수 있어요', '<b>거의 다 왔어요</b> 이 구절을 통과하면 다음 구절이 열려요')
rep('정보 탭 맨 위에서 승진하세요', '정보 탭 맨 위에서 승진할 수 있어요')

open(P, 'w', encoding='utf-8').write(s)
print('patch_habit ok', len(s))
