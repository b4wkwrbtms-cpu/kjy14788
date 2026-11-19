import sys,json,re,glob,os
sys.path.insert(0,'/home/claude/renewal/tools')
import rev_chunks as rc
R='/home/claude/renewal'
# usage: st.py STRONG [books comma] [maxchars]
s=sys.argv[1]; books=[int(x) for x in sys.argv[2].split(',')] if len(sys.argv)>2 and sys.argv[2]!='all' else range(1,40)
for b in books:
    krv=json.load(open(f'{R}/app/bible/krv/{b:02d}.json')); M=rc.omap(b,krv)
    inv={}
    for (c,v),o in M.items():
        if o: inv.setdefault(o,[]).append((c,v))
    for p in sorted(glob.glob(f'{rc.ORIG}/{b:02d}/*.json')):
        c=int(os.path.basename(p)[:3]); ch=rc.ochap(b,c)
        for v in sorted(ch,key=int):
            for w in ch[v]:
                nums=re.findall(r'\d+',w[1].split('/')[-1]) if False else re.findall(r'(?<![\d])(\d{1,4})(?![\d])',w[1])
                if s in re.split(r'[/ ]',w[1]) or s in re.findall(r'\d+',w[1]):
                    for (cc,vv) in inv.get((c,int(v)),[(c,int(v))]):
                        mz=json.load(open(f'{R}/bout46/{b:02d}/{cc:03d}.json'))['v']
                        print(f'{b} {cc}:{vv} [{w[0].replace("/","")}] ',mz[vv-1].replace('\n','⏎')[:int(sys.argv[3]) if len(sys.argv)>3 else 120])
