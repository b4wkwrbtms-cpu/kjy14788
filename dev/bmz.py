# bout/BB/CCC.json (20대 말투 장) → pwa/bible/mz/NN.json  (권마다 장 배열, 아직 없는 장은 null) + 계보 lin.json 다시 만들기
# python3 bmz.py
import json, os
import lineage
KRV = '/home/claude/kjy14788/bible/krv'
os.makedirs('pwa/bible/mz', exist_ok=True)
tot = done = 0
for b in range(1, 67):
    krv = json.load(open(f'{KRV}/{b:02d}.json', encoding='utf-8'))
    arr = []
    for c in range(1, len(krv) + 1):
        f = f'bout/{b:02d}/{c:03d}.json'; tot += 1
        if os.path.exists(f):
            j = json.load(open(f, encoding='utf-8'))
            assert len(j['v']) == len(krv[c - 1]), (b, c)
            arr.append({'h': j.get('h', []), 'v': j['v']}); done += 1
        else:
            arr.append(None)
    p = f'pwa/bible/mz/{b:02d}.json'
    if any(arr):
        json.dump(arr, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    elif os.path.exists(p):
        os.remove(p)
print('mz chapters', done, '/', tot)
lineage.build()
