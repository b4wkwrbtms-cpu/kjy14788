import json,os,re
OUT='/home/claude/renewal/notes6/out/19-001-075.json'
def save(batch):
    d=json.load(open(OUT)) if os.path.exists(OUT) else {}
    for k,v in batch.items():
        t=json.load(open('/home/claude/bw/bout/19/%03d.json'%int(k)))
        txt=re.sub(r'\s+',' ',' '.join(t['v']).replace('\n',' '))
        if v['one'] not in txt: print('ONE NOT FOUND',k,v['one'])
        d[k]=v
    json.dump(d,open(OUT,'w'),ensure_ascii=False,indent=1)
    print(len(d),'saved')
