import json,sys
b=sys.argv[1]
for c in range(int(sys.argv[2]),int(sys.argv[3])+1):
    d=json.load(open('/home/claude/bw/bout/%s/%03d.json'%(b,c)))
    print('=== %d장'%c, ' | '.join('%d:%s'%(i,t) for i,t in d['h']))
    for i,v in enumerate(d['v']):
        print('%d %s'%(i+1,v.replace('\n',' / ')))
