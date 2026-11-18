import json,sys
for c in range(int(sys.argv[1]),int(sys.argv[2])+1):
    d=json.load(open('/home/claude/bw/bout/44/%03d.json'%c))
    print('=== 장',c)
    for i,v in enumerate(d['v']):
        L=v.split('\n')
        s=' ¶ '.join(L)
        idx=[j for j,l in enumerate(L) if l.startswith('“')]
        mid=[j for j,l in enumerate(L) if '“' in l[1:]]
        print(i+1,'|',s, ('  [Q:%s]'%idx) if idx else '', ('  [MID:%s]'%mid) if mid else '')
