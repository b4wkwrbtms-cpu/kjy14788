import sys,json
sys.path.insert(0,'/home/claude/renewal/tools')
import rev_chunks as rc
R='/home/claude/renewal'; OUT=f'{R}/tqfix/out/q13.jsonl'
_k={}
def krv(b): 
    if b not in _k: _k[b]=json.load(open(f'{R}/app/bible/krv/{b:02d}.json'))
    return _k[b]
def cur(b,c,v): return json.load(open(f'{R}/bout46/{b:02d}/{c:03d}.json'))['v'][v-1]
def orig(b,c,v):
    M=rc.omap(b,krv(b)); o=M.get((c,v)); return rc.otxt(b,*o) if o else ''
import re
def _c(x): return re.sub('[\u0591-\u05C7\u05BE]','',x)
def fixhe(he,o):
    if he in o: return he
    ws=o.split(); hw=he.split(); n=len(hw)
    for i in range(len(ws)-n+1):
        if [_c(w) for w in ws[i:i+n]]==[_c(w) for w in hw]: return ' '.join(ws[i:i+n])
    for i in range(len(ws)-n+1):
        if _c(' '.join(ws[i:i+n]))==_c(he): return ' '.join(ws[i:i+n])
    raise AssertionError(('he',he,o))
def add(d):
    s=json.dumps(d,ensure_ascii=False)
    assert '"' not in ''.join(str(x) for x in [d.get('why',''),d.get('plan',''),d.get('old',''),d.get('new',''),d.get('pick','')]) , 'straight quote'
    if d['act'] in('fix','done'):
        b,c,v=d['b'],d['c'],d['v']; t=cur(b,c,v)
        if d['act']=='fix':
            assert t.count(d['old'])==1,('old cnt',t.count(d['old']),d['old'],t)
        else:
            assert d['new'] in t,('new not in cur',d['new'],t)
        if d.get('krv'): assert d['krv'] in krv(b)[c-1][v-1],('krv',d['krv'],krv(b)[c-1][v-1])
        if d.get('he'): d['he']=fixhe(d['he'],orig(b,c,v))
        assert 'alt' in d and 'pick' in d
    open(OUT,'a').write(s+'\n'); print('ok',d['card'],d['k'],d['act'],d.get('b',''),d.get('c',''),d.get('v',''))
def note(d):
    open(f'{R}/tqfix/alt_out/a13.jsonl','a').write(json.dumps(d,ensure_ascii=False)+'\n')
