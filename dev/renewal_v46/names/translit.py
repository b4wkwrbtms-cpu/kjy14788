import json, re, collections, sys, glob
sys.path.insert(0,'/home/claude/renewal/names'); sys.path.insert(0,'/home/claude/renewal/tools')
import scan as S, linkaudit as L
D=json.load(open('/home/claude/renewal/names/l2k.json')); L2K=D['L2K']; NP=set(D['NP'])
MOD={'애굽':'이집트','바벨론':'바빌론','앗수르':'아시리아','바사':'페르시아','메대':'메디아','헬라':'그리스','수리아':'시리아','구브로':'키프로스','그레데':'크레타','마게도냐':'마케도니아','서바나':'스페인','이달리야':'이탈리아','아덴':'아테네','바로':'파라오'}
lexOT=L.lexicon(False); lexNT=L.lexicon(True)
import os
NPF=collections.defaultdict(lambda:[0,0])   # 꼴 → [고유명사로 쓰인 수, 전체]
for b in range(1,67):
    for f in glob.glob(f'/home/claude/bw/orig/{b:02d}/*.json'):
        for v,ws in json.load(open(f)).items():
            for w in ws:
                for sg in S_segs(w[0]) if False else L.segs(w[0]):
                    isnp = ('Np' in (w[2] or '')) if b<40 else w[1][:1].isupper()
                    NPF[sg][1]+=1; NPF[sg][0]+=isnp
def name_of(w):
    nt=bool(L.GRK.search(w)); c=L.cons(w)
    cc=[c]+[c[1:]] if not nt else [c]
    if not any(NPF[x][1] and NPF[x][0]>=0.7*NPF[x][1] for x in cc): return None
    if nt:
        lm=c if c in L2K else None
        if not lm:
            lx=lexNT.get(c) or {}
            lm=next((x for x,_ in sorted(lx.items(),key=lambda z:-z[1]) if x in L2K),None)
    else:
        lx=lexOT.get(c) or {}
        for pre in ('','ו','ה','ב','ל','מ','כ'):
            if not lx and c.startswith(pre) and pre: lx=lexOT.get(c[1:]) or {}
        lm=next((x for x,_ in sorted(lx.items(),key=lambda z:-z[1]) if x in NP and x in L2K),None)
    if not lm: return None
    k=L2K[lm]; return MOD.get(k,k)
ev=collections.defaultdict(collections.Counter)
srcs=[]
for f in glob.glob('/home/claude/renewal/app/bible/nt/*.json'):
    for nid,o in json.load(open(f)).items():
        for tm in o.get('tm') or []:
            if len(tm)<2: continue
            ws=[w for w in re.split(r'[\s־,·/]+',tm[0]) if w]; ps=[p for p in re.split(r'[\s,·/]+',tm[1] or '') if p]
            if len(ws)!=len(ps): continue
            for w,p in zip(ws,ps):
                if not re.fullmatch(r'[가-힣]+',p): continue
                k=name_of(w)
                if k and k!=p: ev[p][k]+=1
RMOD={v:k for k,v in MOD.items()}
def sim(p,k):
    a,b=S.jamo(p),S.jamo(k); return 1-S.lev(p,k)/max(len(a),len(b))
TR={}
for p,c in ev.items():
    k,n=c.most_common(1)[0]
    sm=max(sim(p,k), sim(p,RMOD.get(k,k)))
    if not (sm>=0.45 or (n>=4 and sm>=0.2)): continue
    if S.kall.get(p,0)>0 and p not in ('모셰',): continue    # 개역에 그대로 있는 낱말은 이름 바꾸기 대상 아님
    TR[p]=k
json.dump(TR, open('/home/claude/renewal/names/translit.json','w'), ensure_ascii=False, indent=0)
print(len(TR))
