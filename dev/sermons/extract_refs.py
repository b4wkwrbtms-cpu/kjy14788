# 설교 원고 텍스트에서 성경 주소를 모두 뽑는다(자료 파일은 읽기만)
import re, json, sys, glob, os
names = json.load(open('/home/claude/renewal/book_names.json'))
AB = "창 출 레 민 신 수 삿 룻 삼상 삼하 왕상 왕하 대상 대하 스 느 에 욥 시 잠 전 아 사 렘 애 겔 단 호 욜 암 옵 욘 미 나 합 습 학 슥 말 마 막 눅 요 행 롬 고전 고후 갈 엡 빌 골 살전 살후 딤전 딤후 딛 몬 히 약 벧전 벧후 요일 요이 요삼 유 계".split()
M = {n: i + 1 for i, n in enumerate(names)}
M.update({'시편': 19, '애가': 25, '요한일서': 62, '요한이서': 63, '요한삼서': 64, '빌레몬서': 57})
full = sorted(M, key=len, reverse=True)
abbr = {a: i + 1 for i, a in enumerate(AB)}
BK = '|'.join(full)
PAT = [
 re.compile(rf'({BK})\s*(\d+)\s*(?:장|편)\s*(\d+)\s*절?(?:\s*(?:부터|에서|~|-|–|와|과|,)\s*(?:(\d+)\s*(?:장|편)\s*)?(\d+)\s*절)?'),
 re.compile(rf'({BK})\s*(\d+)\s*:\s*(\d+)(?:\s*[-–~]\s*(\d+))?'),
 re.compile(rf'(?<![가-힣])({"|".join(sorted(abbr, key=len, reverse=True))})\s?(\d+):(\d+)(?:\s*[-–~]\s*(\d+))?'),
 re.compile(rf'({BK})\s*(\d+)\s*(?:장|편)(?!\s*\d)'),
]
out = {}
for f in sys.argv[1:]:
    t = open(f).read()
    t = re.sub(r'[ \t]+', ' ', t); t = re.sub(r'\n\s*', '\n', t)
    flat = t.replace('\n', ' ')
    hits = []
    for k, p in enumerate(PAT):
        for m in p.finditer(flat):
            g = m.groups(); b = M.get(g[0]) or abbr.get(g[0])
            if not b: continue
            ctx = flat[max(0, m.start() - 60): m.end() + 60]
            hits.append({'pos': m.start(), 'raw': m.group(0), 'b': b, 'c': int(g[1]), 'v': int(g[2]) if len(g) > 2 and g[2] else None, 'ctx': ctx})
    hits.sort(key=lambda h: h['pos'])
    out[os.path.basename(f)] = hits
json.dump(out, open('/home/claude/sermons/refs/_regex.json', 'w'), ensure_ascii=False)
for f, h in out.items(): print(f, len(h), len({(x['b'], x['c'], x['v']) for x in h}))
