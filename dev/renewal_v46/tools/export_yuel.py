# 곽준영 키우기 성경 데이터 → 유엘이 키우기 (해설 본문·설교 링크 제외): mz/he/krv/lin/xbooks 그대로, x는 un(미배치 해설) 빼고, nt는 요약 필드만
import json, os, shutil, glob
SRC = '/home/claude/renewal/app/bible'; DST = '/home/claude/yuel-kiugi/bible'
for d in ('mz', 'he', 'krv'):
    os.makedirs(f'{DST}/{d}', exist_ok=True)
    for f in glob.glob(f'{SRC}/{d}/*.json'): shutil.copy(f, f'{DST}/{d}/')
shutil.copy(f'{SRC}/lin.json', f'{DST}/lin.json'); shutil.copy(f'{SRC}/xbooks.json', f'{DST}/xbooks.json')
os.makedirs(f'{DST}/x', exist_ok=True); os.makedirs(f'{DST}/nt', exist_ok=True)
nx = nn = 0
for f in sorted(glob.glob(f'{SRC}/x/*.json')):
    X = json.load(open(f))
    for c in X.values(): c.pop('un', None)
    json.dump(X, open(f'{DST}/x/{os.path.basename(f)}', 'w'), ensure_ascii=False, separators=(',', ':')); nx += 1
for f in sorted(glob.glob(f'{SRC}/nt/*.json')):
    N = json.load(open(f))
    out = {k: {kk: v[kk] for kk in ('k', 'b', 'l', 't', 's', 'tm') if kk in v} for k, v in N.items()}
    json.dump(out, open(f'{DST}/nt/{os.path.basename(f)}', 'w'), ensure_ascii=False, separators=(',', ':')); nn += 1
print('yuel export x', nx, 'nt', nn)
