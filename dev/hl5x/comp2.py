# 조립 v2: 회전 = 바이트×2°, 합성 = mode>>2 (0 보통·4 스크린·7 더하기), 뒤집기 = mode&3 (1 좌우, 2·3 상하) 또는 플래그 0x20/0x40
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from mgr import parse as mparse, decode
from cif import parse as cparse
from PIL import Image, ImageChops
def s8(v): return v - 256 if v > 127 else v
def s12(v): return v - 4096 if v >= 2048 else v
def pinfo(p, hero):
    fl = p[0]
    if hero:
        o = dict(slot=fl & 15, idx=p[1], x=s12((p[2] << 4) | (p[3] >> 4)), y=s12(((p[3] & 15) << 8) | p[4])); e = p[5:]
    else:
        o = dict(slot=fl & 15, idx=p[1], x=s8(p[2]), y=s8(p[3])); e = p[4:]
    o.update(fl=fl & 0xf0, sx=1.0, sy=1.0, rot=0, a=255, blend=0, hf=bool(fl & 0x20), vf=bool(fl & 0x40), ext=False)
    if fl & 0x80 and len(e) >= 5:
        m = e[4]
        o.update(sx=e[0] / 25, sy=e[1] / 25, rot=e[2] * 2, a=e[3], blend=m >> 2, ext=True)
        if m & 3 == 1: o['hf'] = True
        elif m & 3: o['vf'] = True
    return o
def render(layer, banks, hero, anchor='tl', canvas=256, bg=(0, 0, 0, 0)):
    C = Image.new('RGBA', (canvas, canvas), bg); ox = oy = canvas // 2
    for p in layer:
        q = pinfo(p, hero); b = banks.get(q['slot'])
        if not b or q['idx'] >= len(b): continue
        im = b[q['idx']]
        if im.width <= 1 and im.height <= 1: continue
        w0, h0 = im.size
        if q['hf']: im = im.transpose(Image.FLIP_LEFT_RIGHT)
        if q['vf']: im = im.transpose(Image.FLIP_TOP_BOTTOM)
        if q['sx'] != 1 or q['sy'] != 1: im = im.resize((max(1, round(im.width * q['sx'])), max(1, round(im.height * q['sy']))), Image.NEAREST)
        if q['rot']: im = im.rotate(-q['rot'], expand=True, resample=Image.NEAREST)
        if q['a'] < 255: a = im.getchannel('A').point(lambda v: v * q['a'] // 255); im = im.copy(); im.putalpha(a)
        if anchor == 'allc': px, py = ox + q['x'] - im.width // 2, oy + q['y'] - im.height // 2
        elif anchor == 'center' and q['ext']: px, py = ox + q['x'] - im.width // 2, oy + q['y'] - im.height // 2
        elif anchor == 'c0' and q['ext']: px, py = ox + q['x'] + w0 // 2 - im.width // 2, oy + q['y'] + h0 // 2 - im.height // 2   # 원래 크기의 가운데를 기준
        else: px, py = ox + q['x'], oy + q['y']
        if px >= C.width or py >= C.height or px + im.width <= 0 or py + im.height <= 0: continue
        if q['blend'] in (4, 7):
            L = Image.new('RGBA', C.size, (0, 0, 0, 0)); L.alpha_composite(im, (max(0, px), max(0, py)), (max(0, -px), max(0, -py)))
            rgb = Image.merge('RGB', [ch.point(lambda v: v) for ch in L.split()[:3]]); al = L.getchannel('A')
            src = Image.composite(rgb, Image.new('RGB', C.size, 0), al)
            base = C.convert('RGB'); out = ImageChops.screen(base, src) if q['blend'] == 4 else ImageChops.add(base, src)
            na = ImageChops.lighter(C.getchannel('A'), al); C = out.convert('RGBA'); C.putalpha(na)
        else:
            C.alpha_composite(im, (max(0, px), max(0, py)), (max(0, -px), max(0, -py)))
    return C
def hero_banks(root, c):
    banks = {}
    for k, n in enumerate(c['imgs']):
        p = os.path.join(root, 'img%d/%03d.mgr' % (k, n))
        if os.path.exists(p): banks[k] = [d['img'] for d in map(decode, mparse(open(p, 'rb').read()))]
    return banks
