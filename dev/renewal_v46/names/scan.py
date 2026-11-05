# 이름 표기 점검: 20대 본문에서 개역한글 같은 절의 이름과 자모 1~2개만 다른 낱말(야곡↔야곱 등) 찾기
import json, re, collections, unicodedata
R0='/home/claude/renewal'; KRV='/home/claude/b4wkwrbtms-cpu/kjy14788/bible/krv'
PART=sorted(["이라고","이라","이었","이고","이며","이요","이니","이에","이지","이시","이신","이셨","이야","이랑","이네","이여","이다","에게","에서","한테","처럼","보다","부터","까지","으로","하고","조차","마저","에게서","께서","이","가","은","는","을","를","의","에","께","과","와","도","만","아","야","여","님","라","랑","로","였","뿐","씨","네","다","요","왕","성","들","족속","사람","자손","지파","산","강","땅","골짜기","광야"],key=len,reverse=True)
def jamo(s): return unicodedata.normalize('NFD',s)
def lev(a,b):
    a,b=jamo(a),jamo(b); d=list(range(len(b)+1))
    for i,x in enumerate(a,1):
        p,d[0]=d[0],i
        for j,y in enumerate(b,1): p,d[j]=d[j],min(d[j]+1,d[j-1]+1,p+(x!=y))
    return d[-1]
def stems(w):
    out={w}
    for p in PART:
        if w.endswith(p) and len(w)-len(p)>=2: out.add(w[:-len(p)])
    return out
# 개역 전체 낱말(어간 후보) 빈도
kall=collections.Counter(); K={}
for b in range(1,67):
    K[b]=json.load(open(f'{KRV}/{b:02d}.json'))
    for ch in K[b]:
        for v in ch:
            for w in re.findall(r'[가-힣]+',v):
                for s in stems(w): kall[s]+=1
def main():
    mall=collections.Counter()
    M={}
    for b in range(1,67):
        M[b]=json.load(open(f'{R0}/app/bible/mz/{b:02d}.json'))
        for ch in M[b]:
            for v in ch['v']:
                for w in re.findall(r'[가-힣]+',v):
                    for s in stems(w): mall[s]+=1
    cand=collections.defaultdict(list)
    for b in range(1,67):
        for c,(mc,kc) in enumerate(zip(M[b],K[b]),1):
            for vi,(mv,kv) in enumerate(zip(mc['v'],kc),1):
                ks=set(s for w in re.findall(r'[가-힣]+',kv) for s in stems(w) if len(s)>=2)
                ms=set(s for w in re.findall(r'[가-힣]+',mv) for s in stems(w) if len(s)>=2)
                for m in ms:
                    if m in ks or kall.get(m,0)>0: continue      # 개역 어디에도 없는 표기만
                    best=None
                    for k in ks:
                        if k in ms or abs(len(k)-len(m))>1: continue
                        d=lev(m,k)
                        if d<=2 and (best is None or d<best[0]): best=(d,k)
                    if best and len(m)>=2:
                        cand[(m,best[1])].append(f'{b}:{c}:{vi}')
    rows=sorted(cand.items(), key=lambda x:-len(x[1]))
    json.dump([[m,k,len(r),r[:5]] for (m,k),r in rows], open(f'{R0}/names/cand.json','w'), ensure_ascii=False, indent=0)
    print(len(rows))
if __name__=='__main__': main()
