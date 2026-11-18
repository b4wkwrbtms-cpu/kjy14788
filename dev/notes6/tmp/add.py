import json,sys,os
P='/home/claude/renewal/notes6/out/13-001-029.json'
d=json.load(open(P))['장'] if os.path.exists(P) else {}
new=json.load(sys.stdin)
d.update(new)
json.dump({'장':dict(sorted(d.items(),key=lambda x:int(x[0])))},open(P,'w'),ensure_ascii=False,indent=1)
print(len(d),'chapters')
