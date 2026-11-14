# 사용자 승인(11-14 20:59 "응응 고쳐") — 검사에서 '확실'로 나온 켈러 원고 문제만 고침. 고친 블록에는 orig(원래 원고)를 남김.
import json, re, sys
K = sys.argv[1]
# (id, 소제목 번호 또는 None=전체, 블록 번호 또는 None, 원래, 고침, 이유)
FX = [
 ('k1-04', 12, 2, '괴물이 말을 못한다는', '괴물이 말을 못 한다는', '띄어쓰기: 할 수 없음의 뜻이면 띄어 씀'),
 ('k1-09', 8, 0, '이것은 때로 이런 기도를', '이것은 하나님께서 때로 이런 기도를', '주어가 빠져 뜻이 막힘'),
 ('k1-12', 4, 10, '성공하지 못한 사람들, 사실 우리 대부분은', '성공하지 못한 사람들은 어떨까요? 사실 우리 대부분은', '주어로 시작한 말이 끊김'),
 ('k1-14', 5, None, '열여섯 살', '열다섯 살', '앞에서 같은 소녀를 "열다섯 살쯤"이라고 함'),
 ('k1-16', 16, 6, '맨처음으로, 정말 맨처음으로', '맨 처음으로, 정말 맨 처음으로', '띄어쓰기'),
 ('k1-17', 11, 2, '나를 없는 사람처럼 지나치지 않지 않을까?', '나를 없는 사람처럼 지나치지는 않겠지?', '부정이 겹쳐 뜻이 뒤집힘'),
 ('k1-18', 5, 1, '“한번 더 해 봐요.”', '“한 번 더 해 봐요.”', '띄어쓰기(횟수)'),
 ('k1-18', 18, 3, '끌려 다니지', '끌려다니지', '띄어쓰기(한 낱말)'),
 ('k2-02', 4, 15, '문제는 그 다음입니다.', '문제는 그다음입니다.', '띄어쓰기'),
 ('k2-03', 4, 9, '마음 속 어둠', '마음속 어둠', '띄어쓰기'),
 ('k2-03', 9, 5, '그 다음에', '그다음에', '띄어쓰기'),
 ('k2-04', 5, 20, '물어 보십시오', '물어보십시오', '띄어쓰기'),
 ('k2-04', 8, 1, '짜증나게', '짜증 나게', '띄어쓰기'),
 ('k2-05', 9, 6, '[통합검토 5]', '', '본문에 남은 작업 표시'),
 ('k2-05', 2, 6, '발 아래', '발아래', '띄어쓰기'),
 ('k2-07', 9, 9, '우리의 기쁨과 우리의 의무는전에는 서로 어긋나 있었지만,그분의 아름다움을 본 뒤로는하나가 되어', '우리의 기쁨과 우리의 의무는 전에는 서로 어긋나 있었지만, 그분의 아름다움을 본 뒤로는 하나가 되어', '시 줄바꿈이 사라지며 붙은 띄어쓰기'),
 ('k2-07', 11, 8, '우리의 기쁨과 우리의 의무는전에는 서로 어긋나 있었지만,그분의 아름다움을 본 뒤로는하나가 되어', '우리의 기쁨과 우리의 의무는 전에는 서로 어긋나 있었지만, 그분의 아름다움을 본 뒤로는 하나가 되어', '시 줄바꿈이 사라지며 붙은 띄어쓰기'),
 ('k2-07', 11, 10, '보고,용서하시는 그분의 음성을 들을 때,종은 자녀가 되고,의무는', '보고, 용서하시는 그분의 음성을 들을 때, 종은 자녀가 되고, 의무는', '시 줄바꿈이 사라지며 붙은 띄어쓰기'),
 ('k2-07', 6, 2, '단 한 가지 때만', '단 한 가지 경우에만', '번역투'),
 ('k2-11', 11, 1, '〔전사 일부 불명확〕', '…', '녹취가 빠진 자리 표시(주5에 설명)'),
 ('k2-13', 16, 1, '마침내 모든 슬픈 일이 마침내 뒤집힐', '마침내 모든 슬픈 일이 뒤집힐', "'마침내' 중복"),
 ('k2-16', 2, 0, '십자가를 보십시오. 죄와 죽음이 이겼습니다.', '십자가를 보십시오.', '다음 문단의 문장이 한 번 더 붙어 있음'),
]
DEL = [('k2-07', 9, 10, '바로 앞 인용 상자와 같은 시구가 일반 문단으로 한 번 더 나옴')]
done = 0; miss = []
for fid, si, bi, a, b, why in FX:
    p = f'{K}/json/{fid}.json'; r = json.load(open(p, encoding='utf-8')); hit = 0
    for i, s in enumerate(r['secs']):
        if si is not None and i != si: continue
        for j, bl in enumerate(s['b']):
            if bi is not None and j != bi: continue
            if a in bl['t']:
                bl.setdefault('orig', bl['t']); bl['t'] = bl['t'].replace(a, b).replace('  ', ' ').strip()
                bl.setdefault('why', []).append(why); hit += 1
    if hit: done += 1
    else: miss.append((fid, a))
    json.dump(r, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
# 그녀/그분 통일 (k1-12 마지막 이야기: 앞에서 줄곧 '그분')
p = f'{K}/json/k1-12.json'; r = json.load(open(p, encoding='utf-8'))
for j, bl in enumerate(r['secs'][14]['b']):
    if j >= 10 and '그녀' in bl['t']:
        bl.setdefault('orig', bl['t']); bl['t'] = bl['t'].replace('그녀', '그분'); bl.setdefault('why', []).append("같은 인물을 앞에서 '그분'으로 부름"); done += 1
json.dump(r, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
# 소제목
p = f'{K}/json/k2-10.json'; r = json.load(open(p, encoding='utf-8'))
s = r['secs'][6]
if '심겨진' in s['h']: s['h_orig'] = s['h']; s['h'] = s['h'].replace('심겨진', '심긴'); done += 1
json.dump(r, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
for fid, si, bi, why in DEL:
    p = f'{K}/json/{fid}.json'; r = json.load(open(p, encoding='utf-8'))
    bl = r['secs'][si]['b'][bi]
    if bl['k'] == 'p' and bl['t'].startswith('우리의 기쁨과 우리의 의무는 전에는'):
        bl['k'] = 'del'; bl['orig'] = bl['t']; bl.setdefault('why', []).append(why); done += 1
    json.dump(r, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('applied', done, 'missing', miss)
