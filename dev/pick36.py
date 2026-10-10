# 무기별 대표 장면: 예비 끝 · 맞는 순간 · +3f · 포즈 홀드(+12f)
import json, sys
from PIL import Image, ImageDraw, ImageFont
pre, jobs = sys.argv[1], sys.argv[2].split(',')
box = (420, 330, 1000, 740); sc = 0.5
font = ImageFont.truetype('gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', 16)
w, h = int((box[2]-box[0])*sc), int((box[3]-box[1])*sc)
rows = []
for j in jobs:
    lab = json.load(open(f'feelshots/{pre}_{j}.json'))
    a = next((i for i, s in enumerate(lab) if s.startswith('a ') and i > 0 and lab[i-1].startswith('w ')), None)
    if a is None: a = next((i for i, s in enumerate(lab) if s.startswith('a ')), 5)
    picks = [max(0, a - 2), a - 1, a, min(len(lab)-1, a + 3), min(len(lab)-1, a + 12)]
    rows.append((j, picks))
sheet = Image.new('RGB', (w * 5 + 70, (h + 4) * len(rows)), (20, 20, 28)); d = ImageDraw.Draw(sheet)
for r, (j, picks) in enumerate(rows):
    d.text((6, r * (h + 4) + h // 2 - 8), j, fill=(255, 230, 120), font=font)
    for c, k in enumerate(picks):
        im = Image.open(f'feelshots/{pre}_{j}_{k:03d}.png').crop(box).resize((w, h), Image.NEAREST)
        sheet.paste(im, (70 + c * w, r * (h + 4)))
out = f'feelshots/pick_{pre}.png'; sheet.save(out); print(out, sheet.size)
