# v46 앱 데이터 만들기
#  bible/mz/NN.json  : 20대 말투 본문(v45) + 원어 교정 반영
#  bible/lin.json    : 계보 이름(빨간 밑줄, 구약)
#  bible/x/NN.json   : 장 제목·안내, 대화 이름표, 해설 링크, 절 원어 메모, 접기(이야기 흐름) — 창세기~열왕기하
#  bible/nt/NN.json  : 그 권에서 쓰는 해설 카드
#  bible/he/NN.json  : 히브리어 본문(원어 메모를 열 때만 불러옴)
import json, os, re, shutil, sys, glob, ast, collections, difflib
R0 = '/home/claude/renewal'
REPO = '/home/claude/b4wkwrbtms-cpu/kjy14788'
APP = f'{R0}/app'
KRV = f'{REPO}/bible/krv'
BOUT = '/home/claude/bw/bout'   # 10-18 원어 대조까지 끝난 66권 본문
B46 = f'{R0}/bout46'
P = json.load(open(f'{R0}/payload.json'))
RM = json.load(open(f'{R0}/reading-model-v17.json'))
EP = json.load(open(f'{R0}/episode-model-v18.json'))
BR = json.load(open(f'{R0}/bridge-notes-v19.json'))
U = json.load(open(f'{R0}/ex/units.json'))
NR = json.load(open(f'{R0}/ex/notes_raw.json'))
TONE = json.load(open(f'{R0}/ex/tone_out.json')) if os.path.exists(f'{R0}/ex/tone_out.json') else {}
BOOKS = [('genesis', 1, '', 'verses'), ('exodus', 2, 'E', 'exodus'), ('leviticus', 3, 'L', 'leviticus'), ('numbers', 4, 'N', 'numbers'),
         ('deuteronomy', 5, 'D', 'deuteronomy'), ('joshua', 6, 'J', 'joshua'), ('judges', 7, 'G', 'judges'), ('ruth', 8, 'R', 'ruth'),
         ('samuel1', 9, 'A', 'samuel1'), ('samuel2', 10, 'B', 'samuel2'), ('kings1', 11, 'C', 'kings1'), ('kings2', 12, 'F', 'kings2')]
KEY2B = {k: b for k, b, _, _ in BOOKS}
LET2B = {l: b for _, b, l, _ in BOOKS}
NAME_REVERT = set()   # 이름 표기 교정은 되돌림(개역한글 인명·지명 표기 유지) → 메모로

def refparse(ref):
    m = re.match(r'^([A-Z]?)(\d+):(\d+)$', ref)
    return (LET2B[m.group(1)], int(m.group(2)), int(m.group(3))) if m else None

# ---------- 1) 원어 교정 + 메모 ----------
fixes = {}; memos = collections.defaultdict(list); reverted = []
for f in sorted(glob.glob(f'{R0}/corr/out/*.jsonl')):
    ins = [json.loads(l) for l in open(f.replace('/out/', '/in/'))]
    for a, l in zip(ins, open(f)):
        o = json.loads(l); key = (o['b'], o['c'], o['v'])
        for m in o.get('memo') or []:
            if m.get('t'): memos[key].append({'he': m.get('he', ''), 'rd': m.get('rd', ''), 'm': m.get('m', ''), 't': m['t']})
        if o.get('fix') and a.get('mz'):
            why = o.get('why') or ''
            tk = lambda s: re.findall(r'[가-힣A-Za-z0-9]+|[^\s가-힣A-Za-z0-9]', s)
            ta, tb = tk(a['mz']), tk(o['fix'])
            chs = [(' '.join(ta[i1:i2]), ' '.join(tb[j1:j2])) for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, ta, tb).get_opcodes() if op != 'equal']
            if len(chs) == 1 and all(chs[0]) and len(chs[0][0]) <= 6 and len(chs[0][1]) <= 6 and re.search(r'(이름|표기|지명)', why):
                # 개역 표기를 따른 이름이면 되돌림
                reverted.append((key, why))
                he = re.findall(r'[֐-׿][֐-׿ְ-ׇ־]*', why)
                memos[key].append({'he': he[0] if he else '', 'rd': '', 'm': '이름 표기', 't': '본문 이름은 개역한글 표기를 따랐어요. 원어 표기는 이렇게 달라요: ' + re.sub(r'\s+', ' ', why).rstrip('.') + '.'})
                continue
            fixes[key] = (a['mz'], o['fix'])
print('fixes', len(fixes), 'reverted names', len(reverted), 'memo verses', len(memos))

# ---------- 2) 교정 반영한 bout 사본 ----------
if os.path.exists(B46): shutil.rmtree(B46)
shutil.copytree(BOUT, B46)
applied = 0
skipped = []
for (b, c, v), (base, t) in fixes.items():
    p = f'{B46}/{b:02d}/{c:03d}.json'
    j = json.load(open(p)); assert v - 1 < len(j['v'])
    if j['v'][v - 1] != base: skipped.append((b, c, v)); continue   # 그 뒤 본문이 바뀐 절은 건드리지 않음
    j['v'][v - 1] = t; applied += 1
    json.dump(j, open(p, 'w'), ensure_ascii=False)
print('applied', applied, 'skipped(changed since)', skipped)

# ---------- 3) 앱 폴더 + mz + lin ----------
os.makedirs(f'{APP}/bible/mz', exist_ok=True)
MZ = {}
done = 0
for b in range(1, 67):
    krv = json.load(open(f'{KRV}/{b:02d}.json'))
    arr = []
    for c in range(1, len(krv) + 1):
        p = f'{B46}/{b:02d}/{c:03d}.json'
        if os.path.exists(p):
            j = json.load(open(p)); assert len(j['v']) == len(krv[c - 1]), (b, c)
            arr.append({'h': j.get('h', []), 'v': j['v']}); done += 1
        else: arr.append(None)
    MZ[b] = arr
    if any(arr): json.dump(arr, open(f'{APP}/bible/mz/{b:02d}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('mz chapters', done)
sys.path.insert(0, f'{REPO}/dev')
import lineage
lineage.KRV = KRV; lineage.OUT = f'{APP}/bible/lin.json'
cwd = os.getcwd(); os.chdir(R0)
lineage.build(src=B46)
os.chdir(cwd)

# ---------- 4) 절별 이름표·링크 (그쪽) ----------
SP = collections.defaultdict(list); LN = collections.defaultdict(list)
for ref, frag, d in U['units']:
    k = refparse(ref)
    if not k: continue
    SP[k] += d['sp']
    for x in d['ln']:
        if x['id'] and not any(y[0] == x['id'] for y in LN[k]): LN[k].append([x['id'], x['k'], x['t']])

PART = ["이라고", "이라", "이었", "이고", "이며", "이요", "이니", "이에", "이지", "이시", "이신", "이셨", "이야", "이랑", "이네", "이여", "이다", "에게", "에서", "한테", "처럼", "보다", "부터", "까지", "으로", "하고", "조차", "마저",
        "이", "가", "은", "는", "을", "를", "의", "에", "께", "과", "와", "도", "만", "아", "야", "여", "님", "라", "랑", "로", "였", "뿐", "씨", "네", "다", "요", "왕", "성", "들"]
isHan = lambda ch: bool(ch) and '가' <= ch <= '힣'
def findterm(text, term):
    if not term: return -1
    i = text.find(term)
    while i >= 0:
        j = i + len(term); before = text[i - 1] if i > 0 else ''; rest = text[j:j + 3]
        if not isHan(before) and (not isHan(text[j:j + 1]) or any(rest.startswith(p) for p in PART)): return i
        i = text.find(term, j)
    return -1
def clean_title(t): return re.sub(r'\(.*?\)|\s*·.*$', '', t or '').strip()

def quote_lines(lines):
    return [i for i, x in enumerate(lines) if '“' in x]

# ---------- 5) 장 머리말 ----------
def heads_for(book, let, c):
    h = U['heads'].get(f'{book}|{let}{c}') or U['heads'].get(f'{book}|{c}') or {}
    title = h.get('title', ''); guide = list(h.get('guide') or [])
    alt = {'numbers': ('numbers_titles', 'numbers_guides'), 'deuteronomy': ('deuteronomy_titles', 'deuteronomy_guides'), 'joshua': ('joshua_titles', 'joshua_guides'),
           'judges': ('judges_titles', None), 'ruth': ('ruth_titles', None), 'leviticus': (None, 'leviticus_guides')}.get(book)
    if alt:
        if not title and alt[0] and c - 1 < len(P[alt[0]]): title = P[alt[0]][c - 1]
        if not guide and alt[1] and c - 1 < len(P[alt[1]]): guide = [P[alt[1]][c - 1]]
    if book == 'exodus' and not title: title = P['exodus_guides']['titles'][c - 1]
    if book == 'genesis' and not title: title = (P['reader_guides'].get(str(c)) or {}).get('title', '')
    guide = [g for g in guide if g and '절 · 전체' not in g]
    return title, guide

# ---------- 6) 접기 ----------
seg_ep = {}
for e in EP['episodes']:
    for s in e['segments']: seg_ep[s] = e
SEGS = collections.defaultdict(list)
for s in RM['segments']:
    SEGS[(KEY2B[s['book']], int(s['chapter']))].append(s)
CAT = RM['categories']
def ep_start_chapter(e):
    return int(str(e['start']).split(':')[0].lstrip('ABCDEFGJLNR')) if e.get('start') else None

# ---------- 7) 권별 x 파일 ----------
os.makedirs(f'{APP}/bible/x', exist_ok=True); os.makedirs(f'{APP}/bible/he', exist_ok=True); os.makedirs(f'{APP}/bible/nt', exist_ok=True)
stats = collections.Counter(); used_notes = collections.defaultdict(set)
for book, b, let, pkey in BOOKS:
    krv = json.load(open(f'{KRV}/{b:02d}.json'))
    X = {}
    he = [[''] * len(ch) for ch in krv]
    for v in P[pkey]:
        c, n = int(v['chapter']), int(v['verse'])
        if c - 1 < len(he) and n - 1 < len(he[c - 1]): he[c - 1][n - 1] = v.get('hebrew', '') or ''
    json.dump(he, open(f'{APP}/bible/he/{b:02d}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    for c in range(1, len(krv) + 1):
        ch = MZ[b][c - 1]
        title, guide = heads_for(book, let, c)
        cx = {}
        if title: cx['t'] = title
        if guide: cx['g'] = guide
        sp = {}; ln = {}; un = []; vn = {}
        for n in range(1, len(krv[c - 1]) + 1):
            k = (b, c, n)
            if k in memos: vn[str(n)] = memos[k]; stats['vn'] += len(memos[k])
            if not ch: continue
            text = ch['v'][n - 1]; lines = text.split('\n'); flat = text.replace('\n', ' ')
            # 이름표
            theirs = [s for s in SP.get(k, []) if s.get('s')]
            ql = quote_lines(lines)
            nq = sum(x.count('“') for x in lines)
            labs = []
            if theirs and ql:
                if nq == len(theirs) and len(ql) == nq:
                    labs = [[li, s['s'], s['r'], s['k'], s['kt']] for li, s in zip(ql, theirs)]; stats['sp_exact'] += len(labs)
                else:
                    pool = list(theirs)
                    for li in ql:
                        prev = ' '.join(lines[max(0, li - 2):li]) + ' ' + lines[li].split('“')[0]
                        hit = next((s for s in pool if s['s'] and s['s'] in prev), None)
                        if not hit and len({s['s'] for s in pool}) == 1 and pool: hit = pool[0]
                        if hit:
                            labs.append([li, hit['s'], hit['r'], hit['k'], hit['kt']]); pool.remove(hit); stats['sp_heur'] += 1
                        else: stats['sp_miss'] += 1
            if labs: sp[str(n)] = labs
            # 해설 링크
            for nid, kind, term in LN.get(k, []):
                if nid not in NR: continue
                cand = [term, clean_title(NR[nid]['title'])]
                hit = next((t for t in cand if t and findterm(flat, t) >= 0), None)
                if hit:
                    ln.setdefault(str(n), []).append([nid, hit, kind]); stats['ln_hit'] += 1
                else:
                    if not any(u[0] == nid for u in un): un.append([nid, kind])
                    stats['ln_miss'] += 1
                used_notes[b].add(nid)
        if sp: cx['sp'] = sp
        if ln: cx['ln'] = ln
        if un: cx['un'] = un
        if vn: cx['vn'] = vn
        # 접기
        groups = []
        for s in sorted(SEGS.get((b, c), []), key=lambda s: s['start']):
            if s['story'] != 'fold': continue
            e = seg_ep.get(s['id'])
            if groups and groups[-1]['ep'] == (e['id'] if e else None) and groups[-1]['e'] + 1 >= s['start']:
                groups[-1]['e'] = max(groups[-1]['e'], s['end']); continue
            groups.append({'s': s['start'], 'e': s['end'], 'cat': s['category'], 'ep': e['id'] if e else None, 'title': (e['title'] if e else s['title']), 'st': s['title']})
        fl = []
        for g in groups:
            e = next((x for x in EP['episodes'] if x['id'] == g['ep']), None)
            br = BR.get(g['ep']) if g['ep'] else None
            first = e and ep_start_chapter(e) == c
            lines3 = (br.get('lines') if first else br.get('previous_lines')) if br else []
            labels = br.get('labels') if br else []
            fl.append([g['s'], g['e'], CAT.get(g['cat'], g['cat']), g['title'] or g['st'], lines3 or [], labels or [], (e['ref'] if e else ''), 0 if first else 1])
            stats['fold'] += 1
        if fl: cx['fold'] = fl
        # 말투 통일본(해요체) 반영
        if cx.get('g'): cx['g'] = [TONE.get(f'g|{b}|{c}|{i}', x.replace('읽기 길잡이 · ', '')) for i, x in enumerate(cx['g'])]
        for j, f in enumerate(cx.get('fold', [])):
            f[4] = [TONE.get(f'f|{b}|{c}|{j}|{i}', l) for i, l in enumerate(f[4])]
        if cx: X[str(c)] = cx
    json.dump(X, open(f'{APP}/bible/x/{b:02d}.json', 'w'), ensure_ascii=False, separators=(',', ':'))

# ---------- 8) 해설 카드 (말투 다듬은 결과 반영) ----------
NO = {}
for f in sorted(glob.glob(f'{R0}/notes/out/*.jsonl')):
    for l in open(f):
        o = json.loads(l); NO[o['id']] = o
def build_note(nid):
    n = json.loads(json.dumps(NR[nid])); o = NO.get(nid)
    if o:
        n['brief'] = o.get('brief') or n['brief']
        for bi, ii, pi, t in o.get('ps', []):
            try: n['blocks'][bi]['items'][ii]['p'][pi] = t
            except Exception: pass
    bl = []
    for blk in n['blocks']:
        its = []
        for it in blk['items']:
            ps = [p for p in it['p'] if p and p.strip()]
            if not (ps or it['terms'] or it.get('form')): continue
            x = {}
            if it['h']: x['h'] = it['h']
            if ps: x['p'] = ps
            if it['terms']: x['tm'] = it['terms']
            if it.get('form'): x['f'] = it['form']
            if it['src']: x['src'] = it['src']
            its.append(x)
        if its: bl.append({'s': re.sub(r'\s*—\s*조금 더 읽기$', '', blk['s']), 'it': its})
    out = {'k': n['k'], 'b': n['badge'], 'l': n['loc'], 't': n['title'], 's': n['brief']}
    if n['terms']: out['tm'] = n['terms']
    if bl: out['bl'] = bl
    if n['src']: out['src'] = n['src']
    return out
N2 = {}
for f in sorted(glob.glob(f'{R0}/notes2/out/*.json')):
    o = json.load(open(f)); N2[o['id']] = o
def build_note2(nid):
    o = N2[nid]; old = NR.get(nid, {})
    out = {'k': o.get('k') or old.get('k'), 'b': old.get('badge', ''), 'l': o.get('ref') or old.get('loc', ''), 't': o['title'], 's': o.get('core', '')}
    tm = [list(x)[:3] for x in o.get('expr') or [] if x and x[0]]
    if tm: out['tm'] = tm
    bl = []
    if o.get('body'): bl.append({'s': '본문 해설', 'it': [{'p': [p for p in o['body'] if p.strip()]}]})
    its = [{'h': d.get('h', ''), 'p': [p for p in d.get('p') or [] if p.strip()]} for d in o.get('deep') or [] if d.get('p')]
    if its: bl.append({'s': '더 깊이 읽기', 'it': its})
    if bl: out['bl'] = bl
    src = [[x.get('t', ''), x.get('u', '')] for x in o.get('src') or [] if x.get('t') or x.get('u')]
    if src: out['src'] = src
    return out
allnotes = 0; newnotes = 0
for book, b, let, pkey in BOOKS:
    d = {nid: (build_note2(nid) if nid in N2 else build_note(nid)) for nid in sorted(used_notes[b]) if nid in NR}
    newnotes += sum(1 for nid in d if nid in N2)
    allnotes += len(d)
    json.dump(d, open(f'{APP}/bible/nt/{b:02d}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(dict(stats), 'notes per-book total', allnotes, 'new cards', newnotes, 'new cards not linked', sorted(set(N2) - set().union(*used_notes.values()))[:20])
# ---------- 9) 신약 사본 차이 메모 (원어 대조 10-18, 확인된 것만) ----------
VN = collections.defaultdict(lambda: collections.defaultdict(dict)); nvar = nchk = 0
for o in json.load(open('/home/claude/bw/verify/notes.json')):
    if o.get('t') != 'var' or o['b'] < 40: continue
    if '확인 필요' in o['note']: nchk += 1; continue
    VN[o['b']][str(o['c'])].setdefault(str(o['v']), []).append({'he': '', 'rd': '', 'm': '사본 차이', 't': o['note']}); nvar += 1
for b, d in VN.items():
    json.dump({c: {'vn': dict(v)} for c, v in d.items()}, open(f'{APP}/bible/x/{b:02d}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('NT var memos', nvar, 'books', sorted(VN), 'held (확인 필요)', nchk)
json.dump(sorted(set(range(1, 13)) | set(VN)), open(f'{APP}/bible/xbooks.json', 'w'))
for p in sorted(glob.glob(f'{APP}/bible/*/*.json'))[:0]: pass
os.system(f'du -sh {APP}/bible/mz {APP}/bible/x {APP}/bible/nt {APP}/bible/he; ls -la {APP}/bible/lin.json')

# ---------- 10) 13~66권 인물·지명 연결 (10-24): 1~12권에서 쓴 카드를 같은 사람·같은 곳에만 연결 ----------
import linkrules
LT = collections.defaultdict(set); LK = {}
for b in range(1, 13):
    for c, cx in json.load(open(f'{APP}/bible/x/{b:02d}.json')).items():
        for v, ls in (cx.get('ln') or {}).items():
            for nid, term, kind in ls:
                if kind in ('person', 'place'): LT[term].add(nid); LK[nid] = kind
PART2 = ["이라고", "이라", "이었", "이고", "이며", "이요", "이니", "이에", "이지", "이시", "이신", "이셨", "이야", "이랑", "이네", "이여", "이다", "에게", "에서", "한테", "처럼", "보다", "부터", "까지", "으로", "하고", "조차", "마저",
         "이", "가", "은", "는", "을", "를", "의", "에", "과", "와", "도", "만", "님", "로", "였", "뿐", "씨", "네", "왕", "성", "들"]
def findterm2(text, term):
    i = text.find(term)
    while i >= 0:
        j = i + len(term); before = text[i - 1] if i > 0 else ''; rest = text[j:j + 3]
        if not isHan(before) and (not isHan(text[j:j + 1]) or any(rest.startswith(p) for p in PART2)): return i
        i = text.find(term, j)
    return -1
def allowed(scope, ex, b, c):
    if ex and (b, c) in ex: return False
    if scope is None: return True
    return b in scope or (b, c) in scope
RULE = {}
for term, ids in LT.items():
    if term in linkrules.DROP: continue
    if term in linkrules.R:
        RULE[term] = [(r[0], r[1], r[2] if len(r) > 2 else None) for r in linkrules.R[term]]
    elif len(ids) == 1:
        RULE[term] = [(next(iter(ids)), None, None)]
lnk = collections.Counter(); used13 = collections.defaultdict(set); review = []
XB = set(json.load(open(f'{APP}/bible/xbooks.json')))
for b in range(13, 67):
    xp = f'{APP}/bible/x/{b:02d}.json'
    X = json.load(open(xp)) if os.path.exists(xp) else {}
    nchap = len(json.load(open(f'{KRV}/{b:02d}.json')))
    for c in range(1, nchap + 1):
        ch = MZ[b][c - 1]
        if not ch: continue
        seen = set(); ln = {}
        for n, text in enumerate(ch['v'], 1):
            flat = text.replace('\n', ' ')
            for term in sorted(RULE, key=len, reverse=True):
                for nid, scope, ex in RULE[term]:
                    if nid in seen or not allowed(scope, ex, b, c): continue
                    if findterm2(flat, term) >= 0:
                        ln.setdefault(str(n), []).append([nid, term, LK.get(nid, 'person')]); seen.add(nid); used13[b].add(nid); lnk[term] += 1
        if ln:
            X.setdefault(str(c), {})['ln'] = ln
    if X:
        json.dump(X, open(xp, 'w'), ensure_ascii=False, separators=(',', ':')); XB.add(b)
    if used13[b]:
        d = {nid: (build_note2(nid) if nid in N2 else build_note(nid)) for nid in sorted(used13[b]) if nid in NR}
        json.dump(d, open(f'{APP}/bible/nt/{b:02d}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(sorted(XB), open(f'{APP}/bible/xbooks.json', 'w'))
print('13~66 links', sum(lnk.values()), 'terms', len(lnk), 'books', len(used13), 'cards', len(set().union(*used13.values())))
json.dump(dict(lnk.most_common()), open(f'{R0}/notes2/links_13_66.json', 'w'), ensure_ascii=False, indent=0)

# ---------- 11) 13~66권 새 해설 카드(notes3/out): 선정한 낱말에 밑줄 + also 자리에도 ----------
N3 = {}
for f in sorted(glob.glob(f'{R0}/notes3/out/*.json')):
    o = json.load(open(f)); N3[o['id']] = o; N2[o['id']] = o
BK = {nm: i + 1 for i, nm in enumerate(json.load(open(f'{R0}/book_names.json')))}
def parse_ref(r):
    m = re.match(r'^\s*(.+?)\s+(\d+):(\d+)', r or '')
    return (BK.get(m.group(1)), int(m.group(2)), int(m.group(3))) if m and BK.get(m.group(1)) else None
add3 = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(list)))
n3 = 0
for nid, o in N3.items():
    spots = [(o['b'], o['c'], o['v'])] + [p for p in (parse_ref(r) for r in o.get('also') or []) if p]
    for b, c, v in spots:
        ch = MZ.get(b) and MZ[b][c - 1]
        if not ch or v > len(ch['v']): continue
        if findterm2(ch['v'][v - 1].replace('\n', ' '), o['term']) < 0: continue
        add3[b][c][str(v)].append([nid, o['term'], o.get('k') or 'hebrew']); n3 += 1
XB = set(json.load(open(f'{APP}/bible/xbooks.json')))
for b, chs in add3.items():
    xp = f'{APP}/bible/x/{b:02d}.json'; X = json.load(open(xp)) if os.path.exists(xp) else {}
    for c, vs in chs.items():
        ln = X.setdefault(str(c), {}).setdefault('ln', {})
        for v, ls in vs.items():
            cur = ln.setdefault(v, [])
            for l in ls:
                if not any(x[0] == l[0] for x in cur): cur.append(l)
    json.dump(X, open(xp, 'w'), ensure_ascii=False, separators=(',', ':')); XB.add(b)
    np_ = f'{APP}/bible/nt/{b:02d}.json'; d = json.load(open(np_)) if os.path.exists(np_) else {}
    for c, vs in chs.items():
        for v, ls in vs.items():
            for l in ls: d[l[0]] = build_note2(l[0])
    json.dump(d, open(np_, 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(sorted(XB), open(f'{APP}/bible/xbooks.json', 'w'))
print('13~66 new cards', len(N3), 'underlines', n3)
