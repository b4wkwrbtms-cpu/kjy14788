import json,sys
def g(b,c,v):
    d=json.load(open(f'/home/claude/bw/bout/{b:02d}/{c:03d}.json'))
    return d['v'][v-1] if isinstance(d['v'],list) else d['v'][str(v)]
for a in sys.argv[1:]:
    b,c,v=map(int,a.split(':')); print(a,'|',g(b,c,v).replace('\n',' / '))
