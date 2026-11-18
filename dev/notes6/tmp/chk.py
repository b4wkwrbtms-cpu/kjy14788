import json
P='/home/claude/renewal/notes6/out/13-001-029.json'
D=json.load(open(P))['장']
for k,c in sorted(D.items(),key=lambda x:int(x[0])):
  b=json.load(open('/home/claude/bw/bout/13/%03d.json'%int(k)))['v']
  txt=' '.join(v.replace('\n',' ') for v in b)
  if c['one'] not in txt and not c['one'].endswith('요.') : print(k,'ONE not in text?',c['one'])
  if not 28<=len(c['one'])<=62: print(k,'one len',len(c['one']))
  if len(c['q'])>46: print(k,'q len',len(c['q']))
  for vs,l in c.get('sp',{}).items():
    n=len(b[int(vs)-1].split('\n'))
    for e in l:
      if e[0]>=n: print(k,'sp bad',vs,e)
      elif not b[int(vs)-1].split('\n')[e[0]].startswith('“'): print(k,'sp line not quote start',vs,e,b[int(vs)-1].split('\n')[e[0]][:20])
  for f in c.get('fold',[]):
    if not(1<=f[0]<=f[1]<=len(b)): print(k,'fold bad',f[:2])
print(len(D),'ok')
