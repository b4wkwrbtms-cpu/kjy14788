"""복귀 정산 · 출근부 패치 (v60_conv 위에)"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:120]); sys.exit(1)
    s = s.replace(old, new)

# CSS
rep('</style>', open('css_att.css', encoding='utf-8').read() + '</style>', 1)
# 팝업 자리
rep('<div id="reader" class="reader" hidden role="dialog" aria-label="성경 읽기">', '''<div id="back" class="back" hidden role="dialog" aria-modal="true" aria-labelledby="backT">
  <div class="back-card">
    <div class="back-hd"><span class="back-pf" id="backPf"></span><div class="back-tt"><b id="backT"></b><small id="backS"></small></div></div>
    <div class="slip" id="backSlip" hidden></div>
    <div class="back-att" id="backAtt" hidden></div>
    <button class="buy back-go" id="backGo" type="button"></button>
    <button class="back-link" id="backLogin" type="button" hidden>예전 기록이 있다면 · 아이디로 로그인</button>
  </div>
  <div class="celeb-fx" id="backFx"></div>
</div>
<div id="reader" class="reader" hidden role="dialog" aria-label="성경 읽기">''')
# 달력 아이콘
CAL = '''  cal: { m: ["...W......W...", ".rrWrrrrrrWrr.", ".rrrrrrrrrrrr.", ".RRRRRRRRRRRR.", ".wwwwwwwwwwww.", ".wlwlwlwlwlww.", ".wwwwwwwwwwww.", ".wlwlwlwSSwww.", ".wwwwwwSssSww.", ".wlwlwlSssSww.", ".wwwwwwwSSwww.", ".wlwlwlwlwlww.", ".wwwwwwwwwwww.", ".bbbbbbbbbbbb."], p: {"W": "#c9d2e6", "r": "#e0403d", "R": "#a82a28", "w": "#f4f6fb", "l": "#b9c1d6", "S": "#e0403d", "s": "#ff8a7a", "b": "#8d97b6"} },
'''
rep('  info: { m: [".....rrrr.....",', CAL + '  info: { m: [".....rrrr.....",')
rep('"daily", "info", "retire"];', '"daily", "info", "retire", "cal"];')
# 저장값
rep('    ach: {}, t: Date.now(),', '    ach: {}, att: { log: {}, best: 0, mk: {}, ms: {} }, away: null, t: Date.now(),')
rep('''  if (!S.day || S.day.key !== k) {
    S.day = newDay();''', '''  if (!S.day || S.day.key !== k) {
    if (S.day && S.day.key) attArchive(S.day);
    S.day = newDay();''')
rep('''  s.legUnlock = freshState().legUnlock.map((v, i) => !!(d.legUnlock && d.legUnlock[i]));
  return s;''', '''  s.legUnlock = freshState().legUnlock.map((v, i) => !!(d.legUnlock && d.legUnlock[i]));
  s.att = attMerge(d.att); if (!d.att) attBackfill(s);
  if (s.away && typeof s.away !== "object") s.away = null;
  return s;''')
# 일일 업무의 '출석 체크'는 출근부 도장으로 옮김
rep('  { id: "att", n: "출석 체크", stat: "att", goal: 1, rw: { manna: 10 } },\n', '')
# 업적: 출근 누적
rep('''  { id: "retire", n: "퇴사 횟수", unit: "회", tiers: [1, 3, 5, 10, 20, 50], rw: i => ({ stamp: 10 * (i + 1) }) },''',
    '''  { id: "retire", n: "퇴사 횟수", unit: "회", tiers: [1, 3, 5, 10, 20, 50], rw: i => ({ stamp: 10 * (i + 1) }) },
  { id: "att", n: "출근 누적", unit: "일", tiers: [7, 30, 100, 200, 365], rw: i => ({ manna: 100 * (i + 1), stamp: 5 * (i + 1) }) },''')
rep('const val = () => a.id === "floor" ? S.bestFloor :', 'const val = () => a.id === "att" ? attTotal() : a.id === "floor" ? S.bestFloor :')
# 오프라인 계산: 보스 벽에 막혔는지 알려 줌
rep('const st = stats(); const dps = st.dps; let gold = 0, floors = 0, bosses = 0;', 'const st = stats(); const dps = st.dps; let gold = 0, floors = 0, bosses = 0, wall = false;')
rep('f = g; k = 1; S.auto = false; sec = 0; break;', 'f = g; k = 1; S.auto = false; sec = 0; wall = true; break;')
rep('return { gold, floors, bosses, f, k };', 'return { gold, floors, bosses, f, k, wall };')
# 전투 화면 큰 도장: 윗글씨 바꿀 수 있게, 카메라 당김 끄기
rep('ctx.fillText(s.kind >= 3 ? "드래곤 퇴치" : "칼퇴 승인", 0, -R * 0.52);', 'ctx.fillText(s.top || (s.kind >= 3 ? "드래곤 퇴치" : "칼퇴 승인"), 0, -R * 0.52);')
rep('else if (stampFx && stampFx.kind >= 2 && stampFx.t < 950)', 'else if (stampFx && stampFx.kind >= 2 && !stampFx.nocam && stampFx.t < 950)')
# 탭 머리띠
rep('  daily: ["일일 업무·지하 문서고·업적", () => ""],', '  daily: ["출근부·일일 업무·문서고·업적", () => `<span>${ri("cal")}연속 ${attStreak()}일</span>`],')
# 코드 넣기 + 업무 탭 맨 위에 출근부
rep('''/* ---------- 업무 탭 ---------- */
(() => {
  secTitle("daily", "일일 업무", "매일 자정에 새로 시작");''', open('part_att.js', encoding='utf-8').read() + '''
/* ---------- 업무 탭 ---------- */
(() => {
  buildAttCard();
  secTitle("daily", "일일 업무", "매일 자정에 새로 시작");''')
# 정보 탭 기록
rep('["황금 몹", (S.goldenKills || 0) + "마리"],', '["황금 몹", (S.goldenKills || 0) + "마리"], ["출근 누적", `${attTotal()}일 · 연속 ${attStreak()}`],')
# 하루가 바뀌면 (켜 둔 채 자정이 지나도) 출근 카드
rep('''function updateUI(force) {
  rollDay();''', '''function updateUI(force) {
  rollDay();
  if (backReady && (attWatch !== dayKey() || backWant)) { attWatch = dayKey(); backWant = false; backMaybeOpen(); }''')
# 팝업이 떠 있는 동안 알림은 닫힌 뒤로
rep('function toast(msg) { const t = $("toast");', 'function toast(msg) { if (backOn) { backToast = msg; return; } const t = $("toast");')
# 다시 켤 때: 정산서로
rep('''    if (TIME_LIMIT[bossKind(S.floor, S.k)]) S.k = 1;
    const sec = Math.min((Date.now() - (d.t || Date.now())) / 1000, 8 * 3600);
    if (sec > 60) {
      const r = simulateOffline(sec);
      if (r.gold > 0 || r.floors > 0) {
        S.gold += r.gold; if (r.f) { S.floor = r.f; S.k = r.k; } S.maxFloor = Math.max(S.maxFloor, S.floor); S.bestFloor = Math.max(S.bestFloor, S.floor);
        setTimeout(() => toast(`자리 비운 ${Math.floor(sec / 60)}분 동안 ${r.floors}층 올라가고 보스 ${r.bosses}마리, ${fmt(r.gold)}원`), 500);
      }
    }
  } catch (e) {}''', '''    if (TIME_LIMIT[bossKind(S.floor, S.k)]) S.k = 1;
    awaySettle(d.t || Date.now(), true);
  } catch (e) {}''')
# 다른 앱 갔다 올 때도 정산
rep('document.addEventListener("visibilitychange", () => { if (document.hidden) save(); else { studyTick(); updateUI(true); } });',
    'document.addEventListener("visibilitychange", () => { if (document.hidden) { hiddenAt = Date.now(); save(); } else { studyTick(); onResume(); updateUI(true); } });')
rep('''  requestAnimationFrame(t => { last = t; requestAnimationFrame(frame); });
}''', '''  requestAnimationFrame(t => { last = t; requestAnimationFrame(frame); });
  backReady = true; attWatch = dayKey(); setTimeout(backMaybeOpen, 350);
}''')
open(P, 'w', encoding='utf-8').write(s)
print('patched ok', len(s))
