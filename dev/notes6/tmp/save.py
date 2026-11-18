import json,sys,glob,re
D={}
for f in sorted(glob.glob('/home/claude/renewal/notes6/tmp/p*.py')):
    ns={}; exec(open(f).read(),ns); D.update(ns['D'])
json.dump(D,open('/home/claude/renewal/notes6/out/19-076-150.json','w'),ensure_ascii=False,indent=1)
bad=0
for c,v in D.items():
    t=json.load(open('/home/claude/bw/bout/19/%03d.json'%int(c)))
    txt=' '.join(t['v']).replace('\n',' ').replace('  ',' ')
    txt2='\n'.join(t['v']).replace('\n',' ')
    o=v['one']
    if o not in txt and o not in txt2: print('ONE?',c,o); bad+=1
    for k,n in (('t',24),('q',60)):
        if len(v[k])>n: print('LEN',c,k,len(v[k]))
    if not (25<=len(o)<=70): print('ONELEN',c,len(o))
print(len(D),'chapters; bad',bad)
