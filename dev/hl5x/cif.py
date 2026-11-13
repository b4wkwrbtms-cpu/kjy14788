# 영웅서기5 .cif (SPRITE_DATA::LoadSprData를 그대로 따라 읽음)
# [n0][n0개 바이트(쓰는 그림 묶음 번호)][동작 수 M] 동작마다 [프레임 수 F] 프레임마다 [층 수 L] 층마다 [조각 수 P] 조각마다 4/9바이트(flag=1이면 5/10)
import sys
def s8(v): return v - 256 if v > 127 else v
def parse(b, flag):
    o = 0; n0 = s8(b[o]); o += 1
    imgs = list(b[o:o + n0]); o += n0
    M = b[o]; o += 1
    motions = []
    for m in range(M):
        F = s8(b[o]); o += 1; frames = []
        for f in range(max(0, F)):
            L = b[o]; o += 1; layers = []
            for l in range(L):
                P = s8(b[o]); o += 1; parts = []
                for p in range(max(0, P)):
                    big = b[o] & 0x80
                    n = (10 if big else 5) if flag == 1 else (9 if big else 4)
                    parts.append(bytes(b[o:o + n])); o += n
                layers.append(parts)
            frames.append(layers)
        motions.append(frames)
    return dict(imgs=imgs, motions=motions, used=o, size=len(b))
if __name__ == '__main__':
    for f in sys.argv[1:]:
        b = open(f, 'rb').read()
        for flag in (0, 1):
            try:
                r = parse(b, flag); print(f, 'flag', flag, 'used', r['used'], '/', r['size'], 'imgs', r['imgs'], 'motions', len(r['motions']), [len(x) for x in r['motions'][:12]])
            except Exception as e: print(f, 'flag', flag, 'ERR', e)
