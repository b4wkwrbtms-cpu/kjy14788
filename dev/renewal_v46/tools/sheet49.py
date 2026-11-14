import sys
from PIL import Image, ImageDraw
out = sys.argv[1]; cols = int(sys.argv[2]); sc = float(sys.argv[3]); fs = sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in fs]; w, h = ims[0].size; w2, h2 = int(w * sc), int(h * sc)
rows = (len(ims) + cols - 1) // cols; S = Image.new('RGB', (w2 * cols, h2 * rows), (0, 0, 0))
for i, im in enumerate(ims):
    t = im.resize((w2, h2), Image.LANCZOS); ImageDraw.Draw(t).text((6, 4), fs[i].split('/')[-1], fill=(255, 255, 0)); S.paste(t, ((i % cols) * w2, (i // cols) * h2))
S.save(out)
