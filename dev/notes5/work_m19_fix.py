import json,re,sys
from work_m19_chk import BOOKS
def fix(cid,default):
    p=f'/home/claude/renewal/notes3/out/{cid}.json'
    d=json.load(open(p))
    pat=re.compile(r'(?<![\d:가-힣A-Za-z])(\d{1,3}):(\d{1,3})')
    def f(t):
        def rep(m):
            pre=t[max(0,m.start()-12):m.start()]
            if re.search(r'('+BOOKS+r'|서|기|록|복음)\s*$',pre): return m.group(0)
            if re.search(r'[–·]\s*$',pre): return m.group(0)
            return default+' '+m.group(0)
        return pat.sub(rep,t)
    d['body']=[f(t) for t in d['body']]
    for x in d['deep']: x['p']=[f(t) for t in x['p']]
    json.dump(d,open(p,'w'),ensure_ascii=False,indent=1)
if __name__=='__main__':
    fix(sys.argv[1],sys.argv[2])
