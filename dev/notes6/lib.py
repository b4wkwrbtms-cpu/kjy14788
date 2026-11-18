import json,os
TOT={18:42,28:14,29:3,30:9,37:2,38:14,39:4}
W='/home/claude/renewal/notes6/work'
def load(b):
    p=f'{W}/{b}.json'
    return json.load(open(p)) if os.path.exists(p) else {}
def txt(b,c):
    return json.load(open(f'/home/claude/bw/bout/{b}/{int(c):03d}.json'))
def add(b,c,t,q,g,one,sp=None,fold=None):
    d=load(b); e={'t':t,'q':q,'g':g,'one':one}
    v=txt(b,c)['v']
    full=' '.join(x.replace('\n',' ') for x in v)
    assert one in full or one.replace(' ','') in full.replace(' ',''),('ONE',b,c,one)
    if sp:
        s={}
        for ve,ln,a,bb,k in sp:
            assert 1<=ve<=len(v) and ln<len(v[ve-1].split('\n')),('SP',b,c,ve,ln)
            s.setdefault(str(ve),[]).append([ln,a,bb,k,''])
        e['sp']=s
    if fold:
        for f in fold: assert 1<=f[0]<=f[1]<=len(v),('FOLD',b,c)
        e['fold']=fold
    d[str(c)]=e
    json.dump(d,open(f'{W}/{b}.json','w'),ensure_ascii=False)
def flush(b):
    d=load(b); n=TOT[b]
    out={k:d[k] for k in sorted(d,key=int)}
    json.dump(out,open(f'/home/claude/renewal/notes6/out/{b:02d}-001-{n:03d}.json','w'),ensure_ascii=False,indent=1)
    print(b,'saved',len(out),'/',n,'chapters')
