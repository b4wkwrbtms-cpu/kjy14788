# v36 무기 디자인 도구: wpn36.txt → 검사 · 미리보기 PNG · part_wpn36.js 데이터
# python3 wpn36.py [preview.png] [--js part_wpn36_data.js]
import sys, re, json, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, GRIP = 13, 26, 22

def parse(path):
    items, cur = [], None
    for line in open(path, encoding='utf-8'):
        line = line.rstrip('\n')
        if not line or line.startswith('#'):
            continue
        if line.startswith('== '):
            m = re.match(r'== (\d+) (\w+) \| (.+)$', line)
            n, key, fx = int(m.group(1)), m.group(2), m.group(3).split()
            cur = {'n': n, 'key': key, 'vfx': fx if fx[0] != 'rgb' else None, 'pal': {}, 'glow': None, 'rows': []}
            items.append(cur)
        elif line.startswith('pal '):
            for kv in line[4:].split():
                k, v = kv.split('=')
                cur['pal'][k] = v
        elif line.startswith('glow '):
            _, chars, col = line.split()
            cur['glow'] = {'chars': chars, 'col': col}
        else:
            cur['rows'].append(line)
    return items

def check(items):
    bad = []
    for it in items:
        if len(it['rows']) != H:
            bad.append(f"{it['n']} {it['key']}: rows {len(it['rows'])}")
        for i, r in enumerate(it['rows']):
            if len(r) != W:
                bad.append(f"{it['n']} {it['key']} row {i}: width {len(r)} '{r}'")
            for ch in r:
                if ch != '.' and ch not in it['pal']:
                    bad.append(f"{it['n']} {it['key']} row {i}: char '{ch}' not in pal")
        # 손 자리에 무언가 있어야 함
        if it['rows'] and len(it['rows']) > GRIP and it['rows'][GRIP].strip('.') == '':
            bad.append(f"{it['n']} {it['key']}: grip row empty")
    return bad

def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def shade(h, f):
    r, g, b = hexrgb(h)
    if f >= 0: r, g, b = r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f
    else: r, g, b = r * (1 + f), g * (1 + f), b * (1 + f)
    return '#%02x%02x%02x' % tuple(max(0, min(255, round(v))) for v in (r, g, b))

def pretty(rows, pal):
    h, w = len(rows), max(len(r) for r in rows)
    at = lambda x, y: rows[y][x] if 0 <= y < h and 0 <= x < len(rows[y]) and rows[y][x] != '.' and rows[y][x] in pal else None
    out = []
    for y in range(-1, h + 1):
        row = []
        for x in range(-1, w + 1):
            c = at(x, y)
            if not c:
                row.append('#140f1c' if (at(x + 1, y) or at(x - 1, y) or at(x, y + 1) or at(x, y - 1)) else None); continue
            hx = pal[c]
            if c != 'k':
                if not at(x, y + 1): hx = shade(hx, -0.3)
                elif not at(x + 1, y): hx = shade(hx, -0.16)
                elif not at(x, y - 1) or not at(x - 1, y): hx = shade(hx, 0.2)
            row.append(hx)
        out.append(row)
    return out

def render(it, cell, glow=True):
    px = pretty(it['rows'], it['pal'])
    im = Image.new('RGBA', ((W + 2) * cell, (H + 2) * cell), (0, 0, 0, 0))
    if glow and it['glow']:
        g = Image.new('RGBA', im.size, (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
        col = hexrgb(it['glow']['col'])
        for y, r in enumerate(it['rows']):
            for x, ch in enumerate(r):
                if ch in it['glow']['chars']:
                    cx, cy = (x + 1.5) * cell, (y + 1.5) * cell
                    gd.ellipse([cx - cell * 1.6, cy - cell * 1.6, cx + cell * 1.6, cy + cell * 1.6], fill=col + (90,))
        g = g.filter(ImageFilter.GaussianBlur(cell * 1.2))
        im = Image.alpha_composite(im, g)
    d = ImageDraw.Draw(im)
    for y, r in enumerate(px):
        for x, c in enumerate(r):
            if c: d.rectangle([x * cell, y * cell, x * cell + cell - 1, y * cell + cell - 1], fill=c)
    return im

if __name__ == '__main__':
    items = parse('wpn36.txt')
    bad = check(items)
    print('items', len(items), 'problems', len(bad))
    for b in bad: print('  ', b)
    if '--js' in sys.argv:
        out = sys.argv[sys.argv.index('--js') + 1]
        data = [{'s': it['key'], 'm': it['rows'], 'p': it['pal'], 'vfx': it['vfx'], 'glow': it['glow']} for it in items]
        open(out, 'w', encoding='utf-8').write('var WPN36 = ' + json.dumps(data, ensure_ascii=False) + ';\n')
        print('wrote', out)
    prev = next((a for a in sys.argv[1:] if a.endswith('.png')), None)
    if prev and not bad:
        names = json.load(open('wpn_now.json')) if True else []
        font = ImageFont.truetype('gfonts/ofl/gowundodum/GowunDodum-Regular.ttf', 15)
        cell = 6; cw, ch = (W + 2) * cell + 30, (H + 2) * cell + 34
        cols = 10; rows = (len(items) + cols - 1) // cols
        sheet = Image.new('RGB', (cw * cols, ch * rows), (22, 26, 40)); sd = ImageDraw.Draw(sheet)
        for i, it in enumerate(items):
            x0, y0 = (i % cols) * cw, (i // cols) * ch
            im = render(it, cell)
            sheet.paste(im, (x0 + 15, y0 + 4), im)
            # 이펙트 색 띠
            v = it['vfx'] or ['#ff6bd6', '#6fd3ff', '#ffd54a']
            for k, c in enumerate(v): sd.rectangle([x0 + 6, y0 + 8 + k * 14, x0 + 14, y0 + 20 + k * 14], fill=c)
            nm = names[i]['n'] if i < len(names) else it['key']
            sd.text((x0 + 4, y0 + ch - 22), f"{i+1}.{nm}", fill=(255, 214, 90) if i >= 20 else (230, 234, 245), font=font)
        sheet.save(prev); print('preview', prev, sheet.size)
