import json,sys
b=sys.argv[1]
for c in sys.argv[2:]:
    d=json.load(open(f'/home/claude/bw/bout/{b}/{int(c):03d}.json'))
    print('=====',b,c,'h=',d['h'])
    for i,v in enumerate(d['v']):
        print(i+1,'|'.join(v.split('\n')))
