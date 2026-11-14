# v49 영웅서기5 불러오기 모듈을 v48까지 들어간 빌드에 넣기 (build_v46.py에도 같은 내용 추가)
# python3 inject49.py pwa48.html pwa/index.html hl5_v49.js hl5x.wasm
import sys, base64
src, dst, js, wasm = sys.argv[1:5]
s = open(src, encoding='utf-8').read()
part = open(js, encoding='utf-8').read()
assert part.count('"__HL5X_WASM_B64__"') == 1
part = part.replace('__HL5X_WASM_B64__', base64.b64encode(open(wasm, 'rb').read()).decode())
CSS = '.hl5-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 6px 0 12px; } .hl5-pick { cursor: pointer; display: inline-flex; align-items: center; }\n'
i = s.index('</style>'); s = s[:i] + CSS + s[i:]
mk = '/* 화면 글자 레이어: 스킬 이름 띠 · 무한 루프 화면 지직거림 */'
assert s.count(mk) == 1
s = s.replace(mk, part + '\n' + mk)
open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s))
