import json,sys,os
def save(b,last,new):
    out=f'/home/claude/renewal/notes6/out/{b}-001-{last:03d}.json'
    d=json.load(open(out)) if os.path.exists(out) else {"장":{}}
    for c,(q,one) in new.items():
        txt=' '.join(json.load(open(f'/home/claude/bw/bout/{b}/{c:03d}.json'))['v']).replace('\n',' ')
        if one not in txt: print('MISSING one',c,one)
        d["장"][str(c)]={"q":q,"one":one}
    json.dump(d,open(out,'w'),ensure_ascii=False,indent=1)
    print(len(d["장"]),'chapters in',out)
