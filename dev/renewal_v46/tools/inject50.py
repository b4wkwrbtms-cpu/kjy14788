# v50 켈러 몰입 읽기 모듈을 v49까지 들어간 빌드에 넣기:  python3 inject50.py src.html dst.html keller_v50.js keller_v50.css
import sys
src, dst, js, css = sys.argv[1:5]
s = open(src, encoding='utf-8').read()
i = s.index('</style>'); s = s[:i] + open(css, encoding='utf-8').read() + s[i:]
mk = '/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */'
assert s.count(mk) == 1
s = s.replace(mk, open(js, encoding='utf-8').read() + '\n' + mk)
open(dst, 'w', encoding='utf-8').write(s); print('ok', len(s))
