import json,sys
def v(b,c,vs):
    d=json.load(open(f'/home/claude/bw/bout/{b:02d}/{c:03d}.json'))['v']
    return [f"{b}:{c}:{x} "+d[x-1].replace('\n',' / ') for x in vs if x-1<len(d)]
for a in sys.argv[1:]:
    b,c,r=a.split(':')
    if '-' in r: s,e=r.split('-'); vs=range(int(s),int(e)+1)
    else: vs=[int(r)]
    print('\n'.join(v(int(b),int(c),vs)))
