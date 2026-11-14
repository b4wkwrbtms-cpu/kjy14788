# 원고 JSON + 편집자 덧붙임(ov) → keller_pack.json (폰에서 고르는 파일). 덧붙임 검사도 함께.
# python3 -I kpack.py KEL_DIR OUT.json
import sys, os, json, glob, re
K, OUT = sys.argv[1], sys.argv[2]
sers = []; probs = []
def sec_text(r, i):
    if i is None or not (0 <= i < len(r['secs'])): return None
    return ''.join(b['t'] + '\n' for b in r['secs'][i]['b'])
def chk(r, i, q, where):
    if not q: return
    T = sec_text(r, i)
    if T is None: probs.append(f"{r['id']} {where}: 소제목 번호 {i} 없음"); return
    if q not in T: probs.append(f"{r['id']} {where}: 원문에 없음 «{q[:40]}»")
for f in sorted(glob.glob(os.path.join(K, 'json', '*.json'))):
    r = json.load(open(f, encoding='utf-8'))
    ovp = os.path.join(K, 'ov', r['id'] + '.json')
    if os.path.exists(ovp):
        ov = json.load(open(ovp, encoding='utf-8'))
        if len(ov.get('secs', [])) != len(r['secs']): probs.append(f"{r['id']} secs 개수 {len(ov.get('secs', []))} ≠ {len(r['secs'])}")
        for x in ov.get('secs', []):
            i = x.get('i'); chk(r, i, x.get('key'), f'key[{i}]')
            for e in x.get('em') or []: chk(r, i, e, f'em[{i}]')
            if x.get('stage') is not None and not (0 <= x['stage'] < len(ov.get('stages', []))): probs.append(f"{r['id']} stage 범위 [{i}]")
        A = ov.get('anatomy') or {}
        for k in ('christ', 'mirror'):
            if A.get(k): chk(r, A[k].get('sec'), A[k].get('quote'), k)
        for k in ('plant', 'harvest'):
            if (A.get('image') or {}).get(k): chk(r, A['image'][k].get('sec'), A['image'][k].get('quote'), k)
        for m in A.get('moves') or []: chk(r, m.get('sec'), m.get('quote'), 'move ' + (m.get('name') or '')[:12])
        r['ov'] = ov
    sers.append(r)
pack = {'kind': 'keller-pack', 'v': 1, 'made': '2026-11-14', 'sermons': sers}
json.dump(pack, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('sermons', len(sers), 'with overlay', sum(1 for r in sers if 'ov' in r), 'size', os.path.getsize(OUT))
print('problems', len(probs)); [print(' ', p) for p in probs[:40]]
