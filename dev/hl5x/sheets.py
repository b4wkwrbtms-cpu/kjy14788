# 그림 묶음마다 조각을 한 장에 늘어놓기 (2배) + 폴더별 개요
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from mgr import parse, decode
from PIL import Image, ImageDraw
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
summary = {}
for d in sorted(os.listdir(src)):
    dp = os.path.join(src, d)
    if not os.path.isdir(dp): continue
    for f in sorted(os.listdir(dp)):
        if not f.endswith('.mgr'): continue
        recs = [decode(r) for r in parse(open(os.path.join(dp, f), 'rb').read())]
        ims = [r['img'] for r in recs if r['w'] > 1 and r['h'] > 1]
        if not ims: continue
        S = 2; W = 640; x = y = rowh = 0; pos = []
        for im in ims:
            w, h = im.width * S, im.height * S
            if x + w > W: x = 0; y += rowh + 4; rowh = 0
            pos.append((x, y)); x += w + 4; rowh = max(rowh, h)
        sheet = Image.new('RGBA', (W, y + rowh + 4), (40, 44, 56, 255))
        for im, (px, py) in zip(ims, pos): sheet.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), (px, py))
        sheet.save(os.path.join(dst, f'{d}_{f[:-4]}.png'))
        summary[f'{d}/{f}'] = [len(ims), max(i.width for i in ims), max(i.height for i in ims), sum(i.width * i.height for i in ims)]
json.dump(summary, open(os.path.join(dst, 'summary.json'), 'w'))
print(len(summary))
