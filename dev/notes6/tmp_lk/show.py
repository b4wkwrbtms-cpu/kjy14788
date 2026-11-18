import json,sys
b=sys.argv[1]
for c in sys.argv[2:]:
    d=json.load(open(f'/home/claude/bw/bout/{b}/{int(c):03d}.json'))
    print('=====',b,c)
    for i,v in enumerate(d['v']):
        print(i+1,' ¶ '.join(f'{j}:{l}' for j,l in enumerate(v.split('\n'))))
