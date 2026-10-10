import sys, json
from PIL import Image, ImageDraw, ImageFont
# 사용: python3 feelsheet.py prefix name start count cols [x0 y0 x1 y1] [scale]
pre, name, start, count, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
box = tuple(map(int, sys.argv[6:10])) if len(sys.argv) >= 10 else (420, 380, 1020, 780)
sc = float(sys.argv[10]) if len(sys.argv) >= 11 else 0.5
labels = json.load(open(f'feelshots/{pre}_{name}.json'))
w, h = int((box[2]-box[0])*sc), int((box[3]-box[1])*sc)
rows = (count + cols - 1)//cols
sheet = Image.new('RGB', (cols*w, rows*(h+14)), (20, 20, 28))
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
except: font = ImageFont.load_default()
for i in range(count):
    k = start + i
    try: im = Image.open(f'feelshots/{pre}_{name}_{k:03d}.png').crop(box).resize((w, h), Image.NEAREST)
    except FileNotFoundError: break
    x, y = (i % cols)*w, (i//cols)*(h+14)
    sheet.paste(im, (x, y+14))
    d.text((x+3, y+1), f'{k} {labels[k] if k < len(labels) else ""}', fill=(255, 230, 120), font=font)
out = f'feelshots/sheet_{pre}_{name}_{start}.png'
sheet.save(out); print(out, sheet.size)
