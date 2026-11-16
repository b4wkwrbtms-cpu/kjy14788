# v51(자료 자동 받기·새 버전 자동 적용)을 넣기: python3 inject51.py src.html dst.html packsync_v51.js
import sys
src, dst, js = sys.argv[1:4]
s = open(src, encoding='utf-8').read()
mk = '/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */'
assert s.count(mk) == 1
s = s.replace(mk, open(js, encoding='utf-8').read() + '\n' + mk)
s = s.replace('navigator.serviceWorker.register("sw.js")', 'navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })')
open(dst, 'w', encoding='utf-8').write(s); print('ok', len(s))
