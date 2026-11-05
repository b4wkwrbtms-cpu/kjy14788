# 개역한글 이름 사전: 개역 낱말(어간)이 나오는 절마다 원어 고유명사(히 Np / 헬 대문자 표제어) 하나가 늘 함께 있으면 그 낱말 = 그 이름
import json, re, collections, os, sys
sys.path.insert(0, '/home/claude/renewal/names'); sys.path.insert(0, '/home/claude/renewal/tools')
from scan import stems, K
import rev_chunks as RC  # omap(원어 절 맞춤)
ORIG='/home/claude/bw/orig'
occ=collections.Counter(); co=collections.defaultdict(collections.Counter)
for b in range(1,67):
    M=RC.omap(b,K[b])
    for c,ch in enumerate(K[b],1):
        for v,t in enumerate(ch,1):
            m=M.get((c,v))
            ws=RC.ochap(b,m[0]).get(str(m[1]),[]) if m else []
            nps=set()
            for w in ws:
                if b<40:
                    if 'Np' in (w[2] or ''): nps.add(w[1].split('/')[-1])
                else:
                    if w[1][:1].isupper(): nps.add(w[1])
            for s in set(s for x in re.findall(r'[가-힣]+',t) for s in stems(x) if len(s)>=2):
                occ[s]+=1
                for n in nps: co[s][n]+=1
names={}
for s,n in occ.items():
    if not co[s]: continue
    L,c=co[s].most_common(1)[0]
    if c>=max(1,0.8*n): names[s]=[L,n]
json.dump(names, open('/home/claude/renewal/names/krv_names.json','w'), ensure_ascii=False)
print(len(names))
