# 동작 표: 줄 = 동작, 칸 = 프레임 (영웅은 dir 1, 몬스터는 dir 0)
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from comp2 import render, hero_banks
from cif import parse as cparse
from roster import roster, mon_banks
from PIL import Image, ImageDraw
root = sys.argv[1]; kind = sys.argv[2]; ident = int(sys.argv[3]); out = sys.argv[4]
cell = int(sys.argv[5]) if len(sys.argv) > 5 else 96; maxf = int(sys.argv[6]) if len(sys.argv) > 6 else 14
d = int(sys.argv[7]) if len(sys.argv) > 7 else (1 if kind == 'hero' else 0)
sp = os.path.join(root, 'sp')
if kind == 'hero':
    c = cparse(open(os.path.join(sp, 'cif/%03d.cif' % ident), 'rb').read(), 1); banks = hero_banks(sp, c); hero = True
elif kind == 'mon':
    R = roster(root); m = R[ident]; hero = m['cif'] in (40, 31)
    c = cparse(open(os.path.join(sp, 'cif/%03d.cif' % m['cif']), 'rb').read(), 1 if hero else 0); banks = mon_banks(root, m)
    print(m['name'], m['grade'], m['cif'], m['banks'], m['pals'])
print('motions', len(c['motions']), [[len(dd) for dd in mm] for mm in c['motions']])
r0 = int(sys.argv[8]) if len(sys.argv) > 8 else 0; r1 = int(sys.argv[9]) if len(sys.argv) > 9 else 999
M = c['motions'][r0:r1]; S = Image.new('RGBA', (cell * maxf + 30, cell * len(M)), (40, 44, 60, 255)); D = ImageDraw.Draw(S)
for mi, mm in enumerate(M):
    if not mm: continue
    fr = mm[min(d, len(mm) - 1)]
    D.text((2, mi * cell + 2), '%d:%d' % (mi + r0, len(fr)), fill=(255, 255, 0, 255))
    for fi, layer in enumerate(fr[:maxf]):
        im = render(layer, banks, hero, 'allc', cell * 2)
        im = im.crop((cell // 2, cell // 2 - cell // 4, cell // 2 + cell, cell // 2 - cell // 4 + cell))
        S.alpha_composite(im, (30 + fi * cell, mi * cell))
        D.line((30 + fi * cell, mi * cell, 30 + fi * cell, mi * cell + 6), fill=(90, 90, 120, 255))
S.save(out)
