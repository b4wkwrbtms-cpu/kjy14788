import json
d=json.load(open('/home/claude/renewal/notes6/out/44-001-028.json'))
assert sorted(map(int,d))==list(range(1,29)),sorted(d)
nsp=0
for k,c in d.items():
    t=json.load(open('/home/claude/bw/bout/44/%03d.json'%int(k)))['v']
    for key in 't q g one'.split(): assert key in c,(k,key)
    one=c['one']; ok=any(one in v for v in t); 
    if not ok: print('ONE not found',k,one)
    for v,lst in c.get('sp',{}).items():
        L=t[int(v)-1].split('\n')
        for l,a,b,ty,_ in lst:
            nsp+=1
            if l>=len(L): print('line out',k,v,l)
            elif '“' not in L[l]: print('no quote',k,v,l,L[l][:20])
    print(k,len(c['t']),len(c['q']),len(one),len(c.get('sp',{})))
print('sp entries',nsp)
