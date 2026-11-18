import json,sys
def v(b,c,vs):
    d=json.load(open(f'/home/claude/bw/bout/{b:02d}/{c:03d}.json'))['v']
    return [(i,d[i-1]) for i in vs]
if __name__=='__main__':
    spec=sys.argv[1:]
    for s in spec:
        b,c,r=s.split(':'); 
        a,_,z=r.partition('-'); z=z or a
        for i,t in v(int(b),int(c),range(int(a),int(z)+1)): print(f'[{b}:{c}:{i}]',t.replace('\n',' / '))
