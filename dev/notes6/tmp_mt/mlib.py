import json,os
W='/home/claude/renewal/notes6/tmp_mt/work'
TOT={40:28,41:16}
def load(b):
    p=f'{W}/{b}.json'
    return json.load(open(p)) if os.path.exists(p) else {}
def txt(b,c):
    return json.load(open(f'/home/claude/bw/bout/{b}/{int(c):03d}.json'))
def add(b,c,t,q,g,one,sp=None,fold=None):
    d=load(b); e={'t':t,'q':q,'g':g,'one':one}
    v=txt(b,c)['v']
    full=' '.join(x.replace('\n',' ') for x in v)
    assert one in full,('ONE',b,c,one)
    assert q.endswith('요?'),('Q',b,c)
    if sp:
        s={};bad=[]
        for ve,ln,a,bb,k in sp:
            if not(1<=ve<=len(v) and ln<len(v[ve-1].split('\n')) and '“' in v[ve-1].split('\n')[ln]):
                bad.append((ve,ln)); continue
            s.setdefault(str(ve),[]).append([ln,a,bb,k,''])
        assert not bad,('SPBAD',b,c,bad)
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
