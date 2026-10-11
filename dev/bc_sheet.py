# v43 보고용 전투 비교 시트: uishots/<prefix>_<wi>_{idle,h1,h2}.png → uishots/<prefix>_report.png
import sys, json
from PIL import Image, ImageDraw, ImageFont
P = sys.argv[1] if len(sys.argv) > 1 else 'v43bc'
M = json.load(open(f'uishots/{P}_meta.json'))
fN = ImageFont.truetype('gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', 26)
fB = ImageFont.truetype('gfonts/ofl/dohyeon/DoHyeon-Regular.ttf', 34)
hexrgb = lambda c: tuple(int(c[i:i+2], 16) for i in (1, 3, 5))
W, LW = 420, 250
rows = []
for r in M['rows']:
    ims = [Image.open(f"uishots/{P}_{r['wi']}_{k}.png").convert('RGB') for k in ('idle', 'h1', 'h2')]
    rows.append((r, [im.resize((W, int(im.height * W / im.width)), Image.LANCZOS) for im in ims]))
h = rows[0][1][0].height
out = Image.new('RGB', (LW + 3 * (W + 10) + 10, (h + 12) * len(rows) + 70), (18, 21, 34)); d = ImageDraw.Draw(out)
for k, t in enumerate(['들고 있을 때', '친 순간', '0.2초 뒤']):
    d.text((LW + k * (W + 10) + W / 2 - d.textlength(t, font=fN) / 2, 18), t, fill=(200, 206, 222), font=fN)
y = 60
for r, ims in rows:
    d.text((16, y + h / 2 - 60), r['g'], fill=hexrgb(r['gc']), font=fB)
    nm = r['n']; ws = nm.split(' ')
    lines = [nm] if d.textlength(nm, font=fN) < LW - 24 else [' '.join(ws[:len(ws) // 2]), ' '.join(ws[len(ws) // 2:])]
    for i, ln in enumerate(lines): d.text((16, y + h / 2 - 14 + i * 32), ln, fill=(236, 239, 248), font=fN)
    for i, c in enumerate(r['pal']): d.rounded_rectangle([16 + i * 40, y + h / 2 + 56, 16 + i * 40 + 32, y + h / 2 + 80], radius=6, fill=hexrgb(c))
    for k, im in enumerate(ims): out.paste(im, (LW + k * (W + 10), y))
    y += h + 12
out = out.crop((0, 0, out.width, y)); out.save(f'uishots/{P}_report.png'); print(out.size)
