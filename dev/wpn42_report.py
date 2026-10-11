# 보고용 새 무기 12개 시트: 신화 6 · 초월 6, 이름 두 줄, 등급 색 머리띠
import json, sys
sys.path.insert(0, '.')
from wpn42 import parse, render, hexrgb
from PIL import Image, ImageDraw, ImageFont

items = parse('wpn42.txt')
names = json.load(open('wpn_names.json'))
fT = ImageFont.truetype('gfonts/ofl/dohyeon/DoHyeon-Regular.ttf', 30)
fN = ImageFont.truetype('gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', 19)
fS = ImageFont.truetype('gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', 16)
cell = 7
cw, chh = 196, 290
groups = [('신화', '#ff6b6b', range(30, 36), '31~36번 · 열 때 은괴·자수정'), ('초월', '#fff09a', range(36, 42), '37~42번 · 마지막 무기는 자수정으로 끝없이 돌파')]
Wd = cw * 6 + 40
Hd = 40 + len(groups) * (chh + 70)
sheet = Image.new('RGB', (Wd, Hd), (18, 21, 34)); d = ImageDraw.Draw(sheet)
y = 24
for gname, gcol, rng, sub in groups:
    c = hexrgb(gcol)
    # 등급 칩
    tw = d.textlength(gname, font=fT)
    d.rounded_rectangle([20, y, 20 + tw + 36, y + 46], radius=23, outline=c, width=3, fill=(30, 33, 50))
    d.text((38, y + 7), gname, fill=c, font=fT)
    d.text((20 + tw + 56, y + 14), sub, fill=(170, 178, 200), font=fS)
    y += 62
    for k, i in enumerate(rng):
        x0 = 20 + k * cw
        d.rounded_rectangle([x0 + 4, y, x0 + cw - 4, y + chh - 8], radius=16, fill=(26, 30, 46), outline=tuple(int(v * 0.45) for v in c), width=2)
        im = render(items[i], cell)
        sheet.paste(im, (x0 + (cw - im.width) // 2, y + 6), im)
        nm = names[i]['n']
        words = nm.split(' ')
        # 두 줄로 나누기
        best = None
        for cut in range(1, len(words)):
            a, b = ' '.join(words[:cut]), ' '.join(words[cut:])
            m = max(d.textlength(a, font=fN), d.textlength(b, font=fN))
            if best is None or m < best[0]: best = (m, a, b)
        lines = [nm] if (d.textlength(nm, font=fN) < cw - 24 or not best) else [best[1], best[2]]
        ty = y + chh - 8 - 14 - 26 * len(lines)
        for ln in lines:
            lw = d.textlength(ln, font=fN)
            d.text((x0 + (cw - lw) / 2, ty), ln, fill=(236, 239, 248), font=fN); ty += 26
        d.text((x0 + 14, y + 10), str(i + 1), fill=c, font=fS)
    y += chh + 8
sheet = sheet.crop((0, 0, Wd, y + 8))
sheet.save('report_v42_weapons.png'); print(sheet.size)
