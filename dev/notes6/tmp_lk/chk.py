import json,sys
b=int(sys.argv[1]); fn=sys.argv[2]
d=json.load(open(fn))
for c,e in sorted(d.items(),key=lambda x:int(x[0])):
    v=json.load(open(f'/home/claude/bw/bout/{b}/{int(c):03d}.json'))['v']
    full=' '.join(x.replace('\n',' ') for x in v)
    assert e['one'] in full,(c,'one',e['one'])
    assert e['q'] and e['t'] and e['g'],c
    for ve,l in e.get('sp',{}).items():
        assert 1<=int(ve)<=len(v),(c,ve)
        for ln,a,b2,k,n in l:
            lines=v[int(ve)-1].split('\n'); assert ln<len(lines),(c,ve,ln)
            assert lines[ln].lstrip().startswith('“'),(c,ve,ln,lines[ln][:20])
    for f in e.get('fold',[]): assert f[1]<=len(v)
print('ok',len(d),'sp',sum(len(l) for e in d.values() for l in e.get('sp',{}).values()),'fold',sum(len(e.get('fold',[])) for e in d.values()))
