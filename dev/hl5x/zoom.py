# 몇 프레임을 크게: zoom.py root out spec...   spec = hero:cif:motion:frame[:dir] | mon:idx:motion:frame[:dir]
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from comp2 import render, hero_banks
from cif import parse as cparse
from roster import roster, mon_banks
from PIL import Image, ImageDraw
root, out = sys.argv[1], sys.argv[2]; sp = os.path.join(root, 'sp'); R = None; tiles = []
for s in sys.argv[3:]:
    a = s.split(':'); kind = a[0]; ident, mo, fr = int(a[1]), int(a[2]), int(a[3]); d = int(a[4]) if len(a) > 4 else 1
    if kind == 'hero':
        c = cparse(open(os.path.join(sp, 'cif/%03d.cif' % ident), 'rb').read(), 1); banks = hero_banks(sp, c); hero = True
    else:
        R = R or roster(root); m = R[ident]; hero = m['cif'] in (40, 31)
        c = cparse(open(os.path.join(sp, 'cif/%03d.cif' % m['cif']), 'rb').read(), 1 if hero else 0); banks = mon_banks(root, m)
    mm = c['motions'][mo]; layer = mm[min(d, len(mm) - 1)][fr]
    im = render(layer, banks, hero, 'allc', 160).resize((480, 480), Image.NEAREST)
    bg = Image.new('RGBA', im.size, (40, 44, 60, 255)); bg.alpha_composite(im); ImageDraw.Draw(bg).text((4, 4), s, fill=(255, 255, 0, 255)); tiles.append(bg)
W = Image.new('RGBA', (480 * len(tiles), 480)); [W.alpha_composite(t, (480 * i, 0)) for i, t in enumerate(tiles)]; W.save(out)
