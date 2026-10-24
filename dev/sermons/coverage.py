# 수정된 전문(full/*.json)에서 성경 주소를 다시 모두 뽑아, refs/{sid}.json(언급 목록)에 빠진 것이 있는지 대조
import json, glob, re, sys, collections
names = json.load(open('/home/claude/renewal/book_names.json'))
M = {n: i + 1 for i, n in enumerate(names)}; M.update({'시편': 19, '애가': 25})
AB = "창 출 레 민 신 수 삿 룻 삼상 삼하 왕상 왕하 대상 대하 스 느 에 욥 시 잠 전 아 사 렘 애 겔 단 호 욜 암 옵 욘 미 나 합 습 학 슥 말 마 막 눅 요 행 롬 고전 고후 갈 엡 빌 골 살전 살후 딤전 딤후 딛 몬 히 약 벧전 벧후 요일 요이 요삼 유 계".split()
A = {a: i + 1 for i, a in enumerate(AB)}
BK = '|'.join(sorted(M, key=len, reverse=True)); AK = '|'.join(sorted(A, key=len, reverse=True))
P1 = re.compile(rf'({BK})\s*(\d+)\s*(?:장|편)\s*(\d+)\s*절?(?:\s*(?:부터|에서|~|-|–|와|과)\s*(?:(\d+)\s*(?:장|편)\s*)?(\d+)\s*절)?')
P2 = re.compile(rf'({BK})\s*(\d+)\s*:\s*(\d+)(?:\s*[-–~]\s*(\d+))?')
P3 = re.compile(rf'(?<![가-힣])({AK})\s?(\d+):(\d+)(?:\s*[-–~]\s*(\d+))?')
P4 = re.compile(rf'({BK})\s*(\d+)\s*(?:장|편)(?!\s*\d)')
def found(text):
    out = []
    for p in (P1, P2, P3):
        for m in p.finditer(text):
            g = m.groups(); b = M.get(g[0]) or A.get(g[0]); out.append((b, int(g[1]), int(g[2]), m.group(0)))
    for m in P4.finditer(text):
        out.append((M[m.group(1)], int(m.group(2)), None, m.group(0)))
    return out
tot = miss = 0; report = collections.defaultdict(list)
for f in sorted(glob.glob('full/*.json')):
    if '.log.' in f or 'notes' in f: continue
    d = json.load(open(f)); sid = d['sid']
    refs = json.load(open(f'refs/{sid}.json'))
    cov = collections.defaultdict(set)
    for r in refs:
        for B, C, V1, V2 in r.get('spans') or []: cov[(B, C)].update(range(V1, V2 + 1))
    for i, p in enumerate(d['paras']):
        for b, c, v, raw in found(p['t']):
            tot += 1
            ok = (b, c) in cov and (v is None or v in cov[(b, c)])
            if not ok: miss += 1; report[sid].append({'para': i, 'raw': raw, 'b': b, 'c': c, 'v': v, 'ctx': p['t'][max(0, p['t'].find(raw) - 80): p['t'].find(raw) + 120]})
json.dump(report, open('refs/_uncovered.json', 'w'), ensure_ascii=False, indent=1)
print('explicit mentions in full text', tot, 'not covered', miss, 'sermons with gaps', len(report))
for s, l in report.items(): print(s, [x['raw'] for x in l][:8])
