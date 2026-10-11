# 20대 말투 장 검사: python3 bcheck.py BB CCC [CCC2 ...]   또는  python3 bcheck.py BB all   또는  python3 bcheck.py ALL
# 형식(절 수 · 소제목) · 옛말 어미 · 옛 지명 · 금지 표현 · 따옴표 짝 · 길이 비율 · 숫자 · 사람 이름 빠짐(개역 이름이 새 글에 있는지)
import json, os, re, sys
KRV = '/home/claude/kjy14788/bible/krv'
OLD_END = re.compile(r'(가라사대|가로되|이르되|이르시되|하시니라|하더라(?!도)|하니라|이니라|느니라|노라|(?:하|로|었|았|시|리)도다|지어다|찌어다|할찌니라|할지니라|하나이다|나이다|옵소서|소서|하리로다|하였더라|되니라|있나이까|니이까|리이까|사오니|하옵|하시매|하매|더니$)')
OLD_PLACE = re.compile(r'(?<![가-힣])(애굽|바벨론|앗수르|수리아|구브로|그레데|마게도냐|서바나|헬라|이달리야|아덴)')
BAD = re.compile(r'(ㅋ|ㅎㅎ|ㅠ|ㅜㅜ|ㄹㅇ|존나|개쩔|킹받|갓생|레전드|"|떡을|떡이|떡과|문둥|소경|앉은뱅이|벙어리|귀머거리|절뚝발이|곱사등이|계집)')
NUM_K = '일이삼사오육칠팔구십백천만'

from lineage import occurs
def names_in(t):
    # 개역 절에 '이름으로' 나온 것(앞뒤 경계 확인 — 하룻밤의 룻, 불살라의 살라는 빼고)
    return [n for n in NAMES if occurs(t, n)]
# 개역 지명 표기를 일부러 남기는 절 (사람·족속 이름인 앗수르 등)
PLACE_OK = {(1, 10, 22), (1, 25, 3), (13, 1, 17)}

def load_names():
    p = 'bnames.txt'
    if not os.path.exists(p): return []
    return [x.strip() for x in open(p, encoding='utf-8') if x.strip() and not x.startswith('#')]
NAMES = load_names()

def check(b, c, quiet=False):
    f = f'bout/{b:02d}/{c:03d}.json'
    krv = json.load(open(f'{KRV}/{b:02d}.json', encoding='utf-8'))[c - 1]
    if not os.path.exists(f): return [f'{b}:{c} 파일 없음']
    try: j = json.load(open(f, encoding='utf-8'))
    except Exception as e: return [f'{b}:{c} JSON 오류 {e}']
    P = []
    if j.get('b') != b or j.get('c') != c: P.append(f'b/c 값이 {j.get("b")}/{j.get("c")}')
    v = j.get('v', [])
    if len(v) != len(krv): P.append(f'절 수 {len(v)} ≠ 개역 {len(krv)}')
    h = j.get('h', [])
    if not h: P.append('소제목 없음')
    last = 0
    for x in h:
        if not (isinstance(x, list) and len(x) == 2 and isinstance(x[0], int) and isinstance(x[1], str)): P.append(f'소제목 형식 {x}'); continue
        if x[0] <= last or x[0] > len(krv): P.append(f'소제목 절 번호 {x[0]}')
        last = x[0]
        if len(x[1]) > 18: P.append(f'소제목 김 {x[1]}')
    oq = cq = 0
    for i, t in enumerate(v, 1):
        if not isinstance(t, str) or not t.strip(): P.append(f'{i}절 비어 있음'); continue
        k = krv[i - 1] if i <= len(krv) else ''
        for line in t.split('\n'):
            m = OLD_END.search(line.strip())
            if m and not line.strip().startswith('〔'): P.append(f'{i}절 옛말 "{m.group(0)}": {line[:40]}')
        m = OLD_PLACE.search(t)
        if m and (b, c, i) not in PLACE_OK: P.append(f'{i}절 옛 지명 "{m.group(0)}"')
        m = BAD.search(t)
        if m: P.append(f'{i}절 금지 표현 "{m.group(0)}"')
        oq += t.count('“'); cq += t.count('”')
        r = len(t.replace('\n', '')) / max(1, len(k))
        if k and (r < 0.6 or r > 2.6) and len(k) > 12: P.append(f'{i}절 길이 비율 {r:.2f} (개역 {len(k)}자 → {len(t)}자)')
        for n in re.findall(r'\d[\d,]*', k):
            if n.replace(',', '') not in t.replace(',', ''): pass
        miss = [n for n in names_in(k) if n not in t]
        if miss: P.append(f'{i}절 이름 빠짐? {",".join(miss)}')
    if oq != cq: P.append(f'큰따옴표 짝 “{oq} ”{cq} (장 전체)')
    return [f'{b}:{c} ' + x for x in P]

def main(a):
    todo = []
    if a[0] == 'ALL':
        for b in range(1, 67):
            n = len(json.load(open(f'{KRV}/{b:02d}.json', encoding='utf-8')))
            todo += [(b, c) for c in range(1, n + 1) if os.path.exists(f'bout/{b:02d}/{c:03d}.json')]
    else:
        b = int(a[0])
        if a[1] == 'all':
            n = len(json.load(open(f'{KRV}/{b:02d}.json', encoding='utf-8')))
            todo = [(b, c) for c in range(1, n + 1)]
        else:
            for x in a[1:]:
                if '-' in x: c1, c2 = map(int, x.split('-')); todo += [(b, c) for c in range(c1, c2 + 1)]
                else: todo.append((b, int(x)))
    allp = []
    for b, c in todo: allp += check(b, c)
    print('\n'.join(allp) if allp else f'OK {len(todo)}장')
    return allp

if __name__ == '__main__':
    main(sys.argv[1:])
