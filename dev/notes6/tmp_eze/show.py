import json,sys
b=sys.argv[1]; a=int(sys.argv[2]); z=int(sys.argv[3]); lines=len(sys.argv)>4
for c in range(a,z+1):
    d=json.load(open(f'/home/claude/bw/bout/{b}/{c:03d}.json'))
    print(f'=== {b}:{c} ({len(d["v"])}절) h={[(x[0],x[1]) for x in d["h"]]}')
    for i,v in enumerate(d['v'],1):
        if lines:
            print(i,' || '.join(f'[{j}]{l}' for j,l in enumerate(v.split('\n'))))
        else: print(i,v.replace('\n',' '))
