#!/usr/bin/env python3
"""절 보기: python3 tqv.py 책번호 장 절 [끝절]  → 개역한글 / 원어(개역 절 번호에 맞춤, 기본형) / 지금 본문(⏎=줄바꿈)"""
import json, sys
sys.path.insert(0, '/home/claude/renewal/tools')
import rev_chunks as rc
R = '/home/claude/renewal'
b, c, v = map(int, sys.argv[1:4]); v2 = int(sys.argv[4]) if len(sys.argv) > 4 else v
krv = json.load(open(f'{R}/app/bible/krv/{b:02d}.json'))
M = rc.omap(b, krv)
mz = json.load(open(f'{R}/bout46/{b:02d}/{c:03d}.json'))['v']
for n in range(v, v2 + 1):
    print(f'== {b} {c}:{n}')
    print('개역한글:', krv[c - 1][n - 1] if n - 1 < len(krv[c - 1]) else '(없음)')
    o = M.get((c, n))
    if o:
        ws = rc.ochap(b, o[0]).get(str(o[1])) or []
        print(f'원어({"히브리어/아람어" if b <= 39 else "헬라어"}, 원어 절 {o[0]}:{o[1]}):', ' '.join(w[0].replace('/', '') for w in ws))
        print('  기본형·형태:', ' | '.join(f'{w[1]} {w[2]}' for w in ws))
    print('지금:', mz[n - 1].replace('\n', '⏎'))
