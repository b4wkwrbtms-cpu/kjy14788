# mkdbg.py와 같은 디버그 훅을 다른 html에: python3 mkdbg_from.py in.html out.html
import sys
s=open(sys.argv[1],encoding='utf-8').read()
anchor='const $ = id => document.getElementById(id);'
assert s.count(anchor)==1
out=s.replace(anchor, anchor+'\nwindow.__ev = c => eval(c);\n')
fa='function addFloat(x, y, text, color, size = 26, pop = false, style = "") {'
if out.count(fa)==1: out=out.replace(fa, fa+' if (window.__noFloat) return;')
open(sys.argv[2],'w',encoding='utf-8').write(out); print('ok', sys.argv[2])
