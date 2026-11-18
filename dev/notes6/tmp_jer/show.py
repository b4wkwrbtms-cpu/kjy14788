import json,sys
b,c=sys.argv[1],int(sys.argv[2])
d=json.load(open(f'/home/claude/bw/bout/{b}/{c:03d}.json'))
print('=== ',b,c,'절수',len(d['v']))
for i,v in enumerate(d['v'],1):
    print(i, v.replace('\n',' ⏎ '))
