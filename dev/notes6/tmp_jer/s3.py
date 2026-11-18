import json,sys
b,c=sys.argv[1],int(sys.argv[2]); n=int(sys.argv[3]) if len(sys.argv)>3 else 200
d=json.load(open(f'/home/claude/bw/bout/{b}/{c:03d}.json'))
print('=== ',c,'절수',len(d['v']))
for i,v in enumerate(d['v'],1):
    print(i, ' | '.join(f'{j}:{l[:n]}' for j,l in enumerate(v.split('\n'))))
