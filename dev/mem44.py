# v44 암송 데이터: 「목회를 위한 성경 암송 필수 300구절」 201~300을 성경 순서(카드 순서)대로 5구절씩 20묶음
# 본문·핵심어는 예전 데이터(같은 카드에서 옮긴 것, " / "는 끊어 읽기 표시)를 쓰고, 2026-10-11 사용자가 보낸 카드 10장과 한 구절씩 대조함.
# 구절마다 예전 주제 이름(위로와 평안 등)을 남겨 시험 힌트로 씀.
# python3 mem44.py yageun-knight.html → mem44.json + part_v44data.js
import sys, re, json
src = sys.argv[1] if len(sys.argv) > 1 else 'yageun-knight.html'
s = open(src, encoding='utf-8').read()
m = re.search(r'const VERSE_SETS = (\[.*?\]);\n', s)
old = json.loads(m.group(1))
by = {}
for st in old:
    if not re.match(r'201', st['range']): continue
    for no, ref, text, keys in st['v']:
        by[no] = (ref, text, keys, st['title'])
assert len(by) == 100 and sorted(by) == [str(n) for n in range(201, 301)], len(by)

# 대조할 때 고친 핵심어(카드에서 한 덩어리로 칠해진 곳은 그대로 둠 — 끊어 읽기 '/'를 넘는 핵심어는 두 개로 나눔)
FIX_KEYS = {
    '227': ['내게 응답하옵소서'],          # 같은 핵심어가 두 번 → 한 번만
}
groups = []
for g in range(20):
    nos = [str(201 + 5 * g + k) for k in range(5)]
    vs = []
    for no in nos:
        ref, text, keys, theme = by[no]
        keys = FIX_KEYS.get(no, keys)
        for k in keys: assert k in text, (no, k)
        vs.append([no, ref, text, keys, theme])
    themes = []
    for v in vs:
        if v[4] not in themes: themes.append(v[4])
    groups.append({'day': g + 1, 'title': f"{vs[0][1]} ~ {vs[-1][1]}", 'range': f"{nos[0]}~{nos[-1]}", 'tags': ' · '.join(themes), 'v': vs})
json.dump(groups, open('mem44.json', 'w'), ensure_ascii=False, indent=1)
js = '/* v44 암송 데이터 (mem44.py가 만듦): 필수 300구절 중 201~300, 성경 순서로 하루 5구절 × 20묶음 */\nvar MEM44 = ' + json.dumps(groups, ensure_ascii=False) + ';\n'
open('part_v44data.js', 'w', encoding='utf-8').write(js)
print('groups', len(groups), 'verses', sum(len(g['v']) for g in groups), 'bytes', len(js.encode()))
for g in groups[:3] + groups[-2:]: print(g['day'], g['title'], '|', g['range'], '|', g['tags'])
