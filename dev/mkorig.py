# OSHB(WLC 히브리어, 형태 분석, CC BY 4.0) + MorphGNT(SBLGNT 헬라어, 형태 분석, CC BY-SA) → 절별 JSON
# 출력: /home/claude/bw/orig/BB/CCC.json = {"절": [[낱말, 원형/Strong, 형태코드], ...]}
import re, os, json, glob, collections, unicodedata
SRC = '/home/claude/data_src'; OUT = '/home/claude/bw/orig'
OT = ['Gen','Exod','Lev','Num','Deut','Josh','Judg','Ruth','1Sam','2Sam','1Kgs','2Kgs','1Chr','2Chr','Ezra','Neh','Esth','Job','Ps','Prov','Eccl','Song','Isa','Jer','Lam','Ezek','Dan','Hos','Joel','Amos','Obad','Jonah','Mic','Nah','Hab','Zeph','Hag','Zech','Mal']
ACC = re.compile('[֑-ֽ֯׀׃]')   # 강세·악센트 빼고 모음은 둠
n = 0
for bi, bk in enumerate(OT, 1):
    x = open(f'{SRC}/morphhb/wlc/{bk}.xml', encoding='utf-8').read()
    data = collections.defaultdict(dict)
    for vm in re.finditer(r'<verse osisID="[^.]+\.(\d+)\.(\d+)"[^>]*>(.*?)</verse>', x, re.S):
        c, v, body = int(vm.group(1)), int(vm.group(2)), vm.group(3)
        ws = []
        for wm in re.finditer(r'<w ([^>]*)>(.*?)</w>', body, re.S):
            at = dict(re.findall(r'(\w+)="([^"]*)"', wm.group(1)))
            t = ACC.sub('', re.sub(r'<[^>]+>', '', wm.group(2)))
            ws.append([t, at.get('lemma', ''), at.get('morph', '')])
        data[c][str(v)] = ws; n += 1
    os.makedirs(f'{OUT}/{bi:02d}', exist_ok=True)
    for c, d in data.items(): json.dump(d, open(f'{OUT}/{bi:02d}/{c:03d}.json', 'w'), ensure_ascii=False)
print('OT verses', n)
m = 0
for f in sorted(glob.glob(f'{SRC}/sblgnt/*-morphgnt.txt')):
    bn = int(os.path.basename(f)[:2]) - 61 + 40
    data = collections.defaultdict(lambda: collections.defaultdict(list))
    for line in open(f, encoding='utf-8'):
        p = line.split()
        if len(p) < 7: continue
        c, v = int(p[0][2:4]), int(p[0][4:6])
        data[c][str(v)].append([p[3], p[6], p[1] + ' ' + p[2]]); m += 1
    os.makedirs(f'{OUT}/{bn:02d}', exist_ok=True)
    for c, d in data.items(): json.dump(d, open(f'{OUT}/{bn:02d}/{c:03d}.json', 'w'), ensure_ascii=False)
print('NT words', m)
open(f'{OUT}/README.md', 'w').write('''# 원어 형태 자료 (절별)
- 구약: OSHB(Open Scriptures Hebrew Bible, WLC 본문, 형태 분석) CC BY 4.0 — github.com/openscriptures/morphhb. 낱말 [모음 있는 형태(악센트 뺌, /는 접두·접미 경계), 원형(Strong 번호, 접두 표시 b/·l/·c/ 등 포함), 형태 코드(H=히브리어, A=아람어; 예 HVqp3ms = 동사 칼 완료 3인칭 남성 단수, HNcmpa = 보통명사 남성 복수 절대형, HR = 전치사, HTd = 정관사)].
- 신약: MorphGNT(SBLGNT 본문, 형태 분석) CC BY-SA — github.com/morphgnt/sblgnt. 낱말 [본문 형태, 원형(lemma), 품사 형태코드(예 V- 3AAI-S-- = 동사 3인칭 부정과거 능동 직설 단수)].
- 출처 표기: 카드 src에 "OSHB(WLC) 형태 분석" 또는 "MorphGNT(SBLGNT) 형태 분석"으로 적는다.
''')
