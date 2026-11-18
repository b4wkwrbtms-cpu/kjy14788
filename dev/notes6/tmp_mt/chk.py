import json
for b,n in ((40,28),(41,16)):
    d=json.load(open(f'/home/claude/renewal/notes6/out/{b}-001-{n:03d}.json'))
    assert sorted(map(int,d))==list(range(1,n+1))
    sps=0;folds=0
    for c,e in d.items():
        v=json.load(open(f'/home/claude/bw/bout/{b}/{int(c):03d}.json'))['v']
        full=' '.join(x.replace('\n',' ') for x in v)
        assert e['one'] in full and e['q'] and e['t'] and e['g']
        for ve,l in e.get('sp',{}).items():
            sps+=1
            for ln,*_ in l: assert ln<len(v[int(ve)-1].split('\n'))
        for f in e.get('fold',[]): assert f[1]<=len(v); folds+=1
    print(b,len(d),'sp verses',sps,'fold',folds)
