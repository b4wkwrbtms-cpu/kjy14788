import json, re, collections, sys, glob
sys.path.insert(0,'/home/claude/renewal/names'); sys.path.insert(0,'/home/claude/renewal/tools')
import scan as S, rev_chunks as RC, linkaudit as L
occ=collections.Counter(); co=collections.defaultdict(collections.Counter); lemocc=collections.Counter()
NP=set()
for b in range(1,67):
    M=RC.omap(b,S.K[b])
    for c,ch in enumerate(S.K[b],1):
        for v,t in enumerate(ch,1):
            m=M.get((c,v)); ws=RC.ochap(b,m[0]).get(str(m[1]),[]) if m else []
            nps=set()
            for w in ws:
                if b<40:
                    if 'Np' in (w[2] or ''): nps.add(w[1].split('/')[-1])
                elif w[1][:1].isupper(): nps.add(L.cons(w[1]))
            NP|=nps
            for n in nps: lemocc[n]+=1
            for s in set(s for x in re.findall(r'[가-힣]+',t) for s in S.stems(x) if len(s)>=2):
                occ[(s,b>=40)]+=1
                for n in nps: co[(s,b>=40)][n]+=1
L2K={}; bestd={}
for s_,cc in co.items():
    for lm,c in cc.items():
        n=lemocc[lm]
        if c<max(1,0.4*n) or c<0.6*occ[s_]: continue
        sc=(c,-len(s_[0]))
        if lm not in bestd or sc>bestd[lm][0]: bestd[lm]=(sc,s_[0])
L2K={lm:v[1] for lm,v in bestd.items()}
json.dump({'L2K':L2K,'NP':sorted(NP)}, open('/home/claude/renewal/names/l2k.json','w'), ensure_ascii=False)
print(len(L2K))
