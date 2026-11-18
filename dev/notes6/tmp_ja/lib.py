import json,os,glob
def load(b,c):
    return json.load(open(f'/home/claude/bw/bout/{b}/{int(c):03d}.json'))
def nch(b): return len(glob.glob(f'/home/claude/bw/bout/{b}/*.json'))
def save(b,data):
    n=nch(b); out=f'/home/claude/renewal/notes6/out/{b}-001-{n:03d}.json'
    old=json.load(open(out)) if os.path.exists(out) else {}
    old.update({str(k):v for k,v in data.items()})
    ok=True
    for c,e in old.items():
        d=load(b,c); txt=' '.join(d['v']).replace('\n',' ')
        for k in ('t','q','g','one'):
            if k not in e: print('NOKEY',c,k); ok=False
        if e['one'] not in txt: print('MISSING one',c,e['one']); ok=False
        if not e['q'].endswith('?'): print('Q?',c)
        for vs,lst in e.get('sp',{}).items():
            nl=len(d['v'][int(vs)-1].split('\n'))
            for r in lst:
                if r[0]>=nl: print('SP line out',c,vs,r); ok=False
                elif '“' not in d['v'][int(vs)-1].split('\n')[r[0]]: print('SP no quote',c,vs,r); ok=False
        for f in e.get('fold',[]):
            if f[1]>len(d['v']): ok=False
    json.dump(old,open(out,'w'),ensure_ascii=False,indent=1)
    print(b,len(old),'/',n,'saved',out,'ok' if ok else 'PROBLEMS')
