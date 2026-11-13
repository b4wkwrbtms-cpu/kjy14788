# v48 연출 레이어를 지금 빌드(app/index.html)에 넣기 — build_v46.py에 같은 두 줄을 더해 다음 빌드부터는 자동
# python3 inject48.py base.html out/index.html
import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
def rep(old, new, cnt=1):
    global s
    n = s.count(old); assert n == cnt, (n, old[:120]); s = s.replace(old, new)
# 처치하면 몸이 픽셀 조각으로 부서지므로, 부서진 몸(mon.shat)은 원래 그림을 빨리 지움
rep('const so = { flip: true, pretty }, baseA = (1 - mon.dying * 0.85) * eo.a;',
    'const so = { flip: true, pretty }, baseA = (1 - mon.dying * 0.85) * eo.a * (mon.shat ? Math.max(0, 1 - mon.dying * 5) : 1);   // v48 부서진 몸')
CSS = '.fx48-t { font-weight: 700; margin: 0 0 8px; } .fx48-t small { font-weight: 400; color: var(--muted); margin-left: 6px; font-size: 12px; }\n'
i = s.index('</style>'); s = s[:i] + CSS + s[i:]
mk = '/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */'
assert s.count(mk) == 1
s = s.replace(mk, open('combat_v48.js', encoding='utf-8').read() + '\n' + mk)
open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s))
