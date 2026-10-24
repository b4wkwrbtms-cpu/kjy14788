# 설교 원고집 PDF → 설교별 전문(JSON) — 원고 그대로(사용자: 두 목사님 공개 허락 있음, 10-25)
# 문단·소제목·성경 인용 블록·[편집 주 n] 표시를 살리고, 머리글·쪽 번호는 뺀다.
# 줄 끝 띄어쓰기는 PDF에 없으므로 원고 안 낱말 쓰임새로 정한다(join_rule).
import pdfplumber, json, re, sys, os, collections, glob
SRC = '/home/claude/sermon_zip'
OUT = '/home/claude/sermons/full'
os.makedirs(OUT, exist_ok=True)
COL = [  # (파일, sid 접두어, 원고집 이름)
 ('장진명_설교집/장진명_군산성결교회_설교20편_가독성개선_최종본.pdf', 'jjm-gs', '군산성결교회 설교 원고집'),
 ('장진명_설교집/장진명_은평교회_설교8편_완성본.pdf', 'jjm-ep', '은평교회 설교 원고집'),
 ('유기성_설교집/일상의_기적을_체험하라_제자훈련_6편_원고집.pdf', 'ykj-1', '일상의 기적을 체험하라 · 제자훈련 6편 원고집'),
 ('유기성_설교집/일상의_기적을_체험하라_제2권_7편_원고집.pdf', 'ykj-2', '일상의 기적을 체험하라 제2권 · 7편 원고집'),
 ('유기성_설교집/하나님의_인도하심을_구하라_제3권_5편_원고집.pdf', 'ykj-3', '하나님의 인도하심을 구하라 제3권 · 5편 원고집'),
 ('유기성_설교집/하나님의_뜻대로_살아가라_제4권_5편_원고집.pdf', 'ykj-4', '하나님의 뜻대로 살아가라 제4권 · 5편 원고집'),
]
CARDS = {json.load(open(f))['sid']: json.load(open(f)) for f in glob.glob('/home/claude/sermons/out/*.json') if not f.endswith('notes.json')}
norm = lambda t: re.sub(r'[\s·‘’“”"\'.,!?]', '', t)

def lines_of(pdf):
    for pi, p in enumerate(pdf.pages):
        for l in p.extract_text_lines(strip=True, return_chars=True):
            c = l['chars'][0]; bold = 'Bold' in c['fontname'] or 'B+' in c['fontname'][:8]
            yield {'pi': pi, 't': l['text'], 'x0': l['x0'], 'x1': l['x1'], 'size': round(c['size'], 1), 'bold': 'Bold' in c['fontname'], 'top': l['top']}

def kind(l):
    s = l['size']
    if s >= 20: return 'title'
    if 13 <= s < 16 and l['bold']: return 'h'
    if 10.9 <= s <= 11.6: return 'p'
    if 10.1 <= s < 10.9 and l['x0'] >= 70: return 'q'
    if 9.5 <= s <= 9.8 and l['t'].startswith('본문 말씀'): return 'ref'
    if 9.9 <= s <= 10.05: return 'label'
    if 9.1 <= s <= 9.3 and re.match(r'^\[편집 주', l['t']): return 'mark'
    return 'skip'   # 머리글(8.1), 쪽 번호(9.0) 등

def collect():
    data = {}
    for f, pre, book in COL:
        pdf = pdfplumber.open(f'{SRC}/{f}')
        sids = sorted([s for s in CARDS if s.startswith(pre + '-')])
        titles = {norm(CARDS[s]['title']): s for s in sids}
        cur = None; secs = collections.defaultdict(list); appendix = []; app_on = False
        for l in lines_of(pdf):
            k = kind(l)
            if k == 'title':
                key = norm(l['t'])
                if key in titles: cur = titles[key]; app_on = False; secs[cur].append(('title', l)); continue
                if cur and secs[cur] and secs[cur][-1][0] == 'title' and l['size'] >= 20:  # 두 줄 제목
                    secs[cur].append(('title', l)); continue
                cur = None
                app_on = bool(re.search(r'편집|교정|대조|부록', l['t'])) or app_on
                if app_on: appendix.append(('title', l))
                continue
            if cur: secs[cur].append((k, l))
            elif app_on and k != 'skip': appendix.append((k, l))
            elif app_on and k == 'skip' and 8.5 < l['size'] < 10 and not re.match(r'^\d+$', l['t']): appendix.append(('small', l))
        data[pre] = (book, f, secs, appendix)
    return data

TOK = collections.Counter(); IN = collections.Counter(); AC = collections.Counter()
def learn(data):
    for book, f, secs, app in data.values():
        for sid, ls in secs.items():
            for k, l in ls:
                ws = l['t'].split()
                for w in ws[1:-1]: TOK[w] += 1
                for w in ws:
                    for x, y in zip(w, w[1:]): IN[x + y] += 1
                for w1, w2 in zip(ws, ws[1:]): AC[w1[-1] + w2[0]] += 1
END_P = set('.?!,”’)…:;')
BOUND = set('은는이가을를에의도로과와고며면서지다요니게기하했되된습입던었았겠야께만까든데라란랑려며므써세시아어여져쳐워해죠군지냐냬뇨됩함음임됨')
UNIT = set('장절편차명부년월일시분세번개주회권살층대억만천원')
def join_rule(a, b):
    """개선판: 숫자+단위, 낱말 사전, 글자 짝 통계(낱말 안 vs 띄어쓰기 사이) 순서"""
    if not a or not b: return True
    A = a.split()[-1]; B = b.split()[0]
    if A[-1] in END_P: return True
    if B[0] in ',.)”’?!…': return False
    if A[-1].isdigit() and (B[0] in UNIT or B[0].isdigit()): return False
    if not re.match(r'[가-힣]', A[-1]) or not re.match(r'[가-힣]', B[0]): return True
    j = A + B
    if TOK.get(j, 0) >= 1 and TOK.get(j, 0) >= min(TOK.get(A, 0), TOK.get(B, 0)): return False
    i, c = IN.get(A[-1] + B[0], 0), AC.get(A[-1] + B[0], 0)
    if TOK.get(A, 0) == 0 and len(A) <= 2 and i > 0: return False
    if i + c >= 3: return c > i
    return join_rule_old(a, b)
def join_rule_old(a, b):
    """a: 앞 줄, b: 다음 줄 → 이어 붙일 때 띄어 쓰면 True"""
    if not a or not b: return True
    A = a.split()[-1]; B = b.split()[0]
    if A[-1] in END_P: return True
    if B[0] in ',.)”’?!…': return False
    if not re.match(r'[가-힣]', A[-1]) or not re.match(r'[가-힣]', B[0]): return True
    j = A + B
    if TOK.get(j, 0) >= 1: return False
    if TOK.get(A, 0) >= 2 and TOK.get(B, 0) >= 2: return True
    # 더 긴 낱말의 앞부분/뒷부분으로 자주 나오면 붙임
    if B[0] in BOUND and TOK.get(A, 0) == 0: return False
    if TOK.get(A, 0) >= 1 and TOK.get(B, 0) >= 1: return True
    if B[0] in BOUND: return False
    return True

REF = {}
def ref_space(pre, a, b):
    """같은 원고의 다른 판(군산 이전완성본)에서 그 자리 띄어쓰기를 확인할 수 있으면 그대로 따른다"""
    pj = REF.get(pre)
    if not pj: return None
    A = a.split()[-1][-3:]; B = b.split()[0][:3]
    s1 = (A + ' ' + B) in pj; s0 = (A + B) in pj
    return None if s1 == s0 else s1
CUR_PRE = [None]
def build(ls):
    """줄 목록 → 문단 목록 [{k, t}]"""
    out = []; buf = None; prev = None
    maxx = collections.defaultdict(float)
    for k, l in ls: maxx[(l['pi'], k)] = max(maxx[(l['pi'], k)], l['x1'])
    for k, l in ls:
        t = l['t']
        if k in ('title', 'label', 'ref'):
            if buf: out.append(buf); buf = None
            if k == 'title' and out and out[-1]['k'] == 'title': out[-1]['t'] += ' ' + t
            else: out.append({'k': k, 't': t})
            prev = None; continue
        if k == 'mark':
            if buf: buf['t'] += ' ' + t
            elif out: out[-1]['t'] += ' ' + t
            continue
        if k == 'skip': continue
        if buf and buf['k'] == k and prev is not None and not prev['short']:
            r = ref_space(CUR_PRE[0], buf['t'], t)
            buf['t'] += (' ' if (join_rule(buf['t'], t) if r is None else r) else '') + t
        elif buf and buf['k'] == 'h' and k == 'h' and prev is not None:
            buf['t'] += ' ' + t
        else:
            if buf: out.append(buf)
            buf = {'k': k, 't': t}
        prev = {'short': l['x1'] < maxx[(l['pi'], k)] - 22 if k != 'h' else False}
    if buf: out.append(buf)
    return out

if __name__ == '__main__':
    data = collect(); learn(data)
    import subprocess
    REF['jjm-gs'] = subprocess.run(['pdftotext', '-raw', f'{SRC}/장진명_설교집/장진명_군산성결교회_설교20편_이전완성본.pdf', '-'], capture_output=True, text=True).stdout
    stats = {}
    for pre, (book, f, secs, app) in data.items():
        CUR_PRE[0] = pre
        for sid, ls in secs.items():
            paras = build(ls)
            json.dump({'sid': sid, 'book': book, 'file': os.path.basename(f), 'paras': paras}, open(f'{OUT}/{sid}.json', 'w'), ensure_ascii=False)
            stats[sid] = (len(paras), sum(len(p['t']) for p in paras))
        if app:
            json.dump({'book': book, 'paras': build(app)}, open(f'{OUT}/{pre}-notes.json', 'w'), ensure_ascii=False)
    missing = sorted(set(CARDS) - set(stats))
    print('sermons', len(stats), 'missing', missing)
    for s in sorted(stats): print(s, stats[s])
