# cif 프레임 조립 (조각 = [플래그][그림 번호][x][y] (+ [가로 배율/25][세로 배율/25][회전°][알파][합성]))
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))
from mgr import parse as mparse, decode
from cif import parse as cparse
from PIL import Image
def s8(v): return v - 256 if v > 127 else v
def part_info(p):
    fl = p[0]; idx = p[1]; x = s8(p[2]); y = s8(p[3])
    o = dict(fl=fl, idx=idx, x=x, y=y, sx=1.0, sy=1.0, rot=0, a=255, mode=0)
    if fl & 0x80 and len(p) >= 9:
        o.update(sx=p[4] / 25, sy=p[5] / 25, rot=p[6], a=p[7], mode=p[8])
    return o
def render(layer, imgs, anchor='center', canvas=256):
    C = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0)); ox = oy = canvas // 2
    for p in layer:
        q = part_info(p)
        if q['idx'] >= len(imgs): continue
        im = imgs[q['idx']]
        if im.width <= 1 and im.height <= 1: continue
        if q['fl'] & 0x20 or (q['mode'] & 1 and q['fl'] & 0x80): im = im.transpose(Image.FLIP_LEFT_RIGHT)
        if q['fl'] & 0x40 or (q['mode'] & 2 and q['fl'] & 0x80): im = im.transpose(Image.FLIP_TOP_BOTTOM)
        if q['sx'] != 1 or q['sy'] != 1: im = im.resize((max(1, round(im.width * q['sx'])), max(1, round(im.height * q['sy']))), Image.NEAREST)
        if q['rot']: im = im.rotate(-q['rot'], expand=True, resample=Image.NEAREST)
        if q['a'] < 255:
            a = im.getchannel('A').point(lambda v: v * q['a'] // 255); im = im.copy(); im.putalpha(a)
        if anchor == 'center': px, py = ox + q['x'] - im.width // 2, oy + q['y'] - im.height // 2
        else: px, py = ox + q['x'], oy + q['y']
        C.alpha_composite(im, (px, py))
    return C
# 주인공(flag 1): 조각 = [플래그|칸][그림][x 12비트][y 12비트] (+ 배율·회전·알파·합성 5바이트) — 칸 k의 그림 묶음은 img{k}/{imgs[k]:03d}.mgr
def s12(v): return v - 4096 if v >= 2048 else v
def hero_part(p):
    fl = p[0]; slot = fl & 15; idx = p[1]; x = s12((p[2] << 4) | (p[3] >> 4)); y = s12(((p[3] & 15) << 8) | p[4])
    o = dict(fl=fl & 0xf0, slot=slot, idx=idx, x=x, y=y, sx=1.0, sy=1.0, rot=0, a=255, mode=0)
    if fl & 0x80 and len(p) >= 10: o.update(sx=p[5] / 25, sy=p[6] / 25, rot=p[7], a=p[8], mode=p[9])
    return o
def render_hero(layer, banks, canvas=256):
    C = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0)); ox = oy = canvas // 2
    for p in layer:
        q = hero_part(p); b = banks.get(q['slot'])
        if not b or q['idx'] >= len(b): continue
        im = b[q['idx']]
        if im.width <= 1 and im.height <= 1: continue
        if q['fl'] & 0x20: im = im.transpose(Image.FLIP_LEFT_RIGHT)
        if q['fl'] & 0x40: im = im.transpose(Image.FLIP_TOP_BOTTOM)
        if q['sx'] != 1 or q['sy'] != 1: im = im.resize((max(1, round(im.width * q['sx'])), max(1, round(im.height * q['sy']))), Image.NEAREST)
        if q['rot']: im = im.rotate(-q['rot'], expand=True, resample=Image.NEAREST)
        C.alpha_composite(im, (ox + q['x'], oy + q['y']))
    return C
