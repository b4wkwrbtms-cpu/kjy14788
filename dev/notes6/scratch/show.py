import json,sys
b=int(sys.argv[1]); a=int(sys.argv[2]); z=int(sys.argv[3])
for c in range(a,z+1):
    d=json.load(open('/home/claude/bw/bout/%02d/%03d.json'%(b,c)))
    v=d['v']
    print('## %d (%d절) h:'%(c,len(v)),' / '.join(x[1] for x in d['h']))
    print('first:',v[0].replace('\n',' | ')[:110])
    mid=v[len(v)//2]
    print('mid:',mid.replace('\n',' | ')[:90])
    for x in v[-3:]: print('end:',x.replace('\n',' | ')[:150])
