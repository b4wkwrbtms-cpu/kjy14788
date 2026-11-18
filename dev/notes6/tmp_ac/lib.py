import json,os
OUT='/home/claude/renewal/notes6/out/44-001-028.json'
def S(v,l,a,b,t='speech'): return (str(v),[l,a,b,t,''])
def build(ch):
    # ch: dict num -> dict(t,q,g,one,sp=[(v,l,a,b[,t])])
    out={}
    for n,c in ch.items():
        e={'t':c['t'],'q':c['q'],'g':c['g'],'one':c['one']}
        sp={}
        for s in c.get('sp',[]):
            v,l,a,b=s[:4]; t=s[4] if len(s)>4 else 'speech'
            sp.setdefault(str(v),[]).append([l,a,b,t,''])
        if sp: e['sp']=sp
        out[str(n)]=e
    return out
def save(ch):
    d={}
    if os.path.exists(OUT): d=json.load(open(OUT))
    d.update(build(ch))
    d=dict(sorted(d.items(),key=lambda x:int(x[0])))
    json.dump(d,open(OUT,'w'),ensure_ascii=False,indent=1)
    print('saved',len(d))
