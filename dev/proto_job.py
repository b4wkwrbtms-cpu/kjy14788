# 직무별 공격 자세 시제품: proto36.js 결과(JSON) + 무기 도트(회전) + 간단한 이펙트 표시 → 직무 × 장면 표
# python3 proto_job.py out.json jobs.json out.png
import json, sys, math
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, '.')
import importlib.util
spec = importlib.util.spec_from_file_location('wpn36', 'wpn36.py'); W36 = importlib.util.module_from_spec(spec); spec.loader.exec_module(W36)

data = json.load(open(sys.argv[1])); jobs = json.load(open(sys.argv[2])); out = sys.argv[3]
items = W36.parse('wpn36.txt')
font = ImageFont.truetype('gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', 22)
fsm = ImageFont.truetype('gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', 17)
cell = 6
TW, TH = 84, 50          # 장면 칸(도트 칸)
GY = 43                  # 땅 줄
BLADE = 22.5

def weapon_img(idx):
    return W36.render(items[idx], cell, glow=True), items[idx]

def paste_weapon(scene, idx, hx, hy, wa):
    im, it = weapon_img(idx)
    rows = it['rows']; g = rows[22]; xs = [i for i, ch in enumerate(g) if ch != '.']; cx = (xs[0] + xs[-1]) / 2
    gx, gy = (cx + 0.5 + 1) * cell, (22 + 0.5 + 1) * cell
    R = int(math.hypot(max(gx, im.width - gx), max(gy, im.height - gy))) + 2
    c = Image.new('RGBA', (2 * R, 2 * R), (0, 0, 0, 0)); c.paste(im, (int(R - gx), int(R - gy)), im)
    c = c.rotate(-math.degrees(wa), resample=Image.NEAREST)
    scene.alpha_composite(c, (int(hx - R), int(hy - R)))

def tip(hx, hy, wa, L=BLADE):
    return hx + math.sin(wa) * L * cell, hy - math.cos(wa) * L * cell

def fx_draw(d, f, hx, hy, wa):
    k = f['k']; tx, ty = tip(hx, hy, wa)
    if k == 'muzzle':
        r = 3.2 * cell
        for a in range(8):
            t = a * math.pi / 4 + 0.2; L = r * (1.6 if a % 2 == 0 else 0.9)
            d.line([tx, ty, tx + math.cos(t) * L, ty + math.sin(t) * L], fill=(255, 236, 140), width=cell)
        d.ellipse([tx - r * 0.7, ty - r * 0.7, tx + r * 0.7, ty + r * 0.7], fill=(255, 255, 230))
    elif k == 'beam':
        col = tuple(f.get('col', (255, 70, 90)))
        d.line([tx, ty, TW * cell, ty + math.cos(wa) * -0], fill=col, width=int(cell * 2.4))
        d.line([tx, ty, TW * cell, ty], fill=(255, 240, 240), width=int(cell * 0.9))
    elif k == 'bolt':
        col = tuple(f.get('col', (111, 211, 255)))
        bx, by = tx + f.get('ahead', 8) * cell, ty
        for i in range(6): d.ellipse([bx - (6 - i) * cell * 1.1 - cell * 0.6, by - cell * 0.6 * (1 - i / 7), bx - (6 - i) * cell * 1.1 + cell * 0.6, by + cell * 0.6 * (1 - i / 7)], fill=col)
        d.ellipse([bx - cell * 1.4, by - cell * 1.4, bx + cell * 1.4, by + cell * 1.4], fill=(230, 250, 255))
        if f.get('glyph'): d.text((bx - cell * 2, by - cell * 4.5), f['glyph'], fill=col, font=fsm)
    elif k == 'circle':
        col = tuple(f.get('col', (111, 211, 255))); r = f.get('r', 4.5) * cell
        cxp, cyp = (tx, ty) if not f.get('atHand') else (hx + f.get('ox', 3) * cell, hy + f.get('oy', 0) * cell)
        d.ellipse([cxp - r, cyp - r, cxp + r, cyp + r], outline=col, width=int(cell * 0.7))
        d.ellipse([cxp - r * 0.62, cyp - r * 0.62, cxp + r * 0.62, cyp + r * 0.62], outline=col, width=int(cell * 0.4))
        for i in range(6):
            t = i * math.pi / 3 + 0.3; d.rectangle([cxp + math.cos(t) * r - cell * 0.7, cyp + math.sin(t) * r - cell * 0.7, cxp + math.cos(t) * r + cell * 0.7, cyp + math.sin(t) * r + cell * 0.7], fill=(230, 250, 255))
    elif k == 'ground':
        col = tuple(f.get('col', (111, 211, 255))); cxp = hx + f.get('ox', -4) * cell; cyp = GY * cell
        d.ellipse([cxp - 9 * cell, cyp - 2.2 * cell, cxp + 9 * cell, cyp + 2.2 * cell], outline=col, width=int(cell * 0.6))
    elif k == 'stamp':
        sx, sy = hx + f.get('ox', 10) * cell, hy + f.get('oy', -2) * cell
        d.rounded_rectangle([sx - 2 * cell, sy - 2 * cell, sx + 2 * cell, sy + 2 * cell], radius=cell, fill=tuple(f.get('col', (214, 64, 61))), outline=(20, 15, 28), width=2)
        d.rectangle([sx - 0.8 * cell, sy - 3.4 * cell, sx + 0.8 * cell, sy - 2 * cell], fill=(138, 90, 58))
        for i in range(3): d.arc([sx - 4 * cell - i * cell, sy - 4 * cell - i * cell, sx + 4 * cell + i * cell, sy + 4 * cell + i * cell], 200, 280, fill=(255, 200, 200), width=2)
    elif k == 'coin':
        for i, (ox, oy) in enumerate([(30, -9), (34, -4), (27, -2)]):
            cx0, cy0 = hx + ox * cell, hy + oy * cell
            d.ellipse([cx0 - 1.8 * cell, cy0 - 1.8 * cell, cx0 + 1.8 * cell, cy0 + 1.8 * cell], fill=(255, 213, 74), outline=(140, 96, 20), width=2)
            d.rectangle([cx0 - 0.4 * cell, cy0 - 1.0 * cell, cx0 + 0.4 * cell, cy0 + 1.0 * cell], fill=(255, 243, 176))
    elif k == 'casing':
        for i, (ox, oy) in enumerate([(-1, -5), (-3, -7), (-5, -6)]):
            d.rectangle([hx + ox * cell, hy + oy * cell, hx + ox * cell + cell * 1.2, hy + oy * cell + cell * 0.8], fill=(244, 241, 230))
    elif k == 'crescent':
        col = tuple(f.get('col', (255, 213, 74))); R = 18 * cell; cxp, cyp = hx - 1 * cell, hy + 2 * cell
        for th, a in [(1.0, 90), (0.6, 160), (0.3, 255)]:
            pts = []; n = 20; a0, a1 = -2.4, 0.55
            for i in range(n + 1): t = a0 + (a1 - a0) * i / n; pts.append((cxp + math.cos(t) * R, cyp + math.sin(t) * R))
            for i in range(n, -1, -1):
                u = i / n; t = a0 + (a1 - a0) * u; w = 6 * cell * th * math.sin(math.pi * min(1, 0.1 + 0.9 * u)) ** 0.7
                pts.append((cxp + math.cos(t) * (R - w), cyp + math.sin(t) * (R - w)))
            d.polygon(pts, fill=col + (a,))
        if f.get('glyph'):
            for i, gl in enumerate(f['glyph']): t = -2.0 + i * 0.7; d.text((cxp + math.cos(t) * (R - 3 * cell), cyp + math.sin(t) * (R - 3 * cell)), gl, fill=(230, 250, 255), font=fsm)

def scene(dd, wpn, fxs, nowpn=False):
    im = Image.new('RGBA', (TW * cell, TH * cell), (28, 34, 52, 255)); d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle([0, GY * cell, TW * cell, TH * cell], fill=(20, 24, 38))
    ox = 14 + dd['dx'] / 3.5; oy = GY - dd['h'] + 0.0 - dd.get('lift', 0) / 3.5 * 0
    def px(grid, x0, y0):
        for y, row in enumerate(grid):
            for x, c in enumerate(row):
                if c: d.rectangle([(x0 + x - 1) * cell, (y0 + y - 1) * cell, (x0 + x) * cell - 1, (y0 + y) * cell - 1], fill=c)
    for f in fxs:
        if f['k'] in ('crescent', 'ground'): fx_draw(d, f, (ox + dd['hx']) * cell, (oy + dd['hy']) * cell, dd['wa'])
    px(dd['body'], ox, oy)
    hx, hy = (ox + dd['hx']) * cell, (oy + dd['hy']) * cell
    if not nowpn: paste_weapon(im, wpn, hx, hy, dd['wa'])
    d = ImageDraw.Draw(im, 'RGBA')
    px(dd['arm'], ox + dd['abx'], oy + dd['aby'])
    for f in fxs:
        if f['k'] not in ('crescent', 'ground'): fx_draw(d, f, hx, hy, dd['wa'])
    return im

bypose = {d['pose']: d for d in data}
rows = jobs['rows']; ncol = max(len(r['cells']) for r in rows)
LW = 230; CW, CH = TW * cell, TH * cell + 34
sheet = Image.new('RGB', (LW + CW * ncol, CH * len(rows) + 60), (16, 19, 30)); sd = ImageDraw.Draw(sheet)
sd.text((14, 16), jobs.get('title', ''), fill=(255, 213, 74), font=font)
for r, row in enumerate(rows):
    y0 = 60 + r * CH
    sd.text((14, y0 + 20), row['job'], fill=tuple(row.get('col', (255, 255, 255))), font=font)
    for i, line in enumerate(row.get('sub', [])): sd.text((14, y0 + 56 + i * 24), line, fill=(200, 206, 222), font=fsm)
    for c, cellspec in enumerate(row['cells']):
        dd = bypose[cellspec['pose']]
        im = scene(dd, cellspec.get('wpn', jobs.get('wpn', 2)), cellspec.get('fx', []), cellspec.get('nowpn', False))
        sheet.paste(im.convert('RGB'), (LW + c * CW, y0))
        sd.text((LW + c * CW + 8, y0 + TH * cell + 6), cellspec['label'], fill=(255, 230, 150), font=fsm)
sheet.save(out); print(out, sheet.size)
