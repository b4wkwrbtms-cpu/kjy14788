# v36 리그 시제품 그리기: proto36.js 결과(JSON) → PNG 한 장 (자세마다 한 칸, 무기는 회색 막대)
# python3 proto36.py out.json out.png [cell=6] [cols=6]
import json, sys, math
from PIL import Image, ImageDraw
data = json.load(open(sys.argv[1]))
out = sys.argv[2]
cell = int(sys.argv[3]) if len(sys.argv) > 3 else 6
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 6
BLADE = 15.5 * 5 / 3.5            # 칸
W, H = 46, 40                      # 칸 단위 그림 칸
ims = []
for d in data:
    im = Image.new("RGB", (W * cell, H * cell), (28, 34, 52))
    dr = ImageDraw.Draw(im)
    gy = 34                       # 땅 줄(칸)
    dr.rectangle([0, gy * cell, W * cell, H * cell], fill=(20, 24, 38))
    ox = 8 + d["dx"] / 3.5         # 그림 왼쪽 위 (칸) : 몸 지도 0칸 = 원래 -P
    oy = gy - (d["h"])             # 지도 아래 끝 = 땅
    def px(grid, x0, y0):
        for y, row in enumerate(grid):
            for x, hexc in enumerate(row):
                if not hexc: continue
                X = (x0 + x - 1) * cell; Y = (y0 + y - 1) * cell
                dr.rectangle([X, Y, X + cell - 1, Y + cell - 1], fill=hexc)
    px(d["body"], ox, oy)
    # 무기: 손에서 wa 방향
    hx = (ox + d["hx"]) * cell; hy = (oy + d["hy"]) * cell
    wa = d["wa"]
    ex = hx + math.sin(wa) * BLADE * cell; ey = hy - math.cos(wa) * BLADE * cell
    dr.line([hx, hy, ex, ey], fill=(200, 210, 230), width=max(2, int(cell * 1.6)))
    px(d["arm"], ox + d["abx"], oy + d["aby"])
    dr.text((4, 4), f'{d["look"]} {d["pose"]}', fill=(255, 230, 120))
    ims.append(im)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (W * cell * cols, H * cell * rows), (0, 0, 0))
for i, im in enumerate(ims):
    sheet.paste(im, ((i % cols) * W * cell, (i // cols) * H * cell))
sheet.save(out)
print(sheet.size)
