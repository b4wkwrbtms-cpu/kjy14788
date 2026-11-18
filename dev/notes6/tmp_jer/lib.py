import json,glob,importlib.util,sys,os
def load(b):
    d={}
    for f in sorted(glob.glob(f'/home/claude/renewal/notes6/tmp_jer/p{b}_*.py')):
        s=importlib.util.spec_from_file_location('m',f); m=importlib.util.module_from_spec(s); s.loader.exec_module(m)
        d.update(m.D)
    return d
def verify(b,d):
    err=[]
    for k,c in d.items():
        t=json.load(open(f'/home/claude/bw/bout/{b}/{int(k):03d}.json'))['v']
        full=' '.join(x.replace('\n',' ') for x in t)
        if c['one'] not in full: err.append((k,'one',c['one']))
        for key in ('t','q','g','one'):
            if key not in c: err.append((k,'missing',key))
        for v,l in c.get('sp',{}).items():
            vi=int(v)
            if vi>len(t): err.append((k,'spv',v)); continue
            lines=t[vi-1].split('\n')
            for e in l:
                if e[0]>=len(lines) or not lines[e[0]].startswith('“'): err.append((k,'spline',v,e[0]))
    return err
def save(b,name):
    d=load(b); e=verify(b,d)
    json.dump(d,open(f'/home/claude/renewal/notes6/out/{name}.json','w'),ensure_ascii=False,indent=1)
    print(len(d),'장 저장',sorted(map(int,d))[-1]); print(e)
if __name__=='__main__':
    save(sys.argv[1],sys.argv[2])
