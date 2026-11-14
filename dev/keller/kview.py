# 앱 화면과 같은 순서·나눔으로 읽기용 텍스트를 만듦 (keller_v50.js kelSentences/kelChunks/kelParaHtml와 같은 규칙)
# python3 -I kview.py KEL_DIR
import sys, os, json, glob, re
K = sys.argv[1]
OPEN = set('“‘「『('); CLOSE = set('”’」』)')
def sentences(t):
    out, depth, st, i = [], 0, 0, 0
    while i < len(t):
        c = t[i]
        if c in OPEN: depth += 1
        elif c in CLOSE and depth > 0: depth -= 1
        if depth == 0 and c in '.?!…':
            if c == '.' and i > 0 and re.match(r'[A-Za-z0-9]', t[i-1]) and (i < 2 or not re.match(r'[A-Za-z0-9]', t[i-2])): i += 1; continue
            j = i + 1
            while j < len(t) and re.match(r'[”’」』)\].?!…]', t[j]): j += 1
            mk = re.match(r'\[(주\s?\d+|자료[^\]]{0,20})\]', t[j:])
            if mk: j += len(mk.group(0))
            if j >= len(t) or t[j] == ' ': out.append(t[st:j]); st = j + 1; i = j
        i += 1
    if st < len(t): out.append(t[st:])
    return [x.strip() for x in out if x.strip()]
def dep(prev, s):
    if len(s) < 28: return True
    if re.match(r'^(그렇지요|그렇죠|맞습니다|아닙니다|네[,.]|예[,.]|왜냐하면|그러니까요|즉|곧|다시 말해|바로|그것은|그것이|이것은|이것이|그래서요)', s): return True
    if re.search(r'(때문입니다|때문이지요|때문이에요|때문이다)[.”’」』)]*$', s): return True
    if re.match(r'^[“‘「『]', s) and re.search(r'(말합니다|말했습니다|물었습니다|묻습니다|이렇습니다|이렇게|같습니다|합니다)[.:]?\s*$', prev): return True
    if re.search(r'[:：]$', prev) or re.search(r'(이렇습니다|다음과 같습니다|이렇게 말합니다|이렇게 물었습니다|이렇게 말했습니다)\.$', prev): return True
    return False
def chunks(t, join=()):
    return [t]
    out, cur, ln = [], [], 0
    for s in sentences(t):
        prev = cur[-1] if cur else ''
        if cur and not dep(prev, s) and (ln >= 140 and (ln + len(s) > 260 or len(cur) >= 3)): out.append(' '.join(cur)); cur, ln = [], 0
        cur.append(s); ln += len(s)
    if cur:
        if out and ln < 90: out[-1] += ' ' + ' '.join(cur)
        else: out.append(' '.join(cur))
    for i in range(len(out) - 1, 0, -1):
        if any(j and out[i].startswith(j) for j in join): out[i-1] += ' ' + out[i]; del out[i]
    return out
pk = json.load(open(os.path.join(K, 'keller_pack.json'), encoding='utf-8'))
for s in pk['sermons']:
    ov = s.get('ov') or {}; L = [f"# {s['title']}" + (f" — {s['sub']}" if s.get('sub') else ''), f"[편집자 첫 질문] {ov.get('open','')}", '']
    pn = 0
    for i, x in enumerate(s['secs']):
        o = (ov.get('secs') or [{}] * 99)[i] if i < len(ov.get('secs') or []) else {}
        L.append(f"## [S{i}] {x['h']}")
        if o.get('hook') and not o.get('rest'): L.append(f"[편집자 훅] {o['hook']}")
        for bi, b in enumerate(x['b']):
            k, t = b['k'], b['t']
            if k in ('h2',): L.append(f"### {t}"); continue
            if k in ('sp',): L.append(f"[화자] {t}"); continue
            if k in ('qq', 'em', 'note', 'li'): L.append(f"[{ {'qq':'질문','em':'원고 굵은 줄','note':'편집자 주(원고)','li':'목록'}[k] }] {t}"); continue
            if b.get('sp'): L.append(f"[화자] {b['sp']}")
            for ch in ([t] if k == 'q' else chunks(t, ov.get('join') or ())):
                rest = ch; hits = sorted([e for e in (o.get('em') or []) if e and e in rest], key=lambda e: rest.index(e))
                BIT = r"^[\s“”‘’'\"「」『』()\[\].,!?…·]*(\[(주\s?\d+|자료[^\]]{0,20})\][\s”’」』).,!?]*)?$"
                for e in hits:
                    j = rest.find(e)
                    if j < 0: continue
                    pre = rest[:j].strip(); em = e; rest = rest[j+len(e):].strip()
                    if pre and re.match(BIT, pre): em = pre + em; pre = ''
                    elif pre and pre[-1] in '“‘「『': em = pre[-1] + em; pre = pre[:-1].strip()
                    tl = re.match(r'^[”’」』)\].,!?…]*(\[(주\s?\d+|자료[^\]]{0,20})\])?[”’」』).,!?]*', rest)
                    if tl and tl.group(0): em += tl.group(0); rest = rest[len(tl.group(0)):].strip()
                    if rest and re.match(BIT, rest): em += rest; rest = ''
                    if pre: pn += 1; L.append(f"<P{pn}> {'> ' if k=='q' else ''}{pre}")
                    L.append(f"[강조 줄] {em}")
                if rest: pn += 1; L.append(f"<P{pn}> {'> ' if k=='q' else ''}{rest}")
        if o.get('key') and not o.get('rest'): L.append(f"[이 장의 한 줄] {o['key']}")
        if i + 1 < len(s['secs']):
            nx = (ov.get('secs') or [])[i+1] if i + 1 < len(ov.get('secs') or []) else {}
            L.append(f"[다음 미리보기] {s['secs'][i+1]['h']}")
        L.append('')
    L.append(f"[편집자 한 문장] {ov.get('one','')}")
    open(os.path.join(K, 'view', s['id'] + '.txt'), 'w', encoding='utf-8').write('\n'.join(L))
print('ok', len(pk['sermons']))
