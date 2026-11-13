# 영웅서기5 .mgr 그림 묶음 읽기: u32 개수, 그다음 [u32 크기, 기록] 반복
# 기록 = [형식 u8][색 수 u8][w u16][h u16][팔레트 RGB565 × 색 수][픽셀 (4비트 또는 8비트 색 번호)]
import struct, sys
from PIL import Image
KEY = 0xf81f
def rgb565(c): return ((c >> 11) & 31) * 255 // 31, ((c >> 5) & 63) * 255 // 63, (c & 31) * 255 // 31
def parse(b):
    n = struct.unpack_from('<I', b, 0)[0]; o = 4; out = []
    for i in range(n):
        if o + 4 > len(b): break
        size = struct.unpack_from('<I', b, o)[0]; rec = b[o + 4:o + 4 + size]; o += 4 + size
        out.append(rec)
    return out
def decode(rec):
    fmt, nc, w, h = rec[0], rec[1], *struct.unpack_from('<HH', rec, 2)
    ncol = nc if nc else 256
    pal = [struct.unpack_from('<H', rec, 6 + 2 * k)[0] for k in range(ncol)]
    px = rec[6 + 2 * ncol:]
    bits = 4 if ncol <= 16 else 8
    img = Image.new('RGBA', (max(1, w), max(1, h)), (0, 0, 0, 0)); P = img.load()
    stride = (w + 1) // 2 if bits == 4 else w
    for y in range(h):
        for x in range(w):
            if bits == 4:
                k = y * stride + x // 2
                if k >= len(px): continue
                v = px[k]; ci = (v >> 4) if x % 2 == 0 else (v & 15)
            else:
                k = y * w + x
                if k >= len(px): continue
                ci = px[k]
            if ci < len(pal) and pal[ci] != KEY: P[x, y] = rgb565(pal[ci]) + (255,)
    return dict(fmt=fmt, nc=ncol, w=w, h=h, bits=bits, extra=len(px) - stride * h, img=img, pal=pal)
if __name__ == '__main__':
    for f in sys.argv[1:]:
        recs = parse(open(f, 'rb').read())
        ds = [decode(r) for r in recs]
        print(f, len(recs), [(d['fmt'], d['nc'], d['w'], d['h'], d['extra']) for d in ds[:8]])
