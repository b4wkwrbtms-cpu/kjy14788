import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from comp2 import render
from cif import parse as cparse
from mgr import parse as mparse, decode
from PIL import Image, ImageDraw
root, name, out = sys.argv[1], sys.argv[2], sys.argv[3]; cell = int(sys.argv[4]); maxf = int(sys.argv[5]); r0 = int(sys.argv[6]); r1 = int(sys.argv[7])
b = open(os.path.join(root, 'sp/cif/%s.cif' % name), 'rb').read()
for flag in (0, 1):
    try:
        c = cparse(b, flag)
        if c['used'] == c['size']: break
    except Exception as e: pass
print('flag', flag, 'imgs', c['imgs'], 'motions', len(c['motions']), [[len(d) for d in m] for m in c['motions']])
imgs = [d['img'] for d in map(decode, mparse(open(os.path.join(root, 'sp/imgcom/%s.mgr' % name), 'rb').read()))]
print('images', len(imgs))
banks = {k: imgs for k in range(16)}
M = c['motions'][r0:r1]; S = Image.new('RGBA', (cell * maxf + 30, cell * len(M)), (40, 44, 60, 255)); D = ImageDraw.Draw(S)
for mi, mm in enumerate(M):
    if not mm: continue
    fr = mm[0]; D.text((2, mi * cell + 2), '%d:%d' % (mi + r0, len(fr)), fill=(255, 255, 0, 255))
    for fi, layer in enumerate(fr[:maxf]):
        im = render(layer, banks, flag == 1, 'allc', cell * 2).crop((cell // 2, cell // 2, cell // 2 + cell, cell // 2 + cell))
        S.alpha_composite(im, (30 + fi * cell, mi * cell))
S.save(out)
