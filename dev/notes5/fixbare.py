# 책 이름 없는 장:절에 앞 주소의 책(없으면 카드의 책) 줄임말을 붙인다. python3 fixbare.py [--write]
import json,glob,re,sys
R='/home/claude/renewal'; BN=json.load(open(f'{R}/book_names.json'))
AB=["창","출","레","민","신","수","삿","룻","삼상","삼하","왕상","왕하","대상","대하","스","느","에","욥","시","잠","전","아","사","렘","애","겔","단","호","욜","암","옵","욘","미","나","합","습","학","슥","말","마","막","눅","요","행","롬","고전","고후","갈","엡","빌","골","살전","살후","딤전","딤후","딛","몬","히","약","벧전","벧후","요일","요이","요삼","유","계"]
KR='/home/claude/b4wkwrbtms-cpu/kjy14788/bible/krv'; NV={b:[len(c) for c in json.load(open(f'{KR}/{b:02d}.json'))] for b in range(1,67)}
names=sorted([(n,i+1) for i,n in enumerate(BN)]+[(a,i+1) for i,a in enumerate(AB)],key=lambda x:-len(x[0]))
NM='|'.join(re.escape(n) for n,_ in names); N2B=dict(names)
tok=re.compile(r'(?:(?<![가-힣])('+NM+r')\s?)?(\d{1,3}):(\d{1,3})')
SKIP=re.compile(r'(히브리어|헬라어|원어|원문|칠십인역|마소라|영어 성경|영어|개역)\s?(본문\s?|성경\s?|은\s?|는\s?|으로는\s?|로는\s?)?$')
def fix(t,b0):
    cur=b0; out=[]; last=0; n=0
    for m in tok.finditer(t):
        nm,c,v=m.group(1),int(m.group(2)),int(m.group(3))
        if nm: cur=N2B[nm]; continue
        pre=t[max(0,m.start()-14):m.start()]
        if m.start()>0 and (t[m.start()-1].isdigit() or t[m.start()-1] in ':.'): continue
        if SKIP.search(pre): continue
        mm=re.search(r'([가-힣]{2,6})\s?$',pre)
        if mm:
            cand=[i+1 for i,n in enumerate(BN) if n.startswith(mm.group(1))]
            if cand: cur=cand[0]; continue
        if c<1 or c>len(NV[cur]) or v<1 or v>NV[cur][c-1]:
            if c<=len(NV[b0]) and 1<=v<=NV[b0][c-1]: cur=b0
            else: continue
        out.append(t[last:m.start()]); out.append(AB[cur-1]+' '); last=m.start(); n+=1
    return ''.join(out)+t[last:], n
def walk(x,b0):
    if isinstance(x,str): return fix(x,b0)
    if isinstance(x,list):
        r=[walk(y,b0) for y in x]; return [a for a,_ in r], sum(n for _,n in r)
    if isinstance(x,dict):
        r={k:walk(y,b0) for k,y in x.items()}; return {k:a for k,(a,_) in r.items()}, sum(n for _,n in r.values())
    return x,0
W='--write' in sys.argv; tot=cards=0; ex=[]
for f in glob.glob(f'{R}/notes3/out/*.json')+glob.glob(f'{R}/notes2/out/*.json'):
    try:o=json.load(open(f))
    except: continue
    if not isinstance(o,dict) or o.get('link') or not o.get('b'): continue
    ch=0
    for k in ('core','body','deep','expr'):
        if k in o and o[k]:
            new,n=walk(o[k],int(o['b']))
            if n:
                if len(ex)<14 and isinstance(new,str): 
                    i=next((j for j in range(min(len(new),len(o[k]))) if new[j]!=o[k][j]),0); ex.append(new[max(0,i-30):i+25])
                o[k]=new; ch+=n
    if ch:
        tot+=ch; cards+=1
        if W: json.dump(o,open(f,'w'),ensure_ascii=False,indent=0)
print('고친 곳',tot,'카드',cards); [print(' ',e.replace('\n',' ')) for e in ex]
