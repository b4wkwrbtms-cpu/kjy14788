# 몬스터 목록: enemy_0.dat(이름·등급) + enemy_g.dat(cif·묶음·팔레트)
import struct, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from mgr import parse as mparse, decode, rgb565, KEY
from PIL import Image
def recs(path):
    d = open(path, 'rb').read(); n = struct.unpack_from('<H', d, 0)[0]; o = 2; out = []
    for i in range(n):
        L = struct.unpack_from('<H', d, o)[0]; out.append(d[o + 2:o + 2 + L]); o += 2 + L
    return out
def s8(v): return v - 256 if v > 127 else v
def roster(root):
    E = recs(os.path.join(root, 'csv/enemy_0.dat')); G = recs(os.path.join(root, 'csv/enemy_g.dat')); out = []
    for i, (e, g) in enumerate(zip(E, G)):
        nl = e[0]; name = e[1:1 + nl].decode('euc-kr', 'replace'); r = e[1 + nl:]
        banks = [s8(g[3 + k]) for k in range(9)]; pals = [struct.unpack_from('<h', g, 12 + 2 * k)[0] for k in range(6)]
        out.append(dict(i=i, name=name.strip("^'{"), grade=r[0], cif=s8(g[0]), g1=g[1], g2=g[2], banks=banks, pals=pals, raw=r, graw=g))
    return out
def load_pal(root, pid):
    p = os.path.join(root, 'sp/pal/%03d.pal' % pid)
    if pid < 0 or not os.path.exists(p): return None
    d = open(p, 'rb').read(); n = d[0]
    return {struct.unpack_from('<H', d, 1 + 4 * k)[0]: struct.unpack_from('<H', d, 3 + 4 * k)[0] for k in range(n)}
def bank_images(root, slot, bank, pid=-1):
    p = os.path.join(root, 'sp/img%d/%03d.mgr' % (min(slot, 5) if slot > 6 else slot, bank))
    if not os.path.exists(p): return None
    remap = load_pal(root, pid); out = []
    for rec in mparse(open(p, 'rb').read()):
        if remap:
            rec = bytearray(rec); nc = rec[1] or 256
            for k in range(nc):
                c = struct.unpack_from('<H', rec, 6 + 2 * k)[0]
                if c in remap: struct.pack_into('<H', rec, 6 + 2 * k, remap[c])
            rec = bytes(rec)
        out.append(decode(rec)['img'])
    return out
def mon_banks(root, m):
    b = {}
    for k, bank in enumerate(m['banks']):
        if bank < 0: continue
        im = bank_images(root, k, bank, m['pals'][k] if k < 6 else -1)
        if im: b[k] = im
    return b
