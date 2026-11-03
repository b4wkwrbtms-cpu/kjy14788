# 전면 검토 묶음 파일 만들기: 개역 · 원어(절 번호 어긋남 보정) · 지금 본문. 사용: python3 tools/rev_chunks.py [시작번호]
import json, os, glob, sys
R0='/home/claude/renewal'; KRV='/home/claude/b4wkwrbtms-cpu/kjy14788/bible/krv'; ORIG='/home/claude/bw/orig'; B46=f'{R0}/bout46'
BN=json.load(open(f'{R0}/book_names.json')); F=json.load(open(f'{R0}/rev/flags.json')); plan=json.load(open(f'{R0}/rev/plan.json'))
_O={}
def ochap(b,c):
    if (b,c) not in _O:
        p=f'{ORIG}/{b:02d}/{c:03d}.json'; _O[(b,c)]=json.load(open(p)) if os.path.exists(p) else {}
    return _O[(b,c)]
def olen(b,c): return max((int(k) for k in ochap(b,c)),default=0)
def otxt(b,c,v): return ' '.join(w[0].replace('/','') for w in (ochap(b,c).get(str(v)) or []))
def omap(b,K):
    nk=[len(x) for x in K]; noc=len(glob.glob(f'{ORIG}/{b:02d}/*.json')); no=[olen(b,c) for c in range(1,noc+1)]
    M={}; pc,pv=1,1
    def near(c):
        if pc==c and pv<=3: return True
        if pc==c-1 and c-2<len(no) and no[c-2]-pv<=1: return True
        return False
    for c in range(1,len(K)+1):
        if c<=noc and near(c):
            d=no[c-1]-nk[c-1]
            if d==0 or (b==19 and 0<d<=2): pc,pv=c,1+(d if d>0 else 0)   # 길이 같으면 장 머리로, 시편 표제(1~2절)는 건너뜀
        for v in range(1,nk[c-1]+1):
            while pc<=noc and pv>no[pc-1]: pc+=1; pv=1
            M[(c,v)]=(pc,pv) if pc<=noc else None
            pv+=1
    return M
start=int(sys.argv[1]) if len(sys.argv)>1 else 1
for ch in plan[start-1:]:
    out=[]; last=None
    for b,c in ch['chs']:
        K=json.load(open(f'{KRV}/{b:02d}.json'))
        if last!=b: M=omap(b,K); last=b
        j=json.load(open(f'{B46}/{b:02d}/{c:03d}.json'))
        out.append(f"\n## {BN[b-1]} {c}장  (b={b}, c={c})\n소제목 h: {json.dumps(j.get('h',[]), ensure_ascii=False)}")
        for v,(mv,kv) in enumerate(zip(j['v'],K[c-1]),1):
            fl=F.get(f'{b}:{c}:{v}',''); m=M.get((c,v))
            ot=otxt(b,*m) if m else ''; tag='' if (not m or m==(c,v)) else f' (원어 {m[0]}:{m[1]})'
            out.append(f"[{c}:{v}]{(' ⚠'+fl) if fl else ''}\n개역: {kv}\n원어{tag}: {ot}\n지금: {mv.replace(chr(10),'⏎')}")
    open(f"{R0}/rev/in/{ch['id']}.txt",'w').write('\n'.join(out))
print('chunks written from', start)
