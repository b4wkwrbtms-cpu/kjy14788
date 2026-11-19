# 본문 낱말 찾기: python3 tools/tqgrep.py 낱말 [책번호 시작] [책번호 끝]  → "b c v | 절 본문"
import json,glob,sys,os
w=sys.argv[1]; lo=int(sys.argv[2]) if len(sys.argv)>2 else 1; hi=int(sys.argv[3]) if len(sys.argv)>3 else 66
BN=json.load(open('/home/claude/renewal/book_names.json')); n=0
for b in range(lo,hi+1):
    for p in sorted(glob.glob(f'/home/claude/renewal/bout46/{b:02d}/*.json')):
        c=int(os.path.basename(p)[:3]); j=json.load(open(p))
        for i,t in enumerate(j['v'],1):
            if w in t: n+=1; print(f"{b} {c} {i} | {BN[b-1]} {c}:{i} | {t.replace(chr(10),'⏎')}")
        for h in j.get('h',[]):
            if w in h[1]: print(f"{b} {c} 0 | 소제목({h[0]}절) | {h[1]}")
print('모두',n,'절')
