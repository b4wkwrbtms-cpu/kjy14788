"""v41: 말씀 읽기 한 번에(읽기 시작 → 본문 바로 · 자동 체크) · 공부/말씀 시간 겹침 막기
   · 감사팀 직무가 다시 열면 사라지던 버그 · 오프라인 정산에서 잠깐 효과 빼기 (patch_v40 다음에)
   출근 버스는 그대로 (사용자 2026-10-11 13:22: "그런 거면 그냥 두자")"""
import sys
P = 'yageun-knight.html'
s = open(P, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: print('COUNT MISMATCH', n, cnt, '::', old[:160]); sys.exit(1)
    s = s.replace(old, new)

rep('var GAME_V = 40;', 'var GAME_V = 41;')
rep('if (localStorage.getItem(SAVE_KEY + "-feel40")) return;\n    localStorage.setItem(SAVE_KEY + "-feel40", "1");',
    'if (localStorage.getItem(SAVE_KEY + "-feel41")) return;\n    localStorage.setItem(SAVE_KEY + "-feel41", "1");')
rep('celebrateLater({ ic: "weapon", title: "무기 색 = 스킬 색 · 전직 공격", sub: "무기 모양을 바꾸면 직무 스킬과 기본 공격 이펙트가 그 무기 색으로 바뀌어요<br>영업(전사)은 전직 공격으로 싸워요: 솟구치는 검기 · 지면 강타 · 관통 검기", tone: "gold", ms: 5400, keep: 1 });',
    'celebrateLater({ ic: "bible", title: "말씀 읽기가 한 번에", sub: "\'읽기 시작\'을 누르면 본문이 바로 열리고 시간이 세져요 · 끝까지 읽으면 저절로 체크<br>말씀 읽는 동안 공부 시간은 잠깐 멈추고, 다 읽으면 다시 켜져요", tone: "gold", ms: 5400, keep: 1 });')
rep('/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */',
    open('part_v41.js', encoding='utf-8').read() + '\n/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */')
# 읽기 타이머 카드: 한 번 누르면 본문이 열리고 시간이 셈
rep('  $("rtBtn").addEventListener("click", () => { readTimerToggle(); updateUI(true); save(); });',
    '  $("rtBtn").addEventListener("click", () => { if (S.bible.timer) readTimerToggle(); else readStartNow(); updateUI(true); save(); });')
rep('    $("rtSub").textContent = `오늘 ${Math.floor(readSecToday() / 60)}분 읽음 · 1분에 만나 1 (하루 ${READ_MIN_CAP}분까지) · 종이 성경도 이 시간으로 확인돼요`;',
    '    $("rtSub").textContent = `오늘 ${Math.floor(readSecToday() / 60)}분 읽음 · 누르면 본문이 열리고 바로 시간이 세져요 · 본문을 닫으면 기록 · 종이 성경도 본문을 열어 둔 채 읽으면 돼요`;')
# 감사팀 직무가 다시 열 때 지워지던 버그 (v37에서 다섯째 직무를 넣고 불러오기 목록을 안 고쳤음)
rep('  s.jobs = Array.isArray(d.jobs) ? d.jobs.filter((x, i, a) => ["sales", "dev", "plan", "hr"].indexOf(x) >= 0 && a.indexOf(x) === i).slice(0, 4) : [];',
    '  s.jobs = Array.isArray(d.jobs) ? d.jobs.filter((x, i, a) => ["sales", "dev", "plan", "hr", "audit"].indexOf(x) >= 0 && a.indexOf(x) === i).slice(0, 5) : [];')
open(P, 'w', encoding='utf-8').write(s)
print('patch_v41 ok', len(s))
