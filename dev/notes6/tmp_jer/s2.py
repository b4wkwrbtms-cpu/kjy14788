import json,sys
b,c=sys.argv[1],int(sys.argv[2]); n=int(sys.argv[3]) if len(sys.argv)>3 else 90
d=json.load(open(f'/home/claude/bw/bout/{b}/{c:03d}.json'))
print('=== ',c,'절수',len(d['v']))
for i,v in enumerate(d['v'],1):
    t=v.replace('\n',' / ')
    print(i, t[:n])
