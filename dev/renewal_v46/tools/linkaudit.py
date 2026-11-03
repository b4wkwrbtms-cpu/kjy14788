# 해설 링크 원어 검증 (11-03 사용자: "하늘에서 내려온 만나" 카드가 "그를 만나"에 붙는 식의 엉뚱한 링크 전부 검토)
#  모든 ln 링크마다: 카드의 원어 낱말(스트롱 번호 / 헬라어 표제어)이 그 절(±1절)에 실제로 있는지 확인, 없으면 링크 제거
import json, os, re, glob, collections, unicodedata, sys
R0 = '/home/claude/renewal'; APP = f'{R0}/app'; ORIG = '/home/claude/bw/orig'
BK = {nm: i + 1 for i, nm in enumerate(json.load(open(f'{R0}/book_names.json')))}
ABBR = {'창': 1, '출': 2, '레': 3, '민': 4, '신': 5, '수': 6, '삿': 7, '룻': 8, '삼상': 9, '삼하': 10, '왕상': 11, '왕하': 12, '대상': 13, '대하': 14, '스': 15, '느': 16, '에': 17, '욥': 18, '시': 19, '잠': 20, '전': 21, '아': 22, '사': 23, '렘': 24, '애': 25, '겔': 26, '단': 27, '호': 28, '욜': 29, '암': 30, '옵': 31, '욘': 32, '미': 33, '나': 34, '합': 35, '습': 36, '학': 37, '슥': 38, '말': 39,
        '마': 40, '막': 41, '눅': 42, '요': 43, '행': 44, '롬': 45, '고전': 46, '고후': 47, '갈': 48, '엡': 49, '빌': 50, '골': 51, '살전': 52, '살후': 53, '딤전': 54, '딤후': 55, '딛': 56, '몬': 57, '히': 58, '약': 59, '벧전': 60, '벧후': 61, '요일': 62, '요이': 63, '요삼': 64, '유': 65, '계': 66}
HEB = re.compile(r'[֐-׿]'); GRK = re.compile(r'[Ͱ-Ͽἀ-῿]')

FINAL = str.maketrans('ךםןףץ', 'כמנפצ')
def cons(w):
    w = unicodedata.normalize('NFD', w)
    return ''.join(ch for ch in w if not unicodedata.combining(ch) and ch not in '־׀/').lower().replace('ς', 'σ').translate(FINAL)
def segs(form):  # 'וּ/מִ/פָּנֶי/ךָ' → 어간 후보들: 전체, 마지막 큰 조각, 접두 뺀 나머지
    parts = [cons(p) for p in form.split('/')]
    out = {''.join(parts)}
    big = [p for p in parts if len(p) > 1]
    if big: out.add(big[-1]); out.add(''.join(big))
    return {x for x in out if x}

_OC = {}
def orig(b, c):
    k = (b, c)
    if k not in _OC:
        p = f'{ORIG}/{b:02d}/{c:03d}.json'
        _OC[k] = json.load(open(p)) if os.path.exists(p) else None
    return _OC[k]
def lemma(b, w):
    if b >= 40: return cons(w[1])
    s = (w[1] or '').split('/')[-1].strip()
    return s
def refs_of(s):
    out = []
    for m in re.finditer(r'(창|출|레|민|신|수|삿|룻|삼상|삼하|왕상|왕하|대상|대하|스|느|에|욥|시|잠|전|아|사|렘|애|겔|단|호|욜|암|옵|욘|미|나|합|습|학|슥|말|마|막|눅|요일|요이|요삼|요|행|롬|고전|고후|갈|엡|빌|골|살전|살후|딤전|딤후|딛|몬|히|약|벧전|벧후|유|계|[가-힣]+?)\s*(\d+):(\d+)(?:[–-](\d+))?', s or ''):
        nm = m.group(1); b = BK.get(nm) or ABBR.get(nm)
        if not b: continue
        v1 = int(m.group(3)); v2 = int(m.group(4) or v1)
        for v in range(v1, min(v2, v1 + 6) + 1): out.append((b, int(m.group(2)), v))
    return out

def load_cards():
    NR = json.load(open(f'{R0}/ex/notes_raw.json'))
    C = {}
    for nid, n in NR.items():
        C[nid] = {'ex': [t[0] for t in n.get('terms') or [] if t and t[0]], 'at': refs_of(n.get('loc', ''))}
    for f in glob.glob(f'{R0}/notes2/out/*.json'):
        o = json.load(open(f)); c = C.setdefault(o['id'], {'ex': [], 'at': []})
        c['ex'] = [t[0] for t in o.get('expr') or [] if t and t[0]] + c['ex']
        c['at'] = refs_of(o.get('ref', '')) + c['at']
    SEL = {}
    for sf in (f'{R0}/notes3/ot_selection.json', f'{R0}/notes3/nt_selection.json'):
        if os.path.exists(sf):
            for o in json.load(open(sf)): SEL[o['id']] = o
    for f in glob.glob(f'{R0}/notes3/out/*.json'):
        o = json.load(open(f)); c = C.setdefault(o['id'], {'ex': [], 'at': []})
        s = SEL.get(o['id']) or {}
        c['ex'] = ([s['orig']] if s.get('orig') else []) + [t[0] for t in o.get('expr') or [] if t and t[0]] + c['ex']
        c['at'] = [(o['b'], o['c'], o['v'])] + [p for r in (o.get('also') or []) for p in refs_of(r)] + [p for r, t in (o.get('alt') or []) for p in refs_of(r)] + c['at']
    return C

_LEX = {}
def lexicon(nt):
    """말뭉치 전체에서 표면형(자음) → 그 꼴로 나오는 표제어들(빈도)"""
    if nt in _LEX: return _LEX[nt]
    cnt = collections.defaultdict(collections.Counter)
    for b in (range(40, 67) if nt else range(1, 40)):
        for f in glob.glob(f'{ORIG}/{b:02d}/*.json'):
            for v, ws in json.load(open(f)).items():
                for w in ws:
                    mo = (w[2] or ''); parts = mo[1:].split('/') if not nt else [mo]
                    if not any(p[:1] in 'NVA' for p in parts): continue          # 전치사·접속사·대명사 같은 기능어는 사전에서 뺌 (מן '~에서'가 만나(מן)로 잡히지 않게)
                    lm = lemma(b, w)
                    for sg in segs(w[0]): cnt[sg][lm] += 1
    _LEX[nt] = cnt
    return cnt
_FREQ = {}
def freq(nt):
    if nt in _FREQ: return _FREQ[nt]
    f = collections.Counter()
    for b in (range(40, 67) if nt else range(1, 40)):
        for fn in glob.glob(f'{ORIG}/{b:02d}/*.json'):
            for v, ws in json.load(open(fn)).items():
                for w in ws: f[lemma(b, w)] += 1
    _FREQ[nt] = f
    return f

def card_alts(c):
    """카드 원어 표현마다 하나의 '대안': 토큰별 표제어 집합 목록(모든 토큰이 절에 있어야 함) + 표면형(3자 이상이면 꼴 그대로 맞아도 됨)"""
    alts = []
    for ex in [e.strip() for ex0 in c['ex'] for e in re.split(r'\s*[/·]\s*', ex0) if e.strip()]:
        toks = [cons(t) for t in re.split(r'[\s,־]+', ex) if len(cons(t)) >= 2 and (HEB.search(t) or GRK.search(t))]
        if not toks: continue
        nt = bool(GRK.search(ex))
        per = []; names = []
        for t in toks:
            got = set(); np_ = False
            for b, ch, v in c['at']:
                if (b >= 40) != nt: continue
                O = orig(b, ch)
                if not O: continue
                for vv in (v, v - 1, v + 1):
                    for w in O.get(str(vv), []):
                        ss = segs(w[0]); lm = lemma(b, w)
                        if t in ss or (nt and (t == lm or (len(t) >= 4 and (lm.startswith(t[:5]) or t.startswith(lm[:5]))))):
                            got.add(lm)
                            if 'Np' in (w[2] or '') or (nt and lm[:1] != lm[:1].lower()): np_ = True
            if not got or len(toks) == 1:                                        # 낱말 하나짜리는 사전도 합침(כהן 동사/명사), 숙어는 기준 절 것만(דבר 1697 vs 1698)
                lx = lexicon(nt).get(t, {}); tot = sum(lx.values())
                got |= {lm for lm, n in lx.items() if n >= 2 or n >= 0.1 * tot}  # 한 번뿐인 꼴(잡음)은 뺌
            per.append((t, got))
            if np_ and got: names.append([(t, got)])
        if all(g for _, g in per): alts.append(per)
        if len(per) > 1: alts.extend(names)        # 여러 낱말 표현 속 고유명사(헤만 המשורר → 헤만)는 혼자서도 대안
    return alts

# 우리말 낱말이 가리키는 다른 원어 표제어(옮기면서 단위·개념을 풀어 쓴 자리): 그 절에 이것이 있어도 링크 유지
EXTRA = {'에바': ['6241'], '세겔': ['1235', '3701', '2091', '4948'], '증거궤': ['5715'], '제사장': ['3550'], '유산': ['5157', '3423', '4181'], '이삭': ['3446'],
         '하늘의 하나님': ['8065'], '언제까지예요': ['4970'], '회당': ['αποσυναγωγοσ'], '나그네': ['4033', '1481 a'], '파라오': ['6547'], '안식년': ['7676'], '제비': ['5307'], '아람': ['762'],
         '라합': ['ραχαβ'], '므낫세': ['4520'], '아마실': ['6593'], '아마포': ['6593', '8336'], '베냐민': ['1145'], '여호야긴': ['3112'], '사마리아': ['8115'], '두로': ['τυριοσ'], '시돈': ['σιδωνιοσ'], '갈릴리': ['γαλιλαιοσ'], '이집트': ['αιγυπτιοσ'], '살몬': ['σαλα']}

_KL = {}
def krv_len(b, c):
    if b not in _KL: _KL[b] = json.load(open(f'{R0}/app/bible/mz/{b:02d}.json'))
    ch = _KL[b][c - 1] if c - 1 < len(_KL[b]) else None
    return len(ch['v']) if ch else 0

def verse_lemmas(b, c, v, wide=1):
    """절(±wide)의 표제어·표면형. 장 절 수가 원어와 다르면(장 경계가 다른 곳) 폭을 넓히고 이웃 장 끝·처음도 본다."""
    O = orig(b, c)
    if O is None: return None
    if str(v) not in O and wide < 100: return None          # 원어에 그 절이 없음(장 경계 차이) → 판단 보류
    n = max((int(k) for k in O), default=0)
    if wide < 100 and n != krv_len(b, c): wide = max(wide, 3)
    L = set(); F = set()
    def add(OO, vv):
        for w in OO.get(str(vv), []): L.add(lemma(b, w)); F.update(segs(w[0]))
    for vv in range(v - wide, v + wide + 1): add(O, vv)
    if wide < 100:
        P = orig(b, c - 1) if c > 1 else None
        if P and b != 19:
            d = krv_len(b, c - 1) - max((int(k) for k in P), default=0)   # 앞 장 절 수 차이만큼 이 장 전체가 밀림(레 6, 민 30 등)
            if d and 1 <= v + d <= n:
                for vv in range(v + d - 1, v + d + 2): add(O, vv)
        if P:
            m = max((int(k) for k in P), default=0); mk = krv_len(b, c - 1)
            if m > mk and v <= m - mk + 3:            # 앞 장이 원어에서 더 길면 이 장 첫 절들은 원어 앞 장 끝에 있음
                for vv in range(mk + v - 3, mk + v + 4): add(P, vv)
        if n < krv_len(b, c):                          # 이 장이 원어에서 더 짧으면 뒷 절들은 원어 다음 장 처음에 있음
            Nn = orig(b, c + 1)
            if Nn and v > n - 3:
                for vv in range(max(1, v - n - 3), v + 4): add(Nn, vv)
    return L, F

def form_hit(t, F, name=False):
    if len(t) >= 3 and t in F: return True
    if name and len(t) >= 2:
        if any(t + sfx in F for sfx in ('י', 'ימ', 'ית', 'יה', 'ה', 'מ')): return True   # 르우벤 → 르우벤 사람(ראובני), 구스 → 구스 사람 (끝글자는 cons()에서 보통 꼴로)
        m = lambda x: x.replace('ו', '').replace('י', '')
        mt = m(t)
        if len(mt) >= 3 and any(len(f) <= len(t) + 3 and m(f) in (mt, mt + 'ת', mt + 'מ') and f.endswith(('י', 'ימ', 'ית', 'יה')) for f in F): return True   # 시므온 → שמעני, 에돔 → אדמי
    if len(t) >= 4: return any(f.startswith(t) or (len(f) >= 4 and t.startswith(f)) for f in F)
    return False

def verse_has(b, c, v, alts, wide=1, name=False, extra=()):
    r = verse_lemmas(b, c, v, wide)
    if r is None: return None
    L, F = r
    if any(x in L for x in extra): return True
    for per in alts:
        if not all((g & L) or form_hit(t, F, name) for t, g in per): continue
        if len(per) == 1: return True
        nt = b >= 40; fq = freq(nt); lim = 150 if nt else 300
        # 여러 낱말 표현은 흔한 낱말만으로 이뤄지면(דבר יום ביומו '그날그날') 아무 절에나 걸리므로, 드문 낱말이 하나는 맞아야 함
        if any(any(fq[lm] < lim for lm in (g & L)) or (len(t) >= 4 and form_hit(t, F, name)) for t, g in per): return True
        if sum(1 for t, g in per if len(t) >= 3 and t in F) >= 2: return True      # 두 낱말 이상 꼴 그대로 맞으면(באר שבע) 그 자체로 특정됨
    return False

isHan = lambda ch: bool(ch) and '가' <= ch <= '힣'
PART = ["이라고", "이라", "이었", "이고", "이며", "이요", "이니", "이에", "이지", "이시", "이신", "이셨", "이야", "이랑", "이네", "이여", "이다", "에게", "에서", "한테", "처럼", "보다", "부터", "까지", "으로", "하고", "조차", "마저",
        "이", "가", "은", "는", "을", "를", "의", "에", "께", "과", "와", "도", "만", "아", "야", "여", "님", "라", "랑", "로", "였", "뿐", "씨", "네", "다", "요", "왕", "성", "들"]
def bounded(text, term):
    i = text.find(term)
    while i >= 0:
        j = i + len(term); before = text[i - 1] if i > 0 else ''; rest = text[j:j + 3]
        if not isHan(before) and (not isHan(text[j:j + 1]) or any(rest.startswith(p) for p in PART)): return True
        i = text.find(term, j)
    return False

# 구약 카드(히브리어)가 신약 절에, 또는 그 반대로 걸릴 때: 우리말 낱말 ↔ 그 언어 표제어를 말뭉치에서 통계로 맞춤
_AL = {}
def align(term, nt):
    key = (term, nt)
    if key in _AL: return _AL[key]
    import importlib
    hits = collections.Counter(); nv = 0
    for b in (range(40, 67) if nt else range(1, 40)):
        try: MZb = json.load(open(f'{R0}/app/bible/mz/{b:02d}.json'))
        except Exception: continue
        for ci, ch in enumerate(MZb, 1):
            if not ch: continue
            O = orig(b, ci)
            if not O: continue
            for vi, text in enumerate(ch['v'], 1):
                if not bounded(text.replace('\n', ' '), term): continue
                nv += 1
                for lm in {lemma(b, w) for w in O.get(str(vi), [])}: hits[lm] += 1
    best = None
    if nv >= 2:
        STOP = {'ὁ', 'καί', 'δέ', 'αὐτός', 'ἐν', 'εἰς', 'λέγω', 'εἰμί', 'οὐ', 'σύ', 'ἐγώ', 'ὅς', 'γάρ', 'πρός', 'ἐκ', 'ἐπί', 'μή', 'ὅτι', 'ἀπό', 'διά', 'κατά', 'τίς', 'οὗτος', 'πᾶς', 'ὑμεῖς', 'ἡμεῖς', 'μετά', 'περί', 'ὑπό', 'ἵνα', 'ἄν', 'ἀλλά', 'οὖν', 'γίνομαι', 'ἔχω', 'ποιέω', 'ἐκεῖνος', 'ὡς', 'ἐάν', 'κύριος', 'θεός', 'Ἰησοῦς',
                '853', '3068', '430', '3605', '834 a', '413', '5921 a', '3588 a', '559', '3808', '1961', '776', '1121 a', '376', '3478', '4428', '5971 a', '1696', '3117', '1697', '3027', '6440', '935', '3318', '6213 a', '5414', '7200', '8085', '3947', '5704', '4480 a', '1931', '2088', '3651 c', '6440', '2009', '5750', '3212', '5869 a', '1992', '4100', '4325', '1004 b', '3820 a', '8034', '5315'}
        STOP = {cons(x) for x in STOP}
        for lm, n in hits.most_common(12):
            if lm in STOP: continue
            if n >= max(2, 0.6 * nv): best = lm
            break
    _AL[key] = best
    return best

def run(write=False, report=None):
    C = load_cards(); KEY = {}; ANCHOR = {nid: set(c['at']) for nid, c in C.items()}
    stats = collections.Counter(); dropped = []; nokey = collections.Counter(); unk = []
    for xp in sorted(glob.glob(f'{APP}/bible/x/*.json')):
        b = int(os.path.basename(xp)[:2]); X = json.load(open(xp)); changed = False
        for c, cx in X.items():
            ln = cx.get('ln') or {}
            for v, ls in list(ln.items()):
                keep = []
                for l in ls:
                    nid = l[0]
                    if nid not in KEY: KEY[nid] = card_alts(C.get(nid, {'ex': [], 'at': []}))
                    keys = KEY[nid]
                    if not keys: stats['nokey'] += 1; nokey[nid] += 1; keep.append(l); continue
                    nt = b >= 40
                    if not any(all(bool(GRK.search(t)) == nt for t, g in per) for per in keys):
                        # 카드에 이 절 언어의 원어가 없음(구약 카드 ↔ 신약 절) → 우리말 낱말과 표제어의 통계 정렬로 확인
                        lm = align(l[1], nt)
                        if lm is None: stats['xt_unk'] += 1; keep.append(l); unk.append([b, int(c), int(v), nid, l[1], 'xt']); continue
                        r = verse_lemmas(b, int(c), int(v), 1)
                        if r is None: stats['noorig'] += 1; keep.append(l); continue
                        ex = [cons(x) for x in EXTRA.get(l[1], ())]
                        if lm in r[0] or any(x in r[0] for x in ex) or (len(lm) >= 5 and any(f.startswith(lm[:-1]) for f in r[0])): stats['xt_ok'] += 1; keep.append(l)
                        else: stats['drop'] += 1; stats['xt_drop'] += 1; dropped.append([b, int(c), int(v), nid, l[1], 'xt'])
                        continue
                    if (b, int(c), int(v)) in ANCHOR.get(nid, ()): stats['anchor'] += 1; keep.append(l); continue   # 카드가 직접 다루는 절은 그대로
                    name = l[2] in ('person', 'place'); ex = EXTRA.get(l[1], ())
                    ok = verse_has(b, int(c), int(v), keys, name=name, extra=ex)
                    if ok is None: stats['noorig'] += 1; keep.append(l); unk.append([b, int(c), int(v), nid, l[1], 'noorig']); continue
                    if not ok and (name or l[2] == 'culture') and verse_has(b, int(c), int(v), keys if name else [a for a in keys[:1] if len(a) == 1], wide=200, name=name, extra=ex): ok = True; stats['chap'] += 1   # 이름은 옮기면서 '그'를 이름으로 푼 자리가 있어 같은 장에 있으면 통과
                    if ok: stats['ok'] += 1; keep.append(l)
                    else: stats['drop'] += 1; dropped.append([b, int(c), int(v), nid, l[1]])
                if len(keep) != len(ls):
                    changed = True
                    if keep: ln[v] = keep
                    else: del ln[v]
            if not ln and 'ln' in cx: del cx['ln']
        if changed and write: json.dump(X, open(xp, 'w'), ensure_ascii=False, separators=(',', ':'))
    if report:
        json.dump({'stats': dict(stats), 'dropped': dropped, 'unverified': unk, 'nokey': {k: v for k, v in nokey.most_common()}}, open(report, 'w'), ensure_ascii=False, indent=0)
    print('link audit', dict(stats), 'cards without key', len(nokey))
    return stats, dropped, nokey

if __name__ == '__main__':
    run(write='--write' in sys.argv, report=f'{R0}/notes3/linkaudit.json')
