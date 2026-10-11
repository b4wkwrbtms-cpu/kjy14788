# 고른 프레임들을 확대해서 한 줄씩: python3 strip37.py prefix job "5,7,9" out.png [x0 y0 x1 y1] [scale]
import sys, json
from PIL import Image, ImageDraw, ImageFont
pre, job, idx, out = sys.argv[1], sys.argv[2], [int(v) for v in sys.argv[3].split(',')], sys.argv[4]
box = tuple(map(int, sys.argv[5:9])) if len(sys.argv) >= 9 else (260, 380, 960, 760)
sc = float(sys.argv[9]) if len(sys.argv) >= 10 else 0.6
L = json.load(open(f'feelshots/{pre}_{job}.json'))
w, h = int((box[2]-box[0])*sc), int((box[3]-box[1])*sc); cols = min(5, len(idx)); rows = (len(idx)+cols-1)//cols
sheet = Image.new('RGB', (cols*w, rows*(h+16)), (16, 19, 30)); d = ImageDraw.Draw(sheet)
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
for i, k in enumerate(idx):
    im = Image.open(f'feelshots/{pre}_{job}_{k:03d}.png').crop(box).resize((w, h), Image.LANCZOS)
    x, y = (i % cols)*w, (i//cols)*(h+16); sheet.paste(im, (x, y+16)); d.text((x+3, y+2), f'{k} {L[k]}', fill=(255, 230, 120), font=f)
sheet.save(out); print(out, sheet.size)
