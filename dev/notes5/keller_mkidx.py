#!/usr/bin/env python3
"""켈러 번역 설교(개인 연구용, 비공개) → 설교별 텍스트 + 절 색인.
출력(공개 저장소 밖): /home/claude/private/keller/sermons/{set}-{nn}.txt, idx.json
idx.json = {"meta": {sid: {title, en, date, main, pages, path}}, "v": {"b:c": {"v": [[sid, line, kind]]}}}
kind: main(그 설교의 중심 본문 범위) | ref(설교 중 언급)"""
import re, json, os
D = '/home/claude/private/keller'
SETS = {'job': '2f5ca922-keller_job_set.txt', 'rev': '8f079bde-keller_revelation_set.txt', 'ant': 'fe3a19bb-keller_anthology.txt'}
BN = json.load(open('/home/claude/renewal/tools/book_names.json'))
# book_names.json: 여러 형식일 수 있어 이름→번호 사전을 만든다
name2b = {}
def addn(n, b):
    if n: name2b[n.strip()] = int(b)
if isinstance(BN, dict):
    for k, v in BN.items():
        if isinstance(v, (list, tuple)):
            for n in v: addn(n, k)
        else: addn(v, k)
else:
    for i, v in enumerate(BN, 1):
        for n in (v if isinstance(v, (list, tuple)) else [v]): addn(n, i)
for n, b in [('계시록', 66), ('요한계시록', 66), ('욥기', 18), ('창세기', 1), ('시편', 19)]: name2b.setdefault(n, b)
names = sorted(name2b, key=len, reverse=True)
NRE = '|'.join(map(re.escape, names))
R1 = re.compile(rf'({NRE})\s*(\d+)\s*:\s*(\d+)(?:\s*[–-]\s*(\d+)(?::(\d+))?)?')
R2 = re.compile(rf'({NRE})\s*(\d+)\s*장\s*(\d+)\s*절(?:\s*(?:에서|부터)?\s*~?\s*(\d+)\s*절)?')
R3 = re.compile(rf'({NRE})\s*(\d+)\s*편')
os.makedirs(f'{D}/sermons', exist_ok=True)
meta = {}; V = {}
def add(b, c, v1, v2, sid, line, kind):
    k = f'{b}:{c}'; d = V.setdefault(k, {}).setdefault('v', {})
    for v in range(v1, min(v2, v1 + 40) + 1):
        L = d.setdefault(str(v), [])
        if not any(x[0] == sid and x[2] == kind for x in L): L.append([sid, line, kind])
for sk, fn in SETS.items():
    t = open(f'{D}/{fn}').read(); pages = t.split('\f')
    toc_end = next(i for i, p in enumerate(pages) if i > 1 and '차례' not in p and re.search(r'\n\s*\d+\s*$', pages[i - 1] or '') and i > 3) if False else None
    # 차례: 머리줄(번호·날짜) / 제목 ... 쪽 / 본문 · 영어 제목
    toc = '\f'.join(pages[1:6]); toc = toc[toc.find('차례'):]
    lines = [l.rstrip() for l in toc.split('\n')]
    ent = []
    for i, l in enumerate(lines):
        m = re.match(r'^(.*?\S)\s{2,}(\d+)$', l.strip()) or re.match(r'^(.*?\S)\s+(\d{1,3})$', l.strip())
        if not m or i == 0: continue
        head = lines[i - 1].strip()
        if not re.search(r'\d{4}', head): continue
        nxt = lines[i + 1].strip() if i + 1 < len(lines) else ''
        if re.search(r'\d{4}\.?', nxt) and not re.search(r'\d+:\d+|편', nxt): nxt = ''
        main, en = (nxt.split(' · ', 1) + [''])[:2] if nxt else ('', '')
        ent.append({'head': head, 'title': m.group(1).strip(), 'page': int(m.group(2)), 'main': main.strip(), 'en': en.strip()})
    # 쪽 번호 → pdf 쪽(1부터, pages 색인 = 쪽-1)
    for j, e in enumerate(ent):
        p0 = e['page'] - 1; p1 = (ent[j + 1]['page'] - 1) if j + 1 < len(ent) else None
        if p1 is None:  # 마지막: 부록/찾아보기 전까지
            p1 = next((k for k in range(p0 + 1, len(pages)) if re.search(r'^\s*(부록|복원 기록|성경 찾아보기)', pages[k], re.M) and k > p0 + 3), len(pages))
        body = '\f'.join(pages[p0:p1])
        sid = f'{sk}-{j + 1:02d}'; path = f'{D}/sermons/{sid}.txt'
        open(path, 'w').write(body)
        dm = re.search(r'(\d{4}(?:\.\s*\d{1,2})?(?:\.\s*\d{1,2})?\.?)', e['head'])
        meta[sid] = {'title': e['title'], 'en': e['en'], 'date': dm.group(1) if dm else '', 'main': e['main'], 'pages': [e['page'], p1], 'path': path, 'set': sk}
        # 중심 본문
        for m in R1.finditer(e['main']):
            b = name2b[m.group(1)]; c = int(m.group(2)); v1 = int(m.group(3))
            if m.group(5): add(b, c, v1, 200, sid, 0, 'main'); add(b, int(m.group(4)), 1, int(m.group(5)), sid, 0, 'main')
            else: add(b, c, v1, int(m.group(4) or v1), sid, 0, 'main')
        for m in R3.finditer(e['main']): add(name2b[m.group(1)], int(m.group(2)), 1, 200, sid, 0, 'main')
        # 설교 속 언급
        for ln, l in enumerate(body.split('\n'), 1):
            for m in R1.finditer(l):
                b = name2b[m.group(1)]; c = int(m.group(2)); v1 = int(m.group(3))
                add(b, c, v1, int(m.group(4)) if (m.group(4) and not m.group(5)) else v1, sid, ln, 'ref')
            for m in R2.finditer(l):
                b = name2b[m.group(1)]; add(b, int(m.group(2)), int(m.group(3)), int(m.group(4) or m.group(3)), sid, ln, 'ref')
json.dump({'meta': meta, 'v': V}, open(f'{D}/idx.json', 'w'), ensure_ascii=False)
print(len(meta), 'sermons;', sum(len(x['v']) for x in V.values()), 'verse keys')
for s, m in meta.items(): print(s, m['date'], m['title'], '|', m['main'], '|', m['en'], m['pages'])
