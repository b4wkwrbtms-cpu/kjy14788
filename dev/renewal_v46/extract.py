# 그쪽 독서판(body.html)에서 절별 대화 이름표·해설 링크, 장 머리말, 해설 카드를 뽑는다
import json, re, collections
from lxml import html as LH
B = open('/home/claude/renewal/body.html', encoding='utf-8').read()
doc = LH.fromstring(B)
def T(e): return re.sub(r'\s+', ' ', e.text_content()).strip() if e is not None else ''
# 1) 장 머리말
heads = {}
for sec in doc.xpath('//section[@data-book and @data-chapter]'):
    bk, cid = sec.get('data-book'), sec.get('data-chapter')
    h = sec.xpath('./header[contains(@class,"chapter-header")]')
    if not h: continue
    h = h[0]
    title = T(h.xpath('./h2')[0]) if h.xpath('./h2') else ''
    ps = [T(p) for p in h.xpath('./p') if 'view-info' not in (p.get('class') or '') and 'chapter-view-info' not in (p.get('id') or '')]
    heads[f'{bk}|{cid}'] = {'no': T(h.xpath('./div[contains(@class,"chapter-no")]')[0]) if h.xpath('./div[contains(@class,"chapter-no")]') else '', 'title': title, 'guide': [p for p in ps if p]}
print('chapter heads', len(heads))
# 2) 절 단위
units = collections.OrderedDict()
for u in doc.xpath('//span[contains(concat(" ",normalize-space(@class)," ")," unit ")][@data-ref]'):
    ref = u.get('data-ref'); frag = u.get('data-fragment') or '0'
    key = (ref, frag)
    if key in units: continue
    # 책 찾기
    sec = u.xpath('ancestor::section[@data-book][1]')
    bk = sec[0].get('data-book') if sec else ''
    sp = []
    for s in u.xpath('.//span[contains(@class,"dlg-speech")]'):
        cls = s.get('class') or ''
        if 'dlg-start' not in cls: continue
        # 앞의 이름표에서 종류 표시(작은 글씨)
        lab = s.getprevious()
        kindtxt = ''
        if lab is not None and 'speaker-label' in (lab.get('class') or ''):
            k = lab.xpath('.//small[contains(@class,"speaker-kind")]')
            if k: kindtxt = T(k[0])
        sp.append({'s': s.get('data-speaker') or '', 'r': s.get('data-recipient') or '', 'k': s.get('data-kind') or 'speech', 'kt': kindtxt, 'q': T(s)[:40]})
    links = []
    for a in u.xpath('.//a[contains(@class,"word-note-link")]'):
        links.append({'id': a.get('data-wordnote'), 'k': a.get('data-note-kind'), 't': T(a)})
    units[key] = {'book': bk, 'sp': sp, 'ln': links}
print('units', len(units))
json.dump({'heads': heads, 'units': [[k[0], k[1], v] for k, v in units.items()]}, open('/home/claude/renewal/ex/units.json', 'w'), ensure_ascii=False)
c = collections.Counter(v['book'] for v in units.values()); print(c)
print('speeches', sum(len(v['sp']) for v in units.values()), 'links', sum(len(v['ln']) for v in units.values()))
