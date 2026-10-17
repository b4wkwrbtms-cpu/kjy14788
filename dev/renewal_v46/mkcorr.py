# 원어 교정 판정 + 절 원어 메모 다듬기 작업 묶음 만들기
import json, ast, os
P = json.load(open('/home/claude/renewal/payload.json'))
BO = '/home/claude/b4wkwrbtms-cpu/kjy14788/dev/bout'
BOOKS = [('verses', 1, '', '창세기'), ('exodus', 2, 'E', '출애굽기'), ('leviticus', 3, 'L', '레위기'), ('numbers', 4, 'N', '민수기'), ('deuteronomy', 5, 'D', '신명기'), ('joshua', 6, 'J', '여호수아'),
         ('judges', 7, 'G', '사사기'), ('ruth', 8, 'R', '룻기'), ('samuel1', 9, 'A', '사무엘상'), ('samuel2', 10, 'B', '사무엘하'), ('kings1', 11, 'C', '열왕기상'), ('kings2', 12, 'F', '열왕기하')]
NOTEMAP = {'': P['notes'], 'E': P['exodus_notes'], 'L': P['leviticus_notes'], 'N': P['numbers_notes'], 'D': P['deuteronomy_notes'], 'J': P['joshua_notes'], 'G': P['judges_notes'], 'R': P['ruth_notes']}
def parse(x):
    if isinstance(x, (list, dict)): return x
    if not x or x in ('[]', 'None'): return []
    try: return json.loads(x)
    except Exception:
        try: return ast.literal_eval(x)
        except Exception: return []
items = []
for key, b, pre, nm in BOOKS:
    gnotes = NOTEMAP.get(pre, {})
    for v in P[key]:
        c, n = int(v['chapter']), int(v['verse'])
        p = f'{BO}/{b:02d}/{c:03d}.json'
        mz = None
        if os.path.exists(p):
            vv = json.load(open(p))['v']
            if n - 1 < len(vv): mz = vv[n - 1]
        th = v.get('text', '')
        ch = [x for x in parse(v.get('changes')) if isinstance(x, dict)]
        why = [x.get('reason', '') for x in ch if any(t in (x.get('kind') or '') for t in ('원어', '의미', '본문 개정'))]
        notes = []
        k = f'{pre}{c}:{n}'
        if k in gnotes:
            g = gnotes[k]; notes.append({kk: g.get(kk) for kk in ('term', 'note', 'hebrew', 'reading', 'meaning', 'explanation') if g.get(kk)})
        for x in parse(v.get('notes')):
            if isinstance(x, dict): notes.append({kk: x.get(kk) for kk in ('hebrew', 'reading', 'meaning', 'text') if x.get(kk)})
        differs = mz is not None and mz.replace('\n', ' ').strip() != th.replace('\n', ' ').strip()
        need = (b <= 6 and differs and why) or (b >= 7 and differs) or notes
        if not need: continue
        it = {'b': b, 'c': c, 'v': n, 'ref': f'{nm} {c}:{n}', 'mz': mz, 'th': th, 'he': v.get('hebrew', '')}
        if why: it['why'] = why[:3]
        if notes: it['notes'] = notes
        items.append(it)
print('items', len(items))
# 장 단위로 묶어 약 9만 자씩
batches, cur, size, last = [], [], 0, None
for it in items:
    key = (it['b'], it['c'])
    s = len(json.dumps(it, ensure_ascii=False))
    if size + s > 90000 and cur and key != last:
        batches.append(cur); cur, size = [], 0
    cur.append(it); size += s; last = key
if cur: batches.append(cur)
for i, bt in enumerate(batches, 1):
    json.dump(bt, open(f'/home/claude/renewal/corr/in/c{i:02d}.json', 'w'), ensure_ascii=False, indent=0)
    print(f'c{i:02d}', len(bt), bt[0]['ref'], '→', bt[-1]['ref'], sum(len(json.dumps(x, ensure_ascii=False)) for x in bt))
