import json,os
def load(book,fn):
    return json.load(open(fn)) if os.path.exists(fn) else {}
def build(ch,t,q,g,one,sps=(),folds=()):
    e={'t':t,'q':q,'g':g,'one':one}
    sp={}
    for s in sps:
        ver,ln,a,b=s[:4]; kind=s[4] if len(s)>4 else 'speech'; note=s[5] if len(s)>5 else ''
        sp.setdefault(str(ver),[]).append([ln,a,b,kind,note])
    if sp: e['sp']=sp
    if folds: e['fold']=[list(f) for f in folds]
    return e
def save(book,rng,data):
    fn=f'/home/claude/renewal/notes6/tmp_lk/{book}.json'
    cur=load(book,fn); cur.update({str(k):v for k,v in data.items()})
    cur={k:cur[k] for k in sorted(cur,key=int)}
    json.dump(cur,open(fn,'w'),ensure_ascii=False,indent=1)
    final=f'/home/claude/renewal/notes6/out/{book}-{rng}.json'
    json.dump(cur,open(final,'w'),ensure_ascii=False,indent=1)
    print('saved',book,len(cur))
