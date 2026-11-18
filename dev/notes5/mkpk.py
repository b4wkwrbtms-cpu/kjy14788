# 카드마다 '자료 꾸러미'를 미리 만든다 → 작업자는 이것부터 읽고, 웹은 주석·설교자 확인에만 쓴다.
# 출력: /home/claude/renewal/notes5/pk/{id}.json
import json, os, glob, re, sys, subprocess, unicodedata, collections
import json as _j, os as _o
KEL = _j.load(open('/home/claude/private/keller/idx.json')) if _o.path.exists('/home/claude/private/keller/idx.json') else {'v': {}, 'meta': {}}
R = '/home/claude/renewal'; BW = '/home/claude/bw'
L = '/home/claude/data_src/STEPBible-Data/Lexicons/'
sel = {}
for f in ['ot_selection.json', 'nt_selection.json']:
    for it in json.load(open(f'{R}/notes3/{f}')): sel[it['id']] = it
plan = json.load(open(f'{R}/notes3/plan_13_66.json'))
done = set(os.path.basename(f)[:-5] for f in glob.glob(f'{R}/notes3/out/*.json'))
rem = [i for b in plan for i in b['ids'] if i not in done]
# 사전 (Strong → 짧은 항목)
LEX = {}
for fn, pre in [(glob.glob(L + '*TBESH*')[0], 'H'), (glob.glob(L + '*TBESG*')[0], 'G')]:
    for line in open(fn, encoding='utf-8'):
        if not re.match(pre + r'\d{4}', line): continue
        p = line.rstrip('\n').split('\t')
        if len(p) < 8: continue
        k = p[0][:5]
        if k in LEX: continue
        LEX[k] = {'lemma': p[3], 'tr': p[4], 'morph': p[5], 'gloss': p[6], 'def': re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', p[7]))[:700]}
GLEM = {v['lemma']: k for k, v in LEX.items() if k[0] == 'G'}
def strip(s): return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
GLEM2 = {strip(k).lower(): v for k, v in GLEM.items()}
smv = json.load(open(f'{R}/app/bible/smv.json'))
SM = {s['sid']: s for s in json.load(open(f'{R}/app/bible/sm.json'))}
refs = {}
def sref(sid):
    if sid not in refs: refs[sid] = json.load(open(f'/home/claude/sermons/refs/{sid}.json'))
    return refs[sid]
# 이미 있는 카드(같은 원어·같은 낱말) — 연결 후보
def norm(s):
    s = re.sub(r'[֑-ׇ]', '', s or ''); s = strip(s.lower()); return re.sub(r'[^א-תα-ω\w]', '', s)
EX = collections.defaultdict(list)
for f in glob.glob(f'{R}/notes2/out/*.json') + glob.glob(f'{R}/notes3/out/*.json'):
    try: c = json.load(open(f))
    except Exception: continue
    cid = os.path.basename(f)[:-5]
    for e in (c.get('expr') or [])[:1]:
        if e and e[0]: EX[norm(e[0])].append([cid, c.get('title', ''), c.get('ref', '')])
    if c.get('term'): EX['T:' + c['term']].append([cid, c.get('title', ''), c.get('ref', '')])
os.makedirs(f'{R}/notes5/pk', exist_ok=True)
n = 0
for i in rem:
    s = sel.get(i)
    if not s: continue
    b, c, v = s['b'], s['c'], s['v']
    bo = json.load(open(f'{BW}/bout/{b:02d}/{c:03d}.json'))['v']
    ctx = {str(k): bo[k - 1] for k in range(max(1, v - 3), min(len(bo), v + 3) + 1)}
    try: og = json.load(open(f'{BW}/orig/{b:02d}/{c:03d}.json'))
    except Exception: og = {}
    words = og.get(str(v), [])
    onote = ''
    if og and len(og) != len(bo):
        onote = f'주의: 이 장은 히브리어/헬라어 절 수({len(og)})와 우리 절 수({len(bo)})가 달라요. orig_words는 원문 절 번호 {v} 기준이라 다른 절일 수 있어요. 우리 절과 맞는 원문은 krv_bin 파일과 orig_near(원문 {v-1}~{v+1}절)에서 확인하세요.'
        near = {str(k): og.get(str(k), []) for k in (v - 1, v + 1) if str(k) in og}
    else: near = {}
    lex = []
    seen = set()
    for w, lem, mo in words:
        if b <= 39:
            for num in re.findall(r'(\d{1,4})', lem):
                k = f'H{int(num):04d}'
                if k in LEX and k not in seen: seen.add(k); lex.append([w, k, LEX[k]['lemma'], LEX[k]['tr'], LEX[k]['gloss'], LEX[k]['def'][:260]])
        else:
            k = GLEM.get(lem) or GLEM2.get(strip(lem).lower())
            if k and k not in seen: seen.add(k); lex.append([w, k, lem, LEX[k]['tr'], LEX[k]['gloss'], LEX[k]['def'][:260]])
    # 설교 언급 (장진명·유기성): 이 절 ± 같은 장 전체 언급
    sm = []
    d = smv.get(f'{b}:{c}', {})
    for vv, lst in (d.get('v') or {}).items():
        if abs(int(vv) - v) <= 2:
            for sid, k in lst:
                r = sref(sid)[k]; sm.append({'sid': sid, 'title': SM[sid]['title'], 'who': SM[sid]['preacher'], 'book': SM[sid].get('place', ''), 'v': int(vv), 'how': r.get('how', ''), 'quote': r.get('quote', ''), 'full': f'/home/claude/sermons/full/{sid}.json'})
    whole = [sid for sid, s2 in SM.items() if any(B == b and C == c for B, C, *_ in s2.get('spans', []))]
    ex = EX.get(norm(s.get('orig', '')), []) + EX.get('T:' + s['term'], [])
    kp = []
    for sid, ln, kind in KEL['v'].get(f'{b}:{c}', {}).get('v', {}).get(str(v), []):
        m = KEL['meta'][sid]
        kp.append({'sid': sid, 'kind': kind, 'title': m['title'], 'en': m['en'], 'date': m['date'], 'main': m['main'], 'path': m['path'], 'line': ln})
    kp.sort(key=lambda x: x['kind'] != 'main')
    pk = {'id': i, 'sel': s, 'keller_private': kp[:6], 'context': ctx, 'krv_bin': f'{BW}/bin/{b:02d}/{c:03d}.txt', 'orig_words': words, 'orig_note': onote, 'orig_near': near, 'lexicon': lex[:14],
          'sermons_on_this_verse': sm[:8], 'sermons_on_this_chapter': whole,
          'existing_cards_same_word': [list(x) for x in {tuple(e) for e in ex}][:4],
          'note': '사전은 STEPBible TBESH(축약 BDB)/TBESG(Abbott-Smith) 요약. 더 보려면 python3 /home/claude/bw/lex/lex.py <번호> (full). 고유명사는 lex.py name <영어 이름>.'}
    json.dump(pk, open(f'{R}/notes5/pk/{i}.json', 'w'), ensure_ascii=False, indent=0); n += 1
print('packets', n)
