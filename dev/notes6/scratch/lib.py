import json,re,sys
def check(b,data,out):
    bad=[]
    for c,(q,one) in data.items():
        d=json.load(open('/home/claude/bw/bout/%02d/%03d.json'%(b,int(c))))
        t=' '.join(d['v']).replace('\n',' ')
        t2=''.join(d['v']).replace('\n','')
        if one not in t and one not in t2: bad.append(c)
        if not q.endswith('?'): print('q?',c)
    return bad
def save(b,data,out):
    res={str(c):{'q':q,'one':one} for c,(q,one) in sorted(data.items(),key=lambda x:int(x[0]))}
    json.dump(res,open(out,'w'),ensure_ascii=False,indent=1)
    print(len(res),'saved; non-quote one:',check(b,data,out))
