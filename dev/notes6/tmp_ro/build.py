import json,sys,importlib.util
b=sys.argv[1]; last=int(sys.argv[2])
spec=importlib.util.spec_from_file_location('d','/home/claude/renewal/notes6/tmp_ro/data%s.py'%b);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
out={};bad=[]
for c,tp in sorted(m.D.items()):
    t,q,g,one=tp[:4]; fo=tp[4] if len(tp)>4 else None
    d=json.load(open('/home/claude/bw/bout/%s/%03d.json'%(b,c)))
    txt=' '.join(d['v']).replace('\n',' ')
    if one not in txt: bad.append((c,'one',one))
    out[str(c)]={'t':t,'q':q,'g':g,'one':one}
    if fo: out[str(c)]['fold']=fo
    for f in (fo or []):
        if not(1<=f[0]<=f[1]<=len(d['v'])): bad.append((c,'fold'))
fn='/home/claude/renewal/notes6/out/%s-001-%03d.json'%(b,last)
json.dump(out,open(fn,'w'),ensure_ascii=False,indent=1)
print(len(out),'chapters',bad)
