# 해설·메모 글에서 원어 발음으로 적은 이름을 개역한글(앱 본문) 이름으로: '빈야민' → '베냐민(빈야민)', '예후다(יְהוּדָה)' → '유다(예후다, יְהוּדָה)'
# 발음 칸(tm[1])은 그대로 둔다. 원어 문장을 통째로 소리 옮긴 곳(‘키 민 하마임 메쉬티후’)은 건드리지 않는다.
import json, re, os
R0 = '/home/claude/renewal'
_T = json.load(open(f'{R0}/names/translit.json'))
BAD = {'갈릴','겔릴','메홀리','마노아흐','아페카','자라흐','제라흐','샤울','메소포타미아','타하트','오레브','에이나임','타마르','가트','치윤','브리트','셰올','셰바','로이','이쉬','말레아','마샤','아도나이','라도나이','라아도나이','메여호와','라여호와','바여호와','와여호와','하노크','티글라트','파핫','하다드','아르차','잇테르','레말야후','미츠아르','셸레마','아예','유다이온'}
FIX = {'미츠라임':'이집트','미츠라이마':'이집트','케나안':'가나안','크나안':'가나안','예루샬라임':'예루살렘','야르덴':'요단','하야르덴':'요단','에후드':'에훗','느코':'느고','쉼숀':'삼손','슈넴':'수넴','요나다브':'요나답','요나탄':'요나단','자부드':'사붓','오그':'옥','아하슈베로쉬':'아하수에로','하모리야':'모리아','파리사이오이':'바리새파 사람들','삿두카이오이':'사두개파 사람들','크리스토스':'그리스도','크리스투':'그리스도','셰바':None}
PFX = ('레','베','미','바','하','라','와','리','비','학','합','함','메','밋','브','우','핫','함므','합브','하야')
TR = {}
for p in list(FIX):
    if p not in _T and FIX[p]: _T[p] = FIX[p]
for p, k in _T.items():
    if p in BAD: continue
    k = FIX.get(p, k)
    if not k: continue
    k = re.sub(r'(으|에|이|가|은|는|의|과|와|을|를)$', '', k) if len(k) > 2 and k not in ('사라','레아','가사','라마','미가','시바','에서') else k
    if any(p.startswith(x) and len(p) > len(x) + 1 and (p[len(x):] in _T) for x in PFX): continue   # 앞토씨 붙은 꼴(레모셰 등)은 원어 구절 소리 옮김 안에서만 쓰임
    if p == k: continue
    TR[p] = k
HEBGRK = r'[֐-׿Ͱ-Ͽἀ-῿]'
PAT = re.compile(r'(?<![가-힣])(' + '|'.join(sorted(map(re.escape, TR), key=len, reverse=True)) + r')(?=[^가-힣]|이|가|은|는|을|를|의|와|과|도|로|으로|에|에서|에게|라고|라는|이라|이라고|이라는|예요|이에요|이고|이며|처럼|만|까지|부터|와|랑|이랑|이었|였|이지|인|일|이니|이야|아|야|여|이여|뿐|께|$)')
FOREIGN = set(TR) | set(_T)
VOCAB = set(json.load(open(f'{R0}/names/vocab.json')))
PART = ('이라고','이라는','이라','이에요','예요','에서','에게','으로','처럼','까지','부터','이고','이며','이랑','라고','라는','이','가','은','는','을','를','의','와','과','도','로','에','만','랑','요')
def known(w):
    if w in VOCAB: return True
    for p in PART:
        if w.endswith(p) and w[:-len(p)] in VOCAB: return True
    return False
def fix(text):
    if not text or not isinstance(text, str): return text
    out = []; last = 0; done = set()
    for m in PAT.finditer(text):
        p = m.group(1); k = TR[p]; s, e = m.span(1)
        before = text[max(0, s - 18):s]; after = text[e:e + 3]
        if k in before or k in text[e:e+12]: continue              # 이미 '요셉(요세프)'·'야곱(יַעֲקֹב, 야아코브)'처럼 개역 이름이 곁에 있음
        # 원어 구절 통째 소리 옮김 안이면(앞뒤 낱말도 한국어 사전에 없는 소리) 건드리지 않음
        ps_ = text.rfind('(', 0, s); pe_ = text.rfind(')', 0, s)
        if ps_ > pe_ and s - ps_ < 60:                                             # 괄호 안: 원어 글자나 다른 소리 옮김이 같이 있으면 그대로
            inner = text[ps_ + 1:s]
            if re.search(HEBGRK, inner) or any(not known(w) for w in re.findall(r'[가-힣]+', inner)) or s == ps_ + 1: continue
        qs = text.rfind('‘', 0, s); qe = text.find('’', e)
        if qs >= 0 and qe >= 0 and text.rfind('’', 0, s) < qs and qe - qs < 80:     # ‘…’ 따옴표 안
            inner = [w for w in re.findall(r'[가-힣]+', text[qs:qe]) if w != p]
            if inner and sum(1 for w in inner if not known(w)) >= max(1, len(inner) // 2): continue   # 원어 구절 소리 옮김
        pw = re.findall(r'[가-힣]+', text[max(0, s - 12):s]); nw = re.findall(r'[가-힣]+', text[e:e + 12])
        if (pw and not known(pw[-1]) and pw[-1] in FOREIGN) or (nw and nw[0] in FOREIGN): continue
        q = text[max(0, s - 1):s]
        if text[e:e + 1] == '(' and re.match(r'\(' + HEBGRK, text[e:e + 3]):
            rep = f'{k}({p}, '; out.append(text[last:s]); out.append(rep); last = e + 1; done.add(p); continue
        out.append(text[last:s]); out.append(k if p in done else f'{k}({p})'); done.add(p); last = e
    out.append(text[last:])
    return ''.join(out)
def walk(o):
    if isinstance(o, str): return fix(o)
    if isinstance(o, list): return [walk(x) for x in o]
    if isinstance(o, dict): return {k: (v if k in ('k', 'b', 'l', 'he', 'rd') else walk(v)) for k, v in o.items()}
    return o
def card(n):
    n = dict(n)
    for key in ('t', 's'): n[key] = fix(n.get(key, '')) if n.get(key) else n.get(key)
    if n.get('bl'): n['bl'] = walk(n['bl'])
    if n.get('tm'): n['tm'] = [[r[0], r[1]] + [fix(x) for x in r[2:]] if len(r) > 2 else r for r in n['tm']]
    return n
def run():
    nc = nx = 0; import glob
    for f in glob.glob(f'{R0}/app/bible/nt/*.json'):
        N = json.load(open(f)); N2 = {k: card(v) for k, v in N.items()}
        nc += sum(1 for k in N if N[k] != N2[k]); json.dump(N2, open(f, 'w'), ensure_ascii=False, separators=(',', ':'))
    for f in glob.glob(f'{R0}/app/bible/x/*.json'):
        X = json.load(open(f)); ch = False
        for c, cx in X.items():
            for v, ms in (cx.get('vn') or {}).items():
                for mm in ms:
                    t2 = fix(mm.get('t', ''))
                    if t2 != mm.get('t'): mm['t'] = t2; nx += 1; ch = True
        if ch: json.dump(X, open(f, 'w'), ensure_ascii=False, separators=(',', ':'))
    print('name fix: cards changed', nc, 'memos', nx, 'map', len(TR))
if __name__ == '__main__':
    import sys
    for t in sys.argv[1:]: print(fix(t))
