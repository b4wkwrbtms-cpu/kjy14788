# 이어 하기: 아직 안 쓴 장을 원래 묶음(bplan.json)대로 모아 작업자 지시문을 만든다.
# python3 bresume.py          → 남은 묶음 목록
# python3 bresume.py ID       → 그 묶음의 짧은 지시문 (Agent에 그대로 넣기)
import json, os, sys
import bprompt
S = bprompt.S
plan = json.load(open(f'{S}/bplan.json', encoding='utf-8'))
def left(p): return [i for i in p['items'] if not os.path.exists(f"{S}/bout/{i[0]:02d}/{i[1]:03d}.json")]
if len(sys.argv) > 1:
    p = {x['id']: x for x in plan}[int(sys.argv[1])]; L = left(p)
    print(f"너는 성경 '20대 말투(말씀 웹소설체)' 다시 쓰기 작업자야. 먼저 {S}/bwork.md 를 읽고 그대로 따라 해.\n맡은 범위: {p['label']} 중 아직 안 쓴 장\n맡은 장 (이 순서대로, BB/CCC): {bprompt.lst(L)}")
else:
    tot = 0
    for p in plan:
        L = left(p)
        if L: tot += len(L); print(p['id'], len(L), '장 남음 ·', bprompt.lst(L))
    print('남은 장', tot)
