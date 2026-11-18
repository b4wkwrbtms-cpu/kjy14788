import json,glob,sys,importlib.util,os
vol=sys.argv[1]; last=int(sys.argv[2]); outname=sys.argv[3] if len(sys.argv)>3 and not sys.argv[3].startswith("--") else ""
D={}
for f in sorted(glob.glob(f'/home/claude/renewal/notes6/tmp_eze/p{vol}_*.py')):
    ns={}; exec(open(f).read(),ns); D.update({str(k):v for k,v in ns['D'].items()})
bad=[]
for k,v in D.items():
    t=json.load(open(f'/home/claude/bw/bout/{vol}/{int(k):03d}.json'))
    txt=' '.join(t['v']).replace('\n',' ')
    flat='\n'.join(t['v'])
    if v['one'].replace('\n',' ') not in txt and v['one'] not in flat: bad.append((k,'one',v['one']))
    for vs,items in v.get('sp',{}).items():
        n=len(t['v'][int(vs)-1].split('\n'))
        for it in items:
            if it[0]>=n: bad.append((k,'sp',vs,it))
    for f in v.get('fold',[]):
        if f[1]>len(t['v']) or f[0]<1: bad.append((k,'fold',f[:2]))
    if not v['q'].endswith('?'): bad.append((k,'q'))
    L=len(v['one']); 
    if not 20<=L<=70: bad.append((k,'onelen',L))
missing=[c for c in range(1,last+1) if str(c) not in D]
print('chapters',len(D),'missing(up to now)',missing[:3],'..' if len(missing)>3 else '','bad',bad)
if '--write' in sys.argv:
    out=dict(sorted(D.items(),key=lambda x:int(x[0])))
    json.dump(out,open(f'/home/claude/renewal/notes6/out/{outname}','w'),ensure_ascii=False,indent=1)
    print('wrote',outname)
